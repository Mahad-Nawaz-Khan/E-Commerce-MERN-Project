import { HeroSection } from '../components/home/HeroSection'
import { FlashSales } from '../components/home/FlashSales'
import { BrowseCategories } from '../components/home/BrowseCategories'
import { BestSelling } from '../components/home/BestSelling'
import { MusicPromo } from '../components/home/MusicPromo'
import { ExploreProducts } from '../components/home/ExploreProducts'
import { NewArrivals } from '../components/home/NewArrivals'
import { ServiceFeatures } from '../components/home/ServiceFeatures'

/** Home route — composes the storefront sections. */
function HomeScreen() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <FlashSales />
      <div className="mx-4 border-t border-border-subtle sm:mx-6 lg:mx-10 xl:mx-16 2xl:mx-24" />
      <BrowseCategories />
      <div className="mx-4 border-t border-border-subtle sm:mx-6 lg:mx-10 xl:mx-16 2xl:mx-24" />
      <BestSelling />
      <div className="mx-4 border-t border-border-subtle sm:mx-6 lg:mx-10 xl:mx-16 2xl:mx-24" />
      <MusicPromo />
      <ExploreProducts />
      <NewArrivals />
      <ServiceFeatures />
    </main>
  )
}

export { HomeScreen }
