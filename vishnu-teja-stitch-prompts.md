# Sri Vishnu Teja Books & Xerox — Google Stitch Prompts

## How to use this file

- Open Google Stitch and choose **Web** mode.
- Attach the reference PDF (logo, colour palette card, 8 themed reference screens).
- Paste **one prompt at a time**, in this order:
    1. Prompt 1 — Customer web app
    2. Prompt 2 — Admin web app
    3. Prompt 3 — Shopkeeper counter web app
- If Stitch returns fewer screens than listed, ask for the missing ones by name:
    - "Now generate screen 5 in the same style."
- If desktop and mobile do not fit in one run, generate desktop first, then ask:
    - "Now create the mobile versions of these screens."

---

## Prompt 1 — Customer web app

```
Design a premium, responsive e-commerce WEB APP for "Sri Vishnu Teja Books & Xerox", a stationery and xerox shop in Railway Koduru, Andhra Pradesh. College and school students order notebooks, pens and xerox in the browser, pay by UPI, and collect at the shop. Design each screen at desktop 1440×900 first, then mobile browser 390×844.

REFERENCE:
- Follow the attached PDF for layout, spacing, component patterns and colour mood.
- The reference screens show another store's name and electronics products: NEVER copy that name, those products or images. Use only their structure and the colour system below.

CORE CONCEPT (most important):
Every product MUST be an interactive 3D object on a soft saffron pedestal with a gentle floor shadow, NEVER a flat photo. Users drag to rotate 360°.
- Product cards:
    - small 3D model on a Soft Paper card background
    - slow rotate on hover (desktop) or when visible (mobile)
    - small "360°" badge
- Product page:
    - large 3D stage with "Drag to rotate" hint
    - rotation progress ring, zoom slider, "Reset view"
    - Front / Back / Side angle chips
- Variant choice visibly updates the model (notebook thickness, cover colour)
- Loading: grey skeleton blocks plus product silhouette shimmer, then the model fades in

BRAND AND COLOUR SYSTEM (use exactly):
Principle: calm, premium, paper-like. About 60% white, 30% soft tinted surfaces, under 5% dark navy, tiny saffron accents. Colour comes from 3D products, podiums and category tiles, NEVER from loud UI elements. NO neon, NO bright gradients, NO fully saturated colours.
- Navy Ink #1F2640: top utility bar, primary filled buttons, headlines, active nav
- Paper White #FFFFFF: page background
- Soft Paper #F6F5F2: product cards and 3D stage backgrounds
- Warm Cream #F7EFE3: promo banners, info boxes
- Powder Blue #D6E3EF: home hero backdrop wall
- Desk Sand #CDBB9E: hero floor
- Soft Saffron #EDC27E: 3D podiums and product pedestals
- Saffron #E8952B: small accents only (low-stock text, 360° badge, success modal button); NEVER large areas
- Text #1B1F2A, Muted text #6B7280, Borders #E7E3DC
- Success #2F8F5B (in stock, ready, tick); Error #C0453A (out of stock)
- Category tiles, one muted tint each:
    - Long Notebooks: Dusty Blue #88A3C0
    - Short Notebooks: Sage #8FAF8C
    - Record Books: Brick #A8554F
    - Pens: Teal #7AAFAA
    - Pencils & Erasers: Mustard #D9B25C
    - Geometry: Lavender #A197B8
    - Paper & Covers: Terracotta #C98B6B
    - Office Basics: Dusty Rose #D29EA2
- Buttons: primary filled navy pill; secondary white pill with navy outline
- Filter pills: Soft Paper fill with Border outline
- Cards: 12–16px radius, very soft shadows, generous white space, line icons
- Logo: open book with rising saffron sun, wordmark "Vishnu Teja"
- Type: Poppins bold headlines (two-line style), Poppins/Inter 16px body, Noto Sans Telugu for Telugu

GLOBAL LAYOUT:
- Top utility bar (Navy Ink):
    - left: WhatsApp icon + shop number
    - center: "Open today 8 AM – 11 PM · Upload for Xerox →"
    - right: "తెలుగు / EN" toggle
- Navbar (white):
    - logo
    - Categories dropdown, Xerox, Popular, Order Status
    - search bar "Search notebooks, pens…"
    - Cart icon with count badge
- Mobile:
    - compact header with menu and search icons
    - bottom nav: Home, Shop, Xerox, Cart, Orders
- Footer:
    - "RS Road, opp. Apollo, near Bajaj showroom, Koduru"
    - hours, small map, Call and WhatsApp buttons

SCREENS (generate all 8, desktop + mobile):

1. Home
    - Hero on Powder Blue wall with Desk Sand floor:
        - headline "Skip the Xerox Queue. Shop Stationery Online."
        - subtext "Order now, pay by UPI, collect at the shop."
        - navy button "Upload for Xerox" + outlined "Shop Stationery"
        - right side: 3D scene of Soft Saffron podium blocks holding a notebook stack, pens, pencils, geometry box and a paper stack
    - "Shop Our Top Categories": 8 tall tiles in their muted tints with 3D objects and a Telugu label under each name
    - "Popular With Students This Week": 4 product cards
    - "How It Works": Order → Pay by UPI → Collect at Shop
    - Xerox banner on Warm Cream: "₹2 per side · ₹1.5 bulk from 100 sides", 3D paper stack, "Upload PDF" button

2. Categories dropdown (open over Home)
    - White panel "Popular Categories"
    - 2 columns of Soft Paper cards: 3D icon, name, "120 items available"

3. Search dropdown (open while typing "note")
    - Result rows: 3D thumbnail, product name, price
    - "See all results" link

4. Shop listing
    - Warm Cream promo banner: "Semester Ready: Record Books & Long Notebooks", navy "Shop Now", 3D notebook stack on the right
    - Filter pills: Category, Brand, Ruling, Pages, Price, All Filters; "Sort by" on the right
    - Heading "Long Notebooks For You!"
    - 4-column grid of product cards:
        - Soft Paper 3D stage, 360° badge
        - name, short detail, price top-right
        - stock badge, outlined "Add to Cart"
    - Sample items:
        - Long Notebook 200 pages ₹50
        - Record Book A4 ₹75
        - Apsara Platinum Pencils (10) ₹60
        - Flair Hotliner ₹20
    - Pagination (1 2 3 →)

5. Product detail
    - Breadcrumb: Home / Notebooks / Long Notebooks / Long Notebook 200 Pages
    - Left:
        - large 3D stage with all controls
        - 4 angle / variant thumbnails below
    - Right:
        - name, one-line description, price ₹50
        - "Choose Pages" chips: 100 / 200 / 400
        - "Choose Ruling" chips: Single / Double / 4-ruled
        - quantity stepper with "Only 12 left! Don't miss it" in Saffron
        - navy "Order & Pick Up" + outlined "Add to Cart"
        - Warm Cream info box: "Pickup at shop · Ready in about 30 min" and "Pay by UPI or at counter"
    - Below: specifications table (Brand, Pages, Size, Ruling, Binding) and "Students Also Buy" row

6. Product detail — loading state
    - Skeleton blocks for stage, title, price, chips and buttons
    - Product silhouette shimmer inside the 3D stage

7. Xerox & Checkout
    - Left card "Review Your Order":
        - product rows with 3D thumbnails
        - xerox job card "Physics_Record.pdf · 45 pages × 3 · Double side"
        - options: copies, page range, single/double side, lamination only ₹20 / with copy ₹40
        - line price "135 sides × ₹1.5 = ₹203"
    - Left card "Pickup Details":
        - Name, 10-digit Mobile
        - pickup "As soon as ready / choose time"
        - note "Pickup only · No delivery"
    - Right sticky "Order Summary":
        - items ₹50, xerox ₹203, total ₹253
        - payment radio "Pay by UPI" (selected, GPay / PhonePe / Paytm icons, QR code on desktop)
        - payment radio "Pay at pickup" (disabled, note "Xerox orders need UPI")
        - navy "Pay ₹253" button
        - small "Send order on WhatsApp" link
    - Lock line: "Files are private and auto-deleted after pickup"

8. Order success modal (over checkout, dimmed background)
    - Soft Warm Cream to Powder Blue gradient at the top, green tick with light confetti
    - "Your order has been placed!"
    - Order code "VT-0917-014" in large text, "Show this code at the counter"
    - Buttons: Saffron "Track Order", outlined "Continue Shopping", WhatsApp icon link

CONSTRAINTS:
- MUST be a responsive web app (utility bar, navbar, footer), NOT a native app
- MUST show products as 3D models on pedestals everywhere; NEVER flat photos
- MUST use only the colours above; NEVER green brand colours, neon or saturated colours
- Realistic Indian rupee (₹) data; NO lorem ipsum
- NEVER add account/login, delivery, address forms, card payment, coupons, wishlist, star ratings, dark mode, or features not listed
```

