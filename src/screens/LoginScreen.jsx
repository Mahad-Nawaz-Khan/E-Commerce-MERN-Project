import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { InputUnderline } from '../components/ui/InputUnderline'

/** Login route — split layout: promo image left, login form right. */
function LoginScreen() {
  return (
    <div className="font-inter min-h-screen grid lg:grid-cols-2 my-10">
      {/* Left Side - Image */}
      <div className="hidden lg:block relative bg-promo">
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
        <div className="w-full max-w-92.5 space-y-8">
          <div className="space-y-3 mb-14">
            <h1 className="font-inter text-8.5 font-medium tracking-tight">
              Log in to Exclusive
            </h1>
            <p className="font-poppins text-base text-gray-800">
              Enter your details below
            </p>
          </div>

          <form className="font-poppins space-y-5" onSubmit={(e) => e.preventDefault()}>
            <InputUnderline label="Email or Phone Number" />
            <InputUnderline type="password" label="Password" />

            <div className="flex items-center justify-between">
              <Button
                type="submit"
                className="h-12! rounded-sm! bg-secondary! text-secondary-foreground! px-10! text-xs! font-normal! hover:bg-secondary-hover!"
              >
                Log In
              </Button>
              <Link
                to="/"
                className="text-xs font-normal text-secondary hover:text-secondary-hover"
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
