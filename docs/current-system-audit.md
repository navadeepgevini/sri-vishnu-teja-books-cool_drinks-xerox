# Current System Audit — Sri Vishnu Teja Books & Xerox Web App

**Date:** 2026-11-21  
**Project:** Sri Vishnu Teja Books, Xerox & Cool Drinks  
**Repository:** P:\e-commerce sites

---

## 1. Project Overview

**Type:** E-commerce web application (React 18 + Vite + TypeScript)  
**Primary Goal:** Allow students and local customers in Railway Koduru to browse stationery/cool drinks, upload PDFs for xerox printing, and place pickup orders via WhatsApp — no home delivery, in-store pickup only.  
**Target Users:** Students, professionals, and residents of Railway Koduru, Tirupati District  
**Current Stage:** Prototype / MVP (Phase 1-3 complete, Phase 4 pending)

---

## 2. Technology Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Frontend | React | 18.3.1 | Functional components, hooks |
| Build Tool | Vite | 8.3.0 | Fast HMR, ES modules |
| Language | TypeScript | 5.9.3 | Strict mode |
| Styling | Tailwind CSS | 4.3.3 | CSS-first config via Vite plugin |
| Routing | React Router | 6.30.6 | Lazy-loaded routes |
| i18n | i18next + react-i18next | 26.4.2 / 17.0.14 | English / Telugu |
| 3D Graphics | Three.js + @react-three/fiber + @react-three/drei | 0.186.0 / 8.18.0 / 9.122.0 | Hero 3D scene |
| Database | Firebase Firestore | 12.19.0 (client) | Spark plan, offline persistence |
| Auth | Firebase Anonymous Auth | 12.19.0 | Auto sign-in on load |
| Analytics | Firebase Analytics | 12.19.0 | Production only |
| Edge Functions | Supabase Edge Functions (Deno) | - | Shop AI assistant (Groq LLM) |
| LLM Provider | Groq (via Supabase) | llama-3.1-8b-instant | RAG for shop helper |
| Deployment | Firebase Hosting | - | Static build to `dist/` |

---

## 3. Architecture

### 3.1 High-Level Components

```
Browser (React SPA)
├── Layout (App.tsx)
│   ├── UtilityBar (WhatsApp, Search, Cart links)
│   ├── Navbar (Home, Shop, Xerox, Order Status, Cart, Auth)
│   ├── Main (Routes: Home, Shop, Xerox, OrderStatus, Cart)
│   ├── Footer (Contact, Hours, Map, Promise)
│   ├── MobileBottomNav (Mobile quick links)
│   ├── AssistantWidget (AI chat - RAG via Supabase Edge Function)
│   └── Canvas3DHost (Three.js scene provider)
```

### 3.2 Data Flow

1. **App Load** → Anonymous Firebase Auth → Firestore listeners (offline cache enabled)
2. **Catalogue** → `useCatalog` hook → `fetchCategories()` + `fetchActiveProducts()` → fallback to bundled data if empty/unreachable
3. **Settings** → `useSettings` hook → `settings/shop` document (rates, hours, UPI, address)
4. **Shop Assistant** → User question → Local product search → Supabase Edge Function (with top matches) → Groq LLM → Answer
5. **Xerox Upload** → File selection → Firebase Storage (future) → WhatsApp deep link with file URLs
6. **Cart → Order** → WhatsApp message (Phase 4: Firestore order document)

---

## 4. Firestore Data Model

### Collections

| Collection | Document ID | Description |
|------------|-------------|-------------|
| `settings` | `shop` | Rates, hours, contact, UPI, address |
| `categories` | slug (e.g., `long-notebooks`) | 11 active categories |
| `products` | slug (e.g., `long-single-line-notebook`) | 48 products with variants subcollection |
| `products/{productId}/variants` | variant ID | Price, stock, ruling, pages, size |
| `orders` | auto-ID | Customer orders (Phase 4) |
| `counters` | date string (YYYY-MM-DD) | Daily order sequence |
| `admins` | user UID | Admin/counter role |

### Key Types (from `src/types/models.ts`)

- **Category**: id, slug, nameEn/Te, colorToken, icon, sortOrder, isActive, productCount
- **Product**: id, categoryId, slug, nameEn/Te, brand, description, modelKind, modelUrl, coverColor, isFeatured, isActive, createdAt
- **Variant**: id, label, pages, ruling, size, price, mrp, stockQty, lowStockAlert, isActive
- **Order**: code (VT-YYMMDD-NNN), uid, customerName, phone, pickupNote, paymentMethod, utr, items[], printJobs[], totals, status, timestamps

