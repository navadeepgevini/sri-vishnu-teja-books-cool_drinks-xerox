import type { Settings } from '../types/models'

// Fallback shop settings. The live values are the settings/shop document in Firestore (read through
// useSettings); these are used until it loads, whenever Firestore is unreachable, and by the seed script.
export const SHOP: Settings = {
  // TODO: confirm with owner — number taken from Google Maps / description.txt.
  phone: '9951021282',
  whatsapp: '9951021282',
  normalRate: 2,
  bulkRate: 1.5,
  // TODO: confirm with owner — bulk threshold not yet confirmed.
  bulkLimit: 100,
  doubleSideRate: 4,
  cardCopyRate: 3,
  colorRate: 10,
  laminationOnly: 20,
  laminationWithCopy: 40,
  openTime: '08:00',
  closeTime: '23:00',
  timeZone: 'Asia/Kolkata',
  // TODO: owner to provide the shop's UPI ID before payments go live (Phase 4).
  upiId: '',
  upiName: 'Sri Vishnu Teja Books & Xerox',
  address: 'Near Bajaj Showroom, RS Road, Railway Kodur, Tirupati Dist., Andhra Pradesh 516101, India',
  mapsUrl: 'https://maps.app.goo.gl/yCzP1rFpVHKWxPJX7',
  forceClosed: false,
}

/** The shop's pin on Google Maps ("SRI VISHNU TEJA BOOKS AND XEROX", owner's link of 2026-09-22). */
export const SHOP_LOCATION = {
  lat: 13.9531717,
  lng: 79.3515113,
  placeUrl: 'https://maps.app.goo.gl/yCzP1rFpVHKWxPJX7',
}

/** Google's free embeddable map (no API key): pan, zoom and Street View, centred on the shop. */
export const mapEmbedUrl = ({ lat, lng } = SHOP_LOCATION) =>
  `https://maps.google.com/maps?q=${lat},${lng}&z=17&hl=en&output=embed`

/** Opens turn-by-turn directions from the visitor's location (Google Maps app on phones). */
export const directionsUrl = ({ lat, lng } = SHOP_LOCATION) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

/** Any typed form ("+91 99510 21282", "09951021282", "919951021282") -> "9951021282". */
export function normalisePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.length > 10 && /^(91|0)/.test(digits) ? digits.slice(-10) : digits
}

export const telHref = (phone: string) => `tel:+91${normalisePhone(phone)}`
export const whatsappHref = (whatsapp: string) => `https://wa.me/91${normalisePhone(whatsapp)}`

/** "9951021282" -> "+91 99510 21282" */
export function formatPhone(phone: string): string {
  const digits = normalisePhone(phone)
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatRupees(amount: number): string {
  return rupees.format(amount)
}

/** "08:00" -> "8 AM" (en) / localized equivalent (te). */
export function formatTime(hhmm: string, lang: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  return new Intl.DateTimeFormat(lang === 'te' ? 'te-IN' : 'en-US', {
    hour: 'numeric',
    minute: m ? '2-digit' : undefined,
    hour12: true,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)))
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Minutes since midnight in the shop's own time zone, whatever the visitor's device says. */
function shopMinutesNow(timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  return value('hour') * 60 + value('minute')
}

export function isOpenNow(settings: Settings): boolean {
  if (settings.forceClosed) return false
  const now = shopMinutesNow(settings.timeZone)
  return now >= toMinutes(settings.openTime) && now < toMinutes(settings.closeTime)
}
