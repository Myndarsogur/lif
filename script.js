'use strict';

const $ = selector => document.querySelector(selector);
const world = $('.world');
const stage = $('#stage');
const frame = $('#frame');
const landscape = $('#landscape');
const sceneArt = $('#sceneArt');
const speech = $('#speech');
const hint = $('#hint');
const choiceBox = $('#choice');
const bagSlots = $('#bagSlots');
const card = $('#card');
const toast = $('#toast');
const book = $('#book');
const bookContent = $('#bookContent');
// Sami himinn inni í myndinni, svo sól, tungl og ský sjáist á bak við landslagið.
const frameSky = $('.sky').cloneNode(true);
frameSky.classList.add('frame-sky');
frame.prepend(frameSky);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Heimurinn: tími, veður, þemu ---------- */

const times = [
  { id: 'morning', name: 'morgunn' }, { id: 'day', name: 'dagur' },
  { id: 'evening', name: 'kvöld' }, { id: 'night', name: 'nótt' }
];
const weather = [
  { id: 'clear', icon: '☀', name: 'heiðskírt' },
  { id: 'cloudy', icon: '☁', name: 'skýjað' },
  { id: 'storm', icon: 'ϟ', name: 'stormur' },
  { id: 'snow', icon: '❄', name: 'snjókoma' }
];

const THEMES = {
  courage: { name: 'Hugrekki', color: '#ff6b91', title: 'Sagan um að þora',
    opener: 'Þetta var saga um að stíga fram, þó hnén skylfu. Hvert skref var aðeins stærra en það síðasta.',
    echo: 'Undir niðri bjó líka hugrekki, það sem heldur áfram þegar enginn sér.',
    letter: 'Þú gerðir það. Ég vissi alltaf að þú myndir gera það.' },
  care: { name: 'Umhyggja', color: '#72c95d', title: 'Sagan um að passa upp á',
    opener: 'Þetta var saga um að taka eftir öðrum. Heimurinn varð mýkri alls staðar þar sem þú fórst um.',
    echo: 'Og umhyggjan var alltaf nálæg, eins og hlý hönd á öxl.',
    letter: 'Takk fyrir að passa upp á þau sem þú hittir. Ég man eftir hverju einasta.' },
  wonder: { name: 'Forvitni', color: '#5cc8e8', title: 'Sagan um að spyrja',
    opener: 'Þetta var saga um spurningar sem opnuðu dyr. Þú lést ekkert vera eins og það sýndist.',
    echo: 'Forvitnin fylgdi þér eins og skuggi sem vill alltaf vita meira.',
    letter: 'Haltu áfram að spyrja. Svörin eru skemmtilegri en ég hélt.' },
  memory: { name: 'Minning', color: '#b48cff', title: 'Sagan um að muna',
    opener: 'Þetta var saga um það sem lifir áfram. Þú safnaðir augnablikum eins og aðrir safna steinum.',
    echo: 'Og minningarnar söfnuðust saman, eins og steinar í vasa.',
    letter: 'Ég man þetta allt. Þú þarft ekki að halda á því ein/n.' },
  play: { name: 'Leikur', color: '#ffdc53', title: 'Sagan um að leika sér',
    opener: 'Þetta var saga um að leyfa sér að leika. Heimurinn tók þátt um leið og þú byrjaðir.',
    echo: 'Og leikurinn var aldrei langt undan.',
    letter: 'Ekki hætta að leika þér. Það var besti hlutinn.' }
};

/* ---------- Hlutir sem má safna ---------- */

const ITEMS = {
  letter: { name: 'Bréfið', tags: ['memory', 'courage'], text: 'Bréf merkt þér, með þinni eigin rithönd. Dagsett á morgun.',
    icon: '<rect x="8" y="16" width="48" height="34" rx="3" fill="#fff0a3"/><path d="M8 18l24 18 24-18" fill="none"/>' },
  key: { name: 'Lykillinn', tags: ['wonder', 'memory'], text: 'Lítill, gamall lykill. Hann passar ekki í neina hurð heima.',
    icon: '<circle cx="20" cy="32" r="11" fill="#ffdc53"/><path d="M31 32h25M48 32v10M40 32v7" fill="none"/>' },
  chalk: { name: 'Krítin', tags: ['wonder', 'play'], text: 'Krít sem skrifar stundum sjálf þegar enginn horfir.',
    icon: '<path d="M10 42l34-20 10 12-34 20z" fill="#fffdf2"/><path d="M44 22l10 12" fill="none"/>' },
  sandwich: { name: 'Samlokan', tags: ['care', 'play'], text: 'Samlokan sem gleymdist í gær. Hún er enn vongóð.',
    icon: '<path d="M8 44L32 14l24 30z" fill="#ffd89a"/><path d="M13 44h38" fill="none" style="stroke:#72c95d"/>' },
  ball: { name: 'Boltinn', tags: ['play', 'courage'], text: 'Á honum stendur: Fyrir þann sem þorir að byrja.',
    icon: '<circle cx="32" cy="32" r="22" fill="#fff0a3"/><path d="M13 26q19 10 38 0M32 10v44" fill="none"/>' },
  feather: { name: 'Fjöðrin', tags: ['wonder', 'care'], text: 'Fjöður sem datt af einhverju sem flaug mjög hátt.',
    icon: '<path d="M14 54Q12 20 50 10 50 42 14 54z" fill="#c8ebee"/><path d="M14 54L40 24" fill="none"/>' },
  shoe: { name: 'Dansskórinn', tags: ['play', 'courage'], text: 'Bara einn skór. Hann dansar samt.',
    icon: '<path d="M8 46q0-22 14-22l6 10q16 2 28 8v6H8z" fill="#ff805e"/><path d="M8 52h48" fill="none"/>' },
  tape: { name: 'Kasettan', tags: ['memory', 'play'], text: 'Upptaka af hlátri úr fyrstu dansæfingunni.',
    icon: '<rect x="8" y="16" width="48" height="32" rx="4" fill="#565269"/><circle cx="23" cy="32" r="6" fill="#ff6b91"/><circle cx="41" cy="32" r="6" fill="#ff6b91"/>' },
  jar: { name: 'Krukkan', tags: ['care', 'memory'], text: 'Merkt „nóg“. Hún virðist tóm, en er það ekki.',
    icon: '<path d="M18 20h28l-3 34H21z" fill="#c8ebee"/><rect x="20" y="10" width="24" height="10" fill="#ffdc53"/>' },
  seed: { name: 'Fræið', tags: ['care', 'courage'], text: 'Á pokanum stendur: Vex hvar sem er, ef einhver hugsar um það.',
    icon: '<ellipse cx="32" cy="38" rx="14" ry="17" fill="#c98a55"/><path d="M32 21q3-12 14-13" fill="none" style="stroke:#3f8f3a"/>' },
  ticket: { name: 'Miðinn', tags: ['courage', 'wonder'], text: 'Strætómiði á stoppistöð sem er ekki til. Ennþá.',
    icon: '<path d="M8 20h48v8a4 4 0 000 8v8H8v-8a4 4 0 000-8z" fill="#5cc8e8"/><path d="M24 22v20" fill="none" stroke-dasharray="3 5"/>' },
  firefly: { name: 'Ljósberinn', tags: ['care', 'wonder'], text: 'Lítil ljósvera sem vill frekar vera í vasa en í krukku.',
    icon: '<circle cx="32" cy="36" r="14" fill="#ffdc53"/><path d="M22 24q-10-12 3-14M42 24q10-12-3-14" fill="none"/>' },
  stone: { name: 'Steinninn', tags: ['memory', 'care'], text: 'Hjartalaga steinn sem slær mjög hægt.',
    icon: '<path d="M32 54C8 38 10 16 22 16c6 0 10 5 10 9 0-4 4-9 10-9 12 0 14 22-10 38z" fill="#a9a6b7"/>' },
  diary: { name: 'Dagbókin', tags: ['memory', 'wonder'], text: 'Gömul dagbók. Síðasta færslan er skrifuð í dag.',
    icon: '<rect x="12" y="10" width="40" height="46" rx="3" fill="#b48cff"/><path d="M21 10v46M30 26h14" fill="none"/>' }
};
const ITEM_ORDER = Object.keys(ITEMS);

