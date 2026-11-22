# Database Schema — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. Firestore Collections Overview

```
settings/
  └── shop (single document)

categories/
  └── {slug} (11 documents)

products/
  └── {slug} (48 documents)
       └── variants/
            └── {variantId} (~120 documents)

orders/ (Phase 4)
  └── {autoId}

counters/ (Phase 4)
  └── {YYYY-MM-DD}

admins/
  └── {uid}
```

---

## 2. Collection Schemas

### 2.1 `settings/shop` (Singleton)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `normalRate` | number | Yes | B&W xerox per side (₹) | `2` |
| `bulkRate` | number | Yes | B&W bulk per side (₹) | `1.5` |
| `bulkLimit` | number | Yes | Sides threshold for bulk | `100` |
| `doubleSideRate` | number | Yes | Double-sided sheet (₹) | `4` |
| `cardCopyRate` | number | Yes | ID card copy (₹) | `3` |
| `colorRate` | number | Yes | Colour xerox starting (₹/page) | `10` |
| `laminationOnly` | number | Yes | Lamination only (₹) | `20` |
| `laminationWithCopy` | number | Yes | Laminated card copy (₹) | `40` |
| `openTime` | string | Yes | "HH:mm" 24-hour | `"08:00"` |
| `closeTime` | string | Yes | "HH:mm" 24-hour | `"23:00"` |
| `timeZone` | string | Yes | IANA timezone | `"Asia/Kolkata"` |
| `phone` | string | Yes | 10 digits, no +91 | `"9951021282"` |
| `whatsapp` | string | Yes | 10 digits, no +91 | `"9951021282"` |
| `upiId` | string | No | UPI ID (empty = disabled) | `""` |
| `upiName` | string | Yes | UPI display name | `"Sri Vishnu Teja Books & Xerox"` |
| `address` | string | Yes | Full address | `"Near Bajaj Showroom..."` |
| `mapsUrl` | string | Yes | Google Maps link | `"https://maps.app.goo.gl/..."` |
| `forceClosed` | boolean | Yes | Force closed override | `false` |

**Indexes:** None needed (single document)

**Rules:** Read: public; Write: admin only

---

### 2.2 `categories/{slug}`

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | Yes | = slug (document ID) | `"long-notebooks"` |
| `slug` | string | Yes | = id | `"long-notebooks"` |
| `nameEn` | string | Yes | English name | `"Long Notebooks"` |
| `nameTe` | string | Yes | Telugu name | `"Long Notebooks"` |
| `colorToken` | string | Yes | CSS variable token | `"cat-long"` |
| `icon` | string | Yes | 3D model kind | `"notebook"` |
| `sortOrder` | number | Yes | Display order (1-11) | `1` |
| `isActive` | boolean | Yes | Public visibility | `true` |
| `productCount` | number | Yes | Computed active products | `2` |

**Valid `colorToken` values:** `cat-long`, `cat-short`, `cat-record`, `cat-pens`, `cat-pencils`, `cat-geometry`, `cat-paper`, `cat-office`, `navy`, `ink`, `paper`

**Valid `icon` values:** `notebook`, `pen`, `paper`, `box`, `bottle`, `bag`

**Indexes:**
- Single-field: `isActive` (ASC), `sortOrder` (ASC)
- Composite: `isActive` (ASC), `sortOrder` (ASC)

**Rules:** Read: `isActive == true` or admin; Write: admin only

---

### 2.3 `products/{slug}`

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | Yes | = slug (document ID) | `"long-single-line-notebook"` |
| `categoryId` | string | Yes | Reference to category slug | `"long-notebooks"` |
| `slug` | string | Yes | = id | `"long-single-line-notebook"` |
| `nameEn` | string | Yes | English name | `"Long Notebook, Single Line"` |
| `nameTe` | string | Yes | Telugu name | `"Long Notebook, Single Line"` |
| `brand` | string | Yes | Brand (empty for generic) | `"Tejaswini / Bindu / Gopika"` |
| `description` | string | No | Product description | `""` |
| `modelKind` | string | Yes | 3D model type | `"notebook"` |
| `modelUrl` | string | No | GLTF model URL | `null` |
| `coverColor` | string | Yes | CSS variable token | `"cat-long"` |
| `isFeatured` | boolean | Yes | Show in popular section | `true` |
| `isActive` | boolean | Yes | Public visibility | `true` |
| `createdAt` | Timestamp | No | Firestore server timestamp | `FieldValue.serverTimestamp()` |

