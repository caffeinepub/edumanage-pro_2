import {
  dateToHindiWords,
  dateToNumericFormat,
} from "@/utils/dateToHindiWords";
import { transliterateToHindi } from "@/utils/hindiTransliterate";
import { Pencil, Printer, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LOGO_SRC =
  "/assets/uploads/download-019d1f1a-928b-7508-b27d-197b82228018-1.png";
const LOGO2_SRC =
  "/assets/uploads/picture2-019d1f2c-c802-73da-a6dc-465b351e743a-1.png";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8"];
const SECTIONS = ["A", "B", "C", "D"];
const CATEGORIES = ["सामान्य", "OBC", "SC", "ST", "अन्य"];
const RELIGIONS = ["हिन्दू", "मुस्लिम", "सिख", "ईसाई", "बौद्ध", "जैन", "अन्य"];
const GENDERS = ["पुरुष", "महिला", "अन्य"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface FormData {
  // Student Name
  nameEng: string;
  nameHin: string;
  nameHinManual: boolean;

  // Father
  fatherEng: string;
  fatherHin: string;
  fatherHinManual: boolean;

  // Mother
  motherEng: string;
  motherHin: string;
  motherHinManual: boolean;

  // Guardian
  guardianEng: string;
  guardianHin: string;
  guardianHinManual: boolean;
  guardianRelation: string;

  // Personal
  dob: string;
  gender: string;
  bloodGroup: string;
  category: string;
  religion: string;
  nationality: string;
  motherTongue: string;
  cwsn: string;

  // IDs
  samagraId: string;
  aadharNo: string;
  scholarNo: string;
  apaarId: string;
  bplNo: string;

  // Academic
  admissionClass: string;
  section: string;
  rollNo: string;
  admissionDate: string;
  previousSchool: string;
  previousClass: string;
  tcNo: string;
  tcDate: string;

  // Address
  address: string;
  village: string;
  post: string;
  tehsil: string;
  district: string;
  state: string;
  pincode: string;

  // Contact
  mobileNo: string;
  alternateMobile: string;
  email: string;

  // School
  schoolName: string;
  schoolCode: string;
  udiseCode: string;
  block: string;
  schoolDistrict: string;

  // Fee
  admissionFee: string;
  annualFee: string;
  otherFee: string;
  feeReceipt: string;
}

const defaultForm: FormData = {
  nameEng: "",
  nameHin: "",
  nameHinManual: false,
  fatherEng: "",
  fatherHin: "",
  fatherHinManual: false,
  motherEng: "",
  motherHin: "",
  motherHinManual: false,
  guardianEng: "",
  guardianHin: "",
  guardianHinManual: false,
  guardianRelation: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  category: "",
  religion: "",
  nationality: "भारतीय",
  motherTongue: "हिन्दी",
  cwsn: "नहीं",
  samagraId: "",
  aadharNo: "",
  scholarNo: "",
  apaarId: "",
  bplNo: "",
  admissionClass: "",
  section: "",
  rollNo: "",
  admissionDate: "",
  previousSchool: "",
  previousClass: "",
  tcNo: "",
  tcDate: "",
  address: "",
  village: "",
  post: "",
  tehsil: "",
  district: "",
  state: "मध्यप्रदेश",
  pincode: "",
  mobileNo: "",
  alternateMobile: "",
  email: "",
  schoolName: "",
  schoolCode: "",
  udiseCode: "",
  block: "",
  schoolDistrict: "",
  admissionFee: "",
  annualFee: "",
  otherFee: "",
  feeReceipt: "",
};

const LS_KEY = "admission_form_data";

function loadForm(): FormData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw
      ? { ...defaultForm, ...(JSON.parse(raw) as Partial<FormData>) }
      : { ...defaultForm };
  } catch {
    return { ...defaultForm };
  }
}

