# Sri Vishnu Teja — project handoff / reboot script

**Last updated:** 2026-09-23 (rewritten as a full reboot script)

> **Start a new chat with this line:**
> "Read `P:\e-commerce sites\PROJECT-HANDOFF.md` and `P:\e-commerce sites\web\docs\AUDIT.md`, then continue from §13 Next steps."

---

## 0. Where we stopped (read first)

1. **Waiting on the owner:** deploy the Supabase Edge Function `shop-assistant` and add the secret
   `GROQ_API_KEY`, so the chat helper's AI answers switch on (§9, steps in §12). Everything else on the
   website side is done and verified. Until then the chat falls back to "Ask on WhatsApp" (verified).
2. **Not started:** checkout (orders in Firestore + UPI), product detail page, order status, admin and
   counter apps, deploy to Firebase Hosting, Git backup (offered, owner has not answered).
3. **The Groq API key was pasted into the chat on 2026-09-22.** Treat it as exposed: create a new key at
   console.groq.com, delete the old one, and store the new one **only** as a Supabase secret. It must
   never be written into the repo, `.env`, or any file.

## 1. What this is

A website for **Sri Vishnu Teja Books, Xerox & Cool Drinks**, a shop in Railway Kodur, Andhra Pradesh.
Customers browse stationery, snacks and drinks, add to cart, and send xerox files. **Pickup only** at the
counter: no delivery. Budget **₹0**: free services only.

## 2. Where things are

| Path | What |
|---|---|
| `P:\e-commerce sites\web\` | The website (all code). Run commands from here. |
| `P:\e-commerce sites\web\docs\AUDIT.md` | Full audit: 35 findings, fix status per batch. |
| `P:\e-commerce sites\shop_pics\` | The owner's 13 shop photos (source of many product cut-outs). |
| `P:\e-commerce sites\tools\images\` | Scripts that made the 48 product photos + the downloaded source photos. |
| `P:\e-commerce sites\serviceAccountKey.json` | Firebase admin key (secret). Used for seeding. **Move into `web\`** — that folder's .gitignore covers it. |
| `P:\e-commerce sites\stitch_sri_vishnu_teja_stationery_webstore (1)\` | Original design export (do not edit). |
| `P:\e-commerce sites\speaking-notes.txt` | Simple-language notes for the owner. |
| `P:\e-commerce sites\ECC\` | Unrelated clone from an earlier setup step. |

**There is no Git repository yet.** A Git backup was offered on 2026-09-22; the owner has not answered.

## 3. Stack

React 18 + Vite 8 + TypeScript (strict) · Tailwind CSS 4 · React Router 6 · i18next (English only)
· Firebase 12 (Firestore, Auth, Analytics) · Supabase JS 2.116 (xerox file storage only)
· three.js + @react-three/fiber 8 + drei 9 · lucide-react. Dev only: firebase-admin.
**No Zustand, no test runner, no ESLint.**

```bash
cd "P:\e-commerce sites\web" && npm run dev     # http://localhost:5173
cd "P:\e-commerce sites\web" && npm run build   # tsc --noEmit + vite build
cd "P:\e-commerce sites\web" && GOOGLE_APPLICATION_CREDENTIALS="../serviceAccountKey.json" npm run seed
```

Build health (2026-09-23): `tsc --noEmit` clean, `npm run build` passes. First-load JS ≈ 278 kB
(87 kB gz); chat panel 12.7 kB (5 kB gz) loads on demand.

## 4. Services and their state

**Firebase (project `sri-vishnu-teja-books-xerox`):**
- **Firestore:** live and seeded (11 categories, 48 products, 70 variants). Rules published and verified.
- **Auth:** Anonymous **on**, Google **on** (required before ordering). Verified working.
- **Storage:** **OFF** (needs the paid Blaze plan). Replaced by Supabase. `web/storage.rules` is unused.
- **Indexes:** `firestore.indexes.json` **not deployed**. The variants collection-group query fails with
  `failed-precondition` and the app falls back to one query per product (works, logs a warning).
  Fix: `npx firebase-tools deploy --only firestore:indexes`.
- Config: `web\.env` (`VITE_FIREBASE_*`), public identifiers.

**Supabase (project ref `uyamvsjqlxvttlrlhjrx`, Mumbai, free plan):**
- URL `https://uyamvsjqlxvttlrlhjrx.supabase.co`; `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_BUCKET=Bucket_Files` in `web\.env`.
  The publishable key is public by design. **Never use or ask for the secret / service_role key.**
