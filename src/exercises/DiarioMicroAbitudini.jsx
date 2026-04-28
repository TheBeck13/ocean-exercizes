import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { WordCloud, KeywordRanking, SimilarityMatrix } from "../components/analytics/index.js";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";

/* ═══ COMMUNICATION MODES ═══ */
const COMM_MODES = [
  { id: "descrivere",   label: "Descrivere",  color: "#059669", desc: "Hai riportato fatti osservabili, senza interpretazioni." },
  { id: "interpretare", label: "Interpretare", color: "#DC2626", desc: "Hai attribuito significati, cause o intenzioni." },
  { id: "consigliare",  label: "Consigliare",  color: "#D97706", desc: "Hai suggerito cosa fare o come comportarsi." },
  { id: "sfidare",      label: "Sfidare",      color: "#7C3AED", desc: "Hai messo in discussione o provocato una riflessione." },
  { id: "rassicurare",  label: "Rassicurare",  color: "#0099E6", desc: "Hai confortato o ridotto la tensione dell'altro." },
];

/* ═══ HELPERS ═══ */
function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

/* ═══ SUB-COMPONENTS ═══ */
function Textarea({ value, onChange, placeholder, rows = 2 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8,
        padding: "10px 12px", fontSize: 14, fontFamily: FONT, lineHeight: 1.5,
        resize: "vertical", outline: "none", color: "#1A2B3C",
        background: "#FAFCFF", transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = BLUE}
      onBlur={e => e.target.style.borderColor = "#E2E8F0"}
    />
  );
}

function ModeSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {COMM_MODES.map(m => {
        const sel = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              border: `1.5px solid ${sel ? m.color : "#E2E8F0"}`,
              background: sel ? `${m.color}14` : "#FFF",
              color: sel ? m.color : "#6B7280",
              borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: sel ? 700 : 500,
              cursor: "pointer", fontFamily: FONT, transition: "all 0.15s",
            }}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function ScaleSlider({ value, onChange, color = BLUE }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>0 — Nessuno spazio</span>
        <span style={{ fontSize: 22, fontWeight: 800, color }}>{value}</span>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>10 — Tutto lo spazio</span>
      </div>
      <input
        type="range" min={0} max={10} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, height: 6, cursor: "pointer" }}
      />
    </div>
  );
}

