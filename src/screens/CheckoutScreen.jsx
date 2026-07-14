import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Checkbox } from '@/components/ui/Checkbox'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { inter } from '@/lib/fonts'
import { useCart } from '@/hooks/useCart'

/**
 * Checkout route — billing form on the left, live order summary on the right.
 * The original hardcoded 2 dummy items + a $1750 total; here the order summary
 * is computed from the actual Redux cart.
 */
function CheckoutScreen() {
  const cart = useCart()
  const shipping = 0 // free

  return (
    <div className={`${inter.className} min-h-screen bg-white`}>
      {/* Breadcrumb */}
      <div className="mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            className="text-[7px] md:text-sm"
            crumbs={[
              { label: 'Home', to: '/' },
              { label: 'Cart', to: '/cart' },
              { label: 'Checkout' },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <h1 className="text-2xl sm:text-3xl font-medium mb-8">Billing Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Billing Form */}
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name*</Label>
                <Input id="firstName" className="h-12 bg-[#F5F5F5] border-none rounded-sm" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name*</Label>
                <Input id="lastName" className="h-12 bg-[#F5F5F5] border-none rounded-sm" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" className="h-12 bg-[#F5F5F5] border-none rounded-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address*</Label>
              <Input id="streetAddress" className="h-12 bg-[#F5F5F5] border-none rounded-sm" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apartment">Apartment, floor, etc. (optional)</Label>
              <Input id="apartment" className="h-12 bg-[#F5F5F5] border-none rounded-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="townCity">Town/City*</Label>
              <Input id="townCity" className="h-12 bg-[#F5F5F5] border-none rounded-sm" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number*</Label>
              <Input id="phone" type="tel" className="h-12 bg-[#F5F5F5] border-none rounded-sm" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address*</Label>
              <Input id="email" type="email" className="h-12 bg-[#F5F5F5] border-none rounded-sm" required />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="saveInfo" />
              <label htmlFor="saveInfo" className="text-sm font-medium leading-none">
                Save this information for faster check-out next time
              </label>
            </div>
          </div>

          {/* Order Summary (live from cart) */}
          <div className="space-y-8">
            {cart.items.length === 0 ? (
              <p className="text-[#666666]">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-[#F5F5F5]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-contain p-2"
                        />
                      </div>
                      <span className="font-medium">
                        {item.name} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-medium">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span>Subtotal:</span>
                <span>${cart.subtotal}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span>Shipping:</span>
                <span className="text-[#666666]">{shipping === 0 ? 'Free' : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between py-3">
                <span>Total:</span>
                <span>${cart.subtotal + shipping}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <RadioGroup defaultValue="cod" className="space-y-4">
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-sm">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank">Bank</Label>
                </div>
                <div className="flex gap-2">
                  <img src="/images/payments/visa.svg" alt="Visa" width={40} height={28} />
                  <img src="/images/payments/mastercard.svg" alt="Mastercard" width={40} height={18} />
                  <img src="/images/payments/bkash.svg" alt="bKash" width={60} height={28} />
                </div>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-sm">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on delivery</Label>
              </div>
            </RadioGroup>

            {/* Coupon */}
            <div className="flex gap-4">
              <Input placeholder="Coupon Code" className="h-12 bg-[#F5F5F5] border-none rounded-sm flex-1" />
              <Button className="h-12 px-6 bg-[#DB4444] hover:bg-[#DB4444]/90 rounded-sm whitespace-nowrap">
                Apply Coupon
              </Button>
            </div>

            {/* Place Order */}
            <Button className="w-full h-12 bg-[#DB4444] hover:bg-[#DB4444]/90 rounded-sm">
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CheckoutScreen }
