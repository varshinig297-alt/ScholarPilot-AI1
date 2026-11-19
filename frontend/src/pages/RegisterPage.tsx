
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BrainCircuit,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import axios from 'axios'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/api/v1/auth/register', {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      })

      await signIn(email.trim(), password)

      navigate('/workspace', { replace: true })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail

        if (err.response?.status === 409) {
          setError('An account with this email already exists. Please sign in instead.')
        } else if (typeof detail === 'string') {
          setError(detail)
        } else if (Array.isArray(detail)) {
          setError(detail.map((item: { msg?: string }) => item.msg).join(', '))
        } else {
          setError('Registration failed. Please check your details and try again.')
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080D18] text-white lg:grid lg:grid-cols-2">

      <section className="relative hidden overflow-hidden border-r border-white/[0.07] bg-[#0B1425] lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-20">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-[130px]" />

        <Link to="/" className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 text-blue-400">
            <BrainCircuit size={25} />
          </div>
          <div>
            <p className="font-heading text-xl font-bold">ScholarPilot</p>
            <p className="text-[9px] font-semibold tracking-[0.25em] text-blue-400">
              INTELLIGENCE PLATFORM
            </p>
          </div>
        </Link>

        <div className="relative max-w-xl">
          <div className="mb-7 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-blue-400">
            <Sparkles size={15} /> START YOUR JOURNEY
          </div>

          <h1 className="font-heading text-5xl font-semibold leading-[1.15] tracking-tight xl:text-6xl">
            Learn smarter.
            <span className="block text-slate-500">Explore deeper.</span>
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Achieve more.
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-8 text-slate-400">
            Create your academic workspace and experience a smarter way to
            understand documents, explore concepts and improve your learning.
          </p>

          <div className="mt-12 space-y-5">
            {[
              'AI-powered academic assistance',
              'Intelligent document exploration',
              'Personalized learning experience',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 size={17} className="text-blue-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          © 2026 ScholarPilot AI. Intelligence for deeper learning.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px]"
        >
          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <BrainCircuit className="text-blue-400" size={30} />
            <span className="font-heading text-xl font-bold">ScholarPilot AI</span>
          </Link>

          <div className="mb-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
              <User size={21} />
            </div>

            <p className="text-xs font-semibold tracking-[0.2em] text-blue-400">
              CREATE YOUR ACCOUNT
            </p>

            <h2 className="mt-3 font-heading text-4xl font-semibold tracking-tight">
              Join ScholarPilot
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Create your account and start your academic journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-300">
                Full name
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] transition focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-500/10">
                <User size={18} className="ml-4 text-slate-500" />
                <input
                  id="fullName"
                  type="text"
                  required
                  minLength={2}
                  maxLength={150}
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    setError('')
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] transition focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-500/10">
                <Mail size={18} className="ml-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] transition focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-500/10">
                <Lock size={18} className="ml-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  placeholder="Create a password (8+ characters)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="mr-4 text-slate-500 transition hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-300">
                Confirm password
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] transition focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-500/10">
                <Lock size={18} className="ml-4 text-slate-500" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError('')
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="mr-4 text-slate-500 transition hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={15} />
            Secure academic workspace
          </div>
        </motion.div>
      </section>
    </main>
  )
}
