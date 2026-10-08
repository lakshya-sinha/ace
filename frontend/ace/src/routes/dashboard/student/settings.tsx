import { createFileRoute } from '@tanstack/react-router'

import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/dashboard/student/settings')({
  component: StudentSettingsPage,
})

function StudentSettingsPage() {
  const { user } = useAuth()

  return (
    <main className="mx-auto max-w-4xl space-y-7">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Preferences
        </p>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          View your account information and choose how the dashboard looks.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold">Account information</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <SettingDetail label="Full name" value={user?.fullName} />
          <SettingDetail label="Username" value={user?.username} />
          <SettingDetail label="Email address" value={user?.email} />
          <SettingDetail label="Account type" value={user?.type} />
        </dl>
        <p className="mt-5 rounded-xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          To update your personal details, please contact the academy
          administrator.
        </p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
        <div>
          <h2 className="text-lg font-bold">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose light, dark, or follow your device setting.
          </p>
        </div>
        <ThemeToggle />
      </section>
    </main>
  )
}

function SettingDetail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value || '—'}</dd>
    </div>
  )
}
