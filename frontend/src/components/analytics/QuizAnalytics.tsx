
import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  RefreshCw,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react'

import {
  getQuizAnalytics,
  getQuizHistory,
  type QuizAnalytics as QuizAnalyticsData,
  type QuizAttempt,
} from '../../services/api'

export default function QuizAnalytics() {
  const [analytics, setAnalytics] = useState<QuizAnalyticsData | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const [analyticsResponse, historyResponse] = await Promise.all([
        getQuizAnalytics(),
        getQuizHistory(50),
      ])

      setAnalytics(analyticsResponse.analytics)
      setAttempts(historyResponse.attempts)
    } catch (err) {
      console.error('Failed to load quiz analytics:', err)
      setError(
        'Unable to load learning analytics. Please check your backend connection and try again.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

useEffect(() => {
  // Load analytics when the dashboard first appears.
  void loadAnalytics()

  // Automatically refresh after a quiz is submitted.
  const handleQuizSubmitted = () => {
    void loadAnalytics(true)
  }

  window.addEventListener('quiz-submitted', handleQuizSubmitted)

  // Clean up the event listener when the component unmounts.
  return () => {
    window.removeEventListener('quiz-submitted', handleQuizSubmitted)
  }
}, [loadAnalytics])
  const averageScore = analytics?.average_percentage ?? 0
  const accuracy = analytics?.total_questions
    ? (analytics.total_correct / analytics.total_questions) * 100
    : 0

  const statCards = [
    {
      title: 'Total Assessments',
      value: analytics?.total_attempts ?? 0,
      description: 'Completed quizzes',
      icon: BookOpen,
      color: 'text-blue-400',
      background: 'bg-blue-500/10',
    },
    {
      title: 'Average Performance',
      value: `${averageScore.toFixed(1)}%`,
      description: 'Average quiz score',
      icon: TrendingUp,
      color: 'text-cyan-400',
      background: 'bg-cyan-500/10',
    },
    {
      title: 'Correct Answers',
      value: analytics?.total_correct ?? 0,
      description: 'Questions answered correctly',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      background: 'bg-emerald-500/10',
    },
    {
      title: 'Questions Attempted',
      value: analytics?.total_questions ?? 0,
      description: 'Across all completed quizzes',
      icon: Target,
      color: 'text-violet-400',
      background: 'bg-violet-500/10',
    },
  ]

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
        <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
          <RefreshCw size={18} className="animate-spin" />
          Loading your learning analytics...
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {/* Dashboard heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            <Activity size={15} />
            Performance intelligence
          </div>

          <h3 className="text-xl font-bold text-white sm:text-2xl">
            Your Learning Analytics
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Track your assessment performance and learning progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAnalytics(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={refreshing ? 'animate-spin' : ''}
          />
          {refreshing ? 'Refreshing...' : 'Refresh data'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadAnalytics(true)}
            className="mt-3 font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {/* Performance cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${card.background} ${card.color}`}
              >
                <Icon size={21} />
              </div>

              <p className="text-xs font-medium text-slate-400">
                {card.title}
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                {card.value}
              </p>

              <p className="mt-2 text-[11px] text-slate-500">
                {card.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Performance overview */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Award size={20} />
            </div>

            <div>
              <h4 className="font-semibold text-white">
                Overall Performance
              </h4>
              <p className="text-xs text-slate-500">
                Average score across completed assessments
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-white">
              {averageScore.toFixed(1)}%
            </p>
            <span className="text-xs text-slate-500">
              Average score
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.max(0, averageScore))}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Based on {analytics?.total_attempts ?? 0} completed assessments.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Target size={20} />
            </div>

            <div>
              <h4 className="font-semibold text-white">
                Answer Accuracy
              </h4>
              <p className="text-xs text-slate-500">
                Correct answers compared with all questions
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-white">
              {accuracy.toFixed(1)}%
            </p>
            <span className="text-xs text-slate-500">
              Overall accuracy
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.max(0, accuracy))}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {analytics?.total_correct ?? 0} correct out of{' '}
            {analytics?.total_questions ?? 0} questions.
          </p>
        </div>
      </div>

      {/* Quiz history */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5 sm:p-6">
          <div>
            <h4 className="font-bold text-white">Recent Assessments</h4>
            <p className="mt-1 text-xs text-slate-500">
              Your saved quiz attempts and results
            </p>
          </div>

          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-400">
            {attempts.length} RECORDS
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
              <BookOpen size={22} />
            </div>

            <p className="font-semibold text-white">
              No completed assessments yet
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Complete your first quiz to see your learning history here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {attempts.map((attempt) => (
              <div
                key={attempt.quiz_id}
                className="flex flex-col gap-4 p-5 transition hover:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <GraduationCapIcon />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {attempt.topic}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(attempt.created_at).toLocaleString()}
                      </span>
                      <span>·</span>
                      <span>
                        {attempt.total_questions} questions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    {attempt.score} / {attempt.total_questions}
                  </div>

                  <div
                    className={`min-w-20 rounded-lg px-3 py-2 text-center text-sm font-bold ${
                      attempt.percentage >= 70
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : attempt.percentage >= 40
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {attempt.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learning insight */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/15 bg-blue-500/5 p-4">
        <Activity size={18} className="mt-0.5 shrink-0 text-blue-400" />

        <div>
          <p className="text-sm font-semibold text-blue-300">
            Your learning progress
          </p>
          <p className="mt-1 text-xs leading-6 text-slate-400">
            {attempts.length === 0
              ? 'Your performance insights will appear after you complete an assessment.'
              : `You have completed ${analytics?.total_attempts ?? 0} assessment(s), answering ${analytics?.total_questions ?? 0} questions with ${accuracy.toFixed(1)}% overall accuracy. Keep practicing to strengthen your understanding.`}
          </p>
        </div>
      </div>
    </section>
  )
}

function GraduationCapIcon() {
  return <XCircle size={20} className="hidden" />
}
