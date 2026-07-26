import { Calendar, DollarSign, ShoppingBag, Wallet } from 'lucide-react'

const stats = [
  { icon: Calendar, number: '10.5k', label: 'Sellers active our site', highlight: false },
  { icon: DollarSign, number: '33k', label: 'Monthly Product Sale', highlight: true },
  { icon: ShoppingBag, number: '45.5k', label: 'Customer active in our site', highlight: false },
  { icon: Wallet, number: '25k', label: 'Annual gross sale in our site', highlight: false },
]

/** Four stat cards with a highlighted monthly-sales card. */
function SiteStats() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`relative p-8 flex flex-col items-center justify-center text-center border rounded-sm ${
                stat.highlight ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  stat.highlight ? 'bg-white/20' : 'bg-black/10'
                }`}
              >
                <Icon className={`w-8 h-8 ${stat.highlight ? 'text-white' : 'text-black'}`} />
              </div>
              <div className="font-inter text-8 font-semibold mb-1">
                {stat.number}
              </div>
              <div className="font-poppins text-base">{stat.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { SiteStats }
