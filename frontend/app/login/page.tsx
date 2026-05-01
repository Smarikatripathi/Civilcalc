'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      const data = await res.json()

      if (res.ok && data.access) {
        localStorage.setItem('access', data.access)
        localStorage.setItem('refresh', data.refresh)

        window.location.href = '/'
      } else {
        alert(data.detail || 'Invalid credentials')
      }
    } catch (error) {
      console.log(error)
      alert('Server error')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="hidden lg:flex flex-col justify-center px-16">
          <div className="max-w-xl">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white shadow-xl">
              <span className="text-2xl font-bold">CC</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white">
              Welcome back to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                CivilCalc
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
              Smart civil engineering calculators, converters, and tools.
            </p>
          </div>
        </section>

        {/* RIGHT SIDE FORM */}
        <section className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Sign In
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Login to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium">Email</label>

                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium">Password</label>

                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-12 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 py-3 text-white font-semibold shadow-lg hover:opacity-90"
              >
                {loading ? 'Logging in...' : 'Sign In'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {/* REGISTER LINK */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Don’t have an account?{' '}
              <Link href="/register" className="text-blue-600 font-semibold">
                Create account
              </Link>
            </p>

          </div>
        </section>
      </div>
    </main>
  )
}