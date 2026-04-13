import { useState } from 'react'
import api from '../api/axios'
import PageTitle from '../components/ui/PageTitle'

type FormState = { name: string; email: string; message: string }

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/contact', form)
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="py-8 max-w-2xl">
        <PageTitle title="Contact" />
        <div className="card p-6 text-center">
          <p className="font-display text-2xl font-bold mb-2">Message sent!</p>
          <p className="font-body text-muted">We'll get back to you when we can.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 max-w-2xl">
      <PageTitle title="Contact" />
      <p className="font-body text-muted mb-6">
        Have a question, bug report, or just want to say hi? Send us a message.
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="font-body text-sm block mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={handleChange}
            disabled={submitting}
            className="w-full border-2 border-border bg-card font-body text-sm px-3 py-2 focus:outline-none focus:shadow-sketch-sm disabled:opacity-50"
          />
        </div>

        <div>
          <label className="font-body text-sm block mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            value={form.email}
            onChange={handleChange}
            disabled={submitting}
            className="w-full border-2 border-border bg-card font-body text-sm px-3 py-2 focus:outline-none focus:shadow-sketch-sm disabled:opacity-50"
          />
        </div>

        <div>
          <label className="font-body text-sm block mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={5000}
            rows={6}
            value={form.message}
            onChange={handleChange}
            disabled={submitting}
            className="w-full border-2 border-border bg-card font-body text-sm px-3 py-2 focus:outline-none focus:shadow-sketch-sm disabled:opacity-50 resize-y"
          />
        </div>

        {error && (
          <p className="font-body text-sm border-2 border-border px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
