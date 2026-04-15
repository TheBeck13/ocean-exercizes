import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";
const LS_KEY = "ruota-della-vita-storico";

/* ═══ LIFE AREAS ═══ */
const AREAS = [
  { key: "lavoro",     label: "Lavoro / Carriera",         color: "#0099E6" },
  { key: "finanze",    label: "Finanze",                   color: "#059669" },
  { key: "relazioni",  label: "Relazioni affettive",        color: "#DC2626" },
  { key: "famiglia",   label: "Famiglia",                  color: "#D97706" },
  { key: "amici",      label: "Amici / Rete sociale",      color: "#7C3AED" },
  { key: "crescita",   label: "Crescita personale",        color: "#DB2777" },
  { key: "tempolibero",label: "Tempo libero",              color: "#0891B2" },
  { key: "benessere",  label: "Benessere emotivo",         color: "#65A30D" },
];

const CX = 210, CY = 210, MAX_R = 155;

/* ═══ SVG HELPERS ═══ */
function getPoint(index, score) {
  const angle = (index / AREAS.length) * 2 * Math.PI - Math.PI / 2;
  const r = (score / 10) * MAX_R;
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

function getLabelPoint(index) {
  const angle = (index / AREAS.length) * 2 * Math.PI - Math.PI / 2;
  return [CX + (MAX_R + 28) * Math.cos(angle), CY + (MAX_R + 28) * Math.sin(angle)];
}

function polygonPoints(scores) {
  return AREAS.map((a, i) => getPoint(i, scores[a.key] ?? 0)).map(([x, y]) => `${x},${y}`).join(" ");
}

/* ═══ WHEEL SVG ═══ */
function Wheel({ scores, prevScores }) {
  const rings = [2, 4, 6, 8, 10];
  return (
    <svg viewBox="0 0 420 420" style={{ width: "100%", maxWidth: 480 }}>
      {/* grid rings */}
      {rings.map(r => (
        <circle key={r} cx={CX} cy={CY} r={(r / 10) * MAX_R} fill="none" stroke="#E5E7EB" strokeWidth={r === 10 ? 1.5 : 1} />
      ))}
      {/* axis lines */}
      {AREAS.map((_, i) => {
        const [x, y] = getPoint(i, 10);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#E5E7EB" strokeWidth={1} />;
      })}
      {/* previous session ghost */}
      {prevScores && (
        <polygon
          points={polygonPoints(prevScores)}
          fill="rgba(156,163,175,0.12)"
          stroke="#9CA3AF"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}
      {/* current session polygon */}
      <polygon
        points={polygonPoints(scores)}
        fill="rgba(0,153,230,0.12)"
        stroke={BLUE}
        strokeWidth={2}
      />
      {/* dots at each area */}
      {AREAS.map((a, i) => {
        const [x, y] = getPoint(i, scores[a.key] ?? 0);
        return (
          <circle key={a.key} cx={x} cy={y} r={5} fill={a.color} stroke="#FFF" strokeWidth={2} />
        );
      })}
      {/* area labels */}
      {AREAS.map((a, i) => {
        const [lx, ly] = getLabelPoint(i);
        const score = scores[a.key] ?? 0;
        const isLeft = lx < CX - 20;
        return (
          <g key={a.key}>
            <text
              x={lx} y={ly - 4}
              textAnchor={isLeft ? "end" : lx > CX + 20 ? "start" : "middle"}
              fontSize="9.5" fontWeight="700" fill={a.color} fontFamily={FONT}
            >
              {a.label}
            </text>
            <text
              x={lx} y={ly + 9}
              textAnchor={isLeft ? "end" : lx > CX + 20 ? "start" : "middle"}
              fontSize="11" fontWeight="800" fill={a.color} fontFamily={FONT}
            >
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function RuotaDellaVita({ onHome }) {
  const [view, setView] = useState("sliders"); // sliders | deepen | summary
  const [scores, setScores] = useState(Object.fromEntries(AREAS.map(a => [a.key, 5])));
  const [comments, setComments] = useState(Object.fromEntries(AREAS.map(a => [a.key, ""])));
  const [deepAreas, setDeepAreas] = useState({});   // key → { missing, step, connection }
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(history));
  }, [history]);

  const prevScores = history.length > 0 ? history[history.length - 1].scores : null;

  const lowestAreas = [...AREAS]
    .sort((a, b) => (scores[a.key] ?? 0) - (scores[b.key] ?? 0))
    .slice(0, 3);

  const avgScore = Math.round((Object.values(scores).reduce((s, v) => s + v, 0) / AREAS.length) * 10) / 10;

  const saveSession = () => {
    setHistory(prev => [...prev, { date: new Date().toISOString(), scores: { ...scores } }]);
    setView("summary");
  };

  /* ══════════════ SLIDERS ══════════════ */
  if (view === "sliders") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar
          phase="Nutri" exercise="Ruota della Vita" onHome={onHome}
          right={history.length > 0 && (
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF" }}>
              Sessione {history.length + 1}
            </span>
          )}
        />
        <main style={{ flex: 1, overflow: "auto", padding: "28px 24px" }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            {/* wheel — centrata e prominente */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
              <div style={{ background: "#FFF", borderRadius: 24, padding: "24px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", width: "100%", maxWidth: 520 }}>
                <Wheel scores={scores} prevScores={prevScores} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 10 }}>
                  {prevScores && (
                    <>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9CA3AF" }}>
                        <span style={{ width: 18, height: 2, background: BLUE, display: "inline-block", borderRadius: 1 }} /> Oggi
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9CA3AF" }}>
                        <span style={{ width: 18, borderTop: "2px dashed #9CA3AF", display: "inline-block" }} /> Sessione precedente
                      </span>
                    </>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>
                    Media: <span style={{ fontSize: 20, fontWeight: 800, color: BLUE }}>{avgScore}</span>/10
                  </span>
                </div>
              </div>
            </div>

            {/* sliders a griglia */}
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 16, lineHeight: 1.6 }}>
              Per ogni area assegna un punteggio da 0 a 10 e aggiungi un breve commento opzionale.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 12 }}>
              {AREAS.map(a => (
                <div key={a.key} style={{ background: "#FFF", borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", borderLeft: `4px solid ${a.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{a.label}</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: a.color }}>{scores[a.key]}</span>
                  </div>
                  <input
                    type="range" min={0} max={10} step={1}
                    value={scores[a.key]}
                    onChange={e => setScores(prev => ({ ...prev, [a.key]: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: a.color, height: 6, cursor: "pointer", marginBottom: 8 }}
                  />
                  <input
                    value={comments[a.key]}
                    onChange={e => setComments(prev => ({ ...prev, [a.key]: e.target.value }))}
                    placeholder="Commento breve (opzionale)…"
                    style={{
                      width: "100%", border: "1px solid #E2E8F0", borderRadius: 6, padding: "6px 10px",
                      fontSize: 13, fontFamily: FONT, outline: "none", color: "#1A2B3C", background: "#FAFCFF",
                    }}
                    onFocus={e => e.target.style.borderColor = a.color}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button
                onClick={() => setView("deepen")}
                style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                onMouseLeave={e => e.currentTarget.style.background = BLUE}
              >
                Approfondisci →
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ DEEPEN ══════════════ */
  if (view === "deepen") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar phase="Nutri" exercise="Ruota della Vita" subtitle="Approfondimento" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Approfondisci 2–3 aree chiave</h2>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 28, lineHeight: 1.6 }}>
              Le 3 aree con il punteggio più basso. Per ognuna rispondi alle domande guida.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
              {lowestAreas.map(a => {
                const da = deepAreas[a.key] || { missing: "", step: "", connection: "" };
                const update = (field, val) => setDeepAreas(prev => ({ ...prev, [a.key]: { ...da, [field]: val } }));
                return (
                  <div key={a.key} style={{ background: "#FFF", borderRadius: 16, padding: "24px 26px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderLeft: `4px solid ${a.color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: a.color }}>{a.label}</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: a.color }}>{scores[a.key]}/10</span>
                    </div>
                    {[
                      { field: "missing",    q: "Che cosa manca oggi in quest'area?",                              ph: "Descrivi cosa ti manca concretamente…" },
                      { field: "step",       q: "Quale piccolo passo aumenterebbe il punteggio di 1 solo punto?",  ph: "Un'azione realistica, non perfetta…" },
                      { field: "connection", q: "In che modo questa area impatta sulle altre?",                    ph: "Es. lavoro ↔ relazioni, tempo libero ↔ benessere…" },
                    ].map(({ field, q, ph }) => (
                      <div key={field} style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{q}</label>
                        <textarea
                          value={da[field]}
                          onChange={e => update(field, e.target.value)}
                          placeholder={ph}
                          rows={2}
                          style={{
                            width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8,
                            padding: "8px 12px", fontSize: 13, fontFamily: FONT, lineHeight: 1.5,
                            resize: "vertical", outline: "none", color: "#1A2B3C", background: "#FAFCFF",
                          }}
                          onFocus={e => e.target.style.borderColor = a.color}
                          onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setView("sliders")}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                ← Modifica punteggi
              </button>
              <button
                onClick={saveSession}
                style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                onMouseLeave={e => e.currentTarget.style.background = BLUE}
              >
                Salva sessione →
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
        phase="Nutri" exercise="Ruota della Vita" subtitle="Riepilogo" onHome={onHome}
        right={
          <button
            onClick={() => { setScores(Object.fromEntries(AREAS.map(a => [a.key, 5]))); setComments(Object.fromEntries(AREAS.map(a => [a.key, ""]))); setDeepAreas({}); setView("sliders"); }}
            style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
            onMouseLeave={e => e.currentTarget.style.background = BLUE}
          >
            + Nuova sessione
          </button>
        }
      />
      <main style={{ flex: 1, overflow: "auto", padding: "28px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          {/* wheel centrata */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{ background: "#FFF", borderRadius: 24, padding: "24px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", width: "100%", maxWidth: 520 }}>
              <Wheel scores={scores} prevScores={history.length > 1 ? history[history.length - 2]?.scores : null} />
              <div style={{ textAlign: "center", marginTop: 10 }}>
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>Media complessiva: </span>
                <span style={{ fontSize: 22, fontWeight: 800, color: BLUE }}>{avgScore}/10</span>
              </div>
              {history.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Storico sessioni</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {history.map((h, i) => {
                      const avg = Math.round(Object.values(h.scores).reduce((s, v) => s + v, 0) / AREAS.length * 10) / 10;
                      return (
                        <div key={i} style={{ background: "#F8FBFF", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                          <span style={{ color: "#6B7280" }}>{new Date(h.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</span>
                          <span style={{ fontWeight: 800, color: BLUE, marginLeft: 6 }}>{avg}/10</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* area details a griglia */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(370px, 1fr))", gap: 10 }}>
            {AREAS.map(a => {
              const da = deepAreas[a.key];
              return (
                <div key={a.key} style={{ background: "#FFF", borderRadius: 12, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", borderLeft: `3px solid ${a.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: comments[a.key] || da ? 8 : 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{a.label}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: a.color }}>{scores[a.key]}/10</span>
                  </div>
                  {comments[a.key] && <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.4 }}>{comments[a.key]}</div>}
                  {da?.missing && <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}><span style={{ fontWeight: 600, color: a.color }}>Manca: </span>{da.missing}</div>}
                  {da?.step && <div style={{ fontSize: 12, color: "#374151", marginTop: 2 }}><span style={{ fontWeight: 600, color: a.color }}>+1 punto: </span>{da.step}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