**Valid `modelKind` values:** `notebook`, `pen`, `paper`, `box`, `bottle`, `bag`

**Valid `coverColor` values:** Same as `colorToken` + `navy`, `ink`, `paper`

**Indexes:**
- Single-field: `isActive` (ASC), `categoryId` (ASC), `isFeatured` (ASC)
- Composite: `isActive` (ASC), `isFeatured` (DESC), `nameEn` (ASC)

**Rules:** Read: `isActive == true` or admin; Write: admin only

---

### 2.4 `products/{productId}/variants/{variantId}`

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | Yes | = variantId (document ID) | `"standard"` |
| `label` | string | Yes | Display label | `"About 160–192 pages"` |
| `pages` | number/null | No | Page count | `null` |
| `ruling` | string/null | No | Line ruling | `"single"` |
| `size` | string/null | No | Paper size | `"long"` |
| `price` | number | Yes | Selling price (₹) | `45` |
| `mrp` | number | Yes | MRP (₹) | `45` |
| `stockQty` | number | Yes | Available stock | `25` |
| `lowStockAlert` | number | Yes | Alert threshold | `5` |
| `isActive` | boolean | Yes | Public visibility | `true` |

**Valid `ruling` values:** `single`, `double`, `four`, `unruled`, `null`

**Valid `size` values:** `long`, `short`, `a4`, `null`

**Indexes:**
- Single-field: `isActive` (ASC)
- **Collection-group index** (required for fast variant loading):
  - Collection group: `variants`
  - Fields: `isActive` (ASC)
  - Query scope: `COLLECTION_GROUP`

**Rules:** Read: `isActive == true` or admin; Write: admin only

---

### 2.5 `orders/{orderId}` (Phase 4)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | Yes | Firestore auto-ID | `"abc123def456"` |
| `code` | string | Yes | Pickup code | `"VT-261121-001"` |
| `uid` | string | Yes | Anonymous auth UID | `"user_abc123"` |
| `customerName` | string | Yes | Customer name | `"Rahul Kumar"` |
| `phone` | string | Yes | 10-digit phone | `"9876543210"` |
| `pickupNote` | string | No | Special instructions | `"Call when ready"` |
| `paymentMethod` | string | Yes | `upi` or `pickup` | `"upi"` |
| `utr` | string/null | No | UPI transaction ref | `"123456789012"` |
| `items` | array | Yes | Order items | `[...]` |
| `printJobs` | array | No | Xerox jobs | `[...]` |
| `subtotalItems` | number | Yes | Items subtotal (₹) | `345` |
| `subtotalPrint` | number | Yes | Print subtotal (₹) | `50` |
| `total` | number | Yes | Grand total (₹) | `395` |
| `status` | string | Yes | Order status | `"new"` |
| `createdAt` | Timestamp | Yes | Server timestamp | `FieldValue.serverTimestamp()` |
| `paidAt` | Timestamp/null | No | Payment timestamp | `null` |
| `readyAt` | Timestamp/null | No | Ready for pickup | `null` |
| `collectedAt` | Timestamp/null | No | Collected timestamp | `null` |

**Valid `status` values:** `new`, `paid`, `ready`, `collected`, `cancelled`

**Valid `paymentMethod` values:** `upi`, `pickup`

**OrderItem structure:**
```typescript
{
  productId: string,
  variantId: string,
  nameSnapshot: string,
  priceSnapshot: number,
  qty: number,
  lineTotal: number
}
```

**PrintJob structure:**
```typescript
{
  fileName: string,
  filePath: string,
  pagesTotal: number,
  pageRange: string,
  copies: number,
  doubleSide: boolean,
  laminateCount: number,
  laminateWithCopy: boolean,
  rateUsed: number,
  sidesTotal: number,
  sheetsTotal: number,
  price: number,
  note: string
}
```

