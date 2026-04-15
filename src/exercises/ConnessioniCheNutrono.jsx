import { useState } from "react";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";

/* ═══ PREDEFINED CASE ═══ */
const CASE_COACHEE = {
  name: "Luca",
  role: "Responsabile Operations, 38 anni",
  context:
    "Luca ha lavorato per mesi sul suo obiettivo di ridurre il controllo compulsivo sul lavoro del suo team. Ha fatto passi concreti: delega regolarmente, tiene riunioni più brevi, ha smesso di controllare le email nel weekend. Adesso siete in fase Nutri: l'obiettivo è capire quali persone e contesti attorno a lui possono aiutarlo a consolidare questo cambiamento — e quali rischiano di sabotarlo.",
  goal: "Consolidare la delega e ridurre il controllo compulsivo",
};

const PEOPLE_LIST = [
  { id: "p1",  name: "Sara",     role: "Partner, sostiene il cambiamento",          type: "person", hint: "Lo incoraggia a staccare, ma a volte lo protegge troppo" },
  { id: "p2",  name: "Marco",    role: "Collega senior, modello di delega efficace", type: "person", hint: "Ha già fatto questo percorso: può essere sparring partner" },
  { id: "p3",  name: "Giulia",   role: "Collaboratrice diretta",                    type: "person", hint: "Si aspetta approvazione continua, rinforza il suo controllo" },
  { id: "p4",  name: "Roberto",  role: "Capo, stile direttivo",                     type: "person", hint: "Apprezza la velocità ma chiede report dettagliati" },
  { id: "p5",  name: "Andrea",   role: "Amico storico, settore diverso",            type: "person", hint: "Confronto sano, non coinvolto nelle dinamiche aziendali" },
  { id: "p6",  name: "Team meeting settimanale", role: "Contesto ricorrente",       type: "context", hint: "Può diventare rituale di fiducia o controllo" },
  { id: "p7",  name: "Palestra",  role: "Contesto di scarico",                      type: "context", hint: "Rompe il loop mentale lavoro-controllo" },
  { id: "p8",  name: "Gruppo di coaching tra pari", role: "Comunità professionale", type: "context", hint: "Specchio e supporto tra coach in formazione" },
  { id: "p9",  name: "Chat di lavoro H24", role: "Contesto digitale",               type: "context", hint: "Rinforza il controllo se non viene gestito con confini" },
  { id: "p10", name: "Marta",    role: "Sorella, psicologia clinica",               type: "person", hint: "Buona ascoltatrice, rischia di medicalizzare" },
];

const RINGS = [
  { id: "inner",   label: "Legami forti",               sublabel: "Cerchio interno",         color: BLUE,      r: 72,  desc: "Persone e contesti di massima fiducia e influenza quotidiana" },
  { id: "outer",   label: "Legami deboli / Contesti",   sublabel: "Cerchio esterno",         color: "#7C3AED", r: 126, desc: "Connessioni periodiche o contesti ambientali utili" },
  { id: "outside", label: "Fuori dalla mappa",          sublabel: "Da gestire con confini",  color: "#DC2626", r: 0,   desc: "Relazioni o contesti che ostacolano il cambiamento" },
];

