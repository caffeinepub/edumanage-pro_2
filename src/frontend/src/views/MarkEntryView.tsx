import { students as mockStudents } from "@/data/mockData";
import type { Role } from "@/hooks/useAuth";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  SaveAll,
  Search,
  ShieldAlert,
  Unlock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const EXAM_TABS = [
  {
    key: "monthly",
    label: "Monthly Test",
    labelHi: "मासिक परीक्षा",
    maxMarks: 60,
    color: "#7c3aed",
  },
  {
    key: "halfyearly",
    label: "Half Yearly Exam",
    labelHi: "अर्द्धवार्षिक परीक्षा",
    maxMarks: 60,
    color: "#1a56db",
  },
  {
    key: "annual",
    label: "Annual Written Exam",
    labelHi: "वार्षिक लिखित परीक्षा",
    maxMarks: 60,
    color: "#0891b2",
  },
  {
    key: "project",
    label: "Project Work",
    labelHi: "प्रोजेक्ट कार्य",
    maxMarks: 20,
    color: "#16a34a",
  },
] as const;

type ExamKey = (typeof EXAM_TABS)[number]["key"];

const CATEGORIES = ["Language", "Subject"];

// Class-wise subject configuration
const CLASS_SUBJECT_CONFIG: Record<
  string,
  {
    categories: Record<string, string[]>;
    allSubjects: { key: string; labelHi: string }[];
  }
> = {
  "3": {
    categories: {
      Language: ["Hindi", "English"],
      Subject: ["Mathematics", "EVS"],
    },
    allSubjects: [
      { key: "Hindi", labelHi: "हिन्दी" },
      { key: "English", labelHi: "अंग्रेजी" },
      { key: "Mathematics", labelHi: "गणित" },
      { key: "EVS", labelHi: "पर्यावरण (EVS)" },
    ],
  },
  "4": {
    categories: {
      Language: ["Hindi", "English"],
      Subject: ["Mathematics", "EVS"],
    },
    allSubjects: [
      { key: "Hindi", labelHi: "हिन्दी" },
      { key: "English", labelHi: "अंग्रेजी" },
      { key: "Mathematics", labelHi: "गणित" },
      { key: "EVS", labelHi: "पर्यावरण (EVS)" },
    ],
  },
  "6": {
    categories: {
      Language: ["Hindi", "English", "Sanskrit"],
      Subject: ["Mathematics", "Science", "Social Science"],
    },
    allSubjects: [
      { key: "Hindi", labelHi: "हिन्दी" },
      { key: "English", labelHi: "अंग्रेजी" },
      { key: "Sanskrit", labelHi: "संस्कृत" },
      { key: "Mathematics", labelHi: "गणित" },
      { key: "Science", labelHi: "विज्ञान" },
      { key: "Social Science", labelHi: "सामाजिक विज्ञान" },
    ],
  },
  "7": {
    categories: {
      Language: ["Hindi", "English", "Sanskrit"],
      Subject: ["Mathematics", "Science", "Social Science"],
    },
    allSubjects: [
      { key: "Hindi", labelHi: "हिन्दी" },
      { key: "English", labelHi: "अंग्रेजी" },
      { key: "Sanskrit", labelHi: "संस्कृत" },
      { key: "Mathematics", labelHi: "गणित" },
      { key: "Science", labelHi: "विज्ञान" },
      { key: "Social Science", labelHi: "सामाजिक विज्ञान" },
    ],
  },
};

const CLASS_OPTIONS = ["3", "4", "6", "7"];

// Default (class 6) — overridden dynamically
const SUBJECTS_BY_CATEGORY: Record<string, string[]> = {
  Language: ["Hindi", "English", "Sanskrit"],
  Subject: ["Mathematics", "Science", "Social Science"],
};

// MONTHLY_SUBJECTS moved to CLASS_SUBJECT_CONFIG

const PAGE_SIZE = 5;

function getSamagraId(id: number): string {
  return `SMG${String(id * 7 + 100000).padStart(8, "0")}`;
}

interface StudentRow {
  id: number;
  rollNo: string;
  samagraId: string;
  name: string;
  present: boolean;
  cancelled: boolean;
  marks: string;
  locked: boolean;
}

