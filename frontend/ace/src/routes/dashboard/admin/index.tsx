import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/dashboard/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">
        Welcome, {user?.fullName ?? 'Admin'}
      </h1>
      <p className="text-muted-foreground">
        Manage students and other admin tasks from the sidebar.
      </p>
      {user && (
        <div className="pt-4">
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <p>Account type: {user.type}</p>
        </div>
      )}
      <div>
         <a href='https://u.payu.in/eI5Pz6GtmiSw' > Pay Now </a> </div>
    </section>
  )
}
