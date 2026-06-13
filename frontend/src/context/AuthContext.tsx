import { createContext, useCallback, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginApi } from '@/api/auth'
import type { AuthUser, RoleName } from '@/types'

const STORAGE_KEY = 'falcons_auth'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
}

type AuthAction =
  | { type: 'SET_USER'; payload: AuthUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false }
    case 'CLEAR_USER':
      return { ...state, user: null, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (role: RoleName) => boolean
  hasAnyRole: (roles: RoleName[]) => boolean
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { user: null, isLoading: true })
  const navigate = useNavigate()

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const auth: AuthUser = JSON.parse(raw)
        if (auth.token) dispatch({ type: 'SET_USER', payload: auth })
        else dispatch({ type: 'CLEAR_USER' })
      } catch {
        dispatch({ type: 'CLEAR_USER' })
      }
    } else {
      dispatch({ type: 'CLEAR_USER' })
    }
  }, [])

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  })

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password)
    const auth = res.data.data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    dispatch({ type: 'SET_USER', payload: auth })
    navigate('/dashboard')
  }, [navigate])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    dispatch({ type: 'CLEAR_USER' })
    navigate('/login')
  }, [navigate])

  const hasRole = useCallback((role: RoleName) => state.user?.roles.includes(role) ?? false, [state.user])
  const hasAnyRole = useCallback((roles: RoleName[]) => roles.some(r => state.user?.roles.includes(r)), [state.user])

  return (
    <AuthContext.Provider value={{
      user: state.user,
      isLoading: state.isLoading,
      isAuthenticated: !!state.user,
      login,
      logout,
      hasRole,
      hasAnyRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
