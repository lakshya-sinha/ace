import { useEffect, useState } from 'react'
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { BookOpen, ChevronDown, House, Languages, Settings } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Logout } from '@/components/Logout'
import LinkTabs from '#/components/LinkTabs'

export const Route = createFileRoute('/dashboard/student')({
  component: StudentLayout,
})

function StudentLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { user } = useAuth()
  const [typingOpen, setTypingOpen] = useState(
    pathname.startsWith('/dashboard/student/typing'),
  )

  useEffect(() => {
    if (user === null) {
      navigate({ to: '/auth/signin', replace: true })
    } else if (user && user.type !== 'student') {
      navigate({ to: `/dashboard/${user.type}`, replace: true })
    }
  }, [navigate, user])

  if (user !== undefined && user !== null && user.type !== 'student') {
    return <p className="p-6">Redirecting...</p>
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="px-2 py-2">
            <p className="font-heading text-lg font-bold">ACE</p>
            <p className="text-xs text-muted-foreground">Student portal</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Learning</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/dashboard/student" />}
                    isActive={pathname === '/dashboard/student/'}
                    tooltip="Overview"
                  >
                    <House />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <Collapsible
                  open={typingOpen}
                  onOpenChange={setTypingOpen}
                  render={<SidebarMenuItem />}
                >
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        isActive={pathname.startsWith(
                          '/dashboard/student/typing',
                        )}
                      />
                    }
                  >
                    <Languages />
                    <span>Typing</span>
                    <ChevronDown
                      className={`ml-auto transition-transform ${typingOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          render={<a href="/dashboard/student/typing/hindi" />}
                          isActive={
                            pathname === '/dashboard/student/typing/hindi'
                          }
                        >
                          <span>हिंदी टाइपिंग</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          render={
                            <a href="/dashboard/student/typing/english" />
                          }
                          isActive={
                            pathname === '/dashboard/student/typing/english'
                          }
                        >
                          <span>English typing</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/dashboard/student/courses" />}
                    isActive={pathname === '/dashboard/student/courses'}
                    tooltip="My courses"
                  >
                    <BookOpen />
                    <span>Courses</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/dashboard/student/settings" />}
                    isActive={pathname === '/dashboard/student/settings'}
                    tooltip="Settings"
                  >
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Logout />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <LinkTabs/>
        </header>
        <div className="flex-1 p-4 sm:p-6">
          {user === undefined || user === null ? (
            <p role="status">Loading your account...</p>
          ) : (
            <div>
            <Outlet />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
