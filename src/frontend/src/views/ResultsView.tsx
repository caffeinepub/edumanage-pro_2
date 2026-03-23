import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { results } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const gradeColors: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700",
  A: "bg-emerald-100 text-emerald-700",
  "B+": "bg-blue-100 text-blue-700",
  B: "bg-blue-100 text-blue-700",
  "C+": "bg-amber-100 text-amber-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  F: "bg-red-100 text-red-700",
};

export function ResultsView() {
  const [search, setSearch] = useState("");

  const filtered = results.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()),
  );

  const passCount = filtered.filter((r) => r.status === "Pass").length;
  const failCount = filtered.filter((r) => r.status === "Fail").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Summary strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">
              {passCount} Passed
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 border border-red-200">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-red-700">
              {failCount} Failed
            </span>
          </div>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="results.search_input"
            className="pl-9"
            placeholder="Search by name or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card shadow-xs">
        <Table data-ocid="results.table">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Student Name
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Subject
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Marks
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Grade
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Status
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[80px]">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          result.marks >= 75
                            ? "bg-emerald-500"
                            : result.marks >= 50
                              ? "bg-amber-500"
                              : "bg-red-500",
                        )}
                        style={{ width: `${result.marks}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {result.marks}
                      <span className="text-muted-foreground">
                        /{result.totalMarks}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-semibold",
                      gradeColors[result.grade] ?? "bg-gray-100 text-gray-600",
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
                    {result.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="results.empty_state"
                >
                  No results match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
