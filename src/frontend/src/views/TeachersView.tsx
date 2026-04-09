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
import { Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const LS_KEY = "ems_added_teachers";

interface Teacher {
  id: number;
  name: string;
  subject: string;
  department: string;
  classes: string;
}

function loadTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Teacher[]) : [];
  } catch {
    return [];
  }
}

export function TeachersView() {
  const [teachers, setTeachers] = useState<Teacher[]>(loadTeachers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formClass, setFormClass] = useState("");

  function openAddDialog() {
    setFormName("");
    setFormSubject("");
    setFormDept("");
    setFormClass("");
    setDialogOpen(true);
  }

  function handleSaveTeacher(e: React.FormEvent) {
    e.preventDefault();
    const newTeacher: Teacher = {
      id: Date.now(),
      name: formName.trim(),
      subject: formSubject.trim(),
      department: formDept.trim() || "General",
      classes: formClass.trim(),
    };
    const updated = [...teachers, newTeacher];
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setTeachers(updated);
    setDialogOpen(false);
  }

  function handleClearAll() {
    localStorage.removeItem(LS_KEY);
    setTeachers([]);
    setConfirmClearOpen(false);
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
            <DialogTitle>नया शिक्षक जोड़ें</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTeacher} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-name">पूरा नाम</Label>
              <Input
                id="teacher-name"
                data-ocid="teachers.name_input"
                placeholder="जैसे: श्री रामलाल यादव"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-subject">विषय</Label>
              <Input
                id="teacher-subject"
                data-ocid="teachers.subject_input"
                placeholder="जैसे: गणित, हिन्दी"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-dept">विभाग</Label>
              <Input
                id="teacher-dept"
                placeholder="जैसे: विज्ञान, मानविकी"
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-class">कक्षा (नियुक्त)</Label>
              <Input
                id="teacher-class"
                data-ocid="teachers.class_input"
                placeholder="जैसे: 9, 10, 11"
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
                रद्द करें
              </Button>
              <Button type="submit" data-ocid="teachers.submit_button">
                शिक्षक जोड़ें
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Clear Dialog */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="teachers.clear_dialog"
        >
          <DialogHeader>
            <DialogTitle>सभी शिक्षक हटाएं?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            सभी {teachers.length} शिक्षकों का डेटा स्थायी रूप से हट जाएगा। क्या आप
            निश्चित हैं?
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
              data-ocid="teachers.confirm_clear_button"
              onClick={handleClearAll}
            >
              हाँ, हटाएं
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {teachers.length}
            </span>{" "}
            शिक्षक दर्ज हैं
          </p>
        </div>
        <div className="flex items-center gap-2">
          {teachers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              data-ocid="teachers.clear_button"
              className="flex items-center gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
              onClick={() => setConfirmClearOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              सभी शिक्षक हटाएं
            </Button>
          )}
          <Button
            data-ocid="teachers.add_button"
            className="flex items-center gap-2"
            onClick={openAddDialog}
          >
            <Plus className="w-4 h-4" />
            शिक्षक जोड़ें
          </Button>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border bg-muted/30"
          data-ocid="teachers.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-base font-medium text-muted-foreground">
            कोई शिक्षक नहीं मिले
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
            "शिक्षक जोड़ें" बटन से नया शिक्षक जोड़ें
          </p>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            पहला शिक्षक जोड़ें
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card shadow-xs">
          <Table data-ocid="teachers.table">
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  नाम
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  विषय
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  विभाग
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  कक्षा
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher, idx) => (
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
                          .filter((p) => p.length > 0)
                          .slice(0, 2)
                          .map((p) => p[0].toUpperCase())
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
                    <Badge variant="secondary" className="text-xs font-medium">
                      {teacher.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.split(/[,،]/).map((cls) => (
                        <Badge
                          key={cls.trim()}
                          variant="outline"
                          className="text-xs"
                        >
                          {cls.trim()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
