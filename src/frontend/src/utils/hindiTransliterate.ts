/**
 * English to Hindi (Devanagari) phonetic transliteration.
 * Offline — no API required.
 * Optimised for common Indian names.
 *
 * Key conventions:
 *  - Single 'i'  → ी (long ee, most common in names)
 *  - Single 'u'  → ु (short u)
 *  - Trailing 'a' → ा (aa matra, e.g. Sita → सीता)
 *  - 'a' before consonant → inherent vowel (no extra char)
 *  - Consonant clusters → virama inserted automatically
 */

const VIRAMA = "\u094D"; // ्

interface Token {
  type: "consonant" | "vowel";
  hi: string; // independent Devanagari form
  matra: string; // matra (dependent) form — empty string means inherent 'a'
}

/** Parse lowercased English word into a sequence of Hindi tokens */
function tokenise(word: string): Token[] {
  const tokens: Token[] = [];
  const s = word.toLowerCase();
  let i = 0;

  while (i < s.length) {
    const r = s.slice(i);

    // ── 3-char consonant clusters ────────────────────────────────────────────
    if (r.startsWith("ksh")) {
      tokens.push({ type: "consonant", hi: "\u0915\u094D\u0937", matra: "" });
      i += 3;
      continue;
    }
    if (r.startsWith("shr")) {
      tokens.push({ type: "consonant", hi: "\u0936\u094D\u0930", matra: "" });
      i += 3;
      continue;
    }
    if (r.startsWith("str")) {
      tokens.push({
        type: "consonant",
        hi: "\u0938\u094D\u0924\u094D\u0930",
        matra: "",
      });
      i += 3;
      continue;
    }
    if (r.startsWith("thr")) {
      tokens.push({ type: "consonant", hi: "\u0925\u094D\u0930", matra: "" });
      i += 3;
      continue;
    }

    // ── 2-char digraph consonants ─────────────────────────────────────────────
    if (r.startsWith("sh")) {
      tokens.push({ type: "consonant", hi: "\u0936", matra: "" });
      i += 2;
      continue;
    } // श
    if (r.startsWith("kh")) {
      tokens.push({ type: "consonant", hi: "\u0916", matra: "" });
      i += 2;
      continue;
    } // ख
    if (r.startsWith("gh")) {
      tokens.push({ type: "consonant", hi: "\u0918", matra: "" });
      i += 2;
      continue;
    } // घ
    if (r.startsWith("ch")) {
      tokens.push({ type: "consonant", hi: "\u091A", matra: "" });
      i += 2;
      continue;
    } // च
    if (r.startsWith("jh")) {
      tokens.push({ type: "consonant", hi: "\u091D", matra: "" });
      i += 2;
      continue;
    } // झ
    if (r.startsWith("th")) {
      tokens.push({ type: "consonant", hi: "\u0925", matra: "" });
      i += 2;
      continue;
    } // थ
    if (r.startsWith("dh")) {
      tokens.push({ type: "consonant", hi: "\u0927", matra: "" });
      i += 2;
      continue;
    } // ध
    if (r.startsWith("nh")) {
      tokens.push({ type: "consonant", hi: "\u091E", matra: "" });
      i += 2;
      continue;
    } // ञ
    if (r.startsWith("ph")) {
      tokens.push({ type: "consonant", hi: "\u092B", matra: "" });
      i += 2;
      continue;
    } // फ
    if (r.startsWith("bh")) {
      tokens.push({ type: "consonant", hi: "\u092D", matra: "" });
      i += 2;
      continue;
    } // भ
    if (r.startsWith("ng")) {
      tokens.push({ type: "consonant", hi: "\u0919", matra: "" });
      i += 2;
      continue;
    } // ङ

    // ── 2-char long vowels ────────────────────────────────────────────────────
    if (r.startsWith("aa")) {
      tokens.push({ type: "vowel", hi: "\u0906", matra: "\u093E" });
      i += 2;
      continue;
    } // आ / ा
    if (r.startsWith("ee") || r.startsWith("ii")) {
      tokens.push({ type: "vowel", hi: "\u0908", matra: "\u0940" });
      i += 2;
      continue;
    } // ई / ी
    if (r.startsWith("oo") || r.startsWith("uu")) {
      tokens.push({ type: "vowel", hi: "\u090A", matra: "\u0942" });
      i += 2;
      continue;
    } // ऊ / ू
    if (r.startsWith("ai")) {
      tokens.push({ type: "vowel", hi: "\u0910", matra: "\u0948" });
      i += 2;
      continue;
    } // ऐ / ै
    if (r.startsWith("au")) {
      tokens.push({ type: "vowel", hi: "\u0914", matra: "\u094C" });
      i += 2;
      continue;
    } // औ / ौ
    if (r.startsWith("ri")) {
      tokens.push({ type: "vowel", hi: "\u090B", matra: "\u0943" });
      i += 2;
      continue;
    } // ऋ / ृ

    // ── single consonants ─────────────────────────────────────────────────────
    const c = s[i];
    switch (c) {
      case "k":
        tokens.push({ type: "consonant", hi: "\u0915", matra: "" });
        i++;
        continue; // क
      case "g":
        tokens.push({ type: "consonant", hi: "\u0917", matra: "" });
        i++;
        continue; // ग
      case "c":
        tokens.push({ type: "consonant", hi: "\u0915", matra: "" });
        i++;
        continue; // क (fallback)
      case "j":
        tokens.push({ type: "consonant", hi: "\u091C", matra: "" });
        i++;
        continue; // ज
      case "t":
        tokens.push({ type: "consonant", hi: "\u0924", matra: "" });
        i++;
        continue; // त
      case "d":
        tokens.push({ type: "consonant", hi: "\u0926", matra: "" });
        i++;
        continue; // द
      case "n":
        tokens.push({ type: "consonant", hi: "\u0928", matra: "" });
        i++;
        continue; // न
      case "p":
        tokens.push({ type: "consonant", hi: "\u092A", matra: "" });
        i++;
        continue; // प
      case "b":
        tokens.push({ type: "consonant", hi: "\u092C", matra: "" });
        i++;
        continue; // ब
      case "m":
        tokens.push({ type: "consonant", hi: "\u092E", matra: "" });
        i++;
        continue; // म
      case "y":
        tokens.push({ type: "consonant", hi: "\u092F", matra: "" });
        i++;
        continue; // य
      case "r":
        tokens.push({ type: "consonant", hi: "\u0930", matra: "" });
        i++;
        continue; // र
      case "l":
        tokens.push({ type: "consonant", hi: "\u0932", matra: "" });
        i++;
        continue; // ल
      case "v":
      case "w":
        tokens.push({ type: "consonant", hi: "\u0935", matra: "" });
        i++;
        continue; // व
      case "s":
        tokens.push({ type: "consonant", hi: "\u0938", matra: "" });
        i++;
        continue; // स
      case "h":
        tokens.push({ type: "consonant", hi: "\u0939", matra: "" });
        i++;
        continue; // ह
      case "f":
        tokens.push({ type: "consonant", hi: "\u092B", matra: "" });
        i++;
        continue; // फ
      case "z":
        tokens.push({ type: "consonant", hi: "\u091C\u093C", matra: "" });
        i++;
        continue; // ज़
      case "q":
        tokens.push({ type: "consonant", hi: "\u0915", matra: "" });
        i++;
        continue; // क
      case "x":
        tokens.push({ type: "consonant", hi: "\u0915\u094D\u0938", matra: "" });
        i++;
        continue; // क्स
    }

    // ── single vowels ─────────────────────────────────────────────────────────
    switch (c) {
      // 'a' is special: trailing → ा, mid-word before consonant → inherent
      case "a":
        tokens.push({ type: "vowel", hi: "\u0905", matra: "_a" });
        i++;
        continue; // अ (special marker)
      // 'i' → long ee (most common in Indian names)
      case "i":
        tokens.push({ type: "vowel", hi: "\u0908", matra: "\u0940" });
        i++;
        continue; // ई / ी
      case "u":
        tokens.push({ type: "vowel", hi: "\u0909", matra: "\u0941" });
        i++;
        continue; // उ / ु
      case "e":
        tokens.push({ type: "vowel", hi: "\u090F", matra: "\u0947" });
        i++;
        continue; // ए / े
      case "o":
        tokens.push({ type: "vowel", hi: "\u0913", matra: "\u094B" });
        i++;
        continue; // ओ / ो
    }

    // Unknown character — pass through as-is
    tokens.push({ type: "consonant", hi: c, matra: "" });
    i++;
  }

  return tokens;
}