- Bucket **`Bucket_Files`**: public, 25 MB limit, PDF / Word / JPEG / PNG / WebP / HEIC / HEIF.
- Policies: INSERT for `anon, authenticated` on `Bucket_Files` (added 2026-09-22, **xerox upload works**).
  No SELECT/UPDATE/DELETE policies on purpose, so visitors cannot list, change or delete files.
- Free plan: projects **pause after ~1 week idle** (Resume in the dashboard); no auto-delete of old
  files (clean up monthly); 1 GB storage.
- **Edge Functions:** `shop-assistant` is written but **not deployed yet** (§9, §12).

**Groq (AI for the chat helper):** free tier, model `llama-3.1-8b-instant`. Key lives only as the
Supabase secret `GROQ_API_KEY`.

## 5. Shop facts (confirmed by the owner)

- **Name:** Sri Vishnu Teja Books, Xerox & Cool Drinks. **Proprietor:** Gevini Murali Mohan.
- **Address:** Near Bajaj Showroom, RS Road, Railway Kodur, Tirupati Dist., Andhra Pradesh 516101, India.
- **Map pin:** 13.9531717, 79.3515113 · https://maps.app.goo.gl/yCzP1rFpVHKWxPJX7
- **Phone / WhatsApp:** 9951021282 (10 digits in `settings/shop`). **Email:** navadeeproy@gmail.com.
- **Hours:** 8 AM – 11 PM, all days, Asia/Kolkata. Pickup only. No account needed to browse.
- **Xerox:** B&W ₹2/side · bulk ₹1.5/side · double-sided sheet ₹4 · ID card copy ₹3 · lamination ₹20 ·
  laminated card copy ₹40 · colour from ₹10/page. **No spiral binding.**
- Sells at **MRP**. 11 categories, **48 products, 70 variants**.
- **Stock numbers are placeholders** (fixed pseudo-random 10–39 per variant). Not real counts.
- Confirmed true: "Instant UPI", "No waiting", "Packed and checked before you arrive", "Ready the same
  day". **"Heavy-duty laser printing" was removed.** **Telugu was removed completely** (English-only site).

## 6. Design rules (keep these)

- Tokens only, never raw hex in components: navy #1F2640, paper #FFFFFF, soft-paper #F6F5F2,
  cream #F7EFE3, powder #D6E3EF, sand #CDBB9E, soft-saffron #EDC27E, saffron #E8952B, ink #1B1F2A,
  muted #6B7280, border #E7E3DC, success #2F8F5B, error #C0453A, plus **text-only** tokens
  muted-strong #565D6B, saffron-text #8A5212, success-text #23704A, and 8 `cat-*` tints.
- Text-only tokens go on paper/soft-paper/cream/powder. **Never on soft-saffron** (use ink).
  White text on saffron fails contrast: use ink or navy.
- Body text ≥16px, badges 13–14px, tap targets ≥44px, visible two-tone focus ring (`index.css`).
- **Products now show real photos** (§7). 3D models remain on: Hero stage, category tiles, Xerox banner.

## 7. Product photos (done 2026-09-22)

- 48 files in `web/public/products/<product-id>.webp`, ~1.9 MB total. Each is **800×800, transparent
  background, product centred inside the same 640 px box**, so every card looks alike.
- Shown by `components/product/ProductPhoto.tsx` (saffron pedestal glow + lift/zoom on card hover,
  `motion-safe` only), chosen by id from `src/data/productImages.ts`. Used in `ProductCard` and `Cart`.
  A product **not** in that map falls back to its 3D model, so nothing breaks if a new product appears.
- Sources: 16 cut from the owner's `shop_pics` photos (6 backpacks, Unomax, Flair correction, Win
  Smoothie, Hauser, both geometry boxes, pen card, Krack Jack, colour + white chart rolls, Tejaswini
  notebook); the rest from shop websites (topperskit.com, starquik.com, scooboo.in, jogenii.com).
