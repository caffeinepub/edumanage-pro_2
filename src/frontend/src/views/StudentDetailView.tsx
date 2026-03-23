import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStudentAttendance,
  getStudentResults,
  students,
} from "@/data/mockData";
import type { Role } from "@/hooks/useAuth";
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  Download,
  Printer,
  ShieldAlert,
  User,
} from "lucide-react";
import { motion } from "motion/react";

interface StudentDetailViewProps {
  studentId: number;
  onBack: () => void;
  role: Role;
  username: string;
}

interface LocalMarks {
  studentId: number;
  hindi: number;
  english: number;
  math: number;
  science: number;
  social: number;
  total: number;
  percentage: string;
}

const gradeColor: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700",
  A: "bg-emerald-100 text-emerald-700",
  "B+": "bg-blue-100 text-blue-700",
  B: "bg-blue-100 text-blue-700",
  "C+": "bg-amber-100 text-amber-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  F: "bg-red-100 text-red-700",
};

function loadLocalMarks(studentId: number): LocalMarks | null {
  try {
    const raw = localStorage.getItem(`marks_${studentId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const LOCAL_SUBJECTS: {
  key: keyof Omit<LocalMarks, "studentId" | "total" | "percentage">;
  label: string;
}[] = [
  { key: "hindi", label: "Hindi" },
  { key: "english", label: "English" },
  { key: "math", label: "Mathematics" },
  { key: "science", label: "Science" },
  { key: "social", label: "Social Studies" },
];

export function StudentDetailView({
  studentId,
  onBack,
  role,
  username,
}: StudentDetailViewProps) {
  const student = students.find((s) => s.id === studentId);
  const attendance = getStudentAttendance(studentId);
  const studentResults = getStudentResults(studentId);
  const localMarks = loadLocalMarks(studentId);

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-sm w-full text-center p-8">
          <p className="text-lg font-semibold text-muted-foreground">
            Student not found.
          </p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
          </Button>
        </Card>
      </div>
    );
  }

  // Access control: students can only view their own data
  if (
    role === "student" &&
    student.name.toLowerCase() !== username.toLowerCase()
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <Card
          className="max-w-sm w-full text-center p-8"
          data-ocid="student_detail.error_state"
        >
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            You can only view your own student data.
          </p>
          <Button
            onClick={onBack}
            variant="outline"
            data-ocid="student_detail.cancel_button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
          </Button>
        </Card>
      </motion.div>
    );
  }

  const totalMarksObtained = localMarks
    ? localMarks.total
    : studentResults.reduce((sum, r) => sum + r.marks, 0);
  const maxMarks = localMarks ? 500 : studentResults.length * 100;
  const percentage = localMarks
    ? localMarks.percentage
    : maxMarks > 0
      ? ((totalMarksObtained / maxMarks) * 100).toFixed(1)
      : "0.0";

  const attendanceDates = attendance ? Object.entries(attendance.dates) : [];
  const presentCount = attendanceDates.filter(([, present]) => present).length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const attendanceRows = attendanceDates
      .map(
        ([date, present]) =>
          `<tr><td>${date}</td><td style="color:${present ? "#16a34a" : "#dc2626"}; font-weight:600">${present ? "Present" : "Absent"}</td></tr>`,
      )
      .join("");

    const resultsRows = localMarks
      ? LOCAL_SUBJECTS.map(
          ({ key, label }) =>
            `<tr><td>${label}</td><td>${localMarks[key]}</td><td>100</td><td>—</td><td style="color:#16a34a">Entered</td></tr>`,
        ).join("")
      : studentResults
          .map(
            (r) =>
              `<tr><td>${r.subject}</td><td>${r.marks}</td><td>${r.totalMarks}</td><td>${r.grade}</td><td style="color:${r.status === "Pass" ? "#16a34a" : "#dc2626"}">${r.status}</td></tr>`,
          )
          .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Student Report - ${student.name}</title>
  <style>
    @page { size: A4; margin: 20mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a2e; background: #fff; }
    .report-header { text-align: center; border-bottom: 3px solid #1e3a8a; padding-bottom: 14px; margin-bottom: 20px; }
    .report-header h1 { font-size: 22px; font-weight: 700; color: #1e3a8a; letter-spacing: 1px; }
    .report-header p { font-size: 11px; color: #555; margin-top: 4px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #1e3a8a; border-left: 4px solid #1e3a8a; padding-left: 8px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
    .info-item label { font-size: 10px; color: #888; text-transform: uppercase; display: block; margin-bottom: 2px; }
    .info-item span { font-weight: 600; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #1e3a8a; color: #fff; padding: 7px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8fafc; }
    .total-row td { font-weight: 700; background: #eff6ff !important; border-top: 2px solid #1e3a8a; }
    .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #888; }
    .attendance-summary { font-size: 11px; margin-bottom: 8px; }
    .attendance-summary span { font-weight: 600; color: #1e3a8a; }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>Student Report</h1>
    <p>EduManage Pro &mdash; Education Management System</p>
    <p>Generated on: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
  </div>

  <div class="section">
    <div class="section-title">Student Information</div>
    <div class="info-grid">
      <div class="info-item"><label>Full Name</label><span>${student.name}</span></div>
      <div class="info-item"><label>Class</label><span>${student.class}</span></div>
      <div class="info-item"><label>Section</label><span>${student.section}</span></div>
      <div class="info-item"><label>Roll No.</label><span>${student.rollNo}</span></div>
    </div>
    <div class="info-item"><label>Overall Attendance</label><span>${student.attendance}%</span></div>
  </div>

  <div class="section">
    <div class="section-title">Attendance Records</div>
    <div class="attendance-summary">Present: <span>${presentCount}</span> / <span>${attendanceDates.length}</span> days recorded</div>
    <table>
      <thead><tr><th>Date</th><th>Status</th></tr></thead>
      <tbody>${attendanceRows || "<tr><td colspan='2'>No records found.</td></tr>"}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Academic Results</div>
    <table>
      <thead><tr><th>Subject</th><th>Marks</th><th>Total</th><th>Grade</th><th>Status</th></tr></thead>
      <tbody>
        ${resultsRows || "<tr><td colspan='5'>No results found.</td></tr>"}
        <tr class="total-row"><td>Total</td><td>${totalMarksObtained}</td><td>${maxMarks}</td><td colspan="2">Percentage: ${percentage}%</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <span>EduManage Pro &mdash; Confidential Student Report</span>
    <span>${student.name} &mdash; Class ${student.class} ${student.section}</span>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
      data-ocid="student_detail.panel"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            data-ocid="student_detail.cancel_button"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Button>
          <span className="text-muted-foreground text-sm hidden sm:inline">
            / Student Detail
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block print:mb-6">
        <div className="text-center border-b-2 border-blue-800 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-blue-900 tracking-wide">
            Student Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            EduManage Pro &mdash; Education Management System
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Generated on:{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Student Info Card */}
      <Card data-ocid="student_detail.card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-5 h-5 text-primary print:hidden" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Full Name
              </p>
              <p className="font-semibold text-foreground">{student.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Class
              </p>
              <Badge variant="outline">{student.class}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Section
              </p>
              <p className="font-semibold text-foreground">{student.section}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Roll No.
              </p>
              <p className="font-mono font-semibold text-foreground">
                {student.rollNo}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Overall Attendance
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden max-w-[200px] print:hidden">
                <div
                  className={`h-full rounded-full ${
                    student.attendance >= 85
                      ? "bg-emerald-500"
                      : student.attendance >= 70
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${student.attendance}%` }}
                />
              </div>
              <span
                className={`text-sm font-bold ${
                  student.attendance >= 85
                    ? "text-emerald-600"
                    : student.attendance >= 70
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {student.attendance}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="w-5 h-5 text-primary print:hidden" />
            Attendance Records
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Present:{" "}
            <span className="font-semibold text-foreground">
              {presentCount}
            </span>{" "}
            /{" "}
            <span className="font-semibold text-foreground">
              {attendanceDates.length}
            </span>{" "}
            days recorded this week
          </p>
        </CardHeader>
        <CardContent>
          {attendanceDates.length === 0 ? (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="student_detail.empty_state"
            >
              No attendance records found.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 print:grid-cols-7 print:gap-1">
              {attendanceDates.map(([date, present]) => (
                <div
                  key={date}
                  className={`rounded-lg border p-3 text-center transition-colors ${
                    present
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    {date}
                  </p>
                  <Badge
                    className={`text-xs px-2 py-0 ${
                      present
                        ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                        : "bg-red-500 hover:bg-red-500 text-white"
                    }`}
                  >
                    {present ? "P" : "A"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-5 h-5 text-primary print:hidden" />
            Academic Results
            {localMarks && (
              <Badge className="ml-2 text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
                Mark Entry Data
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {localMarks ? (
            <div className="rounded-b-lg overflow-hidden">
              <Table data-ocid="student_detail.table">
                <TableHeader>
                  <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      Subject
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      Marks
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {LOCAL_SUBJECTS.map(({ key, label }, idx) => (
                    <TableRow
                      key={key}
                      data-ocid={`student_detail.item.${idx + 1}`}
                      className={idx % 2 === 0 ? "bg-card" : "bg-secondary/30"}
                    >
                      <TableCell className="font-medium text-foreground">
                        {label}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {localMarks[key]}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        100
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-primary/5 font-semibold border-t-2 border-primary/20">
                    <TableCell className="text-foreground font-bold">
                      Total
                    </TableCell>
                    <TableCell className="text-foreground font-bold">
                      {localMarks.total}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-bold text-sm ${
                          Number(localMarks.percentage) >= 60
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {localMarks.percentage}% / 500
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : studentResults.length === 0 ? (
            <p
              className="text-sm text-muted-foreground p-4"
              data-ocid="student_detail.empty_state"
            >
              No results found.
            </p>
          ) : (
            <div className="rounded-b-lg overflow-hidden">
              <Table data-ocid="student_detail.table">
                <TableHeader>
                  <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      Subject
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      Marks
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      Total
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      Grade
                    </TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentResults.map((result, idx) => (
                    <TableRow
                      key={result.id}
                      data-ocid={`student_detail.item.${idx + 1}`}
                      className={idx % 2 === 0 ? "bg-card" : "bg-secondary/30"}
                    >
                      <TableCell className="font-medium text-foreground">
                        {result.subject}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {result.marks}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.totalMarks}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            gradeColor[result.grade] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {result.grade}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${
                            result.status === "Pass"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {result.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-primary/5 font-semibold border-t-2 border-primary/20">
                    <TableCell className="text-foreground font-bold">
                      Total
                    </TableCell>
                    <TableCell className="text-foreground font-bold">
                      {totalMarksObtained}
                    </TableCell>
                    <TableCell className="text-foreground font-bold">
                      {maxMarks}
                    </TableCell>
                    <TableCell colSpan={2}>
                      <span
                        className={`font-bold text-sm ${
                          Number(percentage) >= 60
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print footer */}
      <div className="hidden print:block print:mt-8 print:border-t print:pt-4">
        <div className="flex justify-between text-xs text-gray-400">
          <span>EduManage Pro &mdash; Confidential Student Report</span>
          <span>
            {student.name} &mdash; Class {student.class} {student.section}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
