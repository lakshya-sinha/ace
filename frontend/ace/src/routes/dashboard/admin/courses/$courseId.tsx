import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  IndianRupee,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'

import { getCourse, updateCourse } from '@/api/admin'
import type { UpdateCourseInput } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { getErrorMessage } from '@/lib/get-error-message'

export const Route = createFileRoute('/dashboard/admin/courses/$courseId')({
  component: CourseDetailsPage,
})

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function CourseDetailsPage() {
  const { courseId } = Route.useParams()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const courseQuery = useQuery({
    queryKey: ['admin', 'course', courseId],
    queryFn: () => getCourse(courseId),
  })

  const updateMutation = useMutation({
    mutationFn: (updates: UpdateCourseInput) => updateCourse(courseId, updates),
    onSuccess: (response) => {
      toast.success(response.message)
      setEditOpen(false)
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'course', courseId],
      })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    updateMutation.mutate({
      title: String(values.get('title') ?? '').trim(),
      description: String(values.get('description') ?? '').trim(),
      language: values.get('language') as UpdateCourseInput['language'],
      durationInMonths: Number(values.get('durationInMonths')),
      price: Number(values.get('price')),
      isActive: values.get('isActive') === 'true',
    })
  }

  if (courseQuery.isPending) {
    return <p role="status">Loading course...</p>
  }

  if (courseQuery.isError) {
    return (
      <section className="space-y-4">
        <p role="alert">{getErrorMessage(courseQuery.error)}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void courseQuery.refetch()}
        >
          Try again
        </Button>
        <Button
          render={<Link to="/dashboard/admin/courses" />}
          variant="ghost"
          nativeButton={false}
        >
          <ArrowLeft />
          Back to courses
        </Button>
      </section>
    )
  }

  const course = courseQuery.data

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Button
        render={<Link to="/dashboard/admin/courses" />}
        variant="ghost"
        className="-ml-3"
        nativeButton={false}
      >
        <ArrowLeft />
        All courses
      </Button>

      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm">
        <div className="absolute -right-14 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <CardHeader className="relative gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="size-7" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-2xl font-semibold">
                  {course.title}
                </CardTitle>
                <Badge variant={course.isActive ? 'default' : 'secondary'}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription className="max-w-2xl text-sm">
                {course.description ||
                  'No course description has been added yet.'}
              </CardDescription>
              {course.slug && (
                <p className="text-xs text-muted-foreground">/{course.slug}</p>
              )}
            </div>
          </div>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil />
            Update course
          </Button>
        </CardHeader>

        <CardContent className="relative grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <CourseMetric
            icon={<IndianRupee />}
            label="Course price"
            value={money.format(course.price)}
          />
          <CourseMetric
            icon={<Clock3 />}
            label="Duration"
            value={`${course.durationInMonths ?? '—'} months`}
          />
          <CourseMetric
            icon={<BookOpen />}
            label="Language"
            value={course.language || 'Not specified'}
          />
          <CourseMetric
            icon={<CalendarDays />}
            label="Created"
            value={
              course.createdAt
                ? new Date(course.createdAt).toLocaleDateString()
                : '—'
            }
          />
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Update course</DialogTitle>
            <DialogDescription>
              Edit the course information and availability.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-5">
            <fieldset
              disabled={updateMutation.isPending}
              className="grid gap-4 sm:grid-cols-2"
            >
              <label className="space-y-2 text-sm sm:col-span-2">
                <span>Course title</span>
                <Input
                  name="title"
                  defaultValue={course.title}
                  minLength={2}
                  required
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span>Description</span>
                <textarea
                  name="description"
                  defaultValue={course.description ?? ''}
                  rows={4}
                  className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Language</span>
                <NativeSelect
                  name="language"
                  defaultValue={course.language || 'english'}
                  required
                >
                  <NativeSelectOption value="english">
                    English
                  </NativeSelectOption>
                  <NativeSelectOption value="hindi">Hindi</NativeSelectOption>
                  <NativeSelectOption value="both">
                    English & Hindi
                  </NativeSelectOption>
                </NativeSelect>
              </label>
              <label className="space-y-2 text-sm">
                <span>Duration (months)</span>
                <Input
                  name="durationInMonths"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={course.durationInMonths ?? 1}
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Price (₹)</span>
                <Input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={course.price}
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Status</span>
                <NativeSelect
                  name="isActive"
                  defaultValue={String(course.isActive ?? true)}
                >
                  <NativeSelectOption value="true">Active</NativeSelectOption>
                  <NativeSelectOption value="false">
                    Inactive
                  </NativeSelectOption>
                </NativeSelect>
              </label>
            </fieldset>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function CourseMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background/80 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-semibold">{value}</p>
      </div>
    </div>
  )
}
