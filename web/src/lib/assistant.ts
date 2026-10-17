import type { TFunction } from 'i18next'
import type { Category, ProductWithVariants, Settings } from '../types/models'
import type { PriceState } from './catalog'
import { minPrice, stockState } from './catalog'
import {
  directionsUrl,
  formatPhone,
  formatRupees,
  formatTime,
  isOpenNow,
  telHref,
  whatsappHref,
} from '../data/shop'

// The shop helper: answers from the shop's own data (settings + live catalogue), no AI and no network
// calls, so it costs nothing and never invents a price. Step 2 (optional, later): send questions it
// cannot answer to an AI through a server function, with these same facts as its context (RAG).

export type AssistantAction = { label: string; to?: string; href?: string }
export type AssistantItem = { name: string; detail: string; to: string }
export type AssistantAnswer = {
  text: string
  lines?: string[]
  items?: AssistantItem[]
  actions?: AssistantAction[]
  /** No answer in the shop data: the panel may ask the AI (step 2). */
  unanswered?: boolean
  /** The answer came from the AI, so the panel labels it. */
  fromAi?: boolean
}

export type AssistantContext = {
  t: TFunction
  lang: string
  settings: Settings
  products: ProductWithVariants[]
  categories: Category[]
  priceState: PriceState
}

export type Topic = 'hours' | 'xerox' | 'location' | 'contact' | 'delivery'

// Checked in this order; the first topic whose words appear in the question wins.
const TOPICS: { topic: Topic | 'greet' | 'thanks' | 'payment' | 'order'; words: RegExp }[] = [
  { topic: 'delivery', words: /\b(deliver\w*|home delivery|courier|ship\w*|door ?step|send (it )?home)\b/ },
  { topic: 'xerox', words: /\b(xerox\w*|print\w*|photo ?cop\w*|copy|copies|laminat\w*|aadhaa?r|pan card|ration card|id card|binding|spiral)\b/ },
  { topic: 'hours', words: /\b(open\w*|clos\w*|timings?|hours?|sunday|holiday|when)\b/ },
  { topic: 'location', words: /\b(where|address|location|locate|map|directions?|route|reach|landmark|way to)\b/ },
  { topic: 'contact', words: /\b(phone|call|number|mobile|whats ?app|contact|e-?mail|mail|owner|proprietor)\b/ },
  { topic: 'payment', words: /\b(pay\w*|upi|g ?pay|phone ?pe|paytm|cash|card payment)\b/ },
  { topic: 'order', words: /\b(order\w*|how (to|do i|can i) buy|booking|book it|reserve|cart)\b/ },
  { topic: 'thanks', words: /\b(thanks?|thank you|thx)\b/ },
  { topic: 'greet', words: /^(hi+|hello|hey|namaste|namaskaram|good (morning|afternoon|evening))\b/ },
]

// Words that say nothing about which product is meant.
const STOP = new Set(
  'a an and any are available availability buy can cost do does for get have how i in is it me much my need of on please price prices rate rs rupees show some tell the there to want what which with you your stock item items sell selling'.split(
    ' ',
  ),
)

