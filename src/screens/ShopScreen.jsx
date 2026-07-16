import { Link, useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { ProductCard } from '../components/ui/ProductCard'
import { useProducts } from '../hooks/useProducts'

function ShopScreen() {
  const { all } = useProducts()
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search')?.trim().toLowerCase() ?? ''
  const category = searchParams.get('category') ?? ''
  const products = all.filter((product) => {
    const matchesSearch = !search || `${product.name} ${product.description}`.toLowerCase().includes(search)
    const matchesCategory = !category || product.category === category
    return matchesSearch && matchesCategory
  })
  const title = category || (search ? `Search results for “${searchParams.get('search')}”` : 'All Products')

  return (
    <main className="min-h-screen">
      <div className="max-w-292.5 mx-auto px-4 sm:px-6 lg:px-0">
        <Breadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />
        <div className="flex flex-wrap items-end justify-between gap-4 py-8 sm:py-12">
          <div>
            <p className="mb-3 text-sm font-semibold text-[#DB4444]">Our Products</p>
            <h1 className="text-3xl font-semibold tracking-[0.04em]">{title}</h1>
          </div>
          <Link to="/shop" className="text-sm underline underline-offset-4 hover:text-[#DB4444]">Clear filters</Link>
        </div>
        {products.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7.5 lg:justify-items-start pb-20">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="pb-24 text-center"><p className="text-lg">No products match these filters.</p><Link to="/shop" className="mt-4 inline-block text-[#DB4444] underline">View all products</Link></div>
        )}
      </div>
    </main>
  )
}

export { ShopScreen }