import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Student {
  id: number;
  name: string;
  nameHin?: string;
  class: string;
  rollNo: string;
  profileId?: string;
  dbtStatus?: "हाँ" | "नहीं";
  studentPhoto?: string;
  aadharPhoto?: string;
  castePhoto?: string;
  incomePhoto?: string;
  [key: string]: unknown;
}

// ─── Photo Upload Card ───────────────────────────────────────────────────────
interface PhotoCardProps {
  label: string;
  sublabel?: string;
  icon: string;
  value: string;
  accept?: string;
  sizeLimit?: { min: number; max: number };
  hint?: string;
  onChange: (base64: string) => void;
  onClear: () => void;
}

function PhotoCard({
  label,
  sublabel,
  icon,
  value,
  accept = "image/jpeg,image/png",
  sizeLimit,
  hint,
  onChange,
  onClear,
}: PhotoCardProps) {
  const [fileInfo, setFileInfo] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (sizeLimit) {
      if (file.size < sizeLimit.min) {
        const msg = `फ़ाइल बहुत छोटी है (${(file.size / 1024).toFixed(1)} KB) — न्यूनतम ${(sizeLimit.min / 1024).toFixed(0)} KB होना चाहिए।`;
        setError(msg);
        e.target.value = "";
        return;
      }
      if (file.size > sizeLimit.max) {
        const msg = `फ़ाइल बहुत बड़ी है (${(file.size / 1024).toFixed(1)} KB) — अधिकतम ${(sizeLimit.max / 1024).toFixed(0)} KB होना चाहिए।`;
        setError(msg);
        e.target.value = "";
        return;
      }
    }

    setFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm">
      {/* Card Header */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {sublabel && (
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
        {value && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
      </div>

      {/* Preview / Placeholder */}
      <div className="flex flex-col items-center gap-2">
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt={label}
              className="w-full max-h-48 object-contain rounded-md border border-border shadow-sm bg-secondary/10"
            />
            <button
              type="button"
              onClick={() => {
                onClear();
                setFileInfo("");
                setError("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-full h-32 rounded-md border-2 border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="w-6 h-6" />
            <span className="text-xs">फ़ाइल अपलोड करें</span>
          </div>
        )}
      </div>

      {/* Upload Input */}
      <div className="space-y-1">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:bg-secondary file:text-xs file:font-medium file:cursor-pointer hover:file:bg-secondary/80 cursor-pointer"
        />
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        {fileInfo && (
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {fileInfo}
          </p>
        )}
        {error && (
          <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main View ───────────────────────────────────────────────────────────────
export function DocumentUploadView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [student, setStudent] = useState<Student | null>(null);
  const [saved, setSaved] = useState(false);

  // Document states
  const [studentPhoto, setStudentPhoto] = useState("");
  const [aadharPhoto, setAadharPhoto] = useState("");
  const [castePhoto, setCastePhoto] = useState("");
  const [incomePhoto, setIncomePhoto] = useState("");
  const [dbtStatus, setDbtStatus] = useState<"हाँ" | "नहीं">("नहीं");

  useEffect(() => {
    const raw = localStorage.getItem("students");
    if (raw) {
      try {
        setStudents(JSON.parse(raw));
      } catch {
        setStudents([]);
      }
    }
  }, []);

  function loadStudent(id: string) {
    setSelectedId(id);
    setSaved(false);
    const s = students.find((s) => String(s.id) === id) ?? null;
    setStudent(s);
    if (s) {
      setStudentPhoto(s.studentPhoto ?? "");
      setAadharPhoto(s.aadharPhoto ?? "");
      setCastePhoto(s.castePhoto ?? "");
      setIncomePhoto(s.incomePhoto ?? "");
      setDbtStatus(s.dbtStatus ?? "नहीं");
    } else {
      setStudentPhoto("");
      setAadharPhoto("");
      setCastePhoto("");
      setIncomePhoto("");
      setDbtStatus("नहीं");
    }
  }

  function handleSave() {
    if (!student) return;
    const updated = students.map((s) =>
      s.id === student.id
        ? {
            ...s,
            studentPhoto,
            aadharPhoto,
            castePhoto,
            incomePhoto,
            dbtStatus,
          }
        : s,
    );
    localStorage.setItem("students", JSON.stringify(updated));
    setStudents(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const uploadedCount = [
    studentPhoto,
    aadharPhoto,
    castePhoto,
    incomePhoto,
  ].filter(Boolean).length;

  return (
    <div className="no-print space-y-6 max-w-5xl mx-auto">
      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            📎 दस्तावेज़ अपलोड
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Document Upload Section — छात्र के सभी दस्तावेज़ यहाँ अपलोड करें
          </p>
        </div>
        {student && (
          <Button
            onClick={handleSave}
            className="gap-2"
            data-ocid="documents.save_button"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> सेव हो गया!
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" /> सेव करें
              </>
            )}
          </Button>
        )}
      </div>

      {/* ─── Student Selector Card ────────────────────────────────── */}
      <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="text-base">🎓</span> छात्र चुनें
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              छात्र का नाम / कक्षा
            </Label>
            <Select value={selectedId} onValueChange={loadStudent}>
              <SelectTrigger data-ocid="documents.student_select">
                <SelectValue placeholder="-- छात्र चुनें --" />
              </SelectTrigger>
              <SelectContent>
                {students.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    कोई छात्र नहीं मिला
                  </SelectItem>
                ) : (
                  students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.rollNo ? `${s.rollNo} — ` : ""}
                      {s.name} ({s.class})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {student && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                {student.profileId ?? `ID: ${student.id}`}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-secondary text-foreground">
                कक्षा {student.class}
              </span>
              {uploadedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> {uploadedCount}/4 दस्तावेज़
                </span>
              )}
            </div>
          )}
        </div>

        {/* Student name display */}
        {student && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  नाम (English)
                </p>
                <p className="font-semibold text-sm">{student.name}</p>
              </div>
              {student.nameHin && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    नाम (Hindi)
                  </p>
                  <p className="font-semibold text-sm">{student.nameHin}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  रोल नं.
                </p>
                <p className="font-semibold text-sm">{student.rollNo}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {student ? (
        <>
          {/* ─── DBT Status ────────────────────────────────────────── */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-base">💰</span> DBT Status (डीबीटी स्थिति)
            </h2>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="doc-dbt-status"
                  value="हाँ"
                  checked={dbtStatus === "हाँ"}
                  onChange={() => setDbtStatus("हाँ")}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-emerald-700">
                  हाँ (Yes)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="doc-dbt-status"
                  value="नहीं"
                  checked={dbtStatus === "नहीं"}
                  onChange={() => setDbtStatus("नहीं")}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-red-600">
                  नहीं (No)
                </span>
              </label>
            </div>
          </div>

          {/* ─── Documents Grid ─────────────────────────────────────── */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-base">📂</span> दस्तावेज़ (Documents)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PhotoCard
                icon="🧑‍🎓"
                label="छात्र फोटो"
                sublabel="Student Photo"
                hint="10–50 KB, JPG/PNG"
                value={studentPhoto}
                accept="image/jpeg,image/png"
                sizeLimit={{ min: 10240, max: 51200 }}
                onChange={setStudentPhoto}
                onClear={() => setStudentPhoto("")}
              />
              <PhotoCard
                icon="🪪"
                label="आधार कार्ड फोटो"
                sublabel="Aadhaar Card Photo"
                value={aadharPhoto}
                accept="image/jpeg,image/png,application/pdf"
                onChange={setAadharPhoto}
                onClear={() => setAadharPhoto("")}
              />
              <PhotoCard
                icon="📜"
                label="जाति प्रमाण पत्र"
                sublabel="Caste Certificate"
                value={castePhoto}
                accept="image/jpeg,image/png"
                onChange={setCastePhoto}
                onClear={() => setCastePhoto("")}
              />
              <PhotoCard
                icon="💼"
                label="आय प्रमाण पत्र"
                sublabel="Income Certificate"
                value={incomePhoto}
                accept="image/jpeg,image/png"
                onChange={setIncomePhoto}
                onClear={() => setIncomePhoto("")}
              />
            </div>
          </div>

          {/* ─── Save Button (bottom) ────────────────────────────────── */}
          <div className="flex justify-end pb-6">
            <Button
              onClick={handleSave}
              size="lg"
              className="gap-2"
              data-ocid="documents.save_bottom_button"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> सेव हो गया!
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> दस्तावेज़ सेव करें
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Upload className="w-7 h-7" />
          </div>
          <p className="text-base font-medium">ऊपर छात्र चुनें</p>
          <p className="text-sm max-w-xs">
            छात्र select करने के बाद उसके सभी दस्तावेज़ अपलोड और manage कर सकते हैं।
          </p>
        </div>
      )}
    </div>
  );
}
