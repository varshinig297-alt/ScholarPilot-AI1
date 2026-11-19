
import { useState, useRef, useEffect, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  Send,
  Sparkles,
  BookOpen,
  FileText,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
  User,
  RefreshCw,
} from 'lucide-react'

import { askTutor, type TutorSource } from '../../services/api'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  sources?: TutorSource[]
  grounded?: boolean
  citationValid?: boolean
}

export default function AITutor() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || loading) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedQuestion,
    }

    setMessages((previous) => [...previous, userMessage])
    setQuestion('')
    setError('')
    setLoading(true)

    try {
      const response = await askTutor(trimmedQuestion, 4)

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        grounded: response.grounded,
        citationValid: response.citation_validation?.valid,
      }

      setMessages((previous) => [...previous, assistantMessage])
    } catch (err: unknown) {
      let errorMessage =
        'The AI Tutor could not process your question. Please try again.'

      if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiError = err as {
          response?: {
            data?: {
              detail?: string
            }
          }
        }

        errorMessage =
          apiError.response?.data?.detail || errorMessage
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    if (loading) return

    setMessages([])
    setError('')
    setQuestion('')
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-[#0b1220] shadow-2xl shadow-blue-950/20">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
            <BrainCircuit size={23} />
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold text-white">
              AI Academic Tutor
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your personal document-aware learning assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI Ready
          </span>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading || messages.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw size={13} />
            New chat
          </button>
        </div>
      </div>

      <div className="min-h-[380px] max-h-[600px] space-y-5 overflow-y-auto p-5 sm:p-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[340px] flex-col items-center justify-center text-center"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10">
              <Sparkles size={30} />
            </div>

            <h3 className="text-xl font-bold text-white">
              What would you like to learn today?
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ask questions about your uploaded study materials.
              ScholarPilot will search your documents and generate
              an answer with relevant source references.
            </p>

            <div className="mt-7 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {[
                'Explain the important concepts in my document.',
                'Summarize the uploaded study material.',
                'Give me simple examples of key topics.',
                'Explain a difficult topic step by step.',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuestion(suggestion)}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left text-xs leading-5 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  message.role === 'user'
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'border border-blue-400/20 bg-blue-500/10 text-blue-400'
                }`}
              >
                {message.role === 'user' ? (
                  <User size={17} />
                ) : (
                  <BrainCircuit size={18} />
                )}
              </div>

              <div
                className={`min-w-0 max-w-[88%] ${
                  message.role === 'user' ? 'text-right' : ''
                }`}
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {message.role === 'user' ? 'You' : 'ScholarPilot AI'}
                </p>

                <div
                  className={`rounded-2xl p-4 text-left text-sm leading-7 ${
                    message.role === 'user'
                      ? 'rounded-tr-sm border border-violet-500/20 bg-violet-500/10 text-violet-100'
                      : 'rounded-tl-sm border border-slate-800 bg-slate-900/70 text-slate-300'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>

                {message.role === 'assistant' && (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {message.grounded && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] text-emerald-400">
                          <ShieldCheck size={12} />
                          Document grounded
                        </span>
                      )}

                      {message.citationValid && (
                        <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-[10px] text-blue-400">
                          <BookOpen size={12} />
                          Citations valid
                        </span>
                      )}
                    </div>

                    {message.sources && message.sources.length > 0 && (
                      <div className="rounded-xl border border-slate-800 bg-[#080d19] p-4">
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-300">
                          <FileText size={14} className="text-blue-400" />
                          Referenced study material
                        </p>

                        <div className="space-y-3">
                          {message.sources.map((source) => (
                            <div
                              key={`${message.id}-${source.source_id}`}
                              className="border-l-2 border-blue-500/40 pl-3"
                            >
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-blue-400">
                                <span>{source.source_id}</span>
                                <span className="text-slate-600">·</span>
                                <span>{source.filename}</span>
                                {source.page_number !== null && (
                                  <>
                                    <span className="text-slate-600">·</span>
                                    <span>Page {source.page_number}</span>
                                  </>
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {source.text.length > 220
                                  ? `${source.text.slice(0, 220)}...`
                                  : source.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
              <BrainCircuit size={18} />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <LoaderCircle size={14} className="animate-spin text-blue-400" />
                Analyzing your study material...
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs leading-5 text-red-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-800 bg-[#080d19]/70 p-4 sm:p-5"
      >
        <div className="flex items-end gap-3 rounded-xl border border-slate-700 bg-slate-900/80 p-2 transition focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Ask anything about your uploaded study materials..."
            rows={2}
            maxLength={2000}
            disabled={loading}
            className="max-h-32 min-h-12 flex-1 resize-y bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send question"
          >
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-slate-600">
          <span>Enter to send · Shift + Enter for a new line</span>
          <span>{question.length}/2000</span>
        </div>
      </form>
    </section>
  )
}
