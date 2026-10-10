import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { fetchVideo } from '#/api/admin';
import { Link } from '@tanstack/react-router';
export const Route = createFileRoute('/dashboard/student/courses/$courseId/$categoryId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const groupId = "NA";
  const {categoryId, courseId} = Route.useParams();
  const {data, isError, isLoading,  error} = useQuery({
    queryKey: ['nothing'],
    queryFn: ()=> fetchVideo(courseId, categoryId, groupId!),
    enabled: !!categoryId
  })
  if (isLoading) return <p>Loading...</p>
  if(isError) return <p> {error.message} </p> 
  const course = data?.data;
  const categories = [...new Set(course?.videos.map((v) => v.group))]

  return (
    <div className="flex flex-wrap gap-2">
    {categories.map((group) => (
      <Link
        key={group}
        type="button"
        className="rounded-md border text-lg w-full font-medium hover:bg-muted py-5 text-center"
        to={group}
      >
        {group.toUpperCase()}
      </Link>
    ))}
  </div>
  )
}
