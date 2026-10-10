import { useEffect, useState } from 'react'
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import {
  BookOpen,
  BookPlus,
  ChevronDown,
  House,
  Library,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react'

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
import ThemeToggle from '#/components/ThemeToggle'
import  LinkTabs  from '@/components/LinkTabs';

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { user } = useAuth()
  const [studentsOpen, setStudentsOpen] = useState(
    pathname.startsWith('/dashboard/admin/add-student') ||
      pathname.startsWith('/dashboard/admin/students'),
  )
  const [courseOpen, setCourseOpen] = useState(
    pathname.startsWith('/dashboard/admin/add-course') ||
    pathname.startsWith('/dashboard/admin/courses'),
  )

  useEffect(() => {
    if (user === null) {
      navigate({ to: '/auth/signin', replace: true })
    } else if (user && user.type !== 'admin') {
      navigate({ to: `/dashboard/${user.type}`, replace: true })
    }
  }, [navigate, user])

  if (user !== undefined && user !== null && user.type !== 'admin') {
    return <p className="p-6">Redirecting...</p>
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <span className="px-2 py-1 text-sm font-semibold">ACE</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/dashboard/admin" />}
                    isActive={
                      pathname === '/dashboard/admin' ||
                      pathname === '/dashboard/admin/'
                    }
                    tooltip="Overview"
                  >
                    <House />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <Collapsible
                  open={studentsOpen}
                  onOpenChange={setStudentsOpen}
                  render={<SidebarMenuItem />}
                >
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        isActive={
                          pathname.startsWith('/dashboard/admin/add-student') ||
                          pathname.startsWith('/dashboard/admin/students')
                        }
                      />
                    }
                  >
                    <User />
                    <span>Students</span>
                    <ChevronDown
                      className={`ml-auto transition-transform ${studentsOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          render={<Link to="/dashboard/admin/add-student" />}
                          isActive={pathname === '/dashboard/admin/add-student'}
                        >
                          <UserPlus />
                          <span>Add Student</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          render={<Link to="/dashboard/admin/students" />}
                          isActive={pathname === '/dashboard/admin/students'}
                        >
                          <UserCheck />
                          <span>List Students</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
                <Collapsible
                  open={courseOpen}
                  onOpenChange={setCourseOpen}
                  render={<SidebarMenuItem />}
                >
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        isActive={
                          pathname.startsWith('/dashboard/admin/add-course') ||
                          pathname.startsWith('/dashboard/admin/courses')
                        }
                      />
                    }
                  >
                    <BookOpen />
                    <span>Course</span>
                    <ChevronDown
                      className={`ml-auto transition-transform ${courseOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          render={<Link to="/dashboard/admin/add-course" />}
                          isActive={pathname === '/dashboard/admin/add-course'}
                        >
                          <BookPlus />
                          <span>Add course</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          render={<Link to="/dashboard/admin/courses" />}
                          isActive={pathname === '/dashboard/admin/courses'}
                        >
                          <Library />
                          <span>List Courses</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ThemeToggle />
          <Logout />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <LinkTabs/>
          
        </header>
        <div className="flex-1 p-6">
          {user === undefined || user === null ? (
            <p>Loading user...</p>
          ) : (
            <Outlet />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
