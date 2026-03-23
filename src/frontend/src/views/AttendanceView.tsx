import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attendanceDates, attendanceRecords } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";

const classes = ["All Classes", "10-A", "10-B", "9-A", "9-B", "8-A", "8-B"];
const months = ["March 2026", "February 2026", "January 2026", "December 2025"];

export function AttendanceView() {
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedMonth, setSelectedMonth] = useState("March 2026");

  const filtered =
    selectedClass === "All Classes"
      ? attendanceRecords
      : attendanceRecords.filter((r) => r.class === selectedClass);

  const totalPresent = filtered.reduce(
    (acc, r) => acc + Object.values(r.dates).filter(Boolean).length,
    0,
  );
  const totalSlots = filtered.length * attendanceDates.length;
  const overallPct =
    totalSlots > 0 ? Math.round((totalPresent / totalSlots) * 100) : 0;

  // suppress unused warning for month (UI-only filter)
  void selectedMonth;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            Month:
          </span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger data-ocid="attendance.month_select" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            Class:
          </span>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger data-ocid="attendance.class_select" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <span className="text-sm text-muted-foreground">Overall:</span>
          <span
            className={cn(
              "text-base font-bold",
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
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm bg-emerald-500 inline-block" />{" "}
          Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm bg-red-400 inline-block" /> Absent
        </span>
      </div>

      {/* Attendance table */}
      <div className="rounded-lg border border-border overflow-x-auto bg-card shadow-xs">
        <table className="w-full text-sm" data-ocid="attendance.table">
          <thead>
            <tr className="bg-secondary/60 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                Student Name
              </th>
              <th className="text-left px-3 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                Class
              </th>
              {attendanceDates.map((d) => (
                <th
                  key={d}
                  className="text-center px-3 py-3 font-semibold text-foreground text-xs uppercase tracking-wider whitespace-nowrap"
                >
                  {d}
                </th>
              ))}
              <th className="text-center px-3 py-3 font-semibold text-foreground text-xs uppercase tracking-wider">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record, idx) => {
              const presentCount = Object.values(record.dates).filter(
                Boolean,
              ).length;
              const pct = Math.round(
                (presentCount / attendanceDates.length) * 100,
              );
              return (
                <tr
                  key={record.studentId}
                  data-ocid={`attendance.row.${idx + 1}`}
                  className={cn(
                    "border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors",
                    idx % 2 === 0 ? "bg-card" : "bg-secondary/20",
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {record.name}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {record.class}
                  </td>
                  {attendanceDates.map((d) => (
                    <td key={d} className="px-3 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold",
                          record.dates[d]
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600",
                        )}
                      >
                        {record.dates[d] ? "P" : "A"}
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center">
                    <span
                      className={cn(
                        "font-semibold",
                        pct >= 85
                          ? "text-emerald-600"
                          : pct >= 70
                            ? "text-amber-600"
                            : "text-red-600",
                      )}
                    >
                      {pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={attendanceDates.length + 3}
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="attendance.empty_state"
                >
                  No attendance records for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
