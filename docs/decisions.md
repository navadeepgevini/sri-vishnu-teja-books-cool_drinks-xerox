# Decision Log — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## Decision Template

Each entry follows:
- **Date**: When decided
- **Decision**: What was chosen
- **Context**: Why it was needed
- **Alternatives Considered**: Other options evaluated
- **Consequences**: Trade-offs, follow-up work
- **Status**: Active / Superseded / Deferred

---

## 2026-09-18: Frontend Framework — React 18 + Vite + TypeScript

**Decision**: Use React 18 with Vite and TypeScript for the web app.

**Context**: Need a modern, fast, type-safe frontend for an e-commerce site with 3D graphics.

**Alternatives Considered**:
- Next.js: Overkill (no SSR needed, static hosting on Firebase)
- Svelte: Less ecosystem for 3D libraries
- Plain JS: No type safety, harder maintenance

**Consequences**:
- Fast HMR, excellent DX
- Type safety across components/services
- Code splitting via lazy routes
- Client-side only (no SSR for SEO) — acceptable for app-like experience

**Status**: Active

---

## 2026-09-18: Styling — Tailwind CSS 4

**Decision**: Use Tailwind CSS 4 via `@tailwindcss/vite` plugin.

**Context**: Need responsive, mobile-first design with consistent design tokens.

**Alternatives Considered**:
- CSS Modules: More boilerplate, no design system
- Styled Components: Runtime overhead, larger bundle
- Plain CSS: No utility-first speed, inconsistent spacing

**Consequences**:
- CSS-first config (no tailwind.config.js)
- Fast build, minimal CSS output
- Design tokens via CSS variables
- Learning curve for team unfamiliar with Tailwind

**Status**: Active

---

## 2026-09-18: Database — Firebase Firestore (Spark Plan)

**Decision**: Use Firebase Firestore on free Spark plan.

**Context**: Need real-time database with offline support, free hosting, minimal ops.

**Alternatives Considered**:
- Supabase (PostgreSQL): Requires server, more complex auth
- MongoDB Atlas: Free tier limited, no offline SDK
- Custom backend: Too much ops for this project

**Consequences**:
- Free tier sufficient for current scale
- Offline persistence built-in
- Security rules = serverless authz
- 50k reads/day limit — mitigated by caching
- No Cloud Functions on Spark — use Supabase Edge Functions

**Status**: Active

---

## 2026-09-18: Authentication — Anonymous Only (Phase 1-3)

**Decision**: Use Firebase Anonymous Auth only; no email/password or OAuth yet.

**Context**: Students need zero-friction access; orders tied to anonymous UID.

**Alternatives Considered**:
- Email/password: Friction, password reset flows
- Google OAuth: Requires consent screen, more complex
- Phone auth: SMS costs, not needed

**Consequences**:
- Zero friction — works immediately
- UID persists in localStorage
- Can link to Google OAuth later (Phase 4)
- No cross-device order history until linked
- Cannot enforce one account per person

**Status**: Active (Phase 4 will add Google OAuth linking)

---

## 2026-09-18: AI Assistant — Supabase Edge Function + Groq

**Decision**: Use Supabase Edge Functions (Deno) to call Groq LLM; key never in client.

**Context**: Need shop assistant that answers from shop facts + product catalogue.

**Alternatives Considered**:
- Client-side Groq call: Exposes API key
- Firebase Cloud Functions: Not on Spark plan
- Custom backend: More ops
- OpenAI: More expensive than Groq free tier

**Consequences**:
- Groq key only in Supabase secrets
- CORS controlled in Edge Function
- Rate limiting per IP
- RAG: local search → send top matches → LLM answers from facts only
- Cold start latency (~1-2s)
- Groq free tier limits

**Status**: Active

---

## 2026-09-18: Catalogue Loading — Collection-Group + Fallback

**Decision**: Use collection-group query for variants with per-product fallback.

**Context**: Need fast catalogue load; collection-group index may not be deployed yet.

**Alternatives Considered**:
- Only per-product variants: Slower, N+1 queries
- Only collection-group: Fails if index not deployed
- Denormalize variants on product: Larger docs, harder updates

**Consequences**:
- Fast path when index deployed
- Graceful fallback with warning
- Bundled fallback if Firestore unreachable
- More complex service code

**Status**: Active

---

## 2026-09-18: Cart Storage — localStorage

**Decision**: Store cart in localStorage; sync via WhatsApp for orders.

**Context**: No backend order system yet; simple, persistent, works offline.

**Alternatives Considered**:
- Firestore cart: Requires auth, more reads/writes
- IndexedDB: Overkill for small cart
- Server session: Requires backend

**Consequences**:
- Zero backend needed
- Persists across browser sessions
- Works offline
- No cross-device cart sync
- User can manipulate prices (mitigated: server validates in Phase 4)

**Status**: Active (Phase 4 moves orders to Firestore)

---

## 2026-09-18: Order Flow — WhatsApp Deep Links

**Decision**: Generate WhatsApp message with order details; customer sends to shop.

**Context**: No payment gateway integration yet; WhatsApp is universal in India.

**Alternatives Considered**:
- Razorpay/Stripe: Requires KYC, settlement, fees
- UPI intent: Requires UPI ID, app installed
- Cash on delivery: No tracking

**Consequences**:
- Zero payment integration complexity
- Shop owner familiar with WhatsApp
- Order confirmation via chat
- Manual order tracking
- No payment verification until Phase 4

**Status**: Active (Phase 4 adds UPI + Firestore orders)

---

## 2026-09-18: 3D Graphics — Three.js + React Three Fiber

**Decision**: Use @react-three/fiber + @react-three/drei for hero 3D scene.

**Context**: Want engaging, interactive hero showing notebooks, pens, paper.

**Alternatives Considered**:
- Static image/animation: Less engaging
- Lottie: Limited interactivity
- Spline: External dependency, less control
- Raw Three.js: More boilerplate, harder React integration

**Consequences**:
- Declarative 3D in React
- Reusable model components
- Auto-rotation + drag controls
- Bundle size increase (~50KB gzipped)
- Mobile performance — lazy loaded, reduced quality

**Status**: Active

---

## 2026-09-18: Internationalization — i18next (English + Telugu)

**Decision**: Use i18next + react-i18next with English and Telugu.

**Context**: Local customers speak Telugu; English for broader audience.

**Alternatives Considered**:
- No i18n: Excludes Telugu speakers
- Custom solution: Reinventing wheel
- FormatJS: More complex setup

**Consequences**:
- Standard library, good React integration
- Language detection + localStorage persistence
- Interpolation, pluralization support
- Telugu translations incomplete (owner to review)
- Some keys fallback to English

**Status**: Active

---

## 2026-11-21: Documentation — Bootstrap Template Applied

**Decision**: Apply universal AI project bootstrap template to create comprehensive docs.

**Context**: Project lacked documentation; need architecture, data flow, API reference, testing, security, deployment docs.

**Alternatives Considered**:
- Minimal README only: Insufficient for maintenance
- Ad-hoc docs: Inconsistent, incomplete
- Auto-generated only: Misses context/rationale

**Consequences**:
- 10 structured docs created
- Covers architecture, data flow, API, schema, testing, security, deployment
- External source review log
- Project memory for onboarding
- Decision log for future reference

**Status**: Active

---

*No importers — this is reference documentation for project decisions.*