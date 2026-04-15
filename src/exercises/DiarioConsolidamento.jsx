import { useState } from "react";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const GREEN = "#059669";
const FONT = "'Source Sans 3', sans-serif";

/* ═══ EXAMPLE HABITS ═══ */
const EXAMPLE_HABITS = [
  {
    behavior: "Fare 10 minuti di stretching",
    anchor: "Subito dopo il caffè mattutino",
    micro: "Anche solo 2 minuti di respiro profondo",
    signal: "Mi sento meno teso nelle spalle verso le 10",
  },
  {
    behavior: "Scrivere 3 cose positive della giornata",
    anchor: "Prima di spegnere il computer la sera",
    micro: "Anche una sola cosa, su un post-it",
    signal: "Il post-it è sul tavolo al mattino seguente",
  },
  {
    behavior: "Delegare almeno una task al giorno",
    anchor: "Durante la riunione del mattino",
    micro: "Chiedere a un collega di tenere il verbale",
    signal: "Ho completato qualcosa di strategico entro le 11",
  },
  {
    behavior: "Fare una pausa di 5 minuti ogni 90 min",
    anchor: "Quando suona l'allarme del timer",
    micro: "Alzarsi e guardare fuori dalla finestra",
    signal: "Mi ricordo di aver fatto almeno 2 pause nel pomeriggio",
  },
];