const THREADS = [
  { id: 'hand', a: 'letter', b: 'diary', name: 'Sama rithöndin', text: 'Bréfið og dagbókin reyndust skrifuð með sömu hendi: þinni.' },
  { id: 'body', a: 'ball', b: 'shoe', name: 'Líkaminn man leikinn', text: 'Boltinn og dansskórinn minntu þig á að líkaminn man leikinn löngu eftir að honum lýkur.' },
  { id: 'grow', a: 'seed', b: 'jar', name: 'Nóg til að vaxa', text: 'Fræið og krukkan kenndu þér að það þarf ekki mikið til að vaxa, bara nóg.' },
  { id: 'road', a: 'key', b: 'ticket', name: 'Leið sem enginn teiknaði', text: 'Lykillinn og miðinn opnuðu leið sem var ekki á neinu korti.' },
  { id: 'light', a: 'feather', b: 'firefly', name: 'Létt í myrkrinu', text: 'Fjöðrin og ljósberinn sýndu að það léttasta lýsir oft mest.' },
  { id: 'said', a: 'chalk', b: 'tape', name: 'Það sem var sagt og skrifað', text: 'Krítin og kasettan geymdu bæði það sem var sagt og það sem var skrifað.' },
  { id: 'heart', a: 'stone', b: 'letter', name: 'Hjarta sem gleymir ekki', text: 'Steinninn og bréfið slógu í sama takti, eins og hjarta sem gleymir ekki.' },
  { id: 'lunch', a: 'sandwich', b: 'ticket', name: 'Nesti fyrir langa leið', text: 'Samlokan og miðinn voru nesti fyrir lengri leið en þú hélst.' }
];

/* ---------- Afleiðingar ákvarðana ---------- */

const FLAG_LINES = {
  answered: 'Þegar kallað var á þig heima svaraðir þú, og einhver beið eftir þér allan tímann.',
  sneaked: 'Þú læddist út án þess að svara. Miðinn á hurðinni spurði hvert þú fórst; þessi saga er svarið.',
  friend: 'Í skólanum settist þú hjá þeim sem sat einn, og eftir það voruð þið tvö.',
  question: 'Þú spurðir stóru spurningarinnar upphátt. Taflan hefur ekki gleymt því.',
  swingHigh: 'Á rólunni fórstu hærra en þú þorðir og sást lengra en nokkru sinni fyrr.',
  pushed: 'Þú ýttir rólunni fyrir annan, og hláturinn sem fylgdi var að hluta til þinn.',
  danced: 'Þegar tónlistin þagnaði dansaðir þú samt, og nóturnar eltu þig út í heiminn.',
  clapped: 'Þegar tónlistin þagnaði bjóst þú til takt fyrir hin, og heimurinn hefur slegið hann síðan.',
  bought: 'Fyrir eina peninginn keyptir þú blöðru, og hún sveif yfir öllu sem á eftir kom.',
  enough: 'Þú lést nóg vera nóg og gafst peninginn. Krukkan fylltist af einhverju sem ekki sést.',
  waited: 'Á tómri götunni beiðst þú eftir grænu ljósi, af því að einhver lítill gæti verið að horfa.',
  alley: 'Þú fórst hliðargötuna sem var ekki á neinu korti.',
  planted: 'Þú gróðursettir fræið, og blóm fóru að spretta hvar sem þú gekkst.',
  gateOpen: 'Þú skildir hliðið eftir opið fyrir þau sem koma næst. Fiðrildin nýttu sér það strax.'
};
const ECHOES = {
  friend: 'Vinurinn úr skólanum röltir með þér.',
  bought: 'Rauða blaðran svífur enn yfir þér.',
  planted: 'Lítil blóm spretta þar sem þú hefur gengið.',
  gateOpen: 'Fiðrildin úr garðinum hafa elt þig hingað.',
  danced: 'Nótur úr danssalnum svífa enn í kringum þig.',
  clapped: 'Heimurinn slær ennþá taktinn þinn.',
  swingHigh: 'Síðan þú rólaðir svo hátt sérðu aðeins lengra.',
  alley: 'Hliðargatan kallar enn á þig, lágt.'
};

const TOYS = {
  cat: { line: 'Kötturinn teygir úr sér og þykist ekki hafa séð þig.', note: 330 },
  clock: { line: 'Klukkan hleypur heilan hring og ákveður að nú sé akkúrat rétti tíminn.', note: 880 },
  globe: { line: 'Hnötturinn snýst og stoppar á stað sem heitir „hér“.', note: 440 },
  castle: { line: 'Sandkastalinn fær nýjan turn. Og svo annan.', note: 392 },
  disco: { line: 'Diskókúlan dreifir litlum sólum um allan salinn.', note: 988 },
  cans: { line: 'Dósirnar vagga en detta ekki. Í þetta sinn.', note: 294 },
  register: { line: 'Kassinn pípir í moll. Svo í dúr, bara fyrir þig.', note: 740 },
  window: { line: 'Einn glugginn blikkar til þín. Þú blikkar á móti.', note: 660 },
  piano: { line: 'Gangbrautin spilar lag undir fótunum.' },
  blossoms: { line: 'Blómin flissa þegar þú kitlar þau.', note: 1046 }
};
const PENTA = [523, 587, 659, 784, 880];

/* ---------- Teikni-hjálparföll ---------- */

let S = freshState();

function freshState() {
  return { items: new Set(), threads: new Set(), flags: {}, choices: {}, visits: {}, fiddled: new Set(),
    pts: { courage: 0, care: 0, wonder: 0, memory: 0, play: 0 }, plantedVisit: 0, weatherIndex: 0 };
}

const layer = (depth, content) => `<g class="layer" style="--d:${depth}">${content}</g>`;
const mountains = `<path class="mountain" d="M-40 540L120 370L240 440L400 270L560 420L720 300L880 450L1040 330L1240 480V660H-40Z"/><path class="snowcap" d="M362 310L400 270L440 312L420 324L400 306L380 326ZM686 336L720 300L756 338L738 346L720 330L704 348ZM1004 368L1040 330L1076 370L1058 376L1040 360L1022 378Z"/>`;
const ground = () => `<path class="ground" d="M-40 610Q250 555 480 620T900 595T1240 620V800H-40Z"/><path class="ln ground-line" d="M-40 672Q250 632 500 687T1240 667"/>`;
const person = (x, y, color, s = 1, cls = '') => `<g transform="translate(${x} ${y}) scale(${s})"><g class="person ${cls}"><path d="M-30 0q0-78 30-78t30 78z" fill="${color}"/><circle cy="-104" r="28" fill="#ffd9b8"/><path class="ln face" d="M-10-108v3M10-108v3M-9-93q9 7 18 0"/></g></g>`;
const heart = (x, y) => `<path class="heart" d="M${x} ${y}c-24-15-18-34-6-32 4 1 6 4 6 6 0-2 2-5 6-6 12-2 18 17-6 32z"/>`;
const marker = (x, y) => `<g class="marker"><circle class="ring" cx="${x}" cy="${y}" r="30"/><text x="${x}" y="${y + 14}" text-anchor="middle">!</text></g>`;
const moment = (id, label, inner, x, y) => `<g class="moment" data-moment="${id}" tabindex="0" role="button" aria-label="${label}">${inner}${marker(x, y)}</g>`;
const toy = (id, label, inner, extra = '') => `<g class="toy" data-toy="${id}" ${extra} tabindex="0" role="button" aria-label="${label}">${inner}</g>`;
const story = (text, label, inner) => `<g class="hotspot" data-story="${text}" tabindex="0" role="button" aria-label="${label}">${inner}</g>`;
const iconSvg = id => `<svg class="icon" viewBox="0 0 64 64" aria-hidden="true"><g class="ico">${ITEMS[id].icon}</g></svg>`;

