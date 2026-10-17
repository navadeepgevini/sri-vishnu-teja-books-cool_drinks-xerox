# Sri Vishnu Teja Books & Xerox — web app

React 18 + Vite + TypeScript, Tailwind CSS 4, React Router, i18next (English / Telugu),
Firebase (Anonymous Auth, Firestore, Analytics). Budget ₹0: everything runs on the free Spark plan,
with no Cloud Functions.

## Run locally

```bash
npm install
cp .env.example .env     # then fill in the Firebase web config
npm run dev              # http://localhost:5173
npm run build            # type-check + production build into dist/
```

## One-time Firebase console setup

1. **Firestore Database → Create database.** Production mode. Pick location **asia-south1 (Mumbai)**;
   the location cannot be changed later.
2. **Authentication → Sign-in method → Anonymous → Enable.** Every visitor gets a uid without a
   login screen; orders (Phase 4) are tied to it.
3. **Deploy the security rules and indexes** (next section). Until then the database uses whatever
   rules it was created with.

## Deploy security rules and indexes

`firestore.rules` and `firestore.indexes.json` live in this folder; `firebase.json` and `.firebaserc`
point the Firebase CLI at them.

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

No CLI? Paste `firestore.rules` into **Firestore → Rules → Publish**. The indexes need the CLI (or
creating them by hand in **Firestore → Indexes**). Until the `variants` collection-group index
exists, the catalogue still works but loads variants with one query per product, and logs a warning.

## Seed the database

1. Firebase console → **Project settings → Service accounts → Generate new private key**.
2. Save the downloaded file as `web/serviceAccountKey.json`.
   **This key grants full access to the project.** It is gitignored; never commit, email or upload it.
   (Or point `GOOGLE_APPLICATION_CREDENTIALS` at the file instead.)
3. Run:

   ```bash
   npm run seed
   ```

This writes `settings/shop`, 8 categories and 12 **sample** products with their variants.
Prices and stock are placeholders; replace them before launch. Re-running overwrites those
documents, including settings edited later in the console.

The seed data is `src/data/shop.ts` (settings) and `src/data/home.ts` (catalogue). The site also uses
those same files as a fallback, so Home keeps working if Firestore is unreachable or empty.

## Make someone an admin

Admin rights come from a document at `admins/{uid}` with `{ "role": "admin" }` (or `"counter"`).
Create it by hand in the Firestore console; the uid is under **Authentication → Users**.
The website itself can never create or change admins.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/firebase.ts` | Firebase app, Auth, Firestore (offline cache), Analytics (production only) |
| `src/lib/auth.ts` | Anonymous sign-in on app start |
| `src/types/models.ts` | Firestore document types |
| `src/services/` | Typed Firestore reads (settings are cached for the session) |
| `src/hooks/useSettings.ts`, `useCatalog.ts` | React hooks over the services, with fallbacks |
| `src/data/shop.ts`, `home.ts` | Fallback data and seed source |
| `src/pages/Shop.tsx`, `src/components/shop/` | Catalogue page: URL-driven filters, sort, search, load more |
| `firestore.rules` | Security rules (the only server-side check: there are no Cloud Functions) |
| `scripts/seed.ts` | Seed script (Node 24 runs the TypeScript directly) |
