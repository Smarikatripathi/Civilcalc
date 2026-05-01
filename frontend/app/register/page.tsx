'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from '@/lib/axios'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const form = e.target

    const username = form.username.value
    const email = form.email.value
    const password = form.password.value
    const confirmPassword = form.confirmPassword.value

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await axios.post("register/", {
        username,
        email,
        password
      })

      alert("Account created successfully")

      window.location.href = "/login"

    } catch (error: any) {
      console.log(error.response?.data)
      alert("Signup failed")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Join CivilCalc and start calculating smarter
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              placeholder="Enter username"
              className="w-full mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="Create password"
              className="w-full mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm password"
              className="w-full mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:opacity-95"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>

      </div>
    </main>
  )
}