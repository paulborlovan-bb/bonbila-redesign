// Generates the HTML shells: Romanian at the root, German in /de/ (same file names).
// Version 2 ("bold", dark) gets the same pages in /v2/ and /v2/de/ and its own stylesheet,
// assets/css/v2.css, generated here from style.css + assets/css/v2-bold.css.
// node build.mjs
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const BASE = 'https://paulborlovan-bb.github.io/bonbila-redesign/';

const PAGES = [
  { file: 'index.html', page: 'home',
    ro: ['Bonbila Auto – becuri și ștergătoare potrivite pentru mașina ta', 'Alege marca și modelul mașinii și vezi doar becurile și ștergătoarele compatibile. Livrare rapidă în toată România.'],
    de: ['Bonbila Auto – Autolampen und Scheibenwischer passend zu Ihrem Auto', 'Marke und Modell wählen und nur passende Lampen und Wischer sehen. Schneller Versand.'] },
  { file: 'categorie.html', page: 'category',
    ro: ['Catalog – Bonbila Auto', 'Ștergătoare și becuri auto, filtrate după mașina ta.'],
    de: ['Katalog – Bonbila Auto', 'Scheibenwischer und Autolampen, gefiltert nach Ihrem Fahrzeug.'] },
  { file: 'masini.html', page: 'masini',
    ro: ['Alege generația mașinii – Bonbila Auto', 'Alege generația sau caroseria mașinii tale pentru produse 100% compatibile.'],
    de: ['Fahrzeuggeneration wählen – Bonbila Auto', 'Wählen Sie Generation oder Karosserie Ihres Fahrzeugs für passende Produkte.'] },
  { file: 'produs.html', page: 'product',
    ro: ['Produs – Bonbila Auto', 'Detalii produs, compatibilitate și livrare.'],
    de: ['Produkt – Bonbila Auto', 'Produktdetails, Kompatibilität und Versand.'] },
  { file: 'cos.html', page: 'cart',
    ro: ['Coșul meu – Bonbila Auto', 'Coșul de cumpărături.'],
    de: ['Warenkorb – Bonbila Auto', 'Ihr Warenkorb.'] },
  { file: 'checkout.html', page: 'checkout',
    ro: ['Finalizare comandă – Bonbila Auto', 'Date de livrare și plată.'],
    de: ['Kasse – Bonbila Auto', 'Liefer- und Zahlungsdaten.'] },
];

const NOSCRIPT = {
  ro: 'Pentru acest prototip este nevoie de JavaScript. Pe site-ul WordPress aceleași componente funcționează și fără.',
  de: 'Für diesen Prototyp wird JavaScript benötigt. Auf der WordPress-Seite funktionieren dieselben Komponenten auch ohne.',
};

const shell = (p, lang, v2 = false) => {
  const r = (v2 ? '../' : '') + (lang === 'de' ? '../' : '');
  const dir = v2 ? 'v2/' : '';
  const [title, desc] = p[lang];
  const fonts = v2 ? ['archivo-latin-wdth-wght.woff2'] : ['outfit-latin-wght-normal.woff2', 'barlow-latin-400-normal.woff2'];
  return `<!doctype html>
<html lang="${lang}" data-root="${r}"${v2 ? ' data-v="2"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="${v2 ? '#000000' : '#0E1422'}">
<meta name="format-detection" content="telephone=no">
<link rel="alternate" hreflang="ro" href="${BASE}${dir}${p.file}">
<link rel="alternate" hreflang="de" href="${BASE}${dir}de/${p.file}">
<link rel="icon" type="image/png" href="${r}assets/img/favicon.png">
<link rel="apple-touch-icon" href="${r}assets/img/apple-touch-icon.png">
${fonts.map(f => `<link rel="preload" href="${r}assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="${r}assets/css/${v2 ? 'v2' : 'style'}.css">
<script src="${r}assets/js/data.js" defer></script>
<script src="${r}assets/js/i18n.js" defer></script>
<script src="${r}assets/js/app.js" defer></script>
</head>
<body data-page="${p.page}">
<div id="app"><noscript><p style="padding:24px;font:16px/1.5 system-ui">${NOSCRIPT[lang]}</p></noscript></div>
</body>
</html>
`;
};

/* v2 stylesheet: style.css with the dark token mapping, then v2-bold.css on top */
const V2_FONTS = `@font-face{font-family:"Archivo";font-style:normal;font-weight:100 900;font-stretch:62% 125%;font-display:swap;src:url(../fonts/archivo-latin-ext-wdth-wght.woff2) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Archivo";font-style:normal;font-weight:100 900;font-stretch:62% 125%;font-display:swap;src:url(../fonts/archivo-latin-wdth-wght.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"JetBrains Mono";font-style:normal;font-weight:500 700;font-display:swap;src:url(../fonts/jetbrains-mono-latin-ext-wght.woff2) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"JetBrains Mono";font-style:normal;font-weight:500 700;font-display:swap;src:url(../fonts/jetbrains-mono-latin-wght.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
`;
async function buildV2Css() {
  let css = await readFile(root + 'assets/css/style.css', 'utf8');
  css = css.replace(/^@font-face\{font-family:"(Outfit|Barlow|Barlow Semi Condensed)".*\n/gm, '');
  // navy → black / graphite
  css = css.replaceAll('#161C2C', '#141518').replaceAll('rgba(24,31,48,', 'rgba(16,17,20,').replaceAll('rgba(14,20,34,', 'rgba(0,0,0,');
  // in v2 --ink is the light text colour, so text that sits on yellow or white uses --on-light,
  // and "selected" fills (night in v1) become light pills with dark text
  css = css.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, body) => {
    if (/background:(var\(--brand\)|#fff|rgba\(255,255,255,\.9\d?\))/.test(body)) body = body.replaceAll('color:var(--ink)', 'color:var(--on-light)');
    if (/background:var\(--ink\)/.test(body)) body = body.replaceAll('color:#fff', 'color:var(--on-light)');
    if (!sel.includes('.is-night,.topbar')) body = body.replace(/background:var\(--night\);color:#fff/g, 'background:var(--sel);color:var(--on-light)').replace(/border-color:var\(--night\)/g, 'border-color:var(--sel)');
    return sel + '{' + body + '}';
  });
  // one family in three widths: display = expanded, data = semi-condensed (font shorthand only takes keywords)
  css = css.replace(/font:([^;{}]*?)(\d[\d.]*px(?:\/[\d.]+(?:px)?)?) var\(--f-display\)/g, 'font:$1expanded $2 var(--f-display)')
           .replace(/font:([^;{}]*?)(\d[\d.]*px(?:\/[\d.]+(?:px)?)?) var\(--f-data\)/g, 'font:$1semi-condensed $2 var(--f-data)');
  const bold = await readFile(root + 'assets/css/v2-bold.css', 'utf8');
  await writeFile(root + 'assets/css/v2.css', `/* GENERATED by build.mjs from style.css + v2-bold.css – edit those, not this file */\n${V2_FONTS}${css}\n${bold}`);
}

for (const v2 of [false, true]) {
  const base = root + (v2 ? 'v2/' : '');
  await mkdir(base + 'de', { recursive: true });
  for (const p of PAGES) {
    await writeFile(base + p.file, shell(p, 'ro', v2));
    await writeFile(base + 'de/' + p.file, shell(p, 'de', v2));
  }
}
await buildV2Css();
console.log(`Built ${PAGES.length} pages × 2 languages × 2 versions, and assets/css/v2.css`);
