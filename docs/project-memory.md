# Project Memory — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. Architecture Decisions

| Date | Decision | Rationale | Affected Files |
|------|----------|-----------|----------------|
| 2026-09-18 | React 18 + Vite + TypeScript | Modern, fast, type-safe | package.json, tsconfig.json |
| 2026-09-18 | Tailwind CSS 4 via Vite plugin | CSS-first, no config file, fast | vite.config.ts, index.css |
| 2026-09-18 | Firebase Firestore (Spark) | Free tier, offline cache, real-time | firebase.ts, firestore.rules |
| 2026-09-18 | Anonymous Auth only | No friction for students, uid for orders | auth.ts, useAccount.ts |
| 2026-09-18 | Supabase Edge Functions for AI | Groq key never in client, CORS control | supabase/functions/shop-assistant/ |
| 2026-09-18 | Collection-group variants query | Single query for all variants, fast | products.ts, firestore.indexes.json |
| 2026-09-18 | Fallback bundled catalogue | Works offline, no blank pages | useCatalog.ts, data/home.ts |
| 2026-09-18 | localStorage cart | Persists across sessions, no backend | cart.ts |
| 2026-09-18 | WhatsApp deep links for orders | No payment gateway needed yet, familiar | Cart, Xerox pages |
| 2026-09-18 | i18next (EN/TE) | Local language support | i18n/, en.json |
| 2026-09-18 | Three.js + R3F for 3D hero | Engaging visual, differentiator | Product3DViewer.tsx, renderLoop.ts |

---

## 2. Completed Work

| Date | Work | Verification |
|------|------|--------------|
| 2026-09-18 | Project init, Firebase config, Auth | Dev server runs, anonymous sign-in works |
| 2026-09-18 | Home page: Hero, Categories, Popular, HowItWorks, VisitUs | Visual check, responsive |
| 2026-09-18 | Shop page: filters, search, sort, pagination | All filters work, URL sync |
| 2026-09-18 | Xerox page: file upload, options, WhatsApp | File validation, message format |
| 2026-09-18 | Cart: add/remove/qty, WhatsApp order | localStorage persists, message correct |
| 2026-09-18 | Shop Assistant (RAG): local search + Groq | Answers from facts only, rate limited |
| 2026-09-18 | 3D Hero scene: notebooks, pens, paper stack | Auto-rotates, drag to rotate |
| 2026-09-18 | Firestore rules + indexes deployed | Rules tested in console, indexes active |
| 2026-09-18 | Seed script with 48 products | npm run seed works, data in Firestore |
| 2026-11-21 | Bootstrap documentation created | 10 docs files created |

---

## 3. Open Issues / Known Gaps

| Issue | Priority | Status | Notes |
|-------|----------|--------|-------|
| No test suite | High | Open | Testing strategy documented in testing.md |
| Phase 4: Orders & payments | High | Planned | Firestore rules need update, checkout flow |
| Real stock management | High | Planned | Counter app needed for stock updates |
| UPI ID not configured | High | Blocked | Owner to provide UPI ID |
| Firebase Storage for xerox files | Medium | Planned | Currently placeholder URLs |
| Admin dashboard | Medium | Planned | Order management, stock, settings UI |
| Telugu translation completeness | Low | Partial | Some keys may fallback to EN |
| PWA / service worker | Low | Not started | For offline ordering |
| Component-level error boundaries | Low | Not started | Page-level only currently |
| Bundle size analysis | Low | Not started | No vite-bundle-analyzer |

---

## 4. Setup Steps (for new developers)

```bash
# 1. Clone repo
# 2. Install Firebase CLI
npm install -g firebase-tools

# 3. Login to Firebase
npx firebase-tools login

# 4. Go to web directory
cd web

# 5. Install dependencies
npm install

# 6. Copy env template
cp .env.example .env
# Edit .env with Firebase config from Firebase Console

# 7. (Optional) Add service account key for seeding
# Firebase Console → Project Settings → Service Accounts → Generate key
# Save as web/serviceAccountKey.json

# 8. Start dev server
npm run dev
# → http://localhost:5173

# 9. (Optional) Seed database
npm run seed
```

---

## 5. Key Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:5173) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run seed` | Seed Firestore with catalogue |
| `npx firebase-tools deploy --only hosting` | Deploy to Firebase Hosting |
| `npx firebase-tools deploy --only firestore:rules,firestore:indexes` | Deploy rules & indexes |
| `npx firebase-tools hosting:channel:deploy <name>` | Deploy preview channel |

---

## 6. Limitations & Constraints

| Limitation | Impact | Workaround |
|------------|--------|------------|
| Spark plan: 50k reads/day | Low for current traffic | Offline cache reduces reads |
| No Cloud Functions | Server-side logic limited | Edge Functions (Supabase), client validation |
| Anonymous auth only | No cross-device order history | Phase 4: Google OAuth linking |
| No Firebase Storage | Xerox files not uploaded yet | Placeholder, WhatsApp direct for now |
| Groq free tier limits | AI assistant rate limited | 6/min, 40/hr per IP |
| Telugu translations incomplete | Some UI shows English | Owner to review/provide translations |
| No automated tests | Regression risk | Manual testing, docs for test plan |

---

## 7. Next Safe Actions

1. **Immediate**: Implement test suite (P0: cart, normalization, formatting, rules)
2. **Phase 4 Prep**: Owner provides UPI ID, confirm bulk xerox threshold
3. **Phase 4 Implementation**: Enable order creation in rules, build checkout flow
4. **Admin Dashboard**: Build order management UI (counter role)
5. **Firebase Storage**: Implement xerox file upload with signed URLs

---

## 8. Contact / Context

- **Shop Owner**: Gevini Murali Mohan
- **Developer**: Gevini Navadeep (navadeeproy@gmail.com)
- **Shop Phone/WhatsApp**: +91 99510 21282
- **Location**: Near Bajaj Showroom, RS Road, Railway Kodur, Tirupati Dist., AP 516101
- **Firebase Project**: sri-vishnu-teja-books-xerox
- **Supabase Project**: (linked to Firebase or separate)

---

*No importers — this is reference documentation for project memory.*