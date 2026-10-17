import type { Timestamp } from 'firebase/firestore'
import type { Category, PaperSize, ProductWithVariants, Ruling, Settings, Variant } from '../types/models'
import { CATEGORY_TINTS, MODEL_COLORS, MODEL_KINDS } from '../lib/catalog'
import { SHOP, normalisePhone } from '../data/shop'

// Firestore returns whatever was written, and the console or admin app can write anything.
// These turn raw documents into safe, typed values: an invalid field falls back to a default with a
// warning, and a document that cannot be shown at all is skipped with a warning instead of crashing a page.

type Raw = Record<string, unknown>

const RULINGS: readonly Ruling[] = ['single', 'double', 'four', 'unruled']
const SIZES: readonly PaperSize[] = ['long', 'short', 'a4']
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
const finite = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)
const wholeCount = (value: unknown): number => Math.max(0, Math.floor(finite(value) ?? 0))
const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | null =>
  (allowed as readonly unknown[]).includes(value) ? (value as T) : null

function skip(kind: string, id: string, reason: string): null {
  console.warn(`Skipping ${kind} "${id}": ${reason}`)
  return null
}

function validTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

/** settings/shop. Every field falls back to src/data/shop.ts when missing or invalid. */
export function normaliseSettings(raw: Raw): Settings {
  const invalid = (field: string) => {
    if (raw[field] !== undefined) console.warn(`settings/shop: ignoring invalid ${field}`, raw[field])
  }
  const positive = (field: keyof Settings & string, fallback: number): number => {
    const n = finite(raw[field])
    if (n !== null && n > 0) return n
    invalid(field)
    return fallback
  }
  const phone = (field: 'phone' | 'whatsapp'): string => {
    const digits = normalisePhone(text(raw[field]))
    if (/^\d{10}$/.test(digits)) return digits
    invalid(field)
    return SHOP[field]
  }
  const time = (field: 'openTime' | 'closeTime'): string => {
    const value = text(raw[field])
    if (TIME.test(value)) return value
    invalid(field)
    return SHOP[field]
  }
  const zone = text(raw.timeZone)
  if (!validTimeZone(zone)) invalid('timeZone')
  const mapsUrl = text(raw.mapsUrl)
  if (!mapsUrl.startsWith('https://')) invalid('mapsUrl')

  return {
    normalRate: positive('normalRate', SHOP.normalRate),
    bulkRate: positive('bulkRate', SHOP.bulkRate),
    bulkLimit: positive('bulkLimit', SHOP.bulkLimit),
    doubleSideRate: positive('doubleSideRate', SHOP.doubleSideRate),
    cardCopyRate: positive('cardCopyRate', SHOP.cardCopyRate),
    colorRate: positive('colorRate', SHOP.colorRate),
    laminationOnly: positive('laminationOnly', SHOP.laminationOnly),
    laminationWithCopy: positive('laminationWithCopy', SHOP.laminationWithCopy),
    openTime: time('openTime'),
    closeTime: time('closeTime'),
    timeZone: zone && validTimeZone(zone) ? zone : SHOP.timeZone,
    phone: phone('phone'),
    whatsapp: phone('whatsapp'),
    upiId: text(raw.upiId),
    upiName: text(raw.upiName) || SHOP.upiName,
    address: text(raw.address) || SHOP.address,
    mapsUrl: mapsUrl.startsWith('https://') ? mapsUrl : SHOP.mapsUrl,
    forceClosed: raw.forceClosed === true,
  }
}

export function normaliseCategory(id: string, raw: Raw): Category | null {
  const nameEn = text(raw.nameEn)
  const nameTe = text(raw.nameTe)
  if (!nameEn && !nameTe) return skip('category', id, 'no name')
  return {
    id,
    slug: text(raw.slug) || id,
    nameEn: nameEn || nameTe,
    nameTe: nameTe || nameEn,
    colorToken: oneOf(raw.colorToken, CATEGORY_TINTS) ?? 'cat-long',
    icon: oneOf(raw.icon, MODEL_KINDS) ?? 'box',
    sortOrder: finite(raw.sortOrder) ?? Number.MAX_SAFE_INTEGER,
    isActive: raw.isActive === true,
    productCount: wholeCount(raw.productCount),
  }
}

export function normaliseVariant(id: string, raw: Raw): Variant | null {
  const price = finite(raw.price)
  if (price === null || price <= 0) return skip('variant', id, 'price must be a number above 0')
  const pages = finite(raw.pages)
  const mrp = finite(raw.mrp)
  return {
    id,
    label: text(raw.label) || id,
    pages: pages !== null && pages > 0 ? Math.floor(pages) : null,
    ruling: oneOf(raw.ruling, RULINGS),
    size: oneOf(raw.size, SIZES),
    price,
    mrp: mrp !== null && mrp >= price ? mrp : price,
    stockQty: wholeCount(raw.stockQty),
    lowStockAlert: wholeCount(raw.lowStockAlert),
    isActive: raw.isActive === true,
  }
}

/** A product with no sellable variant is skipped: it would otherwise show a price of ₹0. */
export function normaliseProduct(id: string, raw: Raw, variants: Variant[]): ProductWithVariants | null {
  const nameEn = text(raw.nameEn)
  const nameTe = text(raw.nameTe)
  const categoryId = text(raw.categoryId)
  if (!nameEn && !nameTe) return skip('product', id, 'no name')
  if (!categoryId) return skip('product', id, 'no categoryId')
  if (variants.length === 0) return skip('product', id, 'no active variant with a valid price')
  const modelUrl = text(raw.modelUrl)
  return {
    id,
    slug: text(raw.slug) || id,
    categoryId,
    nameEn: nameEn || nameTe,
    nameTe: nameTe || nameEn,
    brand: text(raw.brand),
    description: text(raw.description),
    modelKind: oneOf(raw.modelKind, MODEL_KINDS) ?? 'box',
    ...(modelUrl ? { modelUrl } : {}),
    coverColor: oneOf(raw.coverColor, MODEL_COLORS) ?? 'navy',
    isFeatured: raw.isFeatured === true,
    isActive: raw.isActive === true,
    createdAt: (raw.createdAt ?? null) as Timestamp | null,
    variants: [...variants].sort((a, b) => a.price - b.price),
  }
}
