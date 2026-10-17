// Seeds settings/shop, the 8 categories and 12 SAMPLE products (with variants) into Firestore.
// Run from web/:  npm run seed      (setup steps: README.md → "Seed the database")
//
// Uses the Firebase Admin SDK, which bypasses security rules, with a service-account key that is
// gitignored. Node 24 runs this TypeScript file directly (type stripping), so no build step.
// Re-running overwrites these documents, including settings edited later in the console or admin app.

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { SHOP } from '../src/data/shop.ts'
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../src/data/home.ts'

const keyPath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? 'serviceAccountKey.json')
if (!existsSync(keyPath)) {
  console.error(`Service-account key not found at ${keyPath}.\nSee README.md → "Seed the database".`)
  process.exit(1)
}

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) })
const db = getFirestore()
const batch = db.batch()

batch.set(db.doc('settings/shop'), SHOP)

for (const { id, ...category } of FALLBACK_CATEGORIES) {
  batch.set(db.doc(`categories/${id}`), category)
}

let variantCount = 0
for (const { id, variants, createdAt: _unused, ...product } of FALLBACK_PRODUCTS) {
  batch.set(db.doc(`products/${id}`), { ...product, createdAt: FieldValue.serverTimestamp() })
  for (const { id: variantId, ...variant } of variants) {
    batch.set(db.doc(`products/${id}/variants/${variantId}`), variant)
    variantCount++
  }
}

await batch.commit()
console.log(
  `Seeded settings/shop, ${FALLBACK_CATEGORIES.length} categories, ${FALLBACK_PRODUCTS.length} products and ${variantCount} variants.`,
)
