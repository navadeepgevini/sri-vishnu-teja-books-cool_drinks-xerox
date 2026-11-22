# Testing — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. Current State

**No test suite exists.** This document defines the testing strategy and implementation plan.

---

## 2. Testing Strategy

### 2.1 Test Pyramid

```
        E2E (Critical)  ← 5-10 critical user journeys (Playwright)
        Integration     ← Service layer, hooks, Firebase rules
        Unit (Logic)    ← Pure functions, utilities, components
```

### 2.2 Priorities

| Priority | Area | Tool | Target Coverage |
|----------|------|------|-----------------|
| **P0** | Cart logic (add, update, remove, totals) | Vitest | 100% |
| **P0** | Shop data normalization | Vitest | 100% |
| **P0** | Phone/formatting utilities | Vitest | 100% |
| **P0** | Firestore security rules | Firebase Rules Unit Testing | 100% |
| **P1** | Catalogue hooks (useCatalog, useSettings) | Vitest + MSW | 80% |
| **P1** | Assistant search logic | Vitest | 80% |
| **P1** | Xerox validation & pricing | Vitest | 80% |
| **P1** | Critical user journeys | Playwright | 5-10 flows |
| **P2** | Component rendering | React Testing Library | 60% |
| **P2** | i18n translations | Vitest | 60% |
| **P3** | 3D components | Visual regression | Manual |

---

## 3. Unit Tests (Vitest)

### 3.1 Setup
```bash
cd web
npm install -D vitest @testing-library/react @testing-library/user-event jsdom happy-dom
npm install -D @types/testing-library__jest-dom
```

### 3.2 Test Files to Create

| File | Tests |
|------|-------|
| `src/lib/cart.test.ts` | addItem, updateQty, removeItem, clearCart, generateWhatsAppMessage, totals |
| `src/data/shop.test.ts` | formatPhone, normalisePhone, formatRupees, formatTime, isOpenNow, mapEmbedUrl, directionsUrl |
| `src/services/normalise.test.ts` | normaliseCategory, normaliseProduct, normaliseVariant (valid/invalid/edge cases) |
| `src/services/products.test.ts` | fetchActiveProducts merge logic (mock Firestore) |
| `src/hooks/useCatalog.test.ts` | loading/ready/fallback states, retry, online event |
| `src/hooks/useSettings.test.ts` | fetchSettings, caching, fallback |
| `src/components/assistant/search.test.ts` | exact match, fuzzy match, category match, ranking, limit |
| `src/components/shop/filters.test.ts` | filter logic, URL param sync, clear filters |

---

## 4. Integration Tests

### 4.1 Firebase Rules Testing
```bash
npm install -D @firebase/rules-unit-testing
```

**Test file:** `src/test/firestore-rules.test.ts`

Test cases:
- Public can read active categories only
- Admin can read all categories
- Public can read active products only
- Public can read active variants (collection-group)
- Only admin can write settings
- Only admin can write categories/products
- Orders - user reads own, admin reads all
- Orders - create blocked (Phase 4)
- Admins - self read only, no write

### 4.2 Service Layer with Mock Firestore
```bash
npm install -D @firebase/testing
```

Use `env.authenticatedContext(uid)` and `env.unauthenticatedContext()` for auth states.

---

## 5. E2E Tests (Playwright)

### 5.1 Setup
```bash
cd web
npm install -D @playwright/test
npx playwright install chromium
```

### 5.2 Critical User Journeys

| Test | File | Steps |
|------|------|-------|
| **Home page loads** | `home.spec.ts` | Visit `/`, verify Hero, Categories, Popular, HowItWorks, VisitUs |
| **Shop browse & filter** | `shop.spec.ts` | Visit `/shop`, search "pen", filter category "Pens", sort by price, load more |
| **Add to cart** | `cart.spec.ts` | Visit `/shop`, add 2 items, verify cart count, go to `/cart`, verify items & totals |
| **Xerox upload** | `xerox.spec.ts` | Visit `/xerox`, select PDF, choose options, send → WhatsApp opens |
| **Assistant query** | `assistant.spec.ts` | Click assistant, ask "notebook price", verify answer appears |
| **Language switch** | `i18n.spec.ts` | Switch to Telugu, verify translations, switch back |
| **Mobile nav** | `mobile.spec.ts` | Mobile viewport, verify bottom nav, hamburger menu |
| **Offline fallback** | `offline.spec.ts` | Simulate offline, verify bundled catalogue shows |

