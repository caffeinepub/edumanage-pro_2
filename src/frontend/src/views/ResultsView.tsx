import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ClipboardList, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

interface ResultRow {
  id: string;
  studentId: number;
  name: string;
  subject: string;
  examType: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: "Pass" | "Fail";
}

const gradeColors: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700",
  A: "bg-emerald-100 text-emerald-700",
  "B+": "bg-blue-100 text-blue-700",
  B: "bg-blue-100 text-blue-700",
  "C+": "bg-amber-100 text-amber-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-red-100 text-red-700",
  F: "bg-red-100 text-red-700",
};

const EXAM_TYPE_LABELS: Record<string, string> = {
  monthly: "मासिक",
  halfyearly: "अर्धवार्षिक",
  annual: "वार्षिक",
  project: "प्रोजेक्ट",
};

function getGrade(pct: number): string {
  if (pct >= 85) return "A+";
  if (pct >= 76) return "A";
  if (pct >= 66) return "B+";
  if (pct >= 56) return "B";
  if (pct >= 51) return "C+";
  if (pct >= 46) return "C";
  if (pct >= 33) return "D";
  return "E";
}

interface StoredStudent {
  id: number;
  name: string;
}

function loadResults(): ResultRow[] {
  const rows: ResultRow[] = [];

  // Load students from localStorage
  let students: StoredStudent[] = [];
  try {
    const raw = localStorage.getItem("students");
    if (raw) {
      const parsed = JSON.parse(raw) as StoredStudent[];
      if (Array.isArray(parsed)) students = parsed;
    }
  } catch {
    /* ignore */
  }

  if (students.length === 0) return [];

  const examTypes = ["monthly", "halfyearly", "annual", "project"];
  const maxMarksMap: Record<string, number> = {
    monthly: 60,
    halfyearly: 60,
    annual: 60,
    project: 20,
  };

  // Scan all emsmarks_v2_* keys
  for (const examType of examTypes) {
    // Find all keys for this exam type
    for (let k = 0; k < localStorage.length; k++) {
      const key = localStorage.key(k) ?? "";
      if (!key.startsWith(`emsmarks_v2_${examType}_`)) continue;
      const subject = key.replace(`emsmarks_v2_${examType}_`, "");
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as Record<
          string,
          { marks: string; present?: boolean; cancelled?: boolean }
        >;
        for (const [studentIdStr, data] of Object.entries(parsed)) {
          const studentId = Number(studentIdStr);
          const student = students.find((s) => s.id === studentId);
          if (!student) continue;
          const marksNum = Number(data.marks);
          if (Number.isNaN(marksNum) || data.marks === "") continue;
          const max = maxMarksMap[examType] ?? 60;
          const pct = Math.round((marksNum / max) * 100);
          const grade = getGrade(pct);
          rows.push({
            id: `${examType}_${subject}_${studentId}`,
            studentId,
            name: student.name,
            subject,
            examType: EXAM_TYPE_LABELS[examType] ?? examType,
            marks: marksNum,
            maxMarks: max,
            percentage: pct,
            grade,
            status: pct >= 33 ? "Pass" : "Fail",
          });
        }
      } catch {
        /* ignore */
      }
    }
  }

  return rows;
}

function clearAllResults() {
  const keysToRemove: string[] = [];
  for (let k = 0; k < localStorage.length; k++) {
    const key = localStorage.key(k) ?? "";
    if (key.startsWith("emsmarks_v2_") || key === "studentExamMarks") {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}

export function ResultsView() {
  const [search, setSearch] = useState("");
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [allResults, setAllResults] = useState<ResultRow[]>(() =>
    loadResults(),
  );

  const refresh = useCallback(() => {
    setAllResults(loadResults());
  }, []);

  const filtered = allResults.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.examType.includes(search),
  );

  const passCount = filtered.filter((r) => r.status === "Pass").length;
  const failCount = filtered.filter((r) => r.status === "Fail").length;

  function handleClearAll() {
    clearAllResults();
    refresh();
    setConfirmClearOpen(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Confirm Clear Dialog */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="results.clear_dialog">
          <DialogHeader>
            <DialogTitle>सभी परिणाम हटाएं?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Mark Entry में दर्ज सभी अंक एवं परिणाम स्थायी रूप से हट जाएंगे। क्या आप निश्चित
            हैं?
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
              data-ocid="results.confirm_clear_button"
              onClick={handleClearAll}
            >
              हाँ, हटाएं
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">
              {passCount} उत्तीर्ण
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 border border-red-200">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-red-700">
              {failCount} अनुत्तीर्ण
            </span>
          </div>
          {allResults.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              data-ocid="results.clear_button"
              className="flex items-center gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={() => setConfirmClearOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              सभी परिणाम हटाएं
            </Button>
          )}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="results.search_input"
            className="pl-9"
            placeholder="नाम या विषय खोजें…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table or empty state */}
      {allResults.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border bg-muted/30"
          data-ocid="results.empty_state"
        >
          <ClipboardList className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-base font-medium text-muted-foreground">
            कोई परिणाम नहीं मिले
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Mark Entry में अंक दर्ज करें — परिणाम यहाँ दिखेंगे
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card shadow-xs">
          <Table data-ocid="results.table">
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  छात्र का नाम
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  विषय
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  परीक्षा
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  अंक
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  ग्रेड
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  स्थिति
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((result, idx) => (
                <TableRow
                  key={result.id}
                  data-ocid={`results.row.${idx + 1}`}
                  className={idx % 2 === 0 ? "bg-card" : "bg-secondary/30"}
                >
                  <TableCell className="font-medium text-foreground">
                    {result.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {result.subject}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {result.examType}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[80px]">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            result.percentage >= 75
                              ? "bg-emerald-500"
                              : result.percentage >= 50
                                ? "bg-amber-500"
                                : "bg-red-500",
                          )}
                          style={{
                            width: `${Math.min(result.percentage, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {result.marks}
                        <span className="text-muted-foreground">
                          /{result.maxMarks}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-semibold",
                        gradeColors[result.grade] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {result.grade}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        result.status === "Pass"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-red-100 text-red-700 border border-red-200",
                      )}
                      data-ocid={`results.status.${idx + 1}`}
                    >
                      {result.status === "Pass" ? "उत्तीर्ण" : "अनुत्तीर्ण"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && allResults.length > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="results.no_match_state"
                  >
                    खोज से कोई परिणाम नहीं मिला।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
