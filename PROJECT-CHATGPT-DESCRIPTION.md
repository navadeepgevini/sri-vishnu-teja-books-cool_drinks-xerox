# SRI VISHNU TEJA — COMPLETE PROJECT BRIEF FOR CHATGPT
**End-to-End Architecture, Product Catalogue, Technical Specifications, and Development Roadmap**

---

### How to Use This Document with ChatGPT
Copy and paste this brief into ChatGPT (or upload the companion `PROJECT-CHATGPT-DESCRIPTION.dotm` file) with the following introductory prompt:

> *"You are an expert senior full-stack software engineer and system architect acting as my pair programmer on an existing project. Review this comprehensive end-to-end specification for 'Sri Vishnu Teja Books, Xerox & Cool Drinks'. Adhere strictly to all architectural constraints (₹0 operational budget, counter-pickup only, strict design tokens, React 18/TypeScript/Firebase/Supabase stack). Acknowledge receipt and let me know you are ready to assist with the next development sprint."*

---

## 1. Executive Summary & Business Operations

Sri Vishnu Teja Books, Xerox & Cool Drinks is an established brick-and-mortar retail store in Railway Kodur, Andhra Pradesh, India. The web application resolves physical store congestion and counter queues by allowing school and college students, office workers, and local residents to browse inventory, order stationery, and submit Xerox printing jobs remotely from any desktop or mobile browser.

