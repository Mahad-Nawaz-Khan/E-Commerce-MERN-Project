import { HeroSection } from '../components/home/HeroSection'
import { FlashSales } from '../components/home/FlashSales'
import { BrowseCategories } from '../components/home/BrowseCategories'
import { BestSelling } from '../components/home/BestSelling'
import { MusicPromo } from '../components/home/MusicPromo'
import { ExploreProducts } from '../components/home/ExploreProducts'
import { NewArrivals } from '../components/home/NewArrivals'
import { ServiceFeatures } from '../components/home/ServiceFeatures'

/** Home route — composes the 8 home sections in the same order as the original. */
function HomeScreen() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <FlashSales />
      <div className="mx-auto max-w-292.5 border-t border-[#e5e5e5]" />
      <BrowseCategories />
      <div className="mx-auto max-w-292.5 border-t border-[#e5e5e5]" />
      <BestSelling />
      <div className="mx-auto max-w-292.5 border-t border-[#e5e5e5]" />
      <MusicPromo />
      <ExploreProducts />
      <NewArrivals />
      <ServiceFeatures />
    </main>
  )
}

export { HomeScreen }
