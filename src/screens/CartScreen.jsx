import { useNavigate, Link } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { inter, poppins } from '../lib/fonts'
import { useCart } from '../hooks/useCart'

/** Cart route — table of cart items with quantity steppers + cart total. */
function CartScreen() {
  const navigate = useNavigate()
  const cart = useCart()

  return (
    <div className={`${inter.className} min-h-screen bg-white`}>
      {/* Breadcrumb */}
      <div className="mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            crumbs={[
              { label: 'Home', to: '/' },
              { label: 'Cart' },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add items to your cart to see them here.</p>
            <Button asChild className="bg-[#DB4444] hover:bg-[#DB4444]/90 rounded-sm" >
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Table */}
            <div className="mb-8 overflow-x-auto">
              <div className="min-w-150">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pb-6 border-b text-sm font-medium">
                  <div>Product</div>
                  <div>Price</div>
                  <div>Quantity</div>
                  <div>Subtotal</div>
                </div>

                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 py-6 border-b items-center"
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button
                        className="text-[#666666] hover:text-black"
                        onClick={() => cart.removeFromCart(item.id)}
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-[#F5F5F5]">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-contain p-2"
                          />
                        )}
                      </div>
                      <span className="font-medium text-sm sm:text-base">{item.name}</span>
                    </div>
                    <div className="text-sm sm:text-base">${item.price}</div>
                    <div className="flex items-center border rounded-sm max-w-18">
                      <button
                        className="p-1 sm:p-2 hover:bg-gray-50"
                        onClick={() => cart.decrement(item.id)}
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-6 sm:w-8 text-center text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <button
                        className="p-1 sm:p-2 hover:bg-gray-50"
                        onClick={() => cart.increment(item.id)}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <div className="text-sm sm:text-base">
                      ${item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
              <Button
                variant="outline"
                className="h-10 sm:h-12 px-6 sm:px-12 rounded-sm border-black hover:bg-black hover:text-white transition-colors w-full sm:w-auto"
                onClick={() => navigate('/')}
              >
                Return To Shop
              </Button>
              <Button
                variant="outline"
                className="h-10 sm:h-12 px-6 sm:px-12 rounded-sm border-black hover:bg-black hover:text-white transition-colors w-full sm:w-auto"
              >
                Update Cart
              </Button>
            </div>

            {/* Coupon and Cart Total */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Coupon Code"
                  className="h-10 sm:h-12 w-full sm:max-w-75 rounded-sm border-gray-300 focus:border-gray-400 focus:ring-0"
                />
                <Button className="h-10 sm:h-12 px-6 sm:px-8 bg-[#DB4444] hover:bg-[#DB4444]/90 rounded-sm w-full sm:w-auto">
                  Apply Coupon
                </Button>
              </div>

              <div className="border rounded-sm p-4 sm:p-6 space-y-4 w-full lg:max-w-117.5 lg:ml-auto">
                <h2 className={`${poppins.className} text-lg sm:text-xl font-medium mb-4`}>
                  Cart Total
                </h2>

                <div className="flex justify-between py-3 border-b text-sm sm:text-base">
                  <span>Subtotal:</span>
                  <span>${cart.subtotal}</span>
                </div>
                <div className="flex justify-between py-3 border-b text-sm sm:text-base">
                  <span>Shipping:</span>
                  <span className="text-[#666666]">Free</span>
                </div>
                <div className="flex justify-between py-3 text-sm sm:text-base">
                  <span>Total:</span>
                  <span>${cart.subtotal}</span>
                </div>

                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full h-10 sm:h-12 bg-[#DB4444] hover:bg-[#DB4444]/90 rounded-sm mt-4 text-sm sm:text-base"
                >
                  Proceed to checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { CartScreen }
