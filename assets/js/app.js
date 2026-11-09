/* Bonbila Auto – redesign prototype. Vanilla JS, no build step.
   Every component maps to an existing element of the WordPress site (see README → Component map). */
(() => {
'use strict';
const D = window.BB_DATA, I = window.BB_I18N;
const H = document.documentElement;
const LANG = H.lang === 'de' ? 'de' : 'ro';
const ROOT = H.dataset.root || '';
const PAGE = document.body.dataset.page;
const L = I[LANG];
const FREE_SHIP = 200;           // lei – placeholder, confirm with Bonbila
const SHIP_COST = 19.99;         // lei – placeholder
const YEAR_NOW = 2026;
const t = (k, v = {}) => String(L[k] ?? I.ro[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];
const img = p => ROOT + 'assets/img/' + p;
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const params = new URLSearchParams(location.search);
const fmt = n => n.toLocaleString(LANG === 'de' ? 'de-DE' : 'ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const RATE = 5.09;                // demo only: DE shows € at 1 € = 5,09 lei (open question for Bonbila)
const CUR = LANG === 'de' ? '€' : 'lei';
const conv = n => LANG === 'de' ? n / RATE : n;
const money = n => fmt(conv(n)) + ' ' + CUR;
const priceHTML = n => `${fmt(conv(n))}<small> ${CUR}</small>`;
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const link = (page, q = {}) => { const u = new URLSearchParams(); Object.entries(q).forEach(([k, v]) => { if (v != null && v !== '') u.set(k, v); }); const s = u.toString(); return page + (s ? '?' + s : ''); };

/* ---------- icons ---------- */
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cart: '<circle cx="9.5" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.3l2.5 11.7a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5l1.5-7.8H6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>',
  down: '<path d="m6 9 6 6 6-6"/>', right: '<path d="m9 6 6 6-6 6"/>', left: '<path d="m15 6-6 6 6 6"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  heart: '<path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.5 3.8 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.2 0 5.3 3 4.2 6.2C19.5 15.4 12 20 12 20Z"/>',
  truck: '<path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3.5 3.5v3h-7.5"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  ret: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1zM20 14h-3v6h2a1 1 0 0 0 1-1z"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z"/>',
  wiper: '<path d="M2.5 17a13.5 13.5 0 0 1 19 0"/><path d="M12 19 6 8"/><circle cx="12" cy="19" r="1.3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V5.5M8.5 7.5h7"/>',
  phone: '<path d="M5 3.5h3.5l2 5L8 10a11 11 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5.5a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', checkc: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', alert: '<path d="M12 3.5 2.5 20h19L12 3.5Z"/><path d="M12 10v4M12 17h.01"/>',
  filter: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  sort: '<path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  list: '<rect x="4" y="4.5" width="6" height="6" rx="1.2"/><rect x="4" y="13.5" width="6" height="6" rx="1.2"/><path d="M13 7.5h7M13 16.5h7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 8 7.5 9 4.3-1 7.5-4.5 7.5-9V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  car: '<path d="M5 16.5H3v-4l2.2-5h11.3l3 5H21v4h-2"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/><path d="M9.5 16.5h5M5 12.5h15"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  store: '<path d="M4 10v10h16V10M3 6.5 5 3h14l2 3.5v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/>',
  box: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M12 3v18"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>', cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  bank: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>', tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
};
const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[n] || ''}</svg>`;
const MOUNTS = {
  hook: '<path d="M3 21h22a6 6 0 0 0 0-12H15"/><path d="M31 21h10"/>',
  push: '<rect x="5" y="9" width="34" height="12" rx="4"/><circle cx="22" cy="15" r="3.2"/>',
  side: '<path d="M3 15h22"/><rect x="25" y="8" width="15" height="14" rx="3.5"/><circle cx="19" cy="15" r="2.6"/>',
  top: '<rect x="6" y="13" width="32" height="10" rx="3"/><path d="M13 13V7h18v6"/>',
  pinch: '<path d="M4 21h36M9 21V11l6.5 4 6.5-4 6.5 4 6.5-4v10"/>',
  bayonet: '<path d="M3 15h29"/><path d="M33 8v14M38 10.5v9"/>',
};

/* ---------- state ---------- */
let cart = store.get('bb_cart', null);
let garage = store.get('bb_garage', null);
let wish = store.get('bb_wish', []);
const PRODUCTS = D.products;
const byId = id => PRODUCTS.find(p => String(p.id) === String(id));
const pname = p => p[LANG] || p.ro;
const brandObj = n => D.brands.find(b => b.n === n);
const findGen = (make, model, slugOrName) => (D.gens[make + '|' + model] || []).find(g => g.slug === slugOrName || g.name === slugOrName);
const yearsLabel = (a, b) => `${a}–${b ?? t('present')}`;
const genShort = (make, genName) => `${make} ${String(genName).replace(/ - /g, ' ')}`;
const carLabel = c => c ? (c.gen ? genShort(c.make, c.gen) : `${c.make} ${c.model}`) : '';
const carYears = c => c && c.from ? yearsLabel(c.from, c.to) : '';
const fitsCar = (p, c) => !!(c && p.fits.some(f => f.make === c.make && f.model === c.model && (!c.gen || f.gen === c.gen)));
const modelsFor = (make, type) => {
  const all = (D.models[make] || []).map(m => m[0]);
  if (type === 'wipers' && D.wiperModels[make]) return D.wiperModels[make].map(String);
  return all;
};
const modelYears = (make, model) => { const m = (D.models[make] || []).find(x => x[0] === model); return m ? [m[1] || 1990, m[2] || YEAR_NOW] : [1990, YEAR_NOW]; };
const saveGarage = c => { garage = c; store.set('bb_garage', c); };
const wished = id => wish.includes(id);
const nprod = n => n === 1 ? `1 ${t('product1')}` : LANG === 'ro' && (n % 100 >= 20 || (n && n % 100 === 0)) ? `${n} de ${t('products')}` : `${n} ${t('products')}`;

function logo(make, cls = '') {
  const b = brandObj(make);
  if (b && b.logo) return `<span class="blogo ${cls}"><img src="${img('brands/' + b.logo + '.webp')}" alt="" width="66" height="42" loading="lazy" decoding="async"></span>`;
  const ini = String(make || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 2);
  return `<span class="blogo ${cls}"><span class="blogo__txt">${esc(ini)}</span></span>`;
}

/* seed a demo cart once, so cos.html / checkout.html are not empty when opened directly */
if (cart === null) {
  cart = [
    { key: '2172|ford-kuga-ii-2015', id: 2172, qty: 1, car: { make: 'Ford', model: 'Kuga', gen: 'Kuga - II', slug: 'ford--kuga--ii-dm2', from: 2012, to: null, year: 2015, vin: 'WF0AXXWPMAFJ48210' } },
    { key: '47|ford-kuga-ii-2015', id: 47, qty: 2, car: { make: 'Ford', model: 'Kuga', gen: 'Kuga - II', slug: 'ford--kuga--ii-dm2', from: 2012, to: null, year: 2015 } },
  ];
  store.set('bb_cart', cart);
}
const cartCount = () => cart.reduce((a, l) => a + l.qty, 0);
const cartTotal = () => cart.reduce((a, l) => { const p = byId(l.id); return a + (p ? p.price * l.qty : 0); }, 0);
const saveCart = () => { store.set('bb_cart', cart); updateCartUI(); };

/* ---------- shared UI ---------- */
function otherLangHref() {
  const file = location.pathname.split('/').pop() || 'index.html';
  return (LANG === 'ro' ? 'de/' : '../') + file + location.search;
}
function langSwitch() {
  const other = otherLangHref();
  return `<nav class="lang" aria-label="${t('language')}">
    <a href="${LANG === 'ro' ? '#' : other}" lang="ro" hreflang="ro" ${LANG === 'ro' ? 'aria-current="true"' : ''}>RO</a>
    <a href="${LANG === 'de' ? '#' : other}" lang="de" hreflang="de" ${LANG === 'de' ? 'aria-current="true"' : ''}>DE</a></nav>`;
}
function garageChip() {
  if (!garage) return `<a class="garage garage--empty" href="index.html#finder">${icon('car')} ${t('chooseCar')}</a>`;
  const href = link('categorie.html', { vehicle_type: garage.type || 'wipers', vehicle_make: garage.make, vehicle_model: garage.model, vehicle_generation: garage.slug });
  return `<div class="garage"><a href="${href}" title="${t('myCar')}">${logo(garage.make)}<span>${esc(carLabel(garage))} <small>${esc(carYears(garage))}</small></span></a>
    <button class="iconbtn" type="button" data-cleargarage aria-label="${t('removeCar')}">${icon('close', 'ico--sm')}</button></div>`;
}
const NAV = [
  ['navBulbs', 'bulb', link('categorie.html', { vehicle_type: 'bulbs' }), 'bulbs'],
  ['navWipers', 'wiper', link('categorie.html', { vehicle_type: 'wipers' }), 'wipers'],
  ['navParts', 'gear', 'index.html#request', 'parts'],
  ['navGuides', 'book', 'index.html#guides', 'guides'],
  ['navContact', 'phone', '#contact', 'contact'],
];
function currentNav() { if (PAGE === 'category' || PAGE === 'masini') return params.get('vehicle_type') || (params.get('q') ? '' : 'wipers'); if (PAGE === 'product') { const p = byId(params.get('id')); return p ? p.type : ''; } return ''; }

function header() {
  const cur = currentNav();
  const total = money(cartTotal());
  return `<a class="skip" href="#main">${t('skip')}</a>
  <div class="topbar"><div class="wrap">
    <ul><li>${icon('truck')}${t('usp1')}</li><li>${icon('ret')}${t('usp2')}</li><li>${icon('headset')}${t('usp3')}</li></ul>
    <div class="topbar__right"><a href="tel:+40771147147">${icon('phone', 'ico--sm')}${t('phone')}</a><a href="mailto:${t('email')}">${icon('mail', 'ico--sm')}${t('email')}</a></div>
  </div></div>
  <header class="header">
    <div class="wrap header__row">
      <a class="logo" href="index.html"><img src="${img('bonbila-logo.png')}" alt="Bonbila Auto – ${t('home')}" width="149" height="44"></a>
      <div class="header__search">${searchBox()}</div>
      <div class="header__actions">
        ${langSwitch()}
        <a class="hact" href="#account"><span class="iconbtn">${icon('user', 'ico--lg')}</span><span><b>${t('account')}</b><small>${t('login')}</small></span></a>
        <a class="iconbtn hicon-only" href="#account" aria-label="${t('account')}">${icon('user', 'ico--lg')}</a>
        <a class="hact cartbtn" href="cos.html" data-cartlink><span class="iconbtn">${icon('cart', 'ico--lg')}<span class="count" data-cartcount>${cartCount()}</span></span><span><b>${t('cart')}</b><small data-carttotal>${total}</small></span></a>
        <a class="iconbtn hicon-only cartbtn" href="cos.html" data-cartlink>${icon('cart', 'ico--lg')}<span class="count" data-cartcount>${cartCount()}</span></a>
        <button class="iconbtn menubtn" type="button" aria-label="${t('menu')}" aria-expanded="false" aria-controls="drawer" data-open-drawer>${icon('menu', 'ico--lg')}</button>
      </div>
    </div>
    <nav class="mainnav" aria-label="${t('shop')}"><div class="wrap">
      ${NAV.map(([k, ic, href, id]) => `<a class="nav-i" href="${href}" ${cur === id ? 'aria-current="page"' : ''}>${icon(ic)}${t(k)}</a>`).join('')}
      <span data-garage>${garageChip()}</span>
    </div></nav>
  </header>
  <div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="${t('menu')}" hidden>
    <div class="drawer__panel">
      <div class="drawer__head"><img src="${img('bonbila-logo.png')}" alt="Bonbila Auto" width="115" height="34"><button class="iconbtn" type="button" data-close-drawer aria-label="${t('close')}">${icon('close', 'ico--lg')}</button></div>
      <div class="drawer__nav">${NAV.map(([k, ic, href]) => `<a href="${href}">${icon(ic, 'ico--lg')}${t(k)}${icon('right')}</a>`).join('')}
        <a href="${garage ? link('categorie.html', { vehicle_type: garage.type || 'wipers', vehicle_make: garage.make, vehicle_model: garage.model, vehicle_generation: garage.slug }) : 'index.html#finder'}">${icon('car', 'ico--lg')}${garage ? esc(carLabel(garage)) : t('chooseCar')}${icon('right')}</a>
      </div>
      <div class="drawer__foot">
        ${langSwitch()}
        <a href="tel:+40771147147" class="row">${icon('phone')}<b>${t('phone')}</b></a>
        <a href="mailto:${t('email')}" class="row">${icon('mail')}${t('email')}</a>
      </div>
    </div>
  </div>
  <div class="toast" role="status" aria-live="polite" data-toast></div>`;
}

function searchBox() {
  return `<form class="search" role="search" action="categorie.html" data-search>
    <label class="sr-only" for="q">${t('searchLabel')}</label>
    <div class="search__box">${icon('search')}
      <input id="q" name="q" type="search" placeholder="${t('searchPh')}" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="suggest" aria-autocomplete="list" value="${esc(params.get('q') || '')}">
      <button class="search__btn" type="submit" aria-label="${t('searchBtn')}">${icon('search', 'ico--sm')}<span>${t('searchBtn')}</span></button>
    </div>
    <div class="suggest" id="suggest" role="listbox" aria-label="${t('searchLabel')}" hidden></div>
  </form>`;
}

function footer() {
  return `<footer class="footer" id="contact">
    <div class="wrap footer__top">
      <div class="footer__brand">
        <img src="${img('bonbila-logo.png')}" alt="Bonbila Auto" width="149" height="44" loading="lazy">
        <p>${t('footAbout')}</p>
        <div class="footer__contact">
          <a href="tel:+40771147147">${icon('phone')}${t('phone')}</a>
          <a href="tel:+40771148148">${icon('phone')}${t('phone2')}</a>
          <a href="mailto:${t('email')}">${icon('mail')}${t('email')}</a>
          <span>${icon('pin')}${t('address')}</span>
        </div>
      </div>
      <div><h3>${t('footInfo')}</h3><ul><li><a href="#">${t('fAbout')}</a></li><li><a href="#">${t('fPrivacy')}</a></li><li><a href="#">${t('fTerms')}</a></li><li><a href="#">${t('fCookies')}</a></li><li><a href="index.html#guides">${t('navGuides')}</a></li></ul></div>
      <div><h3>${t('footOrders')}</h3><ul><li><a href="#">${t('fShip')}</a></li><li><a href="#">${t('fPay')}</a></li><li><a href="#">${t('fReturn')}</a></li><li><a href="#account">${t('fAccount')}</a></li><li><a href="index.html#request">${t('navParts')}</a></li></ul></div>
      <div><h3>${t('language')}</h3>${langSwitch()}
        <div class="footer__pay" aria-label="${t('fPay')}"><span class="paymark">VISA</span><span class="paymark">Mastercard</span><span class="paymark">Apple Pay</span><span class="paymark">Google Pay</span><span class="paymark">${LANG === 'de' ? 'Nachnahme' : 'Ramburs'}</span></div>
        <div class="footer__legal mt16"><a href="https://anpc.ro/ce-este-sal/" rel="noopener">${t('anpc')}</a><a href="https://ec.europa.eu/consumers/odr" rel="noopener">${t('sol')}</a></div>
      </div>
    </div>
    <div class="wrap footer__bottom"><span>${t('rights')}</span><span>${t('odbl', { a: '<a href="https://github.com/gor3a/vehicle-makes-models" rel="noopener">vehicle-makes-models</a>' })}</span></div>
  </footer>`;
}

/* ---------- product card ---------- */
function card(p, opt = {}) {
  const c = opt.car;
  const sale = p.reg > p.price, pct = sale ? Math.round((1 - p.price / p.reg) * 100) : 0;
  const out = p.stock === 'out';
  const nm = esc(pname(p));
  const fit = c && p.fits.length && fitsCar(p, c) ? `<span class="pcard__fit">${icon('check')}${esc(t('fitsOn', { car: carLabel(c) }))}</span>` : '';
  return `<article class="pcard">
    <div class="pcard__img"><img src="${img(p.imgs[0])}" alt="" width="600" height="600" loading="lazy" decoding="async">
      <div class="pcard__tags">${sale ? `<span class="badge badge--sale">−${pct}%</span>` : ''}${p.attrs.tech === 'LED' ? '<span class="badge badge--brand">LED</span>' : ''}</div></div>
    <button class="iconbtn iconbtn--white pcard__fav" type="button" data-fav="${p.id}" aria-pressed="${wished(p.id)}" aria-label="${t('fav')}: ${nm}">${icon('heart')}</button>
    <div class="pcard__body">
      <span class="pcard__brand">${esc(p.brand)}</span>
      <a class="pcard__name" href="${link('produs.html', { id: p.id })}">${nm}</a>
      <span class="pcard__sku">${t('code')}: ${esc(p.sku)}</span>
      ${fit}
      <span class="stock stock--${p.stock}">${t('st_' + p.stock)}</span>
      <div class="pcard__foot">
        <span class="price${sale ? ' price--sale' : ''}">${sale ? `<del><span class="sr-only">${LANG === 'de' ? 'Alter Preis' : 'Preț inițial'}: </span>${money(p.reg)}</del>` : ''}${priceHTML(p.price)}</span>
        ${out ? `<a class="addbtn addbtn--ghost" href="${link('produs.html', { id: p.id })}" aria-label="${t('view')}: ${nm}">${icon('arrow')}</a>`
              : `<button class="addbtn" type="button" data-add="${p.id}" aria-label="${t('add')}: ${nm}">${icon('cart')}</button>`}
      </div>
    </div>
  </article>`;
}

/* ---------- vehicle finder (home hero + category bar) ---------- */
function brandCombo(id, make) {
  return `<div class="combo" data-combo="${id}">
    <button class="combo__btn" type="button" id="${id}-btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}-lbl ${id}-btn">
      ${make ? logo(make) + `<span>${esc(make)}</span>` : `<span class="ph">${t('brandPh')}</span>`}</button>
    <div class="combo__pop" hidden>
      <div class="search__box">${icon('search', 'ico--sm')}<input type="text" role="combobox" aria-expanded="true" aria-controls="${id}-list" aria-autocomplete="list" placeholder="${t('brandSearch')}" aria-label="${t('brandSearch')}" autocomplete="off"></div>
      <div class="combo__list" id="${id}-list" role="listbox" aria-label="${t('brandPh')}"></div>
    </div>
    <input type="hidden" name="vehicle_make" value="${esc(make || '')}">
  </div>`;
}
function modelOptions(make, type, model) {
  const ms = make ? modelsFor(make, type) : [];
  return `<option value="">${t('modelPh')}</option>` + ms.map(m => `<option ${m === model ? 'selected' : ''}>${esc(m)}</option>`).join('');
}
function finderHome() {
  const type = 'wipers';
  const pop = D.popular.slice(0, 8);
  return `<div class="finder" id="finder" data-finder data-type="${type}">
    <div class="tabs" role="tablist" aria-label="${t('finderTabs')}">
      <button role="tab" type="button" aria-selected="true" data-type="wipers">${icon('wiper')}${t('tabWipers')}</button>
      <button role="tab" type="button" aria-selected="false" data-type="bulbs">${icon('bulb')}${t('tabBulbs')}</button>
    </div>
    <div class="finder__step">
      <div class="finder__label"><span id="hf-lbl"><span class="num">1</span>${t('step1')}</span></div>
      <div class="logos" role="group" aria-labelledby="hf-lbl">${pop.map(m => `<button type="button" data-pick="${esc(m)}" aria-pressed="false">${logo(m)}<span>${esc(m === 'Mercedes-Benz' ? 'Mercedes' : m === 'Volkswagen' ? 'VW' : m)}</span></button>`).join('')}</div>
      <div class="finder__fields">
        ${brandCombo('hf', '')}
        <div class="field"><label class="sr-only" for="hf-model">${t('step2')}</label>
          <div class="selwrap" data-modelwrap><select class="select" id="hf-model" name="vehicle_model" disabled aria-describedby="hf-err">${modelOptions('', type)}</select></div></div>
      </div>
    </div>
    <button class="btn btn--primary btn--lg btn--block" type="button" data-go>${t('pickCar')} ${icon('arrow')}</button>
    <p class="ferr finder__err" id="hf-err" role="alert" hidden>${t('needBrandModel')}</p>
    ${garage ? `<div class="lastcar">${logo(garage.make)}<div><small>${t('lastCar')}</small><b>${esc(carLabel(garage))}</b> <span class="muted">${esc(carYears(garage))}</span></div>
      <a class="btn btn--dark btn--sm" href="${link('categorie.html', { vehicle_type: garage.type || 'wipers', vehicle_make: garage.make, vehicle_model: garage.model, vehicle_generation: garage.slug })}">${t('seeProducts')}</a></div>` : ''}
  </div>`;
}

function bindCombo(root, onPick) {
  const btn = qs('.combo__btn', root), pop = qs('.combo__pop', root), inp = qs('input[type=text]', pop), list = qs('[role=listbox]', pop), hidden = qs('input[type=hidden]', root);
  const id = root.dataset.combo;
  let items = [], active = -1;
  const render = () => {
    const q = norm(inp.value);
    const all = D.brands.map(b => b.n);
    let html = '', idx = 0; items = [];
    const opt = m => { items.push(m); return `<div role="option" id="${id}-o${idx}" data-i="${idx++}" aria-selected="false" class="${m === hidden.value ? 'is-current' : ''}">${logo(m)}<span>${esc(m)}</span></div>`; };
    if (!q) {
      html += `<div class="grp" role="presentation">${t('popular')}</div>` + D.popular.filter(m => all.includes(m)).map(opt).join('');
      html += `<div class="grp" role="presentation">${t('allBrandsGrp')}</div>` + all.map(opt).join('');
    } else {
      const res = all.filter(m => norm(m).includes(q)).sort((a, b) => norm(a).indexOf(q) - norm(b).indexOf(q));
      html = res.length ? res.map(opt).join('') : `<div class="combo__none">${t('noBrand')}</div>`;
    }
    list.innerHTML = html; active = -1; inp.removeAttribute('aria-activedescendant');
  };
  const open = () => { pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); inp.value = ''; render(); inp.focus(); document.addEventListener('pointerdown', outside, true); };
  const close = (focus = true) => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', outside, true); if (focus) btn.focus(); };
  const outside = e => { if (!root.contains(e.target)) close(false); };
  const setActive = i => { const opts = qsa('[role=option]', list); if (!opts.length) return; active = (i + opts.length) % opts.length; opts.forEach((o, k) => o.setAttribute('aria-selected', k === active)); inp.setAttribute('aria-activedescendant', opts[active].id); opts[active].scrollIntoView({ block: 'nearest' }); };
  const choose = m => { hidden.value = m; btn.innerHTML = logo(m) + `<span>${esc(m)}</span>`; close(); onPick(m); };
  btn.addEventListener('click', () => pop.hidden ? open() : close());
  inp.addEventListener('input', render);
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); const i = active >= 0 ? active : (items.length === 1 ? 0 : -1); if (i >= 0) choose(items[i]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') close(false);
  });
  list.addEventListener('click', e => { const o = e.target.closest('[role=option]'); if (o) choose(items[+o.dataset.i]); });
  return { set: m => { hidden.value = m || ''; btn.innerHTML = m ? logo(m) + `<span>${esc(m)}</span>` : `<span class="ph">${t('brandPh')}</span>`; }, get: () => hidden.value };
}

function bindFinder(root, opts = {}) {
  if (!root) return;
  let type = root.dataset.type || 'wipers';
  const sel = qs('select[name=vehicle_model]', root), wrap = qs('[data-modelwrap]', root), err = qs('.finder__err', root), yearSel = qs('select[name=vehicle_year]', root);
  const combo = bindCombo(qs('[data-combo]', root), m => setMake(m, true));
  const setMake = (m, focusModel) => {
    combo.set(m);
    qsa('[data-pick]', root).forEach(b => b.setAttribute('aria-pressed', b.dataset.pick === m));
    sel.innerHTML = modelOptions(m, type); sel.disabled = !m;
    const old = qs('.blogo', wrap); if (old) old.remove();
    if (m) wrap.insertAdjacentHTML('afterbegin', logo(m));
    if (yearSel) { yearSel.innerHTML = `<option value="">${t('yearPh')}</option>`; yearSel.disabled = true; }
    if (err) err.hidden = true;
    if (focusModel && m) sel.focus();
  };
  sel.addEventListener('change', () => {
    if (err) err.hidden = true;
    if (yearSel) {
      const [a, b] = modelYears(combo.get(), sel.value);
      yearSel.innerHTML = `<option value="">${t('yearPh')}</option>` + Array.from({ length: b - a + 1 }, (_, i) => b - i).map(y => `<option>${y}</option>`).join('');
      yearSel.disabled = !sel.value;
    }
  });
  qsa('[data-pick]', root).forEach(b => b.addEventListener('click', () => setMake(b.dataset.pick, true)));
  qsa('[role=tab]', root).forEach(tab => tab.addEventListener('click', () => {
    type = tab.dataset.type; root.dataset.type = type;
    qsa('[role=tab]', root).forEach(x => x.setAttribute('aria-selected', x === tab));
    const m = combo.get(), cur = sel.value; sel.innerHTML = modelOptions(m, type, cur);
  }));
  qsa('[role=tab]', root).forEach((tab, i, all) => tab.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length]; n.focus(); n.click(); }
  }));
  qs('[data-go]', root).addEventListener('click', () => {
    const make = combo.get(), model = sel.value;
    if (!make || !model) { err.hidden = false; (make ? sel : qs('.combo__btn', root)).setAttribute('aria-invalid', 'true'); (make ? sel : qs('.combo__btn', root)).focus(); return; }
    const year = yearSel && yearSel.value ? +yearSel.value : null;
    const gens = D.gens[make + '|' + model] || [];
    if (year && gens.length) {
      const hit = gens.filter(g => year >= g.from && year <= (g.to || YEAR_NOW));
      if (hit.length === 1) { location.href = link('categorie.html', { vehicle_type: type, vehicle_make: make, vehicle_model: model, vehicle_generation: hit[0].slug }); return; }
    }
    location.href = link('masini.html', { vehicle_make: make, vehicle_model: model, vehicle_type: type, year });
  });
  if (opts.make) { setMake(opts.make, false); }
  return { setMake };
}

/* ---------- search suggestions (logos for cars) ---------- */
function bindSearch() {
  const form = qs('[data-search]'); if (!form) return;
  const inp = qs('input', form), box = qs('#suggest', form);
  let active = -1, timer;
  const hl = (s, q) => { const i = norm(s).indexOf(q); return i < 0 || !q ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + q.length)) + '</mark>' + esc(s.slice(i + q.length)); };
  const run = () => {
    const raw = inp.value.trim(), q = norm(raw);
    if (q.length < 2) { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); return; }
    const cars = [];
    D.brands.forEach(b => { if (norm(b.n).startsWith(q) || norm(b.n) === q) cars.push({ make: b.n, model: null }); });
    Object.entries(D.models).forEach(([mk, ms]) => ms.forEach(m => { const full = norm(mk + ' ' + m[0]); if (norm(m[0]).startsWith(q) || full.startsWith(q) || (q.includes(' ') && full.includes(q))) cars.push({ make: mk, model: m[0] }); }));
    const carsTop = cars.sort((a, b) => (a.model ? 1 : 0) - (b.model ? 1 : 0) || (D.gens[b.make + '|' + b.model] ? 1 : 0) - (D.gens[a.make + '|' + a.model] ? 1 : 0)).slice(0, 5);
    const prods = PRODUCTS.filter(p => norm(pname(p) + ' ' + p.sku + ' ' + p.brand).includes(q)).slice(0, 5);
    let n = 0, html = '';
    if (carsTop.length) html += `<div role="group" aria-label="${t('sCars')}"><h3 aria-hidden="true">${t('sCars')}</h3>` + carsTop.map(c => {
      const href = c.model ? link('masini.html', { vehicle_make: c.make, vehicle_model: c.model, vehicle_type: 'wipers' }) : link('categorie.html', { vehicle_type: 'wipers', vehicle_make: c.make });
      return `<a role="option" id="sg${n++}" href="${href}" aria-selected="false"><span class="s-thumb" style="background:#fff;border:1px solid var(--line)">${logo(c.make)}</span><span class="s-main"><b>${hl(c.model ? c.make + ' ' + c.model : c.make, q)}</b><small>${c.model ? t('sCarHint') : t('sBrandHint')}</small></span>${icon('right')}</a>`;
    }).join('') + '</div>';
    if (prods.length) html += `<div role="group" aria-label="${t('sProducts')}"><h3 aria-hidden="true">${t('sProducts')}</h3>` + prods.map(p => `<a role="option" id="sg${n++}" href="${link('produs.html', { id: p.id })}" aria-selected="false"><span class="s-thumb"><img src="${img(p.imgs[0])}" alt="" width="44" height="44" loading="lazy"></span><span class="s-main"><b>${hl(pname(p), q)}</b><small>${t('code')}: ${esc(p.sku)}</small></span><span class="s-price">${money(p.price)}</span></a>`).join('') + '</div>';
    if (!html) html = `<p class="s-empty">${esc(t('sNone', { q: raw }))}</p>`;
    html += `<a role="option" id="sg${n++}" class="s-all" href="${link('categorie.html', { q: raw })}" aria-selected="false">${esc(t('sAll', { q: raw }))} ${icon('arrow', 'ico--sm')}</a>`;
    box.innerHTML = html; box.hidden = false; inp.setAttribute('aria-expanded', 'true'); active = -1; inp.removeAttribute('aria-activedescendant');
  };
  inp.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 90); });
  inp.addEventListener('focus', run);
  inp.addEventListener('keydown', e => {
    const opts = qsa('[role=option]', box);
    if (box.hidden || !opts.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; opts.forEach((o, i) => o.setAttribute('aria-selected', i === active)); inp.setAttribute('aria-activedescendant', opts[active].id); opts[active].scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); location.href = opts[active].getAttribute('href'); }
    else if (e.key === 'Escape') { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('pointerdown', e => { if (!form.contains(e.target)) { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); } });
}

/* ---------- toast / cart ui ---------- */
function toast(msg, ic = 'checkc') { const el = qs('[data-toast]'); if (!el) return; el.innerHTML = icon(ic) + esc(msg); el.classList.add('is-on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('is-on'), 2600); }
function updateCartUI() {
  qsa('[data-cartcount]').forEach(e => e.textContent = cartCount());
  qsa('[data-carttotal]').forEach(e => e.textContent = money(cartTotal()));
  qsa('[data-cartlink]').forEach(a => a.setAttribute('aria-label', `${t('cart')}: ${cartCount()} – ${money(cartTotal())}`));
}
function addToCart(p, qty, car) {
  const key = p.id + '|' + (car ? norm(car.make + ' ' + (car.gen || car.model) + ' ' + (car.year || '')).replace(/ /g, '-') : 'none');
  const ex = cart.find(l => l.key === key);
  if (ex) ex.qty += qty; else cart.push({ key, id: p.id, qty, car: car || null });
  saveCart();
}

/* ---------- modal helper (focus trap, Esc, return focus) ---------- */
let modalReturn = null;
function openModal(html, onReady) {
  let m = qs('#modal');
  if (!m) { document.body.insertAdjacentHTML('beforeend', '<div class="modal" id="modal" hidden><div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-title"></div></div>'); m = qs('#modal');
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
    m.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      if (e.key === 'Tab') { const f = qsa('button:not([disabled]),[href],input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea,summary,[tabindex]:not([tabindex="-1"])', m).filter(x => x.offsetParent !== null); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
  }
  modalReturn = document.activeElement;
  qs('.modal__panel', m).innerHTML = html;
  m.hidden = false; document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => m.classList.add('is-open'));
  onReady && onReady(qs('.modal__panel', m));
}
function closeModal() {
  const m = qs('#modal'); if (!m) return;
  m.classList.remove('is-open'); document.body.style.overflow = '';
  setTimeout(() => { m.hidden = true; }, 250);
  if (modalReturn && document.contains(modalReturn)) modalReturn.focus();
}

/* ---------- vehicle confirmation (their bonbila-vehicle-confirmation / .bbvc-*) ---------- */
function confirmVehicle(p, { qty = 1, editKey = null } = {}) {
  const line = editKey ? cart.find(l => l.key === editKey) : null;
  let c = line && line.car ? { ...line.car } : (garage ? { ...garage } : (p.fits[0] ? { make: p.fits[0].make, model: p.fits[0].model, gen: p.fits[0].gen } : {}));
  const genObj = c.make && c.model ? findGen(c.make, c.model, c.gen) : null;
  if (genObj) { c.from = genObj.from; c.to = genObj.to; c.slug = genObj.slug; }
  const makes = D.brands.map(b => b.n);
  const html = `
    <div class="modal__head"><div><h2 id="modal-title">${editKey ? t('editCar') : t('cfTitle')}</h2><p>${t('cfLead')}</p></div>
      <button class="iconbtn iconbtn--line" type="button" data-x aria-label="${t('close')}">${icon('close')}</button></div>
    <form class="bbvc-form" novalidate>
      <div class="modal__body">
        <div class="modal__product"><span class="s-thumb"><img src="${img(p.imgs[0])}" alt="" width="56" height="56"></span><div><b>${esc(pname(p))}</b><small>${t('code')}: ${esc(p.sku)}${qty > 1 ? ` · ${qty} ${t('piece')}` : ''}</small></div></div>
        <div class="grid2">
          <div class="field"><label for="cf-make">${t('cfMake')} <span class="req" aria-hidden="true">*</span></label>
            <div class="selwrap" data-lw>${c.make ? logo(c.make) : ''}<select class="select" id="cf-make" required aria-describedby="cf-make-e"><option value="">${t('cfChooseMake')}</option>${makes.map(m => `<option ${m === c.make ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></div>
            <span class="ferr" id="cf-make-e" hidden>${t('cfFill')}</span></div>
          <div class="field"><label for="cf-model">${t('cfModel')} <span class="req" aria-hidden="true">*</span></label>
            <select class="select" id="cf-model" required aria-describedby="cf-model-e"></select><span class="ferr" id="cf-model-e" hidden>${t('cfFill')}</span></div>
          <div class="field"><label for="cf-gen">${t('cfGen')} <span class="req" aria-hidden="true">*</span></label>
            <select class="select" id="cf-gen" required aria-describedby="cf-gen-e"></select><span class="ferr" id="cf-gen-e" hidden>${t('cfFill')}</span></div>
          <div class="field"><label for="cf-year">${t('cfYear')} <span class="req" aria-hidden="true">*</span></label>
            <select class="select" id="cf-year" required aria-describedby="cf-year-e"></select><span class="ferr" id="cf-year-e" hidden>${t('cfFill')}</span></div>
        </div>
        <div class="notice" data-mismatch hidden style="background:var(--bad-soft);color:var(--bad)">${icon('alert')}<span>${t('cfMismatch')}</span></div>
        <details class="optional" ${c.vin || c.photo ? 'open' : ''}>
          <summary>${icon('doc')}<span>${t('cfOptional')}<small>${t('cfOptionalD')}</small></span>${icon('plus')}</summary>
          <div class="optional__body">
            <div class="field"><label for="cf-vin">${t('cfVin')}</label><input class="input" id="cf-vin" maxlength="17" autocapitalize="characters" spellcheck="false" value="${esc(c.vin || '')}" aria-describedby="cf-vin-h cf-vin-e" placeholder="WF0AXXWPMAFJ48210" style="text-transform:uppercase;letter-spacing:.06em">
              <span class="fhelp" id="cf-vin-h">${t('cfVinHelp')}</span><span class="ferr" id="cf-vin-e" hidden>${t('cfVinErr')}</span></div>
            <div class="field"><span class="flabel">${t('cfPhoto')}</span>
              <div class="upload">
                <label class="btn btn--soft btn--sm mob">${icon('camera', 'ico--sm')}${t('cfShoot')}<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" data-photo></label>
                <label class="btn btn--soft btn--sm">${icon('upload', 'ico--sm')}${t('cfUpload')}<input type="file" accept="image/jpeg,image/png,image/webp" data-photo></label>
              </div>
              <div class="filepill" data-file ${c.photo ? '' : 'hidden'}>${icon('doc', 'ico--sm')}<span>${esc(c.photo || '')}</span><button class="iconbtn" type="button" data-rmphoto aria-label="${t('cfRemovePhoto')}">${icon('close', 'ico--sm')}</button></div>
              <span class="fhelp">${t('cfPhotoHelp')}</span></div>
          </div>
        </details>
        <p class="privacy">${icon('lock')}<span>${t('cfPrivacy')} ${t('cfRequired')}</span></p>
      </div>
      <div class="modal__foot">
        <button class="btn btn--primary btn--lg btn--block" type="submit">${editKey ? t('cfSave') : t('cfSubmit')}</button>
        <button class="btn btn--ghost btn--block" type="button" data-x>${t('cfCancel')}</button>
      </div>
    </form>`;
  openModal(html, panel => {
    const f = n => qs('#cf-' + n, panel);
    let photo = c.photo || '';
    const fillModels = () => { const ms = f('make').value ? modelsFor(f('make').value, p.type) : []; f('model').innerHTML = `<option value="">${t('cfChooseModel')}</option>` + ms.map(m => `<option ${m === c.model ? 'selected' : ''}>${esc(m)}</option>`).join(''); f('model').disabled = !ms.length; };
    const fillGens = () => {
      const mk = f('make').value, md = f('model').value, gens = D.gens[mk + '|' + md];
      if (!md) { f('gen').innerHTML = `<option value="">${t('cfChooseGen')}</option>`; f('gen').disabled = true; return; }
      if (gens) f('gen').innerHTML = `<option value="">${t('cfChooseGen')}</option>` + gens.map(g => `<option value="${esc(g.slug)}" ${g.name === c.gen ? 'selected' : ''}>${esc(g.name.replace(/ - /g, ' '))} (${yearsLabel(g.from, g.to)})</option>`).join('');
      else { const [a, b] = modelYears(mk, md); f('gen').innerHTML = `<option value="all" selected>${esc(md)} (${yearsLabel(a, b >= YEAR_NOW ? null : b)})</option>`; }
      f('gen').disabled = false;
    };
    const fillYears = () => {
      const mk = f('make').value, md = f('model').value, gs = f('gen').value; let a, b;
      const g = (D.gens[mk + '|' + md] || []).find(x => x.slug === gs);
      if (g) { a = g.from; b = g.to || YEAR_NOW; } else if (gs === 'all') { [a, b] = modelYears(mk, md); } else { f('year').innerHTML = `<option value="">${t('cfChooseYear')}</option>`; f('year').disabled = true; return; }
      f('year').innerHTML = `<option value="">${t('cfChooseYear')}</option>` + Array.from({ length: b - a + 1 }, (_, i) => b - i).map(y => `<option ${y === c.year ? 'selected' : ''}>${y}</option>`).join('');
      f('year').disabled = false;
    };
    const checkMismatch = () => {
      const mk = f('make').value, md = f('model').value, g = (D.gens[mk + '|' + md] || []).find(x => x.slug === f('gen').value);
      const bad = p.fits.length && mk && md && f('gen').value && !fitsCar(p, { make: mk, model: md, gen: g ? g.name : null });
      qs('[data-mismatch]', panel).hidden = !bad; return bad;
    };
    fillModels(); fillGens(); fillYears();
    f('make').addEventListener('change', () => { const w = qs('[data-lw]', panel); const o = qs('.blogo', w); if (o) o.remove(); if (f('make').value) w.insertAdjacentHTML('afterbegin', logo(f('make').value)); c.model = null; c.gen = null; fillModels(); fillGens(); fillYears(); checkMismatch(); });
    f('model').addEventListener('change', () => { c.gen = null; fillGens(); fillYears(); checkMismatch(); });
    f('gen').addEventListener('change', () => { fillYears(); checkMismatch(); });
    qsa('[data-photo]', panel).forEach(inp => inp.addEventListener('change', () => { const file = inp.files[0]; if (!file) return; photo = file.name; const pill = qs('[data-file]', panel); qs('span', pill).textContent = file.name; pill.hidden = false; }));
    qs('[data-rmphoto]', panel).addEventListener('click', () => { photo = ''; qs('[data-file]', panel).hidden = true; });
    qsa('[data-x]', panel).forEach(b => b.addEventListener('click', closeModal));
    checkMismatch();
    qs('form', panel).addEventListener('submit', e => {
      e.preventDefault();
      let first = null;
      ['make', 'model', 'gen', 'year'].forEach(n => { const ok = !!f(n).value; f(n).setAttribute('aria-invalid', !ok); qs('#cf-' + n + '-e', panel).hidden = ok; if (!ok && !first) first = f(n); });
      const vin = f('vin').value.trim().toUpperCase();
      const vinOk = !vin || /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
      f('vin').setAttribute('aria-invalid', !vinOk); qs('#cf-vin-e', panel).hidden = vinOk; if (!vinOk && !first) first = f('vin');
      if (first) { first.focus(); return; }
      if (checkMismatch()) { qs('[data-mismatch]', panel).scrollIntoView({ block: 'center' }); return; }
      const mk = f('make').value, md = f('model').value, g = (D.gens[mk + '|' + md] || []).find(x => x.slug === f('gen').value);
      const [ya, yb] = modelYears(mk, md);
      const car = { make: mk, model: md, gen: g ? g.name : null, slug: g ? g.slug : null, from: g ? g.from : ya, to: g ? g.to : (yb >= YEAR_NOW ? null : yb), year: +f('year').value, vin: vin || undefined, photo: photo || undefined, type: p.type };
      saveGarage({ make: car.make, model: car.model, gen: car.gen, slug: car.slug, from: car.from, to: car.to, type: p.type });
      if (editKey) { const l = cart.find(x => x.key === editKey); if (l) l.car = car; saveCart(); closeModal(); toast(t('cfSaved')); if (PAGE === 'cart') renderCart(); refreshGarage(); return; }
      addToCart(p, qty, car); refreshGarage();
      panel.innerHTML = `<div class="success"><span class="success__ico">${icon('check')}</span><h2 id="modal-title" tabindex="-1">${t('cfAdded')}</h2>
        <span class="carline">${logo(car.make)}${esc(carLabel(car))} · ${car.year}</span><p>${t('cfAddedD')}</p></div>
        <div class="modal__foot" style="position:static"><a class="btn btn--primary btn--lg btn--block" href="cos.html">${t('cfViewCart')} ${icon('arrow')}</a><button class="btn btn--ghost btn--block" type="button" data-x>${t('cfContinue')}</button></div>`;
      qs('[data-x]', panel).addEventListener('click', closeModal); qs('#modal-title', panel).focus();
    });
    setTimeout(() => (f('make').value ? (f('year').value ? qs('button[type=submit]', panel) : f('year').disabled ? f('model') : f('year')) : f('make')).focus(), 60);
  });
}

function handleAdd(id, qty = 1, opener) {
  const p = byId(id); if (!p) return;
  if (p.type === 'wipers') { confirmVehicle(p, { qty }); return; }
  addToCart(p, qty, garage ? { ...garage, year: undefined } : null);
  toast(`${t('toastAdded')} · ${money(cartTotal())}`);
  if (opener) { opener.animate([{ transform: 'scale(1)' }, { transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 260 }); }
}
function refreshGarage() { const g = qs('[data-garage]'); if (g) g.innerHTML = garageChip(); }

/* ======================================================================
   PAGES
   ====================================================================== */
function pageHome() {
  const pop = [2172, 47, 1554, 56, 1282, 59, 12342 && 53, 1571].map(byId).filter(Boolean).slice(0, 8);
  const brandWall = D.popular.slice(0, 16);
  const cats = [
    ['catWipers', 'catWipersD', 'stergatoare-auto-v1', link('categorie.html', { vehicle_type: 'wipers' }), '1.400+'],
    ['catHalogen', 'catHalogenD', 'bec-halogen-h7-v1', link('categorie.html', { vehicle_type: 'bulbs', tech: 'Halogen' }), ''],
    ['catLed', 'catLedD', 'bec-led-h7-v1', link('categorie.html', { vehicle_type: 'bulbs', tech: 'LED' }), ''],
    ['catParts', 'catPartsD', 'disc-frana-etrier-v1', '#request', t('request')],
  ];
  return `
  <section class="hero"><div class="wrap hero__grid">
    <div>
      <span class="eyebrow">Bonbila Auto</span>
      <h1 class="mt16">${t('heroTitle')}</h1>
      <p class="hero__lead">${t('heroLead')}</p>
      ${finderHome()}
    </div>
    <div class="hero__media" aria-hidden="true">
      <picture><source media="(min-width:1400px)" srcset="${img('hero-night-car.webp')}"><img src="${img('hero-night-car-800.webp')}" srcset="${img('hero-night-car-800.webp')} 800w, ${img('hero-night-car.webp')} 1600w" sizes="(min-width:1000px) 48vw, 100vw" alt="" width="1600" height="1067" fetchpriority="high"></picture>
      <div class="hero__float"><span class="badge">${icon('check', 'ico--sm')}${t('floatFit')}</span><span class="badge">${icon('shield', 'ico--sm')}${t('floatLed')}</span></div>
      <div class="hero__stats"><div class="stat"><b>1.400+</b><span>${t('statWipers')}</span></div><div class="stat"><b>${D.brands.length}</b><span>${t('statBrands')}</span></div><div class="stat"><b>14</b><span>${t('statReturn')}</span></div></div>
    </div>
  </div></section>

  <section class="section section--tight" aria-labelledby="cats-h"><div class="wrap">
    <div class="shead"><div><h2 id="cats-h">${t('catsTitle')}</h2><p>${t('catsLead')}</p></div></div>
    <div class="cats">${cats.map(([h, d, im, href, cnt]) => `<a class="cat" href="${href}">${cnt ? `<span class="cat__count">${cnt}${cnt === t('request') ? '' : (LANG === 'ro' ? ' de ' : ' ') + t('products')}</span>` : ''}
      <span class="cat__img"><img src="${img('cat/' + im + '.webp')}" alt="" width="720" height="480" loading="lazy"></span>
      <span class="cat__body"><span><h3>${t(h)}</h3><small>${t(d)}</small></span><span class="cat__go">${icon('arrow')}</span></span></a>`).join('')}</div>
  </div></section>

  <section class="section section--tight" aria-labelledby="how-h"><div class="wrap">
    <div class="shead"><div><span class="eyebrow">${t('howEyebrow')}</span><h2 id="how-h">${t('howTitle')}</h2></div></div>
    <ol class="steps">
      <li class="step"><span class="step__n">01<i>.</i></span><h3>${t('how1')}</h3><p>${t('how1d')}</p><span class="step__art">${['Dacia', 'Volkswagen', 'Ford'].map(m => logo(m, 'blogo--tile')).join('')}</span></li>
      <li class="step"><span class="step__n">02<i>.</i></span><h3>${t('how2')}</h3><p>${t('how2d')}</p><span class="step__art"><span class="badge">${icon('calendar', 'ico--sm')}2015</span><span class="badge">VIN</span></span></li>
      <li class="step"><span class="step__n">03<i>.</i></span><h3>${t('how3')}</h3><p>${t('how3d')}</p><span class="step__art"><span class="badge badge--ok">${icon('check', 'ico--sm')}OK</span></span></li>
    </ol>
  </div></section>

  <section class="section section--tight" aria-labelledby="pop-h"><div class="wrap">
    <div class="shead"><h2 id="pop-h">${t('popTitle')}</h2><a class="arrowlink" href="${link('categorie.html', { vehicle_type: 'wipers' })}">${t('popAll')} ${icon('arrow', 'ico--sm')}</a></div>
    <div class="rail">${pop.map(p => card(p, { car: garage })).join('')}</div>
  </div></section>

  <section class="section section--tight" aria-labelledby="brands-h"><div class="wrap">
    <div class="shead"><div><span class="eyebrow">${t('brandsEyebrow')}</span><h2 id="brands-h">${t('brandsTitle')}</h2><p>${t('brandsLead')}</p></div>
      <button class="btn btn--ghost" type="button" data-allbrands>${t('brandsAll', { n: D.brands.length })} ${icon('arrow', 'ico--sm')}</button></div>
    <div class="brandwall">${brandWall.map(m => `<a href="${link('categorie.html', { vehicle_type: 'wipers', vehicle_make: m })}" aria-label="${esc(m)}">${logo(m)}<span aria-hidden="true">${esc(m === 'Mercedes-Benz' ? 'Mercedes' : m)}</span></a>`).join('')}</div>
    <h3 class="mt32" style="font-size:20px;margin-bottom:14px">${t('makersTitle')}</h3>
    <div class="makers" aria-label="${t('makersTitle')}">${['BOSCH', 'OSRAM', 'PHILIPS', 'VALEO', 'HELLA', 'DENSO', 'SWF', 'TRICO', 'NEOLUX'].map(x => `<span>${x}</span>`).join('')}</div>
  </div></section>

  <section class="section section--tight" id="request" aria-labelledby="req-h"><div class="wrap"><div class="request">
    <div><span class="eyebrow">${t('reqEyebrow')}</span><h2 id="req-h" class="mt16">${t('reqTitle')}</h2><p>${t('reqLead')}</p></div>
    <form data-reqform novalidate>
      <div class="field"><label for="rq-vin">${t('reqVin')}</label><input class="input" id="rq-vin" maxlength="17" autocapitalize="characters" spellcheck="false" placeholder="WF0AXXWPMAFJ48210" aria-describedby="rq-vin-h" style="text-transform:uppercase"><span class="fhelp" id="rq-vin-h">${t('reqVinHelp')}</span></div>
      <div class="row2"><div class="field"><label for="rq-part">${t('reqPart')}</label><input class="input" id="rq-part" placeholder="${t('reqPartPh')}"></div>
      <div class="field"><label for="rq-tel">${t('reqPhone')}</label><input class="input" id="rq-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="07xx xxx xxx"></div></div>
      <button class="btn btn--primary btn--lg" type="submit">${t('reqSend')} ${icon('arrow')}</button>
    </form>
  </div></div></section>

  <section class="section section--tight" id="guides" aria-labelledby="guides-h"><div class="wrap">
    <div class="shead"><div><h2 id="guides-h">${t('guidesTitle')}</h2><p>${t('guidesLead')}</p></div><a class="arrowlink" href="#guides">${t('guidesAll')} ${icon('arrow', 'ico--sm')}</a></div>
    <div class="guides">${[['g1', 'bec-halogen-h7-v1'], ['g2', 'stergatoare-auto-v1'], ['g3', 'bec-led-h7-v1']].map(([k, im]) => `<a class="guide" href="#guides"><span class="guide__img"><img src="${img('cat/' + im + '.webp')}" alt="" loading="lazy" width="720" height="480"></span><div><h3>${t(k)}</h3><small>${t(k + 'm')}</small></div></a>`).join('')}</div>
    <p class="proto">${icon('info')}<span>${t('protoNote')}</span></p>
  </div></section>`;
}
function bindHome() {
  bindFinder(qs('[data-finder]'));
  const rf = qs('[data-reqform]'); rf && rf.addEventListener('submit', e => { e.preventDefault(); toast(t('reqSent')); rf.reset(); });
  const ab = qs('[data-allbrands]'); ab && ab.addEventListener('click', () => { const f = qs('#finder'); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => qs('.combo__btn', f).click(), 350); });
}

/* ---------- category ---------- */
const FILTERS = {
  wipers: [['maker', 'fMaker', p => p.brand], ['model', 'fModel', p => p.attrs.model], ['len1', 'fLen1', p => p.attrs.len1, 'chips'], ['len2', 'fLen2', p => p.attrs.len2, 'chips'], ['qty', 'fQty', p => p.attrs.qty], ['mount', 'fMount', p => p.attrs.mount, 'mounts']],
  bulbs: [['bulb', 'fBulb', p => p.attrs.bulb, 'chips'], ['tech', 'fTech', p => p.attrs.tech], ['maker', 'fMaker', p => p.brand], ['light', 'fLight', p => p.attrs.light, 'light']],
};
let CS = null; // category state
function catState() {
  const type = params.get('vehicle_type') || (params.get('q') ? 'all' : 'wipers');
  const make = params.get('vehicle_make'), model = params.get('vehicle_model'), slug = params.get('vehicle_generation');
  let car = null;
  if (make && model) {
    const g = slug ? findGen(make, model, slug) : null;
    const [ya, yb] = modelYears(make, model);
    car = { make, model, gen: g ? g.name : null, slug: g ? g.slug : null, from: g ? g.from : ya, to: g ? g.to : (yb >= YEAR_NOW ? null : yb), type: type === 'all' ? 'wipers' : type };
    saveGarage(car);
  }
  const sel = {};
  ['tech', 'maker', 'bulb'].forEach(k => { if (params.get(k)) sel[k] = new Set([params.get(k)]); });
  return { type, car, make: make && !model ? make : null, q: params.get('q') || '', sel, stock: false, pmin: '', pmax: '', sort: 'rec', view: store.get('bb_view', matchMedia('(max-width:639px)').matches ? 'list' : 'grid') };
}
function baseList() {
  let list = PRODUCTS.filter(p => CS.type === 'all' || p.type === CS.type);
  if (CS.q) { const q = norm(CS.q); list = list.filter(p => norm(pname(p) + ' ' + p.sku + ' ' + p.brand + ' ' + p.fits.map(f => f.make + ' ' + f.model + ' ' + f.gen).join(' ')).includes(q)); }
  if (CS.car && CS.type === 'wipers') list = list.filter(p => fitsCar(p, CS.car));
  return list;
}
function filtered(list) {
  const defs = FILTERS[CS.type] || [];
  let out = list.filter(p => (!CS.stock || p.stock === 'instock') && defs.every(([k, , get]) => !CS.sel[k] || !CS.sel[k].size || CS.sel[k].has(get(p))));
  if (CS.pmin !== '') out = out.filter(p => conv(p.price) >= +CS.pmin);
  if (CS.pmax !== '') out = out.filter(p => conv(p.price) <= +CS.pmax);
  const s = CS.sort;
  if (s === 'asc') out.sort((a, b) => a.price - b.price); else if (s === 'desc') out.sort((a, b) => b.price - a.price); else if (s === 'name') out.sort((a, b) => pname(a).localeCompare(pname(b)));
  return out;
}
const valLabel = (k, v) => k === 'mount' ? t('m_' + v) : k === 'light' ? t('l_' + v) : k === 'qty' ? String(v).replace('buc.', t('piece')) : v;
function filtersHTML(idp) {
  const base = baseList(), defs = FILTERS[CS.type] || [];
  const groups = defs.map(([k, label, get, kind], gi) => {
    const counts = new Map(); base.forEach(p => { const v = get(p); if (v) counts.set(v, (counts.get(v) || 0) + 1); });
    let vals = [...counts.keys()];
    if (k === 'mount') vals = Object.keys(MOUNTS);
    vals.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0) || String(a).localeCompare(String(b)));
    if (!vals.length) return '';
    const on = CS.sel[k] || new Set();
    let body;
    if (kind === 'chips') body = `<div class="fchips">${vals.map(v => `<button type="button" class="chip chip--plain" data-f="${k}" data-v="${esc(v)}" aria-pressed="${on.has(v)}">${esc(valLabel(k, v))}</button>`).join('')}</div>`;
    else if (kind === 'mounts') body = `<div class="mounts">${vals.map(v => `<label class="mount"><input type="checkbox" data-f="${k}" value="${v}" ${on.has(v) ? 'checked' : ''} ${counts.get(v) ? '' : 'disabled'}><svg viewBox="0 0 44 30" aria-hidden="true">${MOUNTS[v]}</svg>${t('m_' + v)}</label>`).join('')}</div>`;
    else body = vals.map(v => `<label class="check"><input type="checkbox" data-f="${k}" value="${esc(v)}" ${on.has(v) ? 'checked' : ''}>${esc(valLabel(k, v))}<span class="count">${counts.get(v)}</span></label>`).join('');
    return `<details class="fgroup" ${gi < 3 || on.size ? 'open' : ''}><summary>${t(label)}${on.size ? `<span class="sel">${on.size}</span>` : ''}${icon('down')}</summary><div class="fgroup__body">${body}</div></details>`;
  }).join('');
  return `<div class="filters__head"><h2>${t('filters')}</h2></div>
    <div class="fgroup"><div class="fgroup__body" style="padding-top:8px"><label class="switch">${t('onlyStock')}<input type="checkbox" role="switch" data-stock ${CS.stock ? 'checked' : ''}></label></div></div>
    ${groups}
    <details class="fgroup" ${CS.pmin || CS.pmax ? 'open' : ''}><summary>${t('fPrice')}${icon('down')}</summary><div class="fgroup__body"><div class="range">
      <div class="field"><label for="${idp}pmin" class="sr-only">${t('min')}</label><input class="input" id="${idp}pmin" inputmode="numeric" placeholder="${t('min')}" value="${esc(CS.pmin)}" data-pmin></div>
      <div class="field"><label for="${idp}pmax" class="sr-only">${t('max')}</label><input class="input" id="${idp}pmax" inputmode="numeric" placeholder="${t('max')}" value="${esc(CS.pmax)}" data-pmax></div></div></div></details>
    <button class="btn btn--ghost btn--block mt16" type="button" data-reset>${t('resetFilters')}</button>`;
}
function vbarHTML() {
  if (CS.car) {
    const g = CS.car.gen ? findGen(CS.car.make, CS.car.model, CS.car.gen) : null;
    return `<div class="vbar vbar--set"><div class="vbar__car">${g ? `<img class="car" src="${img('gens/' + g.img)}" alt="" width="120" height="80">` : ''}${logo(CS.car.make)}<div><small>${t('compatFor')}</small><b>${esc(carLabel(CS.car))}</b><small>${esc(carYears(CS.car))}</small></div></div>
      <div class="vbar__actions"><a class="btn btn--ghost btn--sm" href="${link('masini.html', { vehicle_make: CS.car.make, vehicle_model: CS.car.model, vehicle_type: CS.type })}">${icon('car', 'ico--sm')}${t('changeGen')}</a>
      <a class="btn btn--soft btn--sm" href="${link('categorie.html', { vehicle_type: CS.type })}" data-cleargarage-nav>${icon('close', 'ico--sm')}<span class="vb-t">${t('removeFilter')}</span></a></div></div>`;
  }
  return `<div class="vbar" data-finder data-type="${CS.type === 'all' ? 'wipers' : CS.type}"><p class="muted" style="font-size:14px">${t('vbarHint')}</p>
    <div class="vbar__fields">
      <div class="field"><span class="flabel" id="cf2-lbl">${t('brandPh')}</span>${brandCombo('cf2', '')}</div>
      <div class="field"><label class="flabel" for="cf2-model">${t('modelPh')}</label><div class="selwrap" data-modelwrap><select class="select" id="cf2-model" name="vehicle_model" disabled>${modelOptions('', CS.type)}</select></div></div>
      <div class="field"><label class="flabel" for="cf2-year">${t('yearPh')}</label><select class="select" id="cf2-year" name="vehicle_year" disabled><option value="">${t('yearPh')}</option></select></div>
      <button class="btn btn--primary btn--lg" type="button" data-go style="margin:0">${t('seeCompat')}</button>
    </div><p class="ferr finder__err" role="alert" hidden>${t('needBrandModel')}</p></div>`;
}
function pageCategory() {
  CS = catState();
  const title = CS.q ? t('searchTitle', { q: CS.q }) : CS.type === 'bulbs' ? t('bulbsTitle') : t('wipersTitle');
  const lead = CS.q ? '' : CS.type === 'bulbs' ? t('bulbsLead') : t('wipersLead');
  const quick = CS.type === 'wipers' ? [['', t('qAll')], ['Bosch', 'Bosch'], ['Valeo', 'Valeo'], ['SWF', 'SWF']] : CS.type === 'bulbs' ? [['H1'], ['H4'], ['H7'], ['H11'], ['W5W'], ['LED']] : [];
  // search: matching cars as chips
  let carChips = '';
  if (CS.q) {
    const q = norm(CS.q), hits = [];
    Object.entries(D.models).forEach(([mk, ms]) => ms.forEach(m => { const full = norm(mk + ' ' + m[0]); if (norm(m[0]) === q || full.includes(q) || norm(mk) === q) hits.push([mk, m[0]]); }));
    carChips = hits.slice(0, 10).map(([mk, md]) => `<a class="chip" href="${link('masini.html', { vehicle_make: mk, vehicle_model: md, vehicle_type: 'wipers' })}">${logo(mk)}${esc(mk + ' ' + md)}</a>`).join('');
  }
  return `<div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">${t('home')}</a>${icon('right')}<span aria-current="page">${esc(title)}</span></nav>
    <div class="phead"><h1>${esc(title)}</h1>${lead ? `<p>${lead}</p>` : ''}</div>
    ${CS.q ? '' : vbarHTML()}
    ${carChips ? `<div class="quick" aria-label="${t('sCars')}">${carChips}</div>` : ''}
    ${quick.length ? `<div class="quick" role="group" aria-label="${t('filters')}">${quick.map(([v, l]) => {
      const k = CS.type === 'wipers' ? 'maker' : (v === 'LED' ? 'tech' : 'bulb');
      const on = v ? !!(CS.sel[k] && CS.sel[k].has(v)) : !(CS.sel.maker && CS.sel.maker.size);
      return `<button type="button" class="chip chip--plain" data-quick="${k}" data-v="${esc(v)}" aria-pressed="${on}">${esc(l || v)}</button>`; }).join('')}</div>` : ''}
    <div class="shop">
      ${FILTERS[CS.type] ? `<aside class="filters" aria-label="${t('filters')}" data-filters="d">${filtersHTML('d')}</aside>` : '<div></div>'}
      <div>
        <div class="toolbar">
          <p class="toolbar__count" aria-live="polite" data-count></p>
          <label class="sr-only" for="sort">${t('sort')}</label>
          <select class="select" id="sort" data-sort><option value="rec">${t('sort')}: ${t('sortRec')}</option><option value="asc">${t('sortAsc')}</option><option value="desc">${t('sortDesc')}</option><option value="name">${t('sortName')}</option></select>
          <div class="viewtog" role="group" aria-label="View"><button type="button" data-view="grid" aria-label="${t('viewGrid')}" aria-pressed="${CS.view === 'grid'}">${icon('grid', 'ico--sm')}</button><button type="button" data-view="list" aria-label="${t('viewList')}" aria-pressed="${CS.view === 'list'}">${icon('list', 'ico--sm')}</button></div>
          <div class="actives" data-actives></div>
        </div>
        <div data-results></div>
      </div>
    </div>
  </div>
  <div class="mbar mbar--m" data-mbar>
    ${FILTERS[CS.type] ? `<button class="btn btn--dark" type="button" data-openfilters>${icon('filter', 'ico--sm')}${t('filters')} <span data-fcount></span></button>` : ''}
    <button class="btn btn--ghost" type="button" data-opensort>${icon('sort', 'ico--sm')}${t('sort')}</button>
  </div>
  <div class="sheet" id="fsheet" role="dialog" aria-modal="true" aria-labelledby="fsheet-h" hidden><div class="sheet__panel"><div class="sheet__grab" aria-hidden="true"></div>
    <div class="sheet__head"><h2 id="fsheet-h">${t('filters')}</h2><button class="iconbtn" type="button" data-closesheet aria-label="${t('close')}">${icon('close', 'ico--lg')}</button></div>
    <div class="sheet__body"><div class="filters" data-filters="m"></div></div>
    <div class="sheet__foot"><button class="btn btn--ghost" type="button" data-reset>${t('resetFilters')}</button><button class="btn btn--primary" type="button" data-closesheet data-showbtn></button></div></div></div>
  <div class="sheet" id="ssheet" role="dialog" aria-modal="true" aria-labelledby="ssheet-h" hidden><div class="sheet__panel"><div class="sheet__grab" aria-hidden="true"></div>
    <div class="sheet__head"><h2 id="ssheet-h">${t('sort')}</h2><button class="iconbtn" type="button" data-closesheet aria-label="${t('close')}">${icon('close', 'ico--lg')}</button></div>
    <div class="sheet__body"><div class="sortlist" role="radiogroup" aria-labelledby="ssheet-h">${[['rec', 'sortRec'], ['asc', 'sortAsc'], ['desc', 'sortDesc'], ['name', 'sortName']].map(([v, k]) => `<label class="check"><input type="radio" name="msort" value="${v}" ${CS.sort === v ? 'checked' : ''}>${t(k)}</label>`).join('')}</div>
      <p class="muted mt8" style="font-size:14px">${t('viewGrid')} / ${t('viewList')}</p><div class="viewtog mt8" role="group"><button type="button" data-view="grid" aria-label="${t('viewGrid')}" aria-pressed="${CS.view === 'grid'}">${icon('grid', 'ico--sm')}</button><button type="button" data-view="list" aria-label="${t('viewList')}" aria-pressed="${CS.view === 'list'}">${icon('list', 'ico--sm')}</button></div></div></div></div>`;
}
function renderResults() {
  const base = baseList(), list = filtered(base);
  const n = list.length;
  qs('[data-count]').textContent = nprod(n);
  const sb = qs('[data-showbtn]'); if (sb) sb.textContent = n === 1 ? t('show1') : t('showN', { n: nprod(n) });
  const active = [];
  Object.entries(CS.sel).forEach(([k, set]) => set.forEach(v => active.push(`<button type="button" class="chip chip--plain" data-rm="${k}" data-v="${esc(v)}">${esc(valLabel(k, v))} ${icon('close', 'ico--sm x')}</button>`)));
  if (CS.stock) active.push(`<button type="button" class="chip chip--plain" data-rm="stock">${t('onlyStock')} ${icon('close', 'ico--sm x')}</button>`);
  if (CS.pmin || CS.pmax) active.push(`<button type="button" class="chip chip--plain" data-rm="price">${esc((CS.pmin || 0) + '–' + (CS.pmax || '∞'))} ${CUR} ${icon('close', 'ico--sm x')}</button>`);
  qs('[data-actives]').innerHTML = active.join('');
  const fc = qs('[data-fcount]'); if (fc) fc.textContent = active.length ? `(${active.length})` : '';
  qsa('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === CS.view));
  const R = qs('[data-results]');
  if (!n) {
    const carTxt = CS.car && !base.length;
    R.innerHTML = `<div class="empty">${icon(carTxt ? 'car' : 'search', 'ico--lg')}<h3>${t('emptyTitle')}</h3><p>${carTxt ? esc(t('emptyCar', { car: carLabel(CS.car) })) : t('emptyFilters')}</p>
      ${carTxt ? `<a class="btn btn--primary" href="index.html#request">${t('vinLink')}</a>` : `<button class="btn btn--ghost" type="button" data-reset>${t('resetFilters')}</button>`}</div>`;
  } else {
    R.innerHTML = `<div class="grid ${CS.view === 'list' ? 'grid--list' : ''}">${list.map(p => card(p, { car: CS.car })).join('')}</div>
      <nav class="pager" aria-label="Pagination"><span aria-current="page">1</span></nav>`;
  }
}
function renderFilters() { qsa('[data-filters]').forEach(el => { el.innerHTML = filtersHTML(el.dataset.filters); }); }
function bindCategory() {
  renderFilters(); renderResults();
  const vb = qs('.vbar[data-finder]'); if (vb) bindFinder(vb, { make: params.get('vehicle_make') && !params.get('vehicle_model') ? params.get('vehicle_make') : null });
  const main = qs('#main');
  const changed = (rf = true) => { if (rf) renderFilters(); renderResults(); syncQuick(); };
  const syncQuick = () => qsa('[data-quick]').forEach(b => { const k = b.dataset.quick, v = b.dataset.v; b.setAttribute('aria-pressed', v ? !!(CS.sel[k] && CS.sel[k].has(v)) : !(CS.sel[k] && CS.sel[k].size)); });
  main.addEventListener('change', e => {
    const el = e.target;
    if (el.matches('[data-f]')) { const k = el.dataset.f; CS.sel[k] = CS.sel[k] || new Set(); el.checked ? CS.sel[k].add(el.value) : CS.sel[k].delete(el.value); const keep = el.closest('[data-filters]')?.dataset.filters; changed(); refocus(keep, `[data-f="${k}"][value="${CSS.escape(el.value)}"]`); }
    else if (el.matches('[data-stock]')) { CS.stock = el.checked; const keep = el.closest('[data-filters]')?.dataset.filters; changed(); refocus(keep, '[data-stock]'); }
    else if (el.matches('[data-sort]')) { CS.sort = el.value; renderResults(); }
    else if (el.matches('[name=msort]')) { CS.sort = el.value; qs('[data-sort]').value = el.value; renderResults(); }
    else if (el.matches('[data-pmin],[data-pmax]')) { CS.pmin = qs('[data-pmin]', el.closest('[data-filters]')).value.replace(/\D/g, ''); CS.pmax = qs('[data-pmax]', el.closest('[data-filters]')).value.replace(/\D/g, ''); changed(); }
  });
  const refocus = (scope, sel) => { if (!scope) return; const el = qs(`[data-filters="${scope}"] ${sel}`); if (el) el.focus({ preventScroll: true }); };
  main.addEventListener('click', e => {
    const b = e.target.closest('button,a'); if (!b) return;
    if (b.matches('[data-f]')) { const k = b.dataset.f, v = b.dataset.v; CS.sel[k] = CS.sel[k] || new Set(); CS.sel[k].has(v) ? CS.sel[k].delete(v) : CS.sel[k].add(v); const keep = b.closest('[data-filters]')?.dataset.filters; changed(); refocus(keep, `[data-f="${k}"][data-v="${CSS.escape(v)}"]`); }
    else if (b.matches('[data-quick]')) { const k = b.dataset.quick, v = b.dataset.v; if (!v) { CS.sel[k] = new Set(); } else { CS.sel[k] = CS.sel[k] && CS.sel[k].has(v) && CS.sel[k].size === 1 ? new Set() : new Set([v]); } changed(); }
    else if (b.matches('[data-rm]')) { const k = b.dataset.rm; if (k === 'stock') CS.stock = false; else if (k === 'price') { CS.pmin = CS.pmax = ''; } else CS.sel[k].delete(b.dataset.v); changed(); }
    else if (b.matches('[data-reset]')) { CS.sel = {}; CS.stock = false; CS.pmin = CS.pmax = ''; changed(); }
    else if (b.matches('[data-view]')) { CS.view = b.dataset.view; store.set('bb_view', CS.view); renderResults(); }
    else if (b.matches('[data-openfilters]')) openSheet('#fsheet', b);
    else if (b.matches('[data-opensort]')) openSheet('#ssheet', b);
    else if (b.matches('[data-closesheet]')) closeSheet(b.closest('.sheet'));
    else if (b.matches('[data-cleargarage-nav]')) { saveGarage(null); }
  });
}
let sheetReturn = null;
function openSheet(sel, opener) {
  const s = qs(sel); sheetReturn = opener; s.hidden = false; document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => s.classList.add('is-open'));
  setTimeout(() => qs('[data-closesheet]', s).focus(), 60);
  s.onclick = e => { if (e.target === s) closeSheet(s); };
  s.onkeydown = e => { if (e.key === 'Escape') closeSheet(s); if (e.key === 'Tab') { const f = qsa('button,input,select,summary,[href]', s).filter(x => x.offsetParent !== null && !x.disabled); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } };
}
function closeSheet(s) { s.classList.remove('is-open'); document.body.style.overflow = ''; setTimeout(() => { s.hidden = true; }, 260); if (sheetReturn) sheetReturn.focus(); }

/* ---------- generation picker (/masini/) ---------- */
function pageMasini() {
  const make = params.get('vehicle_make') || 'Ford', model = params.get('vehicle_model') || 'Kuga', type = params.get('vehicle_type') || 'wipers', year = +params.get('year') || null;
  const gens = D.gens[make + '|' + model];
  const car = `${make} ${model}`;
  const groups = gens ? [...new Set(gens.map(g => g.name.split(' - ')[0]))] : [];
  const cnt = g => PRODUCTS.filter(p => p.type === type && fitsCar(p, { make, model, gen: g.name })).length;
  const sorted = gens ? [...gens].sort((a, b) => year ? ((year >= b.from && year <= (b.to || YEAR_NOW)) - (year >= a.from && year <= (a.to || YEAR_NOW))) : 0) : [];
  return `<div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">${t('home')}</a>${icon('right')}<a href="${link('categorie.html', { vehicle_type: type })}">${type === 'bulbs' ? t('bulbsTitle') : t('wipersTitle')}</a>${icon('right')}<span aria-current="page">${esc(car)}</span></nav>
    <ol class="stepper mt16" aria-label="${t('chooseCar')}">
      <li class="done"><a href="index.html#finder"><span class="n">${icon('check', 'ico--sm')}</span>${logo(make)}<span class="st-t">${esc(make)}</span></a></li>
      <li class="done"><a href="index.html#finder"><span class="n">${icon('check', 'ico--sm')}</span><span class="st-t">${esc(model)}</span></a></li>
      <li class="now" aria-current="step"><span class="n">3</span><span class="st-t">${t('stGen')}</span></li>
      <li><span class="n">4</span><span class="st-t">${t('stProducts')}</span></li>
    </ol>
    <div class="genhead">${logo(make)}<div><h1>${esc(t('genTitle', { car }))}</h1><p>${t('genLead')}</p></div></div>
    ${groups.length > 1 ? `<div class="quick" role="group" aria-label="${t('cfGen')}"><button type="button" class="chip chip--plain" data-grp="" aria-pressed="true">${t('genAll')} · ${gens.length}</button>${groups.map(g => `<button type="button" class="chip chip--plain" data-grp="${esc(g)}" aria-pressed="false">${esc(g)}</button>`).join('')}</div>` : ''}
    ${gens ? `<div class="gens">${sorted.map((g, i) => { const n = cnt(g); const yr = year && year >= g.from && year <= (g.to || YEAR_NOW);
      return `<a class="gen" data-g="${esc(g.name.split(' - ')[0])}" href="${link('categorie.html', { vehicle_type: type, vehicle_make: make, vehicle_model: model, vehicle_generation: g.slug })}">
        ${n || yr ? `<span class="gen__count">${yr ? `<span class="badge badge--brand">${icon('calendar', 'ico--sm')}${year}</span>` : ''} ${n ? `<span class="badge badge--ok">${nprod(n)}</span>` : ''}</span>` : ''}
        <span class="gen__img"><img src="${img('gens/' + g.img)}" alt="${esc(make + ' ' + g.name)}" width="640" height="480" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async"></span>
        <span class="gen__body"><small>${esc(make)}</small><h2>${esc(g.name)}</h2><span class="gen__years" title="${esc(t('genYears', { y: yearsLabel(g.from, g.to) }))}">${icon('calendar', 'ico--sm')}${esc(yearsLabel(g.from, g.to))}</span>
        <span class="gen__cta"><span class="btn btn--primary"><span class="l">${t('genGo')}</span><span class="s">${t('genPick')}</span>${icon('arrow', 'ico--sm')}</span></span></span></a>`; }).join('')}</div>`
      : `<div class="empty mt16">${logo(make)}<p>${esc(t('genNoData', { car }))}</p><a class="btn btn--primary" href="${link('categorie.html', { vehicle_type: type, vehicle_make: make, vehicle_model: model })}">${esc(t('genContinue', { car }))} ${icon('arrow')}</a></div>`}
    <div class="vinhelp">${icon('doc')}<p>${t('vinHelp')}</p><a class="btn btn--ghost btn--sm" href="index.html#request" style="margin-left:auto">${t('vinLink')}</a></div>
  </div>`;
}
function bindMasini() {
  qsa('[data-grp]').forEach(b => b.addEventListener('click', () => {
    qsa('[data-grp]').forEach(x => x.setAttribute('aria-pressed', x === b));
    qsa('.gen').forEach(g => { g.hidden = b.dataset.grp && g.dataset.g !== b.dataset.grp; });
  }));
}

/* ---------- product page ---------- */
function pageProduct() {
  const p = byId(params.get('id')) || byId(2172);
  document.title = `${pname(p)} – Bonbila Auto`;
  const sale = p.reg > p.price, pct = sale ? Math.round((1 - p.price / p.reg) * 100) : 0;
  const cat = p.type === 'bulbs' ? t('bulbsTitle') : t('wipersTitle');
  let fit;
  if (garage && p.fits.length && fitsCar(p, garage)) fit = `<div class="fitbox fitbox--ok">${logo(garage.make)}<div><small>${icon('check', 'ico--sm')} ${t('fitOk')}</small><b>${esc(carLabel(garage))} · ${esc(carYears(garage))}</b></div><button class="btn btn--ghost btn--sm" type="button" data-pickcar>${t('changeCar')}</button></div>`;
  else if (garage && p.fits.length) fit = `<div class="fitbox fitbox--warn">${logo(garage.make)}<div><small>${t('fitWarn')}</small><b>${esc(carLabel(garage))}</b></div><a class="btn btn--ghost btn--sm" href="${link('categorie.html', { vehicle_type: p.type, vehicle_make: garage.make, vehicle_model: garage.model, vehicle_generation: garage.slug })}">${t('seeProducts')}</a></div>`;
  else fit = `<div class="fitbox">${icon('car', 'ico--lg')}<div><b>${t('fitAsk')}</b><small>${t('fitAskD')}</small></div><button class="btn btn--dark btn--sm" type="button" data-pickcar>${t('check')}</button></div>`;
  const A = p.attrs;
  const specs = p.type === 'wipers'
    ? [['spMaker', p.brand], ['spModel', A.model], ['spLen1', A.len1], ['spLen2', A.len2], ['spQty', valLabel('qty', A.qty)], ['spMount', t('m_' + A.mount)], ['spCode', p.sku]]
    : [['spMaker', p.brand], ['spBulb', A.bulb], ['spTech', A.tech], ['spLight', t('l_' + A.light)], ['spWatt', A.watt], ['spVolt', A.volt], ['spKelvin', A.kelvin], ['spQty', valLabel('qty', A.qty)], ['spCode', p.sku]];
  const related = PRODUCTS.filter(x => x.id !== p.id && x.type === p.type).sort((a, b) => (b.brand === p.brand) - (a.brand === p.brand)).slice(0, 4);
  const imgs = p.imgs;
  return `<div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">${t('home')}</a>${icon('right')}<a href="${link('categorie.html', { vehicle_type: p.type })}">${cat}</a>${icon('right')}<span aria-current="page">${esc(p.brand)} ${esc(A.model || A.bulb)}</span></nav>
    <div class="pdp">
      <div class="gallery">
        <div class="gallery__main"><div class="gallery__track" data-track tabindex="0" aria-label="${esc(pname(p))}">${imgs.map((s, i) => `<figure><img src="${img(s)}" alt="${esc(pname(p))} – ${i + 1}/${imgs.length}" width="600" height="600" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></figure>`).join('')}</div>
          ${imgs.length > 1 ? `<span class="gallery__count" data-gcount aria-hidden="true">1 / ${imgs.length}</span>` : ''}
          <div class="pcard__tags" style="top:16px;left:16px">${sale ? `<span class="badge badge--sale">−${pct}%</span>` : ''}</div></div>
        ${imgs.length > 1 ? `<div class="gallery__thumbs">${imgs.map((s, i) => `<button type="button" data-thumb="${i}" aria-label="${i + 1}/${imgs.length}" ${i ? '' : 'aria-current="true"'}><img src="${img(s)}" alt="" width="72" height="72"></button>`).join('')}</div>` : ''}
      </div>
      <div class="buybox">
        <div class="buybox__meta"><span class="pcard__brand">${esc(p.brand)}</span><span>·</span><span>${t('code')}: ${esc(p.sku)}</span></div>
        <h1>${esc(pname(p))}</h1>
        ${fit}
        ${p.fits.length ? `<div><p class="flabel" style="margin-bottom:8px">${t('fitList')}</p><div class="fitlist">${p.fits.map(f => { const g = findGen(f.make, f.model, f.gen); return `<a class="chip" href="${link('categorie.html', { vehicle_type: p.type, vehicle_make: f.make, vehicle_model: f.model, vehicle_generation: g ? g.slug : '' })}">${logo(f.make)}${esc(genShort(f.make, f.gen))}${g ? ` <span class="muted">${yearsLabel(g.from, g.to)}</span>` : ''}</a>`; }).join('')}</div></div>`
          : p.type === 'wipers' ? `<p class="notice">${icon('info')}<span>${t('fitUniversal')}</span></p>` : ''}
        <div class="pricebox"><span class="price${sale ? ' price--sale' : ''}">${sale ? `<del>${money(p.reg)}</del>` : ''}${priceHTML(p.price)}</span><span class="vat">${t('vat')}</span><span class="stock stock--${p.stock}" style="padding-bottom:6px">${t('st_' + p.stock)}</span></div>
        <div class="buyrow" data-buyrow>
          <div class="qty" role="group" aria-label="${t('qty')}"><button type="button" data-q="-1" aria-label="${t('dec')}">${icon('minus', 'ico--sm')}</button><input type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="${t('qty')}" data-qty><button type="button" data-q="1" aria-label="${t('inc')}">${icon('plus', 'ico--sm')}</button></div>
          <button class="btn btn--primary btn--lg" type="button" data-buy ${p.stock === 'out' ? 'disabled' : ''}>${icon('cart')}${t('add')}</button>
          <button class="iconbtn iconbtn--line" type="button" data-fav="${p.id}" aria-pressed="${wished(p.id)}" aria-label="${t('fav')}" style="width:56px;height:56px">${icon('heart')}</button>
        </div>
        <ul class="usps">
          <li>${icon('truck')}<span>${t('uspShip')}<small>${t('uspShipD')}</small></span></li>
          <li>${icon('ret')}<span>${t('uspRet')}<small>${t('uspRetD')}</small></span></li>
          <li>${icon('headset')}<span>${t('uspHelp')}<small>${t('uspHelpD', { p: `<a href="tel:+40771147147">${t('phone')}</a>` })}</small></span></li>
        </ul>
      </div>
    </div>
    <div class="ptabs ptabs__grid">
      <div>
        <details class="acc" open><summary>${t('tDesc')}${icon('down')}</summary><div class="acc__body"><p>${esc(t(p.type === 'bulbs' ? 'descBulbs' : 'descWipers', { m: p.brand + ' ' + (A.model || A.bulb) }))}</p>
          <ul class="ticks">${p.type === 'wipers' ? ['ticks1', 'ticks2', 'ticks3'].map(k => `<li>${icon('check')}${t(k)}</li>`).join('') : ''}</ul></div></details>
        <details class="acc"><summary>${t('tShip')}${icon('down')}</summary><div class="acc__body"><p>${t('shipText')}</p></div></details>
      </div>
      <details class="acc" open><summary>${t('tSpecs')}${icon('down')}</summary><div class="acc__body"><table class="specs"><tbody>${specs.filter(s => s[1]).map(([k, v]) => `<tr><th scope="row">${t(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div></details>
    </div>
    <section class="section section--tight" aria-labelledby="rel-h"><div class="shead"><h2 id="rel-h">${t('similar')}</h2></div><div class="rail">${related.map(x => card(x, { car: garage })).join('')}</div></section>
  </div>
  <div class="mbar mbar--m is-hidden" data-pmbar><div class="mbar__price"><small>${esc(p.brand)} · ${t('vat')}</small><b>${money(p.price)}</b></div><button class="btn btn--primary" type="button" data-buy ${p.stock === 'out' ? 'disabled' : ''}>${icon('cart')}${t('addShort')}</button></div>`;
}
function bindProduct() {
  const p = byId(params.get('id')) || byId(2172);
  const qty = qs('[data-qty]');
  qsa('[data-q]').forEach(b => b.addEventListener('click', () => { qty.value = Math.max(1, Math.min(99, (+qty.value || 1) + +b.dataset.q)); }));
  qsa('[data-buy]').forEach(b => b.addEventListener('click', () => handleAdd(p.id, Math.max(1, +qty.value || 1), b)));
  qsa('[data-pickcar]').forEach(b => b.addEventListener('click', () => confirmVehicle(p, { qty: Math.max(1, +qty.value || 1) })));
  const track = qs('[data-track]'), cnt = qs('[data-gcount]');
  if (track) {
    track.addEventListener('scroll', () => { const i = Math.round(track.scrollLeft / track.clientWidth); if (cnt) cnt.textContent = `${i + 1} / ${p.imgs.length}`; qsa('[data-thumb]').forEach(b => b.toggleAttribute('aria-current', +b.dataset.thumb === i)); }, { passive: true });
    qsa('[data-thumb]').forEach(b => b.addEventListener('click', () => track.scrollTo({ left: track.clientWidth * +b.dataset.thumb, behavior: 'smooth' })));
  }
  const bar = qs('[data-pmbar]'), row = qs('[data-buyrow]');
  if (bar && row && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => bar.classList.toggle('is-hidden', e.isIntersecting || e.boundingClientRect.top > 0)).observe(row);
  document.body.classList.add('has-mbar');
}

/* ---------- cart ---------- */
function carLine(l) {
  const c = l.car;
  if (!c) return `<div class="citem__car citem__car--missing">${icon('alert', 'ico--sm')}<span>${t('noCar')}</span><button type="button" data-editcar="${esc(l.key)}">${t('addCar')}</button></div>`;
  const extra = c.vin ? `${t('vinShort')} …${esc(c.vin.slice(-6))}` : c.photo ? t('photoShort') : '';
  return `<div class="citem__car">${logo(c.make)}<span><small>${t('forCar')}</small> <b>${esc(carLabel(c))}</b>${c.year ? ` · ${c.year}` : ''}${extra ? ` <small>· ${extra}</small>` : ''}</span><button type="button" data-editcar="${esc(l.key)}">${t('editCar')}</button></div>`;
}
function shipBar(sub) {
  const left = Math.max(0, FREE_SHIP - sub), pct = Math.min(100, sub / FREE_SHIP * 100);
  return `<div class="ship ${left ? '' : 'ship--done'}"><span>${left ? t('freeLeft', { x: `<b>${money(left)}</b>` }) : `<b>${t('freeOk')}</b>`}</span><span class="ship__track" role="progressbar" aria-valuemin="0" aria-valuemax="${FREE_SHIP}" aria-valuenow="${Math.round(Math.min(sub, FREE_SHIP))}" aria-label="${t('shipping')}"><i style="width:${pct}%"></i></span></div>`;
}
function pageCart() {
  return `<div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">${t('home')}</a>${icon('right')}<span aria-current="page">${t('cartTitle')}</span></nav>
    <div class="phead"><h1>${t('cartTitle')}</h1></div>
    <ol class="cartsteps"><li class="now"><span class="n">1</span><span class="st-t">${t('cs1')}</span></li><li><span class="n">2</span><span class="st-t">${t('cs2')}</span></li><li><span class="n">3</span><span class="st-t">${t('cs3')}</span></li></ol>
    <div data-cart></div>
  </div>
  <div class="mbar mbar--m" data-cbar><div class="mbar__price"><small>${t('total')} · ${t('vat')}</small><b data-ctotal></b></div><a class="btn btn--primary" href="checkout.html">${t('toCheckout')}</a></div>`;
}
function renderCart() {
  const box = qs('[data-cart]'), sub = cartTotal();
  const bar = qs('[data-cbar]');
  if (!cart.length) {
    box.innerHTML = `<div class="empty">${icon('cart', 'ico--lg')}<h3>${t('cartEmpty')}</h3><p>${t('cartEmptyD')}</p><a class="btn btn--primary" href="index.html#finder">${t('chooseCar')}</a></div>`;
    if (bar) bar.hidden = true; document.body.classList.remove('has-mbar'); return;
  }
  document.body.classList.add('has-mbar');
  const ship = sub >= FREE_SHIP ? 0 : null;
  box.innerHTML = `<div class="cartgrid">
    <div class="citems">
      <p class="notice">${icon('info')}<span>${t('cartCheck')}</span></p>
      ${shipBar(sub)}
      ${cart.map(l => { const p = byId(l.id); if (!p) return ''; return `<article class="citem">
        <a class="citem__img" href="${link('produs.html', { id: p.id })}" tabindex="-1" aria-hidden="true"><img src="${img(p.imgs[0])}" alt="" width="120" height="120" loading="lazy"></a>
        <div><div class="citem__top"><a class="citem__name" href="${link('produs.html', { id: p.id })}">${esc(pname(p))}</a>
          <button class="iconbtn" type="button" data-rmline="${esc(l.key)}" aria-label="${t('remove')}: ${esc(pname(p))}">${icon('trash')}</button></div>
          <p class="citem__sku">${t('code')}: ${esc(p.sku)} · <span class="stock stock--${p.stock}">${t('st_' + p.stock)}</span></p>
          ${carLine(l)}
          <div class="citem__foot"><div class="qty qty--sm" role="group" aria-label="${t('qty')}"><button type="button" data-lq="-1" data-key="${esc(l.key)}" aria-label="${t('dec')}">${icon('minus', 'ico--sm')}</button><input type="number" min="1" max="99" value="${l.qty}" aria-label="${t('qty')}" data-lqty="${esc(l.key)}"><button type="button" data-lq="1" data-key="${esc(l.key)}" aria-label="${t('inc')}">${icon('plus', 'ico--sm')}</button></div>
          <span class="price">${priceHTML(p.price * l.qty)}</span></div></div></article>`; }).join('')}
      <a class="arrowlink mt8" href="index.html">${icon('left', 'ico--sm')} ${t('keepShopping')}</a>
    </div>
    <aside class="summary" aria-labelledby="sum-h">
      <h2 id="sum-h">${t('summary')}</h2>
      <form class="coupon" data-coupon><label class="sr-only" for="coupon">${t('coupon')}</label><input class="input" id="coupon" placeholder="${t('couponPh')}"><button class="btn btn--soft" type="submit">${t('apply')}</button></form>
      <div class="srow"><span>${t('subtotal')}</span><span>${money(sub)}</span></div>
      <div class="srow"><span>${t('shipping')}</span><span>${ship === 0 ? `<b style="color:var(--ok)">${t('free')}</b>` : `<span class="muted">${t('shipNext')}</span>`}</span></div>
      <div class="srow srow--total"><span>${t('total')}<small>${t('vat')}</small></span><b>${money(sub)}</b></div>
      <a class="btn btn--primary btn--lg btn--block" href="checkout.html">${t('toCheckout')} ${icon('arrow')}</a>
      <ul class="trust"><li>${icon('lock', 'ico--sm')}${t('trust1')}</li><li>${icon('ret', 'ico--sm')}${t('trust2')}</li><li>${icon('shield', 'ico--sm')}${t('trust3')}</li></ul>
      <div class="footer__pay" style="margin-top:0"><span class="paymark">VISA</span><span class="paymark">Mastercard</span><span class="paymark">Apple Pay</span><span class="paymark">Google Pay</span></div>
    </aside></div>`;
  if (bar) { bar.hidden = false; qs('[data-ctotal]').textContent = money(sub); }
}
function bindCart() {
  renderCart();
  const box = qs('[data-cart]');
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.rmline) { cart = cart.filter(l => l.key !== b.dataset.rmline); saveCart(); renderCart(); qs('h1').focus?.(); }
    else if (b.dataset.lq) { const l = cart.find(x => x.key === b.dataset.key); l.qty = Math.max(1, Math.min(99, l.qty + +b.dataset.lq)); saveCart(); const k = b.dataset.key, d = b.dataset.lq; renderCart(); const nb = qs(`[data-lq="${d}"][data-key="${CSS.escape(k)}"]`); nb && nb.focus(); }
    else if (b.dataset.editcar) { const l = cart.find(x => x.key === b.dataset.editcar); confirmVehicle(byId(l.id), { qty: l.qty, editKey: l.key }); }
  });
  box.addEventListener('change', e => { const i = e.target.closest('[data-lqty]'); if (!i) return; const l = cart.find(x => x.key === i.dataset.lqty); l.qty = Math.max(1, Math.min(99, +i.value || 1)); saveCart(); renderCart(); });
  box.addEventListener('submit', e => { if (e.target.matches('[data-coupon]')) { e.preventDefault(); toast('Demo', 'tag'); } });
}

/* ---------- checkout ---------- */
const COUNTIES = ['Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila', 'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea'];
function miniSummary() {
  return `<div class="mini">${cart.map(l => { const p = byId(l.id); if (!p) return ''; return `<div class="mini__item"><span class="s-thumb"><img src="${img(p.imgs[0])}" alt="" width="56" height="56"><i>${l.qty}</i></span><div><b>${esc(pname(p))}</b>${l.car ? `<small>${logo(l.car.make)}${esc(carLabel(l.car))}${l.car.year ? ' · ' + l.car.year : ''}</small>` : ''}</div><span class="s-price">${money(p.price * l.qty)}</span></div>`; }).join('')}</div>`;
}
function coTotals() {
  const sub = cartTotal(), d = (qs('[name=delivery]:checked') || {}).value || 'courier';
  const ship = d === 'pickup' || sub >= FREE_SHIP ? 0 : SHIP_COST;
  return { sub, ship, total: sub + ship };
}
function pageCheckout() {
  const f = (id, label, attrs = '', cls = '') => `<div class="field ${cls}"><label for="${id}">${label} <span class="req" aria-hidden="true">*</span></label><input class="input" id="${id}" name="${id}" required ${attrs}><span class="ferr" id="${id}-e" hidden>${t('cfFill')}</span></div>`;
  return `<div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">${t('home')}</a>${icon('right')}<a href="cos.html">${t('cartTitle')}</a>${icon('right')}<span aria-current="page">${t('coTitle')}</span></nav>
    <div class="phead"><h1>${t('coTitle')}</h1></div>
    <ol class="cartsteps"><li class="done"><span class="n">${icon('check', 'ico--sm')}</span><a href="cos.html"><span class="st-t">${t('cs1')}</span></a></li><li class="now"><span class="n">2</span><span class="st-t">${t('cs2')}</span></li><li><span class="n">3</span><span class="st-t">${t('cs3')}</span></li></ol>
    <div class="cartgrid" data-co>
      <form class="co" novalidate data-coform>
        <details class="cosum"><summary><span>${icon('cart', 'ico--sm')} ${t('coShowSum')}</span><b data-cotot></b></summary>${miniSummary()}</details>
        <section class="cobox" aria-labelledby="co1"><h2 id="co1"><span class="n">1</span>${t('coContact')}</h2>
          <div class="seg" role="radiogroup" aria-label="${t('coClient')}"><label><input type="radio" name="client" value="pf" checked>${icon('user', 'ico--sm')}${t('pf')}</label><label><input type="radio" name="client" value="pj">${icon('store', 'ico--sm')}${t('pj')}</label></div>
          <div class="grid3">${f('email', t('coEmail'), 'type="email" autocomplete="email" inputmode="email"')}${f('tel', t('coPhone'), 'type="tel" autocomplete="tel" inputmode="tel"')}${f('fname', t('coFirst'), 'autocomplete="given-name"')}${f('lname', t('coLast'), 'autocomplete="family-name"')}</div>
          <div class="grid3" data-company hidden>${f('company', t('coCompanyName'), 'autocomplete="organization"', 'span2')}${f('cui', t('coCui'))}${f('reg', t('coReg'))}</div>
        </section>
        <section class="cobox" aria-labelledby="co2"><h2 id="co2"><span class="n">2</span>${t('coAddress')}</h2>
          <div class="grid3">
            <div class="field"><label for="county">${t('coCounty')} <span class="req" aria-hidden="true">*</span></label><select class="select" id="county" name="county" required autocomplete="address-level1"><option value="">${t('coChooseCounty')}</option>${COUNTIES.map(c => `<option>${c}</option>`).join('')}</select><span class="ferr" id="county-e" hidden>${t('cfFill')}</span></div>
            ${f('city', t('coCity'), 'autocomplete="address-level2"')}
            ${f('street', t('coStreet'), 'autocomplete="street-address"', 'span2')}
            <div class="field"><label for="zip">${t('coZip')}</label><input class="input" id="zip" name="zip" inputmode="numeric" autocomplete="postal-code" aria-describedby="zip-h"><span class="fhelp" id="zip-h">${t('coZipHelp')}</span></div>
          </div>
        </section>
        <section class="cobox" aria-labelledby="co3"><h2 id="co3"><span class="n">3</span>${t('coDelivery')}</h2>
          <div class="opts" role="radiogroup" aria-labelledby="co3">
            ${[['courier', 'truck', 'dCourier', 'dCourierD'], ['locker', 'box', 'dLocker', 'dLockerD'], ['pickup', 'store', 'dPickup', 'dPickupD']].map(([v, ic, a, b], i) => `<label class="opt"><input type="radio" name="delivery" value="${v}" ${i ? '' : 'checked'}><span class="dot"></span>${icon(ic)}<div><b>${t(a)}</b><small>${t(b)}</small></div><span class="tag" data-dprice="${v}"></span></label>`).join('')}
          </div>
        </section>
        <section class="cobox" aria-labelledby="co4"><h2 id="co4"><span class="n">4</span>${t('coPay')}</h2>
          <div class="opts" role="radiogroup" aria-labelledby="co4">
            ${[['card', 'card', 'pCard', 'pCardD'], ['cod', 'cash', 'pCod', 'pCodD'], ['transfer', 'bank', 'pTransfer', 'pTransferD']].map(([v, ic, a, b], i) => `<label class="opt" ${v === 'transfer' ? 'data-pjonly hidden' : ''}><input type="radio" name="pay" value="${v}" ${i ? '' : 'checked'}><span class="dot"></span>${icon(ic)}<div><b>${t(a)}</b><small>${t(b)}</small></div></label>`).join('')}
          </div>
          <details class="optional"><summary>${icon('doc')}<span>${t('coNote')}</span>${icon('plus')}</summary><div class="optional__body"><label class="sr-only" for="note">${t('coNote')}</label><textarea class="input" id="note" placeholder="${t('coNotePh')}"></textarea></div></details>
          <label class="check"><input type="checkbox" required id="terms"><span>${t('coTerms', { t: `<a class="link" href="#">${t('coTermsT')}</a>`, p: `<a class="link" href="#">${t('coTermsP')}</a>` })}</span></label>
          <span class="ferr" id="terms-e" hidden>${t('cfFill')}</span>
          <button class="btn btn--primary btn--lg btn--block" type="submit">${icon('lock', 'ico--sm')}${t('coPlace')} · <span data-cotot></span></button>
        </section>
      </form>
      <aside class="summary co-aside" aria-labelledby="sum2-h">
        <h2 id="sum2-h">${t('summary')}</h2>
        ${miniSummary()}
        <div class="srow"><span>${t('subtotal')}</span><span data-cosub></span></div>
        <div class="srow"><span>${t('shipping')}</span><span data-coship></span></div>
        <div class="srow srow--total"><span>${t('total')}<small>${t('vat')}</small></span><b data-cotot></b></div>
        <ul class="trust"><li>${icon('lock', 'ico--sm')}${t('trust1')}</li><li>${icon('shield', 'ico--sm')}${t('trust3')}</li></ul>
      </aside>
    </div>
  </div>`;
}
function bindCheckout() {
  const upd = () => {
    const { sub, ship, total } = coTotals();
    qsa('[data-cosub]').forEach(e => e.textContent = money(sub));
    qsa('[data-coship]').forEach(e => e.innerHTML = ship ? money(ship) : `<b style="color:var(--ok)">${t('free')}</b>`);
    qsa('[data-cotot]').forEach(e => e.textContent = money(total));
    qsa('[data-dprice]').forEach(e => { const v = e.dataset.dprice; e.textContent = v === 'pickup' || sub >= FREE_SHIP ? t('free') : money(SHIP_COST); });
  };
  upd();
  const form = qs('[data-coform]');
  form.addEventListener('change', e => {
    if (e.target.name === 'client') { const pj = e.target.value === 'pj'; qs('[data-company]').hidden = !pj; qsa('[data-company] input').forEach(i => i.required = pj); qs('[data-pjonly]').hidden = !pj; }
    if (e.target.name === 'delivery') upd();
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    let first = null;
    qsa('input[required],select[required]', form).forEach(i => {
      if (i.closest('[hidden]')) return;
      const ok = i.type === 'checkbox' ? i.checked : i.type === 'email' ? /^\S+@\S+\.\S+$/.test(i.value) : !!i.value.trim();
      i.setAttribute('aria-invalid', !ok); const er = qs('#' + i.id + '-e'); if (er) er.hidden = ok; if (er) i.setAttribute('aria-describedby', er.id); if (!ok && !first) first = i;
    });
    if (first) { first.focus(); return; }
    qs('[data-co]').innerHTML = `<div class="empty" style="grid-column:1/-1;border-style:solid"><span class="success__ico">${icon('check')}</span><h3 tabindex="-1">${t('coDone')}</h3><p>${t('coDoneD')}</p><a class="btn btn--primary" href="index.html">${t('keepShopping')}</a></div>`;
    qsa('.cartsteps li').forEach((li, i) => { li.className = i < 2 ? 'done' : 'now'; if (i < 2) qs('.n', li).innerHTML = icon('check', 'ico--sm'); });
    qs('[data-co] h3').focus(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ======================================================================
   boot
   ====================================================================== */
const PAGES = { home: [pageHome, bindHome], category: [pageCategory, bindCategory], masini: [pageMasini, bindMasini], product: [pageProduct, bindProduct], cart: [pageCart, bindCart], checkout: [pageCheckout, bindCheckout] };
const [render, bind] = PAGES[PAGE] || PAGES.home;
const app = qs('#app');
app.innerHTML = header() + `<main id="main" tabindex="-1">${render()}</main>` + footer();
bind();
bindSearch();
updateCartUI();

// global delegation: wishlist, add-to-cart, garage clear, drawer
document.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) { const id = +fav.dataset.fav; wish = wished(id) ? wish.filter(x => x !== id) : [...wish, id]; store.set('bb_wish', wish); qsa(`[data-fav="${id}"]`).forEach(b => b.setAttribute('aria-pressed', wished(id))); toast(wished(id) ? t('toastFav') : t('toastUnfav'), 'heart'); return; }
  const add = e.target.closest('[data-add]');
  if (add) { handleAdd(+add.dataset.add, 1, add); return; }
  if (e.target.closest('[data-cleargarage]')) { saveGarage(null); refreshGarage(); return; }
  const od = e.target.closest('[data-open-drawer]');
  if (od) { const d = qs('#drawer'); d.hidden = false; requestAnimationFrame(() => d.classList.add('is-open')); od.setAttribute('aria-expanded', 'true'); setTimeout(() => qs('[data-close-drawer]', d).focus(), 50); return; }
  if (e.target.closest('[data-close-drawer]') || e.target.id === 'drawer') { const d = qs('#drawer'); d.classList.remove('is-open'); setTimeout(() => { d.hidden = true; }, 300); const b = qs('[data-open-drawer]'); b.setAttribute('aria-expanded', 'false'); b.focus(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const d = qs('#drawer.is-open'); if (d) { qs('[data-close-drawer]', d).click(); } } });
})();
