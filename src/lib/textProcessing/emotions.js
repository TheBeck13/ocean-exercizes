// Emotions analysis — 8 emozioni di Plutchik con lessico NRC italiano.
// Replica il comportamento di textanalysis.py emotions_fast / NRCcount.

import { EMOTIONS_IT, VAD_IT, EMOTION_INTENSITY_IT } from "./dictionaries/emotionsIT.js";
import { preprocess } from "./tokenizer.js";

export const EMOTION_LABELS = {
  anger:        "Rabbia",
  disgust:      "Disgusto",
  fear:         "Paura",
  joy:          "Gioia",
  trust:        "Fiducia",
  surprise:     "Sorpresa",
  anticipation: "Anticipazione",
  sadness:      "Tristezza",
};

export const EMOTION_COLORS = {
  anger:        "#DC2626", // rosso
  disgust:      "#7C3AED", // viola
  fear:         "#059669", // verde scuro (Plutchik)
  joy:          "#F59E0B", // ambra
  trust:        "#10B981", // verde chiaro
  surprise:     "#06B6D4", // ciano
  anticipation: "#EA580C", // arancio
  sadness:      "#2563EB", // blu
};

// Pre-computa i Set di parole per ogni emozione — più veloce in querying.
const EMOTION_SETS = Object.fromEntries(
  Object.entries(EMOTIONS_IT).map(([emo, words]) => [emo, new Set(words)])
);
const ALL_EMOTIONS = Object.keys(EMOTIONS_IT);

// Conteggio emozioni per un singolo testo.
// Output: { anger: {count, percent, words}, ... }
export function analyzeEmotions(text, { lang = "italian" } = {}) {
  // Non rimuoviamo stopwords per non perdere parole come "mai", "troppo"
  // ma le parole emotive per lo più NON sono stopwords quindi la differenza
  // è minima. Manteniamo stopwords-OFF come il prof in emotions_fast.
  const tokens = preprocess(text || "", { lang, removeStopwords: false });
  const n = tokens.length || 1;

  const result = {};
  for (const emo of ALL_EMOTIONS) {
    const matches = [];
    let intensitySum = 0;
    for (const tok of tokens) {
      if (EMOTION_SETS[emo].has(tok)) {
        matches.push(tok);
        intensitySum += EMOTION_INTENSITY_IT[emo]?.[tok] ?? 0.5;
      }
    }
    result[emo] = {
      count: matches.length,
      percent: (matches.length * 100) / n,   // allineato al prof: *100/numparole
      intensity: intensitySum,
      words: matches,
    };
  }

  // Valence/Arousal/Dominance medi sulle parole riconosciute (se presenti).
  let vSum = 0, aSum = 0, dSum = 0, vadHits = 0;
  for (const tok of tokens) {
    const v = VAD_IT[tok];
    if (v) {
      vSum += v.valence;
      aSum += v.arousal;
      dSum += v.dominance;
      vadHits++;
    }
  }
  const vad = vadHits > 0
    ? { valence: vSum / vadHits, arousal: aSum / vadHits, dominance: dSum / vadHits, hits: vadHits }
    : { valence: 0.5, arousal: 0.5, dominance: 0.5, hits: 0 };

  return { emotions: result, vad, totalTokens: tokens.length };
}

// Aggrega su un corpus: somma i conteggi, ricalcola % sulla somma parole.
export function analyzeEmotionsCorpus(texts, options = {}) {
  const perDoc = texts.map(t => analyzeEmotions(t, options));
  const totalTokens = perDoc.reduce((s, d) => s + d.totalTokens, 0) || 1;

  const aggregated = {};
  for (const emo of ALL_EMOTIONS) {
    const count = perDoc.reduce((s, d) => s + d.emotions[emo].count, 0);
    const intensity = perDoc.reduce((s, d) => s + d.emotions[emo].intensity, 0);
    const words = [];
    for (const d of perDoc) words.push(...d.emotions[emo].words);
    aggregated[emo] = {
      count,
      percent: (count * 100) / totalTokens,
      intensity,
      words,
    };
  }

  // VAD medio ponderato sui documenti che hanno hit.
  const vadDocs = perDoc.filter(d => d.vad.hits > 0);
  const vad = vadDocs.length > 0
    ? {
        valence:   vadDocs.reduce((s, d) => s + d.vad.valence, 0) / vadDocs.length,
        arousal:   vadDocs.reduce((s, d) => s + d.vad.arousal, 0) / vadDocs.length,
        dominance: vadDocs.reduce((s, d) => s + d.vad.dominance, 0) / vadDocs.length,
        hits: vadDocs.reduce((s, d) => s + d.vad.hits, 0),
      }
    : { valence: 0.5, arousal: 0.5, dominance: 0.5, hits: 0 };

  return { emotions: aggregated, vad, totalTokens, perDoc };
}

// Dominante: ritorna la emozione col count più alto.
export function dominantEmotion(emotionAnalysis) {
  const emotions = emotionAnalysis.emotions;
  let best = null, bestCount = -1;
  for (const emo of ALL_EMOTIONS) {
    if (emotions[emo].count > bestCount) {
      bestCount = emotions[emo].count;
      best = emo;
    }
  }
  return bestCount > 0 ? best : null;
}