// Everyday words → the words used in the catalogue.
const SYNONYMS: Record<string, string[]> = {
  book: ['notebook'],
  books: ['notebook'],
  notebooks: ['notebook'],
  pens: ['pen'],
  pencils: ['pencil'],
  rubber: ['eraser'],
  sharpner: ['sharpener'],
  bag: ['backpack'],
  bags: ['backpack', 'bag'],
  chocolate: ['chocolates'],
  biscuit: ['biscuits'],
  drink: ['drink', 'water', 'buttermilk'],
  drinks: ['drink', 'water', 'buttermilk'],
  coke: ['coca-cola'],
  cola: ['coca-cola'],
  thumsup: ['thums'],
  whitener: ['correction'],
  tape: ['cellotape'],
  compass: ['geometry', 'compass'],
  pins: ['pins', 'staple'],
  toffee: ['toffees', 'candies'],
  candy: ['candies'],
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function productText(p: ProductWithVariants, categoryName: string): string {
  return normalise([p.nameEn, p.brand, categoryName, p.description, ...p.variants.map((v) => v.label)].join(' '))
}

/** "pencils" → "pencil", so singular and plural match. */
const stem = (word: string) => (word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)
const stems = (text: string) => new Set(text.split(' ').map(stem))

function productDetail(p: ProductWithVariants, { t, priceState }: AssistantContext): string {
  if (priceState !== 'shown') return t('assistant.priceHidden')
  const stock = stockState(p)
  const range = new Set(p.variants.map((v) => v.price)).size > 1
  const price = `${formatRupees(minPrice(p))}${range ? '+' : ''}`
  const stockText =
    stock.status === 'out'
      ? t('assistant.outOfStock')
      : stock.status === 'low'
        ? t('assistant.lowStock', { count: stock.left })
        : t('assistant.inStock')
  return `${price} · ${stockText}`
}

/**
 * Ranks products against the question. Rare words count more than common ones (IDF): "apsara" says
 * more than "pencils", which a whole category shares. Weak matches (under 3/4 of the best) are dropped,
 * so "dairy milk" does not also list buttermilk.
 */
export function searchProducts(question: string, ctx: AssistantContext, minRatio = 0.75): ProductWithVariants[] {
  // One group per typed word: the word plus its synonyms. A group counts once (its best member).
  const groups = [
    ...new Set(
      normalise(question)
        .split(' ')
        .filter((w) => w.length >= 2 && !STOP.has(w)),
    ),
  ].map((w) => [...new Set([w, ...(SYNONYMS[w] ?? [])].map(stem))])
  if (!groups.length) return []

  const categoryName = new Map(ctx.categories.map((c) => [c.id, c.nameEn]))
  const docs = ctx.products.map((p) => {
    const text = productText(p, categoryName.get(p.categoryId) ?? '')
    return { p, text, tokens: stems(text), name: stems(normalise(`${p.nameEn} ${p.brand}`)) }
  })
  const idf = (w: string) => Math.log(1 + docs.length / Math.max(1, docs.filter((d) => d.text.includes(w)).length))
  const weight = new Map(groups.flat().map((w) => [w, idf(w)]))

  const scored = docs
    .map(({ p, text, tokens, name }) => {
      const match = (w: string) => {
        const value = weight.get(w)!
        if (name.has(w)) return value * 1.5 // in the product's own name or brand
        if (tokens.has(w)) return value // in its category, options or description
        if (w.length >= 3 && text.includes(w)) return value / 2 // part of a word ("note" in "notebook")
        return 0
      }
      const score = groups.reduce((sum, group) => sum + Math.max(...group.map(match)), 0)
      return { p, score }
    })
    .filter(({ score }) => score > 0)
  const best = Math.max(0, ...scored.map(({ score }) => score))

  return scored
    .filter(({ score }) => score >= best * minRatio)
    .sort((a, b) => b.score - a.score || Number(b.p.isFeatured) - Number(a.p.isFeatured))
    .map(({ p }) => p)
}

export function topicAnswer(topic: Topic, ctx: AssistantContext): AssistantAnswer {
  const { t, lang, settings } = ctx
  const open = formatTime(settings.openTime, lang)
  const close = formatTime(settings.closeTime, lang)

  switch (topic) {
    case 'hours':
      return {
        text: settings.forceClosed
          ? t('assistant.hoursClosedToday')
          : isOpenNow(settings)
            ? t('assistant.hoursOpen', { close })
            : t('assistant.hoursClosed', { open }),
        lines: [t('assistant.hoursDaily', { open, close })],
        actions: [{ label: t('assistant.action.directions'), href: directionsUrl() }],
      }
    case 'xerox':
      return {
        text: t('assistant.xeroxTitle'),
        lines: [
          t('assistant.xeroxBw', { price: formatRupees(settings.normalRate) }),
          t('assistant.xeroxBulk', { price: formatRupees(settings.bulkRate), count: settings.bulkLimit }),
          t('assistant.xeroxDouble', { price: formatRupees(settings.doubleSideRate) }),
          t('assistant.xeroxCard', { price: formatRupees(settings.cardCopyRate) }),
          t('assistant.xeroxLamination', { price: formatRupees(settings.laminationOnly) }),
          t('assistant.xeroxLaminatedCard', { price: formatRupees(settings.laminationWithCopy) }),
          t('assistant.xeroxColour', { price: formatRupees(settings.colorRate) }),
          t('assistant.xeroxNoBinding'),
        ],
        actions: [{ label: t('assistant.action.xerox'), to: '/xerox' }],
      }
    case 'location':
      return {
        text: t('assistant.location', { name: t('shop.fullName'), address: t('shop.address') }),
        actions: [
          { label: t('assistant.action.directions'), href: directionsUrl() },
          { label: t('assistant.action.map'), to: '/#visit' },
        ],
      }
    case 'contact':
      return {
        text: t('assistant.contact', {
          phone: formatPhone(settings.phone),
          email: t('shop.email'),
          owner: t('shop.owner'),
        }),
        actions: [
          { label: t('assistant.action.call'), href: telHref(settings.phone) },
          { label: t('assistant.action.whatsapp'), href: whatsappHref(settings.whatsapp) },
        ],
      }
    case 'delivery':
      return {
        text: t('assistant.delivery'),
        actions: [{ label: t('assistant.action.directions'), href: directionsUrl() }],
      }
  }
}

/** Answers one question from the shop's data. */
export function answer(question: string, ctx: AssistantContext): AssistantAnswer {
  const { t, settings } = ctx
  const q = normalise(question)
  const topic = TOPICS.find(({ words }) => words.test(q))?.topic

  // A shop topic ("xerox price", "is it open?", "where is the shop?") wins over product words.
  if (topic === 'payment') return { text: t('assistant.payment') }
  if (topic && topic !== 'greet' && topic !== 'thanks' && topic !== 'order') return topicAnswer(topic, ctx)

  const matches = searchProducts(q, ctx)
  if (matches.length) {
    const shown = matches.slice(0, 5)
    const topCategory = ctx.categories.find((c) => c.id === matches[0].categoryId)
    return {
      text: matches.length > shown.length ? t('assistant.foundMore', { count: matches.length }) : t('assistant.found'),
      items: shown.map((p) => ({
        name: p.nameEn,
        detail: productDetail(p, ctx),
        to: `/shop?q=${encodeURIComponent(p.nameEn)}`,
      })),
      actions:
        matches.length > shown.length && topCategory
          ? [{ label: t('assistant.action.seeAll'), to: `/shop?cat=${encodeURIComponent(topCategory.slug)}` }]
          : undefined,
    }
  }

  if (topic === 'order') {
    return {
      text: t('assistant.order'),
      actions: [
        { label: t('assistant.action.shop'), to: '/shop' },
        { label: t('assistant.action.cart'), to: '/cart' },
      ],
    }
  }
  if (topic === 'greet') return { text: t('assistant.greet') }
  if (topic === 'thanks') return { text: t('assistant.thanks') }

  return {
    text: t('assistant.notFound'),
    actions: [{ label: t('assistant.action.whatsapp'), href: whatsappHref(settings.whatsapp) }],
    unanswered: true,
  }
}

/**
 * The retrieval half of the RAG: the catalogue as short "name | price | stock" lines for the AI, the
 * products related to the question first. The catalogue is small, so the rest follows up to `limit`.
 * Only real prices are sent (never the fallback catalogue's).
 */
export function productContext(question: string, ctx: AssistantContext, limit = 60): string[] {
  const related = searchProducts(question, ctx, 0)
  const rest = ctx.products.filter((p) => !related.includes(p))
  return [...related, ...rest]
    .slice(0, limit)
    .map((p) => `${p.nameEn}${p.brand ? ` (${p.brand})` : ''} | ${productDetail(p, ctx)}`.slice(0, 120))
}
