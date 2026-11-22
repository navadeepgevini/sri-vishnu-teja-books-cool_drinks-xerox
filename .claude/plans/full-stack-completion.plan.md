# Plan: Full-Stack Completion — Sri Vishnu Teja Books & Xerox

**Source Audit**: `docs/current-system-audit.md`, `docs/architecture.md`, `docs/data-flow.md`, `docs/deployment.md`
**Complexity**: Large (multi-phase, backend + frontend + infra)

---

## Summary

Complete the e-commerce webstore from "browsable catalogue with cart" to a **production-ready full-stack application** with real orders, payments, inventory, admin dashboard, and deployed infrastructure. The frontend is feature-complete; the work is backend services, Firebase configuration, testing, and deployment.

---

## Patterns to Mirror

| Category | Source | Pattern |
|----------|--------|---------|
| **Data Access** | `src/services/products.ts:14-38` | Collection-group query with per-product fallback; normalization in `normalise.ts` |
| **Auth** | `src/lib/auth.ts` | Anonymous sign-in on app load; UID persisted in localStorage (`svt-uid`) |
| **Settings** | `src/hooks/useSettings.ts` | Session-level cache; single fetch per session; fallback to `SHOP` constant |
| **Cart** | `src/lib/cart.ts` | localStorage key `svt-cart`; denormalized snapshots for WhatsApp messages |
| **Hooks** | `src/hooks/useCatalog.ts` | State machine: `loading → ready | fallback`; single-flight module-level promise |
| **Error Handling** | `src/components/common/ErrorBoundary.tsx` | Page-level boundaries keyed by pathname; `PageError` fallback |
| **Types** | `src/types/models.ts` | Firestore document shapes match security rules exactly |
| **Security Rules** | `firestore.rules` | Default deny; public reads require `isActive == true`; admin bypass via `admins/{uid}` |

---

## Files to Change / Create

### Phase 0: Configuration (Immediate)
| File | Action | Why |
|------|--------|-----|
| `web/.env` | CREATE from `.env.example` | Firebase + Supabase credentials required for all backend features |
| `web/serviceAccountKey.json` | ADD (gitignored) | Admin SDK for seeding & future Cloud Functions |
| `firestore.indexes.json` | DEPLOY | Collection-group index for `variants` (faster catalogue loads) |

### Phase 1: Supabase Edge Function (AI Assistant)
| File | Action | Why |
|------|--------|-----|
| Supabase Dashboard → Secrets | CONFIGURE | `GROQ_API_KEY`, `GROQ_MODEL`, `ALLOWED_ORIGINS` for AI to work |

### Phase 2: Orders & Payments (Core Full-Stack)
| File | Action | Why |
|------|--------|-----|
| `firestore.rules` | UPDATE | Enable `orders` create with server-side validation; `counters` for daily sequence |
| `src/services/orders.ts` | CREATE | Typed order creation, validation, stock decrement (transaction) |
| `src/hooks/useOrder.ts` | CREATE | React hook for checkout flow, order status polling |
| `src/pages/Checkout.tsx` | CREATE | Multi-step: Review → UPI Payment → Confirmation |
| `src/pages/OrderConfirmation.tsx` | CREATE | Show pickup code (VT-YYMMDD-NNN), WhatsApp deep link |
| `src/pages/OrderStatus.tsx` | UPDATE | Replace placeholder with real order tracking |
| `src/components/order/OrderSummary.tsx` | CREATE | Reusable order line items, totals, pickup code display |
| `src/components/order/UPIPayment.tsx` | CREATE | UPI deep link / QR generation, payment verification |
| `src/components/layout/Navbar.tsx` | UPDATE | Show "Orders" link when authenticated |

### Phase 3: Admin Dashboard
| File | Action | Why |
|------|--------|-----|
| `src/pages/AdminDashboard.tsx` | CREATE | Orders list (filter by status), order detail, status transitions |
| `src/pages/AdminSettings.tsx` | CREATE | Edit `settings/shop` (rates, hours, UPI, address) |
| `src/pages/AdminInventory.tsx` | CREATE | Product/variant stock management, low-stock alerts |
| `src/hooks/useAdmin.ts` | CREATE | Admin-only data fetching, real-time listeners |
| `src/components/admin/` | CREATE | Reusable admin tables, status badges, action buttons |
| `firestore.rules` | UPDATE | Admin read/write for orders, counters, settings |

### Phase 4: Firebase Storage (Xerox Files)
| File | Action | Why |
|------|--------|-----|
| `src/services/uploads.ts` | UPDATE | Implement signed URL upload to `xerox/{uid}/{timestamp}_{filename}` |
| `src/pages/Xerox.tsx` | UPDATE | Real file upload → Firestore printJobs with storage URLs |
| `firebase.rules` (Storage) | CREATE | Authenticated upload to user's folder; admin read all |
| `firestore.rules` | UPDATE | `printJobs` in orders reference storage paths |

