import { HeroSection } from '../components/home/hero-section'
import { FlashSales } from '../components/home/flash-sales'
import { BrowseCategories } from '../components/home/browse-categories'
import { BestSelling } from '../components/home/best-selling'
import { ExploreProducts } from '../components/home/explore-products'
import { NewArrivals } from '../components/home/new-arrivals'
import { ServiceFeatures } from '../components/home/service-features'

/** Home route — composes the storefront sections in a deliberate rhythm. */
function HomeScreen() {
  return (
    <>
      <HeroSection />
      <FlashSales />
      <BrowseCategories />
      <BestSelling />
      <ExploreProducts />
      <NewArrivals />
      <ServiceFeatures />
    </>
  )
}

export { HomeScreen }
