import type { Timestamp } from 'firebase/firestore'

// Firestore document shapes. Field names match the data model in the build plan exactly.

export type CategoryTint =
  | 'cat-long'
  | 'cat-short'
  | 'cat-record'
  | 'cat-pens'
  | 'cat-pencils'
  | 'cat-geometry'
  | 'cat-paper'
  | 'cat-office'

/** Theme colour tokens a 3D placeholder may use (resolved from CSS variables at runtime). */
export type ModelColor = CategoryTint | 'navy' | 'ink' | 'paper'

export type ModelKind = 'notebook' | 'pen' | 'paper' | 'box' | 'bottle' | 'bag'

export type ModelSpec = {
  kind: ModelKind
  color: ModelColor
  count?: number
}

export type Ruling = 'single' | 'double' | 'four' | 'unruled'
export type PaperSize = 'long' | 'short' | 'a4'

/** settings/shop */
export interface Settings {
  normalRate: number // B&W xerox, per side
  bulkRate: number // B&W xerox per side at or above bulkLimit sides
  bulkLimit: number
  doubleSideRate: number // one sheet printed on both sides
  cardCopyRate: number // xerox of an ID card (Aadhaar, PAN, ration card)
  colorRate: number // colour xerox, starting price per page (depends on colour coverage)
  laminationOnly: number
  laminationWithCopy: number // laminated duplicate of a card (copy + lamination)
  openTime: string // "HH:mm", 24-hour, in timeZone
  closeTime: string
  timeZone: string
  phone: string // 10 digits, no +91
  whatsapp: string // 10 digits, no +91
  upiId: string
  upiName: string
  address: string
  mapsUrl: string
  forceClosed: boolean
}

/** categories/{catId} — the document id equals the slug. */
export interface Category {
  id: string
  slug: string
  nameEn: string
  nameTe: string
  colorToken: CategoryTint
  icon: ModelKind
  sortOrder: number
  isActive: boolean
  productCount: number
}

/** products/{productId} — the document id equals the slug. */
export interface Product {
  id: string
  categoryId: string
  slug: string
  nameEn: string
  nameTe: string
  brand: string
  description: string
  modelKind: ModelKind
  modelUrl?: string
  coverColor: ModelColor // a theme token name, never a raw hex value
  isFeatured: boolean
  isActive: boolean
  createdAt: Timestamp | null
}

/** products/{productId}/variants/{variantId} */
export interface Variant {
  id: string
  label: string
  pages: number | null
  ruling: Ruling | null
  size: PaperSize | null
  price: number
  mrp: number
  stockQty: number
  lowStockAlert: number
  isActive: boolean
}

export interface ProductWithVariants extends Product {
  /** Active variants, cheapest first. */
  variants: Variant[]
}

export type OrderStatus = 'new' | 'paid' | 'ready' | 'collected' | 'cancelled'
export type PaymentMethod = 'upi' | 'pickup'

export interface OrderItem {
  productId: string
  variantId: string
  nameSnapshot: string
  priceSnapshot: number
  qty: number
  lineTotal: number
}

export interface PrintJob {
  fileName: string
  filePath: string
  pagesTotal: number
  pageRange: string
  copies: number
  doubleSide: boolean
  laminateCount: number
  laminateWithCopy: boolean
  rateUsed: number
  sidesTotal: number
  sheetsTotal: number
  price: number
  note: string
}

/** orders/{orderId} */
export interface Order {
  id: string
  code: string // "VT-0917-014"
  uid: string
  customerName: string
  phone: string
  pickupNote: string
  paymentMethod: PaymentMethod
  utr: string | null
  items: OrderItem[]
  printJobs: PrintJob[]
  subtotalItems: number
  subtotalPrint: number
  total: number
  status: OrderStatus
  createdAt: Timestamp | null
  paidAt: Timestamp | null
  readyAt: Timestamp | null
  collectedAt: Timestamp | null
}

/** admins/{uid} */
export interface Admin {
  role: 'admin' | 'counter'
}
