import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { WordCloud, KeywordRanking } from "../components/analytics/index.js";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";

/* ═══ SMART STEPS ═══ */
const SMART_STEPS = [
  {
    key: "S",
    label: "Specifico",
    color: "#0099E6",
    question: "Che cosa vorresti che fosse diverso, in concreto?",
    hint: "Descrivi nel dettaglio il cambiamento che vuoi ottenere, evitando espressioni vaghe.",
    placeholder: "Es. Voglio riuscire a delegare almeno 2 compiti a settimana al mio team…",
  },
  {
    key: "M",
    label: "Misurabile",
    color: "#7C3AED",
    question: "Come ti accorgerai che è cambiato?",
    hint: "Indica un indicatore concreto o un segnale osservabile che ti dirà che hai raggiunto l'obiettivo.",
    placeholder: "Es. Lo noterò quando il team completerà autonomamente almeno 2 task a settimana senza chiedermi supporto…",
  },
  {
    key: "A",
    label: "Raggiungibile",
    color: "#059669",
    question: "Cosa è realisticamente alla tua portata nei prossimi mesi?",
    hint: "Considera le tue risorse attuali (tempo, energia, competenze). Sii onesto con te stesso.",
    placeholder: "Es. Nei prossimi 3 mesi posso realisticamente dedicare 1 ora a settimana per fare formazione al team…",
  },
  {
    key: "R",
    label: "Rilevante",
    color: "#D97706",
    question: "Perché è importante per te?",
    hint: "Collega l'obiettivo ai tuoi valori o a un risultato più grande che ti stia a cuore.",
    placeholder: "Es. È importante perché voglio ridurre il mio livello di stress e avere più tempo per la strategia…",
  },
  {
    key: "T",
    label: "Temporizzato",
    color: "#DC2626",
    question: "Entro quando?",
    hint: "Definisci una scadenza precisa: una data o un momento specifico (es. fine trimestre, entro 6 settimane).",
    placeholder: "Es. Entro il 30 giugno, ovvero entro 3 mesi dall'oggi…",
  },
];

