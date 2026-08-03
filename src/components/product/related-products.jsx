import { ProductGrid } from './product-grid'

export function RelatedProducts({ products, currentId }) {
  const related = products.filter((p) => p.id !== currentId).slice(0, 4)
  if (related.length === 0) return null
  return (
    <section className="py-12">
      <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-text)]">You might also like</h2>
      <ProductGrid products={related} columns={4} />
    </section>
  )
}
