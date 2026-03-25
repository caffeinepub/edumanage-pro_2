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
  dateToHindiWords,
  dateToNumericFormat,
} from "@/utils/dateToHindiWords";
import { transliterateToHindi } from "@/utils/hindiTransliterate";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
  father?: string;
  mother?: string;
  samagraId?: string;
  aadharNo?: string;
  scholarNo?: string;
  nameHin?: string;
  fatherHin?: string;
  motherHin?: string;
  dob?: string; // stored as YYYY-MM-DD
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

// Small reusable Hindi field component
interface HindiFieldProps {
  id: string;
  label: string;
  value: string;
  isManual: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (val: string) => void;
  onManualEdit: () => void;
  onAutoReset: () => void;
}

function HindiField({
  id,
  label,
  value,
  isManual,
  inputRef,
  onChange,
  onManualEdit,
  onAutoReset,
}: HindiFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-2 flex-wrap">
        {label}
        {isManual ? (
          <span className="text-[10px] font-normal bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
            <Pencil className="w-2.5 h-2.5" />
            मैन्युअल संपादन
          </span>
        ) : (
          <span className="text-[10px] font-normal bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
            स्वतः भरा जाएगा
          </span>
        )}
        <button
          type="button"
          title="Hindi field edit करें"
          onClick={() => {
            onManualEdit();
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </Label>
      <Input
        id={id}
        ref={inputRef}
        value={value}
        placeholder="हिंदी नाम…"
        onChange={(e) => {
          onManualEdit();
          onChange(e.target.value);
        }}
        className={`${
          isManual
            ? "bg-green-50 text-green-900 focus-visible:ring-green-200"
            : "bg-blue-50 text-blue-800 focus-visible:ring-blue-200"
        } transition-colors`}
      />
      <div className="flex items-center gap-2 min-h-[16px]">
        <span className="text-xs text-muted-foreground">
          गलत हो तो हिंदी सुधारें
        </span>
        {isManual && (
          <button
            type="button"
            onClick={onAutoReset}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Auto reset करें
          </button>
        )}
      </div>
    </div>
  );
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

  // Form fields
  const [formName, setFormName] = useState("");
  const [formNameHindi, setFormNameHindi] = useState("");
  const [formNameHindiManual, setFormNameHindiManual] = useState(false);

  const [formClass, setFormClass] = useState("");
  const [formSection, setFormSection] = useState("");

  const [formFatherName, setFormFatherName] = useState("");
  const [formFatherNameHindi, setFormFatherNameHindi] = useState("");
  const [formFatherNameHindiManual, setFormFatherNameHindiManual] =
    useState(false);

  const [formMotherName, setFormMotherName] = useState("");
  const [formMotherNameHindi, setFormMotherNameHindi] = useState("");
  const [formMotherNameHindiManual, setFormMotherNameHindiManual] =
    useState(false);

  const [formSamagraId, setFormSamagraId] = useState("");
  const [formAadharNo, setFormAadharNo] = useState("");
  const [formScholarNo, setFormScholarNo] = useState("");
  const [formDob, setFormDob] = useState("");

  // Refs for focusing Hindi inputs
  const nameHindiRef = useRef<HTMLInputElement>(null);
  const fatherHindiRef = useRef<HTMLInputElement>(null);
  const motherHindiRef = useRef<HTMLInputElement>(null);

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

  // Sync full student list to "students" key for Mark Entry and Report Card
  // biome-ignore lint/correctness/useExhaustiveDependencies: allStudents is derived from these three deps
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(allStudents));
  }, [addedStudents, deletedIds, studentOverrides]);

  const filtered = baseList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()),
  );

  function resetForm() {
    setFormName("");
    setFormNameHindi("");
    setFormNameHindiManual(false);
    setFormClass("");
    setFormSection("");
    setFormFatherName("");
    setFormFatherNameHindi("");
    setFormFatherNameHindiManual(false);
    setFormMotherName("");
    setFormMotherNameHindi("");
    setFormMotherNameHindiManual(false);
    setFormSamagraId("");
    setFormAadharNo("");
    setFormScholarNo("");
    setFormDob("");
  }

  function openAddDialog() {
    setEditingStudent(null);
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(student: Student) {
    setEditingStudent(student);
    setFormName(student.name);
    setFormNameHindi(student.nameHin ?? transliterateToHindi(student.name));
    setFormNameHindiManual(false);
    setFormClass(student.class);
    setFormSection(student.section);
    setFormFatherName(student.father ?? "");
    setFormFatherNameHindi(
      student.fatherHin ?? transliterateToHindi(student.father ?? ""),
    );
    setFormFatherNameHindiManual(false);
    setFormMotherName(student.mother ?? "");
    setFormMotherNameHindi(
      student.motherHin ?? transliterateToHindi(student.mother ?? ""),
    );
    setFormMotherNameHindiManual(false);
    setFormSamagraId(student.samagraId ?? "");
    setFormAadharNo(student.aadharNo ?? "");
    setFormScholarNo(student.scholarNo ?? "");
    setFormDob(student.dob ?? "");
    setDialogOpen(true);
  }

  function handleSaveStudent(e: React.FormEvent) {
    e.preventDefault();
    const extraFields = {
      father: formFatherName.trim(),
      fatherHin: formFatherNameHindi.trim(),
      mother: formMotherName.trim(),
      motherHin: formMotherNameHindi.trim(),
      samagraId: formSamagraId.trim(),
      aadharNo: formAadharNo.trim(),
      scholarNo: formScholarNo.trim(),
      nameHin: formNameHindi.trim(),
      dob: formDob,
    };

    if (editingStudent) {
      const isAdded = addedStudents.some((s) => s.id === editingStudent.id);
      if (isAdded) {
        const updated = addedStudents.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: formName.trim(),
                class: formClass.trim(),
                section: formSection.trim(),
                ...extraFields,
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
            ...extraFields,
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
        ...extraFields,
      };
      const updated = [...addedStudents, newStudent];
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      setAddedStudents(updated);
    }
    setDialogOpen(false);
    setEditingStudent(null);
    resetForm();
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
        <DialogContent className="sm:max-w-2xl" data-ocid="students.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStudent} className="space-y-4">
            {/* Student Name — English + Hindi side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="student-name">Student Name (English)</Label>
                <Input
                  id="student-name"
                  data-ocid="students.name_input"
                  placeholder="e.g. Ramesh Kumar"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!formNameHindiManual) {
                      setFormNameHindi(transliterateToHindi(e.target.value));
                    }
                  }}
                  required
                />
              </div>
              <HindiField
                id="student-name-hindi"
                label="छात्र का नाम (Hindi)"
                value={formNameHindi}
                isManual={formNameHindiManual}
                inputRef={nameHindiRef}
                onChange={setFormNameHindi}
                onManualEdit={() => setFormNameHindiManual(true)}
                onAutoReset={() => {
                  setFormNameHindiManual(false);
                  setFormNameHindi(transliterateToHindi(formName));
                }}
              />
            </div>

            {/* Father Name — English + Hindi */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="father-name">पिता का नाम (English)</Label>
                <Input
                  id="father-name"
                  data-ocid="students.input"
                  placeholder="e.g. Ramesh Kumar"
                  value={formFatherName}
                  onChange={(e) => {
                    setFormFatherName(e.target.value);
                    if (!formFatherNameHindiManual) {
                      setFormFatherNameHindi(
                        transliterateToHindi(e.target.value),
                      );
                    }
                  }}
                />
              </div>
              <HindiField
                id="father-name-hindi"
                label="पिता का नाम (Hindi)"
                value={formFatherNameHindi}
                isManual={formFatherNameHindiManual}
                inputRef={fatherHindiRef}
                onChange={setFormFatherNameHindi}
                onManualEdit={() => setFormFatherNameHindiManual(true)}
                onAutoReset={() => {
                  setFormFatherNameHindiManual(false);
                  setFormFatherNameHindi(transliterateToHindi(formFatherName));
                }}
              />
            </div>

            {/* Mother Name — English + Hindi */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="mother-name">माता का नाम (English)</Label>
                <Input
                  id="mother-name"
                  data-ocid="students.input"
                  placeholder="e.g. Sunita Devi"
                  value={formMotherName}
                  onChange={(e) => {
                    setFormMotherName(e.target.value);
                    if (!formMotherNameHindiManual) {
                      setFormMotherNameHindi(
                        transliterateToHindi(e.target.value),
                      );
                    }
                  }}
                />
              </div>
              <HindiField
                id="mother-name-hindi"
                label="माता का नाम (Hindi)"
                value={formMotherNameHindi}
                isManual={formMotherNameHindiManual}
                inputRef={motherHindiRef}
                onChange={setFormMotherNameHindi}
                onManualEdit={() => setFormMotherNameHindiManual(true)}
                onAutoReset={() => {
                  setFormMotherNameHindiManual(false);
                  setFormMotherNameHindi(transliterateToHindi(formMotherName));
                }}
              />
            </div>

            {/* Samagra ID & Aadhar No */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="samagra-id">समग्र आई.डी. (Samagra ID)</Label>
                <Input
                  id="samagra-id"
                  data-ocid="students.input"
                  placeholder="9-digit Samagra ID"
                  value={formSamagraId}
                  onChange={(e) => setFormSamagraId(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="aadhar-no">आधार नं. (Aadhar No.)</Label>
                <Input
                  id="aadhar-no"
                  data-ocid="students.input"
                  placeholder="12-digit Aadhar number"
                  value={formAadharNo}
                  onChange={(e) => setFormAadharNo(e.target.value)}
                />
              </div>
            </div>

            {/* Scholar No */}
            <div className="space-y-1.5">
              <Label htmlFor="scholar-no">स्कॉलर क्रमांक (Scholar No.)</Label>
              <Input
                id="scholar-no"
                data-ocid="students.input"
                placeholder="Scholar number"
                value={formScholarNo}
                onChange={(e) => setFormScholarNo(e.target.value)}
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="student-dob">जन्म तिथि (Date of Birth)</Label>
                <Input
                  id="student-dob"
                  type="date"
                  data-ocid="students.input"
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                />
              </div>
              {formDob && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      जन्म तिथि (अंकों में)
                    </Label>
                    <div className="px-3 py-2 rounded-md border border-border bg-secondary/40 text-sm font-mono font-medium">
                      {dateToNumericFormat(formDob)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      जन्म तिथि (शब्दों में)
                    </Label>
                    <div className="px-3 py-2 rounded-md border border-blue-200 bg-blue-50 text-sm text-blue-900 font-medium">
                      {dateToHindiWords(formDob)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Class & Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
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