/* ═══ WEEKLY STATS ═══ */
function WeeklyStats({ episodes }) {
  if (episodes.length === 0) return null;

  const modeCounts = Object.fromEntries(COMM_MODES.map(m => [m.id, 0]));
  episodes.forEach(ep => { if (ep.commMode) modeCounts[ep.commMode]++; });

  const avgSpace = Math.round(episodes.reduce((s, ep) => s + ep.space, 0) / episodes.length * 10) / 10;

  return (
    <div style={{ background: "#FFF", borderRadius: 16, padding: "24px 28px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#1A2B3C" }}>Riepilogo settimanale</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#F8FBFF", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 2 }}>Episodi registrati</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: BLUE }}>{episodes.length}</div>
        </div>
        <div style={{ background: "#F8FBFF", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 2 }}>Spazio medio lasciato</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#7C3AED" }}>{avgSpace}/10</div>
        </div>
      </div>

      {/* mode bar chart */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2B3C", marginBottom: 10 }}>Come hai comunicato più spesso:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {COMM_MODES.map(m => {
          const count = modeCounts[m.id];
          const pct = episodes.length > 0 ? Math.round((count / episodes.length) * 100) : 0;
          return (
            <div key={m.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: m.color }}>{m.label}</span>
                <span style={{ color: "#9CA3AF" }}>{count} ep. ({pct}%)</span>
              </div>
              <div style={{ background: "#F3F4F6", borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, background: m.color, height: "100%", borderRadius: 4, transition: "width 0.4s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ EPISODE CARD ═══ */
function EpisodeCard({ ep, onDelete }) {
  const mode = COMM_MODES.find(m => m.id === ep.commMode);
  return (
    <div style={{ background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF" }}>{formatDate(ep.timestamp)}</span>
          <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 6 }}>{formatTime(ep.timestamp)}</span>
          {ep.context && <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2B3C", marginTop: 2 }}>{ep.context}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {mode && (
            <span style={{ fontSize: 11, fontWeight: 700, color: mode.color, background: `${mode.color}14`, borderRadius: 6, padding: "2px 8px" }}>
              {mode.label}
            </span>
          )}
          <button
            onClick={onDelete}
            style={{ background: "none", border: "1px solid #FCA5A5", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#DC2626", cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            ✕
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#F8FBFF", borderRadius: 8, padding: "8px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Spazio lasciato</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: BLUE }}>{ep.space}/10</div>
        </div>
        {ep.microChange && (
          <div style={{ background: "#F8FBFF", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Micro-cambiamento</div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.4 }}>{ep.microChange}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ ENTRY FORM ═══ */
function EntryForm({ onSave }) {
  const [context, setContext] = useState("");
  const [commMode, setCommMode] = useState("");
  const [space, setSpace] = useState(5);
  const [microChange, setMicroChange] = useState("");

  const canSave = commMode !== "";

  const handleSave = () => {
    if (!canSave) return;
    onSave({ context, commMode, space, microChange, timestamp: new Date().toISOString() });
    setContext(""); setCommMode(""); setSpace(5); setMicroChange("");
  };

  return (
    <div style={{ background: "#FFF", borderRadius: 16, padding: "26px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 28, border: `1.5px solid ${BLUE}30` }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "#1A2B3C" }}>+ Registra un episodio</div>

      {/* Q1 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>
          Oggi ho spiegato / fatto notare qualcosa a… (contesto facoltativo)
        </label>
        <Textarea value={context} onChange={setContext} placeholder="Es. al mio team durante la riunione, a un collega in pausa pranzo…" rows={2} />
      </div>

      {/* Q2 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>
          Ho parlato più per… <span style={{ color: "#DC2626" }}>*</span>
        </label>
        <ModeSelector value={commMode} onChange={setCommMode} />
        {commMode && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>
            {COMM_MODES.find(m => m.id === commMode)?.desc}
          </div>
        )}
      </div>

      {/* Q3 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>
          Su 1–10: quanto ho lasciato spazio all'altro di reagire / spiegare?
        </label>
        <ScaleSlider value={space} onChange={setSpace} color={BLUE} />
      </div>

      {/* Q4 */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 6 }}>
          Una micro-cosa che potrei fare diversamente la prossima volta
        </label>
        <Textarea value={microChange} onChange={setMicroChange} placeholder="Es. una domanda in più, una frase in meno, una pausa…" rows={2} />
      </div>

      <button
        onClick={handleSave}
        disabled={!canSave}
        style={{
          background: canSave ? BLUE : "#E5E7EB", color: canSave ? "#FFF" : "#9CA3AF",
          border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700,
          cursor: canSave ? "pointer" : "default", fontFamily: FONT, transition: "all 0.2s",
        }}
        onMouseEnter={e => { if (canSave) e.currentTarget.style.background = BLUE_DARK; }}
        onMouseLeave={e => { if (canSave) e.currentTarget.style.background = BLUE; }}
      >
        Salva episodio ✓
      </button>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function DiarioMicroAbitudini({ onHome }) {
  const [view, setView] = useState("intro"); // intro | diary | stats
  const [episodes, setEpisodes] = useState([]);

  const addEpisode = (ep) => setEpisodes(prev => [ep, ...prev]);
  const deleteEpisode = (idx) => setEpisodes(prev => prev.filter((_, i) => i !== idx));

  /* ══════════════ INTRO ══════════════ */
  if (view === "intro") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar phase="Esponi" exercise="Diario Micro-Abitudini" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 600, width: "100%", background: "#FFF", borderRadius: 20, padding: "48px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `${BLUE}14`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 34 }}>
              💬
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Diario delle Micro-Abitudini di Esposizione</h1>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 32 }}>
              Rendi visibili le tue micro-abitudini comunicative. Ogni volta che "esponi" qualcosa — in una riunione, con un collega, in una sessione — registra l'episodio in 30–60 secondi con 4 domande rapide.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
              {["📍 Contesto", "🗣 Modalità", "↔️ Spazio lasciato", "🔄 Micro-cambio"].map(t => (
                <span key={t} style={{ fontSize: 13, fontWeight: 600, color: "#374151", background: "#F3F4F6", borderRadius: 8, padding: "6px 12px" }}>{t}</span>
              ))}
            </div>
            <button
              onClick={() => setView("diary")}
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

  /* ══════════════ DIARY ══════════════ */
  if (view === "diary") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar
          phase="Esponi" exercise="Diario Micro-Abitudini" onHome={onHome}
          right={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>{episodes.length} episodi</span>
              {episodes.length >= 3 && (
                <button
                  onClick={() => setView("stats")}
                  style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
                >
                  📊 Riepilogo
                </button>
              )}
            </div>
          }
        />
        <main style={{ flex: 1, overflow: "auto", padding: "32px 24px" }}>
          <div style={{ maxWidth: 740, margin: "0 auto" }}>
            <EntryForm onSave={addEpisode} />

            {episodes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF", fontSize: 14 }}>
                Nessun episodio registrato ancora.<br />Usa il form qui sopra per aggiungere il primo.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2B3C", marginBottom: 14 }}>
                  Episodi registrati ({episodes.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {episodes.map((ep, i) => (
                    <EpisodeCard key={ep.timestamp + i} ep={ep} onDelete={() => deleteEpisode(i)} />
                  ))}
                </div>
                {episodes.length >= 3 && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                    <button
                      onClick={() => setView("stats")}
                      style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                      onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                      onMouseLeave={e => e.currentTarget.style.background = BLUE}
                    >
                      📊 Vedi riepilogo settimanale →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ STATS ══════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
      <Navbar
        phase="Esponi" exercise="Diario Micro-Abitudini" subtitle="Riepilogo settimanale" onHome={onHome}
        right={
          <button
            onClick={() => setView("diary")}
            style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
          >
            + Aggiungi episodio
          </button>
        }
      />
      <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <WeeklyStats episodes={episodes} />

          {/* micro-changes list */}
          {episodes.filter(ep => ep.microChange?.trim()).length > 0 && (
            <div style={{ background: "#FFF", borderRadius: 16, padding: "24px 28px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#1A2B3C" }}>Micro-cambiamenti proposti</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {episodes.filter(ep => ep.microChange?.trim()).map((ep, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{ep.microChange}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{formatDate(ep.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const allTexts = episodes
              .flatMap(ep => [ep.context, ep.microChange])
              .filter(t => t && t.trim());
            if (allTexts.length === 0) return null;

            const byMode = {};
            for (const ep of episodes) {
              const key = COMM_MODES.find(m => m.id === ep.commMode)?.label || "Altro";
              const t = [ep.context, ep.microChange].filter(Boolean).join(" ");
              if (!t.trim()) continue;
              (byMode[key] ||= []).push(t);
            }

            const sessionDocs = episodes
              .filter(ep => (ep.context || ep.microChange || "").trim())
              .slice(0, 12)
              .map((ep, i) => ({
                label: formatDate(ep.timestamp),
                text: [ep.context, ep.microChange].filter(Boolean).join(". "),
              }));

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
                <WordCloud
                  texts={allTexts}
                  title="Pattern ricorrenti — parole che tornano nel diario"
                  palette="byfreq"
                  maxWords={40}
                />
                {/*{Object.keys(byMode).length >= 2 && (*/}
                {/*  <KeywordRanking*/}
                {/*    groups={byMode}*/}
                {/*    title="Concetti dominanti per modalità comunicativa"*/}
                {/*    topN={6}*/}
                {/*  />*/}
                {/*)}*/}
                {sessionDocs.length >= 3 && (
                  <SimilarityMatrix
                    documents={sessionDocs}
                    title="Confronto tra episodi — somiglianze testuali"
                    mode="similarity"
                  />
                )}
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
