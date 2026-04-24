// Barrel export: punto d'ingresso unico per i componenti di analisi testuale.
// Gli esercizi dovrebbero importare da qui, non dai singoli file:
//
//   import { WordCloud, SentimentPanel, EmotionsRadar } from "../components/analytics";

export { default as WordCloud } from "./WordCloud.jsx";
export { default as SentimentPanel } from "./SentimentPanel.jsx";
export { default as EmotionsRadar } from "./EmotionsRadar.jsx";
export { default as KeywordRanking, PerDocumentKeywords } from "./KeywordRanking.jsx";
export { default as SimilarityMatrix } from "./SimilarityMatrix.jsx";
export { default as ThemeClusters } from "./ThemeClusters.jsx";