function itemSpot(id, x, y, s = 1, cls = '') {
  if (S.items.has(id)) return '';
  const r = Math.round(48 * s);
  return `<g class="hotspot item ${cls}" data-item="${id}" tabindex="0" role="button" aria-label="Taka ${ITEMS[id].name.toLowerCase()}">
    <circle class="halo" cx="${x}" cy="${y}" r="${r}"/>
    <g transform="translate(${x - 32 * s} ${y - 32 * s}) scale(${s})"><g class="item-art ico">${ITEMS[id].icon}</g></g>
    <path class="sparkle" d="M${x + 26 * s} ${y - 46 * s}l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/></g>`;
}

function windows(x, y, cols, rows, dx, dy) {
  let out = '';
  for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) out += `<rect class="win lit" x="${x + c * dx}" y="${y + r * dy}" width="40" height="52"/>`;
  return out;
}

// Afleiðingar sem fylgja þér á milli staða.
function extras(outdoor, groundY = 715) {
  let out = '';
  if (S.flags.planted && outdoor) out += [150, 420, 560, 800, 1040].map((x, i) => `<g class="bloom" style="--i:${i}"><path class="ln stem" d="M${x} ${groundY + 24}v-30"/><circle cx="${x}" cy="${groundY - 12}" r="12" fill="${['#ff6b91', '#ffdc53', '#b48cff'][i % 3]}"/></g>`).join('');
  if (S.flags.bought && outdoor) out += `<g transform="translate(1000 150)"><g class="balloon"><path class="ln string" d="M0 50q-14 60 8 130"/><ellipse class="balloon-skin" cx="0" cy="0" rx="40" ry="50"/><path class="ln shine-line" d="M-20-18q6-16 18-18"/></g></g>`;
  if (S.flags.gateOpen) out += [[300, 210], [840, 270]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><g class="butterfly" style="--i:${i}"><path d="M0 0q-26-30-34 0q10 24 34 0z" fill="#b48cff"/><path d="M0 0q26-30 34 0q-10 24-34 0z" fill="#ffdc53"/></g></g>`).join('');
  if (S.flags.danced) out += [[230, 190], [960, 300]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><g class="float-note" style="--i:${i}"><path class="ln" d="M0 0v-44l28-8v38"/><circle cx="-7" cy="0" r="9" fill="#27252a"/><circle cx="21" cy="-14" r="9" fill="#27252a"/></g></g>`).join('');
  if (S.flags.friend && outdoor) out += person(180, groundY + 28, '#b48cff', .7, 'wave');
  return `<g class="extras">${out}</g>`;
}

/* ---------- Staðirnir ---------- */