---

## 6. Accessibility Tests

### 6.1 Automated (axe-core)
```bash
npm install -D @axe-core/playwright
```

### 6.2 Manual Checklist
- [ ] Skip link works (Tab from top)
- [ ] All interactive elements focusable
- [ ] Focus visible and logical order
- [ ] ARIA labels on icon buttons
- [ ] Alt text on all images
- [ ] Form inputs have labels
- [ ] Error messages announced
- [ ] Color contrast ≥ 4.5:1
- [ ] Touch targets ≥ 44×44px
- [ ] Reduced motion respected

---

## 7. CI/CD Integration

### 7.1 GitHub Actions (`.github/workflows/test.yml`)
```yaml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: cd web && npm ci
      - run: cd web && npm run test -- --run

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: cd web && npm ci
      - run: cd web && npx playwright install --with-deps chromium
      - run: cd web && npm run test:e2e

  rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm' }
      - run: cd web && npm ci
      - run: cd web && npm run test:rules
```

### 7.2 Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:rules": "vitest run src/test/firestore-rules.test.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:rules && npm run test:e2e"
  }
}
```

---

## 8. Test Data Management

### 8.1 Fixtures
```
web/src/test/fixtures/
├── categories.json
├── products.json
├── variants.json
├── settings.json
└── orders.json
```

### 8.2 Factories
```typescript
// web/src/test/factories.ts
export function createMockCategory(overrides = {}) {
  return {
    id: 'test-category',
    slug: 'test-category',
    nameEn: 'Test Category',
    nameTe: 'Test Category',
    colorToken: 'cat-long',
    icon: 'notebook',
    sortOrder: 99,
    isActive: true,
    productCount: 0,
    ...overrides
  }
}

export function createMockProduct(overrides = {}) {
  return {
    id: 'test-product',
    categoryId: 'test-category',
    slug: 'test-product',
    nameEn: 'Test Product',
    nameTe: 'Test Product',
    brand: 'Test Brand',
    description: '',
    modelKind: 'box',
    coverColor: 'cat-long',
    isFeatured: false,
    isActive: true,
    createdAt: null,
    variants: [],
    ...overrides
  }
}
```

---

## 9. Running Tests

```bash
# Unit + integration
cd web && npm run test

# With coverage
cd web && npm run test:coverage

# Firestore rules only
cd web && npm run test:rules

# E2E (requires dev server)
cd web && npm run dev &  # In background
cd web && npm run test:e2e

# All tests
cd web && npm run test:all
```

---

## 10. Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Cart logic | 100% | 0% |
| Data normalization | 100% | 0% |
| Formatting utilities | 100% | 0% |
| Firestore rules | 100% | 0% |
| Hooks (catalogue, settings) | 80% | 0% |
| Assistant search | 80% | 0% |
| Xerox logic | 80% | 0% |
| E2E critical paths | 5-10 flows | 0 |
| Components | 60% | 0% |
| i18n | 60% | 0% |

---

## 11. Next Steps

1. **Install test dependencies** (`vitest`, `@playwright/test`, `@firebase/rules-unit-testing`)
2. **Create test setup** (`vitest.config.ts`, `playwright.config.ts`, `src/test/setup.ts`)
3. **Write P0 unit tests** (cart, normalization, formatting, rules)
4. **Write P1 integration tests** (hooks, assistant, xerox)
5. **Write P1 E2E tests** (5 critical journeys)
6. **Add CI workflow** (GitHub Actions)
7. **Enforce in PR checks** (require passing tests)

---

*No importers — this is reference documentation for the project's testing strategy.*