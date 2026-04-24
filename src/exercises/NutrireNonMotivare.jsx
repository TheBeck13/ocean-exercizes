import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { WordCloud, ThemeClusters } from "../components/analytics/index.js";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";

/* ═══ CATEGORIES ═══ */
const CATEGORIES = [
  {
    id: "empty",
    label: "Motivazione vuota",
    color: "#DC2626",
    icon: "💬",
    desc: "Spinge, incoraggia genericamente, non responsabilizza il coachee",
  },
  {
    id: "nurture",
    label: "Nutriente",
    color: "#059669",
    icon: "🌱",
    desc: "Aiuta il coachee a prendere responsabilità e continuare il cambiamento interno",
  },
  {
    id: "story",
    label: "Storytelling / Metafora",
    color: "#7C3AED",
    icon: "📖",
    desc: "Ancora il cambiamento con immagini, similitudini o micro-storie del passato del coachee",
  },
];

/* ═══ PHRASES ═══ */
const PHRASES = [
  { id: "ph1", text: "Dai che ce la fai!" },
  { id: "ph2", text: "Devi crederci di più." },
  { id: "ph3", text: "Sei fortissimo, non mollare!" },
  { id: "ph4", text: "Sono sicuro che riuscirai." },
  { id: "ph5", text: "Basta volerlo davvero." },
  { id: "ph6", text: "Hai già fatto cose difficili, questa è alla tua portata." },
  { id: "ph7", text: "Pensa a quanto sei cambiato rispetto a 6 mesi fa." },
  { id: "ph8", text: "È come costruire un ponte: ogni azione è un mattone. Non serve vedere tutta la struttura, basta posarne uno oggi." },
];

/* ═══ REWRITE HINTS ═══ */
const REWRITE_HINTS = {
  empty: [
    "Sostituisci l'incoraggiamento con una domanda di responsabilizzazione",
    "Chiedi al coachee cosa ha già fatto che funziona",
    "Descrivi il comportamento specifico, non la persona",
  ],
  nurture: [
    "Rafforza con un aggancio a un'esperienza passata di successo del coachee",
    "Aggiungi una domanda che inviti il coachee a riconoscere il proprio contributo",
    "Usa la seconda persona ma sposta l'agency: 'Cosa hai fatto che ha reso possibile questo?'",
  ],
  story: [
    "Costruisci una metafora legata a un contesto familiare al coachee (natura, costruzione, percorsi)",
    "Usa una similitudine breve: 'È come quando...'",
    "Racconta una micro-storia di 2 frasi con inizio-svolta-implicazione",
  ],
};

/* ═══ SUB-COMPONENTS ═══ */
function CategoryBadge({ catId, size = "normal" }) {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return null;
  return (
    <span style={{
      fontSize: size === "small" ? 11 : 12, fontWeight: 700, color: cat.color,
      background: `${cat.color}14`, borderRadius: 8,
      padding: size === "small" ? "2px 7px" : "3px 10px",
    }}>
      {cat.icon} {cat.label}
    </span>
  );
}

