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
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const LS_KEY = "ems_added_students";
const LS_DELETED_KEY = "ems_deleted_ids";
const LS_OVERRIDES_KEY = "ems_student_overrides";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C", "D"];
const CATEGORIES = ["सामान्य", "OBC", "SC", "ST", "अन्य"];
const RELIGIONS = ["हिन्दू", "मुस्लिम", "सिख", "ईसाई", "बौद्ध", "जैन", "अन्य"];
const GENDERS = ["पुरुष", "महिला", "अन्य"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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
  dob?: string;
  // Guardian
  guardianEng?: string;
  guardianHin?: string;
  guardianRelation?: string;
  // Personal
  gender?: string;
  bloodGroup?: string;
  category?: string;
  religion?: string;
  nationality?: string;
  motherTongue?: string;
  cwsn?: string;
  // IDs
  apaarId?: string;
  bplNo?: string;
  schoolCode?: string;
  udiseCode?: string;
  // Academic
  admissionDate?: string;
  previousSchool?: string;
  previousClass?: string;
  tcNo?: string;
  tcDate?: string;
  // Address
  address?: string;
  village?: string;
  post?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  pincode?: string;
  // Contact
  mobileNo?: string;
  alternateMobile?: string;
  email?: string;
  // NEW: Profile & Documents
  profileId?: string;
  dbtStatus?: "हाँ" | "नहीं";
  studentPhoto?: string;
  aadharPhoto?: string;
  castePhoto?: string;
  incomePhoto?: string;
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

function generateProfileId(count: number): string {
  const year = new Date().getFullYear();
  return `STU-${year}-${String(count + 1).padStart(4, "0")}`;
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

// Section header component for form sections
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-sm font-semibold text-muted-foreground border-b border-border pb-1 mt-5 mb-3">
      {title}
    </div>
  );
}

// Expanded detail card shown below a table row
interface ExpandedStudentDetailProps {
  student: Student;
}

