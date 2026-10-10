import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { fetchVideo } from '#/api/admin';
export const Route = createFileRoute('/dashboard/student/courses/$courseId/$categoryId/$groupId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {categoryId, courseId, groupId} = Route.useParams();
  const {data, isError, isLoading,  error} = useQuery({
    queryKey: ['nothing'],
    queryFn: ()=> fetchVideo(courseId, categoryId, groupId!),
    enabled: !!groupId
  })
  if (isLoading) return <p>Loading...</p>
  if(isError) return <p> {error.message} </p> 
  const course = data?.data;

  return (
    <div className="flex flex-wrap gap-2">
    {course?.videos.map((elem) => (
      <a
        key={elem._id}
        type="button"
        className="rounded-md border text-lg w-full font-medium hover:bg-muted py-5 text-center"
      >
        {elem.title}
      </a>
    ))}
  </div>
  )
}
