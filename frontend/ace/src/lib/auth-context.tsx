import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { AuthUser } from '@/api/auth'

type AuthContextValue = {
  user: AuthUser | null | undefined
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    typeof value._id === 'string' &&
    'username' in value &&
    typeof value.username === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'fullName' in value &&
    typeof value.fullName === 'string' &&
    'type' in value &&
    typeof value.type === 'string'
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null | undefined>(undefined)

  useEffect(() => {
    const storedUser = window.localStorage.getItem('user')

    if (!storedUser) {
      setUserState(null)
      return
    }

    try {
      const parsedUser: unknown = JSON.parse(storedUser)
      if (!isAuthUser(parsedUser)) {
        throw new Error('Saved user data has an invalid format')
      }
      setUserState(parsedUser)
    } catch {
      window.localStorage.removeItem('user')
      toast.error('Could not read saved user data. Please sign in again.')
      setUserState(null)
    }
  }, [])

  const setUser = (nextUser: AuthUser) => {
    window.localStorage.setItem('user', JSON.stringify(nextUser))
    setUserState(nextUser)
  }

  const clearUser = () => {
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('refreshToken')
    window.localStorage.removeItem('user')
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