/** Returns true if the last Unicode code-point of str is a Devanagari consonant */
function endsWithDevanagariConsonant(str: string): boolean {
  if (!str) return false;
  const cp = str.codePointAt(str.length - 1) ?? 0;
  return (cp >= 0x0915 && cp <= 0x0939) || (cp >= 0x0958 && cp <= 0x095f);
}

function transliterateWord(word: string): string {
  if (!word) return "";
  const tokens = tokenise(word);
  let result = "";

  for (let j = 0; j < tokens.length; j++) {
    const tok = tokens[j];
    const next = tokens[j + 1];
    const isLast = j === tokens.length - 1;

    if (tok.type === "vowel") {
      const afterConsonant = endsWithDevanagariConsonant(result);

      if (tok.matra === "_a") {
        // Special 'a' handling
        if (!afterConsonant) {
          // Independent vowel at word start
          result += "\u0905"; // अ
        } else if (isLast) {
          // Trailing 'a' → long ā matra
          result += "\u093E"; // ा
        }
        // else: inherent 'a' before a consonant — do nothing
      } else {
        if (afterConsonant) {
          result += tok.matra; // dependent matra
        } else {
          result += tok.hi; // independent vowel
        }
      }
    } else {
      // Consonant token
      result += tok.hi;
      // Add virama if next token is also a consonant (cluster)
      if (
        next &&
        next.type === "consonant" &&
        endsWithDevanagariConsonant(result)
      ) {
        result += VIRAMA;
      }
    }
  }

  return result;
}

export function transliterateToHindi(text: string): string {
  if (!text.trim()) return "";
  return text
    .split(" ")
    .map((w) => transliterateWord(w))
    .join(" ");
}
