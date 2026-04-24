import { useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import { SimilarityMatrix, PerDocumentKeywords } from "../components/analytics/index.js";

const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";
const TOTAL_DAYS = 7;

/* Finds words in `text` that do not appear in any of `previousTexts` */
function getNewWords(text, previousTexts) {
  const tokenize = t => new Set(
    t.toLowerCase()
      .replace(/[.,!?;:'"()[\]{}\-–—]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3)
  );
  const prevWords = new Set(previousTexts.flatMap(t => [...tokenize(t)]));
  return tokenize(text).difference ? tokenize(text).difference(prevWords) : new Set([...tokenize(text)].filter(w => !prevWords.has(w)));
}

/* Wraps new words in a highlight span inside plain text */
function HighlightedEntry({ text, newWords }) {
  if (!newWords || newWords.size === 0) return <span style={{ fontSize: 15, color: "#4B5563", lineHeight: 1.65 }}>{text}</span>;
  const parts = text.split(/(\s+)/);
  return (
    <span style={{ fontSize: 15, color: "#4B5563", lineHeight: 1.65 }}>
      {parts.map((part, i) => {
        const word = part.toLowerCase().replace(/[.,!?;:'"()[\]{}\-–—]/g, "");
        return newWords.has(word)
          ? <mark key={i} style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 3, padding: "1px 2px" }}>{part}</mark>
          : <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function DayBadge({ day, hasContent, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: "50%",
        border: `2px solid ${isActive ? BLUE : hasContent ? "#10B981" : "#E2E8F0"}`,
        background: isActive ? BLUE : hasContent ? "#D1FAE5" : "#FFF",
        color: isActive ? "#FFF" : hasContent ? "#065F46" : "#9CA3AF",
        fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
        transition: "all 0.15s", flexShrink: 0,
      }}
    >
      {day}
    </button>
  );
}

export default function LaFoto({ onHome }) {
  const [phase, setPhase] = useState("upload"); // "upload" | "observe" | "complete"
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoName, setPhotoName] = useState("");
  const [currentDay, setCurrentDay] = useState(1);
  const [entries, setEntries] = useState(
    Object.fromEntries(Array.from({ length: TOTAL_DAYS }, (_, i) => [i + 1, ""]))
  );
  const [draft, setDraft] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const completedDays = Object.entries(entries).filter(([, v]) => v.trim()).length;

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      setPhotoUrl(e.target.result);
      setPhotoName(file.name);
      setPhase("observe");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const saveDay = () => {
    if (!draft.trim()) return;
    setEntries(prev => ({ ...prev, [currentDay]: draft.trim() }));
    setDraft("");
    if (completedDays + (entries[currentDay].trim() ? 0 : 1) === TOTAL_DAYS) {
      setPhase("complete");
    } else {
      const nextEmpty = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1)
        .find(d => d !== currentDay && !entries[d].trim());
      if (nextEmpty) setCurrentDay(nextEmpty);
    }
  };

  const switchDay = (day) => {
    setCurrentDay(day);
    setDraft(entries[day] || "");
  };

  /* Words new to this day vs all previous saved entries */
  const previousEntries = Object.entries(entries)
    .filter(([d, v]) => parseInt(d) < currentDay && v.trim())
    .map(([, v]) => v);
  const newWords = draft.trim() ? getNewWords(draft, previousEntries) : new Set();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        textarea { outline: none; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #C0C8D0; border-radius: 3px; }
      `}</style>

      <Navbar
        exercise="La Foto"
        onHome={onHome}
        right={phase !== "upload" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: completedDays === TOTAL_DAYS ? "#10B981" : BLUE }} />
            <span style={{ fontSize: 14, color: "#6B7280" }}>{completedDays}/{TOTAL_DAYS} giorni completati</span>
          </div>
        )}
      />

      {/* ── UPLOAD ── */}
      {phase === "upload" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Fase Osserva</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>La Foto</h1>
            <p style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.65, marginBottom: 32 }}>
              Carica una foto di un paesaggio o scena che ti trasmette serenità. Per <strong>7 giorni consecutivi</strong>, la osserverai per 5 minuti e scriverai tutto ciò che riesci a cogliere — cercando ogni giorno qualcosa che prima ti era sfuggito.
            </p>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? BLUE : "#D1D5DB"}`,
                borderRadius: 16,
                padding: "48px 32px",
                cursor: "pointer",
                background: isDragging ? `${BLUE}06` : "#FFF",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1A2B3C", marginBottom: 6 }}>
                {isDragging ? "Rilascia qui la foto" : "Carica una foto"}
              </div>
              <div style={{ fontSize: 14, color: "#9CA3AF" }}>Clicca o trascina un'immagine (JPG, PNG, WebP)</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
      )}

      {/* ── OBSERVE ── */}
      {phase === "observe" && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden", animation: "fadeIn 0.3s ease" }}>
          {/* Left: photo + day picker */}
          <div style={{ width: 280, flexShrink: 0, borderRight: "1px solid #E8ECF0", display: "flex", flexDirection: "column", background: "#FFF", overflow: "hidden" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #F0F2F5" }}>
              <img src={photoUrl} alt={photoName} style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 180, display: "block" }} />
              <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 8, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{photoName}</div>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Giorni</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map(day => (
                  <DayBadge
                    key={day}
                    day={day}
                    hasContent={!!entries[day].trim()}
                    isActive={day === currentDay}
                    onClick={() => switchDay(day)}
                  />
                ))}
              </div>
              <div style={{ marginTop: 16, fontSize: 13, color: "#9CA3AF", lineHeight: 1.5 }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#D1FAE5", border: "1.5px solid #10B981", marginRight: 5, verticalAlign: "middle" }} />salvato
                {" · "}
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: BLUE, marginRight: 5, verticalAlign: "middle" }} />oggi
              </div>
            </div>
          </div>

          {/* Right: writing area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 0", borderBottom: "1px solid #F0F2F5", paddingBottom: 16, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 2 }}>Giorno {currentDay}</h2>
                  <p style={{ fontSize: 14, color: "#9CA3AF" }}>Osserva la foto per 5 minuti, poi scrivi tutto ciò che noti.</p>
                </div>
                {currentDay > 1 && previousEntries.length > 0 && (
                  <div style={{ fontSize: 13, color: "#D97706", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "4px 10px" }}>
                    Le parole <mark style={{ background: "#FEF3C7", padding: "1px 2px", borderRadius: 2 }}>evidenziate</mark> sono nuove rispetto ai giorni precedenti
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              {/* Writing area */}
              {entries[currentDay] ? (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>✓ Osservazione salvata</div>
                  <div style={{ background: "#FFF", borderRadius: 10, border: "1px solid #E2E8F0", padding: "14px 16px", lineHeight: 1.65 }}>
                    <HighlightedEntry text={entries[currentDay]} newWords={getNewWords(entries[currentDay], Object.entries(entries).filter(([d, v]) => parseInt(d) < currentDay && v.trim()).map(([, v]) => v))} />
                  </div>
                  <button
                    onClick={() => { setDraft(entries[currentDay]); setEntries(prev => ({ ...prev, [currentDay]: "" })); }}
                    style={{ marginTop: 10, background: "none", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", fontSize: 14, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                  >
                    Modifica
                  </button>
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder={`Giorno ${currentDay}: scrivi liberamente tutto ciò che noti nella foto — forme, colori, luce, dettagli sullo sfondo, connessioni tra elementi...`}
                    style={{ width: "100%", minHeight: 180, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#FFF", fontSize: 15, fontFamily: FONT, color: "#1A2B3C", lineHeight: 1.65, resize: "vertical" }}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={saveDay}
                      disabled={!draft.trim()}
                      style={{ background: draft.trim() ? BLUE : "#E2E8F0", color: draft.trim() ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 15, fontWeight: 700, cursor: draft.trim() ? "pointer" : "not-allowed", fontFamily: FONT }}
                      onMouseEnter={e => { if (draft.trim()) e.currentTarget.style.background = BLUE_DARK; }}
                      onMouseLeave={e => { if (draft.trim()) e.currentTarget.style.background = BLUE; }}
                    >
                      Salva Giorno {currentDay}
                    </button>
                  </div>
                </div>
              )}

              {/* Previous days */}
              {Object.entries(entries).filter(([d, v]) => parseInt(d) < currentDay && v.trim()).length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Giorni precedenti</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(entries)
                      .filter(([d, v]) => parseInt(d) < currentDay && v.trim())
                      .sort(([a], [b]) => parseInt(b) - parseInt(a))
                      .map(([day, text]) => (
                        <div key={day} style={{ background: "#FFF", borderRadius: 10, border: "1px solid #E2E8F0", padding: "12px 14px" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 6 }}>GIORNO {day}</div>
                          <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{text}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {completedDays === TOTAL_DAYS && (
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <button
                    onClick={() => setPhase("complete")}
                    style={{ background: "#059669", color: "#FFF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                  >
                    Vedi Riepilogo Completo →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLETE ── */}
      {phase === "complete" && (
        <div style={{ flex: 1, overflow: "auto", padding: "32px 24px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✓ 7 giorni completati</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Il tuo diario di osservazione</h1>
            <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 28 }}>
              Le parole <mark style={{ background: "#FEF3C7", padding: "1px 3px", borderRadius: 3 }}>evidenziate</mark> sono apparse per la prima volta in quel giorno rispetto a tutti i giorni precedenti — mostrano quanto è cambiato il tuo sguardo nel tempo.
            </p>

            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 28 }}>
              <img src={photoUrl} alt={photoName} style={{ width: 160, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "1px solid #E2E8F0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, flex: 1 }}>
                {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map(day => {
                  const prevTexts = Array.from({ length: day - 1 }, (_, j) => entries[j + 1]).filter(Boolean);
                  const nw = getNewWords(entries[day] || "", prevTexts);
                  return (
                    <div key={day} style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2B3C" }}>Giorno {day}</div>
                        {nw.size > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: "#D97706", background: "#FFFBEB", borderRadius: 6, padding: "2px 6px" }}>+{nw.size} nuove</div>}
                      </div>
                      <HighlightedEntry text={entries[day] || ""} newWords={nw} />
                    </div>
                  );
                })}
              </div>
            </div>

            {(() => {
              const dayDocs = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1)
                .map(day => ({ label: `Giorno ${day}`, text: (entries[day] || "").trim() }))
                .filter(d => d.text.length > 0);
              if (dayDocs.length < 2) return null;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  <SimilarityMatrix
                    documents={dayDocs}
                    title="Dissimilarità tra osservazioni — quanto è cambiato il tuo sguardo"
                    mode="similarity"
                  />
                  <PerDocumentKeywords
                    documents={dayDocs}
                    topN={5}
                    title="Keyword TF-IDF — concetti distintivi di ogni giorno"
                  />
                </div>
              );
            })()}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => { setPhase("upload"); setPhotoUrl(null); setPhotoName(""); setCurrentDay(1); setEntries(Object.fromEntries(Array.from({ length: TOTAL_DAYS }, (_, i) => [i + 1, ""]))); setDraft(""); }}
                style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6B7280" }}
              >
                Inizia con una nuova foto
              </button>
              <button
                onClick={onHome}
                style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6B7280" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                ← Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
