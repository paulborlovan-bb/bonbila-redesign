# Bonbila Auto – redesign prototype (light, with night sections)

Clickable HTML prototype for the redesign of **redesign.bonbila.ro** (WordPress + Elementor + WooCommerce).
It keeps Bonbila's logo, layout and backend components. Only the design of those elements changes, plus some proposed improvements.

**Round 2 (day & night):** light "day" sections for shopping, alternating with "night" sections in Bonbila navy: header, the lighting section, parts on request, footer and the order summary. Small details carry the brand: the yellow dot from the logo marks the current or selected item, wiper lengths are drawn as dimension lines, bulbs show their socket and light colour (Kelvin), and the add button is a small yellow disc with "+".

**Homepage hero:** back to the light round 1 layout (Paul preferred it): eyebrow, headline with the yellow marker, the white vehicle finder on the left, and the night headlight photo as a rounded card on the right with two badges and three stats. On phones the photo card is hidden so the finder stays at the top.

**Floating menu:** the header is a dark capsule that floats above the page and stays on top while scrolling. On desktop, "Becuri auto" and "Ștergătoare" open floating menu panels (by socket, technology, brand, maker, and the saved car), and search opens as a floating panel with frequent searches. On phones, the menu opens as a floating night card with the two categories, the saved car, sockets and links, and the bottom bars (Filters/Sort, Add to cart, Checkout) float as capsules too. In Elementor this maps to a sticky header with a Mega Menu widget; the panels use the same night colours as the header.

