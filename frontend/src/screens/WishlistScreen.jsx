import { Link } from 'react-router-dom'
import { Container, Button, EmptyState, Breadcrumb } from '../components/ui'
import { ProductGrid } from '../components/product/product-grid'
import { ProductCard } from '../components/product/product-card'
import { useWishlist, useProducts } from '../hooks'
import { Heart } from 'lucide-react'

/** Wishlist route — saved items via the shared ProductCard variant + a "Just for you" grid. */
function WishlistScreen() {
  const { items, count, clear, isLoading } = useWishlist()
  const { featured, isLoading: recsLoading } = useProducts()
  const recommended = featured.filter((p) => !items.some((i) => i.id === p.id)).slice(0, 4)
  if (isLoading) {
    return <Container className="py-16"><ProductGrid products={[]} loading columns={4} /></Container>
  }
  if (items.length === 0) {
    return <Container className="py-16"><EmptyState icon={Heart} title="Your wishlist is empty" description="Tap the heart on any product to save it here." action={<Button asChild><Link to="/shop">Find something you love</Link></Button>} /></Container>
  }
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} className="mb-4" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Wishlist ({count})</h1>
        <Button variant="outline" onClick={clear}>Clear all</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} variant="wishlist" />)}
      </div>
      <section className="mt-12">
        <h2 className="mb-6 font-display text-2xl font-bold text-[var(--color-text)]">Just for you</h2>
        <ProductGrid products={recommended} loading={recsLoading} columns={4} />
      </section>
    </Container>
  )
}

export { WishlistScreen }
