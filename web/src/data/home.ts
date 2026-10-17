import type { Category, ProductWithVariants, Variant } from '../types/models'

// The shop's catalogue, from the owner's list (product_and_mrp_inventory_list.txt) plus the owner's
// corrections of 2026-09-18. Prices are the printed MRP (the shop sells at MRP).
// Stock is a PLACEHOLDER: a fixed pseudo-random number from 10 to 39 per variant (owner's request),
// the same on every build, until real counts are entered in the counter app.
// English only (Telugu was removed at the owner's request); nameTe mirrors nameEn to keep the data model.
// Used as the seed source (scripts/seed.ts) and as the fallback when Firestore is unreachable.
// Keep this file free of runtime imports so Node can run the seed script directly.

/** Deterministic "random" stock between 10 and 39, so no item starts as low stock. */
function placeholderStock(key: string): number {
  let hash = 0
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return 10 + (hash % 30)
}

function variant(id: string, label: string, price: number, extra: Partial<Variant> = {}): Variant {
  return {
    id,
    label,
    pages: null,
    ruling: null,
    size: null,
    price,
    mrp: price,
    stockQty: 0, // replaced by placeholderStock in product()
    lowStockAlert: 5,
    isActive: true,
    ...extra,
  }
}

type ProductInput = Omit<
  ProductWithVariants,
  'slug' | 'nameTe' | 'description' | 'isActive' | 'createdAt' | 'isFeatured'
> & {
  description?: string
  isFeatured?: boolean
}

function product(input: ProductInput): ProductWithVariants {
  return {
    ...input,
    slug: input.id,
    nameTe: input.nameEn,
    description: input.description ?? '',
    isFeatured: input.isFeatured ?? false,
    isActive: true,
    createdAt: null,
    variants: input.variants.map((v) => ({ ...v, stockQty: placeholderStock(`${input.id}/${v.id}`) })),
  }
}

const PIECE = 'Per piece'
const PACK = 'Per pack'

