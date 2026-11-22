# Architecture — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21  
**Version:** 1.0

---

## 1. System Context

```
EXTERNAL SYSTEMS
├── Firebase (Auth, Firestore, Hosting, Analytics)
├── Supabase (Edge Functions)
├── Groq (LLM)
├── Google Maps (Embed, Directions)
└── WhatsApp (Business API / Deep Links)

REACT SPA (Vite + TS)
└── APP LAYOUT (App.tsx)
    ├── UtilityBar | Navbar | Routes(Home/Shop/Xerox/Cart/OrderStatus)
    ├── Footer | MobileBottomNav | AssistantWidget | Canvas3DHost
    │
    ├── HOOKS LAYER
    │   ├── useAuth → Anonymous sign-in, uid persistence
    │   ├── useSettings → settings/shop document (cached session)
    │   ├── useCatalog → categories + products with variants (fallback bundled)
    │   ├── useCart → localStorage cart (qty, add/remove, WhatsApp message)
    │   └── useAssistant → local search → Supabase Edge Function → Groq
    │
    └── SERVICES LAYER (Typed Firestore Reads)
        ├── categories.ts → fetchCategories()
        ├── products.ts → fetchActiveProducts() (collection-group + fallback)
        ├── settings.ts → fetchSettings() (session cached)
        ├── assistantAi.ts → askShopAi() (fetch to Supabase Edge Function)
        └── uploads.ts → (future) Firebase Storage upload
```

---

## 2. Component Architecture

### 2.1 Route Structure (`App.tsx`)

```
/ (Home)           → Home.tsx → Hero, CategoryGrid, PopularProducts, HowItWorks, XeroxBanner, VisitUs
/shop              → Shop.tsx (lazy) → FilterBar, ProductGrid, load more pagination
/xerox             → Xerox.tsx (lazy) → File dropzone, print options, WhatsApp send
/cart              → Cart.tsx (lazy) → Cart items, qty controls, WhatsApp order message
/order-status      → OrderStatus.tsx (lazy) → Placeholder "coming soon"
```

### 2.2 Layout Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `UtilityBar` | `src/components/layout/UtilityBar.tsx` | WhatsApp link, Search trigger, Cart link |
| `Navbar` | `src/components/layout/Navbar.tsx` | Main navigation, auth button, mobile menu |
| `Footer` | `src/components/layout/Footer.tsx` | Contact, hours, map embed, promise |
| `MobileBottomNav` | `src/components/layout/MobileBottomNav.tsx` | 5-icon bottom bar for mobile |
| `AssistantWidget` | `src/components/assistant/AssistantWidget.tsx` | Floating chat button + panel |
| `Canvas3DHost` | `src/components/product/Product3DViewer.tsx` | Three.js canvas provider (renders once) |

### 2.3 Page Components

| Page | Key Components | State Management |
|------|----------------|------------------|
| `Home` | Hero, CategoryGrid, PopularProducts, HowItWorks, XeroxBanner, VisitUs | `useCatalog`, `useSettings` |
| `Shop` | FilterBar (search, category, brand, ruling, pages, price), ProductGrid (infinite scroll) | URL search params + `useCatalog` |
| `Xerox` | File dropzone, options (copies, bw/color, single/double, note), WhatsApp send | Local state + `useSettings` |
| `Cart` | ProductCard list, qty controls, summary, WhatsApp order | `useCart` (localStorage) |
| `OrderStatus` | Placeholder | — |

---

## 3. Data Layer

### 3.1 Firestore Collections

```
settings/
  └── shop (document) → Settings interface

categories/
  └── {slug} (document) → Category interface

products/
  └── {slug} (document) → Product interface
       └── variants/
            └── {variantId} (document) → Variant interface

orders/ (Phase 4)
  └── {autoId} (document) → Order interface

counters/ (Phase 4)
  └── {YYYY-MM-DD} (document) → { count: number }

admins/
  └── {uid} (document) → Admin interface { role: 'admin' | 'counter' }
```

### 3.2 Query Patterns