- Scripts kept in `tools/images/`: `make_images_first_row.py` (the 4 featured), `make_images_all.py`
  (the other 44), `find_images.py` (searches Shopify shop sites for candidate photos),
  `source-photos/` (the downloaded originals). Re-run with `python tools/images/make_images_all.py`.
- **Known weak photos** (small in the shop photos, a bit blurry): the 6 school bags, Krack Jack, Hauser,
  Win Smoothie, Unomax. Ask the owner for straight-on phone photos against a plain wall.
- **Similar, not exact:** register / short / rough notebooks, the slate (Rama not online), the soft drink
  (shows an 8-bottle Coca-Cola pack, not a glass bottle), buttermilk (carton, not pouch).

## 8. Code map (`web\src\`)

| Path | Purpose |
|---|---|
| `lib/firebase.ts` | App, Auth, Firestore (offline cache), Analytics (production only) |
| `lib/auth.ts` | Anonymous sign-in; Google sign-in that upgrades the same uid; sign-out to guest |
| `lib/cart.ts` | Cart store in localStorage (`svt-cart-v1`) + `useCart()` |
| `lib/catalog.ts` | Pure helpers: prices, stock, 3D model spec, brand slug, `PriceState` |
| `lib/assistant.ts` | **Shop helper engine** (§9): topics, product search, `productContext` for the AI |
| `services/` | Firestore reads, `normalise.ts`, `uploads.ts` (Supabase xerox upload), `assistantAi.ts` (calls the Edge Function) |
| `hooks/` | `useCatalog`, `useSettings`, `useAccount` — all load Firebase in a lazy chunk |
| `data/shop.ts` | Fallback `SHOP` settings, money/time/phone helpers, `isOpenNow`, `SHOP_LOCATION`, `mapEmbedUrl`, `directionsUrl` |
| `data/home.ts` | The whole catalogue: fallback data **and** the seed source |
| `data/productImages.ts` | product id → photo path (48 entries) |
| `components/` | `layout/`, `home/` (Hero, CategoryGrid, PopularProducts, HowItWorks, XeroxBanner, VisitUs), `product/` (ProductCard, **ProductPhoto**, Product3DViewer, SharedCanvas, placeholders), `shop/`, `common/`, **`assistant/`** (AssistantWidget, AssistantPanel) |
| `pages/` | Home, Shop, Cart, Xerox, OrderStatus |
| `supabase/functions/shop-assistant/index.ts` | Edge Function: Groq AI answer (outside `tsconfig`, runs on Deno) |

Key behaviours: one WebGL canvas for the page, rendered on demand · fallback catalogue with prices,
stock and counts hidden when Firestore is empty/unreachable · error boundaries per page and per canvas ·
routes lazy except Home.

## 9. Shop helper chat (done 2026-09-22)

**Step 1 — no AI, ₹0, always available.** "Ask us" button (bottom right, every page) opens a panel;
only the button is in the main bundle. `lib/assistant.ts` answers from live data:
- Topics: delivery ("we don't deliver"), xerox rates, hours + open-now, location, contact, payment, order.
- Product search: normalises + stems words, expands synonyms (bag→backpack, coke→coca-cola…), scores by
  **IDF** (rare words count more), name/brand matches ×1.5, drops matches under 3/4 of the best score.
  Shows up to 5 products with price + stock; tapping one opens `/shop?q=<name>`.
- Never shows fallback-catalogue prices (uses `PriceState`).
- All wording in `en.json` under `assistant.*`. Verified with ~30 questions on 2026-09-22.

**Step 2 — AI fallback (RAG), written but not deployed.** When step 1 has no answer
(`answer().unanswered`), the panel shows "Checking…" and calls the Supabase Edge Function
`shop-assistant` with the question plus up to 60 catalogue lines ("name | price | stock", best matches
first — the retrieval half). The function adds fixed shop facts and asks Groq to answer **only** from
them, in ≤3 simple sentences, and to send unknowns to WhatsApp. AI answers are labelled
"AI answer. Please confirm prices at the counter."
Protections: origin allow-list (localhost + the future `*.web.app`), 6 questions/min and 40/hour per IP,
200-char question cap, 220 output tokens, 15 s timeout. On any failure the panel falls back to the
WhatsApp answer (verified).

## 10. What works today

