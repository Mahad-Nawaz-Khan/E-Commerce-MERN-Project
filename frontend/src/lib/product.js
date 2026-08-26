import * as Icon from 'lucide-react'

/**
 * Maps a backend product (or populated cart/wishlist line) onto the display
 * shape storefront components consume: id, image, rating, reviews, and a
 * plain-string category. Tolerates already-normalized input.
 */
export function normalizeProduct(p) {
  if (!p) return p
  const category = p.category && typeof p.category === 'object' ? p.category.name : p.category
  return {
    ...p,
    id: p.id ?? p._id,
    image: p.image ?? p.images?.[0],
    rating: p.rating ?? p.ratingAvg ?? 0,
    reviews: p.reviews ?? p.ratingCount ?? 0,
    category,
  }
}

// Keyword → lucide icon mapping so live categories keep their visual identity
// without an icon column in the schema. Falls back to Tag.
const CATEGORY_ICON_HINTS = [
  ['phone', 'Smartphone'],
  ['computer', 'Laptop'],
  ['laptop', 'Laptop'],
  ['audio', 'Headphones'],
  ['headphone', 'Headphones'],
  ['speaker', 'Speaker'],
  ['wearable', 'Watch'],
  ['watch', 'Watch'],
  ['camera', 'Camera'],
  ['game', 'Gamepad2'],
  ['accessor', 'Cable'],
  ['home', 'Sofa'],
  ['lifestyle', 'Sofa'],
  ['furnit', 'Sofa'],
  ['cloth', 'Shirt'],
  ['book', 'BookOpen'],
  ['toy', 'Bot'],
]

/** Resolve a lucide icon component for a category slug (or name). */
export function categoryIcon(slugOrName = '') {
  const key = String(slugOrName).toLowerCase()
  for (const [needle, name] of CATEGORY_ICON_HINTS) {
    if (key.includes(needle)) return Icon[name] || Icon.Tag
  }
  return Icon.Tag
}
