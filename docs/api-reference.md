# API Reference — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. Firebase Firestore (Client SDK)

### 1.1 Collections & Documents

#### `settings/shop`
```typescript
// READ: Public (single document)
// WRITE: Admin only
interface Settings {
  normalRate: number
  bulkRate: number
  bulkLimit: number
  doubleSideRate: number
  cardCopyRate: number
  colorRate: number
  laminationOnly: number
  laminationWithCopy: number
  openTime: string       // "HH:mm" 24-hour
  closeTime: string      // "HH:mm" 24-hour
  timeZone: string       // "Asia/Kolkata"
  phone: string          // 10 digits
  whatsapp: string       // 10 digits
  upiId: string
  upiName: string
  address: string
  mapsUrl: string
  forceClosed: boolean
}
```

#### `categories/{slug}`
```typescript
// READ: Public (where isActive == true), Admin (all)
// WRITE: Admin only
interface Category {
  id: string
  slug: string
  nameEn: string
  nameTe: string
  colorToken: CategoryTint
  icon: ModelKind
  sortOrder: number
  isActive: boolean
  productCount: number
}
```

#### `products/{slug}`
```typescript
// READ: Public (where isActive == true), Admin (all)
// WRITE: Admin only
interface Product {
  id: string
  categoryId: string
  slug: string
  nameEn: string
  nameTe: string
  brand: string
  description: string
  modelKind: ModelKind
  modelUrl?: string
  coverColor: ModelColor
  isFeatured: boolean
  isActive: boolean
  createdAt: Timestamp | null
}
```

#### `products/{productId}/variants/{variantId}`
```typescript
// READ: Public (where isActive == true), Admin (all)
// WRITE: Admin only
interface Variant {
  id: string
  label: string
  pages: number | null
  ruling: Ruling | null
  size: PaperSize | null
  price: number
  mrp: number
  stockQty: number
  lowStockAlert: number
  isActive: boolean
}
```

#### `orders/{orderId}` (Phase 4)
```typescript
// READ: Owner (uid match) or Admin
// CREATE: Authenticated user (with validation)
// UPDATE/DELETE: Admin only
interface Order {
  id: string
  code: string             // "VT-YYMMDD-NNN"
  uid: string
  customerName: string
  phone: string
  pickupNote: string
  paymentMethod: 'upi' | 'pickup'
  utr: string | null
  items: OrderItem[]
  printJobs: PrintJob[]
  subtotalItems: number
  subtotalPrint: number
  total: number
  status: OrderStatus
  createdAt: Timestamp | null
  paidAt: Timestamp | null
  readyAt: Timestamp | null
  collectedAt: Timestamp | null
}
```

---

## 2. Firebase Auth (Client SDK)

### 2.1 Anonymous Sign-In
```typescript
// Automatic on app load (src/lib/auth.ts)
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

const auth = getAuth(app)
const storedUid = localStorage.getItem('svt-uid')
if (storedUid) {
  // Re-authenticate or rely on persistence
} else {
  const { user } = await signInAnonymously(auth)
  localStorage.setItem('svt-uid', user.uid)
}
```

---

## 3. Supabase Edge Function: Shop Assistant

### 3.1 Endpoint
```
POST https://{SUPABASE_PROJECT_REF}.supabase.co/functions/v1/shop-assistant
```

### 3.2 Request
```typescript
interface AskShopAiRequest {
  question: string    // Max 200 characters
  products: string[]  // Max 60, format: "Product Name | ₹Price | Stock Status"
}
```

### 3.3 Response
```typescript
// Success
interface AiSuccessResponse { answer: string }

// Error
interface AiErrorResponse { error: 'bad-request' | 'origin' | 'not-configured' | 'busy' | 'ai-error' }
```

### 3.4 Client Wrapper (`src/services/assistantAi.ts`)
```typescript
type AiResult = { ok: true; answer: string } | { ok: false; reason: 'busy' | 'unavailable' }
async function askShopAi(question: string, products: string[]): Promise<AiResult>
```

### 3.5 Rate Limits
- 6 requests/minute per IP
- 40 requests/hour per IP

---

## 4. Groq API (via Supabase Edge Function)

Model: `llama-3.1-8b-instant` (configurable via `GROQ_MODEL` secret)
Temperature: 0.2, Max tokens: 220, Timeout: 15s

---

## 5. Google Maps Embed

```
Embed: https://maps.google.com/maps?q={lat},{lng}&z=17&hl=en&output=embed
Directions: https://www.google.com/maps/dir/?api=1&destination={lat},{lng}
Lat/Lng: 13.9531717, 79.3515113
```

---

## 6. WhatsApp Deep Links

```
Chat: https://wa.me/91{phone10Digits}?text={encodedMessage}
Phone: 9951021282
```

---

## 7. Internal TypeScript APIs

### 7.1 `useCatalog` Hook
```typescript
interface CatalogState {
  categories: Category[]
  products: ProductWithVariants[]
  status: 'loading' | 'ready' | 'fallback'
  priceState: 'loading' | 'shown' | 'unavailable'
  retry: () => void
}
function useCatalog(): CatalogState
```

### 7.2 `useSettings` Hook
```typescript
interface SettingsState { settings: Settings; loading: boolean; error: Error | null }
function useSettings(): SettingsState
```

### 7.3 Cart Functions (`src/lib/cart.ts`)
```typescript
interface CartItem {
  productId: string; variantId: string; nameSnapshot: string
  priceSnapshot: number; qty: number; lineTotal: number
}
function getCart(): CartState
function addItem(product, variant, qty): void
function updateQty(productId, variantId, qty): void
function removeItem(productId, variantId): void
function clearCart(): void
function generateWhatsAppMessage(name, email): string
function openWhatsAppOrder(message): void
```

### 7.4 Shop Utilities (`src/data/shop.ts`)
```typescript
const SHOP: Settings
const SHOP_LOCATION = { lat: 13.9531717, lng: 79.3515113, placeUrl: string }
function mapEmbedUrl(): string
function directionsUrl(): string
function normalisePhone(v): string
function telHref(p): string
function whatsappHref(w): string
function formatPhone(p): string
function formatRupees(a): string
function formatTime(hhmm, lang): string
function toMinutes(hhmm): number
function isOpenNow(settings): boolean
```

### 7.5 i18n
```typescript
const { t, i18n } = useTranslation()
t('hero.titleLine1')
t('product.price', { price })
i18n.changeLanguage('te')
```

---

## 8. Environment Variables

### 8.1 Required (`.env`)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=  # Optional
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

### 8.2 Supabase Secrets
```
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant  # Optional
ALLOWED_ORIGINS=  # Optional
```

---

## 9. Firestore Indexes & Rules

See `firestore.indexes.json` (collection-group on variants/isActive) and `firestore.rules` (public reads isActive==true, admin writes).

---

*No importers — this is reference documentation for the project's external and internal APIs.*