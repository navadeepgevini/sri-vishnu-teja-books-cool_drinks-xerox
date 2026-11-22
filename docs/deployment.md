# Deployment — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. Environments

| Environment | URL | Purpose | Branch |
|-------------|-----|---------|--------|
| Local Dev | http://localhost:5173 | Development | any |
| Firebase Preview | https://sri-vishnu-teja-books-xerox--<PR>.web.app | PR preview | PR branches |
| Staging | https://sri-vishnu-teja-books-xerox.web.app | Pre-production | main |
| Production | https://sri-vishnu-teja-books-xerox.firebaseapp.com | Live | main (tagged) |

---

## 2. Prerequisites

### 2.1 Tools
```bash
# Firebase CLI
npm install -g firebase-tools
npx firebase-tools login
```

### 2.2 Project Configuration
- `.firebaserc` → `"default": "sri-vishnu-teja-books-xerox"`
- `firebase.json` → hosting + firestore config
- `firestore.rules` → security rules
- `firestore.indexes.json` → indexes

---

## 3. Local Development

```bash
cd web
npm install
cp .env.example .env  # Fill in Firebase config
npm run dev           # http://localhost:5173
npm run build         # Type-check + build to dist/
npm run preview       # Preview production build
```

---

## 4. Firebase Project Setup (One-Time)

### 4.1 Create Project
1. Firebase Console → Add project → `sri-vishnu-teja-books-xerox`
2. Firestore → Production mode → Location: **asia-south1 (Mumbai)**
3. Authentication → Anonymous → Enable
4. Hosting → Get started
5. (Optional) Analytics → Get measurement ID

### 4.2 Firestore Rules & Indexes
```bash
npx firebase-tools deploy --only firestore:rules
npx firebase-tools deploy --only firestore:indexes
```

### 4.3 Service Account (for seeding)
1. Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Save as `web/serviceAccountKey.json` (gitignored)

### 4.4 Seed Database
```bash
cd web && npm run seed
```

---

## 5. Build Process

```bash
cd web && npm run build
# 1. tsc --noEmit (type check)
# 2. vite build (bundles to dist/)
```

### 5.1 Environment Variables in Build
Vite inlines `import.meta.env.VITE_*` at build time.
- **Required**: All `VITE_FIREBASE_*` vars
- **Optional**: `VITE_SUPABASE_*` (AI assistant disabled if missing)

---

## 6. Deploy to Firebase Hosting

### 6.1 Preview Channel (PR Testing)
```bash
npx firebase-tools hosting:channel:deploy <channel-name>
# Creates: https://sri-vishnu-teja-books-xerox--<channel>.web.app
```

### 6.2 Staging (Main Branch)
```bash
npx firebase-tools deploy --only hosting
# Deploys to: https://sri-vishnu-teja-books-xerox.web.app
```

### 6.3 Production (Tagged Release)
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
npx firebase-tools deploy --only hosting
```

---

## 7. Supabase Edge Function Deployment

### 7.1 Via Dashboard
1. Supabase Dashboard → Edge Functions → New Function
2. Name: `shop-assistant`
3. Paste `supabase/functions/shop-assistant/index.ts`
4. Turn OFF "Verify JWT"
5. Add Secrets: `GROQ_API_KEY`, `GROQ_MODEL`, `ALLOWED_ORIGINS`

### 7.2 Via CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-ref>
supabase functions deploy shop-assistant
supabase secrets set GROQ_API_KEY=<key>
```

---

## 8. CI/CD Pipeline (GitHub Actions)

### 8.1 Workflow (`.github/workflows/deploy.yml`)
```yaml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      - run: cd web && npm ci
      - run: cd web && npm run build

  deploy-preview:
    needs: build-and-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      - run: cd web && npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: sri-vishnu-teja-books-xerox
          channelId: pr-${{ github.event.number }}
          entryPoint: ./web

  deploy-staging:
    needs: build-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      - run: cd web && npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: sri-vishnu-teja-books-xerox
          entryPoint: ./web
```

### 8.2 Required Secrets
| Secret | Value | Source |
|--------|-------|--------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON service account key | Firebase Console → Service Accounts |

---

## 9. Rollback Procedure

### 9.1 Hosting Rollback
```bash
npx firebase-tools hosting:releases:list
npx firebase-tools hosting:clone <SOURCE_SITE>:<RELEASE_ID> <TARGET_SITE>
# Or Firebase Console → Hosting → Release history → Rollback
```

### 9.2 Firestore Rules Rollback
```bash
git checkout <previous-commit> -- firestore.rules
npx firebase-tools deploy --only firestore:rules
```

### 9.3 Database Rollback
- No point-in-time recovery on Spark plan
- Manual export/import via Firebase Console or gcloud

---

## 10. Monitoring

- **Firebase Console**: Hosting, Firestore, Auth, Analytics
- **Custom Events** (planned): cart abandonment, order completion, AI usage
- **Error Tracking** (recommended): Sentry

---

## 11. Cost Management (Spark Plan)

| Resource | Limit | Usage |
|----------|-------|-------|
| Firestore Reads | 50,000/day | Low (cached) |
| Firestore Writes | 20,000/day | Low |
| Firestore Storage | 1 GiB | Minimal |
| Hosting | 10 GB/month | Low |
| Hosting Storage | 1 GB | ~5 MB |

**Estimated monthly cost: $0**

---

## 12. Custom Domain (Future)

1. Firebase Console → Hosting → Add custom domain
2. Verify ownership (TXT record)
3. Configure DNS
4. SSL auto-provisioned

Recommended: `svtbooks.in`

---

## 13. Production Release Checklist

- [ ] Environment variables set in `.env`
- [ ] `serviceAccountKey.json` present (local only)
- [ ] Firestore rules deployed and tested
- [ ] Firestore indexes deployed (collection-group variants)
- [ ] Database seeded with real prices/stock
- [ ] Supabase Edge Function deployed with Groq key
- [ ] CORS origins include production domains
- [ ] CSP headers in `firebase.json`
- [ ] Security headers in `firebase.json`
- [ ] Analytics measurement ID configured
- [ ] Custom domain configured
- [ ] Smoke test: Home, Shop, Cart, Xerox, Assistant
- [ ] Mobile testing
- [ ] Accessibility spot-check
- [ ] Backup: Export Firestore data

---

*No importers — this is reference documentation for deployment procedures.*