const places = [
  { id: 'home', name: 'Heimilið', indoor: false,
    intro: ['Heima er allt kunnuglegt, en ekkert alveg eins og í gær.', 'Þú ert komin/n aftur heim. Húsið hefur beðið þolinmótt.'],
    look: 'Glugginn er opinn og póstkassinn er fullur. Einhver hefur verið hér á undan þér.',
    fiddle: ['Þú hringir dyrabjöllunni heima hjá þér.', 'Póstkassinn hóstar upp litlu hjarta.', 'Gardínan veifar eins og hún þekki þig.'],
    moment: { prompt: 'Einhver kallar nafnið þitt innan úr húsinu.', options: [
      { label: 'Svara kallinu', result: 'Þú svarar. Röddin hlær: „Ég vildi bara vita að þú værir þarna.“', pts: { care: 1, memory: 1 }, flag: 'answered' },
      { label: 'Læðast af stað', result: 'Þú læðist út um hliðið. Á eftir þér lokast hurðin hljóðlega.', pts: { courage: 1, wonder: 1 }, flag: 'sneaked' }] },
    art: () => layer(-4, mountains) +
      layer(-8, `<path class="hill" d="M-40 610Q180 450 400 600T800 570T1240 590V720H-40Z"/>
        <g transform="translate(235 655)"><g class="sway"><path class="ln trunk" d="M0 0V-250M0-130L-55-180M0-160L60-215"/><circle class="leaf" cx="-62" cy="-205" r="58"/><circle class="leaf" cx="8" cy="-272" r="80"/><circle class="leaf" cx="78" cy="-212" r="60"/></g></g>`) +
      layer(-14, `${ground()}
        <g class="smoke"><circle cx="724" cy="208" r="14"/><circle cx="724" cy="208" r="14"/><circle cx="724" cy="208" r="14"/></g>
        <path class="chimney" d="M700 330V232h48v130"/>
        <path class="house" d="M420 645V392L610 252L800 392V645Z"/>
        <path class="ln roof" d="M386 410L610 228L834 410"/>
        <rect class="win lit" x="452" y="430" width="84" height="80"/><path class="ln" d="M494 430v80M452 470h84"/>
        <rect class="win lit" x="684" y="430" width="84" height="80"/>
        ${S.flags.answered ? person(726, 506, '#5cc8e8', .42, 'wave') : ''}
        <path class="ln" d="M726 430v80M684 470h84"/>
        <circle class="win lit" cx="610" cy="345" r="30"/>
        <rect class="door" x="570" y="505" width="80" height="140"/><circle class="knob" cx="636" cy="578" r="5"/>
        ${S.choices.home === undefined ? moment('home', 'Einhver kallar á þig', '<path class="door-light" d="M570 645L515 712H705L650 645Z"/><rect class="door-open" x="570" y="505" width="80" height="140"/>', 610, 468) : ''}
        ${S.flags.answered ? heart(610, 560) : ''}
        ${S.flags.sneaked ? story('Á miðanum stendur: Hvert fórstu? Komdu heim þegar sagan er búin.', 'Lesa miða á hurðinni', '<rect class="note" x="584" y="525" width="52" height="40" transform="rotate(5 610 545)"/><path class="ln thin" d="M593 540h32M593 552h22"/>') : ''}
        <path class="ln post" d="M930 712V586"/>
        <path class="mailbox" d="M880 528h100v58H880z"/><path class="flag" d="M980 540h26v-32h-26z"/>
        ${itemSpot('letter', 930, 510, .95)}
        ${itemSpot('key', 335, 702, .85)}
        ${toy('cat', 'Klappa kettinum', '<g class="cat"><path d="M580 226q0-44 30-44t30 44z" fill="#44434d"/><path d="M588 192l4-24 14 13M632 192l-4-24-14 13" fill="#44434d"/><path class="ln" d="M638 220q36 2 28-34"/></g>')}
        ${extras(true)}`) },

  { id: 'school', name: 'Skólinn', indoor: true,
    intro: ['Skólinn iðar af spurningum sem hafa ekki öll rétt svör.', 'Aftur í skólanum. Taflan hefur verið þurrkuð, næstum því.'],
    look: 'Á töflunni stendur nafn sem þú kannast við, en manst ekki hvaðan.',
    fiddle: ['Krítin skrifar sjálf: „prófaðu aftur“.', 'Þú opnar skúffu fulla af ósögðum spurningum.', 'Bjallan hringir, en enginn þarf að flýta sér.'],
    moment: { prompt: 'Aftast í stofunni situr einhver einn og horfir út um gluggann.', options: [
      { label: 'Setjast hjá', result: 'Þú sest hjá. Eftir smá stund situr enginn lengur einn aftast.', pts: { care: 2 }, flag: 'friend' },
      { label: 'Spyrja stóru spurningarinnar', result: 'Þú réttir upp hönd og spyrð: „Af hverju?“ Öll stofan snýr sér við og hlustar.', pts: { courage: 1, wonder: 1 }, flag: 'question' }] },
    art: () => {
      const kid = S.flags.friend ? person(285, 610, '#ff986e', .9, 'bob') + person(365, 610, '#b48cff', .9, 'bob') + heart(325, 430)
        : person(320, 610, '#ff986e', .9, S.flags.question ? 'bob' : '');
      return layer(-3, `<path class="wall" d="M-40-40H1240V640H-40Z"/>
          <rect class="window-sky" x="160" y="110" width="210" height="220"/><path class="ln" d="M265 110v220M160 220h210"/><path class="ln sill" d="M145 336h240"/>
          ${toy('clock', 'Skoða klukkuna', '<circle class="clock" cx="1010" cy="110" r="40"/><g class="hands"><path class="ln thin" d="M1010 110v-26M1010 110h18"/></g>')}`) +
        layer(-7, `<rect class="board" x="440" y="140" width="520" height="260"/>
          <path class="ln chalk-line" d="M480 215q55-60 110 0t110 0"/><path class="ln chalk-line" d="M480 290h180M480 335h120"/>
          <text class="board-text" x="835" y="330" text-anchor="middle">${S.flags.question ? '!' : '?'}</text>
          <path class="ln ledge" d="M430 404h540"/>
          ${itemSpot('chalk', 880, 384, .75)}`) +
        layer(-12, `<path class="floor" d="M-40 640H1240V800H-40Z"/><path class="ln floor-line" d="M-40 700H1240"/>
          ${S.choices.school === undefined ? moment('school', 'Einhver situr einn', person(320, 610, '#ff986e', .9), 320, 428) : kid}
          <path class="desk" d="M165 600h310l-30 110H195z"/><path class="ln" d="M205 710v50M435 710v50"/>
          <path class="desk" d="M555 600h290l-28 110H583z"/><path class="ln" d="M595 710v50M805 710v50"/>
          ${toy('globe', 'Snúa hnettinum', '<path class="ln" d="M700 600v-26"/><g class="globe"><circle class="globe-ball" cx="700" cy="540" r="36"/><path class="ln thin" d="M672 526q26 12 22 36M718 510q-12 22 8 44"/></g>')}
          <path class="backpack" d="M870 752q0-112 62-112t62 112z"/><path class="ln" d="M895 692h74"/>
          ${itemSpot('sandwich', 932, 626, .85)}
          ${extras(false)}`);
    } },

  { id: 'playground', name: 'Leikvöllurinn', indoor: false,
    intro: ['Leikvöllurinn bíður ekki eftir leyfi til að vera skemmtilegur.', 'Leikvöllurinn man eftir þér. Rólan heilsar.'],
    look: 'Rólan hreyfist, þó vindurinn sé alveg kyrr.',
    fiddle: ['Þú lætur rennibrautina enda aðeins nær tunglinu.', 'Sandurinn geymir fótspor sem passa ekki við neina skó.', 'Vegasaltið ákveður að vera bara salt.'],
    moment: { prompt: 'Rólan stoppar beint fyrir framan þig, eins og hún sé að bjóða.', options: [
      { label: 'Róla hærra en þú þorir', result: 'Þú rólar svo hátt að þú sérð yfir öll þök. Einhvers staðar bak við hæðina er garður.', pts: { courage: 2 }, flag: 'swingHigh' },
      { label: 'Ýta fyrir einhvern annan', result: 'Þú ýtir rólunni fyrir krakka sem beið. Hláturinn berst langt.', pts: { care: 1, play: 1 }, flag: 'pushed' }] },
    art: () => {
      const rider = S.flags.swingHigh ? person(870, 530, '#ff6b91', .6) : S.flags.pushed ? person(870, 530, '#ffdc53', .6) : '';
      const swing = `<g class="swing ${S.flags.swingHigh ? 'high' : ''}"><path class="ln chain" d="M840 330v198M900 330v198"/>${rider}<rect class="seat" x="822" y="528" width="96" height="20" rx="5"/></g>`;
      return layer(-4, mountains) +
        layer(-8, `<path class="hill" d="M-40 620Q230 480 470 610T900 590T1240 600V720H-40Z"/>
          <g transform="translate(1085 612)"><g class="sway"><path class="ln trunk" d="M0 0V-160"/><circle class="leaf" cx="0" cy="-200" r="70"/></g></g>`) +
        layer(-14, `${ground()}
          <g class="slide"><path class="ln" d="M235 668L305 300h120M305 300v368M425 300v368M305 380h120M305 460h120M305 540h120"/><path class="ln slide-bed" d="M425 300q30 250 200 368"/></g>
          ${itemSpot('feather', 365, 258, .85, 'float')}
          <path class="ln swing-frame" d="M705 682L790 320H950L1035 682"/>
          ${S.choices.playground === undefined ? moment('playground', 'Rólan býður þér', swing, 870, 440) : swing}
          ${S.flags.pushed ? person(965, 690, '#b48cff', .8, 'wave') : ''}
          <path class="sand" d="M150 738q30-52 170-52t180 52z"/>
          ${toy('castle', 'Byggja sandkastala', '<path class="castle" d="M255 714v-42h14v12h14v-12h14v12h14v-12h14v42z"/>')}
          ${itemSpot('ball', 645, 688, 1)}
          ${extras(true)}`);
    } },

  { id: 'dance', name: 'Dansæfingin', indoor: true,
    intro: ['Í danssalnum finnur hver líkami sinn eigin takt.', 'Danssalurinn er hljóður, en gólfið man sporin þín.'],
    look: 'Spegillinn sýnir ekki mistök. Hann sýnir hreyfingu.',
    fiddle: ['Þú færir taktinn hálft skref til vinstri.', 'Gólfið svarar hverju spori með lit.', 'Tónlistin hægir á sér til að hlusta á þig.'],
    moment: { prompt: 'Tónlistin stoppar skyndilega. Ljóskastarinn finnur þig.', options: [
      { label: 'Dansa samt', result: 'Þú dansar í þögninni. Eftir smá stund fer tónlistin að elta þig.', pts: { courage: 2 }, flag: 'danced' },
      { label: 'Klappa takt fyrir hin', result: 'Þú byrjar að klappa. Eitt af öðru byrja hin að dansa við taktinn þinn.', pts: { play: 1, care: 1 }, flag: 'clapped' }] },
    art: () => {
      const spot = '<path class="spot" d="M565-40H635L780 705H420Z"/><ellipse class="spot-floor" cx="600" cy="705" rx="180" ry="32"/>';
      const dancers = S.flags.danced ? person(600, 710, '#ff6b91', 1, 'dance')
        : S.flags.clapped ? [470, 600, 730].map((x, i) => person(x, 710, ['#5cc8e8', '#ffdc53', '#b48cff'][i], .8, `dance d${i}`)).join('') : '';
      return layer(-3, `<path class="dance-wall" d="M-40-40H1240V610H-40Z"/>
          <rect class="mirror" x="160" y="120" width="560" height="340"/><path class="ln shine" d="M230 440L360 140M300 440L430 140"/>
          <path class="ln barre" d="M140 380h600M190 380v230M690 380v230"/>`) +
        layer(-7, `<path class="ln thin" d="M960-40V100"/>
          ${toy('disco', 'Snúa diskókúlunni', '<g class="disco"><circle class="disco-ball" cx="960" cy="150" r="50"/><path class="ln thin" d="M910 150h100M960 100v100M925 115q35 35 0 70M995 115q-35 35 0 70"/></g>')}
          <g class="thump"><rect class="speaker" x="880" y="320" width="150" height="290"/><circle class="cone" cx="955" cy="520" r="52"/><circle class="cone" cx="955" cy="395" r="26"/></g>
          ${itemSpot('tape', 955, 288, .9)}`) +
        layer(-12, `<path class="dance-floor" d="M-40 610H1240V800H-40Z"/>
          ${[0, 150, 300, 450, 600, 750, 900, 1050, 1200].map(x => `<path class="ln floor-line" d="M${x} 610L${x + (x - 600) * .4} 800"/>`).join('')}
          <ellipse class="floor-light l1" cx="250" cy="700" rx="90" ry="18"/><ellipse class="floor-light l2" cx="950" cy="690" rx="90" ry="18"/>
          ${S.choices.dance === undefined ? moment('dance', 'Tónlistin stoppar', spot, 600, 540) : spot + dancers}
          ${itemSpot('shoe', 280, 705, 1.05)}
          ${extras(false)}`);
    } },

  { id: 'shop', name: 'Búðin', indoor: true,
    intro: ['Búðin er full af hlutum sem þykjast vita hvað þig vantar.', 'Í búðinni hefur verið raðað upp á nýtt. Nóg er enn á sínum stað.'],
    look: 'Á efstu hillunni er krukka merkt „nóg“.',
    fiddle: ['Þú setur óþarfa hlut aftur á sinn stað.', 'Innkaupakerran vill bara fara aftur á bak.', 'Verðmiðarnir skipta um tölur þegar þú lítur undan.'],
    moment: { prompt: 'Í vasanum finnur þú einn pening. Afgreiðslan bíður.', options: [
      { label: 'Kaupa rauðu blöðruna', result: 'Þú kaupir blöðru sem enginn annar tók eftir. Hún togar þig út um dyrnar.', pts: { play: 1, wonder: 1 }, flag: 'bought' },
      { label: 'Láta nóg vera nóg', result: 'Þú setur peninginn í söfnunarbaukinn. Einhvers staðar léttist eitthvað.', pts: { care: 1, memory: 1 }, flag: 'enough' }] },
    art: () => {
      const cashier = person(800, 470, '#72c95d', 1, S.choices.shop === undefined ? '' : 'wave');
      return layer(-3, `<path class="shop-wall" d="M-40-40H1240V640H-40Z"/><path class="ln stripe" d="M-40 96H1240"/>
          <rect class="shop-sign" x="760" y="150" width="280" height="80"/><text class="sign-text" x="900" y="208" text-anchor="middle">BÚÐIN</text>`) +
        layer(-7, `<path class="shelf" d="M160 150h480v470H160z"/><path class="ln" d="M160 300h480M160 460h480"/>
          <rect class="box" x="190" y="225" width="100" height="75"/><circle class="can" cx="330" cy="268" r="30"/>
          ${S.flags.enough && S.items.has('jar') ? '<text class="nog" x="450" y="285" text-anchor="middle">NÓG</text>' : ''}
          ${itemSpot('jar', 450, 250, .9)}
          <rect class="box box-blue" x="545" y="235" width="70" height="65"/>
          ${toy('cans', 'Ýta við dósunum', '<g class="cans"><rect class="can" x="190" y="395" width="44" height="65"/><rect class="can" x="238" y="395" width="44" height="65"/><rect class="can" x="214" y="330" width="44" height="65"/></g>')}
          <rect class="box" x="330" y="380" width="120" height="80"/>
          ${itemSpot('seed', 545, 418, .8)}
          <path class="box box-pale" d="M190 540h150v80H190zM380 520h110v100H380z"/>`) +
        layer(-12, `<path class="floor" d="M-40 640H1240V800H-40Z"/>
          ${S.choices.shop === undefined ? moment('shop', 'Afgreiðslan bíður', cashier + '<circle class="coin" cx="720" cy="365" r="20"/>', 800, 300) : cashier}
          <path class="counter" d="M680 450h370v220H680z"/><path class="ln" d="M680 500h370"/>
          ${toy('register', 'Ýta á kassann', '<g class="register"><path class="reg" d="M900 450v-80h120v80z"/><rect class="reg-screen" x="920" y="385" width="80" height="30"/></g>')}
          ${S.flags.bought ? '' : '<g transform="translate(1010 260)"><g class="balloon"><path class="ln string" d="M0 46q-10 60 0 144"/><ellipse class="balloon-skin" cx="0" cy="0" rx="36" ry="46"/></g></g>'}
          ${S.flags.enough ? `<path class="tipjar" d="M720 450v-55h60v55z"/>${heart(750, 432)}` : ''}
          ${extras(false)}`);
    } },

  { id: 'street', name: 'Gatan', indoor: false,
    intro: ['Gatan liggur í allar áttir, líka þá sem enginn teiknaði.', 'Gatan hefur breyst örlítið síðan síðast.'],
    look: 'Eitt götuskiltið bendir beint upp í loftið.',
    fiddle: ['Þú breytir rauðu ljósi í bleikt.', 'Einn strætó stoppar, hugsar sig um og keyrir áfram.', 'Pollurinn speglar aðra götu en þessa.'],
    moment: { prompt: 'Ljósið er rautt, en gatan er alveg tóm.', options: [
      { label: 'Bíða eftir grænu', result: 'Þú bíður. Lítið andlit í glugga á móti brosir til þín.', pts: { care: 1, memory: 1 }, flag: 'waited' },
      { label: 'Fara hliðargötuna', result: 'Á milli húsanna opnast gata sem var ekki þarna áðan. Þú ferð inn.', pts: { courage: 1, wonder: 1 }, flag: 'alley' }] },
    art: () => {
      const lights = `<path class="ln pole" d="M300 560V300"/><rect class="light-box" x="268" y="185" width="64" height="130" rx="10"/>
        <circle class="lamp-r ${S.flags.waited ? '' : S.flags.alley ? 'pink' : 'on'}" cx="300" cy="215" r="17"/><circle class="lamp-y" cx="300" cy="251" r="17"/><circle class="lamp-g ${S.flags.waited ? 'on' : ''}" cx="300" cy="287" r="17"/>`;
      return layer(-3, `${mountains}<path class="skyline" d="M-40 560V400h90v-50h70v80h60v-120h80v100h70v-70h70v90h60v-140h80v120h70v-60h80v90h70v-110h90v130h70v-40h90V560z"/>`) +
        layer(-7, `<path class="bld" d="M-40 560V210H250V560"/>${windows(30, 250, 3, 3, 70, 95)}
          <path class="bld bld-2" d="M250 560V120H545V560"/>${windows(290, 270, 3, 3, 85, 95)}<rect class="win lit" x="440" y="170" width="40" height="52"/>
          ${toy('window', 'Blikka glugganum', '<rect class="win lit blink" x="320" y="166" width="54" height="62"/>')}
          <path class="alley" d="M545 560V260H640V560"/>
          ${S.flags.alley ? story('Í hliðargötunni stendur hurð opin. Fyrir innan heyrist hlátur sem þú kannast við.', 'Skoða hurðina í hliðargötunni', '<path class="alley-glow" d="M568 560l-34 34h118l-34-34z"/><rect class="alley-door" x="568" y="440" width="50" height="120"/>') : ''}
          <path class="bld bld-3" d="M640 560V240H870V560"/>${windows(680, 280, 2, 3, 100, 95)}
          <path class="bld bld-4" d="M870 560V150H1240V560"/>${windows(900, 190, 3, 4, 90, 92)}`) +
        layer(-12, `<path class="sidewalk" d="M-40 560H1240V630H-40Z"/><path class="road" d="M-40 630H1240V800H-40Z"/>
          <path class="ln road-line" d="M-40 722h150m80 0h150m80 0h150m80 0h150m80 0h150m80 0h150"/>
          ${PENTA.map((_, i) => toy('piano', `Nóta ${i + 1}`, `<rect class="zebra" x="${410 + i * 32}" y="642" width="20" height="146"/>`, `data-note="${i}"`)).join('')}
          ${S.choices.street === undefined ? moment('street', 'Rautt ljós á tómri götu', lights, 300, 140) : lights}
          ${story('Skiltið segir: Hér má beygja inn í hugmynd.', 'Lesa götuskiltið', '<path class="ln pole" d="M480 560V420"/><path class="street-sign" d="M462 420V362h-20l38-46 38 46h-20v58z"/>')}
          <path class="bench" d="M690 541h180v14H690z"/><path class="ln" d="M705 555v30M855 555v30M700 512h160"/>
          ${itemSpot('ticket', 780, 520, .7)}
          <path class="ln lamp-post" d="M1010 606V300q0-55-55-55h-15"/><circle class="lamp-bulb lit" cx="925" cy="258" r="26"/>
          ${itemSpot('firefly', 962, 350, .75, 'float')}
          ${extras(true, 590)}`);
    } },

  { id: 'garden', name: 'Leynigarðurinn', indoor: false,
    intro: ['Bak við litla hliðið vex staður sem enginn á.', 'Garðurinn hefur vaxið síðan þú komst síðast.'],
    look: 'Blómin snúa sér ekki að sólinni. Þau snúa sér að þér.',
    fiddle: ['Þú vökvar eitt lítið kannski.', 'Runnarnir færa sig og búa til nýja leið.', 'Steinarnir hvísla sín á milli.'],
    moment: { prompt: 'Í miðjum garðinum er blettur af nýrri mold, og hliðið á bak við þig stendur hálfopið.', options: [
      { label: 'Gróðursetja fræið', needs: 'seed', lacking: 'Þig vantar fræ. Kannski fást þau einhvers staðar?', result: 'Þú setur fræið í moldina. Það tekur ekki langan tíma.', pts: { care: 2 }, flag: 'planted' },
      { label: 'Opna hliðið upp á gátt', result: 'Þú opnar hliðið fyrir þau sem koma næst. Fiðrildi fljúga strax út.', pts: { courage: 1, wonder: 1 }, flag: 'gateOpen' }] },
    art: () => {
      const gate = S.flags.gateOpen
        ? '<path class="gate-door" d="M470 430l-70 24v190l70 8z"/><path class="gate-door" d="M730 430l70 24v190l-70 8z"/><path class="ln gate" d="M470 650V430M730 650V430"/>'
        : '<path class="ln gate" d="M470 650V430q0-150 130-150t130 150v220M470 450h260M520 650V396M580 650V330M640 650V330M700 650V396"/>';
      const treeDoor = S.items.has('key')
        ? `<rect class="tree-door open" x="972" y="500" width="38" height="66" rx="16"/>${itemSpot('diary', 991, 536, .55)}`
        : story('Á trénu er pínulítil hurð. Hún er læst, og skráargatið er gamalt.', 'Skoða litlu hurðina á trénu', '<rect class="tree-door" data-locked="1" x="972" y="500" width="38" height="66" rx="16"/><circle class="knob" cx="1002" cy="536" r="4"/>');
      const scale = S.flags.planted && S.visits.garden > S.plantedVisit ? 1.6 : 1;
      const soil = '<ellipse class="soil" cx="380" cy="706" rx="80" ry="22"/>';
      const plant = S.flags.planted ? `<g transform="translate(380 704) scale(${scale})"><g class="grow"><path class="ln stem" d="M0 0V-120M0-60q-40-10-50-40M0-80q40-10 45-45"/><circle cx="0" cy="-140" r="26" fill="#ff6b91"/><circle cx="0" cy="-140" r="10" fill="#ffdc53"/></g></g>` : '';
      return layer(-4, mountains) +
        layer(-8, `<path class="hedge" d="M-40 650V430q50-60 100 0q50-60 100 0q50-60 100 0q50-60 100 0q55-60 110 0V650Z"/>
          <path class="hedge" d="M730 650V430q55-60 110 0q50-60 100 0q50-60 100 0q50-60 100 0q50-60 100 0V650Z"/>
          <path class="glow-path" d="M560 650L585 440h30L640 650z"/>${gate}
          <path class="trunk-fill" d="M960 650q12-170 0-330h60q-12 160 0 330z"/>
          <g transform="translate(990 330)"><g class="sway"><circle class="leaf" cx="-50" cy="-10" r="90"/><circle class="leaf" cx="60" cy="20" r="80"/><circle class="leaf" cx="10" cy="-80" r="70"/></g></g>
          ${treeDoor}`) +
        layer(-14, `${ground()}<path class="pathway" d="M470 800q-10-90 90-150h80q100 60 90 150z"/>
          ${plant}${S.choices.garden === undefined ? moment('garden', 'Moldarblettur', soil, 380, 620) : soil}
          ${itemSpot('stone', 860, 706, .95)}
          ${toy('blossoms', 'Kitla blómin', '<g class="blossoms"><path class="ln stem" d="M990 730v-50M1030 730v-60M1070 730v-45"/><circle cx="990" cy="672" r="16" fill="#ff6b91"/><circle cx="1030" cy="662" r="16" fill="#ffdc53"/><circle cx="1070" cy="680" r="16" fill="#b48cff"/></g>')}
          ${extras(true)}`);
    } }
];

