// Lessico affettivo italiano per sentiment analysis.
// Punteggi da -3 (molto negativo) a +3 (molto positivo), ispirati a VADER.
// Copre le ~300 parole più frequenti nei contesti di coaching / emotività.

export const SENTIMENT_IT = {
  // ═══ POSITIVO FORTE (+3) ═══
  "eccellente": 3, "magnifico": 3, "meraviglioso": 3, "straordinario": 3,
  "fantastico": 3, "perfetto": 3, "splendido": 3, "favoloso": 3,
  "entusiasmante": 3, "trionfo": 3, "gioia": 3, "felicità": 3,
  "amore": 3, "adoro": 3, "adorato": 3, "brillante": 3,
  "eccezionale": 3, "sublime": 3, "ineguagliabile": 3, "magistrale": 3,

  // ═══ POSITIVO MEDIO (+2) ═══
  "buono": 2, "ottimo": 2, "bene": 2, "positivo": 2, "felice": 2,
  "contento": 2, "soddisfatto": 2, "entusiasta": 2, "fiducioso": 2,
  "sicuro": 2, "forte": 2, "capace": 2, "competente": 2, "efficace": 2,
  "successo": 2, "vittoria": 2, "risultato": 2, "progresso": 2,
  "miglioramento": 2, "crescita": 2, "sviluppo": 2, "opportunità": 2,
  "speranza": 2, "passione": 2, "energia": 2, "vitalità": 2,
  "amare": 2, "amato": 2, "stima": 2, "apprezzare": 2, "apprezzato": 2,
  "sorridere": 2, "sorriso": 2, "ridere": 2, "divertire": 2, "divertente": 2,
  "piacere": 2, "piacevole": 2, "bello": 2, "bellissimo": 2,
  "interessante": 2, "utile": 2, "prezioso": 2, "importante": 2,
  "grato": 2, "gratitudine": 2, "riconoscente": 2, "motivato": 2,
  "motivazione": 2, "ispirato": 2, "ispirazione": 2, "realizzato": 2,
  "realizzare": 2, "risolvere": 2, "risolto": 2, "aiutare": 2, "aiuto": 2,
  "sostegno": 2, "supporto": 2, "collaborazione": 2, "armonia": 2,
  "chiarezza": 2, "lucido": 2, "focalizzato": 2, "determinato": 2,
  "coraggio": 2, "coraggioso": 2, "resiliente": 2, "resilienza": 2,

  // ═══ POSITIVO LIEVE (+1) ═══
  "ok": 1, "discreto": 1, "decente": 1, "accettabile": 1, "sufficiente": 1,
  "calmo": 1, "sereno": 1, "tranquillo": 1, "rilassato": 1, "pacifico": 1,
  "curioso": 1, "attento": 1, "presente": 1, "stabile": 1, "equilibrato": 1,
  "aperto": 1, "disponibile": 1, "gentile": 1, "cortese": 1, "cordiale": 1,
  "amichevole": 1, "simpatico": 1, "educato": 1, "paziente": 1,
  "lavorare": 1, "provare": 1, "tentare": 1, "cercare": 1, "scoprire": 1,
  "imparare": 1, "apprendere": 1, "capire": 1, "comprendere": 1,
  "ascoltare": 1, "condividere": 1, "partecipare": 1, "contribuire": 1,
  "sì": 1, "possibile": 1, "fattibile": 1, "realistico": 1, "concreto": 1,

  // ═══ NEGATIVO LIEVE (-1) ═══
  "abbastanza": -1, "così": -1, "solito": -1,
  "lento": -1, "difficoltoso": -1, "faticoso": -1, "pesante": -1,
  "incerto": -1, "dubbio": -1, "titubante": -1, "esitante": -1,
  "confuso": -1, "disorientato": -1, "perplesso": -1, "indeciso": -1,
  "stanco": -1, "affaticato": -1, "esausto": -1, "sfinito": -1,
  "annoiato": -1, "noia": -1, "monotono": -1, "ripetitivo": -1,
  "freddo": -1, "distante": -1, "distaccato": -1, "chiuso": -1,
  "complicato": -1, "complesso": -1, "difficile": -1,

  // ═══ NEGATIVO MEDIO (-2) ═══
  "male": -2, "cattivo": -2, "negativo": -2, "sbagliato": -2, "errore": -2,
  "errato": -2, "fallimento": -2, "fallito": -2, "sconfitta": -2,
  "problema": -2, "problemi": -2, "difficoltà": -2, "ostacolo": -2,
  "blocco": -2, "bloccato": -2, "fermo": -2, "immobile": -2,
  "triste": -2, "infelice": -2, "scontento": -2, "insoddisfatto": -2,
  "deluso": -2, "delusione": -2, "amareggiato": -2, "amaro": -2,
  "preoccupato": -2, "preoccupazione": -2, "ansioso": -2, "ansia": -2,
  "stressato": -2, "stress": -2, "teso": -2, "tensione": -2, "nervoso": -2,
  "arrabbiato": -2, "irritato": -2, "frustrato": -2, "frustrazione": -2,
  "seccato": -2, "infastidito": -2, "scocciato": -2,
  "paura": -2, "impaurito": -2, "timoroso": -2, "spaventato": -2,
  "solo": -2, "solitudine": -2, "isolato": -2, "abbandonato": -2,
  "incapace": -2, "inefficace": -2, "sterile": -2,
  "perdere": -2, "perduto": -2, "smarrito": -2, "vuoto": -2,
  "rifiutare": -2, "rifiutato": -2, "respinto": -2, "escluso": -2,
  "criticare": -2, "criticato": -2, "giudicato": -2, "attaccato": -2,
  "soffrire": -2, "sofferenza": -2, "dolore": -2,
  "mentire": -2, "menzogna": -2, "bugia": -2, "falso": -2, "falsità": -2,
  "conflitto": -2, "scontro": -2, "litigio": -2, "discussione": -2,
  "insicuro": -2, "insicurezza": -2, "fragile": -2, "vulnerabile": -2,

  // ═══ NEGATIVO FORTE (-3) ═══
  "pessimo": -3, "orribile": -3, "terribile": -3, "disastroso": -3,
  "catastrofico": -3, "tragico": -3, "devastante": -3, "atroce": -3,
  "odio": -3, "odiare": -3, "odiato": -3, "disgusto": -3, "disgustoso": -3,
  "disperato": -3, "disperazione": -3, "angoscia": -3, "angosciato": -3,
  "terrore": -3, "terrorizzato": -3, "panico": -3, "orrore": -3,
  "insopportabile": -3, "intollerabile": -3, "inaccettabile": -3,
  "distruggere": -3, "distrutto": -3, "rovinato": -3, "annientato": -3,
  "depressione": -3, "depresso": -3, "abbattuto": -3,
  "rabbia": -3, "furia": -3, "furioso": -3, "ira": -3, "indignato": -3,
  "umiliato": -3, "umiliazione": -3, "offeso": -3, "oltraggio": -3,
  "vergogna": -3, "vergognoso": -3, "disonorato": -3,
  "inutile": -3, "inservibile": -3, "nullo": -3,
};

// Normalizza score in [-1, 1] sul modello VADER compound:
// x / sqrt(x^2 + alpha), con alpha = 15 (fattore di smoothing).
const NORMALIZE_ALPHA = 15;
export function normalizeCompound(rawSum) {
  return rawSum / Math.sqrt(rawSum * rawSum + NORMALIZE_ALPHA);
}
