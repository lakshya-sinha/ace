import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRef } from 'react'
import { registerCourse } from '@/api/admin'

export const Route = createFileRoute('/dashboard/admin/add-course')({
  component: RouteComponent,
})

function RouteComponent() {
  const formRef = useRef<HTMLFormElement>(null)
  const registerMutation = useMutation({
      mutationFn: registerCourse,
      onSuccess: (response) => {
        toast.success(response.message)
        formRef.current?.reset()
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    registerMutation.mutate(new FormData(event.currentTarget))
  }
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Add Course</h1>
        <p className="text-muted-foreground">
          Enter the course details to create course.
        </p>
      </div>
       <form
        ref={formRef}
        className="space-y-6"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
          <label className="space-y-2 text-sm">
            <span>Course Title</span>
            <Input name="title" type="text" autoComplete="title" required />
          </label>
          <label className="space-y-2 text-sm">
            <span>description</span>
            <Input name="description" type="text" autoComplete="description" required />
          </label>
          <label className="space-y-2 text-sm">
            <span>language</span>
            <Input name="language" type="text" autoComplete="language" required />
          </label>
          <label className="space-y-2 text-sm">
            <span>Duration In Months</span>
            <Input
              name="duration"
              type="number"
              autoComplete="duration"
              required
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Course Price</span>
            <Input name="price" type="number" autoComplete="price" />
          </label>
        <Button
          type="submit"
          disabled={
            registerMutation.isPending
          }
          className="mt-2"
        >
          {registerMutation.isPending
            ? 'Registering course...'
            : 'Register course'}
        </Button>
      </form>
    </section>
  )
}