### Phase 5: Real-Time Inventory (Counter App)
| File | Action | Why |
|------|--------|-----|
| `src/services/inventory.ts` | CREATE | Admin stock adjustments, real-time listeners |
| `src/pages/CounterInventory.tsx` | CREATE | Simple mobile-friendly stock editor for shop staff |
| `firestore.rules` | UPDATE | Counter role write access to `variants.stockQty` |

### Phase 6: Testing Suite
| File | Action | Why |
|------|--------|-----|
| `web/vitest.config.ts` | CREATE | Vitest + React Testing Library + happy-dom |
| `web/playwright.config.ts` | CREATE | E2E: chromium, mobile Chrome, mobile Safari |
| `web/src/test/setup.ts` | CREATE | Test utilities, mock factories |
| `web/src/lib/cart.test.ts` | CREATE | P0: addItem, updateQty, removeItem, totals, WhatsApp message |
| `web/src/data/shop.test.ts` | CREATE | P0: formatPhone, formatRupees, isOpenNow, URLs |
| `web/src/services/normalise.test.ts` | CREATE | P0: normaliseCategory/Product/Variant |
| `web/src/test/firestore-rules.test.ts` | CREATE | P0: Rules unit tests (@firebase/rules-unit-testing) |
| `web/src/hooks/useCatalog.test.ts` | CREATE | P1: loading/ready/fallback, retry, online event |
| `web/e2e/home.spec.ts` | CREATE | P1: Home page loads all sections |
| `web/e2e/shop.spec.ts` | CREATE | P1: Search, filter, sort, pagination |
| `web/e2e/cart.spec.ts` | CREATE | P1: Add to cart, qty, WhatsApp order |
| `web/e2e/xerox.spec.ts` | CREATE | P1: File upload, options, WhatsApp send |
| `web/e2e/assistant.spec.ts` | CREATE | P1: Assistant query → answer |
| `web/.github/workflows/test.yml` | CREATE | CI: unit, rules, E2E on PR/push |

### Phase 7: Production Deployment & Monitoring
| File | Action | Why |
|------|--------|-----|
| `firebase.json` | UPDATE | Add security headers, CSP, custom domain config |
| `web/.github/workflows/deploy.yml` | CREATE | Preview channels for PRs, staging/prod on main |
| `web/src/lib/analytics.ts` | CREATE | Custom events: view_shop, add_to_cart, place_order, upload_xerox |
| `web/sentry.client.config.ts` | CREATE | Error tracking (optional but recommended) |
| DNS records | CONFIGURE | Custom domain `svtbooks.in` → Firebase Hosting |

---

## Tasks

### Task 0: Environment Setup (30 min)
- **Action**: Copy `.env.example` → `.env`, fill Firebase config; add `serviceAccountKey.json`
- **Mirror**: `.env.example` structure
- **Validate**: `npm run dev` → no "Firebase config missing" warning

### Task 1: Deploy Firestore Indexes (15 min)
- **Action**: `npx firebase-tools deploy --only firestore:indexes`
- **Mirror**: `firestore.indexes.json` collection-group on `variants/isActive`
- **Validate**: Console shows "Indexes deployed"; catalogue loads without fallback warning

### Task 2: Configure Supabase AI Assistant (30 min)
- **Action**: Set `GROQ_API_KEY`, `GROQ_MODEL`, `ALLOWED_ORIGINS` in Supabase Edge Function secrets
- **Mirror**: `supabase/functions/shop-assistant/index.ts:12-21`
- **Validate**: Ask Assistant "notebook price" → returns answer from facts

### Task 3: Orders Firestore Rules & Service (4 hrs)
- **Action**: 
  1. Update `firestore.rules` with `orders` create validation, `counters` increment
  2. Create `src/services/orders.ts` with `createOrder()` transaction
  3. Create `src/hooks/useOrder.ts` for checkout flow
- **Mirror**: `firestore.rules:50-59` (orders), `src/services/products.ts:14-38` (transaction pattern)
- **Validate**: `npm run test:rules` passes; order creation works in emulator

### Task 4: Checkout & Payment UI (6 hrs)
- **Action**: 
  1. Create `Checkout.tsx` (Review → UPI → Confirm)
  2. Create `UPIPayment.tsx` (deep link + QR + status polling)
  3. Create `OrderConfirmation.tsx` (pickup code VT-YYMMDD-NNN)
  4. Update `OrderStatus.tsx` with real order tracking
