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
import { teachers as mockTeachers } from "@/data/mockData";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const LS_KEY = "ems_added_teachers";

const deptColors: Record<string, string> = {
  Science: "bg-blue-100 text-blue-700",
  Humanities: "bg-purple-100 text-purple-700",
  "Social Studies": "bg-amber-100 text-amber-700",
  Technology: "bg-emerald-100 text-emerald-700",
};

interface Teacher {
  id: number;
  name: string;
  subject: string;
  department: string;
  classes: string;
}

function loadAddedTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Teacher[]) : [];
  } catch {
    return [];
  }
}

export function TeachersView() {
  const [addedTeachers, setAddedTeachers] =
    useState<Teacher[]>(loadAddedTeachers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formClass, setFormClass] = useState("");

  const allTeachers: Teacher[] = [...mockTeachers, ...addedTeachers];

  function openAddDialog() {
    setFormName("");
    setFormSubject("");
    setFormClass("");
    setDialogOpen(true);
  }

  function handleSaveTeacher(e: React.FormEvent) {
    e.preventDefault();
    const newTeacher: Teacher = {
      id: Date.now(),
      name: formName.trim(),
      subject: formSubject.trim(),
      department: "General",
      classes: formClass.trim(),
    };
    const updated = [...addedTeachers, newTeacher];
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setAddedTeachers(updated);
    setDialogOpen(false);
    setFormName("");
    setFormSubject("");
    setFormClass("");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Add Teacher Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="teachers.dialog">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTeacher} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-name">Full Name</Label>
              <Input
                id="teacher-name"
                data-ocid="teachers.name_input"
                placeholder="e.g. Mr. Ali Hassan"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-subject">Subject</Label>
              <Input
                id="teacher-subject"
                data-ocid="teachers.subject_input"
                placeholder="e.g. Mathematics"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-class">Class Assigned</Label>
              <Input
                id="teacher-class"
                data-ocid="teachers.class_input"
                placeholder="e.g. 10-A, 11-B"
                value={formClass}
                onChange={(e) => setFormClass(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                data-ocid="teachers.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" data-ocid="teachers.submit_button">
                Add Teacher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {allTeachers.length}
            </span>{" "}
            teachers on record
          </p>
        </div>
        <Button
          data-ocid="teachers.add_button"
          className="flex items-center gap-2"
          onClick={openAddDialog}
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-card shadow-xs">
        <Table data-ocid="teachers.table">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Name
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Subject
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Department
              </TableHead>
              <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Classes Assigned
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTeachers.map((teacher, idx) => (
              <TableRow
                key={teacher.id}
                data-ocid={`teachers.row.${idx + 1}`}
                className={idx % 2 === 0 ? "bg-card" : "bg-secondary/30"}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                      {teacher.name
                        .split(" ")
                        .filter((p) => /^[A-Z]/.test(p))
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-foreground">
                      {teacher.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">
                  {teacher.subject}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      deptColors[teacher.department] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {teacher.department}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {teacher.classes.split(", ").map((cls) => (
                      <Badge key={cls} variant="outline" className="text-xs">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
