import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, IndianRupee, Wallet } from 'lucide-react'

import { getCurrentStudent } from '@/api/student'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { getErrorMessage } from '@/lib/get-error-message'

export const Route = createFileRoute('/dashboard/student/')({
  component: StudentOverview,
})

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function StudentOverview() {
  const { user } = useAuth()
  const studentQuery = useQuery({
    queryKey: ['student', 'current-user'],
    queryFn: getCurrentStudent,
  })
  const student = studentQuery.data

  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-800 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
        <div className="absolute -right-10 -top-20 size-64 rounded-full bg-teal-300/10 blur-2xl" />
        <div className="flex items-center justify-between">
            <div className="relative max-w-2xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">
                Your learning space
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Welcome back, {user?.fullName || user?.username || 'Student'}!
              </h1>
              <p className="max-w-xl text-sm leading-6 text-emerald-50/80 sm:text-base">
                Keep building your skills. Pick up a typing practice or check in on
                your courses and progress.
              </p>
              <Button
                render={<Link to="/dashboard/student/courses" />}
                nativeButton={false}
                className="rounded-full bg-white text-emerald-950 hover:bg-emerald-50"
              >
                View my courses <ArrowRight />
              </Button>
            </div>
            <img src={`http://localhost:3000/${user?.avatar?.url}`} className="w-40 rounded-full"/>
        </div>
       
      </section>

      {studentQuery.isPending ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading your learning summary...
        </p>
      ) : studentQuery.isError ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p role="alert" className="text-sm">
            Could not load your learning summary:{' '}
            {getErrorMessage(studentQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void studentQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Enrolled courses"
            value={String(student?.enrollments.length ?? 0)}
            detail="Your active learning"
            icon={<BookOpen />}
          />
          <SummaryCard
            label="Total course fees"
            value={money.format(student?.fees.totalFee ?? 0)}
            detail="Across your enrollments"
            icon={<IndianRupee />}
          />
          <SummaryCard
            label="Paid so far"
            value={money.format(student?.fees.totalPaid ?? 0)}
            detail="Recorded payments"
            icon={<Wallet />}
          />
          <SummaryCard
            label="Fee balance"
            value={money.format(student?.fees.totalDue ?? 0)}
            detail="Remaining course fees"
            icon={<IndianRupee />}
          />
        </section>
      )}

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Get started
          </p>
          <h2 className="mt-1 text-2xl font-bold">Choose what to work on</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <QuickLink
            title="My courses"
            description="See your course enrollments, payments and balances."
            href="/dashboard/student/courses"
            icon={<BookOpen />}
            accent="bg-emerald-100 text-emerald-700"
          />
        </div>
      </section>
    </main>
  )
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: string
  detail: string
  icon: React.ReactNode
}) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
    </article>
  )
}

function QuickLink({
  title,
  description,
  href,
  icon,
  accent,
}: {
  title: string
  description: string
  href: '/dashboard/student/courses'
  icon: React.ReactNode
  accent: string
}) {
  return (
    <Link
      to={href}
      className="group flex min-h-48 flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <span className={`mb-5 w-fit rounded-xl p-3 ${accent}`}>{icon}</span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
        Open{' '}
        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
