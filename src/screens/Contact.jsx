function Contact() {
  return (
    <section className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div className="rounded bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Call To Us</h2>
        <p className="mt-3 text-sm text-gray-500">We are available 24/7.</p>
        <p className="mt-2 text-sm">Phone: +88015-88888-9999</p>
        <div className="my-6 border-t"></div>
        <h2 className="text-lg font-semibold">Write To Us</h2>
        <p className="mt-3 text-sm text-gray-500">
          Fill out our form and we will contact you soon.
        </p>
      </div>

      <form className="rounded bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <input className="rounded bg-gray-100 px-4 py-3 text-sm outline-none" placeholder="Your Name" />
          <input className="rounded bg-gray-100 px-4 py-3 text-sm outline-none" placeholder="Your Email" />
          <input className="rounded bg-gray-100 px-4 py-3 text-sm outline-none" placeholder="Your Phone" />
        </div>
        <textarea
          className="mt-4 h-44 w-full rounded bg-gray-100 px-4 py-3 text-sm outline-none"
          placeholder="Your Message"
        ></textarea>
        <button className="mt-4 rounded bg-red-500 px-8 py-3 text-sm text-white">
          Send Message
        </button>
      </form>
    </section>
  )
}

export default Contact
