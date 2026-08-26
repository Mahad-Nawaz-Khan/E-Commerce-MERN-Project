import { describe, it, expect } from 'vitest'
import reducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '../../../src/features/cart/cartSlice'

const product = { id: 'p1', name: 'X', price: 10, slug: 'x', image: '/x.png' }
const state0 = { items: [] }

describe('cartSlice', () => {
  it('adds a new product with quantity 1 (bare product payload)', () => {
    const s = reducer(state0, addToCart(product))
    expect(s.items).toHaveLength(1)
    expect(s.items[0].quantity).toBe(1)
  })
  it('increments quantity when adding an existing product', () => {
    const s1 = reducer(state0, addToCart(product))
    const s2 = reducer(s1, addToCart(product))
    expect(s2.items).toHaveLength(1)
    expect(s2.items[0].quantity).toBe(2)
  })
  it('accepts { product, quantity } and adds the given quantity', () => {
    const s = reducer(state0, addToCart({ product, quantity: 3 }))
    expect(s.items[0].quantity).toBe(3)
  })
  it('increments by quantity when product already in cart', () => {
    const s1 = reducer(state0, addToCart({ product, quantity: 2 }))
    const s2 = reducer(s1, addToCart({ product, quantity: 3 }))
    expect(s2.items[0].quantity).toBe(5)
  })
  it('removes a product by id', () => {
    const s1 = reducer(state0, addToCart(product))
    const s2 = reducer(s1, removeFromCart('p1'))
    expect(s2.items).toHaveLength(0)
  })
  it('updateQuantity sets absolute quantity (min 1)', () => {
    const s1 = reducer(state0, addToCart(product))
    expect(reducer(s1, updateQuantity({ id: 'p1', quantity: 5 })).items[0].quantity).toBe(5)
    expect(reducer(s1, updateQuantity({ id: 'p1', quantity: 0 })).items[0].quantity).toBe(1)
  })
  it('clearCart empties the cart', () => {
    const s1 = reducer(state0, addToCart(product))
    expect(reducer(s1, clearCart()).items).toHaveLength(0)
  })
})