/* ---------- Ferðalagið ---------- */

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeJourney() {
  const route = shuffle(places);
  while (route.length < 12) {
    const next = places[Math.floor(Math.random() * places.length)];
    if (next !== route[route.length - 1]) route.push(next);
  }
  let previous = -1;
  return route.map((place, index) => {
    let w = Math.floor(Math.random() * weather.length);
    if (w === previous && Math.random() > .4) w = (w + 1) % weather.length;
    previous = w;
    return { place, time: times[index % 4], weather: w, day: Math.floor(index / 4) + 1 };
  });
}

let journey = makeJourney();
let phaseIndex = 0;
let currentPlace = places[0];
let quiet = false;

/* ---------- Hljóð ---------- */

let audio;
function tone(freqs, dur = .18, type = 'triangle', gap = .07) {
  if (quiet) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const start = audio.currentTime;
    freqs.forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const t = start + i * gap;
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(.09, t + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, t + dur);
      osc.connect(gain).connect(audio.destination);
      osc.start(t);
      osc.stop(t + dur + .05);
    });
  } catch { /* hljóð er bara skraut */ }
}

/* ---------- Tal, vísbendingar, tilkynningar ---------- */

function speak(text) {
  speech.innerHTML = text;
  speech.classList.remove('pop');
  void speech.offsetWidth;
  speech.classList.add('pop');
}