**Indexes:**
- Single-field: `uid` (ASC), `status` (ASC), `createdAt` (DESC)
- Composite: `uid` (ASC), `createdAt` (DESC)
- Composite: `status` (ASC), `createdAt` (DESC)

**Rules:** Read: owner or admin; Create: validated user (Phase 4); Update/Delete: admin only

---

### 2.6 `counters/{YYYY-MM-DD}` (Phase 4)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `count` | number | Yes | Daily sequence number | `14` |

**Document ID format:** `2026-11-21` (date in shop timezone)

**Rules:** Read/Write: admin only

---

### 2.7 `admins/{uid}`

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `role` | string | Yes | `admin` or `counter` | `"admin"` |

**Document ID:** Firebase Auth UID

**Rules:** Read: self only; Write: never from client

---

## 3. Seed Data Reference

### 3.1 Categories (11)
| slug | nameEn | colorToken | icon | sortOrder |
|------|--------|------------|------|-----------|
| long-notebooks | Long Notebooks | cat-long | notebook | 1 |
| short-notebooks | Short & Rough Notebooks | cat-short | notebook | 2 |
| pens | Pens & Markers | cat-pens | pen | 3 |
| pencils | Pencils, Erasers & Sharpeners | cat-pencils | pen | 4 |
| geometry | Geometry & Office Tools | cat-geometry | box | 5 |
| chart-paper | Chart Paper & Covers | cat-paper | paper | 6 |
| exam-basics | Pads, Slates & Cases | cat-office | box | 7 |
| school-bags | School Bags | cat-record | bag | 8 |
| snacks | Biscuits & Chocolates | cat-pencils | box | 9 |
| cool-drinks | Cool Drinks & Water | cat-pens | bottle | 10 |
| household | Household Needs | cat-short | box | 11 |

### 3.2 Products (48) with Variants (~120)
Defined in `src/data/home.ts` — see `FALLBACK_PRODUCTS` and `FALLBACK_CATEGORIES`.

---

## 4. Security Rules Summary

```javascript
// Public reads require isActive == true
// Admin bypasses all checks via exists(/admins/{uid})

match /settings/{docId} {
  allow read: if docId == 'shop';
  allow write: if isAdmin();
}

match /categories/{categoryId} {
  allow read: if resource.data.isActive == true || isAdmin();
  allow write: if isAdmin();
}

match /products/{productId} {
  allow read: if resource.data.isActive == true || isAdmin();
  allow write: if isAdmin();
  match /variants/{variantId} {
    allow read: if resource.data.isActive == true || isAdmin();
    allow write: if isAdmin();
  }
}

match /{path=**}/variants/{variantId} {
  allow read: if resource.data.isActive == true || isAdmin();
}

match /orders/{orderId} {
  allow read: if signedIn() && (resource.data.uid == request.auth.uid || isAdmin());
  allow create: if false; // Phase 4: enable with validation
  allow update, delete: if isAdmin();
}

match /counters/{day} {
  allow read, write: if isAdmin();
}

match /admins/{uid} {
  allow read: if signedIn() && request.auth.uid == uid;
  allow write: if false;
}
```

---

## 5. Migration Notes

### Adding a New Category
1. Add to `src/data/home.ts` → `FALLBACK_CATEGORIES`
2. Run `npm run seed` (overwrites settings + categories + products)

### Adding a New Product
1. Add to `src/data/home.ts` → `FALLBACK_PRODUCTS`
2. Run `npm run seed`

### Updating Settings
1. Edit in Firebase console → `settings/shop` document
2. Or run `npm run seed` to reset from `src/data/shop.ts`

### Schema Changes (Phase 4)
- Add `orders` collection with validation rules
- Add `counters` collection for daily sequence
- Update `firestore.rules` and `firestore.indexes.json`
- Deploy: `firebase deploy --only firestore:rules,firestore:indexes`

---

*No importers — this is reference documentation for the project's Firestore schema.*