---

## Prompt 2 — Admin web app

```
Design a premium, responsive admin WEB APP for "Sri Vishnu Teja Books & Xerox", a stationery and xerox shop in Railway Koduru, Andhra Pradesh. The admin (Navadeep) manages products, prices, stock, 3D product models, categories, xerox rates and shop settings in a browser. Design each screen at desktop 1440×900 first, then mobile browser 390×844. It MUST feel like a polished modern SaaS dashboard (Shopify Admin / Linear level of finish) and share the customer web app's calm colour system.

REFERENCE:
- Follow the attached PDF for colour mood, spacing, cards, pills and skeleton states.
- NEVER copy the reference store's name, products or images.

BRAND AND COLOUR SYSTEM (use exactly):
Principle: calm and paper-like. Mostly white and Soft Paper surfaces, navy for structure, saffron only for small highlights. NO neon, NO bright gradients.
- Navy Ink #1F2640: sidebar, primary buttons, headings, active states
- Paper White #FFFFFF: cards and tables
- Soft Paper #F6F5F2: page background, 3D thumbnail backgrounds
- Warm Cream #F7EFE3: info and help boxes
- Soft Saffron #EDC27E: pedestals under 3D thumbnails, chart highlight
- Saffron #E8952B: key numbers and small badges only
- Text #1B1F2A, Muted text #6B7280, Borders #E7E3DC
- Success #2F8F5B (in stock, Ready model); Error #C0453A (out of stock, Missing model)
- Logo: open book with rising saffron sun, "Vishnu Teja · Admin"
- Type: Poppins; Noto Sans Telugu for Telugu fields
- Style: 12px card radius, very soft shadows, clean tables with Border dividers, line icons

LAYOUT:
- Desktop:
    - left Navy Ink sidebar: Dashboard, Products, 3D Models, Categories, Settings, Log out
    - top bar: search, "Shop open" toggle, "Open Counter" link, admin avatar
- Mobile:
    - top bar with hamburger menu
    - tables become stacked cards

3D RULE:
- Every product shows a small rotating 3D thumbnail on a Soft Saffron pedestal
- Every product has a 3D status chip: Ready (Success), Missing (Error), Processing (Saffron)

SCREENS (generate all 7, desktop + mobile):

1. Login
    - Centered white card: logo, email, password, navy "Log in"
    - Subtle rotating 3D notebook illustration beside it on desktop

2. Dashboard
    - KPI cards:
        - Today's orders 18
        - Pending payments 3
        - Ready for pickup 5
        - Today's sales ₹2,460 (Stationery ₹1,380 / Xerox ₹1,080)
    - Line chart: sales for the last 7 days (navy line, saffron highlight point)
    - Bar chart: top 5 products this week
    - "Low stock" list with 3D thumbnails and counts in Error colour
    - "Products missing 3D model" list with "Add model" buttons
    - Recent orders table: code, customer, type (Stationery / Xerox / Mixed), total, status chip

3. Products
    - Toolbar: search, category filter, stock filter, 3D status filter, "Import CSV", navy "+ Add product"
    - Table columns:
        - 3D thumbnail
        - name (English + Telugu), brand, variants
        - price (inline editable), stock (inline stepper)
        - 3D status chip, Featured toggle, Active toggle, actions
    - Sample rows:
        - Long Notebook 200 pages ₹50, stock 40
        - Apsara Platinum Pencils ₹60, stock 6 (low)
        - Flair Hotliner ₹20, stock 0 (out)

4. Add / Edit product
    - Left column:
        - name English, name Telugu, category, brand, description
        - Featured and Active toggles
        - variants table: label, pages, ruling, price, MRP, stock, low-stock alert, "+ Add variant"
    - Right column — 3D model panel:
        - large rotating preview on a Soft Saffron pedestal, drag to rotate
        - tabs: "Upload 3D file (.glb)" and "Upload 360° photo set (24–36 photos)"
        - upload checklist, "Preview as customer" button
    - Sticky footer: Cancel / Save product

5. 3D Models library
    - Grid of product cards with rotating models, status chips, file size, last updated
    - Tabs: All, Ready, Missing, Processing
    - Bulk upload drop zone

6. Categories
    - List with drag handles for order
    - Each row: muted tile colour swatch, icon, English and Telugu names, product count, Active toggle
    - "+ Add category"

7. Settings
    - Xerox rates card: Normal ₹2 per side, Bulk ₹1.5 per side, Bulk from 100 sides (editable)
    - Lamination card: Lamination only ₹20, Xerox + lamination ₹40
    - Shop card: hours 8:00 AM – 11:00 PM, "Force closed" toggle, address
    - Payments card: UPI ID, UPI display name, WhatsApp number
    - File privacy card: "Delete print files 48 h after pickup / 7 days after upload" toggle
    - Sticky "Save changes" bar

CONSTRAINTS:
- MUST be a responsive web app, NOT a native app
- MUST use only the colours above
- Realistic Indian rupee (₹) data; NO lorem ipsum
- NEVER add order handling screens (they belong to the Counter app), delivery management, customer accounts, multi-store, staff roles, dark mode, or features not listed
```

