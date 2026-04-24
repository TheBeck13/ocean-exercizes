// Pipeline di pulizia testi — port JavaScript fedele di andreaREcompiler +
// andreaPULISCI_NEW dallo script del prof (sbs-functions/textanalysis.py).
// L'ordine delle sostituzioni conta: ogni regex presuppone lo stato lasciato
// dalla precedente.

import { getStopwords } from "./stopwords.js";

const PUNCTUATION = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
const SYMBOLS = "»«+*|@#.-_!/=:&;?'’°$,()\"[]{}<>©";

// Regex vocalica per ogni lingua: dopo pulizia tiene solo parole con caratteri "buoni".
function buildAllowedCharsPattern(lang) {
  if (lang === "english") {
    return /\s*(?<!\S)(?![a-z0-9][a-z0-9]*(?!\S))\S+/g;
  }
  if (lang === "italian") {
    return /\s*(?<!\S)(?![a-z0-9àèéìòóù][a-z0-9àèéìòóù]*(?!\S))\S+/g;
  }
  return /\s*(?<!\S)(?![a-z0-9àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ][a-z0-9àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]*(?!\S))\S+/g;
}

// Costruisce una regex a "fast trie" per un insieme di parole.
// Equivalente funzionale della classe Trie dello script Python, ma con
// soluzione più semplice (alternation ordinata), sufficiente per set <10k parole.
function buildWordBoundaryRegex(words) {
  if (!words || words.length === 0) return null;
  // Ordina per lunghezza decrescente per evitare prefix shadowing.
  const sorted = [...new Set(words)].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`(?<!\\w)(?:${escaped.join("|")})(?!\\w)`, "giu");
}

// Equivalente di andreaREcompiler — pipeline di sostituzioni ordinata.
export function buildCleanerPipeline({
  lang = "italian",
  cutWords = [],
  removeMentions = false,
} = {}) {
  const steps = [];

  // 1. Rimuovi tag HTML
  steps.push({ re: /<[^>]+>/g, sub: " " });
  // 2. Mentions (solo se richiesto)
  if (removeMentions) steps.push({ re: /@[^\s]+/g, sub: " " });
  // 3. Hashtag → parola senza #
  steps.push({ re: /#([^\s]+)/g, sub: "$1" });
  // 4. URL http/www
  steps.push({ re: /https?\S+/gi, sub: " " });
  steps.push({ re: /www\S+/gi, sub: " " });
  // 5. Entità HTML (&amp; &#58 ecc.)
  steps.push({ re: /(\s)&\S+/g, sub: " " });
  // 6. Punteggiatura senza spazio (U.S.A. → USA)
  const punctRe = new RegExp(`[${PUNCTUATION.replace(/[\\\]\-]/g, c => "\\" + c)}]`, "g");
  steps.push({ re: punctRe, sub: "" });
  // 7. Simboli residui → spazio
  const symbolRe = new RegExp(`[${SYMBOLS.replace(/[\\\]\-]/g, c => "\\" + c)}]`, "g");
  steps.push({ re: symbolRe, sub: " " });
  // 8. Lettere singole (preservando parole di 2 caratteri tipo "Dr")
  steps.push({ re: /\b\w{1}\b/g, sub: " " });
  // 9. Numeri e numeri+punteggiatura
  steps.push({ re: /\b\d+(?:\.\d+)?\s+/g, sub: " " });
  // 10. Parole con caratteri "non alfabetici" alla lingua
  steps.push({ re: buildAllowedCharsPattern(lang), sub: " " });
  // 11. Stopwords
  const stopwordSet = new Set(cutWords);
  if (stopwordSet.size > 0) {
    const stopRe = buildWordBoundaryRegex([...stopwordSet]);
    if (stopRe) steps.push({ re: stopRe, sub: " " });
  }
  // 12. Collassa whitespace
  steps.push({ re: / +/g, sub: " " });

  return steps;
}

// Equivalente di andreaPULISCI_NEW — applica la pipeline.
export function applyCleaner(text, pipeline) {
  let out = text.toLowerCase();
  for (const { re, sub } of pipeline) {
    out = out.replace(re, sub);
  }
  return out.trim();
}

// API high-level: pulisci un testo con opzioni sensate di default.
export function cleanText(text, {
  lang = "italian",
  removeStopwords = true,
  extraStopwords = [],
  removeMentions = false,
} = {}) {
  if (!text || typeof text !== "string") return "";
  const stopwords = removeStopwords
    ? [...getStopwords(lang), ...extraStopwords]
    : extraStopwords;
  const pipeline = buildCleanerPipeline({ lang, cutWords: stopwords, removeMentions });
  return applyCleaner(text, pipeline);
}

// Tokenizza un testo già pulito.
export function tokenize(cleanedText) {
  if (!cleanedText) return [];
  return cleanedText.split(/\s+/).filter(Boolean);
}

// Pipeline completa testo → token puliti, utile per tutte le analisi a valle.
export function preprocess(text, options = {}) {
  return tokenize(cleanText(text, options));
}

// Preprocess di un corpus (array di testi) — riusa la stessa pipeline
// (più veloce che compilare i regex ogni volta).
export function preprocessCorpus(texts, {
  lang = "italian",
  removeStopwords = true,
  extraStopwords = [],
  removeMentions = false,
} = {}) {
  const stopwords = removeStopwords
    ? [...getStopwords(lang), ...extraStopwords]
    : extraStopwords;
  const pipeline = buildCleanerPipeline({ lang, cutWords: stopwords, removeMentions });
  return texts.map(t => tokenize(applyCleaner(t || "", pipeline)));
}