/* ═══ SVG CONCENTRIC CIRCLES ═══ */
function CircleMap({ assignments, pendingId, onRingClick }) {
  const CX = 160, CY = 160;

  const getPositionsInRing = (ringId, ringR) => {
    const items = assignments.filter(a => a.ringId === ringId);
    if (items.length === 0) return [];
    return items.map((item, i) => {
      const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
      const r = ringR * 0.55;
      return { ...item, x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
    });
  };

  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: 320 }}>
      {/* outer ring */}
      <circle
        cx={CX} cy={CY} r={126}
        fill={pendingId ? "rgba(124,58,237,0.04)" : "rgba(124,58,237,0.03)"}
        stroke="#7C3AED" strokeWidth={pendingId ? 2.5 : 1.5} strokeDasharray={pendingId ? "0" : "6 4"}
        style={{ cursor: pendingId ? "pointer" : "default" }}
        onClick={() => pendingId && onRingClick("outer")}
      />
      {/* inner ring */}
      <circle
        cx={CX} cy={CY} r={72}
        fill={pendingId ? "rgba(0,153,230,0.06)" : "rgba(0,153,230,0.04)"}
        stroke={BLUE} strokeWidth={pendingId ? 2.5 : 1.5}
        style={{ cursor: pendingId ? "pointer" : "default" }}
        onClick={() => pendingId && onRingClick("inner")}
      />
      {/* center */}
      <circle cx={CX} cy={CY} r={24} fill={`${BLUE}20`} stroke={BLUE} strokeWidth={1.5} />
      <text x={CX} y={CY - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill={BLUE} fontFamily={FONT}>Luca</text>
      <text x={CX} y={CY + 9} textAnchor="middle" fontSize="8" fill={BLUE} fontFamily={FONT}>(coachee)</text>

      {/* ring labels */}
      <text x={CX} y={CY - 134} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#7C3AED" fontFamily={FONT}>Cerchio esterno</text>
      <text x={CX} y={CY - 78} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={BLUE} fontFamily={FONT}>Cerchio interno</text>

      {/* assigned items — inner */}
      {getPositionsInRing("inner", 72).map(item => (
        <g key={item.personId}>
          <circle cx={item.x} cy={item.y} r={14} fill={`${BLUE}18`} stroke={BLUE} strokeWidth={1.5} />
          <text x={item.x} y={item.y + 4} textAnchor="middle" fontSize="7" fontWeight="700" fill={BLUE} fontFamily={FONT}>
            {item.name.split(" ")[0].slice(0, 8)}
          </text>
        </g>
      ))}
      {/* assigned items — outer */}
      {getPositionsInRing("outer", 126).map(item => (
        <g key={item.personId}>
          <circle cx={item.x} cy={item.y} r={16} fill="rgba(124,58,237,0.1)" stroke="#7C3AED" strokeWidth={1.5} />
          <text x={item.x} y={item.y + 4} textAnchor="middle" fontSize="7" fontWeight="700" fill="#7C3AED" fontFamily={FONT}>
            {item.name.split(" ")[0].slice(0, 8)}
          </text>
        </g>
      ))}

      {/* pending highlight */}
      {pendingId && (
        <>
          <text x={CX} y={280} textAnchor="middle" fontSize="9" fill="#374151" fontFamily={FONT} fontWeight="600">
            Clicca un cerchio per assegnare
          </text>
        </>
      )}
    </svg>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function ConnessioniCheNutrono({ onHome }) {
  const [view, setView] = useState("intro");      // intro | map | question | summary
  const [assignments, setAssignments] = useState([]);
  const [pendingPerson, setPendingPerson] = useState(null);
  const [outsideList, setOutsideList] = useState([]);
  const [questions, setQuestions] = useState({});   // personId → string
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [questionTarget, setQuestionTarget] = useState(null);

  const assignedIds = [...assignments.map(a => a.personId), ...outsideList];

  const handlePersonClick = (person) => {
    if (assignedIds.includes(person.id)) return;
    setPendingPerson(person);
  };

  const handleRingClick = (ringId) => {
    if (!pendingPerson) return;
    setAssignments(prev => [...prev, { personId: pendingPerson.id, name: pendingPerson.name, ringId }]);
    setQuestionTarget(pendingPerson);
    setPendingQuestion("");
    setPendingPerson(null);
    setView("question");
  };

  const handleOutside = () => {
    if (!pendingPerson) return;
    setOutsideList(prev => [...prev, pendingPerson.id]);
    setQuestionTarget(pendingPerson);
    setPendingQuestion("");
    setPendingPerson(null);
    setView("question");
  };

  const saveQuestion = () => {
    setQuestions(prev => ({ ...prev, [questionTarget.id]: pendingQuestion }));
    setView("map");
    setQuestionTarget(null);
    setPendingQuestion("");
  };

  const allAssigned = assignedIds.length === PEOPLE_LIST.length;

  const getRingForPerson = (id) => assignments.find(a => a.personId === id)?.ringId;

  /* ══════════════ INTRO ══════════════ */
  if (view === "intro") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
        <Navbar phase="Nutri" exercise="Connessioni che Nutrono" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ maxWidth: 580, width: "100%", background: "#FFF", borderRadius: 20, padding: "44px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 38, textAlign: "center", marginBottom: 16 }}>🕸</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Connessioni che Nutrono</h1>
            <div style={{ background: "#F8FBFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Il caso di {CASE_COACHEE.name} — {CASE_COACHEE.role}</div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{CASE_COACHEE.context}</p>
            </div>
            <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 28 }}>
              Posiziona le {PEOPLE_LIST.length} persone e contesti nei cerchi concentrici, poi aggiungi una domanda di coaching per portare {CASE_COACHEE.name} a ragionare su ogni relazione.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
              {RINGS.map(r => (
                <div key={r.id} style={{ flex: 1, minWidth: 130, background: `${r.color}08`, border: `1px solid ${r.color}25`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: r.color, marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{r.desc}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setView("map")}
              style={{ width: "100%", background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
              onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
              onMouseLeave={e => e.currentTarget.style.background = BLUE}
            >
              Inizia la mappatura →
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ QUESTION ══════════════ */
  if (view === "question") {
    const ringId = getRingForPerson(questionTarget?.id);
    const ring = RINGS.find(r => r.id === ringId) || RINGS[2];
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar phase="Nutri" exercise="Connessioni che Nutrono" subtitle="Domanda di coaching" onHome={onHome} />
        <main style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 24px" }}>
          <div style={{ maxWidth: 560, width: "100%", background: "#FFF", borderRadius: 20, padding: "40px 44px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${ring.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {outsideList.includes(questionTarget?.id) ? "⚠️" : ringId === "inner" ? "🔵" : "🟣"}
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{questionTarget?.name}</div>
                <div style={{ fontSize: 13, color: ring.color, fontWeight: 600 }}>{ring.label}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{questionTarget?.role}</div>
              </div>
            </div>
            <div style={{ background: `${ring.color}08`, border: `1px solid ${ring.color}20`, borderRadius: 10, padding: "10px 14px", marginBottom: 22, fontSize: 13, color: "#374151", fontStyle: "italic" }}>
              {questionTarget?.hint}
            </div>
            <label style={{ fontSize: 14, fontWeight: 700, display: "block", marginBottom: 8 }}>
              Che domanda faresti a {CASE_COACHEE.name} su questa relazione?
            </label>
            <textarea
              value={pendingQuestion}
              onChange={e => setPendingQuestion(e.target.value)}
              placeholder={`Es. "Quanto spazio dai a ${questionTarget?.name?.split(" ")[0]} nelle tue decisioni recenti?" oppure "Cosa ti aspetti da questo rapporto adesso che stai cambiando?"…`}
              rows={4}
              style={{
                width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 10,
                padding: "12px 14px", fontSize: 14, fontFamily: FONT, lineHeight: 1.6,
                resize: "vertical", outline: "none", color: "#1A2B3C", background: "#FAFCFF",
              }}
              onFocus={e => e.target.style.borderColor = ring.color}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button
                onClick={() => { setView("map"); setPendingQuestion(""); setQuestionTarget(null); }}
                style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                Salta
              </button>
              <button
                onClick={saveQuestion}
                style={{ background: ring.color, color: "#FFF", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Salva domanda ✓
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ MAP ══════════════ */
  if (view === "map") {
    const remaining = PEOPLE_LIST.filter(p => !assignedIds.includes(p.id));
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
        <Navbar
          phase="Nutri" exercise="Connessioni che Nutrono" onHome={onHome}
          right={
            <span style={{ fontSize: 13, fontWeight: 600, color: allAssigned ? "#059669" : "#9CA3AF" }}>
              {assignedIds.length}/{PEOPLE_LIST.length} posizionati
            </span>
          }
        />
        <main style={{ flex: 1, overflow: "auto", padding: "28px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 24, flexWrap: "wrap" }}>
            {/* circle map */}
            <div style={{ flex: "0 0 280px" }}>
              <div style={{ background: "#FFF", borderRadius: 20, padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "sticky", top: 28 }}>
                <CircleMap
                  assignments={assignments}
                  pendingId={pendingPerson?.id}
                  onRingClick={handleRingClick}
                />
                {pendingPerson && (
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#374151" }}>
                      Posiziona: <span style={{ color: BLUE }}>{pendingPerson.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => handleRingClick("inner")} style={{ background: `${BLUE}14`, border: `1.5px solid ${BLUE}`, color: BLUE, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                        Cerchio interno
                      </button>
                      <button onClick={() => handleRingClick("outer")} style={{ background: "rgba(124,58,237,0.1)", border: "1.5px solid #7C3AED", color: "#7C3AED", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                        Cerchio esterno
                      </button>
                      <button onClick={handleOutside} style={{ background: "rgba(220,38,38,0.08)", border: "1.5px solid #DC2626", color: "#DC2626", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                        Fuori dalla mappa
                      </button>
                    </div>
                    <button onClick={() => setPendingPerson(null)} style={{ marginTop: 8, background: "none", border: "none", fontSize: 12, color: "#9CA3AF", cursor: "pointer", fontFamily: FONT }}>
                      Annulla
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* people list */}
            <div style={{ flex: 1, minWidth: 280 }}>
              {remaining.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2B3C", marginBottom: 12 }}>
                    Da posizionare ({remaining.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {remaining.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handlePersonClick(p)}
                        style={{
                          background: pendingPerson?.id === p.id ? `${BLUE}10` : "#FFF",
                          border: `1.5px solid ${pendingPerson?.id === p.id ? BLUE : "#E2E8F0"}`,
                          borderRadius: 12, padding: "12px 16px", cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { if (pendingPerson?.id !== p.id) e.currentTarget.style.borderColor = BLUE; }}
                        onMouseLeave={e => { if (pendingPerson?.id !== p.id) e.currentTarget.style.borderColor = "#E2E8F0"; }}
                      >
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</span>
                          <span style={{ fontSize: 11, background: p.type === "person" ? `${BLUE}12` : "#F3F4F6", color: p.type === "person" ? BLUE : "#6B7280", borderRadius: 6, padding: "1px 7px", fontWeight: 600 }}>
                            {p.type === "person" ? "Persona" : "Contesto"}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{p.role}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, fontStyle: "italic" }}>{p.hint}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* assigned */}
              {assignedIds.length > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2B3C", marginBottom: 10 }}>Posizionati</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {PEOPLE_LIST.filter(p => assignedIds.includes(p.id)).map(p => {
                      const ringId = getRingForPerson(p.id);
                      const isOutside = outsideList.includes(p.id);
                      const ring = isOutside ? RINGS[2] : RINGS.find(r => r.id === ringId);
                      return (
                        <div key={p.id} style={{ background: "#F8FBFF", borderRadius: 10, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: ring?.color, background: `${ring?.color}14`, borderRadius: 6, padding: "1px 8px" }}>{ring?.sublabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {allAssigned && (
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setView("summary")}
                    style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
                    onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK}
                    onMouseLeave={e => e.currentTarget.style.background = BLUE}
                  >
                    Vedi report →
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ══════════════ SUMMARY ══════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
      <Navbar phase="Nutri" exercise="Connessioni che Nutrono" subtitle="Report" onHome={onHome} />
      <main style={{ flex: 1, overflow: "auto", padding: "36px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Mappa relazionale di {CASE_COACHEE.name}</h2>
          {RINGS.map(ring => {
            const items = ring.id === "outside"
              ? PEOPLE_LIST.filter(p => outsideList.includes(p.id))
              : PEOPLE_LIST.filter(p => assignments.find(a => a.personId === p.id && a.ringId === ring.id));
            if (items.length === 0) return null;
            return (
              <div key={ring.id} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: ring.color, marginBottom: 10 }}>
                  {ring.label} ({ring.sublabel})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map(p => (
                    <div key={p.id} style={{ background: "#FFF", borderRadius: 12, padding: "14px 18px", borderLeft: `3px solid ${ring.color}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: questions[p.id] ? 6 : 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{p.role}</span>
                      </div>
                      {questions[p.id] && (
                        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, fontStyle: "italic" }}>
                          <span style={{ fontWeight: 600, color: ring.color, fontStyle: "normal" }}>Domanda: </span>"{questions[p.id]}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ background: "#FFFBEB", border: "1.5px dashed #FCD34D", borderRadius: 14, padding: "18px 24px", fontSize: 14, color: "#92400E", marginTop: 8 }}>
            Inserisci qui feature del prof — confronto con assegnazioni di riferimento inserite a priori nel sistema
          </div>
        </div>
      </main>
    </div>
  );
}
