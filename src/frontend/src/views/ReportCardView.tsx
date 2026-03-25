import {
  dateToHindiWords,
  dateToNumericFormat,
} from "@/utils/dateToHindiWords";
import { useEffect, useState } from "react";

interface Student {
  id: number;
  name: string;
  class: string;
  section: string;
  rollNo?: string;
  enrollmentNo?: string;
  dob?: string;
  father?: string;
  mother?: string;
  fatherHin?: string;
  motherHin?: string;
  nameHin?: string;
  samagraId?: string;
  aadharNo?: string;
  scholarNo?: string;
}

interface StudentProfile {
  nameHin?: string;
  father?: string;
  mother?: string;
  fatherHin?: string;
  motherHin?: string;
  dob?: string;
  dobWords?: string;
  samagraId?: string;
  aadhaarId?: string;
  scholarNo?: string;
  schoolName?: string;
  block?: string;
  district?: string;
}

interface SubjectMarks {
  hindi?: number;
  english?: number;
  math?: number;
  evs?: number;
  science?: number;
  social?: number;
  sanskrit?: number;
}

interface MarkEntryData {
  [studentId: string]: {
    monthly?: SubjectMarks;
    halfYearly?: SubjectMarks;
    annual?: SubjectMarks;
    project?: SubjectMarks;
  };
}

interface CoScholastic {
  literary?: string;
  cultural?: string;
  scientific?: string;
  creative?: string;
  sports?: string;
}

interface PersonalSkills {
  cleanliness?: string;
  discipline?: string;
  honesty?: string;
  punctuality?: string;
  cooperation?: string;
}

const SUBJECTS_BY_CLASS: Record<
  string,
  { key: string; hindi: string; english: string }[]
> = {
  "3": [
    { key: "hindi", hindi: "हिन्दी", english: "Hindi" },
    { key: "english", hindi: "अंग्रेजी", english: "English" },
    { key: "math", hindi: "गणित", english: "Math" },
    { key: "evs", hindi: "पर्यावरण", english: "EVS" },
  ],
  "4": [
    { key: "hindi", hindi: "हिन्दी", english: "Hindi" },
    { key: "english", hindi: "अंग्रेजी", english: "English" },
    { key: "math", hindi: "गणित", english: "Math" },
    { key: "evs", hindi: "पर्यावरण", english: "EVS" },
  ],
  "5": [
    { key: "hindi", hindi: "हिन्दी", english: "Hindi" },
    { key: "english", hindi: "अंग्रेजी", english: "English" },
    { key: "math", hindi: "गणित", english: "Math" },
    { key: "evs", hindi: "पर्यावरण", english: "EVS" },
  ],
  "6": [
    { key: "hindi", hindi: "हिन्दी", english: "Hindi" },
    { key: "english", hindi: "अंग्रेजी", english: "English" },
    { key: "math", hindi: "गणित", english: "Math" },
    { key: "science", hindi: "विज्ञान", english: "Science" },
    { key: "social", hindi: "सामाजिक विज्ञान", english: "Social Science" },
    { key: "sanskrit", hindi: "संस्कृत", english: "Sanskrit" },
  ],
  "7": [
    { key: "hindi", hindi: "हिन्दी", english: "Hindi" },
    { key: "english", hindi: "अंग्रेजी", english: "English" },
    { key: "math", hindi: "गणित", english: "Math" },
    { key: "science", hindi: "विज्ञान", english: "Science" },
    { key: "social", hindi: "सामाजिक विज्ञान", english: "Social Science" },
    { key: "sanskrit", hindi: "संस्कृत", english: "Sanskrit" },
  ],
};

const SUBJECT_KEY_MAP: Record<string, string> = {
  hindi: "Hindi",
  english: "English",
  math: "Mathematics",
  science: "Science",
  social: "Social Science",
  sanskrit: "Sanskrit",
  evs: "EVS",
};

const EXAM_KEY_MAP: Record<string, string> = {
  monthly: "monthly",
  halfYearly: "halfyearly",
  annual: "annual",
  project: "project",
};

const GRADES = ["A+", "A", "B+", "B", "C", "D", "F"];

function lowerGrade(grade: string): string {
  const idx = GRADES.indexOf(grade);
  if (idx === -1 || idx >= GRADES.length - 1) return "F";
  return GRADES[idx + 1];
}

