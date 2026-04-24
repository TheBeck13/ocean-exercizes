// TF-IDF, cosine similarity, top keywords e clustering k-medoids semplice.
// Sostituisce la parte di txtsimilarity.py utilizzabile client-side su
// corpus piccoli (≤200 documenti tipici negli esercizi).

import { preprocessCorpus } from "./tokenizer.js";

// ═══ TF-IDF ═══
// Vocabolario globale + matrice sparse rappresentata come Map per riga.
export function buildTfIdf(tokenizedDocs) {
  const N = tokenizedDocs.length;
  const df = new Map();                    // term → # docs in cui appare
  const tfPerDoc = tokenizedDocs.map(tokens => {
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    for (const term of tf.keys()) df.set(term, (df.get(term) || 0) + 1);
    return tf;
  });

  const vocab = [...df.keys()];
  const idf = new Map();
  for (const term of vocab) {
    // idf smoothed (come sklearn.TfidfTransformer con smooth_idf=True)
    idf.set(term, Math.log((1 + N) / (1 + df.get(term))) + 1);
  }

  // tfidf[d] = Map(term → weight). Normalizzato L2 per doc.
  const tfidf = tfPerDoc.map(tf => {
    const row = new Map();
    let sumSq = 0;
    for (const [term, freq] of tf) {
      const w = freq * idf.get(term);
      row.set(term, w);
      sumSq += w * w;
    }
    const norm = Math.sqrt(sumSq) || 1;
    for (const [term, w] of row) row.set(term, w / norm);
    return row;
  });

  return { vocab, idf, df, tfidf, N };
}

// ═══ TOP KEYWORDS ═══
// Per ogni documento, restituisce le parole con peso TF-IDF più alto.
export function topKeywordsPerDoc(docs, {
  lang = "italian",
  removeStopwords = true,
  extraStopwords = [],
  topN = 10,
} = {}) {
  const tokenized = preprocessCorpus(docs, { lang, removeStopwords, extraStopwords });
  const { tfidf } = buildTfIdf(tokenized);
  return tfidf.map(row =>
    [...row.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, weight]) => ({ word, weight }))
  );
}

