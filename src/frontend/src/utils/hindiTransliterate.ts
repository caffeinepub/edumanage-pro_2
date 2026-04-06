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
 *  - Consonant clusters: ONLY explicit digraphs (ksh, sh, pr, etc.) get virama
 *  - Single consonant followed by another single consonant → each gets inherent 'a'
 *    (e.g. Tulsiram → तुलसिराम, NOT तुल्सीरम)
 *  - 'ng' → anusvara (ं) + ग  (e.g. khumsing → खुमसिंग, NOT खुमसीङ)
 */

const _VIRAMA = "\u094D"; // ्

type TokenType = "consonant" | "vowel" | "cluster" | "nasal_g";

interface Token {
  type: TokenType;
  hi: string; // independent Devanagari form
  matra: string; // matra (dependent) form — empty string means inherent 'a'
  length: number; // how many English chars this token consumes
  isCluster: boolean; // true = pre-built cluster (virama already embedded)
}

/** Parse lowercased English word into a sequence of Hindi tokens */
function tokenise(word: string): Token[] {
  const tokens: Token[] = [];
  const s = word.toLowerCase();
  let i = 0;

  while (i < s.length) {
    const r = s.slice(i);

    // ── 3-char pre-built consonant clusters (virama embedded) ────────────────
    if (r.startsWith("ksh")) {
      tokens.push({
        type: "cluster",
        hi: "\u0915\u094D\u0937",
        matra: "",
        length: 3,
        isCluster: true,
      });
      i += 3;
      continue;
    }
    if (r.startsWith("shr")) {
      tokens.push({
        type: "cluster",
        hi: "\u0936\u094D\u0930",
        matra: "",
        length: 3,
        isCluster: true,
      });
      i += 3;
      continue;
    }
    if (r.startsWith("str")) {
      tokens.push({
        type: "cluster",
        hi: "\u0938\u094D\u0924\u094D\u0930",
        matra: "",
        length: 3,
        isCluster: true,
      });
      i += 3;
      continue;
    }
    if (r.startsWith("thr")) {
      tokens.push({
        type: "cluster",
        hi: "\u0925\u094D\u0930",
        matra: "",
        length: 3,
        isCluster: true,
      });
      i += 3;
      continue;
    }

    // ── 2-char pre-built clusters ─────────────────────────────────────────────
    // Only clusters that are true conjuncts (pr, br, gr, kr, tr, dr, etc.)
    if (r.startsWith("pr")) {
      tokens.push({
        type: "cluster",
        hi: "\u092A\u094D\u0930",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("br")) {
      tokens.push({
        type: "cluster",
        hi: "\u092C\u094D\u0930",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("gr")) {
      tokens.push({
        type: "cluster",
        hi: "\u0917\u094D\u0930",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("kr")) {
      tokens.push({
        type: "cluster",
        hi: "\u0915\u094D\u0930",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("tr")) {
      tokens.push({
        type: "cluster",
        hi: "\u0924\u094D\u0930",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("dr")) {
      tokens.push({
        type: "cluster",
        hi: "\u0926\u094D\u0930",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("vr") || r.startsWith("wr")) {
      tokens.push({
        type: "cluster",
        hi: "\u0935\u094D\u0930",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("sr")) {
      tokens.push({
        type: "cluster",
        hi: "\u0938\u094D\u0930",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("sp")) {
      tokens.push({
        type: "cluster",
        hi: "\u0938\u094D\u092A",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("st")) {
      tokens.push({
        type: "cluster",
        hi: "\u0938\u094D\u0924",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("sk")) {
      tokens.push({
        type: "cluster",
        hi: "\u0938\u094D\u0915",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("sm")) {
      tokens.push({
        type: "cluster",
        hi: "\u0938\u094D\u092E",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("sn")) {
      tokens.push({
        type: "cluster",
        hi: "\u0938\u094D\u0928",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("sv") || r.startsWith("sw")) {
      tokens.push({
        type: "cluster",
        hi: "\u0938\u094D\u0935",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("ks")) {
      tokens.push({
        type: "cluster",
        hi: "\u0915\u094D\u0938",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("gn")) {
      tokens.push({
        type: "cluster",
        hi: "\u0917\u094D\u0928",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("dy")) {
      tokens.push({
        type: "cluster",
        hi: "\u0926\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("ny")) {
      tokens.push({
        type: "cluster",
        hi: "\u0928\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("ty")) {
      tokens.push({
        type: "cluster",
        hi: "\u0924\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("vy")) {
      tokens.push({
        type: "cluster",
        hi: "\u0935\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("gy")) {
      tokens.push({
        type: "cluster",
        hi: "\u0917\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("my")) {
      tokens.push({
        type: "cluster",
        hi: "\u092E\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("py")) {
      tokens.push({
        type: "cluster",
        hi: "\u092A\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("ky")) {
      tokens.push({
        type: "cluster",
        hi: "\u0915\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("ry")) {
      tokens.push({
        type: "cluster",
        hi: "\u0930\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("ly")) {
      tokens.push({
        type: "cluster",
        hi: "\u0932\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("by")) {
      tokens.push({
        type: "cluster",
        hi: "\u092C\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("hy")) {
      tokens.push({
        type: "cluster",
        hi: "\u0939\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }
    if (r.startsWith("jy")) {
      tokens.push({
        type: "cluster",
        hi: "\u091C\u094D\u092F",
        matra: "",
        length: 2,
        isCluster: true,
      });
      i += 2;
      continue;
    }

    // ── 2-char digraph consonants (single sound, NOT clusters) ───────────────
    if (r.startsWith("sh")) {
      tokens.push({
        type: "consonant",
        hi: "\u0936",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // श
    if (r.startsWith("kh")) {
      tokens.push({
        type: "consonant",
        hi: "\u0916",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // ख
    if (r.startsWith("gh")) {
      tokens.push({
        type: "consonant",
        hi: "\u0918",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // घ
    if (r.startsWith("ch")) {
      tokens.push({
        type: "consonant",
        hi: "\u091A",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // च
    if (r.startsWith("jh")) {
      tokens.push({
        type: "consonant",
        hi: "\u091D",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // झ
    if (r.startsWith("th")) {
      tokens.push({
        type: "consonant",
        hi: "\u0925",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // थ
    if (r.startsWith("dh")) {
      tokens.push({
        type: "consonant",
        hi: "\u0927",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // ध
    if (r.startsWith("nh")) {
      tokens.push({
        type: "consonant",
        hi: "\u091E",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // ञ
    if (r.startsWith("ph")) {
      tokens.push({
        type: "consonant",
        hi: "\u092B",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // फ
    if (r.startsWith("bh")) {
      tokens.push({
        type: "consonant",
        hi: "\u092D",
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // भ

    // ── 'ng' → anusvara (ं) + ग  e.g. khumsing → खुमसिंग ──────────────────
    // 'ng' in Indian names represents a nasal sound written as anusvara + ग
    // NOT ङ (which is a separate letter rarely used in modern Hindi names)
    if (r.startsWith("ng")) {
      tokens.push({
        type: "nasal_g",
        hi: "\u0902\u0917", // ं + ग
        matra: "",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // ंग

    // ── 2-char long vowels ────────────────────────────────────────────────────
    if (r.startsWith("aa")) {
      tokens.push({
        type: "vowel",
        hi: "\u0906",
        matra: "\u093E",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // आ / ा
    if (r.startsWith("ee") || r.startsWith("ii")) {
      tokens.push({
        type: "vowel",
        hi: "\u0908",
        matra: "\u0940",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // ई / ी
    if (r.startsWith("oo") || r.startsWith("uu")) {
      tokens.push({
        type: "vowel",
        hi: "\u090A",
        matra: "\u0942",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // ऊ / ू
    if (r.startsWith("ai")) {
      tokens.push({
        type: "vowel",
        hi: "\u0910",
        matra: "\u0948",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // ऐ / ै
    if (r.startsWith("au")) {
      tokens.push({
        type: "vowel",
        hi: "\u0914",
        matra: "\u094C",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // औ / ौ
    if (r.startsWith("ri")) {
      tokens.push({
        type: "vowel",
        hi: "\u090B",
        matra: "\u0943",
        length: 2,
        isCluster: false,
      });
      i += 2;
      continue;
    } // ऋ / ृ

    // ── single consonants ─────────────────────────────────────────────────────
    const c = s[i];
    switch (c) {
      case "k":
        tokens.push({
          type: "consonant",
          hi: "\u0915",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // क
      case "g":
        tokens.push({
          type: "consonant",
          hi: "\u0917",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ग
      case "c":
        tokens.push({
          type: "consonant",
          hi: "\u0915",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // क
      case "j":
        tokens.push({
          type: "consonant",
          hi: "\u091C",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ज
      case "t":
        tokens.push({
          type: "consonant",
          hi: "\u0924",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // त
      case "d":
        tokens.push({
          type: "consonant",
          hi: "\u0926",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // द
      case "n":
        tokens.push({
          type: "consonant",
          hi: "\u0928",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // न
      case "p":
        tokens.push({
          type: "consonant",
          hi: "\u092A",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // प
      case "b":
        tokens.push({
          type: "consonant",
          hi: "\u092C",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ब
      case "m":
        tokens.push({
          type: "consonant",
          hi: "\u092E",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // म
      case "y":
        tokens.push({
          type: "consonant",
          hi: "\u092F",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // य
      case "r":
        tokens.push({
          type: "consonant",
          hi: "\u0930",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // र
      case "l":
        tokens.push({
          type: "consonant",
          hi: "\u0932",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ल
      case "v":
      case "w":
        tokens.push({
          type: "consonant",
          hi: "\u0935",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // व
      case "s":
        tokens.push({
          type: "consonant",
          hi: "\u0938",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // स
      case "h":
        tokens.push({
          type: "consonant",
          hi: "\u0939",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ह
      case "f":
        tokens.push({
          type: "consonant",
          hi: "\u092B",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // फ
      case "z":
        tokens.push({
          type: "consonant",
          hi: "\u091C\u093C",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ज़
      case "q":
        tokens.push({
          type: "consonant",
          hi: "\u0915",
          matra: "",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // क
      case "x":
        tokens.push({
          type: "cluster",
          hi: "\u0915\u094D\u0938",
          matra: "",
          length: 1,
          isCluster: true,
        });
        i++;
        continue; // क्स
    }

    // ── single vowels ─────────────────────────────────────────────────────────
    switch (c) {
      case "a":
        tokens.push({
          type: "vowel",
          hi: "\u0905",
          matra: "_a",
          length: 1,
          isCluster: false,
        });
        i++;
        continue;
      case "i":
        tokens.push({
          type: "vowel",
          hi: "\u0908",
          matra: "\u0940",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ई / ी
      case "u":
        tokens.push({
          type: "vowel",
          hi: "\u0909",
          matra: "\u0941",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // उ / ु
      case "e":
        tokens.push({
          type: "vowel",
          hi: "\u090F",
          matra: "\u0947",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ए / े
      case "o":
        tokens.push({
          type: "vowel",
          hi: "\u0913",
          matra: "\u094B",
          length: 1,
          isCluster: false,
        });
        i++;
        continue; // ओ / ो
    }

    // Unknown character — pass through as-is
    tokens.push({
      type: "consonant",
      hi: c,
      matra: "",
      length: 1,
      isCluster: false,
    });
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

    if (tok.type === "nasal_g") {
      // 'ng' → anusvara (ं) attached to previous vowel/consonant + ग
      // The anusvara must be appended directly after the preceding character
      // (before any matra is placed), then ग follows.
      // Since anusvara is a combining mark, we simply append ं then ग.
      result += "\u0902\u0917"; // ं + ग
    } else if (tok.type === "vowel") {
      const afterConsonant = endsWithDevanagariConsonant(result);

      if (tok.matra === "_a") {
        // Special 'a' handling
        if (!afterConsonant) {
          result += "\u0905"; // अ — independent vowel at word start
        } else if (isLast) {
          result += "\u093E"; // ा — trailing 'a' → long aa matra
        }
        // else: inherent 'a' between consonants — do nothing
      } else {
        if (afterConsonant) {
          result += tok.matra; // dependent matra
        } else {
          result += tok.hi; // independent vowel
        }
      }
    } else if (tok.isCluster) {
      // Pre-built cluster: virama already embedded, just append
      result += tok.hi;
    } else {
      // Regular single consonant — NO automatic virama between consonants.
      // Each consonant carries its own inherent 'a' unless explicitly followed
      // by a vowel token. Virama is only added for pre-built clusters above.
      result += tok.hi;
      // Exception: if next token is a vowel, no action needed (matra will be added).
      // If the word ends with a consonant with no trailing vowel, add virama (halant)
      // so the consonant is rendered without its inherent 'a'.
      if (isLast && !next) {
        // Trailing consonant — keep inherent 'a' for most Indian names
        // (e.g. Ram → राम, not रम्)
        // Do NOT add virama for names ending in consonant.
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
