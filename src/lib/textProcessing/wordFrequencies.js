// Calcolo delle frequenze per la Word Cloud.
// Replica la logica di wcloud.py: tenere top N parole, computare quartili
// per la colorazione "byfreq" (first/second/third/fourth).

import { preprocessCorpus } from "./tokenizer.js";

// Conta le occorrenze in un corpus di testi.
export function countFrequencies(texts, {
  lang = "italian",
  removeStopwords = true,
  extraStopwords = [],
  uppercase = false,
} = {}) {
  const tokensPerDoc = preprocessCorpus(texts, { lang, removeStopwords, extraStopwords });
  const counts = new Map();
  for (const tokens of tokensPerDoc) {
    for (const t of tokens) {
      const key = uppercase ? t.toUpperCase() : t;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return counts;
}

// Tiene le top N parole e assegna il quartile (come il prof con pandas.qcut).
export function topNWithQuartiles(counts, topN = 50) {
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  if (sorted.length === 0) return [];

  // Quartili: divide le parole in 4 gruppi equipopolati per rango di frequenza.
  const n = sorted.length;
  return sorted.map(([word, freq], idx) => {
    const q = Math.floor((idx * 4) / n); // 0..3
    const category = ["first", "second", "third", "fourth"][q];
    return { word, freq, quartile: category, rank: idx + 1 };
  });
}

// Palette esatta del prof (my_tf_color_func in wcloud.py).
export const BYFREQ_PALETTE = {
  first:  "#95C36B",  // verde (top 25%)
  second: "#95C36B",
  third:  "#7EC3CA",  // turchese
  fourth: "#EF8EB0",  // rosa (bottom 25%)
};

// Palette "Bold 5" dello script: scelta casuale per parola.
export const BOLD5_PALETTE = ["#764089","#4CA37C","#4568A7","#E9B93E","#D54D74"];

export function pickBold5Color(word) {
  // Hash deterministico così la stessa parola mantiene lo stesso colore
  // cross-render (altrimenti sfarfalla ad ogni re-mount).
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) >>> 0;
  return BOLD5_PALETTE[h % BOLD5_PALETTE.length];
}

// Pipeline completa: testi → parole pesate pronte per il rendering.
export function buildWordCloudData(texts, {
  lang = "italian",
  removeStopwords = true,
  extraStopwords = [],
  maxWords = 50,
  uppercase = false,
  palette = "byfreq",
} = {}) {
  const counts = countFrequencies(texts, { lang, removeStopwords, extraStopwords, uppercase });
  const top = topNWithQuartiles(counts, maxWords);

  // Assegna colore e font-size normalizzato (range proporzionale alla freq).
  const maxFreq = top[0]?.freq || 1;
  const minFreq = top[top.length - 1]?.freq || 1;

  return top.map(item => {
    let color;
    if (palette === "byfreq") color = BYFREQ_PALETTE[item.quartile];
    else if (palette === "bold5") color = pickBold5Color(item.word);
    else if (palette === "wb") color = "#FFF";
    else if (palette === "bw") color = "#111";
    else color = "#0099E6"; // default brand blue

    // Normalizzazione log per evitare che 1 parola "killer" schiacci tutte le altre.
    const logMin = Math.log(Math.max(1, minFreq));
    const logMax = Math.log(Math.max(2, maxFreq));
    const t = logMax > logMin ? (Math.log(item.freq) - logMin) / (logMax - logMin) : 0.5;

    return { ...item, color, weight: t };
  });
}
