import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/$user/')({
  component: RouteComponent,
})

function RouteComponent() {
    const {user} = Route.useParams();
  return <div>Hello "/dashboard/${user}</div>
}
