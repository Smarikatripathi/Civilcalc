'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const { uidb64, token } = useParams()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    setMessage('')
    setError('')

    // basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/reset-password/${uidb64}/${token}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        }
      )

      const data = await res.json()

      if (res.ok) {
        setMessage('Password reset successful! Redirecting to login...')

        // redirect after 2 sec
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || 'Invalid or expired link')
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
            Reset Password
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Enter your new password below
          </p>
        </div>

        {/* SUCCESS */}
        {message ? (
          <div className="text-center">
            <p className="text-green-600 font-medium">
              {message}
            </p>

            <p className="text-sm text-slate-500 mt-2">
              Redirecting to login...
            </p>

            <Link href="/login" className="text-blue-600 text-sm mt-4 block">
              Go to login now
            </Link>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium">New Password</label>

              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter new password"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="text-sm font-medium">Confirm Password</label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                placeholder="Confirm new password"
                className="w-full mt-2 rounded-2xl border border-slate-200 bg-white py-3 px-4 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                required
              />
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
              {loading ? 'Updating...' : 'Reset Password'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}

      </div>
    </main>
  )
}