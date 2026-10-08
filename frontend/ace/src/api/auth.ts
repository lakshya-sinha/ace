import { api } from '@/lib/api'
import type { LoginInput } from '@/schemas/auth'

export type AuthUser = {
  _id: string
  username: string
  email: string
  fullName: string
  type: string
  avatar?: { url: string }
}

export type LoginResponse = {
  statusCode: number
  success: boolean
  message: string
  data: {
    user: AuthUser
    accessToken: string
    refreshToken: string
  }
}

export const loginRequest = async (payload: LoginInput) => {
  const response = await api.post<LoginResponse>(
    '/api/v1/auth/login',
    payload,
  )
  return response.data
}

export const logoutRequest = async () => {
  const response = await api.post<{ message: string }>('/api/v1/auth/logout')
  window.localStorage.removeItem('accessToken')
  window.localStorage.removeItem('refreshToken')
  window.localStorage.removeItem('user')
  return response.data
}
