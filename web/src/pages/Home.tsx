import Hero from '../components/home/Hero'
import CategoryGrid from '../components/home/CategoryGrid'
import PopularProducts from '../components/home/PopularProducts'
import HowItWorks from '../components/home/HowItWorks'
import XeroxBanner from '../components/home/XeroxBanner'
import VisitUs from '../components/home/VisitUs'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <PopularProducts />
      <HowItWorks />
      <XeroxBanner />
      <VisitUs />
    </>
  )
}