function restart(el, cls, ms) {
  el.classList.remove(cls);
  void el.getBoundingClientRect();
  el.classList.add(cls);
  if (ms) setTimeout(() => el.classList.remove(cls), ms);
}

function updateHint() {
  const n = sceneArt.querySelectorAll('.item:not(.taken)').length;
  let text = n ? `${n} ${n === 1 ? 'hlutur falinn' : 'hlutir faldir'} hér` : 'Allt fundið hér';
  if (sceneArt.querySelector('.moment')) text += ' · ákvörðun bíður';
  if (sceneArt.querySelector('[data-locked]')) text += ' · eitthvað er læst';
  hint.textContent = text;
}

let toastTimer;
function showToast(html) {
  toast.innerHTML = html;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
}

/* ---------- Senur ---------- */

function drawScene() {
  sceneArt.innerHTML = currentPlace.art();
  world.dataset.beat = String(Boolean(S.flags.clapped));
  updateHint();
}

function setWeather(index) {
  S.weatherIndex = index;
  const w = weather[index];
  world.dataset.weather = w.id;
  $('#weatherIcon').textContent = w.icon;
  $('#weatherName').textContent = w.name;
}

function renderPhase(firstRender = false) {
  const phase = journey[phaseIndex];
  currentPlace = phase.place;
  S.visits[currentPlace.id] = (S.visits[currentPlace.id] || 0) + 1;
  S.fiddled = new Set();
  world.dataset.time = phase.time.id;
  world.dataset.indoor = String(currentPlace.indoor);
  setWeather(phase.weather);
  drawScene();
  choiceBox.hidden = true;

  $('#dayCount').textContent = `Dagur ${phase.day} af 3`;
  $('#chapterNumber').textContent = phaseIndex + 1;
  $('#placeName').textContent = currentPlace.name;
  $('#timeName').textContent = phase.time.name;
  landscape.setAttribute('aria-label', `${currentPlace.name}, ${phase.time.name}, ${weather[phase.weather].name}`);
  $('[data-action="forward"]').innerHTML = phaseIndex === journey.length - 1 ? 'SÖGULOK <span aria-hidden="true">✦</span>' : 'ÁFRAM <span aria-hidden="true">→</span>';

  const revisit = S.visits[currentPlace.id] > 1;
  let line = currentPlace.intro[revisit ? 1 : 0];
  const echoes = Object.keys(ECHOES).filter(flag => S.flags[flag]);
  if (echoes.length && Math.random() < .7) line += ' ' + ECHOES[echoes[Math.floor(Math.random() * echoes.length)]];
  speak(firstRender ? `Hér byrjar sagan. ${line}` : line);

  if (!firstRender) {
    restart(stage, 'page-turn');
    tone([392, 523], .22, 'sine', .1);
  }
}

/* ---------- Að safna ---------- */