| Query | Method | Index Required |
|-------|--------|----------------|
| Active categories | `where('isActive', '==', true)` + sort by `sortOrder` | Single-field on `isActive`, `sortOrder` |
| Active products | `where('isActive', '==', true)` | Single-field on `isActive` |
| Active variants (collection-group) | `collectionGroup('variants')` + `where('isActive', '==', true)` | Collection-group index on `variants` + `isActive` |
| Variants per product (fallback) | `collection('products', id, 'variants')` + `where('isActive', '==', true)` | Single-field on `variants/isActive` |
| User orders (Phase 4) | `where('uid', '==', uid)` | Composite: `uid` + `createdAt` |

### 3.3 Offline Strategy

- `persistentLocalCache` with `persistentMultipleTabManager` in `firebase.ts`
- IndexedDB caches all reads; writes queue when offline
- Catalogue loads from cache instantly on return visits
- `useCatalog` hook serves bundled fallback (`src/data/home.ts`) if Firestore empty/unreachable

---

## 4. Service Layer

### 4.1 `categories.ts`
```typescript
fetchCategories(): Promise<Category[]>
// Reads: categories where isActive == true, sorted by sortOrder
// Used by: useCatalog hook
```

### 4.2 `products.ts`
```typescript
fetchActiveProducts(): Promise<ProductWithVariants[]>
// Strategy: Parallel fetch of products + variants (collection-group)
// Fallback: variants per product if collection-group index not deployed
// Normalization: normaliseProduct(), normaliseVariant() from normalise.ts
// Used by: useCatalog hook
```

### 4.3 `settings.ts`
```typescript
fetchSettings(): Promise<Settings>
// Reads: settings/shop document
// Cached: Session-level in useSettings hook (no re-read on route change)
// Used by: useSettings hook, Xerox page, Assistant, Footer
```

### 4.4 `assistantAi.ts`
```typescript
askShopAi(question: string, products: string[]): Promise<AiResult>
// POST to Supabase Edge Function: /functions/v1/shop-assistant
// Sends: question (max 200 chars) + top 60 product lines (name | price | stock)
// Returns: { ok: true, answer } | { ok: false, reason: 'busy' | 'unavailable' }
// Used by: AssistantPanel component
```

---

## 5. State Management

### 5.1 React Context / Hooks

| Hook | File | Scope | Persistence |
|------|------|-------|-------------|
| `useAuth` | `src/lib/auth.ts` → `src/hooks/useAccount.ts` | App-wide | Anonymous uid in localStorage |
| `useSettings` | `src/hooks/useSettings.ts` | Session | Memory (single fetch) |
| `useCatalog` | `src/hooks/useCatalog.ts` | Session | Memory + bundled fallback |
| `useCart` | `src/lib/cart.ts` | Session | localStorage (`svt-cart`) |
| `useAssistant` | `src/components/assistant/AssistantPanel.tsx` | Component | Local state |

### 5.2 Cart Data Structure (`localStorage`)

```typescript
// Key: 'svt-cart'
{
  items: CartItem[],
  updatedAt: number
}

CartItem = {
  productId: string
  variantId: string
  nameSnapshot: string
  priceSnapshot: number
  qty: number
  lineTotal: number
}
```

---

## 6. Internationalization (i18n)

### 6.1 Configuration
- **Library**: i18next + react-i18next
- **Languages**: English (`en`), Telugu (`te`)
- **Detection**: localStorage `i18nextLng` → navigator.language → fallback `en`
- **Files**: `src/i18n/en.json`, `src/i18n/te.json` (auto-loaded)

### 6.2 Usage Pattern
```typescript
const { t } = useTranslation()
t('hero.titleLine1') // "Skip the Xerox Queue."
t('product.price', { price: formatRupees(45) }) // Interpolation
```

---

## 7. 3D Graphics Pipeline

### 7.1 Components
```
Canvas3DHost (Provider)
  └── <Canvas> (@react-three/fiber)
        └── Hero3DScene (lazy loaded)
              ├── NotebookModel (notebook geometry)
              ├── PenModel (cylinder + cap)
              └── PaperStackModel (box stack)
```

### 7.2 Model System (`src/components/product/`)
- `ModelSpec`: `{ kind: ModelKind, color: ModelColor, count? }`
- `Product3DViewer`: Renders product-specific 3D model from `modelKind` + `coverColor`
- `renderLoop.ts`: Animation frame loop for auto-rotation
- `placeholders.tsx`: Fallback geometries when GLTF models unavailable
- `SharedCanvas`: Single `<Canvas>` instance shared across page (avoids re-mount)

