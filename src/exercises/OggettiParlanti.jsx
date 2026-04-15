import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const PURPLE = "#7C3AED";
const FONT = "'Source Sans 3', sans-serif";
const LS_KEY = "oggetti-parlanti-archivio";

/* ═══ OBJECTS CATALOG ═══ */
const OGGETTI = [
  { id: "matita",   emoji: "✏️",  label: "Matita",    hint: "Strumento di precisione, correggibile, crea tracce." },
  { id: "sedia",    emoji: "🪑",  label: "Sedia",     hint: "Sostegno, postura, pausa — ciò che ci tiene." },
  { id: "chiave",   emoji: "🔑",  label: "Chiave",    hint: "Apertura, accesso, soluzione nascosta." },
  { id: "elastico", emoji: "🤸", label: "Elastico",  hint: "Flessibilità, tensione, capacità di tornare." },
  { id: "pietra",   emoji: "🪨",  label: "Pietra",    hint: "Solidità, peso, permanenza." },
  { id: "bussola",  emoji: "🧭",  label: "Bussola",   hint: "Orientamento, direzione, valori." },
  { id: "candela",  emoji: "🕯️", label: "Candela",   hint: "Luce, durata, trasformazione." },
  { id: "specchio", emoji: "🪞",  label: "Specchio",  hint: "Riflessione, identità, percezione." },
  { id: "forbici",  emoji: "✂️", label: "Forbici",   hint: "Taglio, decisione, separazione." },
  { id: "ancora",   emoji: "⚓",  label: "Ancora",    hint: "Stabilità, radici, blocco." },
  { id: "bandiera", emoji: "🚩",  label: "Bandiera",  hint: "Segnale, obiettivo, traguardo." },
  { id: "orologio", emoji: "⏱️", label: "Orologio",  hint: "Tempo, ritmo, urgenza." },
];

/* ═══ REFLECTION QUESTIONS ═══ */
const DOMANDE = [
  {
    key: "q1",
    label: "Oggetto e obiettivo",
    question: (obj) => `Se ${obj.label} fosse il tuo modo di lavorare sul tuo obiettivo, cosa direbbe di te?`,
    placeholder: "Scrivi cosa l'oggetto rivela del tuo approccio all'obiettivo…",
  },
  {
    key: "q2",
    label: "Risorse e skill-gap",
    question: (obj) => `Se fossi ${obj.label}, l'obiettivo sarebbe facile o difficile? Dove vedi un possibile skill-gap?`,
    placeholder: "Identifica una competenza o risorsa che ti manca…",
  },
  {
    key: "q3",
    label: "Domanda di self-coaching",
    question: () => "Che domanda ti faresti (self-coaching) se scegliessi questo oggetto?",
    placeholder: "Es. \"Che cosa mi serve per sbloccarmi?\" — scrivi una domanda che ti apra nuove possibilità…",
  },
];

/* ═══ SUB-COMPONENTS ═══ */
function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10,
        padding: "12px 14px", fontSize: 15, fontFamily: FONT, lineHeight: 1.6,
        resize: "vertical", outline: "none", color: "#1A2B3C",
        background: "#FAFCFF", transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = BLUE}
      onBlur={e => e.target.style.borderColor = "#E2E8F0"}
    />
  );
}