/* ═══ PHRASE CARD ═══ */
function PhraseCard({ phrase, catId, rewrite, onCatChange, onRewriteChange, isActive, onActivate }) {
  const [showHints, setShowHints] = useState(false);
  const hints = catId ? REWRITE_HINTS[catId] : [];

  return (
    <div
      style={{
        background: "#FFF", border: `1.5px solid ${isActive ? BLUE : "#E2E8F0"}`,
        borderRadius: 16, padding: "20px 22px", transition: "all 0.2s",
        boxShadow: isActive ? "0 4px 18px rgba(0,153,230,0.1)" : "0 2px 8px rgba(0,0,0,0.03)",
        cursor: isActive ? "default" : "pointer",
      }}
      onClick={() => !isActive && onActivate()}
    >
      {/* phrase text */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isActive ? 16 : 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1A2B3C", lineHeight: 1.5, flex: 1, paddingRight: 12 }}>
          "{phrase.text}"
        </div>
        <div style={{ flexShrink: 0 }}>
          {catId ? <CategoryBadge catId={catId} /> : (
            <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 6, padding: "2px 8px" }}>
              {isActive ? "Classifica →" : "Da classificare"}
            </span>
          )}
        </div>
      </div>

      {/* expanded area */}
      {isActive && (
        <>
          {/* category selection */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Classifica questa frase:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onCatChange(cat.id)}
                  style={{
                    border: `1.5px solid ${catId === cat.id ? cat.color : "#E2E8F0"}`,
                    background: catId === cat.id ? `${cat.color}12` : "#FFF",
                    color: catId === cat.id ? cat.color : "#6B7280",
                    borderRadius: 8, padding: "7px 14px", fontSize: 13,
                    fontWeight: catId === cat.id ? 700 : 500,
                    cursor: "pointer", fontFamily: FONT, transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
            {catId && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>
                {CATEGORIES.find(c => c.id === catId)?.desc}
              </div>
            )}
          </div>

          {/* rewrite area */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Riscrivila in versione nutriente:</div>
              {catId && (
                <button
                  onClick={() => setShowHints(v => !v)}
                  style={{ background: "none", border: "none", fontSize: 12, color: BLUE, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}
                >
                  {showHints ? "Nascondi suggerimenti" : "💡 Suggerimenti"}
                </button>
              )}
            </div>
            {showHints && hints.length > 0 && (
              <div style={{ background: `${BLUE}08`, border: `1px solid ${BLUE}20`, borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {hints.map((h, i) => <li key={i} style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, marginBottom: 2 }}>{h}</li>)}
                </ul>
              </div>
            )}
            <textarea
              value={rewrite}
              onChange={e => onRewriteChange(e.target.value)}
              placeholder={
                catId === "story"
                  ? "Es. 'È come costruire un ponte: ogni azione che hai già fatto è un mattone già posato…'"
                  : catId === "nurture"
                  ? "Es. 'Cosa hai fatto tu, concretamente, che ha reso possibile questo cambiamento?'"
                  : "Prova a riscriverla in modo che il coachee senta la propria agency…"
              }
              rows={3}
              style={{
                width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8,
                padding: "10px 12px", fontSize: 14, fontFamily: FONT, lineHeight: 1.55,
                resize: "vertical", outline: "none", color: "#1A2B3C", background: "#FAFCFF",
              }}
              onFocus={e => e.target.style.borderColor = BLUE}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function NutrireNonMotivare({ onHome }) {
  const [view, setView] = useState("intro");    // intro | exercise | summary
  const [activeId, setActiveId] = useState(PHRASES[0].id);
  const [categories, setCategories] = useState({});
  const [rewrites, setRewrites] = useState({});

  const classifiedCount = Object.keys(categories).length;
  const rewrittenCount = Object.values(rewrites).filter(r => r.trim()).length;
  const canSummary = classifiedCount > 0;

  const catStats = CATEGORIES.map(cat => ({
    ...cat,
    count: Object.values(categories).filter(c => c === cat.id).length,
  }));

  /* ══════════════ INTRO ══════════════ */
  if (view === "intro") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar phase="Nutri" exercise="Nutrire ≠ Motivare" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 600, width: "100%", background: "#FFF", borderRadius: 20, padding: "44px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Nutrire ≠ Motivare</h1>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 28 }}>
              Classifica {PHRASES.length} frasi tipiche del coach e trasformale: da motivazione vuota a nutrimento reale, attraverso responsabilizzazione, metafore e storytelling.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} style={{ background: `${cat.color}10`, borderRadius: 12, padding: "12px 16px", textAlign: "left", minWidth: 160 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{cat.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cat.color, marginBottom: 2 }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{cat.desc}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setView("exercise")}
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

  /* ══════════════ EXERCISE ══════════════ */
  if (view === "exercise") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar
          phase="Nutri" exercise="Nutrire ≠ Motivare" onHome={onHome}
          right={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: classifiedCount === PHRASES.length ? "#059669" : "#9CA3AF" }}>
                {classifiedCount}/{PHRASES.length} classificate
              </span>
              {canSummary && (
                <button
                  onClick={() => setView("summary")}
                  style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                  onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                  onMouseLeave={e => e.currentTarget.style.background = BLUE}
                >
                  Riepilogo →
                </button>
              )}
            </div>
          }
        />
        <main style={{ flex: 1, overflow: "auto", padding: "28px 24px" }}>
          <div style={{ maxWidth: 740, margin: "0 auto" }}>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
              Clicca su una frase per espanderla, classificarla e riscriverla.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PHRASES.map(ph => (
                <PhraseCard
                  key={ph.id}
                  phrase={ph}
                  catId={categories[ph.id]}
                  rewrite={rewrites[ph.id] || ""}
                  onCatChange={cat => setCategories(prev => ({ ...prev, [ph.id]: cat }))}
                  onRewriteChange={val => setRewrites(prev => ({ ...prev, [ph.id]: val }))}
                  isActive={activeId === ph.id}
                  onActivate={() => setActiveId(ph.id)}
                />
              ))}
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
        phase="Nutri" exercise="Nutrire ≠ Motivare" subtitle="Riepilogo" onHome={onHome}
        right={
          <button onClick={() => setView("exercise")} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.borderColor = BLUE} onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}>
            ← Modifica
          </button>
        }
      />
      <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {/* stats */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
            {catStats.map(cat => (
              <div key={cat.id} style={{ flex: 1, minWidth: 140, background: "#FFF", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderTop: `3px solid ${cat.color}` }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: cat.color }}>{cat.count}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{cat.label}</div>
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 140, background: "#FFF", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderTop: "3px solid #9CA3AF" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>✏️</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#374151" }}>{rewrittenCount}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Frasi riscritte</div>
            </div>
          </div>

          {/* phrase details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {PHRASES.map(ph => {
              const catId = categories[ph.id];
              if (!catId) return null;
              const cat = CATEGORIES.find(c => c.id === catId);
              return (
                <div key={ph.id} style={{ background: "#FFF", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderLeft: `4px solid ${cat.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: rewrites[ph.id] ? 10 : 0 }}>
                    <div style={{ fontSize: 14, color: "#6B7280", fontStyle: "italic", flex: 1, paddingRight: 12 }}>"{ph.text}"</div>
                    <CategoryBadge catId={catId} size="small" />
                  </div>
                  {rewrites[ph.id]?.trim() && (
                    <div style={{ background: `${cat.color}08`, borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: cat.color, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Versione nutriente</div>
                      <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.55 }}>"{rewrites[ph.id]}"</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {(() => {
            const metaphorDocs = PHRASES
              .filter(ph => categories[ph.id] === "story" || rewrites[ph.id]?.trim())
              .map(ph => ({
                label: CATEGORIES.find(c => c.id === categories[ph.id])?.label || "Non classificata",
                text: [ph.text, rewrites[ph.id]].filter(Boolean).join(" — "),
              }));

            const allRewrites = PHRASES
              .map(ph => rewrites[ph.id])
              .filter(t => t && t.trim());

            if (metaphorDocs.length === 0 && allRewrites.length === 0) return null;

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                {allRewrites.length > 0 && (
                  <WordCloud
                    texts={allRewrites}
                    title="Aree tematiche nelle riscritture nutrienti"
                    palette="bold5"
                    maxWords={35}
                  />
                )}
                {metaphorDocs.length >= 2 && (
                  <ThemeClusters
                    documents={metaphorDocs}
                    k={Math.min(3, metaphorDocs.length)}
                    title="Raggruppamento metafore per similarity"
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