### 7.3 Color Tokens (CSS Variables)
```css
:root {
  --cat-long: #...;
  --cat-short: #...;
  --cat-record: #...;
  --cat-pens: #...;
  --cat-pencils: #...;
  --cat-geometry: #...;
  --cat-paper: #...;
  --cat-office: #...;
  --navy: #...;
  --ink: #...;
  --paper: #...;
}
```
Resolved at runtime in `Product3DViewer` via `getComputedStyle()`.

---

## 8. AI Assistant Architecture (RAG)

### 8.1 Flow
```
User Question
      │
      ▼
Local Product Search (useCatalog products)
      │
      ├─→ Exact match on name/brand/category
      ├─→ Fuzzy match (substring)
      └─→ Category match
      │
      ▼
Top 60 matches → "name | price | stock" lines
      │
      ▼
Supabase Edge Function (shop-assistant)
      │
      ├─→ Inject SHOP_FACTS (static shop info)
      ├─→ Inject product lines as context
      ├─→ System prompt: RULES (answer ONLY from facts)
      └─→ Call Groq API (llama-3.1-8b-instant)
      │
      ▼
Answer → AssistantPanel display
```

### 8.2 Rate Limiting
- Per-IP: 6 requests/minute, 40 requests/hour
- In-memory Map in Edge Function (resets on cold start)

### 8.3 CORS Origins
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `https://sri-vishnu-teja-books-xerox.web.app`
- `https://sri-vishnu-teja-books-xerox.firebaseapp.com`
- Configurable via `ALLOWED_ORIGINS` secret

---

## 9. Security Boundaries

| Boundary | Protection |
|----------|------------|
| Firestore Reads | Rules: `isActive == true` for public; admin bypass |
| Firestore Writes | Rules: Admin only (admins/{uid} document) |
| Auth | Anonymous only; no password/email flows |
| AI Assistant | Supabase Edge Function holds Groq key; CORS restricted; rate limited |
| File Uploads | Future: Firebase Storage with signed URLs; current: placeholder |
| Environment | `.env` gitignored; `serviceAccountKey.json` gitignored |
| Analytics | Production-only; `isSupported()` guard |

---

## 10. Build & Deployment

### 10.1 Build Pipeline
```bash
npm run build
# 1. tsc --noEmit (type check)
# 2. vite build (bundle to dist/)
#    - Code splitting: lazy routes (Shop, Xerox, Cart, OrderStatus)
#    - CSS: Tailwind 4 via @tailwindcss/vite
#    - Assets: public/ copied, src/ imported assets hashed
```

### 10.2 Deploy Targets
| Target | Command | Artifacts |
|--------|---------|-----------|
| Firebase Hosting | `firebase deploy --only hosting` | `dist/` → CDN |
| Firestore Rules | `firebase deploy --only firestore:rules` | `firestore.rules` |
| Firestore Indexes | `firebase deploy --only firestore:indexes` | `firestore.indexes.json` |
| Supabase Edge Function | Dashboard → Edge Functions → Deploy | `supabase/functions/shop-assistant/index.ts` |

### 10.3 Environment Promotion
```
Local (.env) → Staging (Firebase preview channel) → Production (Firebase live channel)
```

---

## 11. Performance Characteristics

| Metric | Current | Target |
|--------|---------|--------|
| First Paint | ~688ms (Vite ready) | < 1s |
| Catalogue Load | Firestore (online) / Instant (cached) / Bundled (offline) | < 500ms |
| 3D Scene Init | Lazy, after first paint | Non-blocking |
| Bundle Size | ~200KB JS (gzipped) | < 300KB |
| LCP | Hero image + 3D canvas | < 2.5s |

---

## 12. Known Technical Debt

1. **No test suite** — Unit, integration, or E2E tests missing
2. **TypeScript strictness** — Some `any` in normalise.ts, assistant types
3. **Error boundaries** — Page-level only; component-level would improve resilience
4. **Bundle analysis** — No `vite-bundle-analyzer` or similar configured
5. **Accessibility audit** — Manual only; no automated aXe/pa11y checks
6. **Telugu completeness** — Some translation keys may fallback to English
7. **Service worker** — No PWA/offline support beyond Firestore cache

---

*Update this document when architecture changes meaningfully.*