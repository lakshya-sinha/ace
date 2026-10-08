import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Clock3, IndianRupee, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { deleteCourse, getCoursesPage } from '@/api/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getErrorMessage } from '@/lib/get-error-message'

export const Route = createFileRoute('/dashboard/admin/courses/')({
  component: CoursesPage,
})

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function CoursesPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const courseQuery = useQuery({
    queryKey: ['admin', 'courses', 'list', page],
    queryFn: () => getCoursesPage(page, 10),
  })
  const pageData = courseQuery.data
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: (response) => {
      toast.success(response.message)
      if (page > 1 && pageData?.courses.length === 1) {
        setPage((currentPage) => currentPage - 1)
      }
      void queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  function handleDelete(courseId: string, title: string) {
    if (!window.confirm(`Delete course "${title}"?`)) return
    deleteMutation.mutate(courseId)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-primary">
            <BookOpen className="size-4" />
            Course management
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            {pageData
              ? `Explore and manage your ${pageData.total} courses.`
              : 'Explore and manage the courses offered by your academy.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void courseQuery.refetch()}
            disabled={courseQuery.isFetching}
          >
            <RefreshCw
              className={courseQuery.isFetching ? 'animate-spin' : undefined}
            />
            Refresh
          </Button>
          <Button
            render={<Link to="/dashboard/admin/add-course" />}
            nativeButton={false}
          >
            <Plus />
            Add course
          </Button>
        </div>
      </header>

      {courseQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </div>
      ) : courseQuery.isError ? (
        <div className="space-y-3 rounded-xl border p-6">
          <p role="alert">{getErrorMessage(courseQuery.error)}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void courseQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : pageData && pageData.courses.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pageData.courses.map((course) => (
              <Card
                key={course._id}
                className="group rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <BookOpen className="size-5" />
                    </div>
                    <Badge variant={course.isActive ? 'default' : 'secondary'}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-10">
                      {course.description || 'No description available.'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 capitalize">
                    <BookOpen className="size-4" />
                    {course.language || 'Language not set'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-4" />
                    {course.durationInMonths ?? '—'} months
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <IndianRupee className="size-4" />
                    {money.format(course.price)}
                  </span>
                </CardContent>
                <CardFooter className="justify-between gap-2">
                  <Button
                    render={
                      <Link
                        to="/dashboard/admin/courses/$courseId"
                        params={{ courseId: course._id }}
                      />
                    }
                    variant="outline"
                    className="flex-1"
                    nativeButton={false}
                  >
                    View & update
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(course._id, course.title)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {pageData.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {pageData.page} of {pageData.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || courseQuery.isFetching}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    page >= pageData.totalPages || courseQuery.isFetching
                  }
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </div>
          <h2 className="font-semibold">No courses yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first course to start building your catalogue.
          </p>
          <Button
            render={<Link to="/dashboard/admin/add-course" />}
            className="mt-5"
            nativeButton={false}
          >
            <Plus />
            Add course
          </Button>
        </div>
      )}
    </section>
  )
}
