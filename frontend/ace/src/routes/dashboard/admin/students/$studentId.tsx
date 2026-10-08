import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

import {
  addInstallment,
  assignCourse,
  deassignCourse,
  deleteInstallment,
  getCourses,
  getStudent,
  updateStudent,
} from '@/api/admin'
import type {
  StudentDetails,
  StudentEnrollment,
  StudentInstallment,
} from '@/api/admin'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getErrorMessage } from '@/lib/get-error-message'
import { PrinterIcon, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard/admin/students/$studentId')({
  component: StudentDetailsPage,
})

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

function escapeHtml(value: string | number | undefined) {
  return String(value ?? '—').replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })
}

function getImageUrl(path?: string) {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${api.defaults.baseURL?.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function StudentDetailsPage() {
  const { studentId } = Route.useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [installmentEnrollment, setInstallmentEnrollment] =
    useState<StudentEnrollment | null>(null)
  const detailQueryKey = ['admin', 'student', studentId]
  const studentQuery = useQuery({
    queryKey: detailQueryKey,
    queryFn: () => getStudent(studentId),
  })
  const refreshStudent = () =>
    queryClient.invalidateQueries({ queryKey: detailQueryKey })

  const editMutation = useMutation({
    mutationFn: (updates: FormData) => updateStudent(studentId, updates),
    onSuccess: (response) => {
      toast.success(response.message)
      setEditOpen(false)
      void refreshStudent()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const assignMutation = useMutation({
    mutationFn: (input: { courseId: string; discountPercent: number }) =>
      assignCourse(studentId, input),
    onSuccess: (response) => {
      toast.success(response.message)
      setAssignOpen(false)
      void refreshStudent()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const installmentMutation = useMutation({
    mutationFn: ({
      enrollmentId,
      input,
    }: {
      enrollmentId: string
      input: { amount: number; mode: string; paidOn: string; note: string }
    }) => addInstallment(studentId, enrollmentId, input),
    onSuccess: (response) => {
      toast.success(response.message)
      setInstallmentEnrollment(null)
      void refreshStudent()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteInstallmentMutation = useMutation({
    mutationFn: ({
      enrollmentId,
      installmentId,
    }: {
      enrollmentId: string
      installmentId: string
    }) => deleteInstallment(studentId, enrollmentId, installmentId),
    onSuccess: (response) => {
      toast.success(response.message)
      void refreshStudent()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deassignMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      deassignCourse(studentId, enrollmentId),
    onSuccess: (response) => {
      toast.success(response.message)
      void refreshStudent()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const student = studentQuery.data?.data

  if (studentQuery.isPending) {
    return <p role="status">Loading student...</p>
  }

  if (studentQuery.isError || !student) {
    return (
      <section className="space-y-4">
        <p role="alert">
          {studentQuery.error
            ? getErrorMessage(studentQuery.error)
            : 'Student not found.'}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void studentQuery.refetch()}
        >
          Retry
        </Button>
        <Button
          render={<Link to="/dashboard/admin/students" />}
          variant="ghost"
        >
          Back to students
        </Button>
      </section>
    )
  }

  function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    for (const name of [
      'isEnglishTyping',
      'isHindiTyping',
      'isEmailVerified',
      'locked',
    ]) {
      formData.set(name, String(formData.has(name)))
    }
    editMutation.mutate(formData)
  }

  function submitAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    assignMutation.mutate({
      courseId: String(formData.get('courseId') ?? ''),
      discountPercent: Number(formData.get('discountPercent') ?? 0),
    })
  }

  function submitInstallment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!installmentEnrollment) return
    const formData = new FormData(event.currentTarget)
    installmentMutation.mutate({
      enrollmentId: installmentEnrollment.enrollmentId,
      input: {
        amount: Number(formData.get('amount') ?? 0),
        mode: String(formData.get('mode') ?? 'cash'),
        paidOn: String(formData.get('paidOn') ?? ''),
        note: String(formData.get('note') ?? ''),
      },
    })
  }

  function handleDeleteInstallment(
    enrollmentId: string,
    installmentId: string,
  ) {
    if (!window.confirm('Delete this installment payment?')) return
    deleteInstallmentMutation.mutate({ enrollmentId, installmentId })
  }

 function handlePrintApplication() {
  const printWindow = window.open('', '_blank', 'width=900,height=1100')
  if (!printWindow) {
    toast.error('Allow pop-ups to print the student application.')
    return
  }

  printWindow.opener = null

  type FieldValue = string | number | boolean | undefined | null

  // Safe, escaped display value ("—" when empty)
  const esc = (value: FieldValue) => {
    if (value === undefined || value === null || value === '') return '—'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return escapeHtml(String(value))
  }

  // Two label/value pairs per row
  const fields = (items: Array<[string, FieldValue]>) => {
    const rows: string[] = []
    for (let i = 0; i < items.length; i += 2) {
      const cell = ([label, value]: [string, FieldValue]) =>
        `<th>${escapeHtml(label)}</th><td>${esc(value)}</td>`
      const second = items[i + 1]
      rows.push(`<tr>${cell(items[i])}${second ? cell(second) : '<th></th><td></td>'}</tr>`)
    }
    return rows.join('')
  }

  const fathersName = student?.careOfTitle === "father" ? student?.careOfName : "";
  const careOfName = student?.careOfTitle === "guardian" ? student?.careOfName : "";

  const section = (title: string, items: Array<[string, FieldValue]>) =>
    `<section class="form-section"><h2>${escapeHtml(title)}</h2><table><tbody>${fields(items)}</tbody></table></section>`

  const qualifications: FieldValue[][] = [
    ['10th', student?.matricBoard, student?.matricSchool, student?.matricPassingYear, student?.matricPercentage],
    ['12th', student?.interBoard, student?.interSchool, student?.interPassingYear, student?.interPercentage],
    ['Graduation', student?.graduationBoard, student?.graduationCollege, student?.graduationPassingYear, student?.graduationPercentage],
    ['Other', student?.otherBoard, student?.otherCollege, student?.otherPassingYear, student?.otherPercentage],
  ]
  const qualificationRows = qualifications
    .map(
      ([level, board, institution, year, percentage]) =>
        `<tr><th>${esc(level)}</th><td>${esc(board)}</td><td>${esc(institution)}</td><td>${esc(year)}</td><td>${esc(percentage)}</td></tr>`,
    )
    .join('')

  const logoUrl = `${window.location.origin}/logo.jpg`
  const avatarUrl = getImageUrl(student?.avatar?.url)
  const signatureUrl = getImageUrl(student?.signature?.url)

  const imageBox = (cls: string, caption: string, src?: string) =>
    `<div class="image-box ${cls}">
       <div class="image-frame">${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}">` : '<span>Not provided</span>'}</div>
       <div class="image-caption">${escapeHtml(caption)}</div>
     </div>`

  const registrationDate = formatDate(student?.createdAt)
  const generatedOn = escapeHtml(new Date().toLocaleString())
  const generatedBy = user?.username ? ` · Generated by ${escapeHtml(user.username)}` : ''

  const header = `
    <header class="masthead">
      <div class="brand-wrap">
        <img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo">
        <div>
          <div class="brand">ACADEMY OF COMPUTER EDUCATION</div>
          <div class="subtitle">STS COMPUTER EDUCATION</div>
        </div>
      </div>
      <div class="reg-box">
        <span>REGISTRATION DATE</span>
        <strong>${esc(registrationDate)}</strong>
      </div>
    </header>`

  const footer = (pageNo: number) =>
    `<footer class="footer">Generated on ${generatedOn}${generatedBy} · Page ${pageNo} of 2</footer>`

  // Rules (Hindi) — edit freely
  const mainRules = [
    'सभी को सेंटर में अनुशासन का पालन करना है।',
    'प्रत्येक दिन अपनी आईडी पहनकर आना है।',
    'बिना किसी पूर्व सूचना के वर्ग में अनुपस्थित नहीं होना है।',
    'अपने वर्ग के समय पर ही लैब जॉइन करना है।',
    'क्लास के दौरान अपने मोबाइल का उपयोग न करें।',
    'अपने साथ किसी भी तरह का सामान लेकर क्लास में प्रवेश न करें।',
  ]

  const generalRules = [
    'प्रत्येक विद्यार्थी को निर्धारित शुल्क समय पर जमा करना अनिवार्य है।',
    'कंप्यूटर, कीबोर्ड, माउस एवं अन्य उपकरणों का सावधानीपूर्वक उपयोग करें; क्षति होने पर उसकी भरपाई विद्यार्थी को करनी होगी।',
    'लैब एवं कक्षा में स्वच्छता बनाए रखें तथा खाने-पीने की वस्तुएँ अंदर न लाएँ।',
    'शिक्षकों, स्टाफ एवं साथी विद्यार्थियों के साथ सभ्य और सम्मानजनक व्यवहार करें।',
    'बिना अनुमति के किसी भी सॉफ्टवेयर को इंस्टॉल, डिलीट या सिस्टम की सेटिंग में बदलाव न करें।',
    'परीक्षा एवं टेस्ट में अनुचित साधनों का प्रयोग करना सख्त मना है।',
    'छुट्टी या अवकाश की स्थिति में पूर्व सूचना देकर अनुमति लेना आवश्यक है।',
    'नियमों का उल्लंघन करने पर संस्था द्वारा चेतावनी, जुर्माना या प्रवेश निरस्त करने की कार्यवाही की जा सकती है।',
    'संस्था को आवश्यकतानुसार नियमों में परिवर्तन करने का पूर्ण अधिकार है।',
  ]

  const list = (items: string[]) => `<ol>${items.map((r) => `<li>${r}</li>`).join('')}</ol>`

  printWindow.document.open()
  printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Student Application - ${esc(student?.fullName || student?.username)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #eef2f7; color: #1f2937; font: 13px Arial, Helvetica, 'Noto Sans Devanagari', 'Nirmala UI', Mangal, sans-serif; }
    .page { position: relative; width: 210mm; min-height: 297mm; margin: 18px auto; padding: 12mm 14mm 16mm; background: #fff; box-shadow: 0 2px 14px #94a3b855; }

    /* Header */
    .masthead { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding-bottom: 12px; border-bottom: 3px solid #17365d; }
    .brand-wrap { display: flex; align-items: center; gap: 12px; }
    .logo { width: 62px; height: 62px; object-fit: contain; }
    .brand { color: #17365d; font: 700 21px Georgia, serif; letter-spacing: .4px; }
    .subtitle { margin-top: 4px; color: #4b5563; font-size: 11px; letter-spacing: 1.2px; }
    .reg-box { min-width: 120px; padding: 7px 10px; border: 1px solid #17365d; background: #f1f5f9; text-align: center; }
    .reg-box span { display: block; color: #475569; font-size: 9px; letter-spacing: .8px; }
    .reg-box strong { display: block; margin-top: 3px; color: #17365d; font-size: 13px; }

    .form-title { margin: 14px 0; padding: 9px; border: 1px solid #17365d; background: #f1f5f9; color: #17365d; text-align: center; }
    .form-title h1 { margin: 0; font-size: 17px; letter-spacing: 1px; }
    .form-title p { margin: 5px 0 0; color: #475569; font-size: 10px; }

    /* Identity: left = application id / name, right = photo + signature */
    .identity { display: flex; justify-content: space-between; align-items: stretch; gap: 14px; margin-bottom: 4px; }
    .identity-info { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 8px; }
    .id-card { padding: 9px 12px; border: 1px solid #94a3b8; background: #f8fafc; }
    .id-card span { display: block; color: #64748b; font-size: 9px; letter-spacing: .8px; }
    .id-card strong { display: block; margin-top: 3px; color: #17365d; font-size: 13px; word-break: break-all; }
    .id-card.name strong { font-size: 15px; }
    .image-box { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .image-frame { display: grid; place-items: center; overflow: hidden; border: 1px solid #64748b; background: #f8fafc; color: #94a3b8; font-size: 9px; }
    .image-frame img { width: 100%; height: 100%; object-fit: cover; }
    .photo .image-frame { width: 32mm; height: 40mm; }
    .sign .image-frame { width: 42mm; height: 40mm; }
    .sign .image-frame img { object-fit: contain; padding: 4px; }
    .image-caption { color: #475569; font-size: 9px; font-weight: 700; letter-spacing: .6px; }
    .images { display: flex; gap: 10px; }

    /* Sections */
    .form-section { margin-top: 12px; break-inside: avoid; }
    .form-section h2 { margin: 0; padding: 7px 9px; border: 1px solid #17365d; background: #e8eef5; color: #17365d; font-size: 12px; letter-spacing: .4px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; }
    .form-section td, .form-section th { padding: 7px 8px; border: 1px solid #cbd5e1; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
    .form-section th { width: 16%; background: #f8fafc; color: #475569; font-size: 10px; font-weight: 700; }
    .form-section td { width: 34%; }
    .qualifications th, .qualifications td { width: auto; }
    .qualifications thead th { background: #f1f5f9; color: #17365d; }
    .qualifications tbody th { width: 17%; color: #1f2937; }

    /* Declaration */
    .declaration { margin-top: 14px; padding: 10px 12px; border: 1px solid #17365d; break-inside: avoid; }
    .declaration h2 { margin: 0 0 6px; color: #17365d; font-size: 12px; letter-spacing: .4px; text-transform: uppercase; }
    .declaration p { margin: 0; line-height: 1.7; font-size: 9px; }
    .signatures { display: flex; justify-content: space-between; gap: 24px; margin-top: 44px; break-inside: avoid; }
    .declarationfirst {font-size: 8px;}

    /* Page 2 */
    .rules-title { margin: 16px 0 12px; padding: 9px; border: 1px solid #17365d; background: #f1f5f9; color: #17365d; text-align: center; }
    .rules-title h1 { margin: 0; font-size: 17px; }
    .rules-title p { margin: 4px 0 0; font-size: 11px; color: #475569; }
    .rules h3 { margin: 16px 0 6px; padding: 6px 9px; border-left: 4px solid #17365d; background: #e8eef5; color: #17365d; font-size: 13px; }
    .rules ol { margin: 0; padding-left: 22px; }
    .rules li { margin-bottom: 8px; line-height: 1.7; font-size: 13px; }
    .rules-accept { margin-top: 18px; font-size: 12px; line-height: 1.7; }

    .footer { position: absolute; left: 14mm; right: 14mm; bottom: 8mm; padding-top: 6px; border-top: 1px solid #cbd5e1; color: #64748b; font-size: 9px; text-align: center; }

    @page { size: A4 portrait; margin: 0; }
    @media print {
      body { background: #fff; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { width: 210mm; height: 297mm; min-height: 0; margin: 0; box-shadow: none; overflow: hidden; page-break-after: always; break-after: page; }
      .page:last-child { page-break-after: auto; break-after: auto; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: Application -->
  <main class="page">
    ${header}
    <div class="form-title"><h1>STUDENT APPLICATION FORM</h1><p>STUDENT PROFILE AND QUALIFICATION RECORD</p></div>

    <div class="identity">
      <div class="identity-info">
        <div class="id-card"><span>APPLICATION ID</span><strong>${esc(student?._id)}</strong></div>
        <div class="id-card name"><span>STUDENT NAME</span><strong>${esc(student?.fullName || student?.username)}</strong></div>
      </div>
      <div class="images">
        ${imageBox('photo', 'PHOTOGRAPH', avatarUrl)}
        ${imageBox('sign', 'SIGNATURE', signatureUrl)}
      </div>
    </div>

    ${section('Account details', [
      ['Full name', student?.fullName],
      ['Username', student?.username],
      ['Email address', student?.email],
      ['Account type', student?.type],
      ['Contact number', student?.contactNo],
      ['Gender', student?.gender],
      ['Date of birth', formatDate(student?.dob)],
      ['Created by', student?.createdBy],
    ])}

    ${section('Personal and family details', [
      ["Father's name", fathersName],
      ["Mother's name", student?.mothersName],
      ['Spouse name', student?.spouseName],
      ['Care of name', careOfName],
      ['Care of number', student?.careOfNumber],
      ['Aadhaar number', student?.aadhaarNo],
      ['Remarks', student?.remarks],
      ['Address', student?.address],
    ])}

    <section class="form-section qualifications">
      <h2>Educational qualifications</h2>
      <table>
        <thead><tr><th>Examination</th><th>Board / University</th><th>School / College</th><th>Passing year</th><th>Percentage</th></tr></thead>
        <tbody>${qualificationRows}</tbody>
      </table>
    </section>

    <section class="declaration">
      <h2>Declaration / घोषणा</h2>
      <p class="declarationfirst">
        मैं घोषणा करता/करती हूँ कि इस आवेदन पत्र में दी गई सभी जानकारी मेरी जानकारी के अनुसार सत्य एवं सही है।
        मैं संस्था के सभी नियमों एवं अनुशासन का पालन करूँगा/करूँगी। किसी भी जानकारी के गलत पाए जाने पर
        संस्था द्वारा मेरा प्रवेश निरस्त किया जा सकता है, जिसके लिए मैं स्वयं उत्तरदायी रहूँगा/रहूँगी।
      </p>
    </section>

    <div class="signatures">
      <div class="signature-line">Student signature / विद्यार्थी के हस्ताक्षर</div>
    </div>
    ${footer(1)}
  </main>

  <!-- PAGE 2: Rules and regulations -->
  <main class="page">
    ${header}
    <div class="rules-title">
      <h1>सामान्य निर्देश एवं नियम</h1>
      <p>GENERAL INSTRUCTIONS AND RULES &amp; REGULATIONS</p>
    </div>

    <div class="rules">
      <h3>आवश्यक नियम</h3>
      ${list(mainRules)}

      <h3>अन्य सामान्य निर्देश</h3>
      ${list(generalRules)}

      <p class="rules-accept">
        मैंने उपर्युक्त सभी निर्देशों एवं नियमों को पढ़ और समझ लिया है तथा मैं इनका पूर्ण रूप से पालन करने की सहमति देता/देती हूँ।
      </p>
    </div>

    <div class="signatures">
      <div class="signature-line">Student signature / विद्यार्थी के हस्ताक्षर</div>
      <div class="signature-line">Guardian signature / अभिभावक हस्ताक्षर</div>
    </div>
    ${footer(2)}
  </main>

  <script>
    window.addEventListener('load', function () { window.focus(); window.print(); });
    window.addEventListener('afterprint', function () { window.close(); });
  </script>
</body>
</html>`)
  printWindow.document.close()
}

  function handlePrintInstallment(
    enrollment: StudentEnrollment,
    installment: StudentInstallment,
  ) {
    const printWindow = window.open('', '_blank', 'width=900,height=700')

    if (!printWindow) {
      toast.error('Allow pop-ups to print the installment receipt.')
      return
    }

    printWindow.opener = null

    // ---------------------------------------------------------
    // DATA
    // ---------------------------------------------------------

    const studentName = student?.fullName || student?.username || ''
    const fatherName = student?.careOfTitle == "father" ? student?.careOfName : "";
    const mobile = student?.contactNo || ''
    const course = enrollment.course?.title || ''
    const receiptNo = installment.receiptNo || `#${installment.number || ''}`
    const paidDate = installment.paidOn ? formatDate(installment.paidOn) : ''
    const amount = money.format(installment.amount)

    const paymentMode = String(installment.mode || '').toUpperCase()
    const isUPI = paymentMode.includes('UPI')
    const isCash = paymentMode.includes('CASH')
    const isOther = !isUPI && !isCash

    const esc = (value: unknown) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    const checkbox = (checked: boolean) =>
      checked
        ? `<span class="checkbox checked">✓</span>`
        : `<span class="checkbox"></span>`

    // ---------------------------------------------------------
    // PRINT HTML
    // ---------------------------------------------------------

    printWindow.document.open()

    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Installment Receipt - ${esc(receiptNo)}</title>

<style>

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

html, body {
  margin: 0;
  padding: 0;
  background: #fff;
}

body {
  width: 210mm;
  min-height: 297mm;
  font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
  color: #000;
}

@page {
  size: A4 portrait;
  margin: 0;
}

.page {
  width: 210mm;
  height: 297mm;
  padding: 10mm 10mm 0;
}

/* ----------------------------------------------------------
   RECEIPT  190mm x 82mm  =  about 25% of an A4 sheet
---------------------------------------------------------- */

.receipt {
  width: 190mm;
  height: 82mm;
  display: flex;
  position: relative;
  overflow: hidden;
  border: 1.4px solid #000;
  border-radius: 1.5mm;
  background: #fff;
}

/* ----------------------------------------------------------
   LEFT BLACK STRIP
---------------------------------------------------------- */

.side {
  width: 19mm;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 3.5mm 0;
  background: #000;
  color: #fff;
}

.logo-ring {
  width: 14mm;
  height: 14mm;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
}

.logo {
  width: 11mm;
  height: 11mm;
  object-fit: contain;
  filter: grayscale(1) contrast(1.4);
}

.side-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 3px;
  white-space: nowrap;
}

.side-no {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
  line-height: 1.3;
}

/* ----------------------------------------------------------
   MAIN AREA
---------------------------------------------------------- */

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* HEADER */

.header {
  height: 16mm;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5mm;
  border-bottom: 1.4px solid #000;
}

.academy-name {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 16.5px;
  font-weight: 900;
  letter-spacing: 0.2px;
  line-height: 1.1;
  white-space: nowrap;
}

.academy-subtitle {
  margin-top: 1.2mm;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 1px;
}

.meta {
  flex-shrink: 0;
  min-width: 42mm;
  border: 1px solid #000;
  border-radius: 1mm;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 3mm;
  padding: 1mm 2.2mm;
  font-size: 8.5px;
}

.meta-row + .meta-row {
  border-top: 1px solid #000;
}

.meta-row span:first-child {
  font-weight: 700;
}

.meta-row span:last-child {
  font-weight: 800;
  white-space: nowrap;
}

/* BODY */

.body {
  flex: 1;
  display: flex;
  gap: 5mm;
  padding: 3.2mm 5mm 0;
  min-height: 0;
}

.fields {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2mm;
}

.field-row {
  display: flex;
  gap: 5mm;
}

.field {
  flex: 1;
  min-width: 0;
}

.field-label {
  font-size: 7px;
  font-weight: 700;
  color: #444;
}

.field-value {
  height: 5.6mm;
  padding: 0 1mm;
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid #000;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* PAYMENT COLUMN */

.pay {
  width: 48mm;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2mm;
}

.amount {
  padding: 2mm 3mm;
  border-radius: 1mm;
  background: #000;
  color: #fff;
}

.amount-label {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.6px;
}

.amount-value {
  margin-top: 0.6mm;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.1;
  white-space: nowrap;
}

.mode {
  padding: 1.8mm 3mm;
  border: 1px solid #000;
  border-radius: 1mm;
}

.mode-title {
  margin-bottom: 1.4mm;
  font-size: 7px;
  font-weight: 700;
  color: #444;
}

.mode-options {
  display: flex;
  justify-content: space-between;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 1mm;
  font-size: 8px;
  font-weight: 800;
}

.checkbox {
  width: 3.6mm;
  height: 3.6mm;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.2px solid #000;
  border-radius: 0.5mm;
  color: transparent;
  font-size: 8px;
  font-weight: 900;
  line-height: 1;
}

.checkbox.checked {
  background: #000;
  color: #fff;
}

/* SIGNATURES + SEAL */

.sign {
  position: relative;
  height: 17mm;
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 5mm 1.8mm;
}

.sign-line {
  width: 42mm;
  padding-top: 1mm;
  border-top: 1px solid #000;
  text-align: center;
  font-size: 7.5px;
  font-weight: 700;
}

.sign-line.wide {
  width: 52mm;
}

.seal {
  position: absolute;
  right: 36mm;
  bottom: 0.5mm;
  width: 21mm;
  height: 21mm;
  transform: rotate(-10deg);
  opacity: 0.92;
}

/* FOOTER */

.footer {
  height: 10mm;
  flex-shrink: 0;
  padding: 1.3mm 5mm 0;
  border-top: 1.4px solid #000;
  font-size: 6.2px;
  font-weight: 600;
  line-height: 1.5;
}

.footer-line {
  white-space: nowrap;
  overflow: hidden;
}

.footer b {
  font-weight: 900;
}

.footer .gap {
  display: inline-block;
  width: 4mm;
}

@media print {
  html, body {
    width: 210mm;
    height: 297mm;
    overflow: hidden;
  }
}

</style>
</head>

<body>

<div class="page">
  <div class="receipt">

    <!-- LEFT STRIP -->
    <div class="side">
      <div class="logo-ring">
        <img src="/logo.png" class="logo" alt="Academy Logo">
      </div>

      <div class="side-text">INSTALLMENT RECEIPT</div>

      <div class="side-no">
        STUDENT<br>COPY
      </div>
    </div>

    <!-- MAIN -->
    <div class="main">

      <div class="header">
        <div>
          <div class="academy-name">ACADEMY OF COMPUTER EDUCATION</div>
          <div class="academy-subtitle">(STS COMPUTER EDUCATION)</div>
        </div>

        <div class="meta">
          <div class="meta-row">
            <span>Receipt No.</span>
            <span>${esc(receiptNo)}</span>
          </div>
          <div class="meta-row">
            <span>Date</span>
            <span>${esc(paidDate)}</span>
          </div>
        </div>
      </div>

      <div class="body">

        <div class="fields">
          <div class="field">
            <div class="field-label">Student name</div>
            <div class="field-value">${esc(studentName)}</div>
          </div>

          <div class="field">
            <div class="field-label">Father's name</div>
            <div class="field-value">${esc(fatherName)}</div>
          </div>

          <div class="field-row">
            <div class="field" style="flex: 1.2">
              <div class="field-label">Course</div>
              <div class="field-value">${esc(course)}</div>
            </div>

            <div class="field" style="flex: 0.8">
              <div class="field-label">Mobile</div>
              <div class="field-value">${esc(mobile)}</div>
            </div>
          </div>
        </div>

        <div class="pay">
          <div class="amount">
            <div class="amount-label">AMOUNT PAID</div>
            <div class="amount-value">${esc(amount)}</div>
          </div>

          <div class="mode">
            <div class="mode-title">Payment type</div>
            <div class="mode-options">
              <span class="mode-option">${checkbox(isUPI)} UPI</span>
              <span class="mode-option">${checkbox(isCash)} CASH</span>
              <span class="mode-option">${checkbox(isOther)} OTHER</span>
            </div>
          </div>
        </div>

      </div>

      <div class="sign">
        <div class="sign-line">Director Signature</div>


        <div class="sign-line wide">Auth. Signature with Office Seal</div>
      </div>

      <div class="footer">
        <div class="footer-line">
          <b>Office:</b>
          Opp. Railway Station Shivnarayanpur, Infront of Platform no 3,
          Mathurapur, Bhagalpur, Bihar
        </div>

        <div class="footer-line">
          <b>Mob:</b> 9334554167
          <span class="gap"></span>
          <b>Gmail:</b> academyofcomputereducationsvrp@gmail.com
          <span class="gap"></span>
          <b>Web:</b> acesvrp.in
        </div>

        <div class="footer-line">
          <b>Generate By</b> ${esc(user?.username)}
        </div>
      </div>

    </div>

  </div>
</div>

<script>
  window.addEventListener('load', function () {
    setTimeout(function () {
      window.focus()
      window.print()
    }, 400)
  })

  window.addEventListener('afterprint', function () {
    setTimeout(function () {
      window.close()
    }, 200)
  })
</script>

</body>
</html>
  `)

    printWindow.document.close()
  }

  function handleDeassignCourse(enrollment: StudentEnrollment) {
    if (
      !window.confirm(
        `Deassign ${enrollment.course?.title || 'this course'}? Payment history will be kept.`,
      )
    ) {
      return
    }
    deassignMutation.mutate(enrollment.enrollmentId)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Button
            render={<Link to="/dashboard/admin/students" />}
            variant="ghost"
            className="px-0"
          >
            ← Back to students
          </Button>
          <h1 className="text-2xl font-semibold">
            {student.fullName || student.username}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrintApplication}
          >
            <PrinterIcon aria-hidden="true" className="mr-2 size-4" />
            Print application
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit details
          </Button>
          <Button onClick={() => setAssignOpen(true)}>Assign course</Button>
        </div>
      </header>

      <section className="grid gap-6 rounded-md border p-4 md:grid-cols-[160px_1fr]">
        <div className="flex gap-3 md:flex-col">
          {student.avatar?.url && (
            <img
              src={getImageUrl(student.avatar.url)}
              alt={`${student.fullName || student.username} avatar`}
              className="size-24 rounded-md border object-cover"
            />
          )}
          {student.signature?.url && (
            <img
              src={getImageUrl(student.signature.url)}
              alt={`${student.fullName || student.username} signature`}
              className="h-16 w-32 border object-contain"
            />
          )}
        </div>
        <div className="space-y-5">
          <div>
            <h2 className="mb-3 font-semibold">Account and personal details</h2>
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Full name" value={student.fullName} />
              <Detail label="Username" value={student.username} />
              <Detail label="Email" value={student.email} />
              <Detail label="Account type" value={student.type} />
              <Detail label="Contact number" value={student.contactNo} />
              <Detail label="Gender" value={student.gender} />
              <Detail label="Date of birth" value={formatDate(student.dob)} />
              <Detail label="C/O type" value={student.careOfTitle} />
              <Detail label="C/O name" value={student.careOfName} />
              <Detail label="C/O number" value={student.careOfNumber} />
              <Detail label="Father's name" value={student.fathersName} />
              <Detail label="Mother's name" value={student.mothersName} />
              <Detail label="Spouse name" value={student.spouseName} />
              <Detail label="Aadhaar number" value={student.aadhaarNo} />
              <Detail label="Address" value={student.address} />
              <Detail
                label="Email verified"
                value={student.isEmailVerified ? 'Yes' : 'No'}
              />
              <Detail
                label="Account locked"
                value={student.locked ? 'Yes' : 'No'}
              />
              <Detail label="Created by" value={student.createdBy} />
              <Detail
                label="English typing"
                value={student.isEnglishTyping ? 'Yes' : 'No'}
              />
              <Detail
                label="Hindi typing"
                value={student.isHindiTyping ? 'Yes' : 'No'}
              />
              <Detail
                label="Registered"
                value={formatDate(student.createdAt)}
              />
              <Detail
                label="Last updated"
                value={formatDate(student.updatedAt)}
              />
            </dl>
          </div>
          <div>
            <h2 className="mb-3 font-semibold">Qualifications</h2>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Examination</TableHead>
                    <TableHead>Board / University</TableHead>
                    <TableHead>School / College</TableHead>
                    <TableHead>Passing year</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">10th</TableCell>
                    <TableCell>{student.matricBoard || '—'}</TableCell>
                    <TableCell>{student.matricSchool || '—'}</TableCell>
                    <TableCell>{student.matricPassingYear || '—'}</TableCell>
                    <TableCell>{student.matricPercentage || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">12th</TableCell>
                    <TableCell>{student.interBoard || '—'}</TableCell>
                    <TableCell>{student.interSchool || '—'}</TableCell>
                    <TableCell>{student.interPassingYear || '—'}</TableCell>
                    <TableCell>{student.interPercentage || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Graduation</TableCell>
                    <TableCell>{student.graduationBoard || '—'}</TableCell>
                    <TableCell>{student.graduationCollege || '—'}</TableCell>
                    <TableCell>
                      {student.graduationPassingYear || '—'}
                    </TableCell>
                    <TableCell>{student.graduationPercentage || '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Other</TableCell>
                    <TableCell>{student.otherBoard || '—'}</TableCell>
                    <TableCell>{student.otherCollege || '—'}</TableCell>
                    <TableCell>{student.otherPassingYear || '—'}</TableCell>
                    <TableCell>{student.otherPercentage || '—'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Detail label="Remarks" value={student.remarks} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Fees and courses</h2>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span>Total fee: {money.format(student.fees.totalFee)}</span>
            <span>Total paid: {money.format(student.fees.totalPaid)}</span>
            <span>Total due: {money.format(student.fees.totalDue)}</span>
          </div>
        </div>

        {student.fees.courses.length === 0 ? (
          <p className="rounded-md border p-4 text-muted-foreground">
            No courses assigned yet. Use “Assign course” to add one.
          </p>
        ) : (
          student.fees.courses.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.enrollmentId}
              enrollment={enrollment}
              pending={
                deleteInstallmentMutation.isPending ||
                deassignMutation.isPending
              }
              onAddInstallment={() => setInstallmentEnrollment(enrollment)}
              onDeleteInstallment={(installmentId) =>
                handleDeleteInstallment(enrollment.enrollmentId, installmentId)
              }
              onPrintInstallment={(installment) => {
                handlePrintInstallment(enrollment, installment)
              }}
              onDeassign={() => handleDeassignCourse(enrollment)}
            />
          ))
        )}
      </section>

      <EditStudentDialog
        student={student}
        open={editOpen}
        pending={editMutation.isPending}
        onOpenChange={setEditOpen}
        onSubmit={submitEdit}
      />
      <AssignCourseDialog
        open={assignOpen}
        pending={assignMutation.isPending}
        onOpenChange={setAssignOpen}
        onSubmit={submitAssign}
      />
      <AddInstallmentDialog
        enrollment={installmentEnrollment}
        pending={installmentMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setInstallmentEnrollment(null)
        }}
        onSubmit={submitInstallment}
      />
    </section>
  )
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium">{value || '—'}</dd>
    </div>
  )
}

function EnrollmentCard({
  enrollment,
  pending,
  onAddInstallment,
  onDeleteInstallment,
  onPrintInstallment,
  onDeassign,
}: {
  enrollment: StudentEnrollment
  pending: boolean
  onAddInstallment: () => void
  onDeleteInstallment: (installmentId: string) => void
  onPrintInstallment: (installment: StudentInstallment) => void
  onDeassign: () => void
}) {
  return (
    <article className="space-y-4 rounded-md border p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-semibold">
            {enrollment.course?.title || 'Course'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {enrollment.course?.language || '—'} ·{' '}
            {enrollment.course?.durationInMonths ?? '—'} months · Enrolled{' '}
            {formatDate(enrollment.enrolledOn)}
          </p>
          <p className="text-sm">
            {enrollment.status} · {enrollment.feeStatus} ·{' '}
            {enrollment.discountPercent}% discount
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {enrollment.due > 0 && enrollment.status === 'active' && (
            <Button onClick={onAddInstallment}>Add installment</Button>
          )}
          {enrollment.status !== 'cancelled' && (
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={onDeassign}
            >
              Deassign course
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <p>Course fee: {money.format(enrollment.course?.price ?? 0)}</p>
        <p>Final fee: {money.format(enrollment.finalFee)}</p>
        <p>Total paid: {money.format(enrollment.totalPaid)}</p>
        <p className="font-semibold">Due: {money.format(enrollment.due)}</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Note / Receipt</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollment.installments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No installments recorded.
                </TableCell>
              </TableRow>
            ) : (
              enrollment.installments.map((installment) => (
                <TableRow key={installment._id}>
                  <TableCell>{installment.number}</TableCell>
                  <TableCell>{formatDate(installment.paidOn)}</TableCell>
                  <TableCell>{money.format(installment.amount)}</TableCell>
                  <TableCell>{installment.mode}</TableCell>
                  <TableCell>
                    {[installment.note, installment.receiptNo]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={pending}
                      aria-label={`Delete installment ${installment.number}`}
                      onClick={() => onDeleteInstallment(installment._id)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      aria-label={`Print installment ${installment.number}`}
                      onClick={() => onPrintInstallment(installment)}
                    >
                      <PrinterIcon aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </article>
  )
}

function EditStudentDialog({
  student,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  student: StudentDetails
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit student</DialogTitle>
          <DialogDescription>
            Update the student profile details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <fieldset disabled={pending} className="space-y-5">
            <section className="space-y-3">
              <h3 className="font-semibold">Account and personal details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledInput
                  label="Full name"
                  name="fullName"
                  defaultValue={student.fullName ?? ''}
                  required
                />
                <LabeledInput
                  label="Username"
                  name="username"
                  defaultValue={student.username}
                  required
                />
                <LabeledInput
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={student.email}
                  required
                />
                <LabeledInput
                  label="Contact number"
                  name="contactNo"
                  defaultValue={student.contactNo ?? ''}
                />
                <label className="space-y-2 text-sm">
                  <span>Gender</span>
                  <NativeSelect
                    name="gender"
                    defaultValue={student.gender ?? ''}
                  >
                    <NativeSelectOption value="">
                      Not specified
                    </NativeSelectOption>
                    <NativeSelectOption value="male">Male</NativeSelectOption>
                    <NativeSelectOption value="female">
                      Female
                    </NativeSelectOption>
                    <NativeSelectOption value="other">Other</NativeSelectOption>
                  </NativeSelect>
                </label>
                <LabeledInput
                  label="Date of birth"
                  name="dob"
                  type="date"
                  defaultValue={student.dob?.slice(0, 10) ?? ''}
                />
                <label className="space-y-2 text-sm">
                  <span>C/O type</span>
                  <NativeSelect
                    name="careOfTitle"
                    defaultValue={student.careOfTitle ?? ''}
                  >
                    <NativeSelectOption value="">
                      Not specified
                    </NativeSelectOption>
                    <NativeSelectOption value="father">
                      Father
                    </NativeSelectOption>
                    <NativeSelectOption value="guardian">
                      Guardian
                    </NativeSelectOption>
                  </NativeSelect>
                </label>
                <LabeledInput
                  label="C/O name"
                  name="careOfName"
                  defaultValue={student.careOfName ?? ''}
                />
                <LabeledInput
                  label="C/O number"
                  name="careOfNumber"
                  defaultValue={student.careOfNumber ?? ''}
                />
                <LabeledInput
                  label="Father's name"
                  name="fathersName"
                  defaultValue={student.fathersName ?? ''}
                />
                <LabeledInput
                  label="Mother's name"
                  name="mothersName"
                  defaultValue={student.mothersName ?? ''}
                />
                <LabeledInput
                  label="Spouse name"
                  name="spouseName"
                  defaultValue={student.spouseName ?? ''}
                />
                <LabeledInput
                  label="Aadhaar number"
                  name="aadhaarNo"
                  inputMode="numeric"
                  maxLength={12}
                  defaultValue={student.aadhaarNo ?? ''}
                />
                <label className="space-y-2 text-sm sm:col-span-2">
                  <span>Address</span>
                  <Textarea
                    name="address"
                    defaultValue={student.address ?? ''}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isEmailVerified"
                    defaultChecked={student.isEmailVerified}
                    className="size-4 accent-primary"
                  />
                  Email verified
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="locked"
                    defaultChecked={student.locked ?? false}
                    className="size-4 accent-primary"
                  />
                  Account locked
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isEnglishTyping"
                    defaultChecked={student.isEnglishTyping}
                    className="size-4 accent-primary"
                  />
                  English typing
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isHindiTyping"
                    defaultChecked={student.isHindiTyping}
                    className="size-4 accent-primary"
                  />
                  Hindi typing
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold">Qualifications</h3>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Examination</TableHead>
                      <TableHead>Board / University</TableHead>
                      <TableHead>School / College</TableHead>
                      <TableHead>Passing year</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <QualificationEditRow
                      label="10th"
                      fields={[
                        ['matricBoard', student.matricBoard],
                        ['matricSchool', student.matricSchool],
                        ['matricPassingYear', student.matricPassingYear],
                        ['matricPercentage', student.matricPercentage],
                      ]}
                    />
                    <QualificationEditRow
                      label="12th"
                      fields={[
                        ['interBoard', student.interBoard],
                        ['interSchool', student.interSchool],
                        ['interPassingYear', student.interPassingYear],
                        ['interPercentage', student.interPercentage],
                      ]}
                    />
                    <QualificationEditRow
                      label="Graduation"
                      fields={[
                        ['graduationBoard', student.graduationBoard],
                        ['graduationCollege', student.graduationCollege],
                        [
                          'graduationPassingYear',
                          student.graduationPassingYear,
                        ],
                        ['graduationPercentage', student.graduationPercentage],
                      ]}
                    />
                    <QualificationEditRow
                      label="Other"
                      fields={[
                        ['otherBoard', student.otherBoard],
                        ['otherCollege', student.otherCollege],
                        ['otherPassingYear', student.otherPassingYear],
                        ['otherPercentage', student.otherPercentage],
                      ]}
                    />
                  </TableBody>
                </Table>
              </div>
              <label className="block space-y-2 text-sm">
                <span>Remarks</span>
                <Textarea name="remarks" defaultValue={student.remarks ?? ''} />
              </label>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold">Images</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledInput
                  label="Replace avatar"
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                />
                <LabeledInput
                  label="Replace signature"
                  name="signature"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                />
              </div>
              <p className="text-muted-foreground">
                Account type and creator are read-only. Passwords and
                authentication tokens are not displayed or editable here.
              </p>
            </section>
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function LabeledInput({
  label,
  ...props
}: React.ComponentProps<typeof Input> & { label: string }) {
  return (
    <label className="space-y-2 text-sm">
      <span>{label}</span>
      <Input {...props} />
    </label>
  )
}

function QualificationEditRow({
  label,
  fields,
}: {
  label: string
  fields: Array<[string, string | number | undefined]>
}) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap font-medium">{label}</TableCell>
      {fields.map(([name, value]) => (
        <TableCell key={name} className="min-w-36">
          <Input
            aria-label={`${label} ${name}`}
            name={name}
            type={name.endsWith('PassingYear') ? 'number' : 'text'}
            defaultValue={value?.toString() ?? ''}
            className="min-w-28"
          />
        </TableCell>
      ))}
    </TableRow>
  )
}

function AssignCourseDialog({
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const coursesQuery = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: getCourses,
    enabled: open,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign course</DialogTitle>
          <DialogDescription>
            Choose an active course and an optional discount.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {coursesQuery.isError ? (
            <div className="space-y-2">
              <p role="alert">{getErrorMessage(coursesQuery.error)}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void coursesQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <label className="block space-y-2 text-sm">
                <span>Course</span>
                <NativeSelect
                  name="courseId"
                  defaultValue=""
                  required
                  disabled={coursesQuery.isPending || pending}
                >
                  <NativeSelectOption value="" disabled>
                    {coursesQuery.isPending
                      ? 'Loading courses...'
                      : 'Select a course'}
                  </NativeSelectOption>
                  {coursesQuery.data?.map((course) => (
                    <NativeSelectOption key={course._id} value={course._id}>
                      {course.title} - {money.format(course.price)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </label>
              <LabeledInput
                label="Discount percentage"
                name="discountPercent"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue="0"
                required
              />
              {coursesQuery.isSuccess && coursesQuery.data.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No active courses are available.
                </p>
              )}
            </>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                pending ||
                coursesQuery.isPending ||
                coursesQuery.isError ||
                coursesQuery.data.length === 0
              }
            >
              {pending ? 'Assigning...' : 'Assign course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddInstallmentDialog({
  enrollment,
  pending,
  onOpenChange,
  onSubmit,
}: {
  enrollment: StudentEnrollment | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={enrollment !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add installment</DialogTitle>
          <DialogDescription>
            {enrollment?.course?.title} · Remaining due{' '}
            {money.format(enrollment?.due ?? 0)}
          </DialogDescription>
        </DialogHeader>
        <form
          key={enrollment?.enrollmentId}
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <LabeledInput
            label="Amount"
            name="amount"
            type="number"
            min="1"
            max={enrollment?.due}
            step="1"
            required
          />
          <label className="block space-y-2 text-sm">
            <span>Payment mode</span>
            <NativeSelect name="mode" defaultValue="cash" required>
              <NativeSelectOption value="cash">Cash</NativeSelectOption>
              <NativeSelectOption value="upi">UPI</NativeSelectOption>
              <NativeSelectOption value="card">Card</NativeSelectOption>
              <NativeSelectOption value="bank">
                Bank transfer
              </NativeSelectOption>
              <NativeSelectOption value="cheque">Cheque</NativeSelectOption>
            </NativeSelect>
          </label>
          <LabeledInput
            label="Paid on"
            name="paidOn"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
          <LabeledInput label="Note" name="note" />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : 'Record payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
