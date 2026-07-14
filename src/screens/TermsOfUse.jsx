function TermsOfUse() {
  return (
    <section className="rounded bg-white p-6 shadow-sm">
      <p className="mb-6 text-sm text-gray-500">Terms Of Use</p>
      <h1 className="text-3xl font-semibold text-gray-950">Terms Of Use</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
        By using this ecommerce website, you agree to follow the basic terms
        below. These terms are written simply for learning and practice.
      </p>

      <div className="mt-8 space-y-5">
        <TermItem number="01" title="Use Website Properly">
          Do not misuse the website, forms, or account features.
        </TermItem>
        <TermItem number="02" title="Product Information">
          Page content and details can change when the website owner updates
          them.
        </TermItem>
        <TermItem number="03" title="Orders">
          Contact forms should contain correct customer information.
        </TermItem>
        <TermItem number="04" title="Support">
          For questions about the website, contact our support team.
        </TermItem>
      </div>
    </section>
  )
}

function TermItem({ number, title, children }) {
  return (
    <div className="flex gap-4 rounded border border-gray-200 p-4">
      <span className="font-semibold text-red-500">{number}</span>
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{children}</p>
      </div>
    </div>
  )
}

export default TermsOfUse
