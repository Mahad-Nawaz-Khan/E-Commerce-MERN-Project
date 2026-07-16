import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { Facebook, Twitter, Instagram, Linkedin } from '../ui/SocialIcons'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="w-full max-w-292.5 mx-auto px-4 sm:px-6 lg:px-0 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Exclusive Column */}
          <div className="space-y-5">
            <h2 className="text-6 font-bold">Exclusive</h2>
            <p className="font-medium">Subscribe</p>
            <p className="text-sm text-gray-300">Get 10% off your first order</p>
            <div className="relative max-w-55">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-transparent border-gray-400 focus:border-gray-200 pr-12 rounded-sm"
              />
              <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-12 border-0 hover:bg-transparent">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h2 className="text-5 font-bold">Support</h2>
            <address className="not-italic text-sm text-gray-300">
              111 Bijoy sarani, Dhaka,
              <br />
              DH 1515, Bangladesh.
            </address>
            <p className="text-sm text-gray-300">exclusive@gmail.com</p>
            <p className="text-sm text-gray-300">+88015-88888-9999</p>
          </div>

          {/* Account Column */}
          <div className="space-y-4">
            <h2 className="text-5 font-bold">Account</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/login" className="hover:text-white transition-colors">Login / Register</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Quick Link Column */}
          <div className="space-y-4">
            <h2 className="text-5 font-bold">Quick Link</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Download App Column */}
          <div className="space-y-4">
            <h2 className="text-5 font-bold">Download App</h2>
            <p className="text-xs text-gray-300">Save $3 with App New User Only</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-square">
                <img
                  src="/images/qr-code.png"
                  alt="QR Code"
                  width={100}
                  height={100}
                  className="border border-gray-800 rounded-lg w-full h-full object-contain bg-white"
                />
              </div>
              <div className="space-y-2">
                <img
                  src="/images/play-store.png"
                  alt="Download on Google Play"
                  width={120}
                  height={40}
                  className="rounded"
                />
                <img
                  src="/images/app-store.png"
                  alt="Download on App Store"
                  width={120}
                  height={40}
                  className="rounded"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-1">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © Copyright Rimel 2022. All right reserved
        </div>
      </div>
    </footer>
  )
}

export { Footer }