function collect(id, el) {
  if (S.items.has(id)) return;
  S.items.add(id);
  el.classList.add('taken');
  el.removeAttribute('tabindex');
  speak(`<b>${ITEMS[id].name}</b> fer í töskuna. ${ITEMS[id].text}`);
  tone([660, 880, 1320], .2);
  flyToBag(id, el);
  setTimeout(() => { el.remove(); updateHint(); }, 450);
}

function flyToBag(id, el) {
  const slot = bagSlots.querySelector(`[data-slot="${id}"]`);
  const from = el.getBoundingClientRect();
  const to = slot.getBoundingClientRect();
  const fly = document.createElement('div');
  fly.className = 'flyer';
  fly.innerHTML = iconSvg(id);
  const x = from.left + from.width / 2 - 30;
  const y = from.top + from.height / 2 - 30;
  fly.style.left = `${x}px`;
  fly.style.top = `${y}px`;
  document.body.append(fly);
  const dx = to.left + to.width / 2 - 30 - x;
  const dy = to.top + to.height / 2 - 30 - y;
  const anim = fly.animate([
    { transform: 'translate(0, 0) scale(1.3)' },
    { transform: `translate(${dx * .45}px, ${dy * .45 - 140}px) scale(1.15) rotate(-14deg)`, offset: .5 },
    { transform: `translate(${dx}px, ${dy}px) scale(.7)` }
  ], { duration: reducedMotion ? 1 : 900, easing: 'cubic-bezier(.45,0,.25,1)' });
  anim.onfinish = () => { fly.remove(); renderBag(id); checkThreads(); };
}

function renderBag(fresh) {
  bagSlots.innerHTML = ITEM_ORDER.map(id => S.items.has(id)
    ? `<button class="slot filled ${id === fresh ? 'pop' : ''}" data-slot="${id}" aria-label="${ITEMS[id].name}" title="${ITEMS[id].name}">${iconSvg(id)}</button>`
    : `<button class="slot" data-slot="${id}" aria-label="Tómur staður" disabled></button>`).join('');
}

function checkThreads() {
  const fresh = THREADS.filter(t => !S.threads.has(t.id) && S.items.has(t.a) && S.items.has(t.b));
  if (!fresh.length) return;
  fresh.forEach(t => S.threads.add(t.id));
  $('#threadCount').textContent = S.threads.size;
  restart($('#threadButton'), 'pulse', 1600);
  const t = fresh[fresh.length - 1];
  showToast(`<span class="toast-icons">${iconSvg(t.a)}<i></i>${iconSvg(t.b)}</span><span><small>Nýr þráður</small><b>${t.name}</b></span>`);
  tone([523, 659, 784, 1046, 1318], .5, 'sine', .09);
}

function showCard(id) {
  const item = ITEMS[id];
  const threads = THREADS.filter(t => t.a === id || t.b === id);
  card.innerHTML = `<button class="card-close" aria-label="Loka">×</button>
    <div class="card-icon">${iconSvg(id)}</div>
    <h3>${item.name}</h3><p>${item.text}</p>
    <div class="chips">${item.tags.map(tag => `<span style="--c:${THEMES[tag].color}">${THEMES[tag].name}</span>`).join('')}</div>
    <p class="card-threads">${threads.map(t => S.threads.has(t.id) ? `✦ ${t.name}` : '· · · falinn þráður').join('<br>')}</p>`;
  card.hidden = false;
  card.querySelector('.card-close').focus();
}

/* ---------- Ákvarðanir ---------- */

function openMoment() {
  const m = currentPlace.moment;
  choiceBox.innerHTML = `<p class="choice-prompt">${m.prompt}</p><div class="choice-options">${m.options.map((o, i) => {
    const locked = o.needs && !S.items.has(o.needs);
    return `<button data-option="${i}" ${locked ? 'disabled' : ''}>${o.label}${locked ? `<small>${o.lacking}</small>` : ''}</button>`;
  }).join('')}</div><button class="choice-later" data-option="later">Ekki núna</button>`;
  choiceBox.hidden = false;
  hint.hidden = true;
  choiceBox.querySelector('button:not([disabled])').focus();
  tone([440, 554], .25, 'sine', .12);
}

function choose(value) {
  choiceBox.hidden = true;
  hint.hidden = false;
  if (value === 'later') return;
  const option = currentPlace.moment.options[Number(value)];
  S.choices[currentPlace.id] = Number(value);
  S.flags[option.flag] = true;
  Object.entries(option.pts).forEach(([theme, n]) => { S.pts[theme] += n; });
  if (option.flag === 'planted') S.plantedVisit = S.visits.garden;
  drawScene();
  restart(frame, 'shift', 800);
  speak(option.result);
  showToast('<span class="toast-mark">✦</span><span><small>Ákvörðun</small><b>Heimurinn man þetta.</b></span>');
  tone([523, 659, 784, 1046], .3, 'sine', .1);
}

/* ---------- Leikföng og smellir í senunni ---------- */

function playToy(el) {
  const t = TOYS[el.dataset.toy];
  restart(el, 'play', 900);
  if (el.dataset.note) tone([PENTA[Number(el.dataset.note)]], .45, 'sine');
  else tone([t.note, t.note * 1.5], .16);
  speak(t.line);
}

function activate(el) {
  if (el.dataset.item) collect(el.dataset.item, el);
  else if (el.dataset.moment) openMoment();
  else if (el.dataset.toy) playToy(el);
  else if (el.dataset.story) { speak(el.dataset.story); tone([587, 740], .2); }
}

const TARGETS = '[data-item],[data-moment],[data-toy],[data-story]';
sceneArt.addEventListener('click', event => {
  const el = event.target.closest(TARGETS);
  if (el) activate(el);
});
sceneArt.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const el = event.target.closest(TARGETS);
  if (el) { event.preventDefault(); activate(el); }
});
choiceBox.addEventListener('click', event => {
  const button = event.target.closest('[data-option]');
  if (button && !button.disabled) choose(button.dataset.option);
});

// Dýpt: lögin hreyfast mishratt eftir músinni.
if (!reducedMotion) {
  frame.addEventListener('pointermove', event => {
    const r = frame.getBoundingClientRect();
    landscape.style.setProperty('--px', ((event.clientX - r.left) / r.width - .5).toFixed(3));
    landscape.style.setProperty('--py', ((event.clientY - r.top) / r.height - .5).toFixed(3));
  });
  frame.addEventListener('pointerleave', () => {
    landscape.style.setProperty('--px', 0);
    landscape.style.setProperty('--py', 0);
  });
}

/* ---------- Stóru takkarnir ---------- */

const FX = ['fx-wiggle', 'fx-gust', 'fx-bounce', 'fx-hue'];

document.querySelectorAll('.big-button').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.action;
  if (action === 'forward') {
    if (phaseIndex === journey.length - 1) { openBook(true); return; }
    phaseIndex += 1;
    renderPhase();
    return;
  }
  if (action === 'look') {
    speak(currentPlace.look);
    restart(world, 'reveal', 1800);
    tone([784, 988], .2, 'sine');
  }
  if (action === 'fiddle') {
    const lines = currentPlace.fiddle;
    const unused = lines.filter(line => !S.fiddled.has(line));
    const line = (unused.length ? unused : lines)[Math.floor(Math.random() * (unused.length || lines.length))];
    S.fiddled.add(line);
    restart(world, FX[Math.floor(Math.random() * FX.length)], 1000);
    if (Math.random() < .3) setWeather((S.weatherIndex + 1) % weather.length);
    speak(line);
    tone([PENTA[Math.floor(Math.random() * 5)], PENTA[Math.floor(Math.random() * 5)] * 2], .14, 'square', .08);
  }
}));

$('#weatherButton').addEventListener('click', () => {
  setWeather((S.weatherIndex + 1) % weather.length);
  speak(`Þú snýrð veðrinu. Nú er ${weather[S.weatherIndex].name}.`);
  tone([330, 440], .2, 'sine');
});