function buildMarkEntryData(): MarkEntryData {
  const result: MarkEntryData = {};
  try {
    const allKeys = Object.keys(localStorage);
    const emsKeys = allKeys.filter((k) => k.startsWith("emsmarks_v2_"));
    for (const key of emsKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, { marks: string }>;
      for (const sid of Object.keys(data)) {
        if (!result[sid]) result[sid] = {};
        const parts = key.replace("emsmarks_v2_", "").split("_");
        const examKey = parts[0];
        const subjectName = parts.slice(1).join("_");
        const subKey = Object.keys(SUBJECT_KEY_MAP).find(
          (k) => SUBJECT_KEY_MAP[k] === subjectName,
        );
        if (!subKey) continue;
        const rcExamKey = Object.keys(EXAM_KEY_MAP).find(
          (k) => EXAM_KEY_MAP[k] === examKey,
        ) as keyof (typeof result)[string] | undefined;
        if (!rcExamKey) continue;
        if (!result[sid][rcExamKey]) result[sid][rcExamKey] = {};
        (result[sid][rcExamKey] as SubjectMarks)[subKey as keyof SubjectMarks] =
          Number.parseFloat(data[sid].marks) || 0;
      }
    }
  } catch {
    /* ignore */
  }
  return result;
}

function getGrade(marks: number, max: number): string {
  const pct = max > 0 ? (marks / max) * 100 : 0;
  if (pct >= 91) return "A+";
  if (pct >= 81) return "A";
  if (pct >= 71) return "B+";
  if (pct >= 61) return "B";
  if (pct >= 51) return "C";
  if (pct >= 33) return "D";
  return "F";
}

// MP Board grade scale for summary section
function getMPGrade(percentage: number): string {
  if (percentage > 85) return "A+";
  if (percentage >= 76) return "A";
  if (percentage >= 66) return "B+";
  if (percentage >= 56) return "B";
  if (percentage >= 51) return "C+";
  if (percentage >= 46) return "C";
  if (percentage >= 33) return "D";
  return "E";
}

function getNextClass(cls: string): string {
  const classMap: Record<string, string> = {
    "1": "2",
    "2": "3",
    "3": "4",
    "4": "5",
    "5": "6",
    "6": "7",
    "7": "8",
    "8": "9",
    "9": "10",
    "10": "11",
    "11": "12",
  };
  return classMap[cls] || String(Number(cls) + 1);
}