/* ═══ SUB-COMPONENTS ═══ */
function StepDot({ index, current, total }) {
  const done = index < current;
  const active = index === current;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: done ? BLUE : active ? BLUE : "#E5E7EB",
        border: `2px solid ${active ? BLUE : done ? BLUE : "#D1D5DB"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700,
        color: done || active ? "#FFF" : "#9CA3AF",
        transition: "all 0.25s",
      }}>
        {done ? "✓" : index + 1}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: active ? BLUE : done ? BLUE : "#9CA3AF" }}>
        {SMART_STEPS[index]?.key}
      </span>
    </div>
  );
}

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

/* ═══ MICRO-AZIONE ITEM ═══ */
function MicroActionRow({ action, onChange, onRemove }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <input
        value={action.text}
        onChange={e => onChange({ ...action, text: e.target.value })}
        placeholder="Descrivi il micro-passo (< 10 min)…"
        style={{
          flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8,
          padding: "8px 12px", fontSize: 14, fontFamily: FONT, outline: "none",
          color: "#1A2B3C", background: "#FAFCFF",
        }}
        onFocus={e => e.target.style.borderColor = BLUE}
        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
      />
      <select
        value={action.freq}
        onChange={e => onChange({ ...action, freq: e.target.value })}
        style={{
          border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 10px",
          fontSize: 13, fontFamily: FONT, outline: "none", background: "#FAFCFF",
          color: "#1A2B3C", cursor: "pointer",
        }}
      >
        <option value="quotidiana">Quotidiana</option>
        <option value="settimanale">Settimanale</option>
        <option value="mensile">Mensile</option>
      </select>
      <input
        type="date"
        value={action.startDate}
        onChange={e => onChange({ ...action, startDate: e.target.value })}
        style={{
          border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 10px",
          fontSize: 13, fontFamily: FONT, outline: "none", background: "#FAFCFF",
          color: "#1A2B3C",
        }}
        onFocus={e => e.target.style.borderColor = BLUE}
        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
      />
      <button
        onClick={onRemove}
        style={{
          background: "none", border: "1.5px solid #FCA5A5", borderRadius: 8,
          padding: "8px 10px", fontSize: 13, color: "#DC2626", cursor: "pointer",
          fontFamily: FONT,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
      >
        ✕
      </button>
    </div>
  );
}

/* ═══ EXPORT HELPER ═══ */
function buildExportText(vagueGoal, smart, scale, microActions) {
  const lines = [
    "═══════════════════════════════════",
    "OBIETTIVO SMART — Steering Change",
    "═══════════════════════════════════",
    "",
    `Desiderio vago: "${vagueGoal}"`,
    "",
  ];
  SMART_STEPS.forEach(s => {
    lines.push(`[${s.key}] ${s.label}`);
    lines.push(smart[s.key] || "(non compilato)");
    lines.push("");
  });
  lines.push("────────────────────────────────────");
  lines.push(`Scala attuale:  ${scale.current}/10`);
  lines.push(`Scala obiettivo: ${scale.target}/10`);
  lines.push("");
  if (microActions.length > 0) {
    lines.push("MICRO-AZIONI");
    microActions.forEach((a, i) => {
      lines.push(`${i + 1}. ${a.text} [${a.freq}] — inizio: ${a.startDate || "—"}`);
    });
  }
  return lines.join("\n");
}

/* ═══ MAIN COMPONENT ═══ */
export default function DalVagoAlloSMART({ onHome }) {
  const [phase, setPhase] = useState("intro"); // intro | smart | scale | actions | summary
  const [smartStep, setSmartStep] = useState(0); // 0–4
  const [vagueGoal, setVagueGoal] = useState("");
  const [smart, setSmart] = useState({ S: "", M: "", A: "", R: "", T: "" });
  const [scale, setScale] = useState({ current: 5, target: 8 });
  const [microActions, setMicroActions] = useState([
    { id: 1, text: "", freq: "quotidiana", startDate: "", notes: "" },
  ]);
  const [nextId, setNextId] = useState(2);

  /* ── helpers ── */
  const updateSmart = (key, val) => setSmart(prev => ({ ...prev, [key]: val }));

  const addMicroAction = () => {
    setMicroActions(prev => [...prev, { id: nextId, text: "", freq: "quotidiana", startDate: "", notes: "" }]);
    setNextId(n => n + 1);
  };
  const updateMicroAction = (id, updated) =>
    setMicroActions(prev => prev.map(a => a.id === id ? updated : a));
  const removeMicroAction = (id) =>
    setMicroActions(prev => prev.filter(a => a.id !== id));

  const handleExport = () => {
    const text = buildExportText(vagueGoal, smart, scale, microActions.filter(a => a.text.trim()));
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "obiettivo-smart.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const currentSmartStep = SMART_STEPS[smartStep];
  const canProceedSmart = smart[currentSmartStep?.key]?.trim().length > 0;
  const canProceedVague = vagueGoal.trim().length > 0;

  /* ══════════════ INTRO ══════════════ */
  if (phase === "intro") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar phase="Crea" exercise="Dal vago allo SMART" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 600, width: "100%", background: "#FFF", borderRadius: 20, padding: "48px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `${BLUE}14`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <span style={{ fontSize: 34 }}>🎯</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Dal vago allo SMART</h1>
            <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.7, marginBottom: 32 }}>
              Trasforma un desiderio vago in un obiettivo concreto e raggiungibile, seguendo il metodo SMART.
              Poi definisci la tua scala di avanzamento e i micro-passi per iniziare.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 36 }}>
              {SMART_STEPS.map(s => (
                <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: s.color }}>{s.key}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 32, textAlign: "left" }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#1A2B3C", display: "block", marginBottom: 8 }}>
                Qual è il tuo desiderio vago?
              </label>
              <Textarea
                value={vagueGoal}
                onChange={setVagueGoal}
                placeholder="Es. Vorrei stare meglio al lavoro…"
                rows={3}
              />
            </div>
            <button
              onClick={() => { if (canProceedVague) setPhase("smart"); }}
              disabled={!canProceedVague}
              style={{
                background: canProceedVague ? BLUE : "#E5E7EB", color: canProceedVague ? "#FFF" : "#9CA3AF",
                border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 16, fontWeight: 700,
                cursor: canProceedVague ? "pointer" : "default", fontFamily: FONT, transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (canProceedVague) e.currentTarget.style.background = BLUE_DARK; }}
              onMouseLeave={e => { if (canProceedVague) e.currentTarget.style.background = BLUE; }}
            >
              Inizia →
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ SMART STEPS ══════════════ */
  if (phase === "smart") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar
          phase="Crea" exercise="Dal vago allo SMART"
          subtitle={`${currentSmartStep.key} — ${currentSmartStep.label}`}
          onHome={onHome}
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {SMART_STEPS.map((_, i) => <StepDot key={i} index={i} current={smartStep} total={5} />)}
            </div>
          }
        />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 620, width: "100%", background: "#FFF", borderRadius: 20, padding: "44px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            {/* vague goal reminder */}
            <div style={{ background: "#F8FBFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 16px", marginBottom: 28, fontSize: 13, color: "#6B7280" }}>
              <span style={{ fontWeight: 600, color: "#1A2B3C" }}>Desiderio vago: </span>{vagueGoal}
            </div>

            {/* step header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${currentSmartStep.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: currentSmartStep.color, flexShrink: 0 }}>
                {currentSmartStep.key}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{currentSmartStep.label}</div>
                <div style={{ fontSize: 14, color: "#6B7280" }}>{currentSmartStep.hint}</div>
              </div>
            </div>

            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#1A2B3C" }}>
              {currentSmartStep.question}
            </div>
            <Textarea
              value={smart[currentSmartStep.key]}
              onChange={val => updateSmart(currentSmartStep.key, val)}
              placeholder={currentSmartStep.placeholder}
              rows={5}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
              <button
                onClick={() => { if (smartStep === 0) setPhase("intro"); else setSmartStep(s => s - 1); }}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                ← Indietro
              </button>
              <button
                onClick={() => {
                  if (!canProceedSmart) return;
                  if (smartStep < 4) setSmartStep(s => s + 1);
                  else { setSmartStep(0); setPhase("scale"); }
                }}
                disabled={!canProceedSmart}
                style={{
                  background: canProceedSmart ? BLUE : "#E5E7EB",
                  color: canProceedSmart ? "#FFF" : "#9CA3AF",
                  border: "none", borderRadius: 8, padding: "10px 24px",
                  fontSize: 14, fontWeight: 700, cursor: canProceedSmart ? "pointer" : "default",
                  fontFamily: FONT, transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (canProceedSmart) e.currentTarget.style.background = BLUE_DARK; }}
                onMouseLeave={e => { if (canProceedSmart) e.currentTarget.style.background = BLUE; }}
              >
                {smartStep < 4 ? "Avanti →" : "Continua →"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ SCALA ══════════════ */
  if (phase === "scale") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar phase="Crea" exercise="Dal vago allo SMART" subtitle="Scala 0–10" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 580, width: "100%", background: "#FFF", borderRadius: 20, padding: "44px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Dove ti trovi adesso?</h2>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 36, lineHeight: 1.6 }}>
              Su una scala da 0 a 10, valuta la tua situazione attuale rispetto all'obiettivo e dove vuoi arrivare.
            </p>

            {[
              { label: "Dove sei oggi?", key: "current", color: "#7C3AED" },
              { label: "Dove vuoi essere?", key: "target", color: BLUE },
            ].map(({ label, key, color }) => (
              <div key={key} style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 28, fontWeight: 800, color }}>{scale[key]}</span>
                </div>
                <input
                  type="range" min={0} max={10} step={1}
                  value={scale[key]}
                  onChange={e => setScale(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  style={{ width: "100%", accentColor: color, height: 6, cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#9CA3AF" }}>
                  <span>0</span><span>5</span><span>10</span>
                </div>
              </div>
            ))}

            {scale.target > scale.current && (
              <div style={{ background: `${BLUE}10`, border: `1px solid ${BLUE}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 14, color: BLUE }}>
                Il divario è di <strong>{scale.target - scale.current} punti</strong> — questo è il gap che il tuo piano dovrà colmare.
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setPhase("smart")}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                ← Indietro
              </button>
              <button
                onClick={() => setPhase("actions")}
                style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                onMouseLeave={e => e.currentTarget.style.background = BLUE}
              >
                Avanti →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ MICRO-AZIONI ══════════════ */
  if (phase === "actions") {
    const validActions = microActions.filter(a => a.text.trim());
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar phase="Crea" exercise="Dal vago allo SMART" subtitle="Micro-azioni" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", padding: "40px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", background: "#FFF", borderRadius: 20, padding: "44px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Micro-azioni</h2>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 10, lineHeight: 1.6 }}>
              Spezza il tuo obiettivo in passi minimi (ciascuno sotto i 10 minuti). Indica frequenza e data di inizio.
            </p>
            <div style={{ background: "#F8FBFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 16px", marginBottom: 28, fontSize: 13, color: "#6B7280" }}>
              <span style={{ fontWeight: 600, color: "#1A2B3C" }}>Obiettivo: </span>{vagueGoal}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <span style={{ flex: 1 }}>Micro-azione</span>
              <span style={{ width: 110 }}>Frequenza</span>
              <span style={{ width: 130 }}>Data inizio</span>
              <span style={{ width: 42 }}></span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {microActions.map(a => (
                <MicroActionRow
                  key={a.id}
                  action={a}
                  onChange={updated => updateMicroAction(a.id, updated)}
                  onRemove={() => removeMicroAction(a.id)}
                />
              ))}
            </div>

            <button
              onClick={addMicroAction}
              style={{ background: "none", border: `1.5px dashed ${BLUE}`, borderRadius: 8, padding: "9px 18px", fontSize: 14, fontWeight: 600, color: BLUE, cursor: "pointer", fontFamily: FONT, marginBottom: 36 }}
              onMouseEnter={e => e.currentTarget.style.background = `${BLUE}08`}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              + Aggiungi micro-azione
            </button>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setPhase("scale")}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                ← Indietro
              </button>
              <button
                onClick={() => setPhase("summary")}
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
  const validActions = microActions.filter(a => a.text.trim());
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
      <Navbar
        phase="Crea" exercise="Dal vago allo SMART" subtitle="Riepilogo"
        onHome={onHome}
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
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* header */}
          <div style={{ background: "#FFF", borderRadius: 16, padding: "28px 32px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Obiettivo</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{vagueGoal}</div>
            <div style={{ display: "flex", gap: 20 }}>
              {[{ label: "Situazione attuale", val: scale.current, color: "#7C3AED" }, { label: "Obiettivo", val: scale.target, color: BLUE }].map(({ label, val, color }) => (
                <div key={label} style={{ flex: 1, background: `${color}08`, borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color }}>{val}/10</div>
                </div>
              ))}
              <div style={{ flex: 1, background: "#F8FBFF", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 2 }}>Gap da colmare</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#1A2B3C" }}>{Math.max(0, scale.target - scale.current)} pt</div>
              </div>
            </div>
          </div>

          {/* SMART grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 14, marginBottom: 20 }}>
            {SMART_STEPS.map(s => (
              <div key={s.key} style={{ background: "#FFF", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderLeft: `4px solid ${s.color}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>[{s.key}]</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{s.label}</span>
                </div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{smart[s.key] || <em style={{ color: "#9CA3AF" }}>Non compilato</em>}</p>
              </div>
            ))}
          </div>

          {/* micro-actions */}
          {validActions.length > 0 && (
            <div style={{ background: "#FFF", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Micro-azioni ({validActions.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {validActions.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#F8FBFF", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${BLUE}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: BLUE, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ flex: 1, fontSize: 14, color: "#1A2B3C" }}>{a.text}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", background: "#E5E7EB", borderRadius: 6, padding: "2px 8px" }}>{a.freq}</span>
                    {a.startDate && <span style={{ fontSize: 12, color: "#9CA3AF" }}>{a.startDate}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analisi testuale automatica delle risposte SMART */}
          {(() => {
            const smartTexts = SMART_STEPS.map(s => smart[s.key]).filter(t => t && t.trim());
            const actionTexts = validActions.map(a => a.text).filter(Boolean);
            const allTexts = [...smartTexts, ...actionTexts];
            if (allTexts.length === 0) return null;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
                <WordCloud
                  texts={allTexts}
                  title="Parole chiave — obiettivo SMART e micro-azioni"
                  palette="byfreq"
                  maxWords={35}
                />
                <KeywordRanking
                  texts={allTexts}
                  title="Top concetti (TF-IDF)"
                  topN={8}
                />
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
