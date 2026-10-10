import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { fetchVideo } from '#/api/admin';
import { Link } from '@tanstack/react-router';
export const Route = createFileRoute('/dashboard/student/courses/$courseId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const categoryId = "NA";
  const groupId= "NA";
  const {courseId} = Route.useParams();
  const {data, isError, isLoading,  error} = useQuery({
    queryKey: ['courseId', courseId],
    queryFn: ()=> fetchVideo(courseId!, categoryId, groupId),
    enabled: !!courseId
  })
  if (isLoading) return <p>Loading...</p>
  if(isError) return <p> {error.message} </p> 
  const course = data?.data;
  const categories = [...new Set(course?.videos.map((v) => v.category))]
  return (
    <div className="flex flex-wrap gap-2">
    {categories.map((category) => (
      <Link
        key={category}
        type="button"
        className="rounded-md border text-lg w-full font-medium hover:bg-muted py-5 text-center"
        to={ category}
      >
        {category.toUpperCase()}
      </Link>
    ))}
  </div>
  )
}