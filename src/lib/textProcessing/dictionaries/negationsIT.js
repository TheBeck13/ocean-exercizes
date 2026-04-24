// Negazioni italiane: capovolgono il segno del sentiment nei 3 token seguenti.
export const NEGATIONS_IT = new Set([
  "non","no","mai","niente","nulla","nessuno","nessuna","né",
  "senza","neanche","neppure","nemmeno","mica",
]);

// Intensificatori: amplificano il valore del sentiment del token seguente.
export const BOOSTERS_IT = {
  "molto": 1.5, "tanto": 1.4, "troppo": 1.4, "estremamente": 1.8,
  "decisamente": 1.5, "particolarmente": 1.4, "incredibilmente": 1.8,
  "parecchio": 1.3, "davvero": 1.3, "veramente": 1.3, "assai": 1.3,
  "fortemente": 1.5, "super": 1.5, "ultra": 1.6, "assolutamente": 1.5,
  "poco": 0.6, "leggermente": 0.6, "appena": 0.6, "pochissimo": 0.4,
};

// Finestra (in token) su cui si applica negazione / intensificatore.
export const MODIFIER_WINDOW = 3;
