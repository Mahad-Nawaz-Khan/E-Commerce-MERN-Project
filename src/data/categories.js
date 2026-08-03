/** Category tree for nav, mega-menu, and shop filters. */
export const categories = [
  { slug: 'phones', name: 'Phones', icon: 'Smartphone' },
  { slug: 'computers', name: 'Computers', icon: 'Laptop' },
  { slug: 'audio', name: 'Audio', icon: 'Headphones' },
  { slug: 'wearables', name: 'Wearables', icon: 'Watch' },
  { slug: 'cameras', name: 'Cameras', icon: 'Camera' },
  { slug: 'gaming', name: 'Gaming', icon: 'Gamepad2' },
  { slug: 'accessories', name: 'Accessories', icon: 'Cable' },
  { slug: 'home-lifestyle', name: 'Home & Lifestyle', icon: 'Sofa' },
]
// NOTE: product.category strings must map to these names. If existing data uses
// free-text categories (e.g. "HeadPhones", "Camera"), normalize them in M5
// ShopScreen or migrate the data strings here. For now the mega-menu links to
// /shop?category=<name> using the product.category exact string.
export const getCategoryByName = (name) => categories.find((c) => c.name === name)
