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

    const savedId = localStorage.getItem("selectedStudent");
    if (savedId) {
      setSelectedId(savedId);
    }
  }, []);

  const student = students.find((s) => String(s.id) === selectedId);

  useEffect(() => {
    if (student?.class) {
      setPromotionClass(getNextClass(student.class));
    } else if (selectedClass) {
      setPromotionClass(getNextClass(selectedClass));
    }
  }, [student, selectedClass]);

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
    const monthlyRaw =
      studentMarks.monthly?.[sub.key as keyof SubjectMarks] ?? 0;
    const halfRaw =
      studentMarks.halfYearly?.[sub.key as keyof SubjectMarks] ?? 0;
    const annualRaw = studentMarks.annual?.[sub.key as keyof SubjectMarks] ?? 0;
    const projectRaw =
      studentMarks.project?.[sub.key as keyof SubjectMarks] ?? 0;
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

  const csLiterary = cs.literary || hindiGrade;
  const csCultural = cs.cultural || englishGrade;
  const csScientific = cs.scientific || sciGrade;
  const csCreative = cs.creative || mathGrade;
  const csSports = cs.sports || lowerGrade(finalGrade);

  const psCleanliness = ps.cleanliness || hindiGrade;
  const psDiscipline = ps.discipline || lowerGrade(finalGrade);
  const psHonesty = ps.honesty || englishGrade;
  const psPunctuality = ps.punctuality || mathGrade;
  const psCooperation = ps.cooperation || lowerGrade(finalGrade);

  const nameEng = student?.name || "";
  const nameHin = student?.nameHin || student?.name || "";

  const mpGradeList = ["A+", "A", "B+", "B", "C+", "C", "D", "E"] as const;
  const gradeRanges: Record<string, string> = {
    "A+": "85 से अधिक",
    A: "76–85",
    "B+": "66–75",
    B: "56–65",
    "C+": "51–55",
    C: "46–50",
    D: "33–45",
    E: "33 से कम",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

        /* ===== Base font ===== */
        .report-card-container * {
          font-family: 'Noto Sans Devanagari', Arial, sans-serif;
          color: #000;
          box-sizing: border-box;
        }

        /* ===== Outer / Inner decorative border ===== */
        .rc-outer-border {
          border: 4px double #000;
          padding: 5px;
          background: #fff;
          position: relative;
        }
        .rc-inner-border {
          border: 1.5px solid #555;
          padding: 10mm;
          position: relative;
          overflow: hidden;
        }
        /* Watermark */
        .rc-inner-border::before {
          content: 'मध्यप्रदेश शासन';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 68px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.04);
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
          font-family: 'Noto Sans Devanagari', Arial, sans-serif;
          letter-spacing: 4px;
        }
        /* Decorative corner marks */
        .rc-inner-border::after {
          content: '✦';
          position: absolute;
          top: 4px; left: 6px;
          font-size: 14px;
          color: #555;
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }
        .rc-corner-tr, .rc-corner-bl, .rc-corner-br {
          position: absolute;
          font-size: 14px;
          color: #555;
          opacity: 0.5;
          pointer-events: none;
          z-index: 2;
        }
        .rc-corner-tr { top: 4px; right: 6px; }
        .rc-corner-bl { bottom: 4px; left: 6px; }
        .rc-corner-br { bottom: 4px; right: 6px; }

        /* All content above watermark */
        .rc-content {
          position: relative;
          z-index: 1;
        }

        /* ===== Tables ===== */
        .rc-table { border-collapse: collapse; width: 100%; }
        .rc-table th, .rc-table td {
          border: 1px solid #000;
          padding: 7px 6px;
          font-size: 13px;
          line-height: 1.5;
          text-align: center;
        }
        .rc-table th {
          background: #fff;
          color: #000;
          font-weight: bold;
          text-align: center;
        }
        .rc-table tbody tr:nth-child(even) td { background: #f5f5f5; }
        .rc-table tbody tr:nth-child(odd) td { background: #fff; }

        /* Detail/student info table */
        .detail-table { width: 100%; border-collapse: collapse; }
        .detail-table td {
          border: 1px solid #555;
          padding: 6px 8px;
          font-size: 13px;
          line-height: 1.6;
        }

        /* Section heading bar */
        .rc-section-heading {
          background: #fff;
          color: #000;
          font-weight: bold;
          font-size: 14px;
          text-align: center;
          padding: 5px 10px;
          letter-spacing: 0.5px;
          margin-bottom: 0;
          border-bottom: 1.5px solid #555;
        }

        /* Co-scholastic / personal skills box */
        .co-section-box {
          border: 1.5px solid #555;
          border-radius: 2px;
          overflow: hidden;
        }
        .co-section-box .rc-table th { background: #f0f0f0; color: #000; }
        .co-section-box .rc-table td { font-size: 13px; }

        /* Dotted field */
        .rc-dotted-field {
          
          min-width: 100px;
          display: inline-block;
          min-height: 18px;
        }

        /* Grand total row */
        .rc-grand-total td {
          background: #f0f0f0 !important;
          font-weight: bold;
        }

        /* Grade summary section */
        .grade-summary-section {
          border: 1.5px solid #555;
          margin-bottom: 12px;
          overflow: hidden;
        }
        .grade-summary-inner {
          padding: 8px 10px;
        }
        .grade-summary-section .note-line { font-size: 12px; margin-top: 6px; }
        .grade-summary-section .result-line { font-size: 13px; margin-top: 8px; }
        .promotion-input {
          border: none;
          border-bottom: 1.5px solid #000;
          background: transparent;
          font-size: 13px;
          outline: none;
          width: 60px;
          text-align: center;
          font-family: 'Noto Sans Devanagari', Arial, sans-serif;
        }
        .sig-line { border-top: 1.5px solid #000; width: 130px; margin: 0 auto; }

        /* ===== Print styles ===== */
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }

          .no-print { display: none !important; }

          body { margin: 0; background: #fff; }

          aside, header, nav, footer { display: none !important; }

          .report-card-container {
            width: 190mm !important;
            max-width: 190mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }

          /* Tighten outer/inner borders */
          .rc-outer-border {
            border: 3px double #000 !important;
            padding: 3px !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          .rc-inner-border {
            border: 1px solid #555 !important;
            padding: 4mm 5mm !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          /* Tighten section headings */
          .rc-section-heading {
            font-size: 11px !important;
            padding: 3px 6px !important;
          }

          /* Tighten table cells */
          .rc-table th,
          .rc-table td {
            font-size: 10px !important;
            padding: 3px 3px !important;
            line-height: 1.3 !important;
          }

          .detail-table td {
            font-size: 10px !important;
            padding: 3px 5px !important;
            line-height: 1.3 !important;
          }

          /* Remove bottom margins on sections */
          .report-card-container > div > div > div {
            margin-bottom: 5px !important;
          }

          /* Grade summary section */
          .grade-summary-section .grade-summary-inner {
            padding: 4px 6px !important;
          }

          .grade-summary-section .note-line {
            font-size: 9px !important;
            margin-top: 3px !important;
          }

          .grade-summary-section .result-line {
            font-size: 10px !important;
            margin-top: 4px !important;
          }

          /* Promotion input */
          .promotion-input {
            border: none !important;
            border-bottom: 1px solid #000 !important;
            font-size: 10px !important;
          }

          /* Signature area */
          .sig-line {
            width: 100px !important;
          }

          /* Prevent page breaks inside sections */
          .rc-outer-border,
          .rc-inner-border,
          .rc-content,
          .co-section-box,
          .grade-summary-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
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
          className="report-card-container bg-white shadow-sm mx-auto"
          style={{
            maxWidth: "210mm",
            fontFamily: "'Noto Sans Devanagari', Arial, sans-serif",
          }}
        >
          {/* Outer decorative double border */}
          <div className="rc-outer-border">
            <div className="rc-inner-border">
              {/* Corner ornaments */}
              <span className="rc-corner-tr" aria-hidden="true">
                ✦
              </span>
              <span className="rc-corner-bl" aria-hidden="true">
                ✦
              </span>
              <span className="rc-corner-br" aria-hidden="true">
                ✦
              </span>

              {/* All content above watermark */}
              <div className="rc-content">
                {/* ===== Header ===== */}
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
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
                    {/* Center Headings */}
                    <div
                      style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "0 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: "bold",
                          letterSpacing: 1,
                          lineHeight: 1.3,
                        }}
                      >
                        राज्य शिक्षा केन्द्र (म.प्र.)
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          marginTop: 4,
                          borderBottom: "2px solid #000",
                          display: "inline-block",
                          paddingBottom: 2,
                          letterSpacing: 0.5,
                        }}
                      >
                        समग्र प्रगति पत्रक
                      </div>
                      <div
                        style={{ fontSize: 13, marginTop: 5, color: "#333" }}
                      >
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
                  {/* Decorative divider */}
                  <div
                    style={{
                      height: 2,
                      background: "#000",
                      margin: "4px 0",
                    }}
                  />
                </div>

                {/* ===== Student Details ===== */}
                <div style={{ border: "1.5px solid #555", marginBottom: 10 }}>
                  <div className="rc-section-heading">
                    छात्र विवरण (Student Details)
                  </div>
                  <table className="detail-table">
                    <tbody>
                      <tr>
                        <td style={{ width: "28%", fontWeight: "bold" }}>
                          छात्र का नाम / Student Name
                        </td>
                        <td colSpan={3} style={{ fontWeight: "bold" }}>
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
                        <td style={{ fontWeight: 600 }}>
                          <span id="rcFather" className="rc-dotted-field">
                            {profile.fatherHin ||
                              student?.fatherHin ||
                              student?.father ||
                              ""}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>माता का नाम</td>
                        <td style={{ fontWeight: 600 }}>
                          <span id="rcMother" className="rc-dotted-field">
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
                          <span id="rcDob" className="rc-dotted-field">
                            {profile.dob || ""}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>
                          जन्म तिथि (शब्दों में)
                        </td>
                        <td>
                          <span className="rc-dotted-field">
                            {profile.dobWords || ""}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: "bold" }}>समग्र आई.डी.</td>
                        <td>
                          <span id="rcSamagra" className="rc-dotted-field">
                            {profile.samagraId || ""}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>आधार नं.</td>
                        <td>
                          <span className="rc-dotted-field">
                            {profile.aadhaarId || ""}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: "bold" }}>स्कॉलर क्रमांक</td>
                        <td>
                          <span className="rc-dotted-field">
                            {profile.scholarNo || ""}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>
                          अनुक्रमांक (Roll No)
                        </td>
                        <td>
                          <span className="rc-dotted-field">
                            {student?.rollNo || ""}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: "bold" }}>विद्यालय का नाम</td>
                        <td colSpan={3}>
                          <span
                            className="rc-dotted-field"
                            style={{ minWidth: 200 }}
                          >
                            {profile.schoolName || ""}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: "bold" }}>विकासखंड</td>
                        <td>
                          <span className="rc-dotted-field">
                            {profile.block || ""}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>जिला</td>
                        <td>
                          <span className="rc-dotted-field">
                            {profile.district || ""}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ===== Marks Table ===== */}
                <div
                  style={{
                    border: "1.5px solid #000",
                    marginBottom: 10,
                    overflow: "hidden",
                  }}
                >
                  <div className="rc-section-heading">
                    शैक्षिक उपलब्धि (Academic Achievement)
                  </div>
                  <table className="rc-table">
                    <thead>
                      <tr>
                        <th
                          rowSpan={2}
                          style={{
                            width: "22%",
                            verticalAlign: "middle",
                            fontWeight: "bold",
                            textAlign: "center",
                            border: "1px solid #000",
                            padding: "6px 4px",
                          }}
                        >
                          विषय
                        </th>
                        <th
                          colSpan={6}
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            border: "1px solid #000",
                            padding: "6px 4px",
                          }}
                        >
                          शैक्षिक मूल्यांकन (ग्रेड)
                        </th>
                      </tr>
                      <tr>
                        <th
                          style={{
                            width: "10%",
                            fontWeight: "bold",
                            textAlign: "center",
                            border: "1px solid #000",
                            padding: "5px 3px",
                          }}
                        >
                          पूर्णांक
                        </th>
                        <th
                          style={{
                            width: "14%",
                            fontWeight: "bold",
                            textAlign: "center",
                            border: "1px solid #000",
                            padding: "5px 3px",
                          }}
                        >
                          मासिक टेस्ट
                          <br />
                          (अधिभार 10 अंक)
                        </th>
                        <th
                          style={{
                            width: "15%",
                            fontWeight: "bold",
                            textAlign: "center",
                            border: "1px solid #000",
                            padding: "5px 3px",
                          }}
                        >
                          अर्धवार्षिक परीक्षा
                          <br />
                          (अधिभार 20 अंक)
                        </th>
                        <th
                          style={{
                            width: "16%",
                            fontWeight: "bold",
                            textAlign: "center",
                            border: "1px solid #000",
                            padding: "5px 3px",
                          }}
                        >
                          वार्षिक परीक्षा (लिखित)
                          <br />
                          (अ.अं. 60 अंक)
                        </th>
                        <th
                          style={{
                            width: "15%",
                            fontWeight: "bold",
                            textAlign: "center",
                            border: "1px solid #000",
                            padding: "5px 3px",
                          }}
                        >
                          वार्षिक परीक्षा (प्रोजेक्ट)
                          <br />
                          (अधिभार 10 अंक)
                        </th>
                        <th
                          style={{
                            width: "8%",
                            fontWeight: "bold",
                            textAlign: "center",
                            border: "1px solid #000",
                            padding: "5px 3px",
                          }}
                        >
                          समेकित ग्रेड
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectTotals.map((sub) => (
                        <tr key={sub.key}>
                          <td style={{ textAlign: "left" }}>
                            {sub.hindi} ({sub.english})
                          </td>
                          <td>100</td>
                          <td>{sub.monthly || ""}</td>
                          <td>{sub.half || ""}</td>
                          <td>{sub.annual || ""}</td>
                          <td>{sub.project || ""}</td>
                          <td style={{ fontWeight: "bold" }}>
                            {getGrade(sub.total, 100)}
                          </td>
                        </tr>
                      ))}
                      <tr className="rc-grand-total">
                        <td style={{ fontWeight: "bold", textAlign: "center" }}>
                          कुल / Grand Total
                        </td>
                        <td style={{ fontWeight: "bold" }}>{maxTotal}</td>
                        <td colSpan={4} />
                        <td style={{ fontWeight: "bold" }}>{finalGrade}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ===== Co-Scholastic & Personal Skills ===== */}
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  {/* Co-Scholastic */}
                  <div style={{ flex: 1 }} className="co-section-box">
                    <div className="rc-section-heading">
                      सह-शैक्षिक क्षेत्र (Co-Scholastic Area)
                    </div>
                    <table className="rc-table" style={{ border: "none" }}>
                      <thead>
                        <tr>
                          <th>गतिविधि</th>
                          <th style={{ width: "35%" }}>ग्रेड</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            साहित्यिक (Literary)
                          </td>
                          <td>{csLiterary}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            सांस्कृतिक (Cultural)
                          </td>
                          <td>{csCultural}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            वैज्ञानिक (Scientific)
                          </td>
                          <td>{csScientific}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            सृजनात्मक (Creative)
                          </td>
                          <td>{csCreative}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "left" }}>खेलकूद (Sports)</td>
                          <td>{csSports}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Personal Skills */}
                  <div style={{ flex: 1 }} className="co-section-box">
                    <div className="rc-section-heading">
                      व्यक्तिगत गुण (Personal Skills)
                    </div>
                    <table className="rc-table" style={{ border: "none" }}>
                      <thead>
                        <tr>
                          <th>गुण</th>
                          <th style={{ width: "35%" }}>ग्रेड</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            स्वच्छता (Cleanliness)
                          </td>
                          <td>{psCleanliness}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            अनुशासन (Discipline)
                          </td>
                          <td>{psDiscipline}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            ईमानदारी (Honesty)
                          </td>
                          <td>{psHonesty}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            समयनिष्ठा (Punctuality)
                          </td>
                          <td>{psPunctuality}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: "left" }}>
                            सहयोग (Cooperation)
                          </td>
                          <td>{psCooperation}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ===== Grade Summary ===== */}
                <div className="grade-summary-section">
                  <div className="rc-section-heading">
                    शैक्षिक मूल्यांकन हेतु संचयी ग्रेड का विवरण
                  </div>
                  <div className="grade-summary-inner">
                    <table
                      style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              border: "1px solid #555",
                              padding: "5px 6px",
                              fontWeight: "bold",
                              background: "#f0f0f0",
                              color: "#000",
                              fontSize: 13,
                            }}
                          >
                            ग्रेड
                          </th>
                          {mpGradeList.map((g) => (
                            <th
                              key={g}
                              style={{
                                border: "1px solid #555",
                                padding: "5px 6px",
                                fontWeight: "bold",
                                fontSize: 13,
                                background:
                                  mpGrade === g ? "#d0d0d0" : "#f0f0f0",
                                color: "#000",
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
                              border: "1px solid #555",
                              padding: "5px 6px",
                              fontWeight: "bold",
                              fontSize: 12,
                              background: "#fafafa",
                            }}
                          >
                            प्रतिशत
                          </td>
                          {mpGradeList.map((g) => (
                            <td
                              key={g}
                              style={{
                                border: "1px solid #555",
                                padding: "5px 6px",
                                fontSize: 11,
                                background:
                                  mpGrade === g ? "#d0d0d0" : "#fafafa",
                                fontWeight: mpGrade === g ? "bold" : "normal",
                              }}
                            >
                              {gradeRanges[g]}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>

                    <p className="note-line">
                      <strong>नोट -</strong> वार्षिक परीक्षा फल निर्धारण में सह-शैक्षिक
                      क्षेत्र एवं व्यक्तिगत सामाजिक गुणों में अंकित ग्रेड को नहीं जोड़ा गया है।
                    </p>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 13,
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
                            borderBottom: "1.5px solid #000",
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
                        />{" "}
                        <strong>में कक्षोन्नत किया जाता है।</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ===== Signatures ===== */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: 20,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div className="sig-line" />
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      कक्षा अध्यापक के हस्ताक्षर
                    </div>
                    <div style={{ fontSize: 11 }}>
                      (Class Teacher Signature)
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12 }}>
                    <div>मुद्रण दिनांक: {today()}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div className="sig-line" />
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      प्राचार्य के हस्ताक्षर
                    </div>
                    <div style={{ fontSize: 11 }}>(Principal Signature)</div>
                  </div>
                </div>
              </div>
              {/* rc-content */}
            </div>
            {/* rc-inner-border */}
          </div>
          {/* rc-outer-border */}
        </div>
      )}
    </>
  );
}
