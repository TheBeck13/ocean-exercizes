import { useState } from "react";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";

/* ═══ EXAMPLE GOALS ═══ */
const EXAMPLE_GOALS = [
  "Migliorare il mio equilibrio lavoro-vita privata",
  "Diventare un comunicatore più efficace",
  "Gestire meglio lo stress quotidiano",
  "Costruire relazioni professionali più solide",
  "Aumentare la mia capacità di delegare",
];

/* ═══ TIMELINE STEPS ═══ */
const STEPS = [
  {
    key: "months6",
    label: "Tra 6 mesi",
    sublabel: "Visione futura",
    color: "#7C3AED",
    question: "Tra 6 mesi, cosa sarà cambiato in meglio?",
    hint: "Descrivi la situazione futura in modo qualitativo. Immagina di guardarti dall'esterno: cosa vedi di diverso?",
    placeholder: "Es. Riesco a chiudere il laptop alle 18 almeno 3 giorni a settimana. Ho una routine serale che non include email di lavoro…",
    examples: [
      "Dormo 7 ore per almeno 8 notti su 10",
      "Tengo riunioni entro 60 minuti con agenda condivisa",
      "Dedico 2 ore a settimana a un'attività che mi ricarica",
      "Ho delegato almeno 2 responsabilità ricorrenti",
    ],
  },
  {
    key: "months3",
    label: "Tra 3 mesi",
    sublabel: "Punto di svolta",
    color: "#0099E6",
    question: "Cosa dovrà essere vero tra 3 mesi perché la visione a 6 mesi sia possibile?",
    hint: "Identifica le condizioni necessarie: cosa deve già funzionare o essere cambiato a metà percorso?",
    placeholder: "Es. Ho stabilito una routine settimanale fissa. Ho comunicato ai colleghi i miei orari di reperibilità…",
    examples: [
      "Ho rifiutato almeno 2 richieste non urgenti senza senso di colpa",
      "Uso un sistema di priorità condiviso con il mio team",
      "Ho avuto 3 conversazioni di feedback costruttivo",
      "Tengo un diario delle energy levels 3 volte a settimana",
    ],
  },
  {
    key: "month1",
    label: "Tra 1 mese",
    sublabel: "Primo traguardo",
    color: "#059669",
    question: "Cosa dovrà essere vero tra 1 mese?",
    hint: "Il primo segnale concreto che il cambiamento è in moto. Deve essere osservabile e verificabile.",
    placeholder: "Es. Ho bloccato in calendario 2 slot da 1 ora per attività personali. Ho fatto una conversazione sull'overload con il mio manager…",
    examples: [
      "Ho identificato le 3 attività che mi drenano più energia",
      "Ho provato almeno 1 tecnica nuova di gestione del tempo",
      "Ho scritto una lista delle cose che posso smettere di fare",
      "Ho avuto 1 conversazione difficile che rimandavo",
    ],
  },
  {
    key: "days7",
    label: "Nei prossimi 7 giorni",
    sublabel: "Primo passo",
    color: "#D97706",
    question: "Cosa puoi fare nei prossimi 7 giorni che vada in quella direzione?",
    hint: "Un'azione minima, concreta e fattibile con le risorse che hai già oggi. Non serve che sia grande.",
    placeholder: "Es. Domani mattina blocco 30 minuti in calendario per scrivere cosa voglio cambiare. Stasera spengo il telefono alle 21…",
    examples: [
      "Scrivo in 10 minuti cosa voglio osservare di me questa settimana",
      "Faccio una sola cosa diversa durante la prossima riunione",
      "Identifico una persona con cui condividere questo obiettivo",
      "Preparo una domanda da fare al mio coach/mentore",
    ],
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

function ExamplesBox({ examples, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: "none", border: "none", cursor: "pointer", fontFamily: FONT,
          fontSize: 13, color, fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 4,
        }}
      >
        <span style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>›</span>
        {open ? "Nascondi esempi di indicatori" : "Mostra esempi di indicatori concreti"}
      </button>
      {open && (
        <div style={{ marginTop: 8, background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Esempi di indicatori concreti
          </div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {examples.map((ex, i) => (
              <li key={i} style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 2 }}>{ex}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ═══ TIMELINE DOT ═══ */
function TimelineDot({ step, currentStep, filled }) {
  const s = STEPS[step];
  const done = step < currentStep || filled;
  const active = step === currentStep && !filled;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 64 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: done ? s.color : active ? s.color : "#E5E7EB",
        border: `2px solid ${done || active ? s.color : "#D1D5DB"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: done || active ? "#FFF" : "#9CA3AF",
        transition: "all 0.25s", flexShrink: 0,
      }}>
        {done ? "✓" : step + 1}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: done || active ? s.color : "#9CA3AF", textAlign: "center", lineHeight: 1.2 }}>
        {s.label}
      </span>
    </div>
  );
}

/* ═══ CONTEXT SIDEBAR ═══ */
function ContextSidebar({ formData, currentStep }) {
  const prevSteps = STEPS.slice(0, currentStep).filter(s => formData[s.key]?.trim());
  if (prevSteps.length === 0) return null;
  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
        Contesto precedente
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {prevSteps.map(s => (
          <div key={s.key} style={{ background: "#FFF", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${s.color}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
              {formData[s.key].slice(0, 120)}{formData[s.key].length > 120 ? "…" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ SUMMARY TIMELINE ═══ */
function SummaryTimeline({ changeGoal, formData, obstacles, planB }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* goal card */}
      <div style={{ background: "#FFF", borderRadius: 16, padding: "24px 28px", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Obiettivo di cambiamento</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1A2B3C" }}>{changeGoal}</div>
      </div>

      {/* vertical timeline */}
      <div style={{ position: "relative", paddingLeft: 40, marginBottom: 24 }}>
        {/* vertical line */}
        <div style={{ position: "absolute", left: 14, top: 16, bottom: 16, width: 2, background: "linear-gradient(to bottom, #7C3AED, #0099E6, #059669, #D97706)" }} />

        {STEPS.map((s, i) => (
          <div key={s.key} style={{ position: "relative", marginBottom: i < STEPS.length - 1 ? 20 : 0 }}>
            {/* dot */}
            <div style={{ position: "absolute", left: -32, top: 14, width: 18, height: 18, borderRadius: "50%", background: s.color, border: "3px solid #FFF", boxShadow: `0 0 0 2px ${s.color}` }} />
            <div style={{ background: "#FFF", borderRadius: 14, padding: "18px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 6, padding: "1px 6px" }}>{s.sublabel}</span>
              </div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {formData[s.key] || <em style={{ color: "#9CA3AF" }}>Non compilato</em>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* obstacles & plan B */}
      {(obstacles?.trim() || planB?.trim()) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {obstacles?.trim() && (
            <div style={{ background: "#FFF", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderTop: "3px solid #DC2626" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Ostacoli prevedibili</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{obstacles}</div>
            </div>
          )}
          {planB?.trim() && (
            <div style={{ background: "#FFF", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderTop: "3px solid #059669" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Piani B micro</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{planB}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function BackwardPlanning({ onHome }) {
  const [view, setView]           = useState("intro");     // intro | steps | obstacles | summary
  const [currentStep, setCurrentStep] = useState(0);       // 0–3
  const [changeGoal, setChangeGoal]   = useState("");
  const [formData, setFormData]       = useState({ months6: "", months3: "", month1: "", days7: "" });
  const [obstacles, setObstacles]     = useState("");
  const [planB, setPlanB]             = useState("");
  const [useExample, setUseExample]   = useState(null);

  const updateFormData = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const currentStepObj = STEPS[currentStep];
  const canProceedStep = formData[currentStepObj?.key]?.trim().length > 0;
  const canProceedVague = changeGoal.trim().length > 0;

  const handleExport = () => {
    const lines = [
      "═══════════════════════════════════",
      "BACKWARD PLANNING — Steering Change",
      "═══════════════════════════════════",
      "",
      `Obiettivo: "${changeGoal}"`,
      "",
      ...STEPS.map(s => [`▸ ${s.label}`, formData[s.key] || "(non compilato)", ""].flat()),
    ].flat();
    if (obstacles?.trim()) lines.push("Ostacoli prevedibili:", obstacles, "");
    if (planB?.trim()) lines.push("Piani B micro:", planB, "");
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "backward-planning.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ══════════════ INTRO ══════════════ */
  if (view === "intro") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar phase="Avviva" exercise="Backward Planning" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 620, width: "100%", background: "#FFF", borderRadius: 20, padding: "48px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `${BLUE}14`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 34, textAlign: "center" }}>
              ⏪
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Backward Planning</h1>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 28, textAlign: "center" }}>
              Parti dal futuro desiderato e costruisci il percorso all'indietro, un passo alla volta, fino a un'azione concreta per i prossimi 7 giorni.
            </p>

            {/* timeline preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, justifyContent: "center" }}>
              {STEPS.map((s, i) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${s.color}18`, border: `2px solid ${s.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: s.color }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap" }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 28, height: 2, background: "#E5E7EB", margin: "0 2px", marginBottom: 18 }} />
                  )}
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: 28, height: 2, background: "#E5E7EB", margin: "0 2px", marginBottom: 18 }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#DC262618", border: "2px solid #DC2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚠️</div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap" }}>Ostacoli</span>
                </div>
              </div>
            </div>

            {/* goal input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#1A2B3C", display: "block", marginBottom: 8 }}>
                Il tuo obiettivo di cambiamento (anche vago)
              </label>
              <textarea
                value={changeGoal}
                onChange={e => { setChangeGoal(e.target.value); setUseExample(null); }}
                placeholder="Es. Vorrei migliorare il mio equilibrio lavoro-vita privata…"
                rows={3}
                style={{
                  width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10,
                  padding: "12px 14px", fontSize: 15, fontFamily: FONT, lineHeight: 1.6,
                  resize: "vertical", outline: "none", color: "#1A2B3C", background: "#FAFCFF",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"}
              />
            </div>

            {/* example pills */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", marginBottom: 8 }}>Oppure scegli un esempio:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EXAMPLE_GOALS.map((eg, i) => (
                  <button
                    key={i}
                    onClick={() => { setChangeGoal(eg); setUseExample(i); }}
                    style={{
                      border: `1.5px solid ${useExample === i ? BLUE : "#E2E8F0"}`,
                      background: useExample === i ? `${BLUE}10` : "#FFF",
                      color: useExample === i ? BLUE : "#6B7280",
                      borderRadius: 20, padding: "5px 12px", fontSize: 13, fontWeight: useExample === i ? 700 : 500,
                      cursor: "pointer", fontFamily: FONT, transition: "all 0.15s",
                    }}
                  >
                    {eg}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => { if (canProceedVague) setView("steps"); }}
                disabled={!canProceedVague}
                style={{
                  background: canProceedVague ? BLUE : "#E5E7EB",
                  color: canProceedVague ? "#FFF" : "#9CA3AF",
                  border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 16, fontWeight: 700,
                  cursor: canProceedVague ? "pointer" : "default", fontFamily: FONT, transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (canProceedVague) e.currentTarget.style.background = BLUE_DARK; }}
                onMouseLeave={e => { if (canProceedVague) e.currentTarget.style.background = BLUE; }}
              >
                Inizia dalla visione →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ STEPS ══════════════ */
  if (view === "steps") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar
          phase="Avviva" exercise="Backward Planning"
          subtitle={currentStepObj.label}
          onHome={onHome}
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {STEPS.map((_, i) => (
                <TimelineDot
                  key={i} step={i}
                  currentStep={currentStep}
                  filled={false}
                />
              ))}
            </div>
          }
        />
        <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 24 }}>
            {/* context sidebar */}
            <ContextSidebar formData={formData} currentStep={currentStep} />

            {/* main card */}
            <div style={{ flex: 1 }}>
              <div style={{ background: "#FFF", borderRadius: 20, padding: "36px 40px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                {/* goal reminder */}
                <div style={{ background: "#F8FBFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 16px", marginBottom: 26, fontSize: 13, color: "#6B7280" }}>
                  <span style={{ fontWeight: 600, color: "#1A2B3C" }}>Obiettivo: </span>{changeGoal}
                </div>

                {/* step header */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${currentStepObj.color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: currentStepObj.color }}>{currentStep + 1}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: currentStepObj.color }}>{currentStepObj.label}</div>
                    <div style={{ fontSize: 13, color: "#6B7280" }}>{currentStepObj.sublabel} — {currentStepObj.hint}</div>
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#1A2B3C" }}>
                  {currentStepObj.question}
                </div>
                <Textarea
                  value={formData[currentStepObj.key]}
                  onChange={val => updateFormData(currentStepObj.key, val)}
                  placeholder={currentStepObj.placeholder}
                  rows={5}
                />
                <ExamplesBox examples={currentStepObj.examples} color={currentStepObj.color} />

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                  <button
                    onClick={() => { if (currentStep === 0) setView("intro"); else setCurrentStep(s => s - 1); }}
                    style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
                  >
                    ← Indietro
                  </button>
                  <button
                    onClick={() => {
                      if (!canProceedStep) return;
                      if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
                      else setView("obstacles");
                    }}
                    disabled={!canProceedStep}
                    style={{
                      background: canProceedStep ? currentStepObj.color : "#E5E7EB",
                      color: canProceedStep ? "#FFF" : "#9CA3AF",
                      border: "none", borderRadius: 8, padding: "10px 24px",
                      fontSize: 14, fontWeight: 700, cursor: canProceedStep ? "pointer" : "default",
                      fontFamily: FONT, transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { if (canProceedStep) e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={e => { if (canProceedStep) e.currentTarget.style.opacity = "1"; }}
                  >
                    {currentStep < STEPS.length - 1 ? `Avanti: ${STEPS[currentStep + 1]?.label} →` : "Ostacoli e piani B →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ OBSTACLES ══════════════ */
  if (view === "obstacles") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar phase="Avviva" exercise="Backward Planning" subtitle="Ostacoli e Piani B" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 620, width: "100%", background: "#FFF", borderRadius: 20, padding: "40px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ostacoli e Piani B</h2>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 28, lineHeight: 1.6 }}>
              Anticipa le resistenze e prepara micro-alternative. Non serve avere tutte le risposte — basta riconoscere i rischi e avere un'idea di riserva.
            </p>

            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8, color: "#DC2626" }}>
                ⚠️ Ostacoli prevedibili
              </label>
              <Textarea
                value={obstacles}
                onChange={setObstacles}
                placeholder="Es. Mancanza di tempo, resistenza dei colleghi, ricadere nelle vecchie abitudini in momenti di stress…"
                rows={4}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 8, color: "#059669" }}>
                🔄 Piani B micro
              </label>
              <Textarea
                value={planB}
                onChange={setPlanB}
                placeholder="Es. Se salto un giorno, non resetto tutto: faccio solo 5 minuti. Se un collega non collabora, cerco un alleato diverso…"
                rows={4}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => { setCurrentStep(STEPS.length - 1); setView("steps"); }}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                ← Indietro
              </button>
              <button
                onClick={() => setView("summary")}
                style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                onMouseLeave={e => e.currentTarget.style.background = BLUE}
              >
                Vedi la timeline →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ SUMMARY ══════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
      <Navbar
        phase="Avviva" exercise="Backward Planning" subtitle="Timeline" onHome={onHome}
        right={
          <button
            onClick={handleExport}
            style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
            onMouseLeave={e => e.currentTarget.style.background = BLUE}
          >
            ↓ Esporta
          </button>
        }
      />
      <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
        <SummaryTimeline
          changeGoal={changeGoal}
          formData={formData}
          obstacles={obstacles}
          planB={planB}
        />
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <button
            onClick={() => { setView("intro"); setCurrentStep(0); setFormData({ months6: "", months3: "", month1: "", days7: "" }); setObstacles(""); setPlanB(""); setChangeGoal(""); setUseExample(null); }}
            style={{ background: "none", border: `1.5px solid ${BLUE}`, color: BLUE, borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.background = `${BLUE}10`}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            ↺ Ricomincia con un nuovo obiettivo
          </button>
        </div>
      </main>
    </div>
  );
}
