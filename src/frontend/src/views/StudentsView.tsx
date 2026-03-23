import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { students as mockStudents } from "@/data/mockData";
import type { Role } from "@/hooks/useAuth";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const LS_KEY = "ems_added_students";
const LS_DELETED_KEY = "ems_deleted_ids";
const LS_OVERRIDES_KEY = "ems_student_overrides";

interface Student {
  id: number;
  name: string;
  class: string;
  section: string;
  rollNo: string;
  attendance: number;
  grade: string;
}

function loadAddedStudents(): Student[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Student[]) : [];
  } catch {
    return [];
  }
}

function loadDeletedIds(): number[] {
  try {
    const raw = localStorage.getItem(LS_DELETED_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function loadStudentOverrides(): Record<number, Partial<Student>> {
  try {
    const raw = localStorage.getItem(LS_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<number, Partial<Student>>) : {};
  } catch {
    return {};
  }
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  F: "bg-red-100 text-red-700",
};

interface StudentsViewProps {
  onViewDetail: (studentId: number) => void;
  role: Role;
  username: string;
}

export function StudentsView({
  onViewDetail,
  role,
  username,
}: StudentsViewProps) {
  const [search, setSearch] = useState("");
  const [addedStudents, setAddedStudents] =
    useState<Student[]>(loadAddedStudents);
  const [deletedIds, setDeletedIds] = useState<number[]>(loadDeletedIds);
  const [studentOverrides, setStudentOverrides] =
    useState<Record<number, Partial<Student>>>(loadStudentOverrides);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formClass, setFormClass] = useState("");
  const [formSection, setFormSection] = useState("");

  const allStudents: Student[] = [
    ...mockStudents
      .map((s) =>
        deletedIds.includes(s.id) ? null : { ...s, ...studentOverrides[s.id] },
      )
      .filter((s): s is Student => s !== null),
    ...addedStudents.filter((s) => !deletedIds.includes(s.id)),
  ];

  const baseList =
    role === "student"
      ? allStudents.filter(
          (s) => s.name.toLowerCase() === username.toLowerCase(),
        )
      : allStudents;

  const filtered = baseList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()),
  );

  function openAddDialog() {
    setEditingStudent(null);
    setFormName("");
    setFormClass("");
    setFormSection("");
    setDialogOpen(true);
  }

  function openEditDialog(student: Student) {
    setEditingStudent(student);
    setFormName(student.name);
    setFormClass(student.class);
    setFormSection(student.section);
    setDialogOpen(true);
  }

  function handleSaveStudent(e: React.FormEvent) {
    e.preventDefault();
    if (editingStudent) {
      // Check if it's an added student
      const isAdded = addedStudents.some((s) => s.id === editingStudent.id);
      if (isAdded) {
        const updated = addedStudents.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: formName.trim(),
                class: formClass.trim(),
                section: formSection.trim(),
              }
            : s,
        );
        localStorage.setItem(LS_KEY, JSON.stringify(updated));
        setAddedStudents(updated);
      } else {
        const updatedOverrides = {
          ...studentOverrides,
          [editingStudent.id]: {
            ...studentOverrides[editingStudent.id],
            name: formName.trim(),
            class: formClass.trim(),
            section: formSection.trim(),
          },
        };
        localStorage.setItem(
          LS_OVERRIDES_KEY,
          JSON.stringify(updatedOverrides),
        );
        setStudentOverrides(updatedOverrides);
      }
    } else {
      const suffix = Math.floor(Math.random() * 900 + 100);
      const newStudent: Student = {
        id: Date.now(),
        name: formName.trim(),
        class: formClass.trim(),
        section: formSection.trim(),
        rollNo: `${formClass.trim().replace(/\s+/g, "").toUpperCase()}-${suffix}`,
        attendance: 85,
        grade: "B",
      };
      const updated = [...addedStudents, newStudent];
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      setAddedStudents(updated);
    }
    setDialogOpen(false);
    setEditingStudent(null);
    setFormName("");
    setFormClass("");
    setFormSection("");
  }

  function handleDeleteConfirm() {
    if (deleteTargetId === null) return;
    const isAdded = addedStudents.some((s) => s.id === deleteTargetId);
    if (isAdded) {
      const updated = addedStudents.filter((s) => s.id !== deleteTargetId);
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      setAddedStudents(updated);
    } else {
      const updated = [...deletedIds, deleteTargetId];
      localStorage.setItem(LS_DELETED_KEY, JSON.stringify(updated));
      setDeletedIds(updated);
    }
    setDeleteTargetId(null);
  }

  const showActions = role === "admin" || role === "teacher";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Add/Edit Student Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="students.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">Full Name</Label>
              <Input
                id="student-name"
                data-ocid="students.name_input"
                placeholder="e.g. Aisha Khan"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-class">Class</Label>
              <Input
                id="student-class"
                data-ocid="students.class_input"
                placeholder="e.g. 10-A"
                value={formClass}
                onChange={(e) => setFormClass(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-section">Section</Label>
              <Input
                id="student-section"
                data-ocid="students.section_input"
                placeholder="e.g. A"
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="students.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" data-ocid="students.submit_button">
                {editingStudent ? "Save Changes" : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent data-ocid="students.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="students.cancel_button"
              onClick={() => setDeleteTargetId(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="students.confirm_button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="students.search_input"
            className="pl-9"
            placeholder="Search by name, class, roll no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {role === "admin" && (
          <Button
            data-ocid="students.add_button"
            className="flex items-center gap-2"
            onClick={openAddDialog}
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        )}
      </div>

      {/* Summary strip */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {baseList.length}
          </span>{" "}
          students
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card shadow-xs">
        <Table data-ocid="students.table">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  Student Name{" "}
                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Class
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Roll No.
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  Attendance %{" "}
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Grade
              </TableHead>
              {showActions && (
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((student, idx) => (
              <TableRow
                key={student.id}
                data-ocid={`students.row.${idx + 1}`}
                className={idx % 2 === 0 ? "bg-card" : "bg-secondary/30"}
              >
                <TableCell className="font-medium">
                  <button
                    type="button"
                    data-ocid={`students.item.${idx + 1}`}
                    onClick={() => onViewDetail(student.id)}
                    className="text-primary hover:underline font-medium text-left cursor-pointer"
                  >
                    {student.name}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-medium">
                    {student.class}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {student.rollNo}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[80px]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          student.attendance >= 85
                            ? "bg-emerald-500"
                            : student.attendance >= 70
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${student.attendance}%` }}
                      />
                    </div>
                    <span className="text-sm text-foreground font-medium">
                      {student.attendance}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      gradeColors[student.grade] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {student.grade}
                  </span>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {role === "admin" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          data-ocid={`students.edit_button.${idx + 1}`}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => openEditDialog(student)}
                          title="Edit student"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        data-ocid={`students.delete_button.${idx + 1}`}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTargetId(student.id)}
                        title="Delete student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="students.empty_state"
                >
                  No students match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
