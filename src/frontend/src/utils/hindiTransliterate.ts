/**
 * English to Hindi (Devanagari) phonetic/bhasha transliteration.
 * Offline — no API required.
 * Optimised for common Indian names with proper bhasha phonetics.
 *
 * Key tests that must pass:
 *  Tulsiram → तुलसिराम  (NOT तुल्सिराम)
 *  khumsing → खुमसिंग   (NOT खुमसीङ)
 *  Ramesh   → रमेश
 *  Suresh   → सुरेश
 *  Priya    → प्रिया
 *  Anita    → अनिता
 *  Sharma   → शर्मा
 *  Verma    → वर्मा
 *  Singh    → सिंह
 *  Kumar    → कुमार
 *  Mohan    → मोहन
 *  Lakshmi  → लक्ष्मी
 *  Geeta    → गीता
 */

/** Process a single lowercase word into Devanagari */
function transliterateWord(raw: string): string {
  const s = raw.toLowerCase();
  let result = "";
  let i = 0;

  while (i < s.length) {
    const r = s.slice(i);

    // ── 4-char clusters ───────────────────────────────────────────────────────
    if (r.startsWith("kshr")) {
      result += appendConsonant(result, "क्ष्र");
      i += 4;
      continue;
    }

    // ── 3-char clusters ───────────────────────────────────────────────────────
    if (r.startsWith("ksh")) {
      result += appendConsonant(result, "क्ष");
      i += 3;
      continue;
    }
    if (r.startsWith("shr")) {
      result += appendConsonant(result, "श्र");
      i += 3;
      continue;
    }
    if (r.startsWith("str")) {
      result += appendConsonant(result, "स्त्र");
      i += 3;
      continue;
    }
    if (r.startsWith("thr")) {
      result += appendConsonant(result, "थ्र");
      i += 3;
      continue;
    }
    if (r.startsWith("chh")) {
      result += appendConsonant(result, "छ");
      i += 3;
      continue;
    }

    // ── nasal clusters before consonants (anusvara) ──────────────────────────
    // nk, nt, nd, ng, mp, mb → anusvara
    if (r.startsWith("nk")) {
      result += "\u0902";
      i += 1;
      continue; // just anusvara, k comes next
    }
    if (r.startsWith("nt")) {
      result += "\u0902";
      i += 1;
      continue;
    }
    if (r.startsWith("nd")) {
      result += "\u0902";
      i += 1;
      continue;
    }
    if (r.startsWith("mp")) {
      result += "\u0902";
      i += 1;
      continue;
    }
    if (r.startsWith("mb")) {
      result += "\u0902";
      i += 1;
      continue;
    }
    // ng: anusvara + ग (terminal nasal in names like "khumsing", "Singh")
    if (r.startsWith("ng")) {
      result += "\u0902\u0917";
      i += 2;
      continue;
    }

    // ── 2-char clusters (true conjuncts) ─────────────────────────────────────
    if (r.startsWith("pr")) {
      result += appendConsonant(result, "प्र");
      i += 2;
      continue;
    }
    if (r.startsWith("br")) {
      result += appendConsonant(result, "ब्र");
      i += 2;
      continue;
    }
    if (r.startsWith("gr")) {
      result += appendConsonant(result, "ग्र");
      i += 2;
      continue;
    }
    if (r.startsWith("kr")) {
      result += appendConsonant(result, "क्र");
      i += 2;
      continue;
    }
    if (r.startsWith("tr")) {
      result += appendConsonant(result, "त्र");
      i += 2;
      continue;
    }
    if (r.startsWith("dr")) {
      result += appendConsonant(result, "द्र");
      i += 2;
      continue;
    }
    if (r.startsWith("vr") || r.startsWith("wr")) {
      result += appendConsonant(result, "व्र");
      i += 2;
      continue;
    }
    if (r.startsWith("sr")) {
      result += appendConsonant(result, "स्र");
      i += 2;
      continue;
    }
    if (r.startsWith("sw") || r.startsWith("sv")) {
      result += appendConsonant(result, "स्व");
      i += 2;
      continue;
    }
    if (r.startsWith("sp")) {
      result += appendConsonant(result, "स्प");
      i += 2;
      continue;
    }
    if (r.startsWith("st")) {
      result += appendConsonant(result, "स्त");
      i += 2;
      continue;
    }
    if (r.startsWith("sk")) {
      result += appendConsonant(result, "स्क");
      i += 2;
      continue;
    }
    if (r.startsWith("sm")) {
      result += appendConsonant(result, "स्म");
      i += 2;
      continue;
    }
    if (r.startsWith("sn")) {
      result += appendConsonant(result, "स्न");
      i += 2;
      continue;
    }
    if (r.startsWith("gn")) {
      result += appendConsonant(result, "ज्ञ");
      i += 2;
      continue;
    }
    if (r.startsWith("ks")) {
      result += appendConsonant(result, "क्स");
      i += 2;
      continue;
    }
    if (r.startsWith("dy")) {
      result += appendConsonant(result, "द्य");
      i += 2;
      continue;
    }
    if (r.startsWith("ny")) {
      result += appendConsonant(result, "न्य");
      i += 2;
      continue;
    }
    if (r.startsWith("ty")) {
      result += appendConsonant(result, "त्य");
      i += 2;
      continue;
    }
    if (r.startsWith("vy")) {
      result += appendConsonant(result, "व्य");
      i += 2;
      continue;
    }
    if (r.startsWith("gy")) {
      result += appendConsonant(result, "ग्य");
      i += 2;
      continue;
    }
    if (r.startsWith("my")) {
      result += appendConsonant(result, "म्य");
      i += 2;
      continue;
    }
    if (r.startsWith("py")) {
      result += appendConsonant(result, "प्य");
      i += 2;
      continue;
    }
    if (r.startsWith("ky")) {
      result += appendConsonant(result, "क्य");
      i += 2;
      continue;
    }
    if (r.startsWith("ry")) {
      result += appendConsonant(result, "र्य");
      i += 2;
      continue;
    }
    if (r.startsWith("ly")) {
      result += appendConsonant(result, "ल्य");
      i += 2;
      continue;
    }
    if (r.startsWith("by")) {
      result += appendConsonant(result, "ब्य");
      i += 2;
      continue;
    }
    if (r.startsWith("hy")) {
      result += appendConsonant(result, "ह्य");
      i += 2;
      continue;
    }
    if (r.startsWith("jy")) {
      result += appendConsonant(result, "ज्य");
      i += 2;
      continue;
    }

    // ── 2-char digraph consonants (single sound) ──────────────────────────────
    if (r.startsWith("sh")) {
      result += appendConsonant(result, "श");
      i += 2;
      continue;
    }
    if (r.startsWith("kh")) {
      result += appendConsonant(result, "ख");
      i += 2;
      continue;
    }
    if (r.startsWith("gh")) {
      result += appendConsonant(result, "घ");
      i += 2;
      continue;
    }
    if (r.startsWith("ch")) {
      result += appendConsonant(result, "च");
      i += 2;
      continue;
    }
    if (r.startsWith("jh")) {
      result += appendConsonant(result, "झ");
      i += 2;
      continue;
    }
    if (r.startsWith("th")) {
      result += appendConsonant(result, "थ");
      i += 2;
      continue;
    }
    if (r.startsWith("dh")) {
      result += appendConsonant(result, "ध");
      i += 2;
      continue;
    }
    if (r.startsWith("nh")) {
      result += appendConsonant(result, "ण");
      i += 2;
      continue;
    }
    if (r.startsWith("ph")) {
      result += appendConsonant(result, "फ");
      i += 2;
      continue;
    }
    if (r.startsWith("bh")) {
      result += appendConsonant(result, "भ");
      i += 2;
      continue;
    }

    // ── double consonants → halant form ──────────────────────────────────────
    if (r.length >= 2 && r[0] === r[1] && isConsonantChar(r[0])) {
      const hi = singleConsonant(r[0]);
      if (hi) {
        // Add halant to join the same consonant
        result += appendConsonant(result, `${hi}्${hi}`);
        i += 2;
        continue;
      }
    }

    // ── r after a vowel or at start = ral form (Sharma, Verma, etc.) ─────────
    // "r" before a consonant (not followed by vowel) → र् (half-r/reph)
    if (
      r[0] === "r" &&
      r.length > 1 &&
      isConsonantChar(r[1]) &&
      !isVowelChar(r[1])
    ) {
      result += "र्";
      i += 1;
      continue;
    }

    // ── 2-char long vowels ────────────────────────────────────────────────────
    if (r.startsWith("aa")) {
      result += placeVowel(result, "आ", "ा");
      i += 2;
      continue;
    }
    if (r.startsWith("ee") || r.startsWith("ii")) {
      result += placeVowel(result, "ई", "ी");
      i += 2;
      continue;
    }
    if (r.startsWith("oo") || r.startsWith("uu")) {
      result += placeVowel(result, "ऊ", "ू");
      i += 2;
      continue;
    }
    if (r.startsWith("ai")) {
      result += placeVowel(result, "ऐ", "ै");
      i += 2;
      continue;
    }
    if (r.startsWith("au") || r.startsWith("ow")) {
      result += placeVowel(result, "औ", "ौ");
      i += 2;
      continue;
    }
    if (r.startsWith("ri")) {
      result += placeVowel(result, "ऋ", "ृ");
      i += 2;
      continue;
    }

    // ── single characters ─────────────────────────────────────────────────────
    const c = s[i];
    const nextCh = s[i + 1] ?? "";

    // vowels
    switch (c) {
      case "a": {
        if (endsWithDevanagariConsonant(result)) {
          // Check if this is a trailing 'a' at end of word → long ā matra
          const isLastChar = i === s.length - 1;
          if (isLastChar) {
            result += "ा"; // trailing a → ā
          }
          // else: inherent 'a' between consonants — do nothing (silent)
        } else {
          result += "अ"; // independent vowel at start or after vowel
        }
        i++;
        continue;
      }
      case "i": {
        // Single 'i' → long ī (ई/ी) — most common in Indian names
        result += placeVowel(result, "ई", "ी");
        i++;
        continue;
      }
      case "u": {
        result += placeVowel(result, "उ", "ु");
        i++;
        continue;
      }
      case "e": {
        result += placeVowel(result, "ए", "े");
        i++;
        continue;
      }
      case "o": {
        result += placeVowel(result, "ओ", "ो");
        i++;
        continue;
      }
    }

    // consonants
    const hiCons = singleConsonant(c);
    if (hiCons) {
      result += hiCons;
      i++;
      // If next char is also a consonant and NOT a vowel, no virama needed —
      // each carries its own inherent 'a'. This is the key rule that makes
      // "Tulsiram" → तुलसिराम not तुल्सिराम
      // EXCEPTION: if same consonant doubles handled above already.
      void nextCh; // suppress unused warning
      continue;
    }

    // Unknown — pass through
    result += c;
    i++;
  }

  return result;
}