### Key Business & Operational Facts:
* **Business Name:** Sri Vishnu Teja Books, Xerox & Cool Drinks
* **Proprietor:** Gevini Murali Mohan
* **Physical Address:** Near Bajaj Showroom, RS Road, Railway Kodur, Tirupati District, Andhra Pradesh 516101
* **Coordinates & Map:** 13.9531717, 79.3515113 ([Google Maps Location](https://maps.app.goo.gl/yCzP1rFpVHKWxPJX7))
* **Contact & WhatsApp:** +91 9951021282 | navadeeproy@gmail.com
* **Operating Hours:** 8:00 AM – 11:00 PM, all 7 days (Asia/Kolkata timezone)
* **Fulfillment Model:** **STRICTLY Counter Pickup (BOPIS - Buy Online, Pick Up In Store). Zero delivery.**
* **Budget Constraint:** **Strictly ₹0 operational budget.** Relies exclusively on free-tier infrastructure (Firebase Spark, Supabase Free Tier, Groq Free Tier).
* **Pricing Policy:** All stationery, books, snacks, and drinks sold at Maximum Retail Price (MRP).
* **Language Policy:** English only (Telugu removed per proprietor instructions).
* **Xerox & Printing Price Card:**
  * B&W standard: ₹2 per side
  * B&W bulk (high volume): ₹1.5 per side
  * Double-sided single sheet: ₹4
  * ID card photocopy: ₹3
  * Lamination: ₹20 per document
  * Laminated ID copy: ₹40
  * Colour printing: from ₹10 per page
  * *Note:* No spiral binding provided.

---

## 2. Full-Stack Technology Architecture

The project is structured as a high-performance single-page application (SPA) backed by serverless cloud infrastructure:

| Tier / Component | Technology & Version | Purpose & Implementation Details |
|---|---|---|
| **Frontend Core** | React 18.3 + TypeScript 5.9 | Single-page application with strict type safety, lazy-loaded route boundaries. |
| **Bundler & Tooling** | Vite 8.3 | Ultra-fast ESM bundling with rapid HMR. |
| **Styling Framework** | Tailwind CSS v4 | Zero-runtime CSS utilizing CSS variables for strict design tokens. |
| **Client Routing** | React Router DOM v6.30 | Dynamic routing with automatic scroll reset and per-route ErrorBoundaries. |
| **Localization** | i18next + react-i18next | Keyed translation strings located under `src/i18n/en.json`. |
| **3D & Graphics** | Three.js + React Three Fiber + Drei | Interactive 360° product viewers, single shared WebGL canvas with on-demand rendering. |
| **Primary Database** | Firebase Firestore v12 | Real-time NoSQL store for categories, products, variants, and shop settings. |
| **Authentication** | Firebase Auth v12 | Anonymous guest sign-in upgraded smoothly to Google OAuth before checkout. |
| **Document Storage** | Supabase Storage v2 | `Bucket_Files` bucket (Mumbai region) for Xerox documents up to 25MB each. |
| **Serverless & AI** | Supabase Edge Functions + Groq | Deno runtime calling Groq `llama-3.1-8b-instant` for AI chatbot RAG. |
| **Database Seeding** | Firebase Admin SDK v14 (Node 24) | Direct local seed script with native TS type-stripping (`npm run seed`). |
| **Iconography** | Lucide React | Clean, lightweight SVG icons. |

---

## 3. Design System & Token Constraints

The design language reflects a calm, premium, paper-like aesthetic reminiscent of fine stationery.

> **CRITICAL RULE:** Never use arbitrary hex color codes in components. All styles must use the defined semantic Tailwind tokens.

### Color Tokens:
* **Navy Ink (`#1F2640`):** Primary buttons, active navigation, headers, top utility bar.
* **Paper White (`#FFFFFF`):** Base page background and clean reading surfaces.
* **Soft Paper (`#F6F5F2`):** Product card backgrounds, secondary containers, neutral borders.
* **Warm Cream (`#F7EFE3`):** Promotional banners, important informational notices.
* **Powder Blue (`#D6E3EF`):** Hero backdrop wall and subtle brand accents.
* **Desk Sand (`#CDBB9E`):** Hero 3D floor plane and subtle dividers.
* **Soft Saffron (`#EDC27E`):** 3D product pedestals and podium radial glows.
* **Saffron Accent (`#E8952B`):** Low-stock alerts, 360° badges, primary CTA highlights.
* **Ink (`#1B1F2A`):** Primary body text color.
* **Muted (`#6B7280`):** Secondary descriptions, timestamps, metadata labels.
* **Success (`#2F8F5B`) / Error (`#C0453A`):** Stock availability indicators and validation states.

### Accessibility Standards:
* Minimum interactive touch target: **44×44px**.
* Base body typography: **≥16px**.
* Two-tone high-contrast focus rings for keyboard navigation (WCAG 2.2 AA compliant).

---

## 4. Implemented Features & Application Modules

### 1. Home Page (`/`)
* **Hero 3D Stage:** Interactive floating stationery models rendered on a single shared WebGL canvas.
* **Category Grid:** 11 category tiles with bespoke pastel tints and product counters.
* **Popular Products:** Curated products featuring 800×800 WebP cutouts with saffron pedestal glow and hover elevation.
* **How It Works:** 3-step visual guide (Browse & Select → Upload or Cart → Counter Pickup).
* **Xerox Rate Card:** Transparent pricing table with live print calculation logic.
* **Visit Us Section:** Interactive Google Maps iframe, live store status calculation (Open Now / Closed) in IST, address, and directions link.

### 2. Shop & Catalogue (`/shop`)
* **Catalogue:** 48 products across 70 variants seeded in Firestore (with instant local fallback cache).
* **Filter Bar:** Filter by category pills, brand, paper ruling, page counts, and price range.
* **Search Engine:** Client-side search with word stemming, synonym expansion (e.g., "coke" → "coca-cola"), and IDF relevance scoring.
* **Sorting & Pagination:** Sort by price, name, or popularity with responsive "Load More" chunking.

### 3. Shopping Cart (`/cart`)
* **Cart Store:** Client-side persistent cart in localStorage (`svt-cart-v1`).
* **Interactive Adjustments:** Real-time quantity increment/decrement, item removal, and subtotal calculation.
* **Auth Requirement:** Forces Google sign-in before order dispatch.
* **WhatsApp Dispatch:** Composes pre-filled WhatsApp message with items, quantities, variants, and total price sent directly to the proprietor.

### 4. Xerox & Document Portal (`/xerox`)
* **File Uploader:** Drag-and-drop support for PDF, Word (.doc, .docx), and images (JPEG, PNG, WebP, HEIC). Max 10 files, 25MB per file.
* **Direct Storage Upload:** Streams directly to Supabase Storage `Bucket_Files`.
* **Print Customization:** Number of copies, single vs double-sided, B&W vs colour, ID card mode, lamination toggle, and special instructions.
* **Order Tracking Code:** Generates unique order reference (e.g., `XR-0922-XXXX`) and generates pre-filled WhatsApp message containing direct file download links.

### 5. AI Shop Assistant Widget
* **Tier 1 (Instant Offline Engine):** Instant client-side FAQ matcher for hours, location, contact, rates, and product lookup without network latency or API expense.
* **Tier 2 (Serverless RAG):** When confidence is low, dispatches to Supabase Edge Function `shop-assistant`. Ingests the top 60 matching catalogue rows into Groq `llama-3.1-8b-instant`. Returns concise answers (≤3 sentences) with a disclaimer: *"AI answer. Please confirm prices at the counter."* Automatically falls back to WhatsApp if unanswerable or offline.

---

## 5. Database Schema & Data Models

### Firestore Collections:
* `categories/{categoryId}`: `{ id, name, icon, tint, sortOrder }`
* `products/{productId}`: `{ id, name, categoryId, brand, description, tags, modelSpec: { model, color }, image, createdAt }`
* `products/{productId}/variants/{variantId}`: `{ id, sku, name, price, mrp, stock, attributes: { pages, ruling, packSize, color } }`
* `settings/shop`: `{ name, proprietor, phone, email, address, upiId, hours, coordinates: { lat, lng } }`
* `orders/{orderId}` *(Sprint Backlog)*: `{ id, orderCode, customerUid, customerName, customerPhone, items: [...], totalAmount, paymentStatus, orderStatus, createdAt }`

---

## 6. Security, Rules & Secret Management

* **Zero Leaked Secrets:** No API keys or service credentials in git or frontend bundles.
* `GROQ_API_KEY`: Stored exclusively as a secret in Supabase Edge Functions.
* `serviceAccountKey.json`: Kept strictly local in `web/serviceAccountKey.json` and protected by `.gitignore`.
* **Supabase Storage Rules:** `Bucket_Files` allows `INSERT` for anonymous and authenticated users. `SELECT`/`LIST`/`DELETE` are disabled to prevent visitors from snooping on or wiping customer documents.
* **Firestore Rules:** Public read access for catalogue data; write access restricted to authenticated staff/admin UIDs.
* **Rate Limiting:** Edge Function throttled to 6 requests/min and 40 requests/hour per IP with a 200-character input cap.

---

## 7. Immediate Sprint Backlog & Next Steps

1. **Full Checkout & Firestore Order Persistence:** Transition from purely WhatsApp-based ordering to storing orders directly in Firestore (`/orders`), generating order IDs, and presenting UPI Intent links and dynamic payment QR codes.
2. **Product Detail Page (`/product/:slug`):** Dedicated page featuring 3D product inspection, high-res photo zoom, variant selector chips, live inventory badges, and related items.
3. **Live Order Tracking (`/orders/:orderCode`):** Real-time Firestore `onSnapshot` listener tracking order states: *Received → Packing / Printing → Ready for Pickup → Completed*.
4. **Counter & Admin Dashboards (`/counter` & `/admin`):**
   * `/counter`: Print queue interface for shop staff with 1-click document download, status toggles, and audio alerts for incoming orders.
   * `/admin`: Inventory count updates, price changes, and store settings adjustments.
5. **Automated Xerox File Purge:** Scheduled cron job to delete uploaded files older than 48 hours to stay safely within Supabase's 1GB free tier.
6. **Firebase Hosting Release:** Production deployment to `https://sri-vishnu-teja-books-xerox.web.app` with custom domain routing and security headers.

---

## 8. Development Guidelines for ChatGPT

When collaborating on this project, adhere strictly to these principles:
1. **Never suggest paid services or APIs:** Must remain strictly within ₹0 free-tier limits.
2. **Never add delivery or shipping logic:** The store is strictly counter pickup.
3. **Preserve Design Tokens:** Never introduce raw hex color codes; utilize the Tailwind color token palette.
4. **Enforce Strict TypeScript:** Maintain type interfaces matching `src/types/models.ts`.
5. **Conserve WebGL Resources:** Keep the single shared canvas architecture intact. Never initialize multiple canvas elements.
6. **Keep Responses Modular and Direct:** Provide complete, drop-in replacement code chunks with exact file paths.