function getStudentList() {
  const storedExtra: { id: number; name: string; rollNo: string }[] = (() => {
    try {
      const raw = localStorage.getItem("students");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  })();
  const mockIds = new Set(mockStudents.map((s) => s.id));
  const uniqueExtra = storedExtra.filter((s) => !mockIds.has(s.id));
  return [
    ...mockStudents.map((s) => ({ id: s.id, name: s.name, rollNo: s.rollNo })),
    ...uniqueExtra.map((s) => ({
      id: s.id,
      name: s.name,
      rollNo: s.rollNo ?? `EXT${s.id}`,
    })),
  ];
}

function buildRows(examKey: ExamKey, subject: string): StudentRow[] {
  const allStudents = getStudentList();
  const key = `emsmarks_v2_${examKey}_${subject}`;
  let saved: Record<
    number,
    { present: boolean; cancelled: boolean; marks: string; locked: boolean }
  > = {};
  try {
    const raw = localStorage.getItem(key);
    if (raw) saved = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  return allStudents.map((s) => ({
    id: s.id,
    rollNo: s.rollNo,
    samagraId: getSamagraId(s.id),
    name: s.name,
    present: saved[s.id]?.present ?? true,
    cancelled: saved[s.id]?.cancelled ?? false,
    marks: saved[s.id]?.marks ?? "",
    locked: saved[s.id]?.locked ?? false,
  }));
}

function saveRows(
  examKey: ExamKey,
  subject: string,
  rows: StudentRow[],
  selectedIds: Set<number>,
) {
  const key = `emsmarks_v2_${examKey}_${subject}`;
  const payload: Record<
    number,
    { present: boolean; cancelled: boolean; marks: string; locked: boolean }
  > = {};
  for (const r of rows) {
    if (selectedIds.has(r.id)) {
      payload[r.id] = {
        present: r.present,
        cancelled: r.cancelled,
        marks: r.marks,
        locked: r.locked,
      };
    }
  }
  localStorage.setItem(key, JSON.stringify(payload));

  const marksKey = "studentExamMarks";
  let allMarks: Record<number, Record<string, string>> = {};
  try {
    const raw = localStorage.getItem(marksKey);
    if (raw) allMarks = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  for (const r of rows) {
    if (selectedIds.has(r.id)) {
      if (!allMarks[r.id]) allMarks[r.id] = {};
      allMarks[r.id][examKey] = r.marks;
    }
  }
  localStorage.setItem(marksKey, JSON.stringify(allMarks));
}

/** Read a student's marks for a given monthly subject from localStorage */
function getMonthlySubjectMarks(studentId: number, subjectKey: string): number {
  try {
    const raw = localStorage.getItem(`emsmarks_v2_monthly_${subjectKey}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    const val = parsed[studentId]?.marks;
    const num = Number(val);
    return Number.isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

/** Read a student's marks for a given half yearly subject from localStorage */
function getHalfYearlySubjectMarks(
  studentId: number,
  subjectKey: string,
): number {
  try {
    const raw = localStorage.getItem(`emsmarks_v2_halfyearly_${subjectKey}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    const val = parsed[studentId]?.marks;
    const num = Number(val);
    return Number.isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

export function MarkEntryView({ role }: { role: Role }) {
  const [activeTab, setActiveTab] = useState<ExamKey>("monthly");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState(
    SUBJECTS_BY_CATEGORY[CATEGORIES[0]][0],
  );
  const [searched, setSearched] = useState(false);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("6");

  // Derived subject config based on selected class
  const classConfig = CLASS_SUBJECT_CONFIG[selectedClass];
  const subjectsByCategory = classConfig.categories;
  const monthlySubjects = classConfig.allSubjects;

  const currentTab = EXAM_TABS.find((t) => t.key === activeTab)!;
  const maxMarks = currentTab.maxMarks;

  // Auto-load students on page mount
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cats = CLASS_SUBJECT_CONFIG[selectedClass].categories;
    setSubject(cats[category]?.[0] ?? cats[Object.keys(cats)[0]][0]);
  }, [category, selectedClass]);

  // When class changes, reset category and subject
  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    const cats = CLASS_SUBJECT_CONFIG[cls].categories;
    const firstCat = Object.keys(cats)[0];
    setCategory(firstCat);
    setSubject(cats[firstCat][0]);
  };

  const handleTabChange = (tab: ExamKey) => {
    setActiveTab(tab);
    if (searched) {
      const loaded = buildRows(tab, subject);
      setRows(loaded);
      setSelectedIds(new Set());
      setPage(1);
      setErrors({});
      setSaved(false);
    }
  };

  const handleSearch = () => {
    const loaded = buildRows(activeTab, subject);
    setRows(loaded);
    setSelectedIds(new Set());
    setPage(1);
    setErrors({});
    setSaved(false);
    setSearched(true);
    setSelectedStudent("all");
  };

  const handleReset = () => {
    setCategory(CATEGORIES[0]);
    setSubject(SUBJECTS_BY_CATEGORY[CATEGORIES[0]][0]);
    setRows([]);
    setSelectedIds(new Set());
    setPage(1);
    setErrors({});
    setSaved(false);
    setSearched(false);
    setSelectedStudent("all");
  };

  // Filter rows by selected student
  const filteredRows =
    selectedStudent === "all"
      ? rows
      : rows.filter((r) => String(r.id) === selectedStudent);

  const totalStudents = filteredRows.length;
  const presentStudents = filteredRows.filter(
    (r) => r.present && !r.cancelled,
  ).length;
  const absentStudents = filteredRows.filter(
    (r) => !r.present || r.cancelled,
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateRow = (id: number, patch: Partial<StudentRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSaved(false);
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMarksChange = (id: number, value: string, max: number) => {
    const num = Number(value);
    if (value !== "" && !Number.isNaN(num) && num > max) {
      alert(`अंक ${max} से अधिक नहीं हो सकते! (Marks cannot exceed ${max})`);
      updateRow(id, { marks: String(max) });
      setErrors((prev) => ({ ...prev, [id]: `Max: ${max}` }));
      return;
    }
    updateRow(id, { marks: value });
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSave = () => {
    const newErrors: Record<number, string> = {};
    for (const r of rows) {
      if (!selectedIds.has(r.id)) continue;
      if (r.marks !== "") {
        const v = Number(r.marks);
        if (Number.isNaN(v) || v < 0 || v > maxMarks) {
          newErrors[r.id] = `Max: ${maxMarks}`;
        }
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alert(
        `कुछ अंक अमान्य हैं। कृपया जांचें। (Some marks exceed the maximum of ${maxMarks})`,
      );
      return;
    }
    saveRows(activeTab, subject, rows, selectedIds);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const studentList = getStudentList();

  // Monthly result calculation — reacts to rows changes and selected student
  const monthlyResult = useMemo(() => {
    if (activeTab !== "monthly" || selectedStudent === "all") return null;
    const studentId = Number(selectedStudent);
    const subjectMarks = monthlySubjects.map((s) => ({
      ...s,
      marks: getMonthlySubjectMarks(studentId, s.key),
    }));
    // Also pick up any unsaved in-memory marks for currently displayed subject
    for (const row of rows) {
      if (row.id === studentId) {
        const subEntry = subjectMarks.find((s) => s.key === subject);
        if (subEntry) {
          const inMemory = Number(row.marks);
          subEntry.marks = Number.isNaN(inMemory) ? subEntry.marks : inMemory;
        }
        break;
      }
    }
    const total = subjectMarks.reduce((sum, s) => sum + s.marks, 0);
    const subjectCount = monthlySubjects.length;
    const final = subjectCount > 0 ? total / (subjectCount * 6) : 0;
    return { subjectMarks, total, final };
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  }, [activeTab, selectedStudent, rows, subject, monthlySubjects]);

  // Half Yearly result calculation — reacts to rows changes and selected student
  const halfYearlyResult = useMemo(() => {
    if (activeTab !== "halfyearly" || selectedStudent === "all") return null;
    const studentId = Number(selectedStudent);
    const subjectMarks = monthlySubjects.map((s) => ({
      ...s,
      marks: getHalfYearlySubjectMarks(studentId, s.key),
    }));
    // Also pick up any unsaved in-memory marks for currently displayed subject
    for (const row of rows) {
      if (row.id === studentId) {
        const subEntry = subjectMarks.find((s) => s.key === subject);
        if (subEntry) {
          const inMemory = Number(row.marks);
          subEntry.marks = Number.isNaN(inMemory) ? subEntry.marks : inMemory;
        }
        break;
      }
    }
    const total = subjectMarks.reduce((sum, s) => sum + s.marks, 0);
    const subjectCount = monthlySubjects.length; // 4 or 6
    const final = subjectCount > 0 ? total / (subjectCount * 3) : 0;
    return { subjectMarks, total, final, subjectCount };
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  }, [activeTab, selectedStudent, rows, subject, monthlySubjects]);

  if (role === "student") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: 380,
          }}
        >
          <ShieldAlert
            style={{
              color: "#ef4444",
              width: 48,
              height: 48,
              margin: "0 auto 16px",
            }}
          />
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Access Denied
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Only Admins and Teachers can enter marks. You can view your marks in
            the Results section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: 13,
        color: "#222",
        background: "#f0f4f8",
        minHeight: "100%",
        padding: 0,
      }}
    >
      {/* Blue Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #1a56db 0%, #1e429f 100%)",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>
          अंक प्रविष्टि प्रणाली (Mark Entry System)
        </div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
          शिक्षा प्रबंधन पोर्टल — Government Education Portal
        </div>
      </div>

      {/* Exam Type Tabs */}
      <div
        style={{
          background: "#fff",
          borderLeft: "1px solid #d1d5db",
          borderRight: "1px solid #d1d5db",
          borderBottom: "1px solid #d1d5db",
          display: "flex",
          flexWrap: "wrap",
          gap: 0,
        }}
      >
        {EXAM_TABS.map((tab, idx) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                flex: "1 1 auto",
                padding: "10px 12px",
                border: "none",
                borderBottom: isActive
                  ? `3px solid ${tab.color}`
                  : "3px solid transparent",
                borderRight:
                  idx < EXAM_TABS.length - 1 ? "1px solid #e5e7eb" : "none",
                background: isActive ? `${tab.color}10` : "#fff",
                color: isActive ? tab.color : "#374151",
                fontWeight: isActive ? 700 : 500,
                fontSize: 12.5,
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 1 }}>
                {tab.labelHi}
              </div>
              <div>{tab.label}</div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 3,
                  background: isActive ? tab.color : "#e5e7eb",
                  color: isActive ? "#fff" : "#6b7280",
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                Max: {tab.maxMarks}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active tab info bar */}
      <div
        style={{
          background: `${currentTab.color}15`,
          borderLeft: `4px solid ${currentTab.color}`,
          borderBottom: `1px solid ${currentTab.color}30`,
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12.5,
        }}
      >
        <span style={{ fontWeight: 700, color: currentTab.color }}>
          {currentTab.label}
        </span>
        <span style={{ color: "#6b7280" }}>|</span>
        <span style={{ color: "#374151" }}>
          Maximum Marks:{" "}
          <strong style={{ color: currentTab.color }}>{maxMarks}</strong>
        </span>
        <span style={{ color: "#6b7280" }}>|</span>
        <span style={{ color: "#374151", fontSize: 11 }}>
          {currentTab.labelHi}
        </span>
      </div>

      {/* Filter Row */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #d1d5db",
          borderTop: "none",
          padding: "16px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
        }}
      >
        {/* Class dropdown */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 120,
          }}
        >
          <label htmlFor="class-select" style={labelStyle}>
            कक्षा / Class
          </label>
          <select
            id="class-select"
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            style={selectStyle}
          >
            {CLASS_OPTIONS.map((cls) => (
              <option key={cls} value={cls}>
                कक्षा {cls}वीं
              </option>
            ))}
          </select>
        </div>

        {/* Student dropdown */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 200,
          }}
        >
          <label htmlFor="student-select" style={labelStyle}>
            छात्र / Student
          </label>
          <select
            id="student-select"
            value={selectedStudent}
            onChange={(e) => {
              setSelectedStudent(e.target.value);
              setPage(1);
            }}
            style={selectStyle}
            data-ocid="mark_entry.select"
          >
            <option value="all">-- All Students --</option>
            {studentList.length === 0 ? (
              <option disabled>No students found</option>
            ) : (
              studentList.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.rollNo} - {s.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 140,
          }}
        >
          <label htmlFor="cat-select" style={labelStyle}>
            श्रेणी / Category
          </label>
          <select
            id="cat-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={selectStyle}
          >
            {Object.keys(subjectsByCategory).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 160,
          }}
        >
          <label htmlFor="subj-select" style={labelStyle}>
            विषय / Subject
          </label>
          <select
            id="subj-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={selectStyle}
          >
            {(subjectsByCategory[category] ?? []).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, paddingBottom: 1 }}>
          <button
            type="button"
            onClick={handleSearch}
            style={{ ...btnStyle, background: currentTab.color, color: "#fff" }}
            data-ocid="mark_entry.primary_button"
          >
            <Search style={{ width: 14, height: 14 }} /> Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{ ...btnStyle, background: "#6b7280", color: "#fff" }}
            data-ocid="mark_entry.secondary_button"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Instruction Box */}
      <div
        style={{
          margin: "12px 0 0",
          background: "#eff6ff",
          border: "1px solid #93c5fd",
          borderLeft: "4px solid #1a56db",
          borderRadius: 4,
          padding: "10px 16px",
          fontSize: 12.5,
          color: "#1e3a8a",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          निर्देश / Instructions:
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>उपस्थिति चेकबॉक्स पर टिक करें यदि छात्र उपस्थित है।</li>
          <li>
            अंक {maxMarks} से अधिक नहीं होने चाहिए। (Marks must not exceed{" "}
            {maxMarks})
          </li>
          <li>"Save Selected" बटन केवल चयनित पंक्तियों को सहेजेगा।</li>
          <li>प्रत्येक परीक्षा प्रकार के अंक अलग-अलग सहेजे जाते हैं।</li>
        </ul>
      </div>

      {/* Summary Cards */}
      {searched && (
        <div
          style={{
            display: "flex",
            gap: 12,
            margin: "12px 0 0",
            flexWrap: "wrap",
          }}
        >
          <SummaryCard
            label="कुल छात्र / Total Students"
            value={totalStudents}
            color="#1a56db"
            bg="#eff6ff"
          />
          <SummaryCard
            label="उपस्थित / Present"
            value={presentStudents}
            color="#16a34a"
            bg="#f0fdf4"
          />
          <SummaryCard
            label="अनुपस्थित / Absent"
            value={absentStudents}
            color="#dc2626"
            bg="#fef2f2"
          />
        </div>
      )}

      {/* Monthly Result Panel */}
      {monthlyResult && (
        <div
          style={{
            marginTop: 12,
            background: "#faf5ff",
            border: "1px solid #c4b5fd",
            borderLeft: "4px solid #7c3aed",
            borderRadius: 6,
            overflow: "hidden",
          }}
          data-ocid="mark_entry.panel"
        >
          {/* Panel header */}
          <div
            style={{
              background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)",
              color: "#fff",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                मासिक परिणाम सारांश / Monthly Result Summary
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>
                सभी विषयों के अंकों का योग (All subjects combined)
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 6,
                padding: "6px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, opacity: 0.85 }}>मासिक परिणाम</div>
              <div
                id="monthlyResult"
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                }}
                data-ocid="mark_entry.card"
              >
                {monthlyResult.final.toFixed(2)}
              </div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>/ 10</div>
            </div>
          </div>

          {/* Subject marks table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12.5,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#ede9fe",
                    color: "#5b21b6",
                  }}
                >
                  <th
                    style={{
                      ...thStyle,
                      background: "#ede9fe",
                      color: "#5b21b6",
                      border: "1px solid #c4b5fd",
                      textAlign: "left",
                    }}
                  >
                    विषय / Subject
                  </th>
                  <th
                    style={{
                      ...thStyle,
                      background: "#ede9fe",
                      color: "#5b21b6",
                      border: "1px solid #c4b5fd",
                    }}
                  >
                    अंक / Marks
                  </th>
                  <th
                    style={{
                      ...thStyle,
                      background: "#ede9fe",
                      color: "#5b21b6",
                      border: "1px solid #c4b5fd",
                    }}
                  >
                    अधिकतम / Max
                  </th>
                  <th
                    style={{
                      ...thStyle,
                      background: "#ede9fe",
                      color: "#5b21b6",
                      border: "1px solid #c4b5fd",
                    }}
                  >
                    स्थिति / Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyResult.subjectMarks.map((s, idx) => {
                  const pct = Math.round((s.marks / 60) * 100);
                  return (
                    <tr
                      key={s.key}
                      style={{
                        background: idx % 2 === 0 ? "#faf5ff" : "#f5f0ff",
                        borderBottom: "1px solid #e9d5ff",
                      }}
                    >
                      <td
                        style={{
                          ...tdStyle,
                          border: "1px solid #e9d5ff",
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ color: "#7c3aed" }}>{s.labelHi}</span>
                        <span
                          style={{
                            color: "#9ca3af",
                            fontWeight: 400,
                            marginLeft: 6,
                            fontSize: 11.5,
                          }}
                        >
                          ({s.key})
                        </span>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          border: "1px solid #e9d5ff",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: 14,
                          color: s.marks > 0 ? "#5b21b6" : "#9ca3af",
                        }}
                      >
                        {s.marks}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          border: "1px solid #e9d5ff",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        60
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          border: "1px solid #e9d5ff",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 60,
                              height: 6,
                              background: "#e9d5ff",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background:
                                  pct >= 60
                                    ? "#16a34a"
                                    : pct >= 33
                                      ? "#7c3aed"
                                      : "#dc2626",
                                borderRadius: 3,
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color:
                                pct >= 60
                                  ? "#16a34a"
                                  : pct >= 33
                                    ? "#7c3aed"
                                    : s.marks === 0
                                      ? "#9ca3af"
                                      : "#dc2626",
                              minWidth: 30,
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Total row */}
                <tr
                  style={{
                    background: "#ede9fe",
                    borderTop: "2px solid #7c3aed",
                    fontWeight: 700,
                  }}
                >
                  <td
                    style={{
                      ...tdStyle,
                      border: "1px solid #c4b5fd",
                      fontWeight: 700,
                      color: "#5b21b6",
                      fontSize: 13,
                    }}
                  >
                    कुल योग / Grand Total
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      border: "1px solid #c4b5fd",
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#5b21b6",
                    }}
                  >
                    {monthlyResult.total}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      border: "1px solid #c4b5fd",
                      textAlign: "center",
                      color: "#6b7280",
                      fontWeight: 700,
                    }}
                  >
                    360
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      border: "1px solid #c4b5fd",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        background: "#7c3aed",
                        color: "#fff",
                        borderRadius: 4,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                      }}
                    >
                      {Math.round((monthlyResult.total / 360) * 100)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Final result footer */}
          <div
            style={{
              background: "#f3e8ff",
              borderTop: "1px solid #c4b5fd",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12.5, color: "#5b21b6" }}>
              <strong>सूत्र / Formula:</strong> कुल अंक (Total {monthlyResult.total}
              ) ÷ 36 ={" "}
              <strong
                style={{
                  fontSize: 15,
                  color: "#7c3aed",
                }}
              >
                {monthlyResult.final.toFixed(2)}
              </strong>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#5b21b6",
                  fontWeight: 600,
                }}
              >
                मासिक परिणाम (Monthly Result):
              </span>
              <span
                style={{
                  background: "#7c3aed",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "4px 14px",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: 0.5,
                }}
              >
                <span id="monthlyResultFooter">
                  {monthlyResult.final.toFixed(2)}
                </span>{" "}
                / 10
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Half Yearly Result Panel */}
      {halfYearlyResult && (
        <div
          style={{
            marginTop: 12,
            background: "#f0f9ff",
            border: "1px solid #7dd3fc",
            borderLeft: "4px solid #0284c7",
            borderRadius: 6,
            overflow: "hidden",
          }}
          data-ocid="mark_entry.halfyearly_panel"
        >
          {/* Panel header */}
          <div
            style={{
              background: "linear-gradient(90deg, #0284c7 0%, #0369a1 100%)",
              color: "#fff",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                अर्धवार्षिक परिणाम सारांश / Half Yearly Result Summary
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>
                सभी विषयों के अंकों का योग (All subjects combined) | विषय:{" "}
                {halfYearlyResult.subjectCount}
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 6,
                padding: "6px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, opacity: 0.85 }}>
                अर्धवार्षिक परिणाम
              </div>
              <div
                id="halfYearlyResult"
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                }}
                data-ocid="mark_entry.halfyearly_card"
              >
                {halfYearlyResult.final.toFixed(2)}
              </div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>/ 20</div>
            </div>
          </div>

          {/* Subject marks table */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12.5,
              }}
            >
              <thead>
                <tr style={{ background: "#e0f2fe", color: "#0369a1" }}>
                  <th
                    style={{
                      ...thStyle,
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "1px solid #7dd3fc",
                      textAlign: "left",
                    }}
                  >
                    विषय / Subject
                  </th>
                  <th
                    style={{
                      ...thStyle,
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "1px solid #7dd3fc",
                    }}
                  >
                    अंक / Marks
                  </th>
                  <th
                    style={{
                      ...thStyle,
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "1px solid #7dd3fc",
                    }}
                  >
                    अधिकतम / Max
                  </th>
                  <th
                    style={{
                      ...thStyle,
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "1px solid #7dd3fc",
                    }}
                  >
                    स्थिति / Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {halfYearlyResult.subjectMarks.map((s, idx) => {
                  const pct = Math.round((s.marks / 60) * 100);
                  return (
                    <tr
                      key={s.key}
                      style={{ background: idx % 2 === 0 ? "#fff" : "#f0f9ff" }}
                    >
                      <td
                        style={{
                          ...tdStyle,
                          border: "1px solid #bae6fd",
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ color: "#0369a1" }}>{s.labelHi}</span>
                        <span
                          style={{
                            color: "#9ca3af",
                            fontWeight: 400,
                            marginLeft: 6,
                            fontSize: 11.5,
                          }}
                        >
                          ({s.key})
                        </span>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          border: "1px solid #bae6fd",
                          textAlign: "center",
                          fontWeight: 700,
                          fontSize: 14,
                          color: s.marks > 0 ? "#0369a1" : "#9ca3af",
                        }}
                      >
                        {s.marks}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          border: "1px solid #bae6fd",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        60
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          border: "1px solid #bae6fd",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 60,
                              height: 6,
                              background: "#bae6fd",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background:
                                  pct >= 60
                                    ? "#16a34a"
                                    : pct >= 33
                                      ? "#0284c7"
                                      : "#dc2626",
                                borderRadius: 3,
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color:
                                pct >= 60
                                  ? "#16a34a"
                                  : pct >= 33
                                    ? "#0284c7"
                                    : s.marks === 0
                                      ? "#9ca3af"
                                      : "#dc2626",
                              minWidth: 30,
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Total row */}
                <tr
                  style={{
                    background: "#e0f2fe",
                    borderTop: "2px solid #0284c7",
                    fontWeight: 700,
                  }}
                >
                  <td
                    style={{
                      ...tdStyle,
                      border: "1px solid #7dd3fc",
                      fontWeight: 700,
                      color: "#0369a1",
                      fontSize: 13,
                    }}
                  >
                    कुल योग / Grand Total
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      border: "1px solid #7dd3fc",
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#0369a1",
                    }}
                  >
                    {halfYearlyResult.total}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      border: "1px solid #7dd3fc",
                      textAlign: "center",
                      color: "#6b7280",
                      fontWeight: 700,
                    }}
                  >
                    {halfYearlyResult.subjectCount * 60}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      border: "1px solid #7dd3fc",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        background: "#0284c7",
                        color: "#fff",
                        borderRadius: 4,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                      }}
                    >
                      {Math.round(
                        (halfYearlyResult.total /
                          (halfYearlyResult.subjectCount * 60)) *
                          100,
                      )}
                      %
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Final result footer */}
          <div
            style={{
              background: "#e0f2fe",
              borderTop: "1px solid #7dd3fc",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12.5, color: "#0369a1" }}>
              <strong>सूत्र / Formula:</strong> कुल अंक ({halfYearlyResult.total}) ÷
              ({halfYearlyResult.subjectCount} × 3) ={" "}
              <strong style={{ fontSize: 15, color: "#0284c7" }}>
                {halfYearlyResult.final.toFixed(2)}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#0369a1", fontWeight: 600 }}>
                अर्धवार्षिक परिणाम (Half Yearly Result):
              </span>
              <span
                style={{
                  background: "#0284c7",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "4px 14px",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: 0.5,
                }}
              >
                <span id="halfYearlyResultFooter">
                  {halfYearlyResult.final.toFixed(2)}
                </span>{" "}
                / 20
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {searched && filteredRows.length > 0 && (
        <div
          style={{
            marginTop: 12,
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: currentTab.color,
              color: "#fff",
              padding: "8px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13 }}>
              {currentTab.label} — {subject} | छात्र सूची (Max: {maxMarks})
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {saved && (
                <span
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    padding: "2px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  data-ocid="mark_entry.success_state"
                >
                  ✓ Saved!
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={selectedIds.size === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: selectedIds.size === 0 ? "#94a3b8" : "#15803d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "5px 14px",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
                }}
                data-ocid="mark_entry.save_button"
              >
                <SaveAll style={{ width: 14, height: 14 }} />
                Save Selected ({selectedIds.size})
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12.5,
                minWidth: 700,
              }}
            >
              <thead>
                <tr style={{ background: "#e8f0fe", color: "#1e3a8a" }}>
                  <th style={thStyle}>☑</th>
                  <th style={thStyle}>Lock</th>
                  <th style={thStyle}>Roll No</th>
                  <th style={thStyle}>Samagra ID</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>
                    Student Name
                  </th>
                  <th style={thStyle}>Attendance</th>
                  <th style={thStyle}>Cancelled</th>
                  <th style={thStyle}>Marks (Max: {maxMarks})</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => {
                  const isAbsent = !row.present || row.cancelled;
                  const isChecked = selectedIds.has(row.id);
                  const hasError = Boolean(errors[row.id]);
                  const marksNum = Number(row.marks);
                  const isInvalid =
                    row.marks !== "" &&
                    !Number.isNaN(marksNum) &&
                    marksNum > maxMarks;
                  return (
                    <tr
                      key={row.id}
                      style={{
                        background: isAbsent
                          ? "#fef2f2"
                          : idx % 2 === 0
                            ? "#fff"
                            : "#f8faff",
                        borderBottom: "1px solid #e5e7eb",
                        opacity: row.locked ? 0.7 : 1,
                      }}
                    >
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelected(row.id)}
                          style={{
                            width: 14,
                            height: 14,
                            cursor: "pointer",
                            accentColor: currentTab.color,
                          }}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() =>
                            updateRow(row.id, { locked: !row.locked })
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 2,
                          }}
                        >
                          {row.locked ? (
                            <Lock
                              style={{
                                width: 14,
                                height: 14,
                                color: "#dc2626",
                              }}
                            />
                          ) : (
                            <Unlock
                              style={{
                                width: 14,
                                height: 14,
                                color: "#16a34a",
                              }}
                            />
                          )}
                        </button>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {row.rollNo}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                          fontFamily: "monospace",
                          fontSize: 11.5,
                          color: "#374151",
                        }}
                      >
                        {row.samagraId}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 600,
                          color: isAbsent ? "#b91c1c" : "#111",
                        }}
                      >
                        {row.name}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={row.present}
                            disabled={row.locked}
                            onChange={(e) =>
                              updateRow(row.id, { present: e.target.checked })
                            }
                            style={{
                              width: 14,
                              height: 14,
                              cursor: row.locked ? "not-allowed" : "pointer",
                              accentColor: "#16a34a",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 10,
                              color: row.present ? "#16a34a" : "#dc2626",
                              fontWeight: 600,
                            }}
                          >
                            {row.present ? "P" : "A"}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={row.cancelled}
                          disabled={row.locked}
                          onChange={(e) =>
                            updateRow(row.id, { cancelled: e.target.checked })
                          }
                          style={{
                            width: 14,
                            height: 14,
                            cursor: row.locked ? "not-allowed" : "pointer",
                            accentColor: "#f59e0b",
                          }}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <input
                              type="number"
                              min={0}
                              max={maxMarks}
                              value={row.marks}
                              disabled={
                                row.locked || !row.present || row.cancelled
                              }
                              onChange={(e) =>
                                handleMarksChange(
                                  row.id,
                                  e.target.value,
                                  maxMarks,
                                )
                              }
                              placeholder="0"
                              style={{
                                width: 60,
                                padding: "4px 6px",
                                border: `1px solid ${
                                  hasError || isInvalid ? "#ef4444" : "#d1d5db"
                                }`,
                                borderRadius: 4,
                                fontSize: 12.5,
                                textAlign: "center",
                                outline: "none",
                                background:
                                  row.locked || !row.present || row.cancelled
                                    ? "#f3f4f6"
                                    : isInvalid
                                      ? "#fef2f2"
                                      : "#fff",
                                cursor: row.locked ? "not-allowed" : "default",
                                boxShadow:
                                  isInvalid || hasError
                                    ? "0 0 0 2px #fca5a5"
                                    : "none",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 10,
                                color: currentTab.color,
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                background: `${currentTab.color}15`,
                                border: `1px solid ${currentTab.color}40`,
                                borderRadius: 3,
                                padding: "1px 5px",
                              }}
                            >
                              Max: {maxMarks}
                            </span>
                          </div>
                          {(hasError || isInvalid) && (
                            <div
                              style={{
                                color: "#ef4444",
                                fontSize: 10,
                                marginTop: 1,
                                fontWeight: 600,
                              }}
                            >
                              ⚠ Max {maxMarks} allowed
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "10px 16px",
                borderTop: "1px solid #e5e7eb",
                background: "#f8faff",
              }}
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={paginationBtn(page === 1)}
                data-ocid="mark_entry.pagination_prev"
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    ...paginationBtn(false),
                    background: p === page ? currentTab.color : "#fff",
                    color: p === page ? "#fff" : "#374151",
                    fontWeight: p === page ? 700 : 400,
                    border:
                      p === page
                        ? `1px solid ${currentTab.color}`
                        : "1px solid #d1d5db",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={paginationBtn(page === totalPages)}
                data-ocid="mark_entry.pagination_next"
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
              <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>
                Page {page} of {totalPages}
              </span>
            </div>
          )}
        </div>
      )}

      {searched && filteredRows.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#6b7280",
            background: "#fff",
            marginTop: 12,
            borderRadius: 4,
            border: "1px solid #e5e7eb",
          }}
          data-ocid="mark_entry.empty_state"
        >
          No students found. Please add students from Student Management.
        </div>
      )}

      {!searched && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 40px",
            color: "#6b7280",
            background: "#fff",
            marginTop: 12,
            borderRadius: 4,
            border: "1px dashed #d1d5db",
          }}
        >
          <Search
            style={{
              width: 36,
              height: 36,
              color: "#93c5fd",
              margin: "0 auto 12px",
            }}
          />
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
            खोजें / Search to Load Students
          </div>
          <div style={{ fontSize: 12.5 }}>
            ऊपर परीक्षा टैब चुनें, श्रेणी और विषय चुनें, फिर Search बटन दबाएं।
          </div>
        </div>
      )}

      <style>{`
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  bg,
}: { label: string; value: number; color: string; bg: string }) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${color}33`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 6,
        padding: "10px 20px",
        minWidth: 150,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color,
          lineHeight: 1.2,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: "#374151",
};
const selectStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: 12.5,
  background: "#fff",
  color: "#222",
  outline: "none",
  cursor: "pointer",
};
const btnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 16px",
  border: "none",
  borderRadius: 4,
  fontWeight: 600,
  fontSize: 12.5,
  cursor: "pointer",
  letterSpacing: 0.3,
};
const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #c7d7f4",
  fontWeight: 700,
  fontSize: 12,
  textAlign: "center",
  whiteSpace: "nowrap",
  background: "#e8f0fe",
  color: "#1e3a8a",
};
const tdStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #e5e7eb",
};

function paginationBtn(disabled: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    border: "1px solid #d1d5db",
    borderRadius: 4,
    background: disabled ? "#f3f4f6" : "#fff",
    color: disabled ? "#9ca3af" : "#374151",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 600,
  };
}
