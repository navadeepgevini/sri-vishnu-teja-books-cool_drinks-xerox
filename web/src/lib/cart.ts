import { useSyncExternalStore } from 'react'

// The shopping cart: kept in this browser (localStorage), so it survives refreshes and is shared across tabs.
// Prices are a snapshot from when the item was added; the cart page re-prices from the live catalogue.

export type CartItem = {
  productId: string
  variantId: string
  name: string
  variantLabel: string
  price: number
  qty: number
  /** Stock when the item was added; quantities are capped at this. */
  maxQty: number
}

const STORAGE_KEY = 'svt-cart-v1'
const listeners = new Set<() => void>()
let items: CartItem[] = read()

function isCartItem(value: unknown): value is CartItem {
  const item = value as CartItem | null
  return (
    !!item &&
    typeof item.productId === 'string' &&
    typeof item.variantId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.variantLabel === 'string' &&
    typeof item.price === 'number' &&
    Number.isInteger(item.qty) &&
    item.qty > 0 &&
    typeof item.maxQty === 'number'
  )
}

function read(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function commit(next: CartItem[]) {
  items = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage blocked (private mode): the cart still works for this visit.
  }
  notify()
}

// Another tab changed the cart: pick up its version.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  items = read()
  notify()
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const matches = (item: CartItem, productId: string, variantId: string) =>
  item.productId === productId && item.variantId === variantId

/** Adds `qty` of a product option. Returns false (and changes nothing) if that would exceed the stock. */
export function addToCart(item: Omit<CartItem, 'qty'>, qty = 1): boolean {
  const existing = items.find((i) => matches(i, item.productId, item.variantId))
  const nextQty = (existing?.qty ?? 0) + qty
  if (nextQty > item.maxQty) return false
  commit(
    existing
      ? items.map((i) => (matches(i, item.productId, item.variantId) ? { ...i, ...item, qty: nextQty } : i))
      : [...items, { ...item, qty }],
  )
  return true
}

/** Sets a line's quantity (capped at stock); 0 or less removes it. */
export function setQuantity(productId: string, variantId: string, qty: number) {
  commit(
    qty <= 0
      ? items.filter((i) => !matches(i, productId, variantId))
      : items.map((i) => (matches(i, productId, variantId) ? { ...i, qty: Math.min(qty, i.maxQty) } : i)),
  )
}

export function removeFromCart(productId: string, variantId: string) {
  commit(items.filter((i) => !matches(i, productId, variantId)))
}

export function clearCart() {
  commit([])
}

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, () => items)
}

export function cartCount(list: CartItem[]): number {
  return list.reduce((sum, item) => sum + item.qty, 0)
}