**Version 2, "LED night" (second design option):** the same pages, data, finder, filters, cart and checkout, in a dark look modelled on the two fintech dashboards Paul sent (FluX and Nexora on Behance): near-black pages lit like a pair of headlights: cool LED blue on one side and warm Bonbila yellow on the other (instead of the references' violet), so the brand colour stays in charge. The two lights meet in the hero glow, the dashboard edge, the light-simulator window, the parts-on-request banner and the "Bonbila" wordmark; bulb cards and step numbers are yellow, wiper and maker cards blue. Glass panels with a thin light edge, pill buttons and big quiet headlines. Yellow is also the colour of the logo, the main buttons and the dot in the headline; green marks "fits" and "in stock". One typeface, Archivo, at normal width (headlines at weight 500), plus JetBrains Mono only for codes people copy (SKU, VIN). Both fonts are self-hosted under the SIL Open Font License. The homepage reads like a product dashboard:
- **Hero:** a centred headline over a soft blue glow and grid, then one wide glass "dashboard" holding a large wiper finder: maker logos, then make and model, and a big "Alege mașina" button. Wipers only, no bulb tab (client feedback, round of 2026-11-16: no saved-car card, bigger filter, no "Becuri" tab). Behind the buttons a faint side outline of a car is drawn in once on load (LED blue at the back, a yellow headlight at the front), parked behind the finder; on phones it sits in its own gap above the finder.
- **Sunshade banner ("Soarele rămâne afară."), right under the hero:** a container-width yellow banner for Bonbila's own windshield sunshade, their invention, drawn after their product photos and sketches: a silver cover laid on the outside of the windshield, straps closed inside the front doors, wipers lowered on top. When the drawing scrolls into view it plays the fitting: the windshield glows hot in the sun, the wipers lift, the cover unrolls, the straps go into the doors (with a round detail from their strap sketch), the wipers come down and the sun glints off the cover. Three steps under the drawing ("Întinzi parasolarul pe parbriz", "Prinzi chingile în mașină", "Lași ștergătoarele peste el") follow along and can be clicked; a round button plays it again. With reduced motion the finished state shows. Copy: "Nou" and "Inventat de Bonbila" tags, headline, lead, three chips (stops the sun before the glass, fastened from inside through the doors, stays put with the car locked) and a dark "Vezi parasolarul" button. The chips and the button target are to confirm with Bonbila; for now the button shows a "coming soon" note.
- **Ticker:** two slow rows of cards, one per socket, technology and wiper length (no car makers), each with "from" price and product count, each opening the catalogue already filtered (new `len1` URL filter for wiper length). Paused on hover and focus, static with reduced motion.
- **Categories:** a bento grid of four lit tiles (wipers tall, LED, halogen, parts on request wide) with key specs as chips.
- **Light simulator:** a window with Halogen / Xenon / LED presets and a 2700–6700 K slider that changes the headlight beam and links to the matching bulbs.
- **How it works** next to a night photo with a glass "Compatibil" card, the car-brand wall, guides, a "parts on request" banner with a 3-step strip and the VIN form, and a large "Bonbila" wordmark above the footer.

Earlier v2 rounds ("Bold", then a calmer pass) are in git history (commits c8b7fbb and 0c6ed11) if Bonbila wants to compare. The v2 home before the 2026-11-16 client round (saved-car card, maker names, "most searched" table, mega menus) is commit d515d25.

**v2 home only, for now:** the menu shows plain links (Becuri auto, Ștergătoare, Piese la cerere, Ghiduri) without drop-down panels, and there is a **light mode**: the sun/moon button in the header (on phones, "Mod luminos" at the bottom of the menu) switches day and night with a short cross-fade and remembers the choice. Links can force it: `?tema=zi` for light, `?tema=noapte` for dark. In light mode the page is a cool off-white (#F3F4F8) with white glass panels and the same blue and yellow headlights, a little softer; the header capsule, the light simulator's road, the night photo card, the parts-on-request banner and the footer stay night. The other v2 pages keep the mega menus and stay dark until the client signs off on the home.

The footer of both versions has a "Varianta de design: Clasic | Modern" switch (DE: "Klassisch | Modern"). Technically, `build.mjs` writes the v2 pages to `/v2/` and `/v2/de/` (`<html data-v="2">`), and generates `assets/css/v2.css` from `style.css` (dark token mapping) plus `assets/css/v2-bold.css`. So edit those two files, not `v2.css`. In `app.js`, only the homepage branches (`pageHomeV2()` with `HERO_CAR` and `sunScene()`, `bindBeam()`, `bindSun()`, `bindTheme()`, and `finderHome({ big: true })`); every other page is shared. Light mode lives in a `[data-theme=light]` block at the end of `v2-bold.css`; `build.mjs` adds a tiny script to the v2 home `<head>` that picks the theme before the first paint.

**Live:** https://paulborlovan-bb.github.io/bonbila-redesign/ · German: https://paulborlovan-bb.github.io/bonbila-redesign/de/
**Live, version 2 (LED night):** https://paulborlovan-bb.github.io/bonbila-redesign/v2/ · German: https://paulborlovan-bb.github.io/bonbila-redesign/v2/de/

| Page | Romanian | German | Matches on the WP site |
|---|---|---|---|
| Home + vehicle finder | `index.html` | `de/index.html` | home (Elementor) |
| Catalogue / search | `categorie.html` | `de/categorie.html` | `/categorie-produs/stergatoare/`, `/categorie-produs/becuri/`, `?s=` |
| Generation picker | `masini.html` | `de/masini.html` | `/masini/?vehicle_make=&vehicle_model=&vehicle_type=` |
| Product | `produs.html?id=2172` | `de/produs.html?id=2172` | single product (`.bb-product`) |
| Cart | `cos.html` | `de/cos.html` | cart (`.bb-cart-*`) |
| Checkout | `checkout.html` | `de/checkout.html` | checkout |

Demo cars with generation photos: Ford Kuga, Dacia Logan / Duster / Sandero, VW Golf / Passat, Skoda Octavia, BMW 3 Series, Renault Clio, Toyota Corolla, Mercedes-Benz C-Class, Audi A4, Opel Astra, Hyundai Tucson.
Every other make or model still works and falls back to "all generations".

## Component map (what we keep → how it looks now)

| Their component (backend stays) | New design |
|---|---|
| Hero tabs `body.home .hero .tabs` (Ștergătoare / Becuri auto) | Segmented tabs in the finder card (ARIA tablist, arrow keys) |
| `select.ymm-select[name=vehicle_make]` | Grid of 8 popular **brand logos** + a searchable brand list with logos. It writes into the same `vehicle_make` field, so the native select can stay in the DOM and stay in sync. |
| `select.ymm-select[name=vehicle_model]` | Same native select, styled, with the brand logo inside |
| `button.ymm-submit-any-selection` "Alege mașina" | Primary yellow button; sends the same `vehicle_make`, `vehicle_model`, `vehicle_type` params to `/masini/` |
| `/masini/` generation cards | Photo cards with years, product count, body-type chips (I / II / III), stepper Marcă → Model → Generație → Produse |
| `vehicle_generation` filter on category | **Vehicle bar** with the car's logo and photo, "Schimbă generația" and remove buttons |
| Sidebar filters + `#bbw-wiper-filter-form` | Collapsible groups, chips for lengths, live count. On mobile: sticky "Filtre / Sortează" bar and bottom sheets with "Vezi N produse" |
| `.bbw-attachment-grid .bbw-attachment-card input[name=bbw_prindere]` | Icon cards for each mount type (same radio/checkbox inputs) |
| bonbila-vehicle-confirmation dialog (bbvc): Marca, Modelul, Generația / caroseria, Anul + optional VIN / talon photo | Bottom sheet on mobile, centred dialog on desktop. Pre-filled from the chosen car, mismatch warning, VIN check (17 chars, no I/O/Q), camera upload, success state "Produs adăugat în coș" |
| Cart vehicle data | Car line on every cart item (logo, generation, year, VIN end) with "Modifică mașina" |
| `.bb-product`, `.bb-gallery`, `.bb-specs`, `.bb-buy`, `.bb-related`, `.bb-sale-corner` | Swipe gallery, buy box with **"Se potrivește cu mașina ta"** check, compatible cars as logo chips, sticky mobile buy bar |
| Checkout `.bb-client-type-*`, company fields, `.bb-delivery-option`, `.bb-free-shipping`, `.bb-postcode-assist` | PF/PJ switch, numbered steps, delivery and payment cards, free-shipping bar, collapsible summary on mobile |

## Design tokens → Elementor Site Settings

**Global colours**

| Name | Hex | Use |
|---|---|---|
| Primary (Bonbila yellow) | `#FFC20E` | main buttons, the yellow dot; text on it is always Night |
| Night | `#0E1422` | header, night sections, footer, order summary, hero photo card; also the text colour on day sections |
| Night panel | `#161C2C` | panels on night (vehicle finder) |
| Day | `#EDEFF1` | page background (cool grey) |
| Surface | `#FFFFFF` | tiles, product photo tiles (photos use `mix-blend-mode:multiply`) |
| Text secondary (day) | `#434B5A` / `#5B6372` | body / meta (8.4:1 and 6.0:1 on white) |
| Text secondary (night) | `#BAC1CD` / `#8E97A7` | body / meta on Night (10:1 and 6.1:1) |
| Lines | `#DCE0E5` / `#C3C9D1` on day, white at 12 % / 24 % on night | hairlines |
| Success / Warning / Error | `#137A3A` / `#8F5300` / `#B42323` on day, `#6FD49A` / `#F5B85A` / `#FF8A7E` on night | stock, fit check, errors |

**Global fonts** (all self-hosted woff2 with Romanian and German characters, SIL Open Font License, no Google Fonts request):
- **Outfit** for headings and prices. Its round letters match the logo.
- **Barlow** 400/500/600 for body text. It was drawn after road signs and number plates.
- **Barlow Semi Condensed** 500/600 for codes, specs, sizes and small labels.

**Radii by hierarchy:** 24 big containers, 20 panels, 14 tiles and cards, 10 small tiles, 6 labels, pills for buttons. Shadows only on popovers and dialogs. **Container:** 1320 px.

**Logo on dark:** `assets/img/bonbila-logo-negative.png` is made from their PNG (white letters, black "b" kept inside the yellow disc). Please ask Bonbila for an official negative logo (SVG) before the build.

**One motion moment:** the headlight photo in the hero switches on once when the page loads ("lights on"). It is off when the visitor has reduced motion turned on.

## Mobile and accessibility

- Built mobile first (375 px): finder above the fold, list view by default, sticky filter/sort and buy bars, bottom sheets, 16 px inputs (no iOS zoom), and 44 px or larger tap targets.
- Skip link, landmarks, visible focus ring, ARIA combobox / tablist / dialog with focus trap and Esc, live result count, `prefers-reduced-motion`, and AA contrast.

## Open questions for Bonbila

1. **German prices:** the prototype shows € at a demo rate (1 € = 5,09 lei). Should DE show lei, or real € via WooCommerce multi-currency?
2. **Free shipping threshold** (placeholder 200 lei) and **courier price** (placeholder 19,99 lei).
3. **Delivery options:** courier, easybox/locker and personal pickup in Vladimirescu. Which couriers?
4. Wiper **mount types** on the demo products are illustrative. Real values come from `bbw_prindere`.
5. Many product names have no diacritics ("Stergatoare"). We suggest fixing them in WooCommerce.
6. Found on the preview site: `/product-category/stergatoare/` redirects to a single product, and the `/masini/` heading has very low contrast.
7. Next round: Despre noi, Ghiduri/Blog article, Contact, Contul meu, Favorite.

## Run locally

```bash
node serve.mjs 8782      # http://127.0.0.1:8782/
node build.mjs           # regenerates the 12 HTML shells (RO root + /de/)
```

`assets/js/data.js` holds a snapshot of products, prices and vehicles from the preview store (Store API) and the theme's vehicle list. `assets/js/i18n.js` holds all RO and DE texts, and `assets/js/app.js` holds the components.
Car logos come from [car-logos-dataset](https://github.com/filippofilip95/car-logos-dataset). The make/model list comes from [vehicle-makes-models](https://github.com/gor3a/vehicle-makes-models) (ODbL).
