
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BrainCircuit,
  BookOpen,
  FileText,
  GraduationCap,
  Search,
  LayoutDashboard,
  ArrowLeft,
  Sparkles,
  PanelLeft,
  LogOut,
  ChartLine,
} from 'lucide-react'

import QuizAnalytics from '../components/analytics/QuizAnalytics'
import DocumentUpload from '../components/documents/DocumentUpload'
import AITutor from '../components/tutor/AITutor'
import QuizGenerator from '../components/quiz/QuizGenerator'
import { useAuth } from '../contexts/AuthContext'

// SIDEBAR NAVIGATION
const navigation = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    target: 'overview',
  },
  {
    label: 'My Library',
    icon: BookOpen,
    target: 'document-library',
  },
  {
    label: 'AI Academic Tutor',
    icon: BrainCircuit,
    target: 'ai-tutor',
  },
  {
    label: 'Knowledge Engine',
    icon: Search,
    target: 'document-library',
  },
  {
    label: 'Assessment',
    icon: GraduationCap,
    target: 'assessment',
  },
  {
    label: 'Analytics',
    icon: ChartLine,
    target: 'learning-analytics',
  },
]

export default function WorkspacePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // Active sidebar item
  const [activeSection, setActiveSection] = useState('Overview')

  // Dynamic student information
  const studentName = user?.full_name || 'Student'
  const studentEmail = user?.email || ''
  const studentInitial = studentName.charAt(0).toUpperCase()

  // Smooth section navigation
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  // Sidebar navigation handler
  const handleNavigation = (label: string, target: string) => {
    setActiveSection(label)
    scrollToSection(target)
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100">
      <div className="flex min-h-screen">

        {/* LEFT SIDEBAR */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-[#0b1220] lg:flex">

          {/* BRAND */}
          <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
              <BrainCircuit size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                ScholarPilot
              </h1>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">
                Intelligence platform
              </p>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION */}
          <div className="px-4 pt-8">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.label

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      handleNavigation(item.label, item.target)
                    }
                    aria-current={isActive ? 'location' : undefined}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-all duration-300 ${
                      isActive
                        ? 'border-blue-500/30 bg-blue-500/15 font-semibold text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.10)]'
                        : 'border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-blue-400'
                          : 'text-slate-500 transition-colors group-hover:text-blue-400'
                      }
                    />

                    <span>{item.label}</span>

                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* SIDEBAR FOOTER */}
          <div className="mt-auto border-t border-slate-800 p-5">

            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to home
            </Link>

            {/* DYNAMIC STUDENT PROFILE */}
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/70 p-3">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-400">
                  {studentInitial}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {studentName}
                  </p>

                  <p className="truncate text-[10px] text-slate-500">
                    {studentEmail}
                  </p>
                </div>

              </div>

              {/* SIGN OUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 flex w-full items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={16} />
                Sign out
              </button>

            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">

          {/* TOP HEADER */}
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-[#080d19]/90 px-5 backdrop-blur-xl sm:px-8">

            <div className="flex items-center gap-3">

              <Link
                to="/"
                className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
                aria-label="Back to home"
              >
                <PanelLeft size={19} />
              </Link>

              <div>
                <p className="text-sm font-semibold text-white">
                  Academic Workspace
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  Your personal knowledge environment
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] font-semibold text-emerald-400 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                System active
              </div>

              {/* DYNAMIC TOP AVATAR */}
              <div
                title={studentName}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-sm font-bold text-blue-400"
              >
                {studentInitial}
              </div>

            </div>
          </header>

          {/* WORKSPACE CONTENT */}
          <div className="mx-auto max-w-7xl space-y-8 px-5 py-9 sm:px-8">

            {/* OVERVIEW */}
            <motion.section
              id="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="scroll-mt-24 relative overflow-hidden rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-950/60 via-slate-900/80 to-[#10172a] p-7 sm:p-9"
            >
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative max-w-2xl">

                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  <Sparkles size={15} />
                  Your learning environment
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Welcome, {studentName}!

                  <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Your knowledge workspace.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                  Bring your academic materials together. Upload documents,
                  explore their content and build a stronger understanding
                  with ScholarPilot AI.
                </p>

              </div>
            </motion.section>

            {/* WORKSPACE OVERVIEW CARDS */}
            <section className="grid gap-4 sm:grid-cols-3">

              {/* MY LIBRARY CARD */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection('My Library')
                  scrollToSection('document-library')
                }}
                aria-label="Go to My Library"
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <BookOpen size={20} />
                </div>

                <p className="text-sm font-semibold text-white">
                  My Library
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Upload and process academic documents
                </p>
              </button>

              {/* AI TUTOR CARD */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection('AI Academic Tutor')
                  scrollToSection('ai-tutor')
                }}
                aria-label="Go to AI Academic Tutor"
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/50 hover:bg-violet-500/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <BrainCircuit size={20} />
                </div>

                <p className="text-sm font-semibold text-white">
                  AI Tutor
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Learn with document-aware assistance
                </p>
              </button>

              {/* ASSESSMENT CARD */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection('Assessment')
                  scrollToSection('assessment')
                }}
                aria-label="Go to Assessment"
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <GraduationCap size={20} />
                </div>

                <p className="text-sm font-semibold text-white">
                  Assessment
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Practice and evaluate your knowledge
                </p>
              </button>

            </section>

            {/* AI ACADEMIC TUTOR */}
            <section
              id="ai-tutor"
              className="scroll-mt-24 space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold text-white">
                  Your AI Learning Assistant
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Ask questions and learn directly from your uploaded documents.
                </p>
              </div>

              <AITutor />
            </section>

            {/* AI QUIZ GENERATOR */}
            <section
              id="assessment"
              className="scroll-mt-24 space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold text-white">
                  AI-Powered Assessment
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Generate quizzes from your uploaded study materials and evaluate your knowledge.
                </p>
              </div>

              <QuizGenerator />
            </section>

            {/* LEARNING ANALYTICS */}
            <section
              id="learning-analytics"
              className="scroll-mt-24 space-y-5"
            >
              <QuizAnalytics />
            </section>

            {/* DOCUMENT LIBRARY / KNOWLEDGE ENGINE */}
            <section
              id="document-library"
              className="scroll-mt-24 space-y-5"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <FileText size={20} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    Document Library
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Upload and process your learning materials
                  </p>
                </div>

              </div>

              <DocumentUpload />
            </section>

            {/* FOOTER */}
            <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
              ScholarPilot AI · Academic Intelligence Platform
            </footer>

          </div>
        </main>
      </div>
    </div>
  )
}
