import { api } from '@/lib/api'

type ApiResponse<T> = {
  statusCode: number
  success: boolean
  message: string
  data: T
}

export type Course = {
  _id: string
  title: string
  slug?: string
  description?: string
  price: number
  language?: string
  durationInMonths?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export type StudentRegistrationResponse = {
  user: {
    _id: string
    username: string
    email: string
    fullName?: string
  }
  enrollment: {
    enrollmentId: string
    courseTitle: string
    coursePrice: number
    discountPercent: number
    finalFee: number
    due: number
    feeStatus: string
  } | null
}

export type StudentListItem = {
  _id: string
  username: string
  email: string
  fullName?: string
  contactNo?: string
  gender?: 'male' | 'female' | 'other'
  isEmailVerified: boolean
  locked?: boolean
  createdBy?: 'admin' | 'teacher'
  courses: Array<string | undefined>
  totalFee: number
  totalPaid: number
  totalDue: number
}

export type StudentsPage = {
  students: StudentListItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type CoursesPage = {
  courses: Course[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type StudentDetails = {
  _id: string
  avatar?: { url?: string }
  signature?: { url?: string }
  username: string
  email: string
  fullName?: string
  isEmailVerified: boolean
  type: string
  locked?: boolean
  createdBy?: 'admin' | 'teacher'
  contactNo?: string
  gender?: 'male' | 'female' | 'other'
  dob?: string
  careOfTitle?: 'father' | 'guardian'
  careOfName?: string
  careOfNumber?: string
  spouseName?: string
  fathersName?: string
  mothersName?: string
  isEnglishTyping: boolean
  isHindiTyping: boolean
  address?: string
  matricBoard?: string
  matricSchool?: string
  matricPassingYear?: number
  matricPercentage?: string
  interBoard?: string
  interSchool?: string
  interPassingYear?: number
  interPercentage?: string
  graduationBoard?: string
  graduationCollege?: string
  graduationPassingYear?: number
  graduationPercentage?: string
  otherBoard?: string
  otherCollege?: string
  otherPassingYear?: number
  otherPercentage?: string
  aadhaarNo?: string
  remarks?: string
  createdAt: string
  updatedAt: string
  fees: {
    courses: StudentEnrollment[]
    totalFee: number
    totalPaid: number
    totalDue: number
  }
}

export type StudentEnrollment = {
  enrollmentId: string
  course: Course | null
  status: string
  enrolledOn: string
  discountPercent: number
  finalFee: number
  totalPaid: number
  due: number
  feeStatus: string
  installments: StudentInstallment[]
}

export type StudentInstallment = {
  _id: string
  number: number
  amount: number
  paidOn: string
  mode: string
  receiptNo?: string
  note?: string
  receivedBy?: { fullName?: string; username?: string }
}

export type StudentDetailsResponse = {
  statusCode: number
  success: boolean
  message: string
  data: StudentDetails
}

export type CourseRegistrationResponse = {
  statusCode: number
  success: boolean
  message: string
  data: Course
}

export type UpdateCourseInput = {
  title: string
  description: string
  language: 'english' | 'hindi' | 'both'
  durationInMonths: number
  price: number
  isActive: boolean
}



export async function getCourses() {
  const response = await api.get<ApiResponse<CoursesPage>>(
    '/api/v1/admin/courses?active=true',
    { params: { limit: 100 } },
  )
  return response.data.data.courses
}

export async function getCoursesPage(page: number, limit = 10) {
  const response = await api.get<ApiResponse<CoursesPage>>(
    '/api/v1/admin/courses',
    { params: { page, limit } },
  )
  return response.data.data
}

export async function getCourse(courseId: string) {
  const firstPage = await getCoursesPage(1, 100)
  const firstPageCourse = firstPage.courses.find(
    (course) => course._id === courseId,
  )
  if (firstPageCourse) return firstPageCourse

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const pageData = await getCoursesPage(page, 100)
    const course = pageData.courses.find((item) => item._id === courseId)
    if (course) return course
  }

  throw new Error('Course not found')
}

export async function updateCourse(
  courseId: string,
  updates: UpdateCourseInput,
) {
  const response = await api.patch<ApiResponse<Course>>(
    `/api/v1/admin/courses/${courseId}`,
    updates,
  )
  return response.data
}

export async function getStudents(page: number, limit = 10) {
  const response = await api.get<ApiResponse<StudentsPage>>(
    '/api/v1/admin/students',
    { params: { page, limit } },
  )
  return response.data
}

export async function getStudent(studentId: string) {
  const response = await api.get<StudentDetailsResponse>(
    `/api/v1/admin/students/${studentId}`,
  )
  return response.data
}

export async function updateStudent(studentId: string, updates: FormData) {
  const response = await api.patch<ApiResponse<StudentDetails>>(
    `/api/v1/admin/students/${studentId}`,
    updates,
  )
  return response.data
}

export async function assignCourse(
  studentId: string,
  input: { courseId: string; discountPercent: number },
) {
  const response = await api.post<
    ApiResponse<{
      enrollmentId: string
      courseTitle: string
      coursePrice: number
      discountPercent: number
      finalFee: number
      due: number
      feeStatus: string
    }>
  >(`/api/v1/admin/students/${studentId}/enrollments`, input)
  return response.data
}

export async function addInstallment(
  studentId: string,
  enrollmentId: string,
  input: {
    amount: number
    mode: string
    paidOn: string
    note: string
  },
) {
  const response = await api.post<
    ApiResponse<{
      installment: StudentInstallment
      finalFee: number
      totalPaid: number
      due: number
      feeStatus: string
      status: string
    }>
  >(
    `/api/v1/admin/students/${studentId}/enrollments/${enrollmentId}/installments`,
    input,
  )
  return response.data
}

export async function deleteInstallment(
  studentId: string,
  enrollmentId: string,
  installmentId: string,
) {
  const response = await api.delete<
    ApiResponse<{
      installmentId: string
      finalFee: number
      totalPaid: number
      due: number
      feeStatus: string
      status: string
    }>
  >(
    `/api/v1/admin/students/${studentId}/enrollments/${enrollmentId}/installments/${installmentId}`,
  )
  return response.data
}

export async function deassignCourse(studentId: string, enrollmentId: string) {
  const response = await api.delete<
    ApiResponse<{
      enrollmentId: string
      courseTitle?: string
      status: string
    }>
  >(`/api/v1/admin/students/${studentId}/enrollments/${enrollmentId}`)
  return response.data
}

export async function deleteCourse(courseId: string) {
  const response = await api.delete<ApiResponse<{ courseId: string }>>(
    `/api/v1/admin/courses/${courseId}`,
  )
  return response.data
}

export async function registerStudent(formData: FormData) {
  const response = await api.post<ApiResponse<StudentRegistrationResponse>>(
    '/api/v1/admin/registerStudent',
    formData,
  )
  return response.data
}

export async function registerCourse(formData: FormData) {
  const response = await api.post<ApiResponse<CourseRegistrationResponse>>(
    '/api/v1/admin/courses',
    formData,
  )
  return response.data
}

