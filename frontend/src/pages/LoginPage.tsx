
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BrainCircuit,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    try {
      await signIn(email.trim(), password)

      navigate('/workspace', { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your credentials and try again.'

      setError(message)
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
            <Sparkles size={15} /> A NEW WAY TO LEARN
          </div>

          <h1 className="font-heading text-5xl font-semibold leading-[1.15] tracking-tight xl:text-6xl">
            Your knowledge.
            <span className="block text-slate-500">Your questions.</span>
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Your possibilities.
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-8 text-slate-400">
            Enter your intelligent academic workspace. Explore documents,
            discover concepts and build deeper understanding.
          </p>

          <div className="mt-12 space-y-5">
            {[
              'Context-aware academic assistance',
              'Document-grounded knowledge exploration',
              'Personalized learning environment',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <ShieldCheck size={17} className="text-blue-400" />
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
          <Link to="/" className="mb-12 flex items-center gap-3 lg:hidden">
            <BrainCircuit className="text-blue-400" size={30} />
            <span className="font-heading text-xl font-bold">ScholarPilot AI</span>
          </Link>

          <div className="mb-10">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
              <Lock size={21} />
            </div>

            <p className="text-xs font-semibold tracking-[0.2em] text-blue-400">
              WELCOME BACK
            </p>

            <h2 className="mt-3 font-heading text-4xl font-semibold tracking-tight">
              Sign in to your account
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Continue your academic journey with ScholarPilot AI.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

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
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] transition focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-500/10">
                <Lock size={18} className="ml-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
                  disabled={isSubmitting}
                  className="mr-4 text-slate-500 transition hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 accent-blue-500"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-9 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300">
              Create account
            </Link>
          </p>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={15} />
            Secure academic workspace
          </div>
        </motion.div>
      </section>
    </main>
  )
}
