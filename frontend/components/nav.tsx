'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import ThemeToggle from './theme-toggle'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    const access = localStorage.getItem('access')
    if (access) {
      setLoggedIn(true)
    } else {
      setLoggedIn(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setLoggedIn(false)
    setProfileOpen(false)
    window.location.href = '/'
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 font-display border-b border-slate-200/20 bg-surface/95 backdrop-blur-xl dark:border-slate-800/20 dark:bg-surface-dark/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white">
            <svg
              viewBox="0 0 150 100"
              className="h-9 w-9"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <text
                x="10"
                y="80"
                fontSize="100"
                fontWeight="bold"
                fill="currentColor"
                letterSpacing="-5"
              >
                CC
              </text>
            </svg>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
              CivilCalc
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Smart Civil Calculators
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-10 md:flex">

          <Link
            href="/"
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/')
                ? 'text-primary border-b-2 border-primary'
                : 'text-heading dark:text-heading-dark'
            }`}
          >
            Home
          </Link>

          <Link
            href="/calculators"
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/calculators')
                ? 'text-primary border-b-2 border-primary'
                : 'text-heading dark:text-heading-dark'
            }`}
          >
            Calculators
          </Link>

          <Link
            href="/converters"
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/converters')
                ? 'text-primary border-b-2 border-primary'
                : 'text-heading dark:text-heading-dark'
            }`}
          >
            Converters
          </Link>

          <Link
            href="/resources"
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/resources')
                ? 'text-primary border-b-2 border-primary'
                : 'text-heading dark:text-heading-dark'
            }`}
          >
            Resources
          </Link>

          <Link
            href="/contact"
            className={`font-medium transition-colors hover:text-primary ${
              isActive('/contact')
                ? 'text-primary border-b-2 border-primary'
                : 'text-heading dark:text-heading-dark'
            }`}
          >
            Contact
          </Link>

          {/* Theme + Login/Profile */}
          <div className="ml-4 flex items-center gap-4">
            <ThemeToggle />

            {!loggedIn ? (
              <Link
                href="/login"
                className="rounded-xl bg-primary px-4 py-2 text-white transition hover:opacity-90"
              >
                Login
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">

                    <Link
                      href="/profile"
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>

                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-xl p-2.5 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden">
          <div className="mx-auto max-w-7xl px-6 pb-8">

            <div className="flex justify-end py-4">
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2.5 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid gap-2">

              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-xl px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Home
              </Link>

              <Link
                href="/calculators"
                onClick={() => setOpen(false)}
                className="rounded-xl px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Calculators
              </Link>

              <Link
                href="/converters"
                onClick={() => setOpen(false)}
                className="rounded-xl px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Converters
              </Link>

              <Link
                href="/resources"
                onClick={() => setOpen(false)}
                className="rounded-xl px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Resources
              </Link>

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="rounded-xl px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Contact
              </Link>

              {!loggedIn ? (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-primary px-5 py-4 text-white"
                >
                  Login
                </Link>
              ) : (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-slate-800 px-5 py-4 text-white"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-red-500 px-5 py-4 text-white"
                  >
                    Logout
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </header>
  )
}