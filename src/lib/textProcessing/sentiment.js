// Sentiment analysis in stile VADER su lessico italiano.
// Sostituisce pattern.it / VADER del prof in textanalysis.py.
//
// Algoritmo:
//   1. Tokenizza (preservando negazioni e booster — NO stopwords).
//   2. Per ogni token con score nel lessico, applica eventuali modificatori
//      presenti nei `MODIFIER_WINDOW` token precedenti (negazione → segno
//      invertito + attenuazione; booster → moltiplicatore).
//   3. Somma gli score e normalizza con la formula VADER compound.

import { SENTIMENT_IT, normalizeCompound } from "./dictionaries/sentimentIT.js";
import { NEGATIONS_IT, BOOSTERS_IT, MODIFIER_WINDOW } from "./dictionaries/negationsIT.js";
import { cleanText, tokenize } from "./tokenizer.js";

const NEGATION_DAMP = 0.74; // fattore VADER: la negazione non solo inverte, attenua.

function scoreTokenInContext(tokens, idx) {
  const tok = tokens[idx];
  const base = SENTIMENT_IT[tok];
  if (base === undefined) return 0;

  let score = base;
  let boost = 1;
  let negate = false;

  const lo = Math.max(0, idx - MODIFIER_WINDOW);
  for (let j = lo; j < idx; j++) {
    const prev = tokens[j];
    if (NEGATIONS_IT.has(prev)) negate = !negate;
    if (BOOSTERS_IT[prev] !== undefined) boost *= BOOSTERS_IT[prev];
  }

  score *= boost;
  if (negate) score = -score * NEGATION_DAMP;
  return score;
}

// Analizza un singolo testo. Restituisce compound + breakdown pos/neg/neu.
export function analyzeSentiment(text, { lang = "italian" } = {}) {
  // Non rimuoviamo stopwords perché negazioni/intensificatori servono intatti.
  const cleaned = cleanText(text || "", { lang, removeStopwords: false });
  const tokens = tokenize(cleaned);
  if (tokens.length === 0) return { compound: 0, pos: 0, neg: 0, neu: 1, hits: [] };

  let posSum = 0, negSum = 0, raw = 0;
  const hits = [];

  for (let i = 0; i < tokens.length; i++) {
    const s = scoreTokenInContext(tokens, i);
    if (s !== 0) {
      raw += s;
      if (s > 0) posSum += s;
      else negSum += -s;
      hits.push({ word: tokens[i], score: s, index: i });
    }
  }

  const compound = normalizeCompound(raw);
  const totalValence = posSum + negSum;
  // Componenti pos/neg/neu sul modello VADER: quota dei token valenziati, con
  // il restante considerato neutro.
  const neuCount = tokens.length - hits.length;
  const denom = posSum + negSum + neuCount;
  const pos = denom > 0 ? posSum / denom : 0;
  const neg = denom > 0 ? negSum / denom : 0;
  const neu = denom > 0 ? neuCount / denom : 1;

  return {
    compound,           // -1..+1 (score globale)
    pos, neg, neu,      // 0..1 (quote relative)
    rawScore: raw,
    tokens: tokens.length,
    valencedTokens: hits.length,
    hits,
    label: compound >= 0.20 ? "positivo" : compound <= -0.20 ? "negativo" : "neutro",
  };
}

// Aggrega sentiment su un corpus di testi (media pesata dei compound).
export function analyzeSentimentCorpus(texts, options = {}) {
  const results = texts.map(t => analyzeSentiment(t, options));
  const valid = results.filter(r => r.tokens > 0);
  if (valid.length === 0) {
    return { compound: 0, pos: 0, neg: 0, neu: 1, perDoc: results, count: 0 };
  }
  const avg = (k) => valid.reduce((s, r) => s + r[k], 0) / valid.length;
  return {
    compound: avg("compound"),
    pos: avg("pos"),
    neg: avg("neg"),
    neu: avg("neu"),
    perDoc: results,
    count: valid.length,
  };
}