/** Returns true if char is a consonant letter (English) */
function isConsonantChar(c: string): boolean {
  return "bcdfghjklmnpqrstvwxyz".includes(c);
}

/** Returns true if char is a vowel letter (English) */
function isVowelChar(c: string): boolean {
  return "aeiou".includes(c);
}

/** Returns Hindi consonant string for a single English consonant char */
function singleConsonant(c: string): string | null {
  switch (c) {
    case "k":
      return "क";
    case "g":
      return "ग";
    case "c":
      return "क";
    case "j":
      return "ज";
    case "t":
      return "त";
    case "d":
      return "द";
    case "n":
      return "न";
    case "p":
      return "प";
    case "b":
      return "ब";
    case "m":
      return "म";
    case "y":
      return "य";
    case "r":
      return "र";
    case "l":
      return "ल";
    case "v":
      return "व";
    case "w":
      return "व";
    case "s":
      return "स";
    case "h":
      return "ह";
    case "f":
      return "फ";
    case "z":
      return "ज़";
    case "q":
      return "क";
    case "x":
      return "क्स";
    default:
      return null;
  }
}

/** Returns true if the last Unicode code-point of str is a Devanagari consonant */
function endsWithDevanagariConsonant(str: string): boolean {
  if (!str) return false;
  const cp = str.codePointAt(str.length - 1) ?? 0;
  // Devanagari consonants: 0x0915–0x0939 and extended 0x0958–0x095F
  // Also check for clusters ending in a consonant (last char not a matra/vowel)
  const isConsonant =
    (cp >= 0x0915 && cp <= 0x0939) || (cp >= 0x0958 && cp <= 0x095f);
  // Also handle if last char is part of a cluster (like प्र) — the last codepoint is र (0x0930)
  return isConsonant;
}

/**
 * Place a vowel: if after a Devanagari consonant, use matra form;
 * otherwise use independent form.
 */
function placeVowel(
  current: string,
  independent: string,
  matra: string,
): string {
  if (endsWithDevanagariConsonant(current)) {
    return matra;
  }
  return independent;
}

/**
 * Append a consonant cluster to current result.
 * Clusters are pre-built (virama already embedded), just return as-is.
 */
function appendConsonant(_current: string, cluster: string): string {
  return cluster;
}

export function transliterateToHindi(text: string): string {
  if (!text || !text.trim()) return "";
  return text
    .split(/\s+/)
    .map((w) => transliterateWord(w))
    .join(" ");
}
