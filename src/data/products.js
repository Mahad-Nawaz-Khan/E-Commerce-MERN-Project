/**
 * Static product data — replaces the Sanity CMS backend.
 *
 * Each product is a flat, normalized JS object (the source project had an
 * inconsistent `slug` shape — object on list pages, string on the detail page —
 * and Sanity asset references for images; here both are plain strings).
 *
 * Shape:
 *   id            string   — unique id (replaces Sanity _id)
 *   name          string
 *   slug          string   — url-safe, used in /product/:slug
 *   image         string   — primary image (used by product cards); equals images[0]
 *   images        string[] — gallery of up to 4 photos for the detail page (images[0] used by cards)
 *   price         number   — current/sale price
 *   originalPrice number   — pre-discount (>= price)
 *   rating        number   — 0..5, UI floors it for star count
 *   reviews       number   — shown as (N)
 *   description   string
 *   stock         number   — available stock
 *   category      string   — free-text (Phones, Computers, Camera, ...)
 *   colors        Array<{ name: string, value: string }> — selectable color variants
 *   sizes         string[] — product-specific selectable options (clothing sizes, storage, dimensions, etc.)
 *   tags          string[] — "featured", "todays-deal", "bestseller", "new"
 */

export const products = [
  {
    id: 'p1',
    name: 'IPS LCD Gaming Monitor',
    slug: 'ips-lcd-gaming-monitor',
    image: '/images/products/monitor.png',
    images: ['/images/products/monitor.png'],
    price: 650,
    originalPrice: 900,
    rating: 4.5,
    reviews: 120,
    description:
      'A high-performance IPS LCD gaming monitor with a fast refresh rate, vivid colors, and ultra-low input lag — built for competitive play and crisp productivity alike.',
    stock: 20,
    category: 'Computers',
    colors: [{ name: 'Black', value: '#171717' }],
    sizes: ["24'", "27'", "32'"],
    tags: ['featured', 'todays-deal', 'bestseller'],
  },
  {
    id: 'p2',
    name: 'H1 Gamepad',
    slug: 'h1-gamepad',
    image: '/images/products/gamepad.png',
    images: ['/images/products/gamepad.png'],
    price: 1100,
    originalPrice: 1350,
    rating: 4.8,
    reviews: 340,
    description:
      'Ergonomic wireless gamepad with hall-effect sticks, customizable back paddles, and 40-hour battery life. Compatible with PC, console, and mobile.',
    stock: 35,
    category: 'Gaming',
    colors: [{ name: 'Black', value: '#171717' }, { name: 'White', value: '#F5F5F5' }],
    sizes: ['Standard'],
    tags: ['featured', 'bestseller'],
  },
  {
    id: 'p3',
    name: 'CANON EOS DSLR Camera',
    slug: 'canon-eos-dslr-camera',
    image: '/images/products/camera.png',
    images: ['/images/products/camera.png'],
    price: 850,
    originalPrice: 950,
    rating: 4.6,
    reviews: 88,
    description:
      'A versatile DSLR with a 24.1MP sensor, 4K video, and a vari-angle touchscreen — ideal for creators who want pro-grade image quality on the move.',
    stock: 14,
    category: 'Camera',
    colors: [{ name: 'Black', value: '#171717' }],
    sizes: ['Body', '18-55mm Kit'],
    tags: ['featured', 'todays-deal'],
  },
  {
    id: 'p4',
    name: 'S Series Comfort Chair',
    slug: 's-series-comfort-chair',
    image: '/images/products/chair.png',
    images: ['/images/products/chair.png'],
    price: 375,
    originalPrice: 450,
    rating: 4.3,
    reviews: 152,
    description:
      'A breathable, ergonomic office chair with adjustable lumbar support, 4D armrests, and a class-4 gas lift for all-day comfort.',
    stock: 28,
    category: 'Home & Lifestyle',
    colors: [{ name: 'Black', value: '#171717' }, { name: 'Grey', value: '#8D8D8D' }],
    sizes: ['Standard'],
    tags: ['bestseller'],
  },
  {
    id: 'p5',
    name: 'Laptop Slim Body Pro',
    slug: 'laptop-slim-body-pro',
    image: '/images/products/laptop.png',
    images: ['/images/products/laptop.png'],
    price: 1450,
    originalPrice: 1700,
    rating: 4.7,
    reviews: 210,
    description:
      'A featherlight 14" laptop with an all-day battery, stunning 2.8K OLED display, and plenty of power for work, design, and light gaming.',
    stock: 18,
    category: 'Computers',
    colors: [{ name: 'Silver', value: '#C7C7C7' }, { name: 'Space Grey', value: '#4A4A4A' }],
    sizes: ['512GB', '1TB'],
    tags: ['featured', 'new'],
  },
  {
    id: 'p6',
    name: 'GP11 Shooter USB Gamepad',
    slug: 'gp11-shooter-usb-gamepad',
    image: '/images/products/gamepad.png',
    images: ['/images/products/gamepad.png'],
    price: 99,
    originalPrice: 120,
    rating: 4.1,
    reviews: 64,
    description:
      'Budget-friendly wired USB gamepad with dual vibration motors and a familiar button layout. Plug-and-play on PC and Android.',
    stock: 60,
    category: 'Gaming',
    colors: [{ name: 'Red', value: '#E07575' }, { name: 'Blue', value: '#4978B8' }],
    sizes: ['Standard'],
    tags: ['todays-deal'],
  },
  {
    id: 'p7',
    name: 'Quilted Satin Jacket',
    slug: 'quilted-satin-jacket',
    image: '/images/products/jacket.png',
    images: ['/images/products/jacket.png'],
    price: 230,
    originalPrice: 300,
    rating: 4.4,
    reviews: 47,
    description:
      'A lightweight quilted satin jacket with a relaxed fit, ribbed cuffs, and a soft interior lining — perfect transitional outerwear.',
    stock: 22,
    category: "Men's Fashion",
    colors: [{ name: 'Forest Green', value: '#173B34' }, { name: 'Black', value: '#171717' }],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['featured', 'new'],
  },
  {
    id: 'p8',
    name: 'HAVIT HV-G92 Gamepad',
    slug: 'havit-hv-g92-gamepad',
    image: '/images/products/gamepad.png',
    images: ['/images/products/gamepad.png'],
    price: 120,
    originalPrice: 160,
    rating: 4.5,
    reviews: 95,
    description:
      'Wired gamepad with dual motors, customizable turbo, and a 1.8m braided cable for responsive, lag-free play.',
    stock: 40,
    category: 'Gaming',
    colors: [
      { name: 'Sky Blue', value: '#7CA3BF' },
      { name: 'Red', value: '#E07575' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['todays-deal', 'bestseller'],
  },
  {
    id: 'p9',
    name: 'AK-900 Wired Keyboard',
    slug: 'ak-900-wired-keyboard',
    image: '/images/products/keyboard.png',
    images: ['/images/products/keyboard.png'],
    price: 180,
    originalPrice: 230,
    rating: 4.6,
    reviews: 132,
    description:
      'A compact mechanical keyboard with hot-swappable switches, PBT keycaps, and per-key RGB lighting for a satisfying typing experience.',
    stock: 33,
    category: 'Computers',
    colors: [{ name: 'Black', value: '#171717' }],
    sizes: ['Red Switch', 'Brown Switch'],
    tags: ['featured', 'bestseller'],
  },
  {
    id: 'p10',
    name: 'Breed Dry Dog Food',
    slug: 'breed-dry-dog-food',
    image: '/images/products/dogfood.png',
    images: ['/images/products/dogfood.png'],
    price: 45,
    originalPrice: 60,
    rating: 4.2,
    reviews: 78,
    description:
      'Nutritionally complete dry dog food made with real chicken and no artificial colors — supports healthy skin, coat, and digestion.',
    stock: 80,
    category: 'Groceries & Pets',
    colors: [{ name: 'Purple', value: '#4F355E' }],
    sizes: ['1kg', '3kg', '6kg'],
    tags: ['todays-deal', 'new'],
  },
  {
    id: 'p11',
    name: 'JBL Bluetooth Speaker',
    slug: 'jbl-bluetooth-speaker',
    image: '/images/products/jbl-speaker.png',
    images: ['/images/products/jbl-speaker.png'],
    price: 95,
    originalPrice: 130,
    rating: 4.7,
    reviews: 256,
    description:
      'Portable waterproof Bluetooth speaker with bold JBL sound, 12-hour playtime, and PartyBoost to pair multiple speakers together.',
    stock: 50,
    category: 'HeadPhones',
    colors: [{ name: 'Black', value: '#171717' }, { name: 'Blue', value: '#4978B8' }, { name: 'Red', value: '#E07575' }],
    sizes: ['Standard'],
    tags: ['featured', 'todays-deal', 'bestseller'],
  },
  {
    id: 'p12',
    name: 'Fjallraven Backpack',
    slug: 'fjallraven-backpack',
    image: '/images/products/bag.png',
    images: ['/images/products/bag.png'],
    price: 140,
    originalPrice: 180,
    rating: 4.5,
    reviews: 110,
    description:
      'A durable everyday backpack with a classic Kånken silhouette, a padded laptop sleeve, and water-resistant fabric.',
    stock: 26,
    category: 'Home & Lifestyle',
    colors: [{ name: 'Navy', value: '#25324B' }, { name: 'Red', value: '#C83D3D' }],
    sizes: ['13"', '15"', '17"'],
    tags: ['new'],
  },
  {
    id: 'p13',
    name: 'Velvet Winter Coat',
    slug: 'velvet-winter-coat',
    image: '/images/products/coat.png',
    images: ['/images/products/coat.png'],
    price: 320,
    originalPrice: 420,
    rating: 4.3,
    reviews: 41,
    description:
      'A plush velvet winter coat with a tailored fit, insulated lining, and a notched lapel for a polished cold-weather look.',
    stock: 17,
    category: "Women's Fashion",
    colors: [{ name: 'Burgundy', value: '#6F2232' }, { name: 'Black', value: '#171717' }],
    sizes: ['XS', 'S', 'M', 'L'],
    tags: ['bestseller'],
  },
  {
    id: 'p14',
    name: 'Tower Air Cooler',
    slug: 'tower-air-cooler',
    image: '/images/products/cooler.png',
    images: ['/images/products/cooler.png'],
    price: 210,
    originalPrice: 270,
    rating: 4.0,
    reviews: 36,
    description:
      'A slim tower air cooler with three fan speeds, an oscillation mode, and a remote control for whole-room comfort.',
    stock: 19,
    category: 'Home & Lifestyle',
    colors: [{ name: 'White', value: '#F5F5F5' }],
    sizes: ['White'],
    tags: ['todays-deal'],
  },
  {
    id: 'p15',
    name: 'Ralph Lauren Corology',
    slug: 'ralph-lauren-corology',
    image: '/images/products/corology.png',
    images: ['/images/products/corology.png'],
    price: 88,
    originalPrice: 110,
    rating: 4.8,
    reviews: 92,
    description:
      'A warm, woody Eau de Parfum with notes of bergamot, cedar, and amber — long-lasting and elegant for day or evening.',
    stock: 44,
    category: 'Health & Beauty',
    colors: [{ name: 'Gold', value: '#C9A65D' }],
    sizes: ['50ml', '100ml'],
    tags: ['featured', 'new'],
  },
  {
    id: 'p16',
    name: 'Kids Electric Toy Car',
    slug: 'kids-electric-toy-car',
    image: '/images/products/toycar.png',
    images: ['/images/products/toycar.png'],
    price: 160,
    originalPrice: 220,
    rating: 4.4,
    reviews: 58,
    description:
      'A ride-on electric toy car with a 12V battery, working headlights, and a parental remote — safe, fun, and easy to drive.',
    stock: 23,
    category: "Baby's & Toys",
    colors: [{ name: 'Red', value: '#C83D3D' }, { name: 'White', value: '#F5F5F5' }],
    sizes: ['Standard'],
    tags: ['bestseller', 'new'],
  },
  {
    id: 'p17',
    name: 'Modern Bookshelf',
    slug: 'modern-bookshelf',
    image: '/images/products/bookshelf.png',
    images: ['/images/products/bookshelf.png'],
    price: 290,
    originalPrice: 360,
    rating: 4.2,
    reviews: 33,
    description:
      'A minimalist five-tier bookshelf with a sturdy steel frame and engineered wood shelves — assembles in minutes.',
    stock: 15,
    category: 'Home & Lifestyle',
    colors: [{ name: 'Oak', value: '#B68D63' }, { name: 'Walnut', value: '#5D3A29' }],
    sizes: ['Standard'],
    tags: ['todays-deal'],
  },
  {
    id: 'p18',
    name: 'Running Sneakers',
    slug: 'running-sneakers',
    image: '/images/products/shoes.png',
    images: ['/images/products/shoes.png'],
    price: 130,
    originalPrice: 175,
    rating: 4.6,
    reviews: 144,
    description:
      'Lightweight running sneakers with responsive cushioning, a breathable knit upper, and a grippy rubber outsole for any terrain.',
    stock: 38,
    category: 'Sports & Outdoor',
    colors: [{ name: 'Lime', value: '#C9E630' }, { name: 'Black', value: '#171717' }],
    sizes: ['7', '8', '9', '10', '11'],
    tags: ['featured', 'bestseller'],
  },
]

/** Convenience lookups used by hooks / screens. */

/**
 * Lightweight card summary — only the fields a ProductCard needs.
 * Excludes description, stock, colors, and sizes so product grids only carry
 * display data, not full detail-page payloads.
 */
/**
 * Lightweight card summary — only the fields a ProductCard needs.
 * Excludes description, stock, colors, sizes, and the full `images` gallery so
 * product grids only carry display data, not full detail-page payloads. Cards
 * use the single `image` field (which mirrors images[0]).
 */
const FIELDS = ['id', 'name', 'slug', 'image', 'price', 'originalPrice', 'rating', 'reviews', 'category', 'tags']
const toSummary = (product) => {
  const summary = {}
  for (const field of FIELDS) {
    if (field in product) summary[field] = product[field]
  }
  return summary
}

/** Full product record for a detail page (includes description, stock, variants, and images gallery). */
export const getProductBySlug = (slug) =>
  products.find((product) => product.slug === slug)

/** Summaries (full detail screens should not use this). */
export const getProductSummaries = () => products.map(toSummary)

export const getProductSummariesByTag = (tag) =>
  products.filter((product) => product.tags.includes(tag)).map(toSummary)

/** Kept for backwards compatibility — prefer the summary variants above. */
export const getProductsByTag = (tag) =>
  products.filter((product) => product.tags.includes(tag))
