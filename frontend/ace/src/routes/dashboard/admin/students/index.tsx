import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getStudents } from '@/api/admin'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getErrorMessage } from '@/lib/get-error-message'

export const Route = createFileRoute('/dashboard/admin/students/')({
  component: StudentsPage,
})

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function StudentsPage() {
  const [page, setPage] = useState(1)
  const studentsQuery = useQuery({
    queryKey: ['admin', 'students', page, 10],
    queryFn: () => getStudents(page, 10),
  })
  const pageData = studentsQuery.data?.data

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-muted-foreground">
            {pageData
              ? `${pageData.total} students`
              : 'Browse student profiles and course fees.'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void studentsQuery.refetch()}
          disabled={studentsQuery.isFetching}
        >
          Refresh
        </Button>
      </header>

      {studentsQuery.isPending ? (
        <p role="status">Loading students...</p>
      ) : studentsQuery.isError ? (
        <div className="space-y-3 rounded-md border p-4">
          <p role="alert">{getErrorMessage(studentsQuery.error)}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void studentsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : pageData && pageData.students.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Email verified</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Total paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">
                      {student.fullName || student.username}
                      <span className="block text-muted-foreground">
                        @{student.username}
                      </span>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.contactNo || '—'}</TableCell>
                    <TableCell>{student.gender || '—'}</TableCell>
                    <TableCell>
                      {student.isEmailVerified ? 'Verified' : 'Not verified'}
                    </TableCell>
                    <TableCell>{student.locked ? 'Locked' : 'Unlocked'}</TableCell>
                    <TableCell>{student.createdBy || '—'}</TableCell>
                    <TableCell>
                      {student.courses.filter(Boolean).join(', ') || 'None'}
                    </TableCell>
                    <TableCell>{money.format(student.totalPaid)}</TableCell>
                    <TableCell>{money.format(student.totalDue)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={
                          <Link
                            to="/dashboard/admin/students/$studentId"
                            params={{ studentId: student._id }}
                          />
                        }
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Page {pageData.page} of {Math.max(pageData.totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pageData.page <= 1 || studentsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={
                  pageData.page >= pageData.totalPages ||
                  studentsQuery.isFetching
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, pageData.totalPages),
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-md border p-6 text-center text-muted-foreground">
          No students found.
        </p>
      )}
    </section>
  )
}
