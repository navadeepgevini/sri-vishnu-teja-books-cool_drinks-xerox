# Sri Vishnu Teja web app — Audit

**Date:** 2026-09-18 · **Scope:** `P:\e-commerce sites\web\` (all source, config, rules, seed script) plus the live Firebase project `sri-vishnu-teja-books-xerox` (read-only checks)
**Method:** type check, build, `npm test`, `npm audit`, source greps, and read-only runtime probes in the dev server at 1440 / 768 / 390 px in English and Telugu. No code, data or Firestore document was changed. The only file written is this report.

**Totals: 35 findings — 3 Blocker · 8 Major · 16 Minor · 8 Polish**

## Fix status

| Batch | Findings | Status |
|---|---|---|
| 0 — Firebase console | #1, #4 | **Fixed.** Rules live: unknown paths and a non-admin write to `settings/shop` are both refused with `permission-denied` (verified 2026-09-18). Anonymous auth works. The variants collection-group index is **not deployed yet**; the site falls back to per-product queries. |
| Seed | #2 | **Fixed 2026-09-18.** Seeded: `settings/shop`, 11 categories, 48 products, 70 variants (owner's MRPs; stock is a placeholder of 10–39). Telugu removed and Google sign-in added at the owner's request. |
| 1 — Real data and copy | #2, #3, #10, #27 | **In progress.** `data/home.ts` now holds the owner's real catalogue (41 products, 59 variants at MRP; stock is a placeholder of 50). #22 fixed along the way (`labelTe` on variants). Still open: seeding (#2, needs a service-account key), 11 items that only have a price range, claims (#10), and the xerox price clarifications. |
| 2 — Robustness | #5, #6, #7, #8, #9, #16, #17, #32 | **Done 2026-09-18.** Verified: build passes; 23/23 checks with bad documents; error boundary catches the #9 crash; offline now falls back instead of "no matches"; Home and Shop show no ₹ in fallback mode; Try again refetches; 390 px Shop grid clean (0 contrast failures, no overflow, no small targets) in en and te. D6 was answered with the recommended default: bundled catalogue shown, prices, stock and counts hidden. |
| 3 — Performance | #12, #13, #14, #25 | **Done 2026-09-18, except one check.** #12: `frameloop="demand"`; frames are requested on scroll, resize, DOM change, font load and viewer hover/drag, and continue only while a model is still moving. The live 3D check is **still unverified**, because the preview tab stayed hidden. #13: one collection-group query for variants (new rule and index added), with a per-product fallback until they're deployed; the fallback was verified live. Note: this saves round trips (14 → 3 queries), not document reads. #14: failed or empty settings and catalogue loads are kept for the session and retried on `online` or Try again; verified: 0 re-reads across 4 page changes, and Try again forces a reload. #25: every page except Home is lazy; first-visit JS went from 293.7 → 283.3 kB. |
| 4–5 | #15, #18–#24, #26, #28–#31, #33–#35 | Open. |

## Verification notes

- **Runtime Firebase probes were read-only.** Test-mode rules: `getDocsFromServer` on a collection no rule allows. Seed state: `getDocFromServer('settings/shop')` and the active-category query. Offline behaviour: `disableNetwork` on the local client only, re-enabled afterwards.
- **The preview tab was hidden during this audit.** `document.visibilityState = "hidden"` and `requestAnimationFrame` never fired, so 3D views could not mount. Findings that depend on live 3D rendering say so. Layout, contrast and tap-target measurements don't need painting and ran normally.
- **"unverified"** marks anything I could not reproduce; the row says what it would take to check.

---

## Routes

| Route | Status | Notes |
|---|---|---|
| `/` | **Complete** | Settings and catalogue come from Firestore, with the bundled fallback while it's empty or unreachable (today: fallback). |
| `/shop` | **Partial** | Filters, sort, search and load-more all work. It stays empty until Firestore is seeded (#2), and cards don't link to a product page (Phase 2). |
| `/xerox` | **Stub** | `src/pages/Xerox.tsx:10` → `pages.xerox.body` = "Document upload is coming soon." |
| `/order-status` | **Stub** | `src/pages/OrderStatus.tsx:10` → "Order tracking is coming soon." |
| `/cart` | **Stub** | `src/pages/Cart.tsx:10` → "Your cart is coming soon." |
| `*` | Complete | Redirects to `/` (`src/App.tsx:63`). |

Not yet present (planned): `/product/:slug`, `/checkout`, `/order/:code`, `/orders`, `/admin/*`, `/counter/*`.

## Build health (verbatim)

- **`npx tsc --noEmit`:** exit 0, no output.
- **`npm run build`:** passes (`✓ built in 1.59s`), with one warning:
  ```
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rolldownOptions.output.codeSplitting to improve chunking
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```
  Both chunks it refers to (`firebase` 625.78 kB, `View` 864.42 kB) are already lazy-loaded.
- **`npm test`:** `npm error Missing script: "test"`. There are no tests (#23).
- **Lint:** no ESLint config exists (#23).
- **`npm audit`:** 4 moderate. 2 are in production dependencies (react-router) and 2 in dev only (uuid via firebase-admin → gaxios). See #24.
- **Console on every load:** two React Router v7 future-flag warnings and `THREE.Clock: This module has been deprecated` (#30). While Anonymous auth is disabled there is also `Failed to load resource: 400` and `auth/configuration-not-found` (#4).

## Areas checked and found clean

- **Contrast:** 0 failures across 122–127 text/background pairs on Home and 27–32 on Shop, in English and Telugu, at 1440, 768 and 390 px. The lowest ratio is 5.52:1.
- **Tap targets:** none under 44×44 px on Home or Shop at any of the three widths.
- **Overflow and clipping:** no horizontal page overflow and no clipped text at 1440, 768 or 390 px in either language. In the 2-column phone card (173 px) nothing overflows either; checked by narrowing a live card in the browser.
- **i18n:** 132 keys in both `en.json` and `te.json`, none missing on either side, no unused keys, and no hard-coded UI strings in JSX. (The only English shown in Telugu mode comes from data: #22.)
- **Secrets:** there's no git repo, so nothing is committed. `.env` holds only the public web config, and the API key appears nowhere outside `.env`. No service-account or private key exists in the tree. `.gitignore` covers `.env`, `serviceAccountKey.json` and `*-firebase-adminsdk-*.json`.
- **Rules vs code:** every current read (`settings/shop` get; `categories`, `products` and `variants` queries on `isActive == true`) is allowed by `firestore.rules`, and the client makes no writes. The rules are not deployed, though (#1).
- **Indexes:** today's queries use single-field equality only, so no composite index is needed yet. Three are declared for later phases. Whether they're deployed is **unverified** (needs `firebase-tools` login).
- **Shop facts:** hours 8 AM–11 PM, ₹2/₹1.5, lamination ₹20/₹40, pickup only, no login — all correct. No mention of spiral binding, colour xerox, scanning, typing or photo printing anywhere in `src` (grep).
- **WebGL contexts:** one shared canvas. This was verified in earlier visible sessions; it could not be re-checked this session because the tab was hidden.
- **State:** there's no cart state yet. The language choice persists in `localStorage` (`svt-lang`). Shop filters persist in the URL. "Load more" resets whenever a filter changes, which is intended.

---

# Part 1 — Findings

| # | Severity | Area | What's wrong | File:line | Why it happens (root cause, verified) | How to fix | Effort |
|---|---|---|---|---|---|---|---|
| 1 | **Blocker** | Firebase / security | **Firestore is open to anyone.** Any visitor can read, overwrite or delete every document. Test-mode rules also expire after 30 days, and then every read fails, including the site's own. | `firestore.rules:1` (written but not deployed) | An unauthenticated browser read of `zz_rule_probe` succeeded with `getDocsFromServer`. `firestore.rules` has no match for that path, so a deployed copy would deny it. So the live rules are still the console's test-mode defaults. | Publish `firestore.rules`: Firebase console → Firestore → Rules → paste → Publish, or `npx firebase-tools deploy --only firestore:rules,firestore:indexes` from `web/`. Then repeat the probe and expect `permission-denied`. | S |
| 2 | **Blocker** | Data | **The database is empty.** `/shop` shows no products for anyone, and `settings/shop` doesn't exist. | `scripts/seed.ts:1` (never run) | `getDocFromServer(doc('settings','shop')).exists()` returned `false`, and the active-category query returned 0 documents. The seed needs `web/serviceAccountKey.json`, which isn't present. | After #3, create a service-account key, save it as `web/serviceAccountKey.json`, and run `npm run seed`. Then check `/shop` lists 12 products. | S |
| 3 | **Blocker** | Correctness / money | **Invented prices, stock and counts are shown as real.** Home currently shows sample prices (₹50, ₹75, ₹60…), "Only 6 left!", "View all 12 items" and "2 items" per category. Seeding as-is would publish the same numbers to Firestore. | `src/data/home.ts:29-165`, `src/hooks/useCatalog.ts:46-50` | `home.ts` is SAMPLE data. It serves as both the Home fallback (`useCatalog({ fallback: true })` at `CategoryGrid.tsx:22` and `PopularProducts.tsx:9`) and the seed source (`scripts/seed.ts:12`). | Replace `FALLBACK_PRODUCTS` with the owner's real products, prices and stock before seeding. Separately, in fallback mode don't show prices or stock: pass `status` into `ProductCard` and hide the price and stock chip when it's `'fallback'`. | M + owner data |
| 4 | Major | Firebase / auth | **Anonymous sign-in fails**, so no visitor gets a uid. This blocks orders (Phase 4), and every page load logs a 400 plus a warning. | `src/lib/auth.ts:19` | Firebase returned `auth/configuration-not-found` and `auth.currentUser` is `null`. That error means the Authentication product has not been initialised for this project. | Firebase console → Authentication → Get started → Sign-in method → Anonymous → Enable. Then check the console shows no 400 and `auth.currentUser.uid` is set. No code change. | S |
| 5 | Major | Robustness | **There's no error boundary.** Any render error, lazy-chunk load failure (offline, or after a redeploy changes the chunk hashes) or WebGL failure unmounts the whole app and leaves a blank page. | `src/App.tsx:30-50`, `src/components/product/Product3DViewer.tsx:32,170` | grep finds 0 `ErrorBoundary`/`componentDidCatch`/`getDerivedStateFromError` in `src`. `Suspense` wraps the lazy 3D chunks with no boundary. A render-time throw is reproducible via #9. The WebGL-failure path is **unverified**: it needs Chrome started with `--disable-gpu --disable-software-rasterizer`. | Add an `ErrorBoundary` class component in `src/components/common/`. Wrap `<Outlet/>` in `App.tsx` with a full-page fallback (i18n message plus a Reload button). Wrap `<Canvas3DHost/>` and each viewer's `<Suspense>` in a silent boundary that renders nothing, so a 3D failure never takes the page down. | M |
| 6 | Major | Robustness / UX | **Shop says "No items match these filters" when the catalogue is empty or the device is offline**, and offers "Clear filters" even when no filter is set. | `src/services/categories.ts:7`, `src/services/products.ts:10`, `src/pages/Shop.tsx:124` | With the network disabled, `fetchCategories()` **resolved with 0 items and no error**: `getDocs` silently falls back to the persistent cache (`firebase.ts` `persistentLocalCache`). `useCatalog` then sets `status: 'ready'` (`useCatalog.ts:51`), and Shop renders `EmptyState`. | In both fetchers, if `snap.metadata.fromCache && snap.empty`, throw `new Error('unavailable')` so Shop shows `ErrorState` with Retry. In `Shop.tsx`, if `products.length === 0` and no filter is set, show a new "Catalogue is being updated" message instead of `EmptyState`. | S |
| 7 | Major | Data / UX | **Home and Shop disagree:** Home shows 12 products and per-category counts, while `/shop` shows none. A customer clicking "View all 12 items" lands on an empty page. | `src/components/home/CategoryGrid.tsx:22`, `PopularProducts.tsx:9`, `src/pages/Shop.tsx:45` | Home calls `useCatalog({ fallback: true })`, which falls back to sample data when Firestore is empty or unreachable (`useCatalog.ts:46,55`). Shop calls it with `fallback: false`. Observed live: Home tiles read "2 items" while `/shop` showed the empty state. | Pick one policy (decision D6): (a) Shop also uses the fallback, or (b) Home hides its catalogue sections, or shows skeletons, while `status === 'fallback'`. (b) pairs with the #3 fix. | S |
| 8 | Major | Money | **A product with no active variants shows "₹0"**, plus "Out of stock". It also matches the "Under ₹50" filter and sorts first by price. | `src/lib/catalog.ts:7`, `src/components/product/ProductCard.tsx:37,61` | `minPrice()` returns `0` for an empty `variants` array. Verified: `formatRupees(minPrice({ variants: [] }))` → `"₹0"`. `fetchActiveProducts` keeps such products. | In `services/products.ts`, drop products whose active `variants` array is empty. Have `minPrice` return `null` for no variants and hide the price row in `ProductCard` when it's `null`. | S |
| 9 | Major | Robustness / data | **No runtime validation of Firestore documents:** one bad field crashes the page. A product without `brand` throws during Shop render; a mistyped `timeZone` in settings throws on every page; missing `nameTe`/`nameEn` renders an empty title. Combined with #5, the result is a blank site. | `src/services/products.ts:15,18`, `src/services/categories.ts:9`, `src/services/settings.ts:9`, `src/lib/catalog.ts:25`, `src/components/common/OpenBadge.tsx:9-10` | The services cast with `d.data() as Omit<Product,'id'>` and never check the shape. Verified: `brandSlug(undefined)` → `TypeError: Cannot read properties of undefined (reading 'trim')`, called for every product in `filterOptions`/`applyFilters`. `new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkatta' })` → `RangeError`. Nothing stops an admin or console edit from writing either. | Add `normaliseProduct`/`normaliseVariant`/`normaliseCategory`/`normaliseSettings` in the services. Defaults: `brand ''`; each name falls back to the other language; unknown `colorToken` → `'cat-long'`; test `timeZone` inside a try and fall back to `'Asia/Kolkata'`; clamp numbers ≥ 0. Skip a document that lacks `nameEn` or `categoryId`, with a `console.warn`. No new package. | M |
| 10 | Major | Correctness / claims | **Unconfirmed claims made to customers:** "Instant UPI"; "get instant confirmation with your pickup code" (no checkout or pickup-code exists yet); "Packed and checked before you arrive"; "No waiting" (×3); "Heavy-duty laser printing"; "Secure UPI payment"; "Ready the same day" (×3, chosen in place of 30-min but still unconfirmed). | `src/i18n/en.json:53,56,58,65,94,102,108,112,138,146` (same keys in `te.json`) | The copy was carried over from the Stitch design and the earlier session; none of it has owner confirmation, and the UPI and pickup-code features don't exist. | Get the owner's yes or no on each claim (D2). Rewrite rejected ones neutrally, e.g. `hero.chipUpi` → "Pay by UPI" and `how.pay.body` → "Pay with any UPI app. Your order code is shown after you order." Change both en and te. | S + owner |
| 11 | Major | Dead ends | **Primary actions lead to "coming soon" pages:** "Upload for Xerox" (3 places), every "Add to Cart", the navbar "Order Status", and bottom-nav Xerox, Cart and Orders. | `Hero.tsx:45`, `UtilityBar.tsx:41`, `XeroxBanner.tsx:50`, `ProductCard.tsx:64-66` (TODO), `Navbar.tsx:72`, `MobileBottomNav.tsx:8-10` | Phases 3–5 aren't built; the target pages are placeholders (see Routes). | Build Phases 3–5. Until then, don't publish the site, or hide these links behind a `LAUNCHED_FEATURES` constant. | L |
| 12 | Minor | Performance | **The 3D canvas redraws every frame, forever.** Once any model has been near the viewport, a full-screen canvas at up to 1.75× DPR is cleared and redrawn about 60 times a second, even when every model is off-screen and still. That costs battery and heat on phones. | `src/components/product/SharedCanvas.tsx:17` | `<Canvas>` sets no `frameloop`, so react-three-fiber v8 defaults to `"always"`, and `ClearEachFrame` runs on every tick. Verified from the code and the r3f default; the actual power draw is **unverified** (needs a visible tab and the Performance panel). | Set `frameloop="demand"`. In `placeholders.tsx` `Scene`, call `invalidate()` from `useFrame` only while `motion.spinning`, `motion.dragging`, or the rotation is still damping (`abs(target − current) > 0.001`). Product3DViewer's pointer handlers also call `invalidate()`. | M |
| 13 | Minor | Performance / cost | **One Firestore query per product for variants.** One session costs 1 + 1 + N queries: 14 queries and about 43 document reads for 12 products, and about 300 queries at 300 products. At about 43 reads per fresh visit, the Spark limit of 50k reads/day allows roughly 1,150 visitors a day. Home also loads the whole catalogue just to show 4 cards and 8 counts. | `src/services/products.ts:13` | `fetchActiveProducts` runs `getDocs(collection(d.ref, 'variants'))` inside `snap.docs.map`. | Replace it with one `collectionGroup('variants')` query filtered on `isActive`. That needs a `match /{path=**}/variants/{variantId}` rule and a collection-group single-field index. Or denormalise `minPrice` and `stockTotal` onto the product document. | M |
| 14 | Minor | Performance | While `settings/shop` is missing or unreachable, **each newly mounted `useSettings` consumer triggers another Firestore read**, repeating on every navigation. | `src/hooks/useSettings.ts:10` | `fallback()` sets `pending = null` so the next call retries. Seven components use the hook. | Keep the fallback promise cached for the session; retry only on the `window` `online` event or an explicit refresh. | S |
| 15 | Minor | Data freshness | Catalogue and settings are **cached for the whole session**, so price, stock or hours edits need a full page reload. That conflicts with Phase 6's "edits appear immediately". | `src/hooks/useCatalog.ts:16-19`, `src/hooks/useSettings.ts:20` | Module-level `loaded`/`pending` caches with one-shot `getDoc`/`getDocs` calls. | Switch to `onSnapshot` for `settings/shop` and the product/variant queries (Phase 6), or refetch on `visibilitychange`. | M |
| 16 | Minor | Robustness | A category with an unknown `colorToken` gets a 3D material with **an empty colour string**. The tile tint falls back correctly; the model doesn't. | `src/lib/catalog.ts:57`, `src/components/product/placeholders.tsx:13-22` | `categoryModel` passes `colorToken` through unchecked, unlike `productModel`. Verified: the CSS variable for `cat-unknown` resolves to `""`, which reaches `new THREE.Color("")`. The resulting colour on screen is **unverified** (needs a visible tab). | In `categoryModel`, use `MODEL_COLORS.includes(token) ? token : 'cat-long'`, the same check `productModel` does. | S |
| 17 | Minor | Robustness | **The phone formatter assumes exactly 10 digits.** Verified: `formatPhone('09951021282')` → `"+91 09951 021282"`, and the `tel:` and `wa.me` links become `+9109951021282`, which is invalid. | `src/data/shop.ts:31`, `telHref`/`whatsappHref` at `:26-27` | The value is used as-is with no digit normalisation. The admin app (Phase 6) will let someone type any format. | Add `normalisePhone(v) = v.replace(/\D/g, '').replace(/^(91\|0)(?=\d{10}$)/, '')` and use it in `formatPhone`, `telHref` and `whatsappHref`. Validate 10 digits in the admin form. | S |
| 18 | Minor | UX | **Navbar search drops the current Shop filters:** searching "blue" from `/shop?cat=pens` goes to `/shop?q=blue`. | `src/components/layout/Navbar.tsx:24` | `navigate({ pathname: '/shop', search: '?q=…' })` replaces the whole query string. | When `location.pathname === '/shop'`, copy the current params, set `q`, and navigate with them. | S |
| 19 | Minor | UX / a11y | Below 1280 px the **"Search" icon just opens `/shop`** and doesn't focus the search box its label promises. | `src/components/layout/Navbar.tsx:78` | It's a plain `Link to="/shop"`. | Link with `state: { focusSearch: true }` and add `autoFocus` or `ref.focus()` on `#shop-search` in `Shop.tsx` when that state is present. | S |
| 20 | Minor | Data | **`productCount` goes stale.** It's written only by the seed script, so adding or deactivating products in the console leaves the Home tile counts wrong. | `data/home.ts:172`, `CategoryGrid.tsx:51`, `PopularProducts.tsx:12` | The count is a stored, denormalised field and no code maintains it (there are no Functions). | Compute the counts from the already-loaded products (`products.filter(p => p.categoryId === c.id).length`) and stop reading the stored field. | S |
| 21 | Minor | Accessibility | **3D rotation is drag-only.** With `prefers-reduced-motion`, auto-rotate is off and there is no keyboard or single-pointer way to rotate: WCAG 2.2 SC 2.5.7 (Dragging Movements, AA). | `src/components/product/Product3DViewer.tsx:125-162` | Only pointer-drag handlers exist, and the viewer isn't focusable. | Add 44 px "Rotate left / Rotate right" buttons that change `motion.angle` by ±π/4, on the Hero stage now and on the Phase 2 product page. | S |
| 22 | Minor | i18n | **Variant labels show in English in Telugu mode** on pen, pencil, paper and box cards (e.g. "Blue · Pack of 5"). | `src/components/product/ProductCard.tsx:33`, `src/types/models.ts` (`Variant`) | Pages and ruling are translated; everything else falls back to `variant.label`, and the model has no `labelTe`. | Add `labelTe` to `Variant` and the seed data, and pick the label by language in `ProductCard`. | S + data |
| 23 | Minor | Tooling | **No tests and no linter.** Filter and sort logic (and the Phase 3 pricing engine) has no protection, and hook-dependency mistakes aren't caught. | `package.json` (no `test` script, no ESLint config) | Neither was set up in Phase 1. | Add Vitest and ESLint with `eslint-plugin-react-hooks` as dev dependencies (needs your approval, D8). First tests: `lib/catalog.ts` and `components/shop/filters.ts`, using the 13 cases already run by hand. | M |
| 24 | Minor | Dependencies | `react-router-dom` 6.30.x has **2 moderate advisories**: GHSA-wrjc-x8rr-h8h6 (open redirect via backslash in `<Link>`/`useNavigate`) and GHSA-337j-9hxr-rhxg (SSR only; not used). `uuid <11.1.1` comes in via firebase-admin → gaxios (dev only). | `package.json` | Pinned to v6 in Phase 0. The only programmatic navigation uses a fixed pathname (`Navbar.tsx:24`), so the redirect vector isn't reachable today. | Upgrade to `react-router-dom@7`, which supports React 18 (needs approval, D8), and run `npm audit fix` for uuid. | S-M |
| 25 | Minor | Performance | **Routes aren't code-split.** Every page is in the 290 kB (91.9 kB gz) main chunk, and it will grow with the admin and counter apps, which customers would then download. | `src/App.tsx:9-13` | The page imports are static. | Use `React.lazy` for each page plus `<Suspense>` inside the #5 boundary. | S |
| 26 | Minor | Privacy | **Production sets Google Analytics cookies (`_ga`, `_ga_KWRZ3GRXNZ`) with no consent notice.** | `src/lib/firebase.ts:36` | Added at your request; there's no consent UI. | Decision D7: add a consent banner and call `getAnalytics` only after consent, or drop Analytics until launch. | S |
| 27 | Minor | Correctness | The **category name "Paper & Binding Covers"** may suggest a binding service, which the shop doesn't offer. | `src/data/home.ts:183` | Carried over from the Stitch design. | Owner decides (D3), e.g. "Paper & Book Covers". | S |
| 28 | Polish | Accessibility | Shop goes from the `h1` straight to product `h3`s, with no `h2`. | `src/pages/Shop.tsx:86`, `ProductCard.tsx:54` | ProductCard hard-codes `h3`, which is right on Home under a section `h2`. | Add `<h2 className="sr-only">` (i18n "Products") above the grid in `Shop.tsx`. | S |
| 29 | Polish | i18n | Telugu mixes scripts, e.g. "మూసి ఉంది · 8 AMకి తెరుస్తాం". | `src/data/shop.ts` `formatTime`, `OpenBadge.tsx:41` | Verified: `Intl.DateTimeFormat('te-IN', { hour: 'numeric', hour12: true })` outputs `"8 AM"` and `"11 PM"`. | For Telugu, format as "ఉదయం 8" / "రాత్రి 11" with a small day-period map; confirm in the native review. | S |
| 30 | Polish | Console noise | Warnings on every load: two React Router future flags and `THREE.Clock` deprecated. | `src/App.tsx:55` (`<BrowserRouter>`); `@react-three/fiber` v8 | The v7 flags aren't opted into. `THREE.Clock` is used inside r3f v8, which can only be fixed by moving to r3f v9, and that needs React 19. | Use `<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>`. Accept the THREE warning. | S |
| 31 | Polish | SEO | One English meta description and one title for every route. | `index.html:8`, `src/i18n/index.ts:20` | Static HTML; only `meta.title` is swapped by language. | Per-route title and description from i18n (Phase 8). | S |
| 32 | Polish | UX | When the database is empty, Home can paint one frame of empty Categories and Popular sections if the visitor came from `/shop` first. | `src/hooks/useCatalog.ts:36` | The initial state uses the cached `loaded` value even when it holds 0 categories, and the effect swaps in the fallback afterwards. | In the initialiser, only use `loaded` when `loaded.categories.length > 0 \|\| !fallback`. | S |
| 33 | Polish | Layout | In the 2-column phone grid, the Telugu "Add to Cart" button wraps to 3 lines (54 px tall), versus 2 lines (44 px) in English. | `src/components/product/ProductCard.tsx:65-72` | 139 px of button width for "కార్ట్‌కు జోడించండి". Measured on a live card narrowed to 173 px. | Shorter Telugu label ("కార్ట్‌కి") or icon-only below 15 rem, keeping the visible text in `sr-only`. Native review. | S |
| 34 | Polish | Hosting | `firebase.json` hosting sets no security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`) and no long-cache headers for hashed assets. | `firebase.json:6-10` | No `headers` block. | Add `headers`: `Cache-Control: public,max-age=31536000,immutable` for `/assets/**`, plus basic security headers (Phase 8). | S |
| 35 | Polish | Security rules | Variants of an **inactive** product can still be read by direct path, if the variant itself is active. | `firestore.rules:38-39` | The variant rule only checks the variant's own `isActive`. | Add `&& get(/databases/$(database)/documents/products/$(productId)).data.isActive == true` (one extra rule read per variant read). Low priority. | S |

---

# Part 2 — Fix plan

Batches are ordered so each one is safe on its own and later batches build on earlier ones.

### Batch 0 — Firebase console (you; no code) → #1, #4
- **Do:** publish `firestore.rules` (and the indexes); enable Anonymous auth.
- **Risks:** a rules mistake could block the site's own reads. The rules have been checked against every current read; none exists outside `isActive == true` queries and `settings/shop`.
- **Test:**
  - Reload Home and Shop: no `permission-denied` in the console, and `auth.currentUser.uid` is set.
  - The rules test you asked for in Phase 1: from the browser console, `setDoc(doc(db,'settings','shop'), {...})` must fail with `permission-denied`, and the `zz_rule_probe` read must fail too.

### Batch 1 — Real data and copy (owner answers first) → #3, #10, #27, then #2
- **Do:** replace the sample catalogue with real products, prices and stock; fix or remove the claims; rename the category if needed; then run the seed.
- **Risks:** the seed overwrites `settings/shop`, so run it before anyone edits settings in the console.
- **Test:** `/shop` lists the real products. Tile counts match. The filters and sort (the 13 manual cases) still pass. Telugu strings are updated in parallel.

### Batch 2 — Robustness (code) → #5, #9, #8, #16, #17, #6, #7, #32
- **Do:** add error boundaries; normalise documents in the services; hide ₹0 and drop products with no variants; validate colour tokens and phone numbers; distinguish offline from empty; apply one fallback policy.
- **Risks:** this touches the data layer shared by Home and Shop, and the normalisers could hide a product that should show.
- **Test:**
  - `tsc` and `build`.
  - Feed deliberately bad documents through the normalisers (missing `brand`, empty `variants`, bad `timeZone`, 11-digit phone) and check nothing crashes.
  - Offline via `disableNetwork` → Shop shows Retry.
  - Throw inside a component → the boundary UI appears.
  - Visual check of Home and Shop at 1440, 768 and 390 in both languages.

### Batch 3 — Performance → #12, #13, #14, #25
- **Do:** switch the canvas to on-demand frames; load variants in one query (with its rule); cache the settings fallback; lazy-load routes.
- **Risks:** `frameloop="demand"` can freeze animation if an `invalidate()` is missed. The collection-group query needs a rule change (redeploy the rules).
- **Test:**
  - Hover-rotate on desktop, visible-rotate on mobile, drag, and reduced-motion.
  - Idle GPU/CPU in the Performance panel before and after.
  - Firestore requests per visit, counted in the Network tab.
  - Chunk sizes per route from `npm run build`.

### Batch 4 — UX, a11y and i18n → #18, #19, #21, #22, #28, #29, #33
- **Risks:** low; UI-only. #22 needs a data-model field (`labelTe`), so do it together with the Batch 1 data.
- **Test:** keyboard-only walkthrough; screen-reader headings list; Telugu screenshots at 390 px.

### Batch 5 — Tooling and dependencies (needs approval) → #23, #24, #30
- **Risks:** react-router v7 changes behaviour, which is why the future flags (#30) come first.
- **Test:** full click-through of every route, including search and the `/#popular` hash link; `npm audit` shows 0 production advisories.

### Deferred to their phases → #11 (Phases 3–5), #15 (Phase 6), #20 (Phase 6 admin keeps counts), #26 (before launch), #31, #34 (Phase 8), #35 (with the next rules change)

## Decisions needed from you or the shop owner

| # | Question | Blocks |
|---|---|---|
| D1 | Real product list with prices, MRP, stock and the low-stock threshold (the CSV template in the plan) | #2, #3 |
| D2 | Which claims are true: instant UPI, pickup code, "packed and checked", "no waiting", "heavy-duty laser", "secure UPI", "ready the same day" | #10 |
| D3 | Category name "Paper & Binding Covers": keep or rename? | #27 |
| D4 | WhatsApp and phone: 99510 21282 or 99410 21282? (still a TODO in `data/shop.ts:6`) | contact links |
| D5 | Bulk xerox threshold: 50 or 100 sides? (`data/shop.ts:11`); plus the shop's UPI ID (`data/shop.ts:19`) | pricing, Phase 4 |
| D6 | When Firestore is empty or unreachable: show the bundled catalogue (with prices hidden) or hide the catalogue sections? | #3, #7 |
| D7 | Analytics: add a consent banner, or turn Analytics off until launch? | #26 |
| D8 | Approve new dev tooling (Vitest, ESLint) and the react-router v7 upgrade | #23, #24 |
