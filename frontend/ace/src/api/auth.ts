// src/api/auth.ts
import { api } from '@/lib/api'
import type { LoginInput } from '@/schemas/auth'

export type LoginResponse = {
  statusCode: number
  success: boolean
  message: string
  data: {
    user: {
      _id: string
      username: string
      email: string
      fullName: string
      type: string
      avatar?: { url: string }
    }
    accessToken: string
    refreshToken: string
  }
}

export const loginRequest = async (payload: LoginInput) => {
  const res = await api.post<LoginResponse>('/api/v1/auth/login', payload)
  return res.data
}