- **Mirror**: `src/pages/Cart.tsx` (cart flow), `src/data/shop.ts:70-102` (time formatting), `src/lib/cart.ts:60-80` (WhatsApp message)
- **Validate**: E2E test `cart.spec.ts` → place order → get pickup code

### Task 5: Admin Dashboard (5 hrs)
- **Action**: 
  1. Create `AdminDashboard.tsx` (orders list, status transitions)
  2. Create `AdminSettings.tsx` (edit shop settings)
  3. Create `AdminInventory.tsx` (stock management)
  4. Add admin routes, protect with `RequireSignIn` + role check
- **Mirror**: `src/components/common/RequireSignIn.tsx`, `src/hooks/useSettings.ts`
- **Validate**: Admin can view orders, update status, edit settings

### Task 6: Firebase Storage for Xerox (2 hrs)
- **Action**: 
  1. Implement `uploads.ts` with signed URL upload
  2. Update `Xerox.tsx` to upload files → get storage URLs
  3. Add Storage rules
- **Mirror**: `src/services/uploads.ts` (placeholder), `src/pages/Xerox.tsx` (file validation)
- **Validate**: Upload PDF → WhatsApp message includes file URLs

### Task 7: Counter Inventory App (3 hrs)
- **Action**: 
  1. Create `CounterInventory.tsx` (mobile-first stock editor)
  2. Add `counter` role to `firestore.rules` for `variants.stockQty` write
  3. Real-time stock updates on Shop page
- **Mirror**: `src/hooks/useCatalog.ts` (real-time listeners), `src/types/models.ts:82-93` (Variant)
- **Validate**: Counter updates stock → Shop page reflects immediately

### Task 8: Testing Suite (8 hrs)
- **Action**: 
  1. Install Vitest, Playwright, @firebase/rules-unit-testing
  2. Write P0 unit tests (cart, normalization, formatting, rules)
  3. Write P1 integration tests (hooks, assistant, xerox)
  4. Write P1 E2E tests (5 critical journeys)
  5. Add GitHub Actions CI workflow
- **Mirror**: `docs/testing.md` (test pyramid, priorities), `src/lib/cart.ts` (cart logic)
- **Validate**: `npm run test:all` passes; CI green on PR

### Task 9: Production Deploy & Monitoring (4 hrs)
- **Action**: 
  1. Update `firebase.json` with CSP, security headers
  2. Create deploy workflow (preview → staging → prod)
  3. Add custom analytics events
  4. Configure custom domain `svtbooks.in`
  5. (Optional) Add Sentry error tracking
- **Mirror**: `docs/deployment.md` (environments, CI/CD), `firebase.json` (hosting config)
- **Validate**: `git push origin main` → staging deploy → production deploy → domain works

---

## Validation Commands

```bash
# Phase 0-2: Config & AI
cd web && npm run dev          # No config warnings
cd web && npm run build        # Type-check + build passes

# Phase 3-6: Core Features
cd web && npm run test:rules   # Firestore rules pass
cd web && npm run test         # Unit + integration pass
cd web && npm run test:e2e     # Critical journeys pass
cd web && npm run test:all     # All tests pass

# Phase 7: Deployment
npx firebase-tools deploy --only hosting,firestore:rules,firestore:indexes
# Verify: https://sri-vishnu-teja-books-xerox.web.app works
# Verify: https://svtbooks.in works (after DNS)
```

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **Owner UPI ID not provided** | HIGH | Block Phase 4 until UPI ID confirmed; use "pay at pickup" fallback |
| **Firebase Spark plan limits** | MEDIUM | 50k reads/day; offline cache + fallback catalogue mitigate; monitor usage |
| **Groq free tier rate limits** | MEDIUM | 6/min, 40/hr per IP; already implemented in Edge Function |
| **Firestore rules validation complexity** | MEDIUM | Use emulator for iterative testing; `firebase-tools emulators:start` |
| **Admin dashboard scope creep** | MEDIUM | Phase 3: MVP only (orders, settings, inventory); defer analytics |
| **Real-time stock sync conflicts** | LOW | Firestore transactions for stock decrement; counter app is single-user |
| **Custom domain DNS propagation** | LOW | Configure early; use Firebase preview channels for testing |

---

## Acceptance Criteria

- [ ] All 9 tasks complete
- [ ] Validation commands pass
- [ ] Patterns mirrored from existing codebase (no reinvented patterns)
- [ ] 80%+ test coverage on new code
- [ ] No CRITICAL/HIGH security issues
- [ ] Production deployment accessible at custom domain
- [ ] End-to-end order flow works: Browse → Cart → Checkout → UPI → Pickup Code → Admin marks Ready → Customer collects

---

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes / modify: [changes] / skip to phase: [N])