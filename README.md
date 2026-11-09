# Bonbila Auto – redesign prototype (light)

Clickable HTML prototype for the redesign of **redesign.bonbila.ro** (WordPress + Elementor + WooCommerce).
It keeps Bonbila's logo, layout and backend components. Only the design of those elements changes, plus some proposed improvements.

**Live:** https://paulborlovan-bb.github.io/bonbila-redesign/ · German: https://paulborlovan-bb.github.io/bonbila-redesign/de/

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
| Primary (Bonbila yellow) | `#FFC20E` | buttons, highlights; text on it is always Ink |
| Ink | `#111318` | text, dark buttons |
| Navy | `#101623` | top bar, VIN request block |
| Page | `#F2F2EF` | page background |
| Surface | `#FFFFFF` | cards |
| Tile | `#F3F3F0` | product photo background (photos use `mix-blend-mode:multiply`) |
| Text secondary | `#474C55` / `#656B75` | body / meta (both pass WCAG AA on white) |
| Line | `#E3E3DE` | borders |
| Success / Warning / Error | `#137A3A` / `#8F5300` / `#B42323` | stock, fit check, errors |

**Global fonts:** Outfit (headings, prices) and Inter (body). Both are self-hosted woff2 with Romanian diacritics (latin-ext); no Google Fonts request, which is GDPR friendly.
**Radii:** 32 / 24 / 18 / 12 px, pills 999 px. **Container:** 1320 px.

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
