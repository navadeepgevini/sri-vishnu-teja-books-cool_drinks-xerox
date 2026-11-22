# Security & Privacy — Sri Vishnu Teja Books & Xerox Web App

**Last Updated:** 2026-11-21

---

## 1. Threat Model

### 1.1 Assets
| Asset | Sensitivity | Location |
|-------|-------------|----------|
| Customer PII (name, phone, email) | High | Firestore (orders), localStorage (cart), WhatsApp messages |
| Order history | Medium | Firestore (orders) |
| Shop settings (rates, UPI ID) | Medium | Firestore (settings/shop) |
| Firebase config (public keys) | Low | Client bundle, .env |
| Groq API key | High | Supabase Edge Function secrets |
| Service account key | Critical | Local file (gitignored), CI secrets |

### 1.2 Trust Boundaries
```
CLIENT (Browser)
  - Firebase Web SDK (public config)
  - Anonymous Auth (uid only)
  - localStorage (cart, uid, i18n)
  - Supabase fetch (publishable key)
       │ HTTPS/TLS 1.2+
       ▼
  Firebase (Auth, Firestore, Hosting, Analytics)
  Supabase Edge Function (Deno) - Groq key, Rate limit
  Groq API (LLM)
```

---

## 2. Authentication & Authorization

### 2.1 Current: Anonymous Auth Only
- **Method**: `signInAnonymously()` on first visit
- **Persistence**: UID stored in `localStorage` (`svt-uid`)
- **Session**: Firebase SDK handles token refresh automatically

### 2.2 Admin Access
- **Method**: Manual document creation in `admins/{uid}` via Firebase Console
- **Roles**: `admin` (full), `counter` (order management only)
- **Verification**: `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`

---

## 3. Data Protection

### 3.1 In Transit
- All external connections: HTTPS/TLS 1.2+

### 3.2 At Rest
| Data | Encryption | Key Management |
|------|------------|----------------|
| Firestore | Google-managed (AES-256) | Google Cloud KMS |
| Supabase Secrets | Supabase-managed | Supabase Vault |
| LocalStorage | None (browser) | N/A — non-sensitive only |

### 3.3 Client-Side Storage
| Key | Data | Sensitivity | Expiry |
|-----|------|-------------|--------|
| `svt-uid` | Anonymous auth UID | Low | Until cleared |
| `svt-cart` | Cart items (product IDs, qty, prices) | Low | Until cleared |
| `i18nextLng` | Language preference | None | Until cleared |

**No PII in localStorage.**

---

## 4. Firestore Security Rules

### 4.1 Principle: Default Deny
- All access denied unless explicitly allowed
- Public reads restricted to `isActive == true`
- All writes require admin role

### 4.2 Rules Summary (from `firestore.rules`)
- Settings: public read, admin write
- Categories/Products/Variants: active-only public read, admin write
- Collection-group variants query: same rule
- Orders: user owns, admin all; create blocked until Phase 4
- Counters: admin only
- Admins: self-read only

### 4.3 Phase 4 Order Validation (Planned)
Server-side validation of totals, UTR, status, uid match.

---

## 5. API Key Management

### 5.1 Firebase Web Config (Public)
- **Keys**: Inlined in client bundle via `VITE_*` env vars
- **Protection**: API key restrictions in Firebase Console; Firestore rules = real auth

### 5.2 Supabase Publishable Key (Public)
- **Key**: `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)
- **Protection**: CORS restricted in Edge Function; rate limiting

### 5.3 Groq API Key (Secret)
- **Key**: `GROQ_API_KEY`
- **Location**: Supabase Edge Function secrets only
- **Never in**: Client code, `.env`, git, logs

### 5.4 Service Account Key (Critical)
- **File**: `web/serviceAccountKey.json`
- **Protection**: `.gitignore`; local only; rotate periodically

---

## 6. Input Validation & Sanitization

### 6.1 Client-Side
| Input | Validation |
|-------|------------|
| Search query | Max 100 chars, trimmed |
| Assistant question | Max 200 chars, trimmed |
| Xerox files | Type: PDF, Word, images; Max 10MB each; Max 5 files |
| Cart qty | Min 1, Max variant.stockQty |
| Phone | 10 digits, normalized |
| Note fields | Max 500 chars, sanitized |

### 6.2 Edge Function (Supabase)
- CORS origin validation against allowlist
- Rate limiting: 6/min, 40/hr per IP
- Input sanitization: trim, slice, filter

---

## 7. Content Security Policy (Recommended)

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.firebaseio.com https://*.firestore.googleapis.com https://identitytoolkit.googleapis.com https://*.supabase.co https://api.groq.com;
  frame-src https://www.google.com https://maps.google.com;
```

Add to `firebase.json` hosting headers.

---

## 8. Privacy Considerations

### 8.1 Data Collected
| Data | Purpose | Retention | User Control |
|------|---------|-----------|--------------|
| Anonymous UID | Session persistence, order association | Until cleared | Clear localStorage |
| Cart contents | Shopping cart | Until cleared/order placed | Clear cart |
| Language preference | i18n | Until cleared | Change language |
| Order data (Phase 4) | Fulfillment, history | Business requirement | Request deletion |
| Assistant queries | AI response | Not stored (ephemeral) | N/A |
| Analytics events | Usage insights | 14 months (GA4 default) | Opt-out via browser |

### 8.2 No Tracking Cookies
- Firebase Analytics uses client ID in localStorage
- No third-party advertising cookies
- No cross-site tracking

### 8.3 GDPR/PDPA Rights
| Right | Implementation |
|-------|----------------|
| Access | Firebase Auth UID → Firestore query for orders |
| Rectification | Admin console edit orders/settings |
| Erasure | Delete `admins/{uid}`, user orders, cart localStorage |
| Portability | Export orders as JSON |

---

## 9. Incident Response

### 9.1 Suspected Breach
1. Rotate all compromised keys (Groq, service account, Supabase)
2. Check Firebase Auth logs, Firestore audit logs, Supabase logs
3. Disable affected features
4. Notify users if PII exposed
5. Report authorities if required (72h GDPR)

### 9.2 Key Rotation
| Key | Rotation Method | Frequency |
|-----|-----------------|-----------|
| Groq API Key | Supabase Dashboard → Secrets | 90 days or on compromise |
| Service Account | Firebase Console → Service Accounts | 90 days or on compromise |
| Supabase Anon Key | Supabase Dashboard → Settings → API | 90 days or on compromise |

---

## 10. Security Headers (Firebase Hosting)

Add to `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-XSS-Protection", "value": "1; mode=block" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ]
  }
}
```

---

## 11. Dependencies Security

```bash
cd web && npm audit
cd web && npm audit fix
```

- All dependencies from npm registry
- Lock file committed (`package-lock.json`)
- No GitHub dependencies or git URLs

---

*No importers — this is reference documentation for the project's security posture.*