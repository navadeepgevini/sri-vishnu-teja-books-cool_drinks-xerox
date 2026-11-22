# Data Flow — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. User Session Flow

```
USER VISITS WEBSITE
         │
         ▼
ANONYMOUS AUTH (src/lib/auth.ts)
  1. Check localStorage for existing uid
  2. If none: signInAnonymously() → store uid in localStorage
  3. If exists: signInWithCustomToken() or re-authenticate
  4. uid persists across sessions (localStorage)
         │
         ▼
PARALLEL INITIALIZATION
├── useSettings (hooks/useSettings.ts)
│   fetchSettings() → settings/shop doc → Session cache
├── useCatalog (hooks/useCatalog.ts)
│   loadCatalog() → fetchCategories() + fetchActiveProducts() → Fallback: bundled
└── useCart (lib/cart.ts)
    read localStorage 'svt-cart' → parse JSON or init empty
         │
         ▼
RENDER LAYOUT + HOME PAGE
```

---

## 2. Catalogue Data Flow

### 2.1 `useCatalog` Hook (`src/hooks/useCatalog.ts`)

```typescript
// State machine: loading → ready | fallback
// Single-flight: loadCatalog() runs once per session (module-level promise)

loadCatalog():
  1. Dynamic import services (code-split)
  2. Parallel: fetchCategories() + fetchActiveProducts()
  3. If both empty → status: 'fallback', data: FALLBACK_CATALOG
  4. If error → status: 'fallback', data: FALLBACK_CATALOG, log warning
  5. Success → status: 'ready', cache in module-level `loaded`
  6. Online event → forgetFailedLoad() → retry on next mount
```

### 2.2 `fetchCategories()` (`src/services/categories.ts`)

```
Firestore Query:
  collection('categories')
  .where('isActive', '==', true)
  .get()

Transform:
  1. normaliseCategory(id, data) → Category | null
  2. Filter nulls
  3. Sort by sortOrder ascending

Return: Category[]
```

### 2.3 `fetchActiveProducts()` (`src/services/products.ts`)

```
PARALLEL:
  A. Products query:
     collection('products')
     .where('isActive', '==', true)
     .get()

  B. Variants query (collection-group, preferred):
     collectionGroup('variants')
     .where('isActive', '==', true)
     .get()
     → Group by productId (parent.parent.id)
     
     ON FAILURE (failed-precondition / permission-denied):
     → Fallback: variantsPerProduct(productIds[])
        For each productId:
          collection('products', id, 'variants')
          .where('isActive', '==', true)
          .get()

MERGE:
  For each product doc:
    normaliseProduct(id, data, variants[])
    → ProductWithVariants | null (filtered if no name/category/sellable variant)
  Sort: featured first, then by name

Return: ProductWithVariants[]
```

### 2.4 Normalization (`src/services/normalise.ts`)

```
normaliseCategory(id, data):
  - Validate: nameEn, colorToken, icon, sortOrder, isActive
  - Derive: slug = id, nameTe = nameEn, productCount = 0 (computed later)
  - Return Category or null

normaliseProduct(id, data, variants):
  - Validate: categoryId, nameEn, brand, modelKind, coverColor, isActive
  - Derive: slug = id, nameTe = nameEn, description = data.description ?? ''
  - Filter variants: isActive, stockQty > 0, price > 0
  - Sort variants: price ascending
  - Return ProductWithVariants or null

normaliseVariant(id, data):
  - Validate: label, price, mrp, stockQty, isActive
  - Coerce: pages, ruling, size (nullable)
  - Return Variant or null
```

---

## 3. Settings Data Flow

### 3.1 `useSettings` Hook (`src/hooks/useSettings.ts`)

```typescript
// Session-level cache (module-level Promise + variable)

fetchSettings():
  1. getDoc(doc(db, 'settings', 'shop'))
  2. If exists: normaliseSettings(data) → Settings
  3. If not exists / error: return SHOP fallback (src/data/shop.ts)
  4. Cache in module-level `loadedSettings`
  5. Return cached on subsequent calls
```

### 3.2 Settings Usage

| Consumer | Fields Used |
|----------|-------------|
| Xerox Page | normalRate, bulkRate, bulkLimit, doubleSideRate, cardCopyRate, colorRate, laminationOnly, laminationWithCopy |
| Assistant | phone, whatsapp, upiId, upiName, address, openTime, closeTime, timeZone, rates |
| Footer | phone, whatsapp, address, openTime, closeTime, timeZone |
| UtilityBar | whatsapp |
| Hero | whatsapp |
| Cart | upiId, upiName (for future payment) |

---

## 4. Cart Data Flow

### 4.1 Cart Structure (`src/lib/cart.ts`)

```typescript
// localStorage key: 'svt-cart'
interface CartState {
  items: CartItem[]
  updatedAt: number
}

interface CartItem {
  productId: string
  variantId: string
  nameSnapshot: string  // Denormalized for WhatsApp message
  priceSnapshot: number // Denormalized for WhatsApp message
  qty: number
  lineTotal: number     // priceSnapshot * qty
}
```

### 4.2 Operations

| Operation | Flow |
|-----------|------|
| `addItem(product, variant, qty)` | 1. Read cart from localStorage<br>2. Find existing item (productId + variantId)<br>3. If exists: increment qty, recalc lineTotal<br>4. If new: push CartItem with snapshots<br>5. Write to localStorage<br>6. Dispatch 'cart-change' event |
| `updateQty(productId, variantId, qty)` | 1. Read cart<br>2. Find item, update qty (min 1, max stockQty)<br>3. Recalc lineTotal<br>4. Write + dispatch event |
| `removeItem(productId, variantId)` | 1. Read cart<br>2. Filter out item<br>3. Write + dispatch event |
| `clearCart()` | 1. Write empty array + dispatch event |
| `getCart()` | 1. Read from localStorage (parse JSON)<br>2. Return CartState |

### 4.3 WhatsApp Order Message Generation

```
Cart items → Format message:
"New order from {name} ({email}):
1. {name} ({option}) x {qty} = {total}
...
Total: {grandTotal}
I will pick it up at the shop."

→ encodeURIComponent → WhatsApp deep link:
https://wa.me/91{shopPhone}?text={encodedMessage}

→ window.open(link, '_blank')
```

---

## 5. Xerox Flow

### 5.1 File Upload (Current: Placeholder)

```
User selects files (PDF, Word, images)
      │
      ▼
Validate: type, size (max 10MB), count (max 5)
      │
      ▼
[FUTURE] Upload to Firebase Storage
  - Signed URL per file
  - Path: xerox/{uid}/{timestamp}_{filename}
  - Return: public URLs
      │
      ▼
[CURRENT] Mock URLs (placeholder)
      │
      ▼
Build WhatsApp message with:
  - Order code (client-generated: VT-{timestamp})
  - File list with URLs
  - Print options (copies, bw/color, single/double, note)
  - Customer name/email (from auth or prompt)
      │
      ▼
Open WhatsApp deep link
```

### 5.2 Print Options Data

```typescript
interface XeroxOptions {
  copies: number          // 1-99
  color: 'bw' | 'color'   // Black & white or colour
  sides: 'single' | 'double'
  note: string            // Optional: "pages 1-10 only"
  files: File[]           // Validated files
}
```

### 5.3 Pricing Calculation (Client-side Preview)

```
settings = useSettings()

bwPrice = settings.normalRate
if (totalSides >= settings.bulkLimit) bwPrice = settings.bulkRate

colorPrice = settings.colorRate (per page, varies by coverage)
doubleSidePrice = settings.doubleSideRate (per sheet)
cardCopyPrice = settings.cardCopyRate
laminationPrice = settings.laminationOnly
laminatedCardPrice = settings.laminationWithCopy
```

---

## 6. Shop Assistant (AI) Data Flow

### 6.1 Client-Side Search (`src/components/assistant/AssistantPanel.tsx`)

```
User question
      │
      ▼
Local product search (useCatalog products)
  1. Exact match: nameEn/brand/category includes question words
  2. Fuzzy: substring match on nameEn, brand
  3. Category match: question mentions category name
  4. Rank: exact > fuzzy > category
  5. Limit: 60 results
      │
      ▼
Format: "Product Name | ₹Price | In stock" lines
      │
      ▼
POST to Supabase Edge Function
```

### 6.2 Supabase Edge Function (`supabase/functions/shop-assistant/index.ts`)

```
Request:
  {
    question: string (max 200 chars),
    products: string[] (max 60, format: "Name | Price | Stock")
  }

Processing:
  1. CORS check (allowed origins)
  2. Rate limit check (IP-based: 6/min, 40/hr)
  3. Build context:
     SHOP_FACTS (static shop info) + product lines
  4. System prompt: RULES (answer ONLY from facts, max 3 sentences)
  5. Call Groq API:
     - Model: llama-3.1-8b-instant (or GROQ_MODEL secret)
     - Temperature: 0.2
     - Max tokens: 220
  6. Return: { answer } or error

Response:
  { ok: true, answer: string } | { ok: false, reason: 'busy' | 'unavailable' }
```

---

## 7. Order Flow (Phase 4 — Future)

### 7.1 Checkout Flow

```
Cart → "Proceed to Checkout"
      │
      ▼
Sign in (Anonymous already done) → Review Order
      │
      ▼
[If UPI] → Generate UPI deep link / QR → Wait for payment
      │           │
      ▼           ▼
   Success    Cancel/Timeout
      │           │
      └─────┬─────┘
            ▼
      Create Order Document
      (Firestore: orders/{autoId})
      │
      ▼
      Atomic Operations (Batch):
      1. Write order document
      2. Increment counter (counters/{today})
      3. Decrement variant stockQty (transaction)
      │
      ▼
      Return pickup code: VT-YYMMDD-NNN
      │
      ▼
      WhatsApp confirmation + Order Status page
```

### 7.2 Order Document Structure

```typescript
interface Order {
  id: string              // Firestore auto-ID
  code: string            // "VT-261121-001"
  uid: string             // Anonymous auth uid
  customerName: string
  phone: string
  pickupNote: string
  paymentMethod: 'upi' | 'pickup'
  utr: string | null      // UPI transaction ref
  items: OrderItem[]      // Denormalized from cart
  printJobs: PrintJob[]   // From Xerox page
  subtotalItems: number
  subtotalPrint: number
  total: number
  status: 'new' | 'paid' | 'ready' | 'collected' | 'cancelled'
  createdAt: Timestamp
  paidAt: Timestamp | null
  readyAt: Timestamp | null
  collectedAt: Timestamp | null
}
```

### 7.3 Firestore Rules for Orders (Phase 4)

```
match /orders/{orderId} {
  allow read: if signedIn() && (resource.data.uid == request.auth.uid || isAdmin());
  allow create: if signedIn() 
    && request.resource.data.uid == request.auth.uid
    && validateOrderTotals(request.resource.data);  // Custom function
  allow update, delete: if isAdmin();
}
```

---

## 8. Real-Time Updates

### 8.1 Firestore Listeners (Current: One-time reads)

- **Current**: All reads are one-time (`getDocs`, `getDoc`)
- **Future**: `onSnapshot` for:
  - Settings changes (hours, rates) → live update
  - Stock changes → live product availability
  - Order status → live tracking

### 8.2 Offline → Online Sync

```
Firestore SDK (persistentLocalCache)
  │
  ├── Reads: Served from IndexedDB immediately
  ├── Writes: Queued in IndexedDB
  └── On reconnect: Auto-flush queue, resolve conflicts
```

---

## 9. Analytics Events (Planned)

| Event | Trigger | Parameters |
|-------|---------|------------|
| `view_home` | Home page mount | — |
| `view_shop` | Shop page mount | — |
| `search_products` | Search submit | query, filters |
| `filter_products` | Filter change | filterType, value |
| `view_product` | Product card click | productId, variantId |
| `add_to_cart` | Add to cart click | productId, variantId, qty |
| `view_cart` | Cart page mount | itemCount, total |
| `start_checkout` | Checkout click | itemCount, total |
| `upload_xerox` | Xerox send | fileCount, totalSize, options |
| `ask_assistant` | Assistant question | questionLength, resultCount |
| `place_order` | Order created | orderId, total, paymentMethod |
| `order_status_view` | Order status page | orderId, status |

---

## 10. Error Handling Flow

```
Service Error (Firestore, Network, Supabase)
      │
      ▼
Catch in hook/service
      │
      ├── Log: console.warn/error with context
      ├── User-facing: Toast / inline message (non-blocking)
      ├── Fallback: Bundled data (catalogue), SHOP fallback (settings)
      └── Retry: "Try again" button → re-trigger fetch
```

---

*Update when data flows change (new features, Phase 4 implementation).*