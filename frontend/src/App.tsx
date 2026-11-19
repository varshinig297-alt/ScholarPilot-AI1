
import { useEffect, useState, type ReactNode } from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WorkspacePage from './pages/WorkspacePage'
import { checkBackendHealth } from './services/api'
import { useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D18] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-400" />
          <p className="text-sm text-slate-400">
            Verifying your session...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

function BackendStatus() {
  const [status, setStatus] = useState('Checking backend...')

  useEffect(() => {
    checkBackendHealth()
      .then(() => setStatus('Backend Connected'))
      .catch(() => setStatus('Backend Disconnected'))
  }, [])

  const connected = status === 'Backend Connected'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        padding: '10px 16px',
        borderRadius: '10px',
        background: '#111827',
        color: connected ? '#4ade80' : '#fbbf24',
        border: `1px solid ${connected ? '#166534' : '#92400e'}`,
        fontSize: '13px',
        fontWeight: 600,
      }}
    >
      ● {status}
    </div>
  )
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />

        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <BackendStatus />
    </>
  )
}

export default App