---

## 5. Current Features (Working)

| Feature | Status | Notes |
|---------|--------|-------|
| Home page with Hero, Categories, Popular Products, How It Works, Xerox Banner, Visit Us | Complete | 3D scene, i18n, responsive |
| Shop page with filters, search, sort, pagination | Complete | URL-driven state |
| Xerox page (file upload → WhatsApp) | Complete | PDF/Word/photos, options |
| Cart (localStorage, add/remove/qty) | Complete | WhatsApp order message |
| Order Status page | Placeholder | "Coming soon" |
| Shop AI Assistant (RAG) | Complete | Groq via Supabase Edge Function |
| Anonymous Auth (auto sign-in) | Complete | Persists uid |
| Offline catalogue (IndexedDB cache) | Complete | `persistentLocalCache` |
| Fallback catalogue (bundled data) | Complete | `src/data/home.ts` |
| English / Telugu i18n | Complete | `src/i18n/en.json` + `te.json` |
| Responsive design (mobile-first) | Complete | Tailwind CSS 4 |
| Accessibility (skip link, ARIA, focus) | Good | Could audit further |

---

## 6. Pending / Known Gaps

| Area | Gap | Priority |
|------|-----|----------|
| Phase 4: Orders | Firestore order creation, payment verification, admin order management | High |
| Real stock/inventory | Counter app for real-time stock updates | High |
| UPI payment integration | `upiId` empty in settings; need payment flow | High |
| Firebase Storage | Xerox file uploads currently use placeholder | Medium |
| Admin dashboard | No UI for order management, stock, settings | Medium |
| Analytics events | Custom events for key actions (add to cart, xerox upload, etc.) | Low |
| PWA / offline ordering | Service worker for full offline support | Low |
| Telugu translations | Some strings may need review | Low |
| Error boundary coverage | Page-level only; component-level could help | Low |

---

## 7. Security Posture

- **Firestore Rules**: Strict — public reads only `isActive: true`, writes admin-only
- **Auth**: Anonymous only (no email/password, no Google OAuth yet)
- **API Keys**: Firebase web config is public (restricted in console); Groq key only in Supabase secrets
- **CORS**: Supabase Edge Function restricts to known origins
- **Rate Limiting**: Per-IP (6/min, 40/hr) on AI assistant
- **Secrets**: `serviceAccountKey.json` gitignored; `.env` gitignored; Supabase secrets in dashboard

---

## 8. Build & Deploy

```bash
# Local dev
cd web && npm run dev        # http://localhost:5173

# Type-check + production build
cd web && npm run build      # outputs to dist/

# Deploy to Firebase Hosting
npx firebase-tools deploy --only hosting

# Deploy rules + indexes
npx firebase-tools deploy --only firestore:rules,firestore:indexes

# Seed database (requires serviceAccountKey.json)
cd web && npm run seed
```

---

## 9. Environment Variables (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | No | Analytics measurement ID |
| `VITE_SUPABASE_URL` | For AI | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | For AI | Supabase anon/publishable key |

---

## 10. External Dependencies Review

| Repository | Capability | License | Decision |
|------------|------------|---------|----------|
| ECC (affaan-m/ecc) | Agent patterns, memory, security | MIT | Reference only — adapt concepts |
| Awesome Agents (kyrolabs) | Agent framework catalogue | MIT | Discovery only |
| Agency Agents (msitarzewski) | Specialist agent roles | MIT | Reference for agent design |
| i-have-adhd (ayghri) | Concise communication patterns | MIT | Communication style reference |

---

## 11. Next Milestone: Phase 4 — Orders & Payments

**Scope:**
1. Enable `orders` collection create in Firestore rules (with server-side validation)
2. Implement checkout flow: Cart → Sign in → Review → Place Order
3. Order confirmation with pickup code (VT-YYMMDD-NNN)
4. Admin order management (view, mark ready/collected)
5. UPI payment integration (verify UTR, mark paid)
6. Real-time stock decrement on order

**Acceptance Criteria:**
- Customer can place order from cart, gets pickup code
- Order appears in Firestore with correct totals
- Admin can view and update order status
- UPI payment verified before marking paid
- Stock decremented atomically

---

*Generated during bootstrap setup. Update after each meaningful change.*