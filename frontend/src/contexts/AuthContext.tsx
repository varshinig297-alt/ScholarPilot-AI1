
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../services/api'

export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  is_verified: boolean
}

interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: AuthUser
}

interface AuthContextType {
  user: AuthUser | null
  session: AuthResponse | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [loading] = useState(false)

  const signIn = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>(
      '/api/v1/auth/login',
      { email, password },
    )

    const authData = response.data

    setSession(authData)
    setUser(authData.user)

    api.defaults.headers.common.Authorization =
      `Bearer ${authData.access_token}`
  }

  const signOut = async () => {
    setSession(null)
    setUser(null)
    delete api.defaults.headers.common.Authorization
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