/* ═══ WIZARD STEPS ═══ */
const WIZARD_STEPS = [
  {
    key: "behavior",
    label: "Nuovo comportamento",
    color: BLUE,
    question: "Qual è il nuovo comportamento da consolidare?",
    hint: "Descrivi in modo specifico e osservabile il comportamento che vuoi stabilizzare.",
    placeholder: "Es. Fare 10 minuti di stretching ogni mattina prima di iniziare a lavorare…",
  },
  {
    key: "anchor",
    label: "Gancio alla routine",
    color: "#7C3AED",
    question: "A quale routine esistente puoi agganciarlo?",
    hint: "Le nuove abitudini attecchiscono meglio se collegate a qualcosa che già fai automaticamente.",
    placeholder: "Es. Subito dopo il caffè mattutino, prima di aprire il computer…",
  },
  {
    key: "micro",
    label: "Versione minima",
    color: GREEN,
    question: "Qual è la versione minima sostenibile dell'azione?",
    hint: "Se non riesci a fare la versione completa, qual è il passo più piccolo che conta comunque?",
    placeholder: "Es. Anche solo 2 minuti di respiro profondo con gli occhi chiusi…",
  },
  {
    key: "context",
    label: "Quando, dove, con chi",
    color: "#D97706",
    question: "Definisci il contesto preciso: quando, dove e con chi?",
    hint: "Più specifico è il contesto, più alta è la probabilità che l'azione avvenga.",
    placeholder: "Es. Ogni mattina dalle 8:00 alle 8:10, in salotto, da solo prima che gli altri si sveglino…",
  },
  {
    key: "signal",
    label: "Segnale di successo",
    color: "#0099E6",
    question: "Come ti accorgerai che stai mantenendo l'impegno?",
    hint: "Identifica un segnale osservabile, non un giudizio su te stesso.",
    placeholder: "Es. Mi sento meno teso nelle spalle verso le 10. Il quaderno è aperto sulla scrivania…",
  },
  {
    key: "fallback",
    label: "Piano anti-ricaduta",
    color: "#DC2626",
    question: "Cosa fai se salti un giorno?",
    hint: "Il piano anti-ricaduta non è una punizione: è un impegno non giudicante a ricominciare.",
    placeholder: "Es. Non resetto tutto: il giorno dopo faccio solo la versione minima. Non mi chiedo perché, ricomincio e basta…",
  },
  {
    key: "mechanism",
    label: "Meccanismo di blocco",
    color: "#DB2777",
    question: "Qual è il meccanismo che ha fatto sì che non lo attuassi finora?",
    hint: "Cosa si mette di traverso? Un pensiero, una sensazione, un'abitudine contraria?",
    placeholder: "Es. Appena apro il telefono la mattina vengo distratto dalle notifiche e perdo il momento giusto…",
  },
  {
    key: "replacement",
    label: "Comportamento sostitutivo",
    color: "#6B7280",
    question: "Cosa hai fatto al posto di questo comportamento?",
    hint: "Identificare il comportamento sostitutivo aiuta a capire cosa deve lasciare spazio alla nuova abitudine.",
    placeholder: "Es. Ho scrollato i social per 20 minuti, ho controllato le email non urgenti, ho aspettato di 'sentirmi pronto'…",
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

function StepDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => {
        const s = WIZARD_STEPS[i];
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{
            width: done || active ? 10 : 8, height: done || active ? 10 : 8,
            borderRadius: "50%",
            background: done ? s.color : active ? s.color : "#E5E7EB",
            transition: "all 0.2s", opacity: done ? 0.7 : 1,
          }} />
        );
      })}
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function DiarioConsolidamento({ onHome }) {
  const [view, setView] = useState("intro");   // intro | wizard | reflection | summary
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(
    Object.fromEntries(WIZARD_STEPS.map(s => [s.key, ""]))
  );
  const [coachReflection, setCoachReflection] = useState("");
  const [exampleUsed, setExampleUsed] = useState(null);

  const currentStep = WIZARD_STEPS[step];
  const canProceed = formData[currentStep?.key]?.trim().length > 0;

  const applyExample = (ex) => {
    setFormData(prev => ({ ...prev, ...ex }));
    setExampleUsed(ex);
  };

  const handleExport = () => {
    const lines = [
      "═══════════════════════════════════",
      "DIARIO DI CONSOLIDAMENTO — Steering Change",
      "═══════════════════════════════════",
      "",
      ...WIZARD_STEPS.map(s => [`▸ ${s.label}`, formData[s.key] || "(non compilato)", ""]).flat(),
      "▸ Riflessione del coach",
      coachReflection || "(non compilato)",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "diario-consolidamento.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ══════════════ INTRO ══════════════ */
  if (view === "intro") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar phase="Nutri" exercise="Diario di Consolidamento" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", padding: "40px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ background: "#FFF", borderRadius: 20, padding: "44px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", marginBottom: 24 }}>
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 16 }}>🌱</div>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Diario di Consolidamento</h1>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, textAlign: "center", maxWidth: 500, margin: "0 auto 32px" }}>
                Costruisci un piano strutturato per stabilizzare un nuovo comportamento, agganciandolo a routine esistenti e preparandoti alle ricadute.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
                {WIZARD_STEPS.map(s => (
                  <span key={s.key} style={{ fontSize: 12, fontWeight: 600, color: s.color, background: `${s.color}12`, borderRadius: 20, padding: "4px 12px" }}>
                    {s.label}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => setView("wizard")}
                  style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                  onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                  onMouseLeave={e => e.currentTarget.style.background = BLUE}
                >
                  Inizia →
                </button>
              </div>
            </div>

            {/* examples library */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2B3C", marginBottom: 14 }}>
                📚 Libreria di esempi — oppure parti da uno di questi:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                {EXAMPLE_HABITS.map((ex, i) => (
                  <div
                    key={i}
                    onClick={() => { applyExample(ex); setView("wizard"); setStep(0); }}
                    style={{
                      background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "18px 20px",
                      cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.boxShadow = "0 4px 16px rgba(5,150,105,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"; }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{ex.behavior}</div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>Gancio: <span style={{ color: "#374151" }}>{ex.anchor}</span></div>
                    <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: GREEN }}>Usa come esempio →</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ WIZARD ══════════════ */
  if (view === "wizard") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar
          phase="Nutri" exercise="Diario di Consolidamento"
          subtitle={`${step + 1}/${WIZARD_STEPS.length} — ${currentStep.label}`}
          onHome={onHome}
          right={<StepDots current={step} total={WIZARD_STEPS.length} />}
        />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 24px" }}>
          <div style={{ maxWidth: 620, width: "100%", background: "#FFF", borderRadius: 20, padding: "40px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            {/* behavior reminder */}
            {step > 0 && formData.behavior && (
              <div style={{ background: "#F8FBFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 16px", marginBottom: 24, fontSize: 13, color: "#6B7280" }}>
                <span style={{ fontWeight: 600, color: "#1A2B3C" }}>Comportamento: </span>{formData.behavior}
              </div>
            )}

            {/* step header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${currentStep.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: currentStep.color, flexShrink: 0 }}>
                {step + 1}
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700 }}>{currentStep.label}</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 1 }}>{currentStep.hint}</div>
              </div>
            </div>

            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#1A2B3C" }}>{currentStep.question}</div>
            <Textarea
              value={formData[currentStep.key]}
              onChange={val => setFormData(prev => ({ ...prev, [currentStep.key]: val }))}
              placeholder={currentStep.placeholder}
              rows={4}
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
              <button
                onClick={() => { if (step === 0) setView("intro"); else setStep(s => s - 1); }}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                ← Indietro
              </button>
              <button
                onClick={() => { if (!canProceed) return; if (step < WIZARD_STEPS.length - 1) setStep(s => s + 1); else setView("reflection"); }}
                disabled={!canProceed}
                style={{
                  background: canProceed ? currentStep.color : "#E5E7EB",
                  color: canProceed ? "#FFF" : "#9CA3AF",
                  border: "none", borderRadius: 8, padding: "10px 24px",
                  fontSize: 14, fontWeight: 700, cursor: canProceed ? "pointer" : "default",
                  fontFamily: FONT, transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (canProceed) e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {step < WIZARD_STEPS.length - 1 ? "Avanti →" : "Riflessione finale →"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ REFLECTION ══════════════ */
  if (view === "reflection") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar phase="Nutri" exercise="Diario di Consolidamento" subtitle="Riflessione del coach" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 24px" }}>
          <div style={{ maxWidth: 580, width: "100%", background: "#FFF", borderRadius: 20, padding: "40px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${GREEN}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20 }}>🪞</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Riflessione del coach</h2>
            <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 24 }}>
              Come hai aiutato il coachee a concentrarsi sull'<strong>impegno</strong>, non sulla perfezione del risultato? Cosa hai notato nel suo modo di parlare del cambiamento?
            </p>
            <Textarea
              value={coachReflection}
              onChange={setCoachReflection}
              placeholder="Es. Ho notato che il coachee si focalizzava molto sull'esito ('se non riesco ogni giorno è un fallimento'). Ho spostato l'attenzione sul gancio e sulla versione minima, chiedendo 'cosa conta come un passo?'…"
              rows={6}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
              <button
                onClick={() => { setStep(WIZARD_STEPS.length - 1); setView("wizard"); }}
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
                Vedi riepilogo →
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
        phase="Nutri" exercise="Diario di Consolidamento" subtitle="Riepilogo" onHome={onHome}
        right={
          <button onClick={handleExport} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
            onMouseLeave={e => e.currentTarget.style.background = BLUE}>
            ↓ Esporta
          </button>
        }
      />
      <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14, marginBottom: 16 }}>
            {WIZARD_STEPS.map(s => (
              <div key={s.key} style={{ background: "#FFF", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                  {formData[s.key] || <em style={{ color: "#9CA3AF" }}>Non compilato</em>}
                </div>
              </div>
            ))}
          </div>
          {coachReflection && (
            <div style={{ background: "#FFF", borderRadius: 14, padding: "20px 24px", marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderTop: `3px solid ${GREEN}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Riflessione del coach</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{coachReflection}</div>
            </div>
          )}
          <button
            onClick={() => { setFormData(Object.fromEntries(WIZARD_STEPS.map(s => [s.key, ""]))); setCoachReflection(""); setStep(0); setView("intro"); }}
            style={{ background: "none", border: `1.5px solid ${BLUE}`, color: BLUE, borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.background = `${BLUE}10`}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            ↺ Nuovo piano
          </button>
        </div>
      </main>
    </div>
  );
}
