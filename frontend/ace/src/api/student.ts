import { api } from '@/lib/api'
import type { StudentEnrollment } from '@/api/admin'
import type { AuthUser } from '@/api/auth'

export type StudentDashboardUser = AuthUser & {
  contactNo?: string
  gender?: string
  dob?: string
  fathersName?: string
  mothersName?: string
  isEnglishTyping?: boolean
  isHindiTyping?: boolean
  enrollments: StudentEnrollment[]
  fees: {
    totalFee: number
    totalPaid: number
    totalDue: number
  }
}

type CurrentUserResponse = {
  data: StudentDashboardUser
  message: string
  success: boolean
  statusCode: number
}

export async function getCurrentStudent() {
  const response = await api.post<CurrentUserResponse>(
    '/api/v1/auth/current-user',
  )
  return response.data.data
}
