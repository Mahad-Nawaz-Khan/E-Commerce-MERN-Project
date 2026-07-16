import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { InputUnderline } from '../components/ui/InputUnderline'
import { inter } from '../lib/fonts'

/** Sign-up route — split layout: promo image left, create-account form right. */
function SignUpScreen() {
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
        <div className="w-full max-w-92.5 space-y-8">
          <div className="space-y-3">
            <h1 className="text-8.5 font-medium tracking-tight">Create an account</h1>
            <p className="text-base text-gray-600">Enter your details below</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <InputUnderline label="Name" />
            <InputUnderline label="Email or Phone Number" />
            <InputUnderline type="password" label="Password" />
            <Button
              type="submit"
              className="h-12! w-full! rounded-sm! bg-[#DB4444]! text-base! text-white! font-normal! hover:bg-[#c73838]!"
            >
              Create Account
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12! w-full! rounded-sm! border-[#999]! bg-white! text-base! font-normal! text-black! shadow-none! hover:border-black! hover:bg-white!"
            >
              <img src="/images/logos/google.svg" alt="Google" className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
          </form>

          <div className="text-center text-base">
            Already have account?{' '}
            <Link
              to="/login"
              className="text-[#DB4444] hover:text-[#DB4444]/90 font-medium underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export { SignUpScreen }