export const FALLBACK_PRODUCTS: ProductWithVariants[] = [
  // ── Notebooks ──────────────────────────────────────────────────────────────
  product({
    id: 'long-single-line-notebook',
    categoryId: 'long-notebooks',
    nameEn: 'Long Notebook, Single Line',
    brand: 'Tejaswini / Bindu / Gopika',
    modelKind: 'notebook',
    coverColor: 'cat-long',
    isFeatured: true,
    variants: [variant('standard', 'About 160–192 pages', 45, { ruling: 'single', size: 'long' })],
  }),
  product({
    id: 'long-register-notebook',
    categoryId: 'long-notebooks',
    nameEn: 'Long Register Notebook (Deluxe)',
    brand: '',
    modelKind: 'notebook',
    coverColor: 'navy',
    variants: [variant('standard', 'About 240–300 pages', 60, { ruling: 'single', size: 'long' })],
  }),
  product({
    id: 'short-single-line-notebook',
    categoryId: 'short-notebooks',
    nameEn: 'Short Notebook, Single Line',
    brand: '',
    modelKind: 'notebook',
    coverColor: 'cat-short',
    variants: [variant('standard', 'About 160–192 pages', 30, { ruling: 'single', size: 'short' })],
  }),
  product({
    id: 'rough-notebook',
    categoryId: 'short-notebooks',
    nameEn: 'Rough Notebook',
    brand: '',
    modelKind: 'notebook',
    coverColor: 'cat-pencils',
    variants: [
      variant('150-pages', '150 pages', 50, { pages: 150, ruling: 'unruled' }),
      variant('200-pages', '200 pages', 60, { pages: 200, ruling: 'unruled' }),
    ],
  }),

  // ── Chart paper & covers ───────────────────────────────────────────────────
  product({
    id: 'colour-chart-paper',
    categoryId: 'chart-paper',
    nameEn: 'Colour Chart Paper Roll',
    brand: '',
    modelKind: 'paper',
    coverColor: 'cat-paper',
    variants: [
      variant('pink', 'Pink', 5),
      variant('yellow', 'Yellow', 5),
      variant('orange', 'Orange', 5),
      variant('sky-blue', 'Sky blue', 5),
      variant('navy-blue', 'Navy blue', 5),
      variant('brown', 'Brown', 5),
    ],
  }),
  product({
    id: 'white-chart-paper',
    categoryId: 'chart-paper',
    nameEn: 'White Chart Paper / Drawing Sheet',
    brand: '',
    modelKind: 'paper',
    coverColor: 'cat-pens',
    variants: [variant('roll', 'Per roll', 5)],
  }),
  product({
    id: 'brown-cover-paper',
    categoryId: 'chart-paper',
    nameEn: 'Brown Book Cover Paper',
    brand: '',
    modelKind: 'paper',
    coverColor: 'cat-paper',
    variants: [variant('sheet', 'Per sheet or roll', 5)],
  }),

  // ── Pens & markers ─────────────────────────────────────────────────────────
  product({
    id: 'flair-woody-ball-pen',
    categoryId: 'pens',
    nameEn: 'Flair Woody Ball Pen',
    brand: 'Flair',
    modelKind: 'pen',
    coverColor: 'cat-long',
    variants: [variant('single', PIECE, 10)],
  }),
  product({
    id: 'win-smoothie-ball-pen',
    categoryId: 'pens',
    nameEn: 'Win Smoothie Ball Pen',
    brand: 'Win',
    modelKind: 'pen',
    coverColor: 'navy',
    variants: [variant('single', PIECE, 10)],
  }),
  product({
    id: 'flair-hotline-gel-pen',
    categoryId: 'pens',
    nameEn: 'Flair Hotline Gel Pen',
    brand: 'Flair',
    modelKind: 'pen',
    coverColor: 'cat-pens',
    isFeatured: true,
    variants: [variant('single', PIECE, 10)],
  }),
  product({
    id: 'unomax-click-11',
    categoryId: 'pens',
    nameEn: 'Unomax Click 11 Retractable Pen / Mechanical Pencil',
    brand: 'Unomax',
    description: 'Star Wars design.',
    modelKind: 'pen',
    coverColor: 'ink',
    variants: [variant('single', PIECE, 20)],
  }),
  product({
    id: 'pen-display-card',
    categoryId: 'pens',
    nameEn: 'Pen Card Set',
    brand: 'Supreme / Flair',
    modelKind: 'pen',
    coverColor: 'cat-geometry',
    variants: [variant('single', 'Single pen', 10), variant('pack-10', 'Pack of 10', 100)],
  }),
  product({
    id: 'hauser-permanent-marker',
    categoryId: 'pens',
    nameEn: 'Hauser Permanent Marker',
    brand: 'Hauser',
    modelKind: 'pen',
    coverColor: 'ink',
    variants: [variant('black', 'Black', 20), variant('blue', 'Blue', 20), variant('red', 'Red', 20)],
  }),
  product({
    id: 'flair-correction-pen',
    categoryId: 'pens',
    nameEn: 'Flair Correction Pen (Whitener)',
    brand: 'Flair',
    modelKind: 'pen',
    coverColor: 'paper',
    variants: [variant('single', PIECE, 30)],
  }),

  // ── Pencils, erasers & sharpeners ─────────────────────────────────────────
  product({
    id: 'nataraj-621-pencils',
    categoryId: 'pencils',
    nameEn: 'Nataraj 621 Bold Pencils, Pack of 10',
    brand: 'Nataraj',
    modelKind: 'pen',
    coverColor: 'cat-record',
    variants: [variant('pack-10', PACK, 50)],
  }),
  product({
    id: 'apsara-platinum-pencils',
    categoryId: 'pencils',
    nameEn: 'Apsara Platinum Extra Dark Pencils, Pack of 10',
    brand: 'Apsara',
    modelKind: 'pen',
    coverColor: 'cat-pencils',
    isFeatured: true,
    variants: [variant('pack-10', PACK, 60)],
  }),
  product({
    id: 'apsara-non-dust-eraser',
    categoryId: 'pencils',
    nameEn: 'Apsara Non-Dust Eraser',
    brand: 'Apsara',
    modelKind: 'box',
    coverColor: 'paper',
    variants: [variant('single', 'One eraser', 5), variant('jar', 'Full jar', 100)],
  }),
  product({
    id: 'nataraj-sharpener',
    categoryId: 'pencils',
    nameEn: 'Nataraj Pencil Sharpener',
    brand: 'Nataraj',
    modelKind: 'box',
    coverColor: 'cat-record',
    variants: [variant('single', PIECE, 5)],
  }),

  // ── Geometry & office tools ────────────────────────────────────────────────
  product({
    id: '5g-digital-india-geometry-box',
    categoryId: 'geometry',
    nameEn: '5G Digital India Geometry Box',
    brand: '',
    description: 'Compass, divider, set squares and scale.',
    modelKind: 'box',
    coverColor: 'cat-long',
    variants: [variant('single', PIECE, 65)],
  }),
  product({
    id: 'world-map-geometry-box',
    categoryId: 'geometry',
    nameEn: 'Junior Geometry Box (World Map)',
    brand: '',
    modelKind: 'box',
    coverColor: 'cat-geometry',
    variants: [variant('single', PIECE, 80)],
  }),
  product({
    id: 'kangaro-stapler-no10',
    categoryId: 'geometry',
    nameEn: 'Kangaro No. 10 Stapler',
    brand: 'Kangaro',
    modelKind: 'box',
    coverColor: 'ink',
    variants: [variant('single', PIECE, 75)],
  }),
  product({
    id: 'kangaro-staple-pins-no10',
    categoryId: 'geometry',
    nameEn: 'Kangaro No. 10 Staple Pins',
    brand: 'Kangaro',
    modelKind: 'box',
    coverColor: 'cat-long',
    variants: [variant('box', 'Small box', 12)],
  }),
  product({
    id: 'packaging-tape-2-inch',
    categoryId: 'geometry',
    nameEn: 'Packaging Tape, 2-inch Roll',
    brand: '',
    modelKind: 'box',
    coverColor: 'cat-paper',
    variants: [variant('transparent', 'Transparent', 40), variant('brown', 'Brown', 40)],
  }),
  product({
    id: 'cellotape-small',
    categoryId: 'geometry',
    nameEn: 'Cellotape, Small Roll',
    brand: '',
    modelKind: 'box',
    coverColor: 'cat-pens',
    variants: [variant('roll', 'Per roll', 10)],
  }),

  // ── Pads, slates & cases ───────────────────────────────────────────────────
  product({
    id: 'exam-writing-pad',
    categoryId: 'exam-basics',
    nameEn: 'Exam Writing Pad',
    brand: '',
    modelKind: 'box',
    coverColor: 'cat-office',
    variants: [variant('plain', 'Plain pad', 55), variant('printed', 'Printed pad', 65)],
  }),
  product({
    id: 'rama-slate',
    categoryId: 'exam-basics',
    nameEn: 'Rama Writing Slate (Double-Sided)',
    brand: 'Rama',
    description: 'Unbreakable plastic frame.',
    modelKind: 'box',
    coverColor: 'ink',
    variants: [variant('single', PIECE, 65)],
  }),
  product({
    id: 'plastic-pencil-box',
    categoryId: 'exam-basics',
    nameEn: 'Plastic Pencil Box / Compass Case',
    brand: '',
    modelKind: 'box',
    coverColor: 'cat-office',
    variants: [variant('single', PIECE, 50)],
  }),

  // ── School bags ────────────────────────────────────────────────────────────
  product({
    id: 'blue-school-backpack',
    categoryId: 'school-bags',
    nameEn: 'Blue School Backpack',
    brand: '',
    description: 'Twin zipper, front mesh pocket.',
    modelKind: 'bag',
    coverColor: 'cat-long',
    isFeatured: true,
    variants: [variant('single', PIECE, 499)],
  }),
  product({
    id: 'red-school-backpack',
    categoryId: 'school-bags',
    nameEn: 'Red School Backpack',
    brand: '',
    description: 'Multi-compartment, contrast piping.',
    modelKind: 'bag',
    coverColor: 'cat-paper',
    variants: [variant('single', PIECE, 499)],
  }),
  product({
    id: 'football-black-backpack',
    categoryId: 'school-bags',
    nameEn: 'Black Football Print Backpack',
    brand: '',
    modelKind: 'bag',
    coverColor: 'ink',
    variants: [variant('single', PIECE, 550)],
  }),
  product({
    id: 'maroon-school-backpack',
    categoryId: 'school-bags',
    nameEn: 'Maroon Ergonomic School Backpack',
    brand: '',
    description: 'Padded straps.',
    modelKind: 'bag',
    coverColor: 'cat-record',
    variants: [variant('single', PIECE, 599)],
  }),
  product({
    id: 'green-kids-school-bag',
    categoryId: 'school-bags',
    nameEn: 'Green Kids School Bag (Princess Print)',
    brand: '',
    modelKind: 'bag',
    coverColor: 'cat-short',
    variants: [variant('single', PIECE, 399)],
  }),
  product({
    id: 'charcoal-utility-backpack',
    categoryId: 'school-bags',
    nameEn: 'Charcoal Grey Utility Backpack',
    brand: '',
    description: 'Side mesh bottle holders.',
    modelKind: 'bag',
    coverColor: 'navy',
    variants: [variant('single', PIECE, 550)],
  }),

  // ── Biscuits & chocolates ──────────────────────────────────────────────────
  product({
    id: 'parle-krackjack',
    categoryId: 'snacks',
    nameEn: 'Parle Krackjack Biscuits',
    brand: 'Parle',
    modelKind: 'box',
    coverColor: 'cat-pencils',
    variants: [variant('pack', PACK, 10)],
  }),
  product({
    id: 'parle-g-biscuits',
    categoryId: 'snacks',
    nameEn: 'Parle-G Gluco Biscuits',
    brand: 'Parle',
    modelKind: 'box',
    coverColor: 'cat-pencils',
    variants: [variant('small', 'Small pack', 5), variant('medium', 'Medium pack', 10)],
  }),
  product({
    id: 'cream-glucose-biscuits',
    categoryId: 'snacks',
    nameEn: 'Cream & Glucose Biscuits (Assorted)',
    brand: 'Britannia / Parle',
    modelKind: 'box',
    coverColor: 'cat-long',
    variants: [variant('pack', PACK, 10)],
  }),
  product({
    id: 'cadbury-dairy-milk',
    categoryId: 'snacks',
    nameEn: 'Cadbury Dairy Milk',
    brand: 'Cadbury',
    modelKind: 'box',
    coverColor: 'cat-geometry',
    variants: [
      variant('standard', 'Standard bar', 10),
      variant('medium', 'Medium bar', 20),
      variant('large', 'Large bar', 40),
    ],
  }),
  product({
    id: 'nestle-munch-kitkat',
    categoryId: 'snacks',
    nameEn: 'Nestlé Munch / KitKat',
    brand: 'Nestlé',
    modelKind: 'box',
    coverColor: 'cat-record',
    variants: [variant('small', 'Small pack', 5), variant('large', 'Large pack', 10)],
  }),
  product({
    id: 'cadbury-5-star',
    categoryId: 'snacks',
    nameEn: 'Cadbury 5 Star',
    brand: 'Cadbury',
    modelKind: 'box',
    coverColor: 'cat-pencils',
    variants: [variant('bar', 'Per bar', 10)],
  }),
  product({
    id: 'candies-toffees',
    categoryId: 'snacks',
    nameEn: 'Candies, Toffees & Lozenges',
    brand: '',
    modelKind: 'box',
    coverColor: 'cat-office',
    variants: [variant('piece', 'One piece', 1), variant('strip', 'Strip', 5)],
  }),

  // ── Cool drinks & water ────────────────────────────────────────────────────
  product({
    id: 'soft-drink-glass-bottle',
    categoryId: 'cool-drinks',
    nameEn: 'Soft Drink, Glass Bottle (200–250 ml)',
    brand: 'Coca-Cola / Thums Up / Sprite',
    modelKind: 'bottle',
    coverColor: 'cat-record',
    variants: [
      variant('coca-cola', 'Coca-Cola', 15),
      variant('thums-up', 'Thums Up', 15),
      variant('sprite', 'Sprite', 15),
    ],
  }),
  product({
    id: 'soft-drink-750ml',
    categoryId: 'cool-drinks',
    nameEn: 'Soft Drink, 750 ml Bottle',
    brand: 'Coca-Cola / Thums Up / Sprite',
    modelKind: 'bottle',
    coverColor: 'cat-short',
    variants: [
      variant('coca-cola', 'Coca-Cola', 40),
      variant('thums-up', 'Thums Up', 40),
      variant('sprite', 'Sprite', 40),
    ],
  }),
  product({
    id: 'drinking-water-1l',
    categoryId: 'cool-drinks',
    nameEn: 'Packaged Drinking Water, 1 L',
    brand: '',
    modelKind: 'bottle',
    coverColor: 'cat-long',
    variants: [variant('bottle', 'Per bottle', 20)],
  }),
  product({
    id: 'heritage-buttermilk',
    categoryId: 'cool-drinks',
    nameEn: 'Heritage Buttermilk Pouch',
    brand: 'Heritage',
    modelKind: 'box',
    coverColor: 'cat-short',
    variants: [variant('pouch', 'Per pouch', 10)],
  }),

  // ── Household ──────────────────────────────────────────────────────────────
  product({
    id: 'dish-scrub-sponge',
    categoryId: 'household',
    nameEn: 'Dish Scrub Sponge',
    brand: '',
    modelKind: 'box',
    coverColor: 'cat-short',
    variants: [variant('single', PIECE, 15)],
  }),
  product({
    id: 'clothes-pegs',
    categoryId: 'household',
    nameEn: 'Plastic Clothes Pegs',
    brand: '',
    modelKind: 'box',
    coverColor: 'cat-office',
    variants: [variant('bag', 'Per bag', 40)],
  }),
  product({
    id: 'hair-oil',
    categoryId: 'household',
    nameEn: 'Coconut / Hair Oil',
    brand: '',
    modelKind: 'bottle',
    coverColor: 'cat-pencils',
    variants: [variant('100ml', '100 ml', 45), variant('200ml', '200 ml', 70)],
  }),
  product({
    id: 'leaf-plates',
    categoryId: 'household',
    nameEn: 'Disposable Leaf Plates, Pack of 25',
    brand: '',
    modelKind: 'paper',
    coverColor: 'cat-short',
    variants: [variant('pack-25', PACK, 30)],
  }),
]

