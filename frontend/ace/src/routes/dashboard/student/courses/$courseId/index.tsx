import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { fetchVideo } from '#/api/student';
import { Link } from '@tanstack/react-router';
import {toast} from 'sonner';
import { getErrorMessage } from '#/lib/get-error-message';
import ErrorPage from '#/components/Error';
import { Folder } from 'lucide-react';
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
    enabled: !!courseId,
  })
  if(isError){
    toast.error(getErrorMessage(error))
  }
  if (isLoading) return <p>Loading...</p>
  if(isError) return <ErrorPage message={getErrorMessage(error)} title={'Unauthorized Access.'}/>
  const course = data?.data;
  const categories = [...new Set(course?.videos.map((v) => v.category))]
  return (
    <div className="container">
      <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category}
          type="button"
          className="px-2 rounded-md border text-lg w-75 font-medium hover:bg-primary hover:text-white py-5 text-center flex items-center gap-2"
          to={ category}
        >
          <Folder/>{category.toUpperCase()}
        </Link>
      ))}
    </div>
    </div>

  )
}