
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  FileSearch,
  GraduationCap,
  Layers3,
  Menu,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react'

const features = [
  {
    number: '01',
    icon: BrainCircuit,
    title: 'AI Academic Tutor',
    description:
      'Understand complex academic concepts through intelligent, context-aware conversations grounded in your study materials.',
    tag: 'INTELLIGENT LEARNING',
  },
  {
    number: '02',
    icon: FileSearch,
    title: 'Document Intelligence',
    description:
      'Transform academic PDFs into searchable knowledge with semantic retrieval and evidence-backed answers.',
    tag: 'KNOWLEDGE RETRIEVAL',
  },
  {
    number: '03',
    icon: MessageSquareText,
    title: 'AI Quiz Generator',
    description:
      'Turn your learning materials into meaningful assessments that help strengthen understanding.',
    tag: 'SMART ASSESSMENT',
  },
  {
    number: '04',
    icon: Network,
    title: 'Knowledge Discovery',
    description:
      'Explore connections between concepts and navigate your academic resources in one connected environment.',
    tag: 'CONNECTED KNOWLEDGE',
  },
  {
    number: '05',
    icon: Target,
    title: 'Learning Intelligence',
    description:
      'Understand your academic progress and identify topics that deserve more attention.',
    tag: 'LEARNING INSIGHTS',
  },
  {
    number: '06',
    icon: Layers3,
    title: 'Unified Workspace',
    description:
      'Bring documents, learning activities and academic exploration together in one environment.',
    tag: 'ONE WORKSPACE',
  },
]

const steps = [
  {
    number: '01',
    title: 'Bring your knowledge',
    description:
      'Start with your academic PDFs and learning materials. Build a personal knowledge environment.',
    icon: BookOpen,
  },
  {
    number: '02',
    title: 'Explore with intelligence',
    description:
      'Ask questions, retrieve relevant information and explore concepts with AI assistance.',
    icon: BrainCircuit,
  },
  {
    number: '03',
    title: 'Strengthen understanding',
    description:
      'Practice what you learn, review your progress and discover what to focus on next.',
    icon: GraduationCap,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 text-[10px] font-bold tracking-[0.28em] text-blue-400">
      <span className="h-px w-7 bg-blue-500" />
      {children}
    </div>
  )
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <main className="min-h-screen overflow-hidden bg-[#080d18] text-slate-100">
        {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-60 top-20 h-[500px] w-[500px] rounded-full bg-blue-600/[0.09] blur-[140px]" />
        <div className="absolute -right-60 top-[600px] h-[550px] w-[550px] rounded-full bg-indigo-600/[0.07] blur-[150px]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080d18]/80 backdrop-blur-2xl">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link to="/" className="group flex items-center gap-3" onClick={closeMenu}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 text-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.14)] transition group-hover:bg-blue-500/20">
              <BrainCircuit size={22} />
            </div>
            <div>
              <div className="font-heading text-lg font-bold tracking-tight">
                ScholarPilot
              </div>
              <div className="text-[8px] font-semibold tracking-[0.28em] text-blue-400">
                INTELLIGENCE PLATFORM
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            <a href="#platform" className="text-sm text-slate-400 transition hover:text-white">Platform</a>
            <a href="#workflow" className="text-sm text-slate-400 transition hover:text-white">How it works</a>
            <a href="#vision" className="text-sm text-slate-400 transition hover:text-white">About</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:text-white">
              Sign in
            </Link>
            <Link to="/login" className="group flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500">
              Get started
              <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/10 p-2 text-slate-300 md:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/[0.07] bg-[#0b1220] md:hidden"
            >
              <div className="flex flex-col gap-5 px-6 py-6">
                <a href="#platform" onClick={closeMenu} className="text-sm text-slate-300">Platform</a>
                <a href="#workflow" onClick={closeMenu} className="text-sm text-slate-300">How it works</a>
                <a href="#vision" onClick={closeMenu} className="text-sm text-slate-300">About</a>
                <Link to="/login" onClick={closeMenu} className="text-sm text-slate-300">Sign in</Link>
                <Link to="/login" onClick={closeMenu} className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold">Get started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:gap-14 lg:px-10 lg:pb-24 lg:pt-20">
          <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.13 }}>
            <motion.div variants={fadeUp} transition={{ duration: 0.7 }} className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.07] px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
              </span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-blue-300">INTELLIGENCE FOR A NEW WAY TO LEARN</span>
            </motion.div>

            <motion.h1
  variants={fadeUp}
  transition={{ duration: 0.8 }}
  className="max-w-3xl font-heading text-5xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-[76px]"
