import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '#/lib/auth-context'
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate();
    const {user} = useAuth();
    navigate({to: `/dashboard/${user?.type}`})
}