function today(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const LOGO_SRC =
  "/assets/uploads/download-019d1f1a-928b-7508-b27d-197b82228018-1.png";
const LOGO2_SRC =
  "/assets/uploads/picture2-019d1f2c-c802-73da-a6dc-465b351e743a-1.png";

export function ReportCardView({ role: _role }: { role: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("6");
  const [markData, setMarkData] = useState<MarkEntryData>({});
  const [profiles, setProfiles] = useState<Record<string, StudentProfile>>({});
  const [coScholastic, setCoScholastic] = useState<
    Record<string, CoScholastic>
  >({});
  const [personalSkills, setPersonalSkills] = useState<
    Record<string, PersonalSkills>
  >({});
  const [promotionClass, setPromotionClass] = useState<string>("");

  useEffect(() => {
    if (selectedId) {
      setMarkData(buildMarkEntryData());
    }
  }, [selectedId]);

  useEffect(() => {
    let s: Student[] = [];
    try {
      const raw = localStorage.getItem("students");
      if (raw) s = JSON.parse(raw) as Student[];
    } catch {
      s = [];
    }
    const m = buildMarkEntryData();
    const p = JSON.parse(
      localStorage.getItem("studentProfiles") || "{}",
    ) as Record<string, StudentProfile>;
    const cs = JSON.parse(
      localStorage.getItem("coScholastic") || "{}",
    ) as Record<string, CoScholastic>;
    const ps = JSON.parse(
      localStorage.getItem("personalSkills") || "{}",
    ) as Record<string, PersonalSkills>;
    setStudents(s);
    setMarkData(m);
    setProfiles(p);
    setCoScholastic(cs);
    setPersonalSkills(ps);

    // Auto-load selected student from localStorage
    const savedId = localStorage.getItem("selectedStudent");
    if (savedId) {
      setSelectedId(savedId);
    }
  }, []);

  const student = students.find((s) => String(s.id) === selectedId);

  // Auto-fill next class when student changes
  useEffect(() => {
    if (student?.class) {
      setPromotionClass(getNextClass(student.class));
    } else if (selectedClass) {
      setPromotionClass(getNextClass(selectedClass));
    }
  }, [student, selectedClass]);

  // Merge stored profile with student data as fallback for auto-fill
  const storedProfile: StudentProfile = profiles[selectedId] || {};
  const profile: StudentProfile = {
    nameHin: storedProfile.nameHin || student?.nameHin,
    father: storedProfile.father || student?.father,
    mother: storedProfile.mother || student?.mother,
    fatherHin: storedProfile.fatherHin || student?.fatherHin,
    motherHin: storedProfile.motherHin || student?.motherHin,
    dob:
      storedProfile.dob ||
      (student?.dob ? dateToNumericFormat(student.dob) : undefined),
    dobWords:
      storedProfile.dobWords ||
      (student?.dob ? dateToHindiWords(student.dob) : undefined),
    samagraId: storedProfile.samagraId || student?.samagraId,
    aadhaarId: storedProfile.aadhaarId || student?.aadharNo,
    scholarNo: storedProfile.scholarNo || student?.scholarNo,
    schoolName: storedProfile.schoolName,
    block: storedProfile.block,
    district: storedProfile.district,
  };

  const studentMarks = markData[selectedId] || {};
  const cs: CoScholastic = coScholastic[selectedId] || {};
  const ps: PersonalSkills = personalSkills[selectedId] || {};

  const subjects = SUBJECTS_BY_CLASS[selectedClass] || SUBJECTS_BY_CLASS["6"];
  const subjectTotals = subjects.map((sub) => {
    const monthlyRaw = studentMarks.monthly?.[sub.key] ?? 0;
    const halfRaw = studentMarks.halfYearly?.[sub.key] ?? 0;
    const annualRaw = studentMarks.annual?.[sub.key] ?? 0;
    const projectRaw = studentMarks.project?.[sub.key] ?? 0;
    const monthly = Math.round((monthlyRaw / 60) * 10);
    const half = Math.round((halfRaw / 60) * 20);
    const annual = annualRaw;
    const project = Math.round((projectRaw / 20) * 10);
    const total = monthly + half + annual + project;
    return { ...sub, monthly, half, annual, project, total };
  });

  const grandTotal = subjectTotals.reduce((acc, s) => acc + s.total, 0);
  const maxTotal = subjects.length * 100;
  const finalGrade = getGrade(grandTotal, maxTotal);
  const percentage = maxTotal > 0 ? (grandTotal / maxTotal) * 100 : 0;
  const mpGrade = getMPGrade(percentage);
  const examResult = percentage >= 33 ? "उत्तीर्ण" : "अनुत्तीर्ण";

  // Subject-based grade helpers
  const hindiTotal = subjectTotals.find((s) => s.key === "hindi")?.total ?? 0;
  const englishTotal =
    subjectTotals.find((s) => s.key === "english")?.total ?? 0;
  const mathTotal = subjectTotals.find((s) => s.key === "math")?.total ?? 0;
  const sciTotal =
    subjectTotals.find((s) => s.key === "science")?.total ??
    subjectTotals.find((s) => s.key === "evs")?.total ??
    mathTotal;

  const hindiGrade = getGrade(hindiTotal, 100);
  const englishGrade = getGrade(englishTotal, 100);
  const mathGrade = getGrade(mathTotal, 100);
  const sciGrade = getGrade(sciTotal, 100);

  // Co-Scholastic auto grades (manual saved value takes priority)
  const csLiterary = cs.literary || hindiGrade;
  const csCultural = cs.cultural || englishGrade;
  const csScientific = cs.scientific || sciGrade;
  const csCreative = cs.creative || mathGrade;
  const csSports = cs.sports || lowerGrade(finalGrade);

  // Personal Skills auto grades (manual saved value takes priority)
  const psCleanliness = ps.cleanliness || hindiGrade;
  const psDiscipline = ps.discipline || lowerGrade(finalGrade);
  const psHonesty = ps.honesty || englishGrade;
  const psPunctuality = ps.punctuality || mathGrade;
  const psCooperation = ps.cooperation || lowerGrade(finalGrade);

  const nameEng = student?.name || "";
  const nameHin = student?.nameHin || student?.name || "";

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: #fff; }
          .report-card-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 10mm;
            font-size: 11px;
            color: #000;
            background: #fff;
          }
          aside, header, nav { display: none !important; }
        }
        .report-card-container * {
          font-family: Arial, sans-serif;
          color: #000;
          box-sizing: border-box;
        }
        .rc-table { border-collapse: collapse; width: 100%; }
        .rc-table th, .rc-table td { border: 1px solid #000; padding: 3px 5px; font-size: 11px; }
        .rc-table th { background: #e8e8e8; font-weight: bold; text-align: center; }
        .rc-input { border: none; background: transparent; width: 100%; font-size: 11px; outline: none; }
        .double-border { border: 3px double #000; padding: 8px; }
        .detail-table td { border: 1px solid #000; padding: 3px 6px; font-size: 11px; }
        .sig-line { border-top: 1px solid #000; width: 120px; }
        .grade-summary-section { border: 2px solid #000; padding: 8px; margin-bottom: 12px; font-family: Arial, sans-serif; }
        .grade-summary-section h4 { text-align: center; margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-decoration: underline; }
        .grade-summary-section .note-line { font-size: 10px; margin-top: 6px; }
        .grade-summary-section .result-line { font-size: 11px; margin-top: 8px; }
        .promotion-input { border: none; border-bottom: 1px solid #000; background: transparent; font-size: 11px; outline: none; width: 60px; text-align: center; font-family: Arial, sans-serif; }
        @media print {
          .promotion-input { border: none; border-bottom: 1px solid #000; }
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="classSelectRC"
          >
            कक्षा / Class:
          </label>
          <select
            id="classSelectRC"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground"
          >
            {["3", "4", "5", "6", "7"].map((cls) => (
              <option key={cls} value={cls}>
                कक्षा {cls}वीं
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="studentSelect"
          >
            छात्र चुनें / Select Student:
          </label>
          <select
            id="studentSelect"
            data-ocid="report_card.select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm bg-background text-foreground"
          >
            <option value="">-- छात्र चुनें --</option>
            {students.length === 0 ? (
              <option disabled>No students found</option>
            ) : (
              students.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} (Class {s.class}-{s.section})
                </option>
              ))
            )}
          </select>
        </div>
        {selectedId && (
          <button
            type="button"
            data-ocid="report_card.primary_button"
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-primary text-white rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            🖨️ Print / प्रिंट करें
          </button>
        )}
      </div>

      {!selectedId ? (
        <div className="no-print flex items-center justify-center h-64 text-muted-foreground">
          <p className="text-center">
            <span className="text-4xl block mb-3">📋</span>
            कृपया एक छात्र चुनें / Please select a student to view the report card
          </p>
        </div>
      ) : (
        <div
          className="report-card-container bg-white border border-gray-300 shadow-sm mx-auto"
          style={{
            maxWidth: "210mm",
            padding: "10mm",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Header */}
          <div className="double-border text-center mb-3">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left Logo */}
              <img
                src={LOGO_SRC}
                alt="MP Board Logo"
                width={80}
                height={80}
                style={{ objectFit: "contain", flexShrink: 0 }}
              />
              {/* Center Text */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{ fontSize: 16, fontWeight: "bold", letterSpacing: 1 }}
                >
                  राज्य शिक्षा केन्द्र (म.प्र.)
                </div>
                <div style={{ fontSize: 13, fontWeight: "bold", marginTop: 2 }}>
                  समग्र प्रगति पत्रक
                </div>
                <div style={{ fontSize: 11, marginTop: 2 }}>
                  कक्षा - {student?.class || "6"} : सत्र 2025-26
                </div>
              </div>
              {/* Right Logo */}
              <img
                src={LOGO2_SRC}
                alt="SCERT Logo"
                width={80}
                height={80}
                style={{ objectFit: "contain", flexShrink: 0 }}
              />
            </div>
          </div>

          {/* Student Details */}
          <div style={{ border: "1px solid #000", marginBottom: 8 }}>
            <table
              className="detail-table"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <td style={{ width: "30%", fontWeight: "bold" }}>
                    छात्र का नाम / Student Name
                  </td>
                  <td colSpan={3}>
                    <span id="rcNameEng">{nameEng}</span>
                    {nameHin && nameHin !== nameEng ? (
                      <>
                        {" "}
                        / <span id="rcNameHin">{nameHin}</span>
                      </>
                    ) : (
                      <span id="rcNameHin" style={{ display: "none" }}>
                        {nameHin}
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>पिता का नाम</td>
                  <td>
                    <span id="rcFather">
                      {profile.fatherHin ||
                        student?.fatherHin ||
                        student?.father ||
                        ""}
                    </span>
                  </td>
                  <td style={{ fontWeight: "bold" }}>माता का नाम</td>
                  <td>
                    <span id="rcMother">
                      {profile.motherHin ||
                        student?.motherHin ||
                        student?.mother ||
                        ""}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>जन्म तिथि (अंकों में)</td>
                  <td>
                    <span id="rcDob">{profile.dob || ""}</span>
                  </td>
                  <td style={{ fontWeight: "bold" }}>जन्म तिथि (शब्दों में)</td>
                  <td>{profile.dobWords || ""}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>समग्र आई.डी.</td>
                  <td>
                    <span id="rcSamagra">{profile.samagraId || ""}</span>
                  </td>
                  <td style={{ fontWeight: "bold" }}>आधार नं.</td>
                  <td>{profile.aadhaarId || ""}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>विद्वान क्रमांक</td>
                  <td>{profile.scholarNo || ""}</td>
                  <td style={{ fontWeight: "bold" }}>अनुक्रमांक (Roll No)</td>
                  <td>{student?.rollNo || ""}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>विद्यालय का नाम</td>
                  <td colSpan={3}>{profile.schoolName || ""}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: "bold" }}>विकासखंड</td>
                  <td>{profile.block || ""}</td>
                  <td style={{ fontWeight: "bold" }}>जिला</td>
                  <td>{profile.district || ""}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Marks Table */}
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontWeight: "bold",
                fontSize: 11,
                marginBottom: 3,
                textDecoration: "underline",
              }}
            >
              शैक्षिक उपलब्धि (Academic Achievement)
            </div>
            <table className="rc-table">
              <thead>
                <tr>
                  <th style={{ width: "4%" }}>क्र.</th>
                  <th style={{ width: "18%" }}>विषय (Subject)</th>
                  <th style={{ width: "8%" }}>पूर्णांक (100)</th>
                  <th style={{ width: "12%" }}>मासिक परीक्षा (10)</th>
                  <th style={{ width: "12%" }}>अर्धवार्षिक (20)</th>
                  <th style={{ width: "14%" }}>वार्षिक लिखित (60)</th>
                  <th style={{ width: "12%" }}>प्रोजेक्ट (10)</th>
                  <th style={{ width: "10%" }}>योग</th>
                  <th style={{ width: "10%" }}>ग्रेड</th>
                </tr>
              </thead>
              <tbody>
                {subjectTotals.map((sub, i) => (
                  <tr key={sub.key}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td>
                      {sub.hindi} ({sub.english})
                    </td>
                    <td style={{ textAlign: "center" }}>100</td>
                    <td style={{ textAlign: "center" }}>{sub.monthly || ""}</td>
                    <td style={{ textAlign: "center" }}>{sub.half || ""}</td>
                    <td style={{ textAlign: "center" }}>{sub.annual || ""}</td>
                    <td style={{ textAlign: "center" }}>{sub.project || ""}</td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      {sub.total}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      {getGrade(sub.total, 100)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#e8e8e8" }}>
                  <td
                    colSpan={2}
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    कुल / Grand Total
                  </td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    {maxTotal}
                  </td>
                  <td colSpan={4} />
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    {grandTotal}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    {finalGrade}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Co-Scholastic & Personal Skills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 11,
                  marginBottom: 3,
                  textDecoration: "underline",
                }}
              >
                सह-शैक्षिक क्षेत्र (Co-Scholastic Area)
              </div>
              <table className="rc-table">
                <thead>
                  <tr>
                    <th>गतिविधि</th>
                    <th>ग्रेड</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>साहित्यिक (Literary)</td>
                    <td style={{ textAlign: "center" }}>{csLiterary}</td>
                  </tr>
                  <tr>
                    <td>सांस्कृतिक (Cultural)</td>
                    <td style={{ textAlign: "center" }}>{csCultural}</td>
                  </tr>
                  <tr>
                    <td>वैज्ञानिक (Scientific)</td>
                    <td style={{ textAlign: "center" }}>{csScientific}</td>
                  </tr>
                  <tr>
                    <td>सृजनात्मक (Creative)</td>
                    <td style={{ textAlign: "center" }}>{csCreative}</td>
                  </tr>
                  <tr>
                    <td>खेलकूद (Sports)</td>
                    <td style={{ textAlign: "center" }}>{csSports}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 11,
                  marginBottom: 3,
                  textDecoration: "underline",
                }}
              >
                व्यक्तिगत गुण (Personal Skills)
              </div>
              <table className="rc-table">
                <thead>
                  <tr>
                    <th>गुण</th>
                    <th>ग्रेड</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>स्वच्छता (Cleanliness)</td>
                    <td style={{ textAlign: "center" }}>{psCleanliness}</td>
                  </tr>
                  <tr>
                    <td>अनुशासन (Discipline)</td>
                    <td style={{ textAlign: "center" }}>{psDiscipline}</td>
                  </tr>
                  <tr>
                    <td>ईमानदारी (Honesty)</td>
                    <td style={{ textAlign: "center" }}>{psHonesty}</td>
                  </tr>
                  <tr>
                    <td>समयनिष्ठा (Punctuality)</td>
                    <td style={{ textAlign: "center" }}>{psPunctuality}</td>
                  </tr>
                  <tr>
                    <td>सहयोग (Cooperation)</td>
                    <td style={{ textAlign: "center" }}>{psCooperation}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== शैक्षिक मूल्यांकन हेतु संचयी ग्रेड का विवरण ===== */}
          <div className="grade-summary-section">
            <h4>शैक्षिक मूल्यांकन हेतु संचयी ग्रेड का विवरण</h4>

            {/* Grade Table */}
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                textAlign: "center",
                fontSize: 11,
              }}
            >
              <thead>
                <tr style={{ background: "#f5d7a1" }}>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "3px 4px",
                      fontWeight: "bold",
                    }}
                  >
                    ग्रेड
                  </th>
                  {["A+", "A", "B+", "B", "C+", "C", "D", "E"].map((g) => (
                    <th
                      key={g}
                      style={{
                        border: "1px solid #000",
                        padding: "3px 4px",
                        fontWeight: "bold",
                        background: mpGrade === g ? "#c6efce" : "#f5d7a1",
                      }}
                    >
                      {g}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 4px",
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    प्रतिशत
                  </td>
                  {(
                    [
                      ["A+", "85 से अधिक"],
                      ["A", "76–85"],
                      ["B+", "66–75"],
                      ["B", "56–65"],
                      ["C+", "51–55"],
                      ["C", "46–50"],
                      ["D", "33–45"],
                      ["E", "33 से कम"],
                    ] as [string, string][]
                  ).map(([grade, range]) => (
                    <td
                      key={grade}
                      style={{
                        border: "1px solid #000",
                        padding: "3px 4px",
                        fontSize: 10,
                        background:
                          mpGrade === grade ? "#c6efce" : "transparent",
                      }}
                    >
                      {range}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            {/* Note */}
            <p className="note-line">
              <strong>नोट -</strong> वार्षिक परीक्षा फल निर्धारण में सह-शैक्षिक क्षेत्र एवं
              व्यक्तिगत सामाजिक गुणों में अंकित ग्रेड को नहीं जोड़ा गया है।
            </p>

            {/* Result and Promotion lines */}
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "baseline",
              }}
            >
              <span>
                <strong>विद्यार्थी का परीक्षाफल एवं ग्रेड</strong> -{" "}
                <span
                  style={{
                    borderBottom: "1px solid #000",
                    minWidth: 140,
                    display: "inline-block",
                    fontWeight: "bold",
                    paddingBottom: 1,
                    letterSpacing: 0.5,
                  }}
                >
                  {grandTotal > 0
                    ? `${examResult} / ${mpGrade} (${percentage.toFixed(1)}%)`
                    : ""}
                </span>
              </span>
              <span style={{ marginLeft: 16 }}>
                <strong>विद्यार्थी को कक्षा</strong>{" "}
                <input
                  type="text"
                  className="promotion-input"
                  value={promotionClass}
                  onChange={(e) => setPromotionClass(e.target.value)}
                  placeholder="__"
                  style={{
                    width: 50,
                    borderBottom: "1px solid #000",
                    border: "none",
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                    borderBottomColor: "#000",
                    background: "transparent",
                    fontSize: 11,
                    textAlign: "center",
                    outline: "none",
                    fontFamily: "Arial, sans-serif",
                  }}
                />{" "}
                <strong>में कक्षोन्नत किया जाता है।</strong>
              </span>
            </div>
          </div>
          {/* ===== END grade summary section ===== */}

          {/* Footer / Signatures */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 16,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div className="sig-line" />
              <div style={{ fontSize: 10, marginTop: 4 }}>
                कक्षा अध्यापक के हस्ताक्षर
              </div>
              <div style={{ fontSize: 9 }}>(Class Teacher Signature)</div>
            </div>
            <div style={{ textAlign: "center", fontSize: 10 }}>
              <div>मुद्रण दिनांक: {today()}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="sig-line" style={{ marginLeft: "auto" }} />
              <div style={{ fontSize: 10, marginTop: 4 }}>
                प्राचार्य के हस्ताक्षर
              </div>
              <div style={{ fontSize: 9 }}>(Principal Signature)</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
