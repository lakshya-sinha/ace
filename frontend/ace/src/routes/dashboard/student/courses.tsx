import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, CircleCheck, Clock3 } from 'lucide-react'

import { getCurrentStudent } from '@/api/student'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/get-error-message'

export const Route = createFileRoute('/dashboard/student/courses')({
  component: StudentCoursesPage,
})

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function StudentCoursesPage() {
  const studentQuery = useQuery({
    queryKey: ['student', 'current-user'],
    queryFn: getCurrentStudent,
  })

  if (studentQuery.isPending) {
    return <p role="status">Loading your courses...</p>
  }

  if (studentQuery.isError) {
    return (
      <section className="space-y-4">
        <p role="alert">{getErrorMessage(studentQuery.error)}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void studentQuery.refetch()}
        >
          Try again
        </Button>
      </section>
    )
  }

  const { enrollments, fees } = studentQuery.data

  return (
    <main className="mx-auto max-w-6xl space-y-7">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Learning plan
        </p>
        <h1 className="text-3xl font-bold">My courses</h1>
        <p className="text-muted-foreground">
          Your course enrollments and fee progress in one place.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <FeeSummary label="Total fees" value={money.format(fees.totalFee)} />
        <FeeSummary label="Paid" value={money.format(fees.totalPaid)} />
        <FeeSummary label="Remaining" value={money.format(fees.totalDue)} />
      </section>

      {enrollments.length === 0 ? (
        <section className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <BookOpen className="mx-auto size-10 text-emerald-700" />
          <h2 className="mt-4 text-xl font-bold">No courses yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Once the academy assigns a course to your account, it will appear
            here with your payment and enrollment details.
          </p>
          <Button
            render={<Link to="/dashboard/student" />}
            nativeButton={false}
            variant="outline"
            className="mt-5"
          >
            Back to overview
          </Button>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {enrollments.map((enrollment) => (
            <article
              key={enrollment.enrollmentId}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <header className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
                    <BookOpen />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold">
                      {enrollment.course?.title || 'Course'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {enrollment.course?.language || 'Language not specified'}
                      {enrollment.course?.durationInMonths
                        ? ` · ${enrollment.course.durationInMonths} months`
                        : ''}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">
                  <CircleCheck className="size-3.5" />
                  {enrollment.status}
                </span>
              </header>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <CourseAmount label="Course fee" value={enrollment.finalFee} />
                <CourseAmount label="Paid" value={enrollment.totalPaid} />
                <CourseAmount label="Balance due" value={enrollment.due} />
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Fee status</p>
                  <p className="mt-1 font-semibold capitalize">
                    {enrollment.feeStatus}
                  </p>
                </div>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />
                Enrolled {new Date(enrollment.enrolledOn).toLocaleDateString()}
              </p>
              {enrollment.installments.length > 0 && (
                <div className="mt-5 border-t pt-4">
                  <p className="text-sm font-semibold">Recent payments</p>
                  <ul className="mt-2 space-y-2">
                    {enrollment.installments
                      .slice()
                      .reverse()
                      .slice(0, 3)
                      .map((installment) => (
                        <li
                          key={installment._id}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-muted-foreground">
                            Installment {installment.number} ·{' '}
                            {new Date(installment.paidOn).toLocaleDateString()}
                          </span>
                          <span className="font-medium">
                            {money.format(installment.amount)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              <Link
                to="/dashboard/student"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"
              >
                Dashboard overview <ArrowRight className="size-4" />
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

function FeeSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

function CourseAmount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{money.format(value)}</p>
    </div>
  )
}
