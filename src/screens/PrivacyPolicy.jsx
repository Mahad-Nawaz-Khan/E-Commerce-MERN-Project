function PrivacyPolicy() {
  return (
    <section className="rounded bg-white p-6 shadow-sm">
      <p className="mb-6 text-sm text-gray-500">Privacy Policy</p>
      <h1 className="text-3xl font-semibold text-gray-950">Privacy Policy</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
        We respect your privacy. This page explains how our website collects and
        uses basic customer information when you contact us or use our forms.
      </p>

      <div className="mt-8 space-y-6">
        <PolicyBlock title="Information We Collect">
          We may collect your name, email address, phone number, delivery
          address, and message details only for support purposes.
        </PolicyBlock>
        <PolicyBlock title="How We Use Information">
          Your information is used to reply to messages, provide support, and
          improve your website experience.
        </PolicyBlock>
        <PolicyBlock title="Data Safety">
          We do not sell your personal data. Basic security steps are used to
          keep your details safe.
        </PolicyBlock>
      </div>
    </section>
  )
}

function PolicyBlock({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-gray-600">{children}</p>
    </div>
  )
}

export default PrivacyPolicy
