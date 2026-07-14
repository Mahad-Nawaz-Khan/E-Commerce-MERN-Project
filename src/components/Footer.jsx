import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-semibold">Exclusive</h3>
          <p className="text-sm text-gray-300">Subscribe</p>
          <p className="mt-2 text-xs text-gray-400">Get 10% off your first order</p>
          <div className="mt-4 flex rounded border border-gray-500">
            <input
              type="email"
              placeholder="Enter email"
              className="w-full bg-transparent px-3 py-2 text-xs outline-none"
            />
            <button className="px-3 text-sm">Send</button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Support</h3>
          <p className="text-xs leading-6 text-gray-400">
            111 Bijoy sarani, Dhaka, Bangladesh.
          </p>
          <p className="text-xs leading-6 text-gray-400">exclusive@gmail.com</p>
          <p className="text-xs leading-6 text-gray-400">+88015-88888-9999</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Quick Link</h3>
          <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
          <FooterLink to="/terms-of-use">Terms Of Use</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Download App</h3>
          <div className="flex h-20 w-20 items-center justify-center bg-white text-xs font-bold text-black">
            QR
          </div>
          <div className="mt-3 flex gap-3 text-lg">
            <span>f</span>
            <span>x</span>
            <span>in</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="block py-1 text-xs text-gray-400 hover:text-white">
      {children}
    </Link>
  )
}

export default Footer