// Top keywords aggregate sull'intero corpus (più usate in molti documenti).
export function topKeywordsCorpus(docs, {
  lang = "italian",
  removeStopwords = true,
  extraStopwords = [],
  topN = 20,
} = {}) {
  const tokenized = preprocessCorpus(docs, { lang, removeStopwords, extraStopwords });
  const { tfidf, df } = buildTfIdf(tokenized);

  // Score per corpus = somma dei tfidf * log(df+1): premia parole frequenti
  // ma ben distribuite (non solo "parole killer" in un solo doc).
  const totals = new Map();
  for (const row of tfidf) {
    for (const [term, w] of row) totals.set(term, (totals.get(term) || 0) + w);
  }
  return [...totals.entries()]
    .map(([word, weight]) => ({ word, weight, documentFrequency: df.get(word) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, topN);
}

// ═══ COSINE SIMILARITY ═══
export function cosineSimilarity(rowA, rowB) {
  // I vettori sono già normalizzati L2 → cosine = prodotto scalare.
  const [small, big] = rowA.size <= rowB.size ? [rowA, rowB] : [rowB, rowA];
  let dot = 0;
  for (const [term, w] of small) {
    const w2 = big.get(term);
    if (w2 !== undefined) dot += w * w2;
  }
  return dot;
}

// Matrice di similarità N×N.
export function similarityMatrix(docs, {
  lang = "italian",
  removeStopwords = true,
  extraStopwords = [],
} = {}) {
  const tokenized = preprocessCorpus(docs, { lang, removeStopwords, extraStopwords });
  const { tfidf } = buildTfIdf(tokenized);
  const N = tfidf.length;
  const mat = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    mat[i][i] = 1;
    for (let j = i + 1; j < N; j++) {
      const s = cosineSimilarity(tfidf[i], tfidf[j]);
      mat[i][j] = s;
      mat[j][i] = s;
    }
  }
  return { matrix: mat, tfidf };
}

// Dissimilarità media di un documento vs. tutti gli altri (1 - avg cosine).
// Utile per LaFoto: ogni osservazione viene confrontata con le altre.
export function dissimilarityScores(docs, options = {}) {
  const { matrix } = similarityMatrix(docs, options);
  const N = matrix.length;
  if (N <= 1) return docs.map(() => 0);
  return matrix.map((row) => {
    const sum = row.reduce((s, v) => s + v, 0) - 1; // esclude la diagonale (self)
    return 1 - sum / (N - 1);
  });
}

// ═══ K-MEDOIDS CLUSTERING (versione semplice) ═══
// Sufficiente per raggruppare metafore o risposte simili in 2-5 cluster.
// Usa PAM semplificato: distanza = 1 - cosine.
export function clusterDocs(docs, k, {
  lang = "italian",
  removeStopwords = true,
  extraStopwords = [],
  maxIters = 50,
  seed = 42,
} = {}) {
  const tokenized = preprocessCorpus(docs, { lang, removeStopwords, extraStopwords });
  const { tfidf } = buildTfIdf(tokenized);
  const N = tfidf.length;
  if (N === 0 || k <= 0) return { clusters: [], assignments: [], medoids: [] };
  const K = Math.min(k, N);

  // Distanza precomputata.
  const dist = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const d = 1 - cosineSimilarity(tfidf[i], tfidf[j]);
      dist[i][j] = d;
      dist[j][i] = d;
    }
  }

  // RNG deterministico (mulberry32) per inizializzazione medoids.
  let s = seed >>> 0;
  const rand = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // k-medoids++: primo medoid random, successivi lontano dai già scelti.
  const medoids = [Math.floor(rand() * N)];
  while (medoids.length < K) {
    const weights = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      if (medoids.includes(i)) continue;
      weights[i] = Math.min(...medoids.map(m => dist[i][m]));
    }
    const total = weights.reduce((a, b) => a + b, 0);
    if (total === 0) { medoids.push(N - 1); break; }
    let r = rand() * total;
    for (let i = 0; i < N; i++) {
      r -= weights[i];
      if (r <= 0) { medoids.push(i); break; }
    }
  }

  const assignments = new Array(N).fill(0);
  for (let it = 0; it < maxIters; it++) {
    // Assegna ogni punto al medoid più vicino.
    for (let i = 0; i < N; i++) {
      let best = 0, bestD = Infinity;
      for (let m = 0; m < medoids.length; m++) {
        const d = dist[i][medoids[m]];
        if (d < bestD) { bestD = d; best = m; }
      }
      assignments[i] = best;
    }
    // Aggiorna medoids: in ogni cluster scegli il punto che minimizza la
    // somma delle distanze intra-cluster.
    let changed = false;
    for (let m = 0; m < medoids.length; m++) {
      const members = [];
      for (let i = 0; i < N; i++) if (assignments[i] === m) members.push(i);
      if (members.length === 0) continue;
      let bestIdx = medoids[m], bestCost = Infinity;
      for (const cand of members) {
        let cost = 0;
        for (const other of members) cost += dist[cand][other];
        if (cost < bestCost) { bestCost = cost; bestIdx = cand; }
      }
      if (bestIdx !== medoids[m]) { medoids[m] = bestIdx; changed = true; }
    }
    if (!changed) break;
  }

  // Compone i cluster.
  const clusters = Array.from({ length: medoids.length }, () => []);
  for (let i = 0; i < N; i++) clusters[assignments[i]].push(i);

  return { clusters, assignments, medoids };
}

// Silhouette media — qualità del clustering in [-1, 1].
export function silhouetteScore(docs, assignments, options = {}) {
  const tokenized = preprocessCorpus(docs, options);
  const { tfidf } = buildTfIdf(tokenized);
  const N = tfidf.length;
  if (N < 2) return 0;
  const dist = (i, j) => 1 - cosineSimilarity(tfidf[i], tfidf[j]);

  let sum = 0, count = 0;
  for (let i = 0; i < N; i++) {
    const own = assignments[i];
    const sameCluster = [], otherClusters = new Map();
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      if (assignments[j] === own) sameCluster.push(j);
      else {
        const arr = otherClusters.get(assignments[j]) || [];
        arr.push(j);
        otherClusters.set(assignments[j], arr);
      }
    }
    if (sameCluster.length === 0) continue;
    const a = sameCluster.reduce((s, j) => s + dist(i, j), 0) / sameCluster.length;
    let b = Infinity;
    for (const cluster of otherClusters.values()) {
      const d = cluster.reduce((s, j) => s + dist(i, j), 0) / cluster.length;
      if (d < b) b = d;
    }
    if (!isFinite(b)) continue;
    sum += (b - a) / Math.max(a, b);
    count++;
  }
  return count > 0 ? sum / count : 0;
}
