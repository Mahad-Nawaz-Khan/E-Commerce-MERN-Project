export const SHIPPING_FEE = 50
export const FREE_SHIP_THRESHOLD = 1000
export const PER_PAGE = 12

export const ROUTES = {
  HOME: '/', SHOP: '/shop', PRODUCT: '/product/:slug', CART: '/cart',
  CHECKOUT: '/checkout', WISHLIST: '/wishlist', LOGIN: '/login', SIGNUP: '/sign-up',
  ABOUT: '/about', CONTACT: '/contact', FAQ: '/faq',
  PRIVACY: '/privacy-policy', TERMS: '/terms-of-use', NOT_FOUND: '*',
}

export const STORAGE_KEYS = {
  CART: 'exclusive.cart',
  WISHLIST: 'exclusive.wishlist',
  AUTH: 'exclusive.auth',
}