type CategoryInput = Omit<Category, 'slug' | 'nameTe' | 'isActive' | 'productCount'>

function category(input: CategoryInput): Category {
  const productCount = FALLBACK_PRODUCTS.filter((p) => p.categoryId === input.id && p.isActive).length
  return { ...input, slug: input.id, nameTe: input.nameEn, isActive: true, productCount }
}

export const FALLBACK_CATEGORIES: Category[] = [
  category({ id: 'long-notebooks', nameEn: 'Long Notebooks', colorToken: 'cat-long', icon: 'notebook', sortOrder: 1 }),
  category({ id: 'short-notebooks', nameEn: 'Short & Rough Notebooks', colorToken: 'cat-short', icon: 'notebook', sortOrder: 2 }),
  category({ id: 'pens', nameEn: 'Pens & Markers', colorToken: 'cat-pens', icon: 'pen', sortOrder: 3 }),
  category({ id: 'pencils', nameEn: 'Pencils, Erasers & Sharpeners', colorToken: 'cat-pencils', icon: 'pen', sortOrder: 4 }),
  category({ id: 'geometry', nameEn: 'Geometry & Office Tools', colorToken: 'cat-geometry', icon: 'box', sortOrder: 5 }),
  category({ id: 'chart-paper', nameEn: 'Chart Paper & Covers', colorToken: 'cat-paper', icon: 'paper', sortOrder: 6 }),
  category({ id: 'exam-basics', nameEn: 'Pads, Slates & Cases', colorToken: 'cat-office', icon: 'box', sortOrder: 7 }),
  category({ id: 'school-bags', nameEn: 'School Bags', colorToken: 'cat-record', icon: 'bag', sortOrder: 8 }),
  category({ id: 'snacks', nameEn: 'Biscuits & Chocolates', colorToken: 'cat-pencils', icon: 'box', sortOrder: 9 }),
  category({ id: 'cool-drinks', nameEn: 'Cool Drinks & Water', colorToken: 'cat-pens', icon: 'bottle', sortOrder: 10 }),
  category({ id: 'household', nameEn: 'Household Needs', colorToken: 'cat-short', icon: 'box', sortOrder: 11 }),
]
