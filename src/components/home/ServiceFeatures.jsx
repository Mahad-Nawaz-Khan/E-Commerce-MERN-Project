import { Truck, Headphones, Shield } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'FREE AND FAST DELIVERY',
    description: 'Free delivery for all orders over $140',
  },
  {
    icon: Headphones,
    title: '24/7 CUSTOMER SERVICE',
    description: 'Friendly 24/7 customer support',
  },
  {
    icon: Shield,
    title: 'MONEY BACK GUARANTEE',
    description: 'We return money within 30 days',
  },
]

/**
 * Three-column service feature strip. Shared by the home and about pages.
 * Each icon uses nested concentric circles.
 */
function ServiceFeatures() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-icon-muted flex items-center justify-center mb-6">
                <div className="w-14.5 h-14.5 rounded-full bg-black flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
            </div>
            <h3 className="text-base font-semibold mb-2">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export { ServiceFeatures }
