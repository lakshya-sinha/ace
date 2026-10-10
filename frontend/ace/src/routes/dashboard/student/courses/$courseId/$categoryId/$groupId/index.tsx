import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { fetchVideo } from '#/api/student';
import { getErrorMessage } from '@/lib/get-error-message';
import ErrorPage  from '@/components/Error';
import { FileVideoIcon } from 'lucide-react';

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
  if(isError) return <ErrorPage message={getErrorMessage(error)} title={'Unauthorized Access.'}/>
  const course = data?.data;

  return (
    <div className="flex flex-wrap gap-2">
    {course?.videos.map((elem) => (
      <a
        key={elem._id}
        type="button"
        className="flex gap-2 px-2 rounded-md border text-lg w-full font-medium hover:bg-primary hover:text-white cursor-pointer py-5 text-center"
      >
        <FileVideoIcon/>{elem.title}
      </a>
    ))}
  </div>
  )
}
