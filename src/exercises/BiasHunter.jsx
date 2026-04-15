import { useState } from "react";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";

/* ═══ BIAS DATA ═══ */
const BIASES = [
  {
    id: "conferma",
    name: "Bias di Conferma",
    emoji: "🔍",
    color: "#7C3AED",
    description:
      "Tendiamo a cercare, interpretare e ricordare le informazioni in modo da confermare ciò che già crediamo. Ignoriamo o sminuiamo i dati che contraddicono le nostre aspettative.",
    example:
      "Un manager è convinto che un collaboratore sia poco motivato e nota solo i ritardi, ignorando i contributi positivi quotidiani.",
  },
  {
    id: "ancoraggio",
    name: "Bias di Ancoraggio",
    emoji: "⚓",
    color: "#059669",
    description:
      "La prima informazione ricevuta (l'ancora) influenza in modo sproporzionato tutte le valutazioni successive, anche quando quella stima iniziale era arbitraria o irrilevante.",
    example:
      'Un coach sente dire "è una persona rigida" prima di incontrare il coachee e fatica a vedere la flessibilità che emerge nella sessione.',
  },
  {
    id: "groupthink",
    name: "Groupthink",
    emoji: "👥",
    color: "#D97706",
    description:
      "All'interno di un gruppo coeso, il desiderio di armonia e conformità prevale sul pensiero critico individuale, portando a decisioni non ottimali che nessuno avrebbe preso da solo.",
    example:
      "In un team di coach, nessuno mette in discussione l'approccio scelto per paura di rompere il consenso, anche quando ci sono dubbi evidenti.",
  },
  {
    id: "effetto-alone",
    name: "Effetto Alone",
    emoji: "✨",
    color: "#DC2626",
    description:
      "Un tratto positivo (o negativo) di una persona colora la nostra percezione di tutte le sue altre caratteristiche. Una prima impressione brillante porta a sopravvalutare anche competenze non dimostrate.",
    example:
      'Un coachee comunicativo e carismatico viene valutato come "sicuramente capace" anche in aree che non ha mai mostrato.',
  },
  {
    id: "status-quo",
    name: "Bias dello Status Quo",
    emoji: "🔄",
    color: "#DB2777",
    description:
      "Preferiamo la situazione attuale rispetto al cambiamento, anche quando il cambiamento sarebbe oggettivamente vantaggioso. Le perdite percepite pesano più dei guadagni attesi.",
    example:
      "Un coach continua a usare lo stesso schema di domande pur notando che non produce insight, perché cambiarlo sembra rischioso.",
  },
];

const EMPTY_ENTRY = () => ({ example: "", decision: "", alternative: "", impact: "" });

/* ═══ SUB-COMPONENTS ═══ */
function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8,
        padding: "10px 12px", fontSize: 14, fontFamily: FONT, lineHeight: 1.55,
        resize: "vertical", outline: "none", color: "#1A2B3C",
        background: "#FAFCFF", transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = BLUE}
      onBlur={e => e.target.style.borderColor = "#E2E8F0"}
    />
  );
}

function CompletionBadge({ filled }) {
  if (filled) {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#D1FAE5", borderRadius: 6, padding: "2px 8px" }}>
        ✓ Compilato
      </span>
    );
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 6, padding: "2px 8px" }}>
      Da compilare
    </span>
  );
}

function isFilled(entry) {
  return entry.example.trim() && entry.decision.trim() && entry.alternative.trim() && entry.impact.trim();
}

/* ═══ BIAS CARD ═══ */
function BiasCard({ bias, entry, onChange, expanded, onToggle }) {
  const filled = isFilled(entry);

  const fields = [
    { key: "example",     label: "Esempio nella tua vita",     placeholder: "Descrivi una situazione reale (o di cui sei a conoscenza) in cui hai riconosciuto questo bias…" },
    { key: "decision",    label: "Decisione presa",             placeholder: "Qual è stata la decisione influenzata dal bias?" },
    { key: "alternative", label: "Decisione alternativa",       placeholder: "Quale decisione alternativa avresti potuto prendere senza il bias?" },
    { key: "impact",      label: "Impatto del bias",            placeholder: "Descrivi sinteticamente l'effetto negativo sulla decisione presa…" },
  ];

  return (
    <div style={{
      background: "#FFF", border: `1.5px solid ${expanded ? bias.color : "#E2E8F0"}`,
      borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s",
      boxShadow: expanded ? `0 4px 18px ${bias.color}18` : "0 2px 8px rgba(0,0,0,0.03)",
    }}>
      {/* header — always visible */}
      <div
        onClick={onToggle}
        style={{ padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${bias.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          {bias.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1A2B3C", marginBottom: 2 }}>{bias.name}</div>
          <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.4 }}>{bias.description.slice(0, 80)}…</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <CompletionBadge filled={filled} />
          <span style={{ fontSize: 18, color: "#9CA3AF", transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
        </div>
      </div>

      {/* expanded body */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${bias.color}30`, padding: "22px 22px 26px" }}>
          {/* full description + example */}
          <div style={{ background: `${bias.color}08`, borderRadius: 10, padding: "14px 16px", marginBottom: 22 }}>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 10 }}>{bias.description}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: bias.color, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Esempio tipico</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, fontStyle: "italic" }}>{bias.example}</div>
          </div>

          {/* 4 fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#1A2B3C", display: "block", marginBottom: 6 }}>
                  {f.label}
                </label>
                <Textarea
                  value={entry[f.key]}
                  onChange={val => onChange({ ...entry, [f.key]: val })}
                  placeholder={f.placeholder}
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ SUMMARY ═══ */
function Summary({ entries, onBack, onRestart }) {
  const filledCount = BIASES.filter(b => isFilled(entries[b.id])).length;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      {/* header card */}
      <div style={{ background: "#FFF", borderRadius: 16, padding: "28px 32px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Riepilogo</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Bias Hunter — Analisi completata</h2>
          <p style={{ fontSize: 14, color: "#6B7280" }}>Hai analizzato {filledCount} bias su {BIASES.length}.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: BLUE, lineHeight: 1 }}>{filledCount}</div>
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>/ {BIASES.length}</div>
        </div>
      </div>

      {/* bias summary cards */}
      {BIASES.filter(b => isFilled(entries[b.id])).map(b => {
        const e = entries[b.id];
        return (
          <div key={b.id} style={{ background: "#FFF", borderRadius: 14, padding: "22px 26px", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", borderLeft: `4px solid ${b.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{b.emoji}</span>
              <span style={{ fontSize: 17, fontWeight: 700 }}>{b.name}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Esempio", val: e.example },
                { label: "Decisione presa", val: e.decision },
                { label: "Decisione alternativa", val: e.alternative },
                { label: "Impatto del bias", val: e.impact },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: "#F8FBFF", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: b.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* biases not filled */}
      {BIASES.filter(b => !isFilled(entries[b.id])).length > 0 && (
        <div style={{ background: "#FFFBEB", border: "1.5px dashed #FCD34D", borderRadius: 12, padding: "14px 20px", marginBottom: 20, fontSize: 13, color: "#92400E" }}>
          Bias non compilati: {BIASES.filter(b => !isFilled(entries[b.id])).map(b => b.name).join(", ")}
        </div>
      )}

      {/* placeholder */}
      <div style={{ background: "#FFFBEB", border: "1.5px dashed #FCD34D", borderRadius: 14, padding: "18px 24px", fontSize: 14, color: "#92400E", marginBottom: 24 }}>
        Inserisci qui feature del prof — Word Cloud e Text Emotions Analysis per evidenziare parole associate a conseguenze negative nelle risposte
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
          onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
        >
          ← Torna ai bias
        </button>
        <button
          onClick={onRestart}
          style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
          onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
          onMouseLeave={e => e.currentTarget.style.background = BLUE}
        >
          Ricomincia
        </button>
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function BiasHunter({ onHome }) {
  const [view, setView] = useState("intro"); // intro | hunt | summary
  const [expanded, setExpanded] = useState(BIASES[0].id);
  const [entries, setEntries] = useState(
    Object.fromEntries(BIASES.map(b => [b.id, EMPTY_ENTRY()]))
  );

  const filledCount = BIASES.filter(b => isFilled(entries[b.id])).length;

  const updateEntry = (biasId, updated) =>
    setEntries(prev => ({ ...prev, [biasId]: updated }));

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const restart = () => {
    setEntries(Object.fromEntries(BIASES.map(b => [b.id, EMPTY_ENTRY()])));
    setExpanded(BIASES[0].id);
    setView("hunt");
  };

  /* ══════════════ INTRO ══════════════ */
  if (view === "intro") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar phase="Esponi" exercise="Bias Hunter" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 640, width: "100%", background: "#FFF", borderRadius: 20, padding: "48px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `${BLUE}14`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 34 }}>
              🧠
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Bias Hunter</h1>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 32, maxWidth: 460, margin: "0 auto 32px" }}>
              Esplora 5 bias cognitivi comuni. Per ognuno, identifica un esempio nella tua vita, la decisione presa sotto la sua influenza e una possibile alternativa.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
              {BIASES.map(b => (
                <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${b.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {b.emoji}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", maxWidth: 70, textAlign: "center", lineHeight: 1.3 }}>{b.name}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setView("hunt")}
              style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
              onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
              onMouseLeave={e => e.currentTarget.style.background = BLUE}
            >
              Inizia →
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ HUNT ══════════════ */
  if (view === "hunt") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar
          phase="Esponi" exercise="Bias Hunter" onHome={onHome}
          right={
            <span style={{ fontSize: 13, fontWeight: 600, color: filledCount === BIASES.length ? "#059669" : "#9CA3AF" }}>
              {filledCount}/{BIASES.length} bias analizzati
            </span>
          }
        />
        <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
              Espandi ogni bias, leggi la descrizione e compila le 4 colonne con la tua esperienza.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {BIASES.map(b => (
                <BiasCard
                  key={b.id}
                  bias={b}
                  entry={entries[b.id]}
                  onChange={updated => updateEntry(b.id, updated)}
                  expanded={expanded === b.id}
                  onToggle={() => toggle(b.id)}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setView("summary")}
                disabled={filledCount === 0}
                style={{
                  background: filledCount > 0 ? BLUE : "#E5E7EB",
                  color: filledCount > 0 ? "#FFF" : "#9CA3AF",
                  border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700,
                  cursor: filledCount > 0 ? "pointer" : "default", fontFamily: FONT,
                }}
                onMouseEnter={e => { if (filledCount > 0) e.currentTarget.style.background = BLUE_DARK; }}
                onMouseLeave={e => { if (filledCount > 0) e.currentTarget.style.background = BLUE; }}
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
      <Navbar phase="Esponi" exercise="Bias Hunter" subtitle="Riepilogo" onHome={onHome} />
      <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
        <Summary entries={entries} onBack={() => setView("hunt")} onRestart={restart} />
      </main>
    </div>
  );
}
