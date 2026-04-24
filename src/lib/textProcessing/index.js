// Barrel export: unico punto di ingresso per tutti gli esercizi.
//
// Uso tipico in un esercizio React:
//   import { analyzeSentiment, buildWordCloudData } from "../lib/textProcessing";
//
// Oppure si usano direttamente i componenti UI in src/components/analytics/
// che wrappano queste funzioni.

export * from "./tokenizer.js";
export * from "./stopwords.js";
export * from "./wordFrequencies.js";
export * from "./sentiment.js";
export * from "./emotions.js";
export * from "./similarity.js";

// Re-export dei dizionari nel caso un esercizio voglia
// aggiungere parole custom o ispezionare le liste.
export { SENTIMENT_IT } from "./dictionaries/sentimentIT.js";
export { EMOTIONS_IT, VAD_IT, EMOTION_INTENSITY_IT } from "./dictionaries/emotionsIT.js";
export { NEGATIONS_IT, BOOSTERS_IT } from "./dictionaries/negationsIT.js";
