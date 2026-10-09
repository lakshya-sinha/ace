import { useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getCourses, registerStudent } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { getErrorMessage } from '@/lib/get-error-message'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  GraduationCap,
  LockKeyhole,
  MessageSquareText,
  Paperclip,
  RefreshCw,
  SlidersHorizontal,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { useAuth } from '#/lib/auth-context'

export const Route = createFileRoute('/dashboard/admin/add-student')({
  component: AddStudentPage,
})

function AddStudentPage() {
  const { user } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const coursesQuery = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: getCourses,
  })
  const [discount, setDiscount] = useState(0)
  const [isFemale, setIsFemale] = useState(false)

  const registerMutation = useMutation({
    mutationFn: registerStudent,
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
      <div className="space-y-2 flex items-center justify-center flex-col">
        <h1 className="flex items-center gap-2 text-5xl  font-bold ">
          <img src="/logo.jpg" className="w-10" />
          ACE
        </h1>
        <div>
          <div className="flex items-center gap-2 justify-center border-1 p-2 text-sm bg-primary text-white font-bold shadow-xs">
            <UserPlus />
            Add Student Module
          </div>
        </div>
      </div>
      <hr />

      {coursesQuery.isError && (
        <div className="space-y-2 rounded-md border border-destructive/50 p-4 text-sm">
          <p>{getErrorMessage(coursesQuery.error)}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void coursesQuery.refetch()}
          >
            <RefreshCw aria-hidden="true" className="mr-2 size-4" />
            Retry loading courses
          </Button>
        </div>
      )}

      <form
        ref={formRef}
        className="space-y-6"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <fieldset
          className="flex flex-col gap-4"
          disabled={registerMutation.isPending}
        >
          {/* //Authenticatoin fieldset */}
          <fieldset className="border-1 col-span-2 p-2 bg-secondary flex flex-col gap-4">
            <legend className="flex items-center gap-2 px-4 py-1 rounded-lg bg-primary text-white">
              <LockKeyhole aria-hidden="true" className="size-4" />
              Authentication Details
            </legend>

            <label className="space-y-2 text-sm">
              <span>Full name</span>
              <Input name="fullName" autoComplete="name" required />
            </label>
            <label className="space-y-2 text-sm">
              <span>Username</span>
              <Input name="username" autoComplete="username" required />
            </label>
            <label className="space-y-2 text-sm">
              <span>Email</span>
              <Input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="space-y-2 text-sm">
              <span>Password</span>
              <Input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={5}
                required
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Aadhar Number</span>
              <Input
                name="aadhaarNo"
                type="number"
                autoComplete="new-password"
                maxLength={12}
                required
              />
            </label>
          </fieldset>
          {/* //Personal fieldset */}
          <fieldset className="border-1 col-span-2 p-2 bg-secondary flex flex-col gap-4">
            <legend className="flex items-center gap-2 px-4 py-1 rounded-lg bg-primary text-white">
              <UserRound aria-hidden="true" className="size-4" />
              Personal Details
            </legend>

            <label className="space-y-2 text-sm">
              <span>Personal mobile number</span>
              <Input
                name="contactNo"
                type="tel"
                autoComplete="tel"
                maxLength={10}
                minLength={10}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>CareOf mobile number</span>
              <Input
                name="careOfNumber"
                type="tel"
                autoComplete="tel"
                maxLength={10}
                minLength={10}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Date of birth</span>
              <Input name="dob" type="date" />
            </label>
            <label className="space-y-2 text-sm">
              <span>Mother&apos;s name</span>
              <Input name="mothersName" />
            </label>
            <div className="grid grid-cols-2 gap-2 w-full">
              <label className="space-y-2 text-sm ">
                <span>C/O Type</span>
                <NativeSelect
                  name="careOfTitle"
                  defaultValue=""
                  className="w-full"
                >
                  <NativeSelectOption value="" disabled>
                    Select C/O Type
                  </NativeSelectOption>
                  <NativeSelectOption value="father">Father</NativeSelectOption>
                  <NativeSelectOption value="guardian">
                    Guardian
                  </NativeSelectOption>
                </NativeSelect>
              </label>
              <label className="space-y-2 text-sm w-50 w-full">
                <span>C/O</span>
                <Input name="careOfName" />
              </label>
            </div>
            <div className="flex gap-2">
              <label className="space-y-2 text-sm w-full">
                <span>Gender</span>
                <NativeSelect
                  name="gender"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value === 'female') {
                      setIsFemale(true)
                    } else {
                      setIsFemale(false)
                    }
                  }}
                  className="w-full"
                >
                  <NativeSelectOption value="" disabled>
                    Select gender
                  </NativeSelectOption>
                  <NativeSelectOption value="male">Male</NativeSelectOption>
                  <NativeSelectOption value="female">Female</NativeSelectOption>
                  <NativeSelectOption value="other">Other</NativeSelectOption>
                </NativeSelect>
              </label>
              <label
                className="space-y-2 text-sm "
                style={{ display: isFemale ? 'block' : 'none' }}
              >
                <span> Husband&apos;s Name</span>
                <Input name="spouseName" />
              </label>
            </div>

            <label className=" text-sm flex flex-col col-span-full">
              <span>Address</span>
              <textarea
                name="address"
                id="address"
                className="p-2 border-1"
              ></textarea>
            </label>

            <label className="text-sm flex flex-col w-full">
              <span>Type</span>
              <NativeSelect
                name="type"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value !== 'student') {
                    alert(`Are you sure. Type : ${e.target.value}`)
                  }
                }}
                className="w-full"
              >
                <NativeSelectOption value="" disabled>
                  Select Type
                </NativeSelectOption>
                <NativeSelectOption value="student" selected>
                  Student
                </NativeSelectOption>
                <NativeSelectOption value="teacher">Teacher</NativeSelectOption>
              </NativeSelect>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-2 text-sm">
                <span>Course</span>
                <NativeSelect
                  name="courseId"
                  className="w-full"
                  defaultValue=""
                  required
                  disabled={coursesQuery.isPending || coursesQuery.isError}
                >
                  <NativeSelectOption value="" disabled>
                    {coursesQuery.isPending
                      ? 'Loading courses...'
                      : 'Select a course'}
                  </NativeSelectOption>
                  {coursesQuery.data?.map((course) => (
                    <NativeSelectOption key={course._id} value={course._id}>
                      {course.title} - price: ₹{course.price} -  Final: ₹
                      {course.price - (discount / 100) * course.price}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {coursesQuery.isSuccess && coursesQuery.data.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    No active courses are available.
                  </span>
                )}
              </label>
              <label className="space-y-2 text-sm">
                <span>Discount percentage</span>
                <Input
                  name="discountPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue="0"
                  onChange={(e) => {
                    setDiscount(Number(e.target.value))
                  }}
                />
              </label>
            </div>
          </fieldset>
          {/* qualificatoin fieldset */}
          <fieldset className="border-1 col-span-2 p-2 bg-secondary flex flex-col gap-4">
            <legend className="flex items-center gap-2 px-4 py-1 rounded-lg bg-primary text-white">
              <GraduationCap aria-hidden="true" className="size-4" />
              Qualification Details
            </legend>
            <Table>
              {/* <TableCaption>all the details is mendatory.</TableCaption> */}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Examination</TableHead>
                  <TableHead>Board/Univ.</TableHead>
                  <TableHead>School/Collage</TableHead>
                  <TableHead>Passing Year</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="">10th</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="matricBoard"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="matricSchool"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      name="matricPassingYear"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="matricPercentage"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>12th</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="interBoard"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="interSchool"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      name="interPassingYear"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="interPercentage"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Graduation</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="graduationBoard"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="graduationCollege"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      name="graduationPassingYear"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="graduationPercentage"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="">Other..</TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="otherBoard"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="otherCollege"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      name="otherPassingYear"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="text"
                      name="otherPercentage"
                      className="w-full p-2 border-1 "
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </fieldset>
          {/* //attachment fieldset */}
          <fieldset className="border-1 col-span-2 p-2 bg-secondary flex flex-col gap-4">
            <legend className="flex items-center gap-2 px-4 py-1 rounded-lg bg-primary text-white">
              <Paperclip aria-hidden="true" className="size-4" />
              Attachments
            </legend>

            <label className="space-y-2 text-sm">
              <span>Avatar (JPG, PNG, or WEBP; max 5 MB)</span>
              <Input
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Signature (JPG, PNG, or WEBP; max 5 MB)</span>
              <Input
                name="signature"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
          </fieldset>
        </fieldset>
        {/* permissions fieldset */}
        <fieldset
          className="border-1 col-span-2 p-2 bg-secondary flex flex-col gap-4"
          disabled={registerMutation.isPending}
        >
          <legend className="flex items-center gap-2 px-4 py-1 rounded-lg bg-primary text-white">
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            Permissions
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="isEnglishTyping"
              type="checkbox"
              value="true"
              className="size-4 accent-primary"
            />
            English typing
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="isHindiTyping"
              type="checkbox"
              value="true"
              className="size-4 accent-primary"
            />
            Hindi typing
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="locked"
              type="checkbox"
              value="false"
              className="size-4 accent-primary"
            />
            Locked
          </label>
        </fieldset>

        <fieldset
          className="border-1 col-span-2 p-2 bg-secondary flex flex-col gap-4"
          disabled={registerMutation.isPending}
        >
          <legend className="flex items-center gap-2 px-4 py-1 rounded-lg bg-primary text-white">
            <MessageSquareText aria-hidden="true" className="size-4" />
            Remarks
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <Badge variant="destructive">
              <input name="createdBy" type="text" value={user?.username} />
            </Badge>
          </label>
          <textarea
            name="remarks"
            className="border-1 p-2 text-sm"
          />
        </fieldset>

        <Button
          type="submit"
          className="w-full cursor-pointer "
          disabled={
            registerMutation.isPending ||
            coursesQuery.isPending ||
            coursesQuery.isError ||
            coursesQuery.data.length === 0
          }
        >
          <UserPlus aria-hidden="true" className="mr-2 size-4" />
          {registerMutation.isPending
            ? 'Registering student...'
            : 'Register student'}
        </Button>
      </form>
    </section>
  )
}