>
  Understanding
  <br />
  <span className="text-slate-400">is</span>{' '}
  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
    everything.
  </span>
</motion.h1>

            <motion.p variants={fadeUp} transition={{ duration: 0.8 }} className="mt-8 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Meet a new way to learn. ScholarPilot AI transforms your academic documents into an intelligent knowledge environment where understanding, exploration and progress come together.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.8 }} className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/login" className="group flex items-center gap-3 rounded-lg bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(37,99,235,0.25)] transition hover:-translate-y-1 hover:bg-blue-500">
                Explore ScholarPilot
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a href="#platform" className="flex items-center gap-2 rounded-lg border border-white/10 px-6 py-4 text-sm font-medium text-slate-300 transition hover:border-blue-400/40 hover:bg-white/[0.04]">
                Discover the platform
                <ChevronRight size={16} />
              </a>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.8 }} className="mt-14 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/[0.08] pt-7">
              <div className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} className="text-blue-400" /> Evidence-aware learning</div>
              <div className="flex items-center gap-2 text-xs text-slate-500"><Zap size={15} className="text-blue-400" /> AI-assisted exploration</div>
            </motion.div>
          </motion.div>

          {/* Workspace visual */}
          <motion.div
            initial={{ opacity: 0, x: 35, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.35 }}
           className="relative mx-auto w-full min-w-0 max-w-[620px] lg:ml-auto"
          >
            <div className="absolute -inset-8 rounded-[40px] bg-blue-500/[0.08] blur-[70px]" />
            <div className="relative rounded-2xl border border-white/[0.12] bg-[#111a2b]/90 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400"><BrainCircuit size={17} /></div>
                  <div>
                    <p className="text-xs font-semibold text-white">ScholarPilot Workspace</p>
                    <p className="text-[9px] tracking-wide text-slate-500">YOUR KNOWLEDGE ENVIRONMENT</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-semibold tracking-wider text-emerald-300">SYSTEM ACTIVE</span>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div className="mb-6">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-blue-400">YOUR KNOWLEDGE ENVIRONMENT</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Academic Workspace</h2>
                  <p className="mt-1 text-xs text-slate-500">An intelligent environment for learning and discovery.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-blue-400/30">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"><BookOpen size={20} /></div>
                    <p className="text-sm font-semibold text-slate-200">Library</p>
                    <p className="mt-1 text-[11px] text-slate-500">Your academic documents</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-blue-400/30">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400"><BrainCircuit size={20} /></div>
                    <p className="text-sm font-semibold text-slate-200">AI Tutor</p>
                    <p className="mt-1 text-[11px] text-slate-500">Context-aware learning</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-blue-400/30">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400"><FileSearch size={20} /></div>
                    <p className="text-sm font-semibold text-slate-200">Knowledge Engine</p>
                    <p className="mt-1 text-[11px] text-slate-500">Search and retrieval</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-blue-400/30">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400"><GraduationCap size={20} /></div>
                    <p className="text-sm font-semibold text-slate-200">Assessment</p>
                    <p className="mt-1 text-[11px] text-slate-500">Practice and evaluate</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-blue-400/15 bg-gradient-to-r from-blue-500/[0.10] to-indigo-500/[0.06] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-200"><Sparkles size={15} /> Grounded academic intelligence</div>
                    <ArrowUpRight size={15} className="text-blue-400" />
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div initial={{ width: '0%' }} animate={{ width: '78%' }} transition={{ duration: 1.5, delay: 1 }} className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" />
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">Documents · Reasoning · Assessment</p>
                </div>
              </div>
              <div className="border-t border-white/[0.07] px-5 py-3 text-center text-[9px] tracking-[0.18em] text-slate-600">SCHOLARPILOT INTELLIGENCE SYSTEM</div>
            </div>

            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-3 top-4 hidden rounded-xl border border-white/10 bg-[#172338]/95 p-3 shadow-xl "
            >
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-400"><Check size={15} /></div>
                <div><p className="text-[10px] font-semibold text-white">Knowledge connected</p><p className="text-[9px] text-slate-500">Learning environment</p></div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Platform introduction */}
        <section id="platform" className="scroll-mt-24 border-y border-white/[0.06] bg-white/[0.018] py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.7 }} className="mx-auto max-w-3xl text-center">
              <SectionLabel>THE PLATFORM</SectionLabel>
              <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-5xl">
                An academic intelligence <span className="text-blue-400">ecosystem.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Bring your resources, learning activities and academic insights together in one connected environment.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.article
                    key={feature.number}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={fadeUp}
                    transition={{ duration: 0.55, delay: index * 0.07 }}
                    whileHover={{ y: -6 }}
                    className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#101827]/80 p-7 transition-colors hover:border-blue-400/30 hover:bg-[#121e31]"
                  >
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/[0.04] blur-3xl transition group-hover:bg-blue-500/[0.12]" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/[0.08] text-blue-400 transition group-hover:border-blue-400/30 group-hover:bg-blue-500/15">
                        <Icon size={22} />
                      </div>
                      <span className="font-heading text-sm text-slate-600">{feature.number}</span>
                    </div>
                    <p className="relative mt-7 text-[9px] font-bold tracking-[0.2em] text-blue-400">{feature.tag}</p>
                    <h3 className="relative mt-3 font-heading text-xl font-semibold text-slate-100">{feature.title}</h3>
                    <p className="relative mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
                    <div className="relative mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500 transition group-hover:text-blue-300">
                      Explore capability <ArrowUpRight size={14} />
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="scroll-mt-24 py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <SectionLabel>HOW IT WORKS</SectionLabel>
                <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Your learning <span className="text-blue-400">journey.</span>
                </h2>
                <p className="mt-6 max-w-md text-sm leading-8 text-slate-400">
                  A connected learning workflow designed to help transform information into understanding.
                </p>
                <Link to="/login" className="mt-9 inline-flex items-center gap-3 text-sm font-semibold text-blue-400 transition hover:gap-5">
                  Start exploring <ArrowRight size={17} />
                </Link>
              </motion.div>

              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, x: 25 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.12 }}
                      className="group flex gap-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 transition hover:border-blue-400/25 hover:bg-blue-500/[0.035] sm:gap-7 sm:p-8"
                    >
                      <div className="font-heading text-sm font-semibold text-blue-400/60">{step.number}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-heading text-lg font-semibold text-slate-100">{step.title}</h3>
                          <Icon size={21} className="shrink-0 text-blue-400 transition group-hover:scale-110" />
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section id="vision" className="scroll-mt-24 border-y border-white/[0.06] bg-gradient-to-br from-[#101b2d] via-[#0c1422] to-[#10172a] py-28">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.7 }}>
              <SectionLabel>OUR VISION</SectionLabel>
              <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Make learning
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">more meaningful.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-slate-400 sm:text-base">
                ScholarPilot AI is designed around a simple idea: students should be able to do more than collect information. They should be able to explore it, understand it and use it to grow.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-28 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-blue-400/20 bg-[#101c31] px-7 py-16 text-center sm:px-12 sm:py-20"
          >
            <div className="pointer-events-none absolute -left-20 -top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-48 -right-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px]" />
            <div className="relative">
              <p className="text-[10px] font-bold tracking-[0.28em] text-blue-400">YOUR NEXT CHAPTER STARTS HERE</p>
              <h2 className="mt-5 font-heading text-4xl font-semibold tracking-tight sm:text-6xl">Learn smarter.</h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400">
                Discover an intelligent academic environment built to make your learning journey more connected and meaningful.
              </p>
              <Link to="/login" className="group mt-9 inline-flex items-center gap-3 rounded-lg bg-blue-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-500">
                Enter ScholarPilot <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.07]">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-9 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-blue-400"><BrainCircuit size={19} /></div>
              <div>
                <p className="font-heading text-base font-bold">ScholarPilot AI</p>
                <p className="text-[9px] tracking-wider text-slate-600">INTELLIGENCE FOR A DEEPER UNDERSTANDING OF KNOWLEDGE</p>
              </div>
            </Link>
            <div className="flex flex-wrap gap-6 text-xs text-slate-500">
              <a href="#platform" className="transition hover:text-blue-400">Platform</a>
              <a href="#workflow" className="transition hover:text-blue-400">How it works</a>
              <Link to="/login" className="transition hover:text-blue-400">Sign in</Link>
            </div>
            <p className="text-xs text-slate-600">© 2026 ScholarPilot AI</p>
          </div>
        </footer>
      </div>
    </main>
  )
}

export default LandingPage
