const questions = [
  {
    question: 'How can I get support?',
    answer: 'Open the Contact page and send your message through the form.',
  },
  {
    question: 'How fast do you reply?',
    answer: 'Our support team tries to reply as soon as possible.',
  },
  {
    question: 'Can I ask about privacy?',
    answer: 'Yes, you can read the Privacy Policy page or contact support.',
  },
  {
    question: 'Where can I read website rules?',
    answer: 'Open the Terms Of Use page to read the basic website rules.',
  },
]

function FAQ() {
  return (
    <section className="rounded bg-white p-6 shadow-sm">
      <p className="mb-6 text-sm text-gray-500">FAQ</p>
      <h1 className="text-3xl font-semibold text-gray-950">FAQ</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
        Common questions about website support, privacy, and terms.
      </p>

      <div className="mt-8 space-y-4">
        {questions.map((item) => (
          <div key={item.question} className="rounded border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">{item.question}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FAQ
