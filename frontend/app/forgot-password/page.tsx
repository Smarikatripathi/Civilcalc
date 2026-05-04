'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('http://127.0.0.1:8000/api/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message || 'If account exists, reset link has been sent.')
        setSent(true)
        setEmail('')
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Server error. Please try again.')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Reset your password
          </h2>
          
        </div>

        {/* SUCCESS STATE (Facebook style message) */}
        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-green-600 font-medium">
              {message}
            </p>

            <p className="text-sm text-slate-500">
              Check your Gmail inbox and follow the link to reset your password.
            </p>

            <Link
              href="/login"
              className="inline-block mt-4 text-blue-600 font-semibold"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium">Email address</label>

              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                    setMessage('')
                  }}
                  placeholder="Enter your email address"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 py-3 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset link'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

        {/* BACK */}
        {!sent && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Remember password?{' '}
            <Link href="/login" className="text-blue-600 font-semibold">
              Back to login
            </Link>
          </p>
        )}

      </div>
    </main>
  )
}