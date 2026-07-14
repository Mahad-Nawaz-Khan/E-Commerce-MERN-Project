import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { InputUnderline } from '@/components/ui/InputUnderline'
import { inter, poppins } from '@/lib/fonts'

/** Login route — split layout: promo image left, login form right. */
function LoginScreen() {
  return (
    <div className={`${inter.className} min-h-screen grid lg:grid-cols-2 my-10`}>
      {/* Left Side - Image */}
      <div className="hidden lg:block relative bg-[#CBE4E8]">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <img
            src="/images/signup-image.png"
            alt="Shopping Cart with Phone"
            className="object-contain max-w-full max-h-full"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[370px] space-y-8">
          <div className="space-y-3 mb-14">
            <h1 className={`text-[34px] font-medium tracking-tight ${inter.className}`}>
              Log in to Exclusive
            </h1>
            <p className={`text-base text-gray-800 ${poppins.className}`}>
              Enter your details below
            </p>
          </div>

          <form className={`space-y-6 ${poppins.className}`} onSubmit={(e) => e.preventDefault()}>
            <InputUnderline label="Email or Phone Number" />
            <InputUnderline type="password" label="Password" />

            <div className="flex items-center justify-between">
              <Button
                type="submit"
                className="h-[56px] bg-[#DB4444] hover:bg-[#DB4444]/90 rounded px-12 font-medium text-base"
              >
                Log In
              </Button>
              <Link
                to="/"
                className="text-[#DB4444] hover:text-[#DB4444]/90 text-base font-medium"
              >
                Forget Password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export { LoginScreen }
