
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  Trophy,
  ArrowRight,
  BookOpen,
} from 'lucide-react'

import {
  generateQuiz,
  submitQuiz,
  type QuizGenerateResponse,
  type QuizSubmitResponse,
} from '../../services/api'

export default function QuizGenerator() {
  const [topic, setTopic] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [quiz, setQuiz] = useState<QuizGenerateResponse | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<QuizSubmitResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!topic.trim()) {
      setError('Please enter a topic for your quiz.')
      return
    }

    setLoading(true)
    setError('')
    setQuiz(null)
    setAnswers({})
    setResult(null)

    try {
      const response = await generateQuiz(topic.trim(), questionCount)
      setQuiz(response)
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Unable to generate the quiz. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleAnswer(questionIndex: number, answer: string) {
    if (result) return

    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: answer,
    }))
  }

  async function handleSubmit() {
    if (!quiz) return

    if (Object.keys(answers).length !== quiz.total_questions) {
      setError('Please answer every question before submitting.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await submitQuiz(quiz.quiz_id, answers)
// Notify the Learning Analytics dashboard
// that a new quiz has been successfully completed.
window.dispatchEvent(new Event('quiz-submitted'))
      setResult(response)
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Unable to submit your quiz. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function resetQuiz() {
    setQuiz(null)
    setAnswers({})
    setResult(null)
    setTopic('')
    setError('')
  }

  const progress = quiz
    ? (Object.keys(answers).length / quiz.total_questions) * 100
    : 0

  return (
    <div className="space-y-6">
      {!quiz && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#15132c] via-[#10172a] to-[#0b1220] p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-400">
              <BrainCircuit size={25} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                AI Quiz Generator
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Test your understanding of your uploaded study materials.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Quiz topic
              </label>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !loading) handleGenerate()
                }}
                placeholder="Example: Big Data and its Characteristics"
                maxLength={300}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Number of questions
              </label>
              <select
                value={questionCount}
                onChange={(event) =>
                  setQuestionCount(Number(event.target.value))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
              >
                {[5, 10, 15, 20].map((count) => (
                  <option key={count} value={count}>
                    {count} questions
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Generating your quiz...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate AI Quiz
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
              <BookOpen size={15} className="mt-0.5 shrink-0" />
              Questions are generated from your uploaded study documents.
              Upload a document first if your library is empty.
            </div>
          </div>
        </motion.div>
      )}

      {quiz && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="rounded-2xl border border-violet-500/20 bg-[#10172a] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
                  <Sparkles size={14} />
                  AI-generated assessment
                </div>
                <h3 className="text-xl font-bold text-white">{quiz.topic}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {quiz.total_questions} questions · Document-based assessment
                </p>
              </div>
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-center">
                <p className="text-xl font-bold text-violet-300">
                  {Object.keys(answers).length}/{quiz.total_questions}
                </p>
                <p className="text-[10px] text-slate-400">Answered</p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {quiz.questions.map((question, index) => {
            const questionResult = result?.results[index]

            return (
              <motion.div
                key={`${quiz.quiz_id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-violet-400">
                      Question {index + 1}
                    </p>
                    <h4 className="text-sm font-semibold leading-7 text-white">
                      {question.question}
                    </h4>
                  </div>
                  {result && questionResult && (
                    questionResult.is_correct ? (
                      <CheckCircle2 className="shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="shrink-0 text-red-400" />
                    )
                  )}
                </div>

                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[index] === option
                    const correct =
                      result &&
                      questionResult?.correct_answer === option
                    const wrongSelected =
                      result && selected && !questionResult?.is_correct

                    let optionStyle =
                      'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/5'

                    if (selected && !result) {
                      optionStyle =
                        'border-violet-500 bg-violet-500/10 text-violet-200'
                    }

                    if (correct) {
                      optionStyle =
                        'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                    } else if (wrongSelected) {
                      optionStyle =
                        'border-red-500/50 bg-red-500/10 text-red-200'
                    }

                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        disabled={!!result}
                        onClick={() => handleAnswer(index, option)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${optionStyle} disabled:cursor-default`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/20 text-xs font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1 leading-6">{option}</span>
                        {correct && (
                          <CheckCircle2
                            size={17}
                            className="shrink-0 text-emerald-400"
                          />
                        )}
                        {wrongSelected && (
                          <XCircle
                            size={17}
                            className="shrink-0 text-red-400"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {result && questionResult && (
                  <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                    <p className="mb-2 text-xs font-bold text-cyan-300">
                      Explanation
                    </p>
                    <p className="text-sm leading-6 text-slate-300">
                      {questionResult.explanation}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                      Sources: {questionResult.source_ids.join(', ') || 'Not specified'}
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}

          {!result ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-4 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Evaluating your answers...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-6 text-center sm:p-8"
              >
                <Trophy size={38} className="mx-auto mb-3 text-amber-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Assessment completed
                </p>
                <h3 className="mt-3 text-4xl font-bold text-white">
                  {result.score}/{result.total_questions}
                </h3>
                <p className="mt-2 text-lg font-semibold text-emerald-300">
                  {result.percentage}% score
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Review the explanations above to strengthen your understanding.
                </p>
                <button
                  onClick={resetQuiz}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  <RotateCcw size={16} />
                  Create another quiz
                </button>
              </motion.div>
            </AnimatePresence>
          )}

          {quiz.sources.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <FileText size={16} className="text-cyan-400" />
                Reference materials
              </div>
              <div className="space-y-2">
                {quiz.sources.map((source) => (
                  <div
                    key={source.source_id}
                    className="flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-slate-400">
                      {source.source_id} · {source.filename}
                    </span>
                    <span className="text-slate-500">
                      {source.page_number
                        ? `Page ${source.page_number}`
                        : 'Page unavailable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
