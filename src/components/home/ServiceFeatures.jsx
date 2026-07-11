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
 * The nested concentric-circle icon is preserved from the original.
 */
function ServiceFeatures() {
  return (
    <section className="w-full max-w-[1170px] mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#2F2E30] flex items-center justify-center mb-6">
              <div className="w-[80px] h-[80px] rounded-full bg-[#2F2E30] flex items-center justify-center">
                <div className="w-[60px] h-[60px] rounded-full bg-black flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-[20px] font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export { ServiceFeatures }