$('#logoButton').addEventListener('click', () => {
  speak('líf.is segir: halló. Þú ert komin/n inn í söguna.');
  tone([523, 784], .2);
});

$('#quietButton').addEventListener('click', event => {
  quiet = document.body.classList.toggle('quiet');
  event.currentTarget.setAttribute('aria-pressed', String(quiet));
  speak(quiet ? 'Pssst... nú heyrast litlu hlutirnir betur.' : currentPlace.intro[0]);
});

bagSlots.addEventListener('click', event => {
  const slot = event.target.closest('.slot.filled');
  if (slot) showCard(slot.dataset.slot);
});
card.addEventListener('click', event => { if (event.target.closest('.card-close')) card.hidden = true; });
document.addEventListener('click', event => {
  if (!card.hidden && !card.contains(event.target) && !event.target.closest('.slot')) card.hidden = true;
});

/* ---------- Þráðakortið og söguendirinn ---------- */

function scores() {
  const result = Object.fromEntries(Object.keys(THEMES).map(k => [k, 0]));
  S.items.forEach(id => ITEMS[id].tags.forEach(tag => { result[tag] += 1; }));
  Object.entries(S.pts).forEach(([k, v]) => { result[k] += v; });
  return result;
}

function webSvg(sc) {
  const C = 300, R = 238, n = ITEM_ORDER.length;
  const themeKeys = Object.keys(THEMES);
  const top = themeKeys.reduce((a, b) => (sc[b] > sc[a] ? b : a));
  const pos = {};
  ITEM_ORDER.forEach((id, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    pos[id] = [C + R * Math.cos(a), C + R * Math.sin(a)];
  });
  themeKeys.forEach((k, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / themeKeys.length;
    pos[k] = [C + 92 * Math.cos(a), C + 92 * Math.sin(a)];
  });
  const curve = (a, b, pull) => {
    const [x1, y1] = pos[a], [x2, y2] = pos[b];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${(mx + (C - mx) * pull).toFixed(1)} ${(my + (C - my) * pull).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  let k = 0;
  const spokes = ITEM_ORDER.filter(id => S.items.has(id)).flatMap(id => ITEMS[id].tags.map(tag =>
    `<path class="web-line" d="${curve(id, tag, .2)}" pathLength="1" style="stroke:${THEMES[tag].color};--k:${k++}"/>`)).join('');
  const threads = THREADS.filter(t => S.threads.has(t.id)).map(t => `<path class="web-thread" d="${curve(t.a, t.b, -.18)}" pathLength="1" style="--k:${k++}"/>`).join('');
  const hubs = themeKeys.map(key => {
    const [x, y] = pos[key];
    const r = Math.min(46, 18 + sc[key] * 2.4);
    return `<g class="web-hub ${key === top && sc[key] ? 'top' : ''}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" style="fill:${THEMES[key].color}"/><text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle">${THEMES[key].name}</text></g>`;
  }).join('');
  const nodes = ITEM_ORDER.map((id, i) => {
    const [x, y] = pos[id];
    return S.items.has(id)
      ? `<g class="web-node" style="--k:${i}"><circle cx="${x}" cy="${y}" r="32"/><g transform="translate(${x - 22} ${y - 22}) scale(.69)"><g class="ico">${ITEMS[id].icon}</g></g></g>`
      : `<g class="web-empty"><circle cx="${x}" cy="${y}" r="26"/><text x="${x}" y="${y + 9}" text-anchor="middle">?</text></g>`;
  }).join('');
  return `<svg class="web" viewBox="0 0 600 600" role="img" aria-label="Hlutirnir sem þú fannst, tengdir við þemun sín og hver við annan">${spokes}${hubs}${threads}${nodes}</svg>`;
}

function barsHtml(sc) {
  const max = Math.max(1, ...Object.values(sc));
  return `<div class="bars">${Object.entries(THEMES).map(([k, t]) => `<div class="bar"><span>${t.name}</span><i style="--v:${sc[k] / max};--c:${t.color}"></i><b>${sc[k]}</b></div>`).join('')}</div>`;
}

function mapHtml() {
  const sc = scores();
  const list = THREADS.map(t => S.threads.has(t.id)
    ? `<li class="found">${iconSvg(t.a)}${iconSvg(t.b)}<span>${t.name}</span></li>`
    : '<li><i>?</i><i>?</i><span>· · ·</span></li>').join('');
  return `<p class="kicker">Þráðakortið</p><h2 id="bookTitle">Hvernig tengist þetta?</h2>
    <p class="lede">Hver hlutur togar í tvö þemu í miðjunni. Sum pör mynda sterka þræði sín á milli. Þemað sem togar fastast ræður því hvernig sagan endar.</p>
    <div class="book-grid">${webSvg(sc)}<div><ul class="thread-list">${list}</ul>${barsHtml(sc)}</div></div>`;
}

function endingHtml() {
  const sc = scores();
  const ranked = Object.keys(THEMES).sort((a, b) => sc[b] - sc[a]);
  const [top, second] = ranked;
  const empty = sc[top] === 0;
  const paras = [];
  paras.push(empty ? 'Þú gekkst í gegnum heiminn án þess að snerta hann. Það er líka leið til að vera til, en heimurinn beið eftir þér.' : THEMES[top].opener);
  const flagLines = Object.keys(FLAG_LINES).filter(flag => S.flags[flag]).map(flag => FLAG_LINES[flag]);
  if (flagLines.length) paras.push(flagLines.join(' '));
  const found = THREADS.filter(t => S.threads.has(t.id));
  const shown = shuffle(found).slice(0, 3);
  const rest = found.length - shown.length;
  paras.push(found.length
    ? shown.map(t => t.text).join(' ') + (rest ? ` Og ${rest} ${rest === 1 ? 'annar þráður hélt' : 'aðrir þræðir héldu'} restinni saman.` : '')
    : 'Hlutirnir sem þú fannst lágu hver í sínu horni. Kannski tengjast þeir í næstu sögu.');
  if (!empty && sc[second] > 0) paras.push(THEMES[second].echo);
  paras.push(S.items.has('letter')
    ? `Loks opnar þú bréfið úr póstkassanum. Með þinni eigin rithönd, dagsett á morgun, stendur: <em>„${empty ? 'Það er allt í lagi að byrja hægt.' : THEMES[top].letter}“</em>`
    : 'Einhvers staðar liggur enn óopnað bréf í póstkassa. Það bíður næstu sögu.');
  return `<p class="kicker">Sögulok · þrír dagar liðnir</p><h2 id="bookTitle">${empty ? 'Sagan um að horfa' : THEMES[top].title}</h2>
    <div class="book-grid">${webSvg(sc)}<div class="story">${paras.map(p => `<p>${p}</p>`).join('')}</div></div>
    ${barsHtml(sc)}
    <p class="stats">${S.items.size}/${ITEM_ORDER.length} hlutir · ${S.threads.size}/${THREADS.length} þræðir · ${Object.keys(S.choices).length}/${places.length} ákvarðanir</p>
    <div class="book-actions"><button class="big-button forward" id="restartButton">Ný saga <span aria-hidden="true">↻</span></button></div>`;
}

function openBook(ending) {
  card.hidden = true;
  bookContent.innerHTML = ending ? endingHtml() : mapHtml();
  book.hidden = false;
  book.scrollTop = 0;
  $('#bookClose').focus();
  if (ending) tone([392, 523, 659, 784, 1046, 1318], .8, 'sine', .14);
}

function closeBook() { book.hidden = true; }

$('#threadButton').addEventListener('click', () => openBook(false));
$('#bookClose').addEventListener('click', closeBook);
book.addEventListener('click', event => {
  if (event.target === book) closeBook();
  if (event.target.closest('#restartButton')) newStory();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!book.hidden) closeBook();
  else if (!card.hidden) card.hidden = true;
  else if (!choiceBox.hidden) choose('later');
});

function newStory() {
  S = freshState();
  journey = makeJourney();
  phaseIndex = 0;
  $('#threadCount').textContent = '0';
  renderBag();
  closeBook();
  renderPhase(true);
}

renderBag();
renderPhase(true);