---

## Prompt 3 — Shopkeeper counter web app

```
Design a fast, responsive shopkeeper counter WEB APP for "Sri Vishnu Teja Books & Xerox" in Railway Koduru, Andhra Pradesh. It runs in a browser on the shop's desktop PC next to the xerox machine and on the shopkeeper's phone. The shopkeeper receives online orders, verifies UPI payments, prints xerox jobs, packs stationery, marks orders ready and hands them over. Design each screen at desktop 1440×900 first, then mobile browser 390×844. It MUST be usable in seconds during a busy rush: large buttons, clear status colours, minimal typing. Share the customer web app's calm colour system.

REFERENCE:
- Follow the attached PDF for colour mood, cards, pills and modal style.
- NEVER copy the reference store's name, products or images.

BRAND AND COLOUR SYSTEM (use exactly):
Principle: calm surfaces so status colours stand out clearly. NO neon, NO bright gradients.
- Navy Ink #1F2640: header, primary buttons, order codes
- Paper White #FFFFFF: cards
- Soft Paper #F6F5F2: page background, kanban columns
- Warm Cream #F7EFE3: highlight for new orders, info boxes
- Saffron #E8952B: "New" status, new-order glow, small badges
- Success #2F8F5B: Paid, Ready, Handed over
- Error #C0453A: UPI pending, payment not found, out of stock
- Text #1B1F2A, Muted text #6B7280, Borders #E7E3DC
- Logo: open book with rising saffron sun, "Vishnu Teja · Counter"
- Type: Poppins and Noto Sans Telugu; order codes and amounts large and bold
- Buttons at least 48px tall on desktop, 52px on mobile; 16px card radius; line icons

LAYOUT:
- Desktop top bar:
    - logo
    - tabs: Orders / Print queue / Pickup / Stock
    - "Shop open" switch, notification bell with count, "తెలుగు / EN" toggle, live clock
- Mobile:
    - compact header
    - bottom nav: Orders, Print, Pickup, Stock

SCREENS (generate all 6, desktop + mobile):

1. Orders board
    - Desktop: kanban with 4 columns New (4) → Paid (3) → Ready (5) → Collected; cards draggable
    - Mobile: status tabs with counts and a card list
    - Order card:
        - code "VT-0917-014", customer name, "5 min ago"
        - type chip (Stationery / Xerox / Mixed), item count
        - total ₹253, payment chip (UPI pending / Paid)
    - New orders appear with a soft Warm Cream background and Saffron left border, plus a sound-on icon

2. Order detail
    - Desktop: right-side drawer over the board; mobile: full screen
    - Header: code, customer name, phone with Call and WhatsApp buttons, pickup time
    - Stationery items: small 3D thumbnail, variant, qty, "Packed" checkbox each
    - Xerox job card:
        - "Physics_Record.pdf · 45 pages × 3 copies · Double side · 69 sheets"
        - "Open file" and "Print" buttons
    - Payment section:
        - UTR "412398765432"
        - buttons "Verify & Mark Paid" and "Payment not received"
    - Sticky action "Mark Ready" (disabled until paid and all items packed), then "WhatsApp customer: Ready"

3. Verify payment (modal on desktop, bottom sheet on mobile)
    - Amount ₹253, UTR in large digits with copy button
    - Hint: "Match this UTR in your UPI app history"
    - Buttons: "Matched · Mark Paid" (Success), "Not found" (Error)

4. Print queue
    - Desktop: table of paid xerox jobs (file name, pages, copies, side, sheets, lamination, price) with a PDF preview panel on the right
    - Mobile: job cards
    - Summary strip: "Paper needed today: 212 sheets · 7 jobs"
    - Per job: "Open", "Printed ✓"; completed jobs move to a collapsed "Done" section

5. Pickup
    - Big search field "Enter order code or phone" (autofocus, keyboard-first on desktop)
    - Ready orders list: code, name, total, "Paid" or "Collect ₹120 at counter" for pay-at-pickup
    - Handover panel: customer name, items summary, "Handed over" button; success state with tick

6. Stock quick update
    - Search bar, low-stock items first
    - Rows: 3D thumbnail, product and variant, stock count with − / + steppers, "Out of stock" toggle
    - Sample rows:
        - Apsara Platinum Pencils: 6 (low)
        - Flair Hotliner: 0 (out)
        - Long Notebook 200 pages: 40

CONSTRAINTS:
- MUST be a responsive web app, NOT a native app
- MUST prioritise speed: primary action always visible, max 2 clicks or taps to change an order status
- MUST use only the colours above
- Realistic Indian rupee (₹) data; NO lorem ipsum
- NEVER add product editing, price editing, settings, analytics charts, delivery, or features not listed (those belong to the Admin app)
```

---

## Follow-up messages (use after the first result)

- Colour drift: "Use only the colour system from the prompt. Replace any green, neon or saturated colour with the matching palette colour."
- Flat photos appear: "Replace every flat product photo with a 3D model on a Soft Saffron pedestal with a 360° badge."
- Missing mobile: "Now create the mobile browser versions (390×844) of these screens."
- Too busy: "Reduce colour: keep 60% white, move colour into the 3D products and category tiles only."
