# Tooling & Agents — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. Configured Tools & Skills

| Tool/Skill | Status | Purpose | Configuration |
|------------|--------|---------|---------------|
| **Vite** | ✅ Active | Dev server, build, HMR | `vite.config.ts` |
| **TypeScript** | ✅ Active | Type checking | `tsconfig.json` (strict) |
| **Tailwind CSS 4** | ✅ Active | Styling via Vite plugin | `@tailwindcss/vite` |
| **Firebase CLI** | ✅ Active | Deploy hosting, rules, indexes | `firebase.json`, `.firebaserc` |
| **Supabase CLI** | ✅ Available | Deploy Edge Functions | `supabase/functions/` |
| **Git** | ✅ Active | Version control | `.gitignore` configured |
| **npm** | ✅ Active | Package management | `package-lock.json` committed |

---

## 2. Agent Roles (Conceptual)

### Core Agents
| Agent | Responsibility | When to Invoke |
|-------|----------------|----------------|
| **Product & Project Planner** | Scope, user stories, milestones, priorities | New features, Phase planning |
| **Full-Stack Implementation** | Frontend, backend, API, data, integration | Feature implementation, bug fixes |
| **Code Intelligence** | Semantic navigation, symbols, call sites, impact | Before edits, refactoring |
| **Browser QA** | Functional, visual, responsive, a11y testing | After UI changes, before deploy |
| **Database & Migration** | Schema, migrations, query plans, data integrity | Schema changes, Firestore rules |
| **Security & Privacy** | Auth, authorization, secrets, data retention | New features handling data, reviews |
| **UI Quality & Accessibility** | Consistency, a11y, responsive, user-flow clarity | UI changes, design system work |
| **Documentation & Knowledge** | Technical docs, architecture, changelogs | After meaningful changes |
| **Evaluation & Test** | Unit, integration, E2E, regression tests | Test creation, CI setup |
| **Project Memory** | Safe, concise engineering memory | After each session/milestone |

### Optional Agents
| Agent | Trigger |
|-------|---------|
| **ML/Data Agent** | If adding ML features |
| **DevOps Agent** | If CI/CD pipeline needs maintenance |
| **Research Agent** | Literature review, official docs |
| **Performance Agent** | Profiling, load testing |
| **API/Integration Agent** | Third-party API contracts |

---

## 3. Required Permissions

| System | Role | Permissions |
|--------|------|-------------|
| **Firebase** | Owner/Editor | Deploy hosting, rules, indexes, manage auth |
| **Firebase** | Service Account | Firestore admin (seeding only) |
| **Supabase** | Owner | Deploy Edge Functions, manage secrets |
| **GitHub** | Write/Admin | Push branches, PRs, configure secrets |

---

## 4. Required Environment Variables

### Local (`.env` in `web/`)
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

### Supabase Secrets
```
GROQ_API_KEY=           # Required
GROQ_MODEL=             # Optional
ALLOWED_ORIGINS=        # Optional
```

### CI/CD (GitHub Secrets)
```
FIREBASE_SERVICE_ACCOUNT=  # JSON service account key
```

### Local File (gitignored)
```
web/serviceAccountKey.json  # Firebase Admin SDK for seeding
```

---

## 5. Local Setup Steps

```bash
# 1. Prerequisites: Node.js 24+, Git, Firebase account, Supabase account
# 2. Clone repository
# 3. Install Firebase CLI: npm install -g firebase-tools
# 4. Login: npx firebase-tools login
# 5. cd web
# 6. npm install
# 7. cp .env.example .env  # Fill in Firebase config
# 8. (Optional) Add serviceAccountKey.json for seeding
# 9. npm run dev  # http://localhost:5173
# 10. (Optional) npm run seed
```

---

## 6. Disable/Remove Integrations

| Integration | Disable | Remove |
|-------------|---------|--------|
| Firebase Auth | Comment out `signInAnonymously()` in `auth.ts` | Remove `firebase/auth`, delete `auth.ts` |
| Firestore | Mock `db` in `firebase.ts` | Remove `firebase/firestore`, delete `services/` |
| Firebase Hosting | Don't run deploy | Remove `firebase.json`, `.firebaserc` |
| Supabase Edge Function | Remove `VITE_SUPABASE_*` from `.env` | Delete `supabase/functions/`, remove `assistantAi.ts` |
| Groq AI | Remove `GROQ_API_KEY` from Supabase | Delete Edge Function, remove AI components |
| Tailwind CSS | Remove `@tailwindcss/vite` from `vite.config.ts` | Uninstall packages, rewrite styles |
| Three.js/R3F | Remove `Canvas3DHost` from `App.tsx` | Uninstall packages, delete `src/components/product/` |
| i18n | Remove provider from `main.tsx` | Uninstall packages, delete `src/i18n/` |

---

## 7. Unavailable Tools & Alternatives

| Tool | Status | Alternative |
|------|--------|-------------|
| Firebase Cloud Functions | ❌ Spark plan | Supabase Edge Functions |
| Firebase Storage | ⚠️ Not configured | Implement when needed |
| Firebase Performance | ❌ Spark plan | Chrome DevTools manual |
| Firebase Remote Config | ❌ Spark plan | Local config in `shop.ts` |
| Firebase A/B Testing | ❌ Spark plan | Manual feature flags |
| Cypress | ⚠️ Not configured | Playwright for E2E |
| Jest | ⚠️ Not configured | Vitest for Vite |
| Storybook | ❌ Overhead | Dev server component preview |
| Sentry | ❌ Not configured | Console logging, Crashlytics |

---

*No importers — this is reference documentation for tooling and agent patterns.*