function ExpandedStudentDetail({ student }: ExpandedStudentDetailProps) {
  const InfoRow = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    ) : null;

  const docs = [
    { src: student.studentPhoto, label: "छात्र फोटो" },
    { src: student.aadharPhoto, label: "आधार कार्ड" },
    { src: student.castePhoto, label: "जाति प्रमाण पत्र" },
    { src: student.incomePhoto, label: "आय प्रमाण पत्र" },
  ].filter((d) => d.src);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="bg-secondary/20 border-t border-border px-4 py-4"
    >
      {/* Profile ID & DBT Status row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {student.profileId && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            🪪 {student.profileId}
          </span>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3">
        <InfoRow label="रोल नं." value={student.rollNo} />
        <InfoRow label="कक्षा" value={student.class} />
        <InfoRow label="अनुभाग" value={student.section} />
        <InfoRow label="स्कॉलर क्रमांक" value={student.scholarNo} />
        <InfoRow
          label="पिता का नाम (हिंदी)"
          value={student.fatherHin ?? student.father}
        />
        <InfoRow
          label="माता का नाम (हिंदी)"
          value={student.motherHin ?? student.mother}
        />
        <InfoRow
          label="जन्म तिथि"
          value={student.dob ? dateToNumericFormat(student.dob) : undefined}
        />
        <InfoRow
          label="जन्म तिथि (शब्दों में)"
          value={student.dob ? dateToHindiWords(student.dob) : undefined}
        />
        <InfoRow label="समग्र आईडी" value={student.samagraId} />
        <InfoRow label="आधार नं." value={student.aadharNo} />
        <InfoRow label="लिंग" value={student.gender} />
        <InfoRow label="रक्त समूह" value={student.bloodGroup} />
        <InfoRow label="जाति" value={student.category} />
        <InfoRow label="धर्म" value={student.religion} />
        <InfoRow label="APAAR ID" value={student.apaarId} />
        <InfoRow label="BPL नं." value={student.bplNo} />
        <InfoRow label="पता" value={student.address} />
        <InfoRow label="जिला" value={student.district} />
        <InfoRow label="राज्य" value={student.state} />
        <InfoRow label="पिनकोड" value={student.pincode} />
        <InfoRow label="मोबाइल नं." value={student.mobileNo} />
        <InfoRow label="ईमेल" value={student.email} />
      </div>

      {/* Documents row */}
      {docs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            📎 दस्तावेज़
          </p>
          <div className="flex flex-wrap gap-4">
            {docs.map((doc) => (
              <div key={doc.label} className="flex flex-col items-center gap-1">
                <a href={doc.src} target="_blank" rel="noopener noreferrer">
                  <img
                    src={doc.src}
                    alt={doc.label}
                    className="w-20 h-20 object-cover rounded-md border border-border shadow-sm hover:opacity-80 transition-opacity"
                  />
                </a>
                <span className="text-[10px] text-muted-foreground text-center">
                  {doc.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
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
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // === EXISTING FORM FIELDS ===
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

  // === NEW FORM FIELDS ===
  // Guardian
  const [formGuardianEng, setFormGuardianEng] = useState("");
  const [formGuardianHin, setFormGuardianHin] = useState("");
  const [formGuardianHinManual, setFormGuardianHinManual] = useState(false);
  const [formGuardianRelation, setFormGuardianRelation] = useState("");

  // Personal
  const [formGender, setFormGender] = useState("");
  const [formBloodGroup, setFormBloodGroup] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formReligion, setFormReligion] = useState("");
  const [formNationality, setFormNationality] = useState("भारतीय");
  const [formMotherTongue, setFormMotherTongue] = useState("हिन्दी");
  const [formCwsn, setFormCwsn] = useState("नहीं");

  // IDs
  const [formApaarId, setFormApaarId] = useState("");
  const [formBplNo, setFormBplNo] = useState("");
  const [formSchoolCode, setFormSchoolCode] = useState("");
  const [formUdiseCode, setFormUdiseCode] = useState("");

  // Academic
  const [formAdmissionDate, setFormAdmissionDate] = useState("");
  const [formPreviousSchool, setFormPreviousSchool] = useState("");
  const [formPreviousClass, setFormPreviousClass] = useState("");
  const [formTcNo, setFormTcNo] = useState("");
  const [formTcDate, setFormTcDate] = useState("");

  // Address
  const [formAddress, setFormAddress] = useState("");
  const [formVillage, setFormVillage] = useState("");
  const [formPost, setFormPost] = useState("");
  const [formTehsil, setFormTehsil] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formState, setFormState] = useState("मध्यप्रदेश");
  const [formPincode, setFormPincode] = useState("");

  // Contact
  const [formMobileNo, setFormMobileNo] = useState("");
  const [formAlternateMobile, setFormAlternateMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");

  // === DOCUMENT & PROFILE FIELDS ===
  const [formDbtStatus, setFormDbtStatus] = useState<"हाँ" | "नहीं">("नहीं");

  // Refs for focusing Hindi inputs
  const nameHindiRef = useRef<HTMLInputElement>(null);
  const fatherHindiRef = useRef<HTMLInputElement>(null);
  const motherHindiRef = useRef<HTMLInputElement>(null);
  const guardianHindiRef = useRef<HTMLInputElement>(null);

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
    // Guardian
    setFormGuardianEng("");
    setFormGuardianHin("");
    setFormGuardianHinManual(false);
    setFormGuardianRelation("");
    // Personal
    setFormGender("");
    setFormBloodGroup("");
    setFormCategory("");
    setFormReligion("");
    setFormNationality("भारतीय");
    setFormMotherTongue("हिन्दी");
    setFormCwsn("नहीं");
    // IDs
    setFormApaarId("");
    setFormBplNo("");
    setFormSchoolCode("");
    setFormUdiseCode("");
    // Academic
    setFormAdmissionDate("");
    setFormPreviousSchool("");
    setFormPreviousClass("");
    setFormTcNo("");
    setFormTcDate("");
    // Address
    setFormAddress("");
    setFormVillage("");
    setFormPost("");
    setFormTehsil("");
    setFormDistrict("");
    setFormState("मध्यप्रदेश");
    setFormPincode("");
    // Contact
    setFormMobileNo("");
    setFormAlternateMobile("");
    setFormEmail("");
    // DBT
    setFormDbtStatus("नहीं");
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
    // Guardian
    setFormGuardianEng(student.guardianEng ?? "");
    setFormGuardianHin(student.guardianHin ?? "");
    setFormGuardianHinManual(!!student.guardianHin);
    setFormGuardianRelation(student.guardianRelation ?? "");
    // Personal
    setFormGender(student.gender ?? "");
    setFormBloodGroup(student.bloodGroup ?? "");
    setFormCategory(student.category ?? "");
    setFormReligion(student.religion ?? "");
    setFormNationality(student.nationality ?? "भारतीय");
    setFormMotherTongue(student.motherTongue ?? "हिन्दी");
    setFormCwsn(student.cwsn ?? "नहीं");
    // IDs
    setFormApaarId(student.apaarId ?? "");
    setFormBplNo(student.bplNo ?? "");
    setFormSchoolCode(student.schoolCode ?? "");
    setFormUdiseCode(student.udiseCode ?? "");
    // Academic
    setFormAdmissionDate(student.admissionDate ?? "");
    setFormPreviousSchool(student.previousSchool ?? "");
    setFormPreviousClass(student.previousClass ?? "");
    setFormTcNo(student.tcNo ?? "");
    setFormTcDate(student.tcDate ?? "");
    // Address
    setFormAddress(student.address ?? "");
    setFormVillage(student.village ?? "");
    setFormPost(student.post ?? "");
    setFormTehsil(student.tehsil ?? "");
    setFormDistrict(student.district ?? "");
    setFormState(student.state ?? "मध्यप्रदेश");
    setFormPincode(student.pincode ?? "");
    // Contact
    setFormMobileNo(student.mobileNo ?? "");
    setFormAlternateMobile(student.alternateMobile ?? "");
    setFormEmail(student.email ?? "");
    // DBT
    setFormDbtStatus(student.dbtStatus ?? "नहीं");
    setDialogOpen(true);
  }

  // Compute new profile ID for add
  const newProfileId = generateProfileId(addedStudents.length);

  function handleSaveStudent(e: React.FormEvent) {
    e.preventDefault();

    // Digit-length validation (fields are optional but if filled must match)
    if (formSamagraId.trim() && formSamagraId.trim().length !== 9) {
      alert("समग्र आई.डी. ठीक 9 अंकों की होनी चाहिए।");
      return;
    }
    if (formAadharNo.trim() && formAadharNo.trim().length !== 12) {
      alert("आधार नं. ठीक 12 अंकों का होना चाहिए।");
      return;
    }
    if (formMobileNo.trim() && formMobileNo.trim().length !== 10) {
      alert("मोबाइल नं. ठीक 10 अंकों का होना चाहिए।");
      return;
    }

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
      // Guardian
      guardianEng: formGuardianEng.trim(),
      guardianHin: formGuardianHin.trim(),
      guardianRelation: formGuardianRelation.trim(),
      // Personal
      gender: formGender,
      bloodGroup: formBloodGroup,
      category: formCategory,
      religion: formReligion,
      nationality: formNationality.trim(),
      motherTongue: formMotherTongue.trim(),
      cwsn: formCwsn,
      // IDs
      apaarId: formApaarId.trim(),
      bplNo: formBplNo.trim(),
      schoolCode: formSchoolCode.trim(),
      udiseCode: formUdiseCode.trim(),
      // Academic
      admissionDate: formAdmissionDate,
      previousSchool: formPreviousSchool.trim(),
      previousClass: formPreviousClass.trim(),
      tcNo: formTcNo.trim(),
      tcDate: formTcDate,
      // Address
      address: formAddress.trim(),
      village: formVillage.trim(),
      post: formPost.trim(),
      tehsil: formTehsil.trim(),
      district: formDistrict.trim(),
      state: formState.trim(),
      pincode: formPincode.trim(),
      // Contact
      mobileNo: formMobileNo.trim(),
      alternateMobile: formAlternateMobile.trim(),
      email: formEmail.trim(),
      // DBT
      dbtStatus: formDbtStatus,
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
        profileId: newProfileId,
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

  function handleClearAll() {
    localStorage.setItem(LS_KEY, JSON.stringify([]));
    setAddedStudents([]);
    const allMockIds = mockStudents.map((s) => s.id);
    const updatedDeleted = Array.from(new Set([...deletedIds, ...allMockIds]));
    localStorage.setItem(LS_DELETED_KEY, JSON.stringify(updatedDeleted));
    setDeletedIds(updatedDeleted);
    localStorage.setItem(LS_OVERRIDES_KEY, JSON.stringify({}));
    setStudentOverrides({});
    localStorage.setItem("students", JSON.stringify([]));
    setClearAllConfirm(false);
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
        <DialogContent
          className="sm:max-w-3xl max-h-[90vh] flex flex-col"
          data-ocid="students.dialog"
        >
          <DialogHeader className="pb-2">
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSaveStudent}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-1 space-y-1 pr-2">
              {/* Profile ID badge (only for new student) */}
              {!editingStudent && (
                <div className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 mb-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    प्रोफाइल आईडी (Profile ID):
                  </span>
                  <span className="font-mono text-sm font-bold text-primary tracking-wide">
                    {newProfileId}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    स्वतः निर्मित
                  </span>
                </div>
              )}
              {editingStudent?.profileId && (
                <div className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 mb-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    प्रोफाइल आईडी (Profile ID):
                  </span>
                  <span className="font-mono text-sm font-bold text-primary tracking-wide">
                    {editingStudent.profileId}
                  </span>
                </div>
              )}

              {/* ===== STUDENT NAME ===== */}
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

              {/* Father Name */}
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
                    setFormFatherNameHindi(
                      transliterateToHindi(formFatherName),
                    );
                  }}
                />
              </div>

              {/* Mother Name */}
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
                    setFormMotherNameHindi(
                      transliterateToHindi(formMotherName),
                    );
                  }}
                />
              </div>

              {/* ===== SECTION 4: संरक्षक विवरण ===== */}
              <SectionHeader title="📋 संरक्षक विवरण (Guardian Details)" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="guardian-eng">संरक्षक का नाम (English)</Label>
                  <Input
                    id="guardian-eng"
                    data-ocid="students.input"
                    placeholder="Guardian name in English"
                    value={formGuardianEng}
                    onChange={(e) => {
                      setFormGuardianEng(e.target.value);
                      if (!formGuardianHinManual) {
                        setFormGuardianHin(
                          transliterateToHindi(e.target.value),
                        );
                      }
                    }}
                  />
                </div>
                <HindiField
                  id="guardian-hin"
                  label="संरक्षक का नाम (Hindi)"
                  value={formGuardianHin}
                  isManual={formGuardianHinManual}
                  inputRef={guardianHindiRef}
                  onChange={setFormGuardianHin}
                  onManualEdit={() => setFormGuardianHinManual(true)}
                  onAutoReset={() => {
                    setFormGuardianHinManual(false);
                    setFormGuardianHin(transliterateToHindi(formGuardianEng));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardian-relation">
                  संरक्षक का संबंध (Relation)
                </Label>
                <Input
                  id="guardian-relation"
                  data-ocid="students.input"
                  placeholder="e.g. Uncle, Grandfather"
                  value={formGuardianRelation}
                  onChange={(e) => setFormGuardianRelation(e.target.value)}
                />
              </div>

              {/* ===== SECTION 1: व्यक्तिगत विवरण ===== */}
              <SectionHeader title="👤 व्यक्तिगत विवरण (Personal Details)" />

              {/* DOB */}
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

              {/* Gender & Blood Group */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gender">लिंग (Gender)</Label>
                  <select
                    id="gender"
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- चुनें --</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="blood-group">रक्त समूह (Blood Group)</Label>
                  <select
                    id="blood-group"
                    value={formBloodGroup}
                    onChange={(e) => setFormBloodGroup(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- चुनें --</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cwsn">CWSN (दिव्यांग)</Label>
                  <select
                    id="cwsn"
                    value={formCwsn}
                    onChange={(e) => setFormCwsn(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="नहीं">नहीं</option>
                    <option value="हाँ">हाँ</option>
                  </select>
                </div>
              </div>

              {/* Category & Religion */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">श्रेणी (Category)</Label>
                  <select
                    id="category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- चुनें --</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="religion">धर्म (Religion)</Label>
                  <select
                    id="religion"
                    value={formReligion}
                    onChange={(e) => setFormReligion(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- चुनें --</option>
                    {RELIGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nationality & Mother Tongue */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nationality">राष्ट्रीयता (Nationality)</Label>
                  <Input
                    id="nationality"
                    data-ocid="students.input"
                    placeholder="भारतीय"
                    value={formNationality}
                    onChange={(e) => setFormNationality(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mother-tongue">मातृभाषा (Mother Tongue)</Label>
                  <Input
                    id="mother-tongue"
                    data-ocid="students.input"
                    placeholder="हिन्दी"
                    value={formMotherTongue}
                    onChange={(e) => setFormMotherTongue(e.target.value)}
                  />
                </div>
              </div>

              {/* ===== SECTION 2: पहचान संख्या ===== */}
              <SectionHeader title="🪪 पहचान संख्या (ID Numbers)" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="samagra-id">समग्र आई.डी. (Samagra ID)</Label>
                  <Input
                    id="samagra-id"
                    data-ocid="students.input"
                    placeholder="समग्र आई.डी. (9 अंक)"
                    maxLength={9}
                    inputMode="numeric"
                    value={formSamagraId}
                    onChange={(e) =>
                      setFormSamagraId(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  {formSamagraId.length > 0 && formSamagraId.length !== 9 && (
                    <p className="text-xs text-destructive">
                      {formSamagraId.length}/9 अंक — ठीक 9 अंक आवश्यक हैं
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="aadhar-no">आधार नं. (Aadhar No.)</Label>
                  <Input
                    id="aadhar-no"
                    data-ocid="students.input"
                    placeholder="आधार नं. (12 अंक)"
                    maxLength={12}
                    inputMode="numeric"
                    value={formAadharNo}
                    onChange={(e) =>
                      setFormAadharNo(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  {formAadharNo.length > 0 && formAadharNo.length !== 12 && (
                    <p className="text-xs text-destructive">
                      {formAadharNo.length}/12 अंक — ठीक 12 अंक आवश्यक हैं
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="scholar-no">स्कॉलर क्रमांक (Scholar No.)</Label>
                  <Input
                    id="scholar-no"
                    data-ocid="students.input"
                    placeholder="Scholar number"
                    inputMode="numeric"
                    value={formScholarNo}
                    onChange={(e) =>
                      setFormScholarNo(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apaar-id">APAAR ID</Label>
                  <Input
                    id="apaar-id"
                    data-ocid="students.input"
                    placeholder="APAAR आई.डी. (12 अंक)"
                    maxLength={12}
                    inputMode="numeric"
                    value={formApaarId}
                    onChange={(e) =>
                      setFormApaarId(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  {formApaarId.length > 0 && formApaarId.length !== 12 && (
                    <p className="text-xs text-destructive">
                      {formApaarId.length}/12 अंक — ठीक 12 अंक आवश्यक हैं
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bpl-no">BPL नं.</Label>
                  <Input
                    id="bpl-no"
                    data-ocid="students.input"
                    placeholder="BPL Number"
                    inputMode="numeric"
                    value={formBplNo}
                    onChange={(e) =>
                      setFormBplNo(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="school-code">विद्यालय कोड</Label>
                  <Input
                    id="school-code"
                    data-ocid="students.input"
                    placeholder="School Code"
                    value={formSchoolCode}
                    onChange={(e) => setFormSchoolCode(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="udise-code">UDISE Code</Label>
                  <Input
                    id="udise-code"
                    data-ocid="students.input"
                    placeholder="UDISE Code"
                    value={formUdiseCode}
                    onChange={(e) => setFormUdiseCode(e.target.value)}
                  />
                </div>
              </div>

              {/* ===== SECTION 3: शैक्षणिक विवरण ===== */}
              <SectionHeader title="🎓 शैक्षणिक विवरण (Academic Details)" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="student-class">कक्षा (Class)</Label>
                  <select
                    id="student-class"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- कक्षा चुनें --</option>
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="student-section">अनुभाग (Section)</Label>
                  <select
                    id="student-section"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- अनुभाग चुनें --</option>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admission-date">
                  प्रवेश तिथि (Admission Date)
                </Label>
                <Input
                  id="admission-date"
                  type="date"
                  data-ocid="students.input"
                  value={formAdmissionDate}
                  onChange={(e) => setFormAdmissionDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prev-school">
                    पूर्व विद्यालय (Previous School)
                  </Label>
                  <Input
                    id="prev-school"
                    data-ocid="students.input"
                    placeholder="Previous school name"
                    value={formPreviousSchool}
                    onChange={(e) => setFormPreviousSchool(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prev-class">पूर्व कक्षा (Previous Class)</Label>
                  <Input
                    id="prev-class"
                    data-ocid="students.input"
                    placeholder="e.g. 5"
                    value={formPreviousClass}
                    onChange={(e) => setFormPreviousClass(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tc-no">
                    TC नं. (Transfer Certificate No.)
                  </Label>
                  <Input
                    id="tc-no"
                    data-ocid="students.input"
                    placeholder="TC Number"
                    value={formTcNo}
                    onChange={(e) => setFormTcNo(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tc-date">TC तिथि (TC Date)</Label>
                  <Input
                    id="tc-date"
                    type="date"
                    data-ocid="students.input"
                    value={formTcDate}
                    onChange={(e) => setFormTcDate(e.target.value)}
                  />
                </div>
              </div>

              {/* ===== SECTION 5: स्थायी पता ===== */}
              <SectionHeader title="🏠 स्थायी पता (Permanent Address)" />

              <div className="space-y-1.5">
                <Label htmlFor="address">पूरा पता (Full Address)</Label>
                <Input
                  id="address"
                  data-ocid="students.input"
                  placeholder="House No., Street, Locality"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="village">ग्राम (Village)</Label>
                  <Input
                    id="village"
                    data-ocid="students.input"
                    placeholder="Village name"
                    value={formVillage}
                    onChange={(e) => setFormVillage(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="post">पोस्ट (Post)</Label>
                  <Input
                    id="post"
                    data-ocid="students.input"
                    placeholder="Post office"
                    value={formPost}
                    onChange={(e) => setFormPost(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tehsil">तहसील (Tehsil)</Label>
                  <Input
                    id="tehsil"
                    data-ocid="students.input"
                    placeholder="Tehsil"
                    value={formTehsil}
                    onChange={(e) => setFormTehsil(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="district">जिला (District)</Label>
                  <Input
                    id="district"
                    data-ocid="students.input"
                    placeholder="District"
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="state">राज्य (State)</Label>
                  <Input
                    id="state"
                    data-ocid="students.input"
                    placeholder="मध्यप्रदेश"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pincode">पिनकोड (Pincode)</Label>
                  <Input
                    id="pincode"
                    data-ocid="students.input"
                    placeholder="पिनकोड (6 अंक)"
                    maxLength={6}
                    inputMode="numeric"
                    value={formPincode}
                    onChange={(e) =>
                      setFormPincode(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  {formPincode.length > 0 && formPincode.length !== 6 && (
                    <p className="text-xs text-destructive">
                      {formPincode.length}/6 अंक — ठीक 6 अंक आवश्यक हैं
                    </p>
                  )}
                </div>
              </div>

              {/* ===== SECTION 6: संपर्क विवरण ===== */}
              <SectionHeader title="📞 संपर्क विवरण (Contact Details)" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile-no">मोबाइल नं. (Mobile No.)</Label>
                  <Input
                    id="mobile-no"
                    data-ocid="students.input"
                    placeholder="मोबाइल नं. (10 अंक)"
                    maxLength={10}
                    inputMode="numeric"
                    value={formMobileNo}
                    onChange={(e) =>
                      setFormMobileNo(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  {formMobileNo.length > 0 && formMobileNo.length !== 10 && (
                    <p className="text-xs text-destructive">
                      {formMobileNo.length}/10 अंक — ठीक 10 अंक आवश्यक हैं
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="alt-mobile">
                    वैकल्पिक मोबाइल (Alternate Mobile)
                  </Label>
                  <Input
                    id="alt-mobile"
                    data-ocid="students.input"
                    placeholder="वैकल्पिक मोबाइल (10 अंक)"
                    maxLength={10}
                    inputMode="numeric"
                    value={formAlternateMobile}
                    onChange={(e) =>
                      setFormAlternateMobile(
                        e.target.value.replace(/[^0-9]/g, ""),
                      )
                    }
                  />
                  {formAlternateMobile.length > 0 &&
                    formAlternateMobile.length !== 10 && (
                      <p className="text-xs text-destructive">
                        {formAlternateMobile.length}/10 अंक — ठीक 10 अंक आवश्यक हैं
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">ईमेल (Email)</Label>
                <Input
                  id="email"
                  type="email"
                  data-ocid="students.input"
                  placeholder="email@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              {/* ===== SECTION 7: DBT विवरण ===== */}
              <SectionHeader title="💰 DBT विवरण (Direct Benefit Transfer)" />

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  DBT Status (Direct Benefit Transfer)
                </Label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dbtStatus"
                      value="हाँ"
                      checked={formDbtStatus === "हाँ"}
                      onChange={() => setFormDbtStatus("हाँ")}
                      className="w-4 h-4 accent-primary"
                      data-ocid="students.dbt_yes"
                    />
                    <span className="text-sm font-medium text-foreground">
                      हाँ (Yes)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dbtStatus"
                      value="नहीं"
                      checked={formDbtStatus === "नहीं"}
                      onChange={() => setFormDbtStatus("नहीं")}
                      className="w-4 h-4 accent-primary"
                      data-ocid="students.dbt_no"
                    />
                    <span className="text-sm font-medium text-foreground">
                      नहीं (No)
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  क्या छात्र को DBT (Direct Benefit Transfer) का लाभ मिलता है?
                </p>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border">
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

      {/* Clear All Confirmation Dialog */}
      <AlertDialog
        open={clearAllConfirm}
        onOpenChange={(open) => {
          if (!open) setClearAllConfirm(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>सभी छात्र हटाएं?</AlertDialogTitle>
            <AlertDialogDescription>
              क्या आप सभी {baseList.length} छात्रों को हटाना चाहते हैं? यह क्रिया पूर्ववत
              नहीं की जा सकती।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClearAllConfirm(false)}>
              रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleClearAll}
            >
              सभी हटाएं
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
        <div className="flex items-center gap-2">
          {role === "admin" && baseList.length > 0 && (
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setClearAllConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              सभी छात्र हटाएं
            </Button>
          )}
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
              <TableHead className="w-8" />
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Profile ID</TableHead>
              <TableHead className="font-semibold">Class</TableHead>
              <TableHead className="font-semibold">Section</TableHead>
              <TableHead className="font-semibold">Roll No.</TableHead>
              <TableHead className="font-semibold">Attendance</TableHead>
              <TableHead className="font-semibold">Grade</TableHead>
              {showActions && (
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 9 : 8}
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="students.empty_state"
                >
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student, idx) => (
                <>
                  <TableRow
                    key={student.id}
                    className="hover:bg-secondary/30 transition-colors cursor-pointer"
                    data-ocid={`students.item.${idx + 1}`}
                    onClick={() =>
                      setExpandedId(
                        expandedId === student.id ? null : student.id,
                      )
                    }
                  >
                    {/* Expand toggle */}
                    <TableCell className="w-8 pr-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(
                            expandedId === student.id ? null : student.id,
                          );
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          expandedId === student.id ? "Collapse" : "Expand"
                        }
                      >
                        {expandedId === student.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="font-medium text-left hover:text-primary hover:underline transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(student.id);
                        }}
                      >
                        {student.name}
                        {student.nameHin && (
                          <span className="block text-xs text-muted-foreground font-normal">
                            {student.nameHin}
                          </span>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      {student.profileId ? (
                        <span className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {student.profileId}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.rollNo}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          student.attendance >= 75
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {student.attendance}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          gradeColors[student.grade] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {student.grade}
                      </Badge>
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`students.edit_button.${idx + 1}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(student);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          {role === "admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              data-ocid={`students.delete_button.${idx + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTargetId(student.id);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Expanded detail row */}
                  {expandedId === student.id && (
                    <TableRow key={`${student.id}-expanded`}>
                      <TableCell colSpan={showActions ? 9 : 8} className="p-0">
                        <AnimatePresence>
                          <ExpandedStudentDetail student={student} />
                        </AnimatePresence>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Expand collapse indicators */}
      {filtered.length > 5 && (
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <ChevronUp className="w-3 h-3" />
          <span>{filtered.length} total students listed</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      )}
    </motion.div>
  );
}
