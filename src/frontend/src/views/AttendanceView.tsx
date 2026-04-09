import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarCheck, Save, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const LS_ATTENDANCE_KEY = "ems_attendance";

interface StoredStudent {
  id: number;
  name: string;
  class?: string;
}

// attendance data: { [date]: { [studentId]: true/false } }
type AttendanceData = Record<string, Record<string, boolean>>;

function loadStudents(): StoredStudent[] {
  try {
    const raw = localStorage.getItem("students");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredStudent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadAttendance(): AttendanceData {
  try {
    const raw = localStorage.getItem(LS_ATTENDANCE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AttendanceData;
  } catch {
    return {};
  }
}

function saveAttendance(data: AttendanceData) {
  localStorage.setItem(LS_ATTENDANCE_KEY, JSON.stringify(data));
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = months[Number.parseInt(m, 10) - 1] ?? m;
  return `${d} ${monthName} ${y}`;
}

function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function AttendanceView() {
  const [students] = useState<StoredStudent[]>(loadStudents);
  const [attendance, setAttendance] = useState<AttendanceData>(loadAttendance);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [saved, setSaved] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Build list of all dates that have attendance data
  const recordedDates = Object.keys(attendance).sort((a, b) =>
    b.localeCompare(a),
  );

  // Viewing: list of unique dates for tab switching
  const viewDates =
    recordedDates.length > 0
      ? [...new Set([selectedDate, ...recordedDates])].sort((a, b) =>
          b.localeCompare(a),
        )
      : [selectedDate];

  // Current date attendance map: studentId → present/absent
  const currentDateAttendance: Record<string, boolean> =
    attendance[selectedDate] ?? {};

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSaved(false);
  }

  function markAll(present: boolean) {
    setAttendance((prev) => {
      const dateData: Record<string, boolean> = {};
      for (const s of students) {
        dateData[String(s.id)] = present;
      }
      return { ...prev, [selectedDate]: dateData };
    });
    setSaved(false);
  }

  function handleSave() {
    saveAttendance(attendance);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleClearAll() {
    localStorage.removeItem(LS_ATTENDANCE_KEY);
    setAttendance({});
    setConfirmClearOpen(false);
  }

  const presentCount = students.filter(
    (s) => currentDateAttendance[String(s.id)] === true,
  ).length;
  const absentCount = students.filter(
    (s) => currentDateAttendance[String(s.id)] === false,
  ).length;
  const unmarkedCount = students.length - presentCount - absentCount;

  const overallPresent = Object.values(attendance).reduce(
    (acc, dateMap) => acc + Object.values(dateMap).filter(Boolean).length,
    0,
  );
  const overallSlots = Object.values(attendance).reduce(
    (acc, dateMap) => acc + Object.values(dateMap).length,
    0,
  );
  const overallPct =
    overallSlots > 0 ? Math.round((overallPresent / overallSlots) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Confirm Clear Dialog */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="attendance.clear_dialog"
        >
          <DialogHeader>
            <DialogTitle>सभी उपस्थिति हटाएं?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            सभी तिथियों की उपस्थिति का डेटा स्थायी रूप से हट जाएगा। क्या आप निश्चित हैं?
          </p>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmClearOpen(false)}
            >
              रद्द करें
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="attendance.confirm_clear_button"
              onClick={handleClearAll}
            >
              हाँ, हटाएं
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {students.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border bg-muted/30"
          data-ocid="attendance.empty_state"
        >
          <CalendarCheck className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-base font-medium text-muted-foreground">
            कोई उपस्थिति डेटा नहीं
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            पहले Student Management में छात्र जोड़ें, फिर उपस्थिति दर्ज करें
          </p>
        </div>
      ) : (
        <>
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Date picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                  तिथि:
                </span>
                <input
                  type="date"
                  data-ocid="attendance.date_input"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Recorded dates dropdown */}
              {recordedDates.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                    सहेजी तिथि:
                  </span>
                  <Select value={selectedDate} onValueChange={handleDateChange}>
                    <SelectTrigger
                      data-ocid="attendance.month_select"
                      className="w-44 text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {viewDates.map((d) => (
                        <SelectItem key={d} value={d}>
                          {formatDateLabel(d)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {overallSlots > 0 && (
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
                  <span className="text-xs text-muted-foreground">
                    कुल उपस्थिति:
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      overallPct >= 85
                        ? "text-emerald-600"
                        : overallPct >= 70
                          ? "text-amber-600"
                          : "text-red-600",
                    )}
                  >
                    {overallPct}%
                  </span>
                </div>
              )}
              {Object.keys(attendance).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="attendance.clear_button"
                  className="flex items-center gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
                  onClick={() => setConfirmClearOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  सभी हटाएं
                </Button>
              )}
            </div>
          </div>

          {/* Date header + quick-mark buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {formatDateLabel(selectedDate)} — उपस्थिति
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                उपस्थित:{" "}
                <span className="text-emerald-600 font-semibold">
                  {presentCount}
                </span>
                {" · "}अनुपस्थित:{" "}
                <span className="text-red-600 font-semibold">
                  {absentCount}
                </span>
                {unmarkedCount > 0 && (
                  <>
                    {" "}
                    · अचिह्नित:{" "}
                    <span className="text-amber-600 font-semibold">
                      {unmarkedCount}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAll(true)}
                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 text-xs"
              >
                सभी उपस्थित
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAll(false)}
                className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
              >
                सभी अनुपस्थित
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                data-ocid="attendance.save_button"
                className={cn(
                  "flex items-center gap-1.5",
                  saved && "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                <Save className="w-3.5 h-3.5" />
                {saved ? "सहेजा ✓" : "सहेजें"}
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-sm bg-emerald-500 inline-block" />
              उपस्थित
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-sm bg-red-400 inline-block" />
              अनुपस्थित
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-sm bg-muted border border-border inline-block" />
              अचिह्नित
            </span>
          </div>

          {/* Attendance grid */}
          <div
            className="rounded-lg border border-border overflow-hidden bg-card shadow-xs"
            data-ocid="attendance.table"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/60 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                    छात्र का नाम
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                    कक्षा
                  </th>
                  <th className="text-center px-3 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                    उपस्थिति
                  </th>
                  <th className="text-center px-3 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                    कुल %
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const key = String(student.id);
                  const status = currentDateAttendance[key];
                  const isPresent = status === true;
                  const isAbsent = status === false;
                  const isUnmarked = status === undefined;

                  // Calculate this student's overall attendance %
                  let stPresent = 0;
                  let stTotal = 0;
                  for (const dateMap of Object.values(attendance)) {
                    if (key in dateMap) {
                      stTotal++;
                      if (dateMap[key]) stPresent++;
                    }
                  }
                  const stPct =
                    stTotal > 0
                      ? Math.round((stPresent / stTotal) * 100)
                      : null;

                  return (
                    <tr
                      key={student.id}
                      data-ocid={`attendance.row.${idx + 1}`}
                      className={cn(
                        "border-b border-border last:border-b-0 transition-colors",
                        idx % 2 === 0 ? "bg-card" : "bg-secondary/20",
                      )}
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {student.name}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground text-xs">
                        {student.class ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // If unmarked or absent → mark present
                              if (!isPresent) {
                                setAttendance((prev) => {
                                  const dateData = {
                                    ...(prev[selectedDate] ?? {}),
                                  };
                                  dateData[key] = true;
                                  return { ...prev, [selectedDate]: dateData };
                                });
                                setSaved(false);
                              }
                            }}
                            className={cn(
                              "px-3 py-1 rounded text-xs font-semibold border transition-all",
                              isPresent
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-card text-muted-foreground border-border hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300",
                            )}
                            aria-label={`${student.name} उपस्थित`}
                          >
                            उपस्थित
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isAbsent) {
                                setAttendance((prev) => {
                                  const dateData = {
                                    ...(prev[selectedDate] ?? {}),
                                  };
                                  dateData[key] = false;
                                  return { ...prev, [selectedDate]: dateData };
                                });
                                setSaved(false);
                              }
                            }}
                            className={cn(
                              "px-3 py-1 rounded text-xs font-semibold border transition-all",
                              isAbsent
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-card text-muted-foreground border-border hover:bg-red-50 hover:text-red-600 hover:border-red-300",
                            )}
                            aria-label={`${student.name} अनुपस्थित`}
                          >
                            अनुपस्थित
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {stPct !== null ? (
                          <span
                            className={cn(
                              "font-semibold text-sm",
                              stPct >= 85
                                ? "text-emerald-600"
                                : stPct >= 70
                                  ? "text-amber-600"
                                  : "text-red-600",
                            )}
                          >
                            {stPct}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {isUnmarked ? "—" : "0%"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recorded dates summary */}
          {recordedDates.length > 0 && (
            <div className="text-xs text-muted-foreground">
              कुल सहेजी तिथियाँ:{" "}
              <span className="font-semibold text-foreground">
                {recordedDates.length}
              </span>{" "}
              ({recordedDates.slice(0, 3).map(formatDateLabel).join(", ")}
              {recordedDates.length > 3
                ? ` ... और ${recordedDates.length - 3}`
                : ""}
              )
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
