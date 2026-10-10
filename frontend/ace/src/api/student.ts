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
  locked: boolean
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

export type VideoResponse ={
  _id: string,
  title: string,
  url: string,
  list: number,
  category: string,
  group: string,
  course:  string,
}

export type fetchVideoResponse = {
  videos: VideoResponse[]
}

type ApiResponse<T> = {
  statusCode: number
  success: boolean
  message: string
  data: T
}


export async function getCurrentStudent() {
  const response = await api.post<CurrentUserResponse>(
    '/api/v1/auth/current-user',
  )
  return response.data.data
}

export async function fetchVideo(courseId: string, categoryId: string, groupId: string) {
  const response = await api.get<ApiResponse<fetchVideoResponse>>(
      `/api/v1/student/video/${courseId}/${categoryId}/${groupId}`
  )
 return response.data;
}