// Generates the HTML shells: Romanian at the root, German in /de/ (same file names).
// node build.mjs
import { writeFile, mkdir } from 'node:fs/promises';
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

const shell = (p, lang) => {
  const r = lang === 'de' ? '../' : '';
  const [title, desc] = p[lang];
  return `<!doctype html>
<html lang="${lang}" data-root="${r}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#FFFFFF">
<meta name="format-detection" content="telephone=no">
<link rel="alternate" hreflang="ro" href="${BASE}${p.file}">
<link rel="alternate" hreflang="de" href="${BASE}de/${p.file}">
<link rel="icon" type="image/png" href="${r}assets/img/favicon.png">
<link rel="apple-touch-icon" href="${r}assets/img/apple-touch-icon.png">
<link rel="preload" href="${r}assets/fonts/outfit-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${r}assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${r}assets/css/style.css">
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

await mkdir(root + 'de', { recursive: true });
for (const p of PAGES) {
  await writeFile(root + p.file, shell(p, 'ro'));
  await writeFile(root + 'de/' + p.file, shell(p, 'de'));
}
console.log(`Built ${PAGES.length} pages × 2 languages`);
