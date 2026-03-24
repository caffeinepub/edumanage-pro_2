// Converts a date string (YYYY-MM-DD) to Hindi words
// Example: 1997-09-07 → "सात सितंबर उन्नीस सौ सत्तानवे"

const hindiNumbers: string[] = [
  "",
  "एक",
  "दो",
  "तीन",
  "चार",
  "पाँच",
  "छह",
  "सात",
  "आठ",
  "नौ",
  "दस",
  "ग्यारह",
  "बारह",
  "तेरह",
  "चौदह",
  "पंद्रह",
  "सोलह",
  "सत्रह",
  "अठारह",
  "उन्नीस",
  "बीस",
  "इक्कीस",
  "बाईस",
  "तेईस",
  "चौबीस",
  "पचीस",
  "छब्बीस",
  "सत्ताईस",
  "अट्ठाईस",
  "उनतीस",
  "तीस",
  "इकतीस",
  "बत्तीस",
  "तैंतीस",
  "चौंतीस",
  "पैंतीस",
  "छत्तीस",
  "सैंतीस",
  "अड़तीस",
  "उनतालीस",
  "चालीस",
  "इकतालीस",
  "बयालीस",
  "तैंतालीस",
  "चौवालीस",
  "पैंतालीस",
  "छयालीस",
  "सैंतालीस",
  "अड़तालीस",
  "उनचास",
  "पचास",
  "इक्यावन",
  "बावन",
  "तिरपन",
  "चौवन",
  "पचपन",
  "छप्पन",
  "सत्तावन",
  "अट्ठावन",
  "उनसठ",
  "साठ",
  "इकसठ",
  "बासठ",
  "तिरसठ",
  "चौसठ",
  "पैंसठ",
  "छियासठ",
  "सड़सठ",
  "अड़सठ",
  "उनहत्तर",
  "सत्तर",
  "इकहत्तर",
  "बहत्तर",
  "तिहत्तर",
  "चौहत्तर",
  "पचहत्तर",
  "छिहत्तर",
  "सत्तहत्तर",
  "अठहत्तर",
  "उनासी",
  "अस्सी",
  "इक्यासी",
  "बयासी",
  "तिरासी",
  "चौरासी",
  "पचासी",
  "छियासी",
  "सत्तासी",
  "अट्ठासी",
  "नवासी",
  "नब्बे",
  "इक्यानवे",
  "बानवे",
  "तिरानवे",
  "चौरानवे",
  "पचानवे",
  "छियानवे",
  "सत्तानवे",
  "अट्ठानवे",
  "निन्यानवे",
];

const hindiMonths: string[] = [
  "",
  "जनवरी",
  "फरवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
];

function yearToHindi(year: number): string {
  if (year <= 0) return "";
  if (year < 100) return hindiNumbers[year] ?? String(year);

  if (year >= 1000 && year < 2000) {
    // e.g. 1997 → उन्नीस सौ सत्तानवे
    const high = Math.floor(year / 100); // 19
    const low = year % 100; // 97
    const highWord = hindiNumbers[high] ?? String(high);
    const lowWord = low > 0 ? ` ${hindiNumbers[low] ?? String(low)}` : "";
    return `${highWord} सौ${lowWord}`;
  }

  if (year >= 2000 && year < 3000) {
    // e.g. 2023 → दो हजार तेईस
    const low = year % 1000; // e.g. 23
    if (low === 0) return "दो हजार";
    if (low < 100) return `दो हजार ${hindiNumbers[low] ?? String(low)}`;
    // e.g. 2100 → इक्कीस सौ
    const high = Math.floor(year / 100); // 21
    const rem = year % 100;
    const highWord = hindiNumbers[high] ?? String(high);
    const remWord = rem > 0 ? ` ${hindiNumbers[rem] ?? String(rem)}` : "";
    return `${highWord} सौ${remWord}`;
  }

  // Fallback
  return String(year);
}

export function dateToHindiWords(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "";
  const year = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10);
  const day = Number.parseInt(parts[2], 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return "";
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";

  const dayWord = hindiNumbers[day] ?? String(day);
  const monthWord = hindiMonths[month];
  const yearWord = yearToHindi(year);

  return `${dayWord} ${monthWord} ${yearWord}`;
}

export function dateToNumericFormat(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "";
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