- **Home:** hero with 3D stage, 11 category tiles, 4 featured products with photos, how-it-works,
  xerox prices, Visit Us with **interactive Google map**, proprietor, email, address, Get directions.
- **Shop:** 48 products with photos, category pills, Brand/Ruling/Pages/Price filters, sort, search, Load more.
- **Cart:** add/remove, quantity, live re-pricing, saved in the browser, order sent on WhatsApp.
- **Google sign-in** required for cart orders, Xerox and Order Status. Guests can browse.
- **Xerox page:** PDF/Word/photos (10 files, 25 MB each), copies / B&W or colour / single or both sides /
  note → files upload to Supabase, WhatsApp opens with the order code and a public link per file.
  **End-to-end verified 2026-09-22** (test folders `XR-0922-4XFZ-…`, `XR-0922-8R2A-…` can be deleted).
- **Shop helper chat** (§9), step 1 live, step 2 waiting on deployment.

## 11. Still to build

- **Checkout:** orders in Firestore, order code, UPI payment link + QR, success page. Rules must
  re-check totals (no Cloud Functions on the free plan; 10 `get()` per evaluation).
- **Product detail page** (`/product/:slug`), **order status** + `/orders` with `onSnapshot`.
- **Admin** (`/admin`) and **Counter** (`/counter`) apps: orders board, print queue, pickup, stock, settings.
- **Xerox file cleanup:** scheduled deletion of old Supabase files.
- **Launch:** per-route titles/meta, security headers, cookie/consent notice (the Google map and
  Analytics set cookies), deploy to **Firebase Hosting** (`https://sri-vishnu-teja-books-xerox.web.app`).
- **Backup:** set up Git (owner has not answered).
- **Audit leftovers:** batches 4–5 in `docs/AUDIT.md`.

## 12. Owner's to-do list (given 2026-09-22)

1. **Switch on AI answers:** new Groq key → Supabase → Edge Functions → Secrets → `GROQ_API_KEY`;
   then Deploy a new function **Via Editor**, name `shop-assistant`, paste
   `web/supabase/functions/shop-assistant/index.ts`, Deploy, then turn **OFF** "Verify JWT".
2. Say yes/no to **Git backup**.
3. Answer: Tejaswini notebook 400 pages ₹90 **or** 160–192 pages ₹45? · rename "Flair Hotline Gel Pen"
   to "Fineliner"? · bulk xerox ₹1.5 from 50 or 100 sides? · shop **UPI ID** · four-line / square-ruled
   notebooks sold? · real stock counts?
4. Send clear phone photos of the weak products (§7).

## 13. Next steps (pick one)

1. **Owner says "done" on the Edge Function** → test real AI answers ("something for my kid's exam?",
   "do you have A4 sheets?"), check the labels and the rate limit.
2. **Deploy Firestore indexes:** `npx firebase-tools deploy --only firestore:indexes` (one command).
3. **Git backup:** `git init` in `P:\e-commerce sites\`, confirm `.gitignore` covers `.env`,
   `serviceAccountKey.json`, `node_modules`, then first commit.
4. **Checkout:** orders in Firestore + UPI + order code.
5. **Publish:** deploy to Firebase Hosting and share the link (then add that origin to the Edge
   Function's allow-list — it is already in the list as `*.web.app` / `*.firebaseapp.com`).
6. **Audit leftovers:** batches 4–5 in `docs/AUDIT.md`.

## 14. Working conventions in this repo

- **A hook ("GateGuard") blocks the first write/edit of every file and the first Bash command in each
  session.** State briefly: who imports the file, whether a duplicate exists, any data schema, and the
  user's instruction quoted; then repeat the same call and it succeeds.
- **Verify in the browser.** The preview pane is often hidden and **screenshots frequently come back
  blank**; use `javascript_exec` DOM checks instead (they worked reliably all session).
- Another chat may already run the dev server on port 5173; reuse it with
  `preview_start {url: "http://localhost:5173/..."}` instead of starting a second one.
- To test a Send without really opening WhatsApp, stub `window.open` and capture the URL.
- Don't add npm packages, delete files, or seed/write to Firestore without asking.
- **Never put secrets (Groq key, service_role key) in code, `.env` or any file** — Supabase secrets only.
- **Keep replies in simple words and key words**; the user relays them to the shop owner.