export function AdmissionFormView() {
  const [form, setForm] = useState<FormData>(loadForm);
  const [saved, setSaved] = useState(false);

  const nameHinRef = useRef<HTMLInputElement | null>(null);
  const fatherHinRef = useRef<HTMLInputElement | null>(null);
  const motherHinRef = useRef<HTMLInputElement | null>(null);
  const guardianHinRef = useRef<HTMLInputElement | null>(null);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Auto transliterate helpers
  function handleEngInput(
    engField: keyof FormData,
    hinField: keyof FormData,
    manualField: keyof FormData,
    value: string,
  ) {
    const isManual = form[manualField] as boolean;
    setForm((prev) => ({
      ...prev,
      [engField]: value,
      [hinField]: isManual ? prev[hinField] : transliterateToHindi(value),
    }));
  }

  function handleHinManual(
    hinField: keyof FormData,
    manualField: keyof FormData,
    value: string,
  ) {
    setForm((prev) => ({ ...prev, [hinField]: value, [manualField]: true }));
  }

  function resetAuto(
    engField: keyof FormData,
    hinField: keyof FormData,
    manualField: keyof FormData,
  ) {
    setForm((prev) => ({
      ...prev,
      [hinField]: transliterateToHindi(prev[engField] as string),
      [manualField]: false,
    }));
  }

  function saveForm() {
    localStorage.setItem(LS_KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function clearForm() {
    if (window.confirm("फॉर्म का सारा डेटा हटाएं?")) {
      localStorage.removeItem(LS_KEY);
      setForm({ ...defaultForm });
    }
  }

  // Compute DOB display
  const dobNumeric = form.dob ? dateToNumericFormat(form.dob) : "";
  const dobWords = form.dob ? dateToHindiWords(form.dob) : "";

  const admissionYear = form.admissionDate
    ? new Date(form.admissionDate).getFullYear()
    : new Date().getFullYear();

  const today = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  useEffect(() => {
    // auto-save on form change
    localStorage.setItem(LS_KEY, JSON.stringify(form));
  }, [form]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

        .af-container * {
          font-family: 'Noto Sans Devanagari', Arial, sans-serif;
          color: #000;
          box-sizing: border-box;
        }
        .af-outer-border {
          border: 4px double #000;
          padding: 5px;
          background: #fff;
          position: relative;
          max-width: 210mm;
          margin: 0 auto;
        }
        .af-inner-border {
          border: 1.5px solid #555;
          padding: 8mm 10mm;
          position: relative;
          overflow: hidden;
        }
        .af-inner-border::before {
          content: 'प्रवेश पत्र';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 72px;
          font-weight: 700;
          color: rgba(0,0,0,0.035);
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
          font-family: 'Noto Sans Devanagari', Arial, sans-serif;
          letter-spacing: 4px;
        }
        .af-corner { position: absolute; font-size: 14px; color: #555; opacity: 0.5; pointer-events: none; z-index: 2; }
        .af-corner-tl { top: 4px; left: 6px; }
        .af-corner-tr { top: 4px; right: 6px; }
        .af-corner-bl { bottom: 4px; left: 6px; }
        .af-corner-br { bottom: 4px; right: 6px; }
        .af-content { position: relative; z-index: 1; }

        /* Section heading */
        .af-section-heading {
          background: #f0f0f0;
          color: #000;
          font-weight: bold;
          font-size: 13px;
          padding: 5px 10px;
          border: 1px solid #555;
          border-bottom: none;
          letter-spacing: 0.3px;
        }
        .af-section-box {
          border: 1px solid #555;
          margin-bottom: 10px;
        }
        .af-section-box .af-section-inner {
          padding: 8px 10px 6px;
        }

        /* Field grid */
        .af-field-grid { display: grid; gap: 6px 12px; }
        .af-field-grid-2 { grid-template-columns: 1fr 1fr; }
        .af-field-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
        .af-field-grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }

        .af-field { display: flex; flex-direction: column; gap: 2px; }
        .af-label {
          font-size: 11px;
          font-weight: 600;
          color: #333;
          margin-bottom: 1px;
        }
        .af-input, .af-select, .af-textarea {
          border: none;
          border-bottom: 1.5px solid #555;
          background: transparent;
          font-size: 13px;
          outline: none;
          width: 100%;
          padding: 2px 0;
          font-family: 'Noto Sans Devanagari', Arial, sans-serif;
          color: #000;
        }
        .af-input:focus, .af-select:focus { border-bottom-color: #000; }
        .af-select { cursor: pointer; }
        .af-textarea { resize: none; border: 1.5px solid #555; padding: 3px 5px; min-height: 46px; }
        .af-hin-field {
          background: #f8f8f8;
          padding: 2px 0;
          font-size: 13px;
        }
        .af-hin-manual { background: #f0fff4; }

        /* Print value */
        .af-print-val {
          font-size: 13px;
          font-weight: 600;
          border-bottom: 1px solid #999;
          min-height: 22px;
          padding: 1px 2px;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .af-print-blank {
          border-bottom: 1px solid #999;
          min-height: 22px;
        }

        /* Header */
        .af-school-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .af-school-info { text-align: center; flex: 1; }
        .af-school-title { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
        .af-school-sub { font-size: 13px; margin-top: 2px; }
        .af-form-title {
          text-align: center;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 1px;
          border: 2px solid #000;
          padding: 5px 16px;
          margin: 6px auto 10px;
          display: inline-block;
        }
        .af-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .af-serial { font-size: 13px; font-weight: 600; }

        /* Photo box */
        .af-photo-box {
          width: 80px;
          height: 95px;
          border: 1.5px solid #555;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          text-align: center;
          color: #666;
          flex-shrink: 0;
          background: #fafafa;
        }

        /* Signature area */
        .af-sig-area {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
          padding-top: 10px;
        }
        .af-sig-item { text-align: center; }
        .af-sig-line { border-top: 1.5px solid #000; width: 130px; margin: 0 auto 4px; }
        .af-sig-label { font-size: 12px; }

        /* Declaration box */
        .af-declaration {
          border: 1px solid #555;
          padding: 7px 10px;
          font-size: 12px;
          margin-bottom: 10px;
          line-height: 1.7;
        }

        /* ===== Print styles ===== */
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm 5mm 10mm; }
          .no-print { display: none !important; }
          aside, header, nav, footer { display: none !important; }
          body, html { margin: 0 !important; padding: 0 !important; background: #fff; }
          .af-container { padding: 0 !important; }
          .af-outer-border { box-shadow: none !important; }
          .af-input, .af-select, .af-textarea {
            pointer-events: none;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Controls - hidden on print */}
      <div className="no-print mb-4 flex flex-wrap gap-2 items-center">
        <h2 className="text-lg font-semibold text-foreground mr-auto">
          प्रवेश फॉर्म (Admission Form)
        </h2>
        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ सहेजा गया</span>
        )}
        <button
          type="button"
          onClick={saveForm}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          सहेजें
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> प्रिंट करें
        </button>
        <button
          type="button"
          onClick={clearForm}
          className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50 transition"
        >
          फॉर्म साफ करें
        </button>
      </div>

      {/* === ADMISSION FORM === */}
      <div className="af-container">
        <div className="af-outer-border">
          <div className="af-inner-border">
            <span className="af-corner af-corner-tl">✦</span>
            <span className="af-corner af-corner-tr">✦</span>
            <span className="af-corner af-corner-bl">✦</span>
            <span className="af-corner af-corner-br">✦</span>

            <div className="af-content">
              {/* === SCHOOL HEADER === */}
              <div className="af-school-header">
                <img
                  src={LOGO_SRC}
                  alt="MP Logo"
                  style={{ width: 72, height: 72, objectFit: "contain" }}
                />
                <div className="af-school-info">
                  <div className="af-school-title">
                    मध्यप्रदेश शासन स्कूल शिक्षा विभाग
                  </div>
                  <div className="af-school-sub">
                    विद्यालय का नाम:&nbsp;
                    <input
                      className="af-input"
                      style={{
                        width: "auto",
                        minWidth: 180,
                        display: "inline",
                      }}
                      value={form.schoolName}
                      onChange={(e) => set("schoolName", e.target.value)}
                      placeholder="विद्यालय का नाम"
                    />
                  </div>
                  <div
                    className="af-school-sub"
                    style={{ fontSize: 12, marginTop: 2 }}
                  >
                    विकासखंड:&nbsp;
                    <input
                      className="af-input"
                      style={{
                        width: "auto",
                        minWidth: 100,
                        display: "inline",
                      }}
                      value={form.block}
                      onChange={(e) => set("block", e.target.value)}
                      placeholder="विकासखंड"
                    />
                    &nbsp; जिला:&nbsp;
                    <input
                      className="af-input"
                      style={{
                        width: "auto",
                        minWidth: 100,
                        display: "inline",
                      }}
                      value={form.schoolDistrict}
                      onChange={(e) => set("schoolDistrict", e.target.value)}
                      placeholder="जिला"
                    />
                  </div>
                </div>
                <img
                  src={LOGO2_SRC}
                  alt="SCERT Logo"
                  style={{ width: 72, height: 72, objectFit: "contain" }}
                />
              </div>

              {/* Form title + serial */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div className="af-serial">
                  क्र.सं.:&nbsp;
                  <input
                    className="af-input"
                    style={{ width: 70, display: "inline" }}
                    value={form.scholarNo}
                    onChange={(e) => set("scholarNo", e.target.value)}
                    placeholder="क्रमांक"
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div className="af-form-title">प्रवेश आवेदन पत्र</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    शैक्षणिक सत्र: {admissionYear}–{admissionYear + 1}
                  </div>
                </div>
                <div className="af-serial">
                  दिनांक:&nbsp;
                  <input
                    type="date"
                    className="af-input"
                    style={{ width: 130, display: "inline" }}
                    value={form.admissionDate}
                    onChange={(e) => set("admissionDate", e.target.value)}
                  />
                </div>
              </div>

              {/* === STUDENT NAME + PHOTO ROW === */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 10,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Student name row - bilingual */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <div className="af-field">
                      <div className="af-label">विद्यार्थी का नाम (English)</div>
                      <input
                        className="af-input"
                        value={form.nameEng}
                        onChange={(e) =>
                          handleEngInput(
                            "nameEng",
                            "nameHin",
                            "nameHinManual",
                            e.target.value,
                          )
                        }
                        placeholder="Student Name"
                      />
                    </div>
                    <div className="af-field">
                      <div
                        className="af-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        विद्यार्थी का नाम (हिंदी)
                        {form.nameHinManual ? (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#dcfce7",
                              color: "#166534",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            ✏ मैन्युअल
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            स्वतः
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            set("nameHinManual", true);
                            setTimeout(() => nameHinRef.current?.focus(), 0);
                          }}
                          style={{
                            marginLeft: "auto",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <Pencil
                            style={{ width: 12, height: 12, color: "#555" }}
                          />
                        </button>
                      </div>
                      <input
                        ref={nameHinRef}
                        className={`af-input af-hin-field ${form.nameHinManual ? "af-hin-manual" : ""}`}
                        value={form.nameHin}
                        onChange={(e) =>
                          handleHinManual(
                            "nameHin",
                            "nameHinManual",
                            e.target.value,
                          )
                        }
                        placeholder="हिंदी नाम"
                      />
                      {form.nameHinManual && (
                        <button
                          type="button"
                          onClick={() =>
                            resetAuto("nameEng", "nameHin", "nameHinManual")
                          }
                          style={{
                            fontSize: 10,
                            color: "#2563eb",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <RotateCcw style={{ width: 10, height: 10 }} /> Auto
                          reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Father */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px 12px",
                      marginBottom: 8,
                    }}
                  >
                    <div className="af-field">
                      <div className="af-label">पिता का नाम (English)</div>
                      <input
                        className="af-input"
                        value={form.fatherEng}
                        onChange={(e) =>
                          handleEngInput(
                            "fatherEng",
                            "fatherHin",
                            "fatherHinManual",
                            e.target.value,
                          )
                        }
                        placeholder="Father Name"
                      />
                    </div>
                    <div className="af-field">
                      <div
                        className="af-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        पिता का नाम (हिंदी)
                        {form.fatherHinManual ? (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#dcfce7",
                              color: "#166534",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            ✏ मैन्युअल
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            स्वतः
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            set("fatherHinManual", true);
                            setTimeout(() => fatherHinRef.current?.focus(), 0);
                          }}
                          style={{
                            marginLeft: "auto",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <Pencil
                            style={{ width: 12, height: 12, color: "#555" }}
                          />
                        </button>
                      </div>
                      <input
                        ref={fatherHinRef}
                        className={`af-input af-hin-field ${form.fatherHinManual ? "af-hin-manual" : ""}`}
                        value={form.fatherHin}
                        onChange={(e) =>
                          handleHinManual(
                            "fatherHin",
                            "fatherHinManual",
                            e.target.value,
                          )
                        }
                        placeholder="पिता का हिंदी नाम"
                      />
                      {form.fatherHinManual && (
                        <button
                          type="button"
                          onClick={() =>
                            resetAuto(
                              "fatherEng",
                              "fatherHin",
                              "fatherHinManual",
                            )
                          }
                          style={{
                            fontSize: 10,
                            color: "#2563eb",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <RotateCcw style={{ width: 10, height: 10 }} /> Auto
                          reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mother */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px 12px",
                    }}
                  >
                    <div className="af-field">
                      <div className="af-label">माता का नाम (English)</div>
                      <input
                        className="af-input"
                        value={form.motherEng}
                        onChange={(e) =>
                          handleEngInput(
                            "motherEng",
                            "motherHin",
                            "motherHinManual",
                            e.target.value,
                          )
                        }
                        placeholder="Mother Name"
                      />
                    </div>
                    <div className="af-field">
                      <div
                        className="af-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        माता का नाम (हिंदी)
                        {form.motherHinManual ? (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#dcfce7",
                              color: "#166534",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            ✏ मैन्युअल
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            स्वतः
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            set("motherHinManual", true);
                            setTimeout(() => motherHinRef.current?.focus(), 0);
                          }}
                          style={{
                            marginLeft: "auto",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <Pencil
                            style={{ width: 12, height: 12, color: "#555" }}
                          />
                        </button>
                      </div>
                      <input
                        ref={motherHinRef}
                        className={`af-input af-hin-field ${form.motherHinManual ? "af-hin-manual" : ""}`}
                        value={form.motherHin}
                        onChange={(e) =>
                          handleHinManual(
                            "motherHin",
                            "motherHinManual",
                            e.target.value,
                          )
                        }
                        placeholder="माता का हिंदी नाम"
                      />
                      {form.motherHinManual && (
                        <button
                          type="button"
                          onClick={() =>
                            resetAuto(
                              "motherEng",
                              "motherHin",
                              "motherHinManual",
                            )
                          }
                          style={{
                            fontSize: 10,
                            color: "#2563eb",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <RotateCcw style={{ width: 10, height: 10 }} /> Auto
                          reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Photo box */}
                <div>
                  <div className="af-photo-box">
                    <span>
                      फोटो
                      <br />
                      Photo
                    </span>
                  </div>
                </div>
              </div>

              {/* === SECTION 1: व्यक्तिगत विवरण === */}
              <div className="af-section-box">
                <div className="af-section-heading">
                  1. व्यक्तिगत विवरण (Personal Details)
                </div>
                <div className="af-section-inner">
                  <div
                    className="af-field-grid af-field-grid-4"
                    style={{ marginBottom: 8 }}
                  >
                    <div className="af-field">
                      <div className="af-label">जन्म तिथि (DOB)</div>
                      <input
                        type="date"
                        className="af-input"
                        value={form.dob}
                        onChange={(e) => set("dob", e.target.value)}
                      />
                      {form.dob && (
                        <span
                          style={{ fontSize: 11, color: "#444", marginTop: 2 }}
                        >
                          {dobNumeric}
                        </span>
                      )}
                    </div>
                    <div className="af-field">
                      <div className="af-label">जन्म तिथि (शब्दों में)</div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#222",
                          minHeight: 22,
                          paddingTop: 4,
                          borderBottom: "1.5px solid #555",
                        }}
                      >
                        {dobWords || "—"}
                      </div>
                    </div>
                    <div className="af-field">
                      <div className="af-label">लिंग (Gender)</div>
                      <select
                        className="af-select"
                        value={form.gender}
                        onChange={(e) => set("gender", e.target.value)}
                      >
                        <option value="">— चुनें —</option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="af-field">
                      <div className="af-label">रक्त समूह (Blood Group)</div>
                      <select
                        className="af-select"
                        value={form.bloodGroup}
                        onChange={(e) => set("bloodGroup", e.target.value)}
                      >
                        <option value="">— चुनें —</option>
                        {BLOOD_GROUPS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="af-field-grid af-field-grid-4">
                    <div className="af-field">
                      <div className="af-label">जाति वर्ग (Category)</div>
                      <select
                        className="af-select"
                        value={form.category}
                        onChange={(e) => set("category", e.target.value)}
                      >
                        <option value="">— चुनें —</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="af-field">
                      <div className="af-label">धर्म (Religion)</div>
                      <select
                        className="af-select"
                        value={form.religion}
                        onChange={(e) => set("religion", e.target.value)}
                      >
                        <option value="">— चुनें —</option>
                        {RELIGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="af-field">
                      <div className="af-label">राष्ट्रीयता (Nationality)</div>
                      <input
                        className="af-input"
                        value={form.nationality}
                        onChange={(e) => set("nationality", e.target.value)}
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">CWSN (दिव्यांग)</div>
                      <select
                        className="af-select"
                        value={form.cwsn}
                        onChange={(e) => set("cwsn", e.target.value)}
                      >
                        <option value="नहीं">नहीं</option>
                        <option value="हाँ">हाँ</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* === SECTION 2: पहचान संख्या === */}
              <div className="af-section-box">
                <div className="af-section-heading">
                  2. पहचान संख्या (Identification Numbers)
                </div>
                <div className="af-section-inner">
                  <div
                    className="af-field-grid af-field-grid-4"
                    style={{ marginBottom: 8 }}
                  >
                    <div className="af-field">
                      <div className="af-label">समग्र आई.डी. (9 अंक)</div>
                      <input
                        className="af-input"
                        value={form.samagraId}
                        maxLength={9}
                        onChange={(e) =>
                          set("samagraId", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="XXXXXXXXX"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">आधार नं. (12 अंक)</div>
                      <input
                        className="af-input"
                        value={form.aadharNo}
                        maxLength={12}
                        onChange={(e) =>
                          set("aadharNo", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="XXXXXXXXXXXX"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">स्कॉलर क्रमांक</div>
                      <input
                        className="af-input"
                        value={form.scholarNo}
                        onChange={(e) => set("scholarNo", e.target.value)}
                        placeholder="Scholar No."
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">APAAR ID</div>
                      <input
                        className="af-input"
                        value={form.apaarId}
                        onChange={(e) => set("apaarId", e.target.value)}
                        placeholder="APAAR ID"
                      />
                    </div>
                  </div>
                  <div
                    className="af-field-grid"
                    style={{
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "6px 12px",
                    }}
                  >
                    <div className="af-field">
                      <div className="af-label">BPL क्रमांक</div>
                      <input
                        className="af-input"
                        value={form.bplNo}
                        onChange={(e) => set("bplNo", e.target.value)}
                        placeholder="BPL No."
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">विद्यालय कोड</div>
                      <input
                        className="af-input"
                        value={form.schoolCode}
                        onChange={(e) => set("schoolCode", e.target.value)}
                        placeholder="School Code"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">UDISE कोड</div>
                      <input
                        className="af-input"
                        value={form.udiseCode}
                        onChange={(e) => set("udiseCode", e.target.value)}
                        placeholder="UDISE Code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* === SECTION 3: शैक्षणिक विवरण === */}
              <div className="af-section-box">
                <div className="af-section-heading">
                  3. शैक्षणिक विवरण (Academic Details)
                </div>
                <div className="af-section-inner">
                  <div
                    className="af-field-grid af-field-grid-4"
                    style={{ marginBottom: 8 }}
                  >
                    <div className="af-field">
                      <div className="af-label">प्रवेश कक्षा (Class)</div>
                      <select
                        className="af-select"
                        value={form.admissionClass}
                        onChange={(e) => set("admissionClass", e.target.value)}
                      >
                        <option value="">— चुनें —</option>
                        {CLASSES.map((c) => (
                          <option key={c} value={c}>
                            कक्षा {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="af-field">
                      <div className="af-label">अनुभाग (Section)</div>
                      <select
                        className="af-select"
                        value={form.section}
                        onChange={(e) => set("section", e.target.value)}
                      >
                        <option value="">— चुनें —</option>
                        {SECTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="af-field">
                      <div className="af-label">अनुक्रमांक (Roll No.)</div>
                      <input
                        className="af-input"
                        value={form.rollNo}
                        onChange={(e) => set("rollNo", e.target.value)}
                        placeholder="Roll No."
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">प्रवेश तिथि</div>
                      <input
                        type="date"
                        className="af-input"
                        value={form.admissionDate}
                        onChange={(e) => set("admissionDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div
                    className="af-field-grid"
                    style={{
                      gridTemplateColumns: "2fr 1fr 1fr 1fr",
                      gap: "6px 12px",
                    }}
                  >
                    <div className="af-field">
                      <div className="af-label">पूर्व विद्यालय का नाम</div>
                      <input
                        className="af-input"
                        value={form.previousSchool}
                        onChange={(e) => set("previousSchool", e.target.value)}
                        placeholder="Previous School"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">पूर्व कक्षा</div>
                      <select
                        className="af-select"
                        value={form.previousClass}
                        onChange={(e) => set("previousClass", e.target.value)}
                      >
                        <option value="">—</option>
                        {CLASSES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="af-field">
                      <div className="af-label">TC नं.</div>
                      <input
                        className="af-input"
                        value={form.tcNo}
                        onChange={(e) => set("tcNo", e.target.value)}
                        placeholder="TC No."
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">TC दिनांक</div>
                      <input
                        type="date"
                        className="af-input"
                        value={form.tcDate}
                        onChange={(e) => set("tcDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* === SECTION 4: पालक/संरक्षक === */}
              <div className="af-section-box">
                <div className="af-section-heading">
                  4. पालक/संरक्षक विवरण (Guardian Details)
                </div>
                <div className="af-section-inner">
                  <div className="af-field-grid af-field-grid-4">
                    <div className="af-field">
                      <div className="af-label">संरक्षक का नाम (English)</div>
                      <input
                        className="af-input"
                        value={form.guardianEng}
                        onChange={(e) =>
                          handleEngInput(
                            "guardianEng",
                            "guardianHin",
                            "guardianHinManual",
                            e.target.value,
                          )
                        }
                        placeholder="Guardian Name"
                      />
                    </div>
                    <div className="af-field">
                      <div
                        className="af-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        संरक्षक का नाम (हिंदी)
                        {form.guardianHinManual ? (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#dcfce7",
                              color: "#166534",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            ✏ मैन्युअल
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            स्वतः
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            set("guardianHinManual", true);
                            setTimeout(
                              () => guardianHinRef.current?.focus(),
                              0,
                            );
                          }}
                          style={{
                            marginLeft: "auto",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <Pencil
                            style={{ width: 12, height: 12, color: "#555" }}
                          />
                        </button>
                      </div>
                      <input
                        ref={guardianHinRef}
                        className={`af-input af-hin-field ${form.guardianHinManual ? "af-hin-manual" : ""}`}
                        value={form.guardianHin}
                        onChange={(e) =>
                          handleHinManual(
                            "guardianHin",
                            "guardianHinManual",
                            e.target.value,
                          )
                        }
                        placeholder="हिंदी नाम"
                      />
                      {form.guardianHinManual && (
                        <button
                          type="button"
                          onClick={() =>
                            resetAuto(
                              "guardianEng",
                              "guardianHin",
                              "guardianHinManual",
                            )
                          }
                          style={{
                            fontSize: 10,
                            color: "#2563eb",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <RotateCcw style={{ width: 10, height: 10 }} /> Auto
                          reset
                        </button>
                      )}
                    </div>
                    <div className="af-field">
                      <div className="af-label">संरक्षक संबंध</div>
                      <input
                        className="af-input"
                        value={form.guardianRelation}
                        onChange={(e) =>
                          set("guardianRelation", e.target.value)
                        }
                        placeholder="जैसे: चाचा, दादा..."
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">मोबाइल नं. (Mobile)</div>
                      <input
                        className="af-input"
                        value={form.mobileNo}
                        maxLength={10}
                        onChange={(e) =>
                          set("mobileNo", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="XXXXXXXXXX"
                      />
                    </div>
                  </div>
                  <div
                    className="af-field-grid"
                    style={{
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px 12px",
                      marginTop: 6,
                    }}
                  >
                    <div className="af-field">
                      <div className="af-label">वैकल्पिक मोबाइल</div>
                      <input
                        className="af-input"
                        value={form.alternateMobile}
                        maxLength={10}
                        onChange={(e) =>
                          set(
                            "alternateMobile",
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                        placeholder="XXXXXXXXXX"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">ईमेल (Email)</div>
                      <input
                        type="email"
                        className="af-input"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* === SECTION 5: पता === */}
              <div className="af-section-box">
                <div className="af-section-heading">
                  5. स्थायी पता (Permanent Address)
                </div>
                <div className="af-section-inner">
                  <div className="af-field" style={{ marginBottom: 8 }}>
                    <div className="af-label">पूर्ण पता (Full Address)</div>
                    <textarea
                      className="af-textarea"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="मकान नं., गली, मोहल्ला..."
                    />
                  </div>
                  <div className="af-field-grid af-field-grid-4">
                    <div className="af-field">
                      <div className="af-label">ग्राम/शहर</div>
                      <input
                        className="af-input"
                        value={form.village}
                        onChange={(e) => set("village", e.target.value)}
                        placeholder="ग्राम/शहर"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">पोस्ट</div>
                      <input
                        className="af-input"
                        value={form.post}
                        onChange={(e) => set("post", e.target.value)}
                        placeholder="Post Office"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">तहसील</div>
                      <input
                        className="af-input"
                        value={form.tehsil}
                        onChange={(e) => set("tehsil", e.target.value)}
                        placeholder="Tehsil"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">जिला (District)</div>
                      <input
                        className="af-input"
                        value={form.district}
                        onChange={(e) => set("district", e.target.value)}
                        placeholder="District"
                      />
                    </div>
                  </div>
                  <div
                    className="af-field-grid"
                    style={{
                      gridTemplateColumns: "2fr 1fr",
                      gap: "6px 12px",
                      marginTop: 6,
                    }}
                  >
                    <div className="af-field">
                      <div className="af-label">राज्य (State)</div>
                      <input
                        className="af-input"
                        value={form.state}
                        onChange={(e) => set("state", e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">पिन कोड</div>
                      <input
                        className="af-input"
                        value={form.pincode}
                        maxLength={6}
                        onChange={(e) =>
                          set("pincode", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="XXXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* === SECTION 6: शुल्क विवरण === */}
              <div className="af-section-box">
                <div className="af-section-heading">
                  6. शुल्क विवरण (Fee Details)
                </div>
                <div className="af-section-inner">
                  <div className="af-field-grid af-field-grid-4">
                    <div className="af-field">
                      <div className="af-label">प्रवेश शुल्क (₹)</div>
                      <input
                        className="af-input"
                        value={form.admissionFee}
                        onChange={(e) =>
                          set("admissionFee", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">वार्षिक शुल्क (₹)</div>
                      <input
                        className="af-input"
                        value={form.annualFee}
                        onChange={(e) =>
                          set("annualFee", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">अन्य शुल्क (₹)</div>
                      <input
                        className="af-input"
                        value={form.otherFee}
                        onChange={(e) =>
                          set("otherFee", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="af-field">
                      <div className="af-label">कुल शुल्क (₹)</div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          borderBottom: "1.5px solid #000",
                          paddingBottom: 2,
                          paddingTop: 3,
                        }}
                      >
                        ₹{" "}
                        {(
                          Number(form.admissionFee || 0) +
                          Number(form.annualFee || 0) +
                          Number(form.otherFee || 0)
                        ).toLocaleString("hi-IN")}
                      </div>
                    </div>
                  </div>
                  <div className="af-field" style={{ marginTop: 6 }}>
                    <div className="af-label">रसीद नं. (Receipt No.)</div>
                    <input
                      className="af-input"
                      style={{ maxWidth: 200 }}
                      value={form.feeReceipt}
                      onChange={(e) => set("feeReceipt", e.target.value)}
                      placeholder="Receipt No."
                    />
                  </div>
                </div>
              </div>

              {/* === DECLARATION === */}
              <div className="af-declaration">
                <strong>घोषणा / Declaration:</strong>
                <br />
                मैं/हम प्रमाणित करते हैं कि उपरोक्त सभी जानकारी सत्य एवं सही है। यदि कोई
                जानकारी असत्य पाई गई तो प्रवेश निरस्त किया जा सकता है।
                <br />
                <em>
                  I/We certify that all the above information is true and
                  correct. If any information is found to be false, the
                  admission may be cancelled.
                </em>
              </div>

              {/* === SIGNATURES === */}
              <div className="af-sig-area">
                <div className="af-sig-item">
                  <div className="af-sig-line" />
                  <div className="af-sig-label">
                    विद्यार्थी के हस्ताक्षर
                    <br />
                    <small>Student's Signature</small>
                  </div>
                </div>
                <div className="af-sig-item">
                  <div className="af-sig-line" />
                  <div className="af-sig-label">
                    पालक/संरक्षक के हस्ताक्षर
                    <br />
                    <small>Parent/Guardian's Signature</small>
                  </div>
                </div>
                <div className="af-sig-item">
                  <div className="af-sig-line" />
                  <div className="af-sig-label">
                    प्रवेश अधिकारी के हस्ताक्षर
                    <br />
                    <small>Admission Officer's Signature</small>
                  </div>
                </div>
                <div className="af-sig-item">
                  <div className="af-sig-line" />
                  <div className="af-sig-label">
                    प्रधानाध्यापक/प्राचार्य
                    <br />
                    <small>Principal's Signature</small>
                  </div>
                </div>
              </div>

              {/* Print date */}
              <div
                style={{
                  textAlign: "right",
                  fontSize: 11,
                  color: "#555",
                  marginTop: 8,
                }}
              >
                दिनांक: {today()}
              </div>
            </div>
            {/* /af-content */}
          </div>
          {/* /af-inner-border */}
        </div>
        {/* /af-outer-border */}
      </div>
      {/* /af-container */}
    </>
  );
}