/* ═══ ARCHIVE PANEL ═══ */
function ArchivePanel({ archive, onDelete }) {
  if (archive.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF", fontSize: 14 }}>
        Nessuna metafora salvata ancora.<br />Completa un esercizio e salvala qui.
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {archive.map((entry, i) => (
        <div key={entry.savedAt} style={{ background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{entry.emoji}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{entry.label}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{new Date(entry.savedAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>
            <button
              onClick={() => onDelete(i)}
              style={{ background: "none", border: "1px solid #FCA5A5", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#DC2626", cursor: "pointer", fontFamily: FONT }}
              onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              Rimuovi
            </button>
          </div>
          {DOMANDE.map(d => (
            <div key={d.key} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 2 }}>{d.label}</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, background: "#F8FBFF", borderRadius: 8, padding: "8px 12px" }}>
                {entry.answers[d.key] || <em style={{ color: "#9CA3AF" }}>Non compilato</em>}
              </div>
            </div>
          ))}
          {entry.coachQuestions?.trim() && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: PURPLE, marginBottom: 2 }}>Domande di coaching</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, background: "#F5F3FF", borderRadius: 8, padding: "8px 12px", whiteSpace: "pre-wrap" }}>
                {entry.coachQuestions}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function OggettiParlanti({ onHome }) {
  const [view, setView] = useState("grid"); // grid | reflect | summary | archive
  const [selectedObj, setSelectedObj] = useState(null);
  const [reflectStep, setReflectStep] = useState(0); // 0–2
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [coachQuestions, setCoachQuestions] = useState("");
  const [archive, setArchive] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(archive));
  }, [archive]);

  const reset = () => {
    setSelectedObj(null);
    setReflectStep(0);
    setAnswers({ q1: "", q2: "", q3: "" });
    setCoachQuestions("");
    setView("grid");
  };

  const saveToArchive = () => {
    const entry = { ...selectedObj, answers, coachQuestions, savedAt: Date.now() };
    setArchive(prev => [entry, ...prev]);
    setView("summary");
  };

  const deleteFromArchive = (i) =>
    setArchive(prev => prev.filter((_, idx) => idx !== i));

  const currentDomanda = DOMANDE[reflectStep];
  const canProceed = answers[currentDomanda?.key]?.trim().length > 0;

  /* ══════════════ GRID ══════════════ */
  if (view === "grid") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar
          phase="Crea" exercise="Oggetti Parlanti" onHome={onHome}
          right={
            <button
              onClick={() => setView("archive")}
              style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT, position: "relative" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
            >
              📚 Archivio{archive.length > 0 ? ` (${archive.length})` : ""}
            </button>
          }
        />
        <main style={{ flex: 1, overflow: "auto", padding: "40px 24px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Oggetti Parlanti</h1>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 36, lineHeight: 1.6, maxWidth: 540 }}>
              Scegli un oggetto. Usalo come metafora per esplorare il tuo obiettivo, le tue risorse e i possibili blocchi.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
              {OGGETTI.map(obj => (
                <div
                  key={obj.id}
                  onClick={() => { setSelectedObj(obj); setView("reflect"); setReflectStep(0); setAnswers({ q1: "", q2: "", q3: "" }); setCoachQuestions(""); }}
                  style={{
                    background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 16,
                    padding: "20px 14px", textAlign: "center", cursor: "pointer",
                    transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,153,230,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: 40, marginBottom: 10 }}>{obj.emoji}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{obj.label}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.4 }}>{obj.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ REFLECT ══════════════ */
  if (view === "reflect") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar
          phase="Crea" exercise="Oggetti Parlanti"
          subtitle={selectedObj.label}
          onHome={onHome}
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {DOMANDE.map((_, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: i < reflectStep ? BLUE : i === reflectStep ? BLUE : "#E5E7EB",
                  border: `2px solid ${i <= reflectStep ? BLUE : "#D1D5DB"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: i <= reflectStep ? "#FFF" : "#9CA3AF",
                }}>
                  {i < reflectStep ? "✓" : i + 1}
                </div>
              ))}
            </div>
          }
        />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 620, width: "100%", background: "#FFF", borderRadius: 20, padding: "44px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            {/* object banner */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 30 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `${BLUE}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>
                {selectedObj.emoji}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedObj.label}</div>
                <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>{selectedObj.hint}</div>
              </div>
            </div>

            {/* question */}
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              Domanda {reflectStep + 1} di {DOMANDE.length} — {currentDomanda.label}
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 16, color: "#1A2B3C", lineHeight: 1.5 }}>
              {currentDomanda.question(selectedObj)}
            </div>
            <Textarea
              value={answers[currentDomanda.key]}
              onChange={val => setAnswers(prev => ({ ...prev, [currentDomanda.key]: val }))}
              placeholder={currentDomanda.placeholder}
              rows={5}
            />

            {/* coach questions — shown on last step */}
            {reflectStep === 2 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#1A2B3C" }}>
                  Scrivi 3 domande di coaching collegate a {selectedObj.label}:
                </div>
                <Textarea
                  value={coachQuestions}
                  onChange={setCoachQuestions}
                  placeholder={"1. …\n2. …\n3. …"}
                  rows={4}
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
              <button
                onClick={() => { if (reflectStep === 0) setView("grid"); else setReflectStep(s => s - 1); }}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                ← Indietro
              </button>
              <button
                onClick={() => { if (!canProceed) return; if (reflectStep < 2) setReflectStep(s => s + 1); else saveToArchive(); }}
                disabled={!canProceed}
                style={{
                  background: canProceed ? BLUE : "#E5E7EB", color: canProceed ? "#FFF" : "#9CA3AF",
                  border: "none", borderRadius: 8, padding: "10px 24px",
                  fontSize: 14, fontWeight: 700, cursor: canProceed ? "pointer" : "default",
                  fontFamily: FONT, transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = BLUE_DARK; }}
                onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = BLUE; }}
              >
                {reflectStep < 2 ? "Avanti →" : "Salva metafora ✓"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ SUMMARY ══════════════ */
  if (view === "summary") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar phase="Crea" exercise="Oggetti Parlanti" subtitle="Riepilogo" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>{selectedObj.emoji}</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Metafora: {selectedObj.label}</h2>
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>Salvata nell'archivio</p>
            </div>

            {DOMANDE.map(d => (
              <div key={d.key} style={{ background: "#FFF", borderRadius: 14, padding: "22px 26px", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{d.label}</div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{answers[d.key]}</div>
              </div>
            ))}

            {coachQuestions.trim() && (
              <div style={{ background: "#FFF", borderRadius: 14, padding: "22px 26px", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderLeft: `4px solid ${PURPLE}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: PURPLE, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Domande di coaching</div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{coachQuestions}</div>
              </div>
            )}

            {/* placeholder */}
            <div style={{ background: "#FFFBEB", border: "1.5px dashed #FCD34D", borderRadius: 14, padding: "18px 24px", fontSize: 14, color: "#92400E", marginBottom: 24 }}>
              Inserisci qui feature del prof — Sentiment analysis e word cloud per evidenziare risorse e blocchi nelle risposte
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                onMouseLeave={e => e.currentTarget.style.background = BLUE}
              >
                Scegli un altro oggetto
              </button>
              <button
                onClick={() => setView("archive")}
                style={{ background: "none", border: `1.5px solid ${BLUE}`, color: BLUE, borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.background = `${BLUE}10`}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                📚 Archivio
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ ARCHIVE ══════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
      <Navbar
        phase="Crea" exercise="Oggetti Parlanti" subtitle="Archivio metafore" onHome={onHome}
        right={
          <button
            onClick={reset}
            style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
            onMouseLeave={e => e.currentTarget.style.background = BLUE}
          >
            + Nuova metafora
          </button>
        }
      />
      <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Archivio metafore</h2>
          <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 28 }}>
            Le tue metafore salvate — consultale prima di una sessione per trarre ispirazione.
          </p>
          <ArchivePanel archive={archive} onDelete={deleteFromArchive} />
        </div>
      </main>
    </div>
  );
}
