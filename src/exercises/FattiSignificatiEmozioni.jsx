import { useState, useRef, useEffect, useMemo } from "react";
import Peer from "peerjs";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";
const STYLE_RESET = `textarea { outline: none; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #C0C8D0; border-radius: 3px; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`;

const PEER_PREFIX = "fse";
const CODE_ALPHABET = "ABCDEF0123456789";
const genShortCode = () => {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return s;
};

const COLS = [
  {
    id: "fatti",
    label: "Fatti osservabili",
    color: "#059669",
    icon: "👁",
    hint: "Solo ciò che si vede o si sente: comportamenti, parole, gesti. Senza interpretazioni.",
    placeholder: "Es: 'Marco alza gli occhi al cielo, incrocia le braccia e non interviene per 12 minuti.'",
  },
  {
    id: "significati",
    label: "Significati attribuiti",
    color: "#7C3AED",
    icon: "💭",
    hint: "Ipotesi, giudizi, spiegazioni. Quale storia ti stai raccontando su ciò che vedi?",
    placeholder: "Es: 'Credo che Marco non sia d\\'accordo ma non voglia esporsi davanti al gruppo.'",
  },
  {
    id: "emozioni",
    label: "Emozioni percepite",
    color: "#D97706",
    icon: "❤",
    hint: "Cosa provi tu mentre osservi, e cosa immagini stia provando l'altra persona.",
    placeholder: "Es: 'Io provo tensione e un po\\' di fastidio. Marco mi sembra frustrato o stanco.'",
  },
];

const VIGNETTES = [
  { id: "riunione",   title: "Scena in riunione",     text: "Durante la riunione settimanale, Marco alza gli occhi al cielo mentre il collega Luca spiega il progetto. Poi incrocia le braccia e non interviene fino alla fine dell'incontro, nonostante il team leader lo inviti due volte a dire la sua." },
  { id: "feedback",   title: "Colloquio di feedback", text: "Durante il colloquio di feedback semestrale, Giulia guarda il telefono ogni trenta secondi, annuisce senza parlare e risponde con frasi di due o tre parole come 'ok', 'va bene', 'capisco'. Quando le viene chiesto un commento, risponde che è tutto a posto." },
  { id: "brainstorm", title: "Brainstorming",         text: "Durante un brainstorming, Paolo interrompe tre volte la collega Sara riformulando le sue idee con parole diverse e alzando il tono di voce. Sara alla terza interruzione smette di parlare, apre il laptop e comincia a digitare." },
];

const ROLES = {
  coach:   { id: "coach",   label: "Scheda del Coach",   short: "Coach",   color: "#0099E6", icon: "🎯", lead: "Compila osservando la scena come coach, dall'esterno." },
  coachee: { id: "coachee", label: "Scheda del Coachee", short: "Coachee", color: "#DB2777", icon: "🪞", lead: "Compila descrivendo la stessa scena dal tuo punto di vista, dall'interno." },
};

const INTERPRETATIVE_WORDS = [
  "sempre", "mai", "tutti", "nessuno", "ogni volta", "nemmeno una volta",
  "maleducato", "incompetente", "stupido", "pigro", "arrogante", "insicuro",
  "aggressivo", "ostile", "debole", "scortese", "egoista", "manipolatore",
  "falso", "inutile", "disinteressato", "svogliato", "disattento",
  "sbagliato", "giusto", "ovviamente", "chiaramente", "evidentemente",
  "tipico", "come al solito",
];

const DEBRIEF_QUESTIONS = [
  "Nei 'Fatti' sono entrate parole che in realtà sono giudizi? Come potresti riformularle in forma puramente descrittiva?",
  "Dove coach e coachee divergono di più nei 'Significati'? Che ipotesi alternative stai scartando?",
  "Le emozioni che hai attribuito all'altra persona sono davvero sue, o sono uno specchio delle tue reazioni?",
];

const EMPTY = () => ({ fatti: "", significati: "", emozioni: "" });

/* ═══ TEXT ANALYSIS ═══ */
const ESCAPE_REGEX = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BUILD_PATTERN = () => new RegExp(`\\b(${INTERPRETATIVE_WORDS.map(ESCAPE_REGEX).join("|")})\\b`, "gi");

function countInterpretiveHits(text) {
  if (!text) return 0;
  return (text.match(BUILD_PATTERN()) || []).length;
}

function HighlightedText({ text }) {
  if (!text || !text.trim()) return <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>—</span>;
  const pattern = BUILD_PATTERN();
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), hit: false });
    parts.push({ text: match[0], hit: true });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), hit: false });
  return (
    <span style={{ lineHeight: 1.55 }}>
      {parts.map((p, i) => p.hit
        ? <mark key={i} title="Parola-spia di interpretazione" style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 4, padding: "0 4px", fontWeight: 600 }}>{p.text}</mark>
        : <span key={i}>{p.text}</span>
      )}
    </span>
  );
}

/* ═══ SHARED UI ═══ */
function ReloadWarning() {
  return (
    <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#92400E", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ fontSize: 16, lineHeight: 1.2 }}>⚠️</span>
      <span>ATTENZIONE: non ricaricare la pagina, perderesti tutti i tuoi progressi di quest'esercizio!</span>
    </div>
  );
}

function SituationBox({ situation }) {
  return (
    <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: "1px solid #E2E8F0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Micro-situazione</div>
      <div style={{ fontSize: 15, color: "#1A2B3C", lineHeight: 1.55 }}>{situation}</div>
    </div>
  );
}

function ColumnCard({ col, value, onChange }) {
  const hits = col.id === "fatti" ? countInterpretiveHits(value) : 0;
  return (
    <div style={{ background: "#FFF", borderRadius: 14, border: `2px solid ${col.color}22`, padding: "18px 20px", marginBottom: 16, boxShadow: `0 2px 12px ${col.color}08` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${col.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{col.icon}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: col.color }}>{col.label}</div>
        {col.id === "fatti" && value && (
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: hits > 0 ? "#991B1B" : "#059669", background: hits > 0 ? "#FEE2E2" : "#D1FAE5", borderRadius: 8, padding: "2px 8px" }}>
            {hits > 0 ? `${hits} parola${hits > 1 ? "e" : ""}-spia` : "nessun giudizio"}
          </span>
        )}
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 10, lineHeight: 1.45 }}>{col.hint}</div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={col.placeholder}
        rows={4}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: BG, fontSize: 15, fontFamily: FONT, color: "#1A2B3C", lineHeight: 1.55, resize: "vertical", outline: "none" }}
        onFocus={e => e.target.style.borderColor = col.color}
        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
      />
    </div>
  );
}

function RoleBanner({ role }) {
  return (
    <div style={{ background: `${role.color}0A`, borderRadius: 12, border: `1.5px solid ${role.color}33`, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${role.color}1A`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{role.icon}</div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: role.color }}>{role.label}</div>
        <div style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.45, marginTop: 2 }}>{role.lead}</div>
      </div>
    </div>
  );
}

function ComparisonRow({ col, coachValue, coacheeValue }) {
  const isFatti = col.id === "fatti";
  return (
    <div style={{ background: "#FFF", borderRadius: 14, border: `1.5px solid ${col.color}22`, padding: "18px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${col.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{col.icon}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: col.color }}>{col.label}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[{ role: ROLES.coachee, value: coacheeValue }, { role: ROLES.coach, value: coachValue }].map(({ role, value }) => (
          <div key={role.id} style={{ background: BG, borderRadius: 10, padding: "12px 14px", border: `1px solid ${role.color}22` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: role.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13 }}>{role.icon}</span>{role.short}
            </div>
            <div style={{ fontSize: 14, color: "#1A2B3C", lineHeight: 1.55 }}>
              {isFatti ? <HighlightedText text={value} /> : (value && value.trim() ? value : <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>—</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaitingPanel({ title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: `${BLUE}14`, marginBottom: 20 }}>
        <div style={{ width: 30, height: 30, border: `3px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>{subtitle}</p>
    </div>
  );
}

function CompletionResults({ session, onHome, onRestart }) {
  const coach   = session.coach   || EMPTY();
  const coachee = session.coachee || EMPTY();
  const coachHits   = countInterpretiveHits(coach.fatti);
  const coacheeHits = countInterpretiveHits(coachee.fatti);
  const totalHits   = coachHits + coacheeHits;

  return (
    <div>
      <ReloadWarning />
      <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✓ Entrambi hanno inviato</div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Coachee vs Coach</h1>
      <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 22, lineHeight: 1.55 }}>
        Le due schede affiancate. Nella colonna <strong>Fatti</strong> sono evidenziate in rosso le parole-spia di interpretazione: ogni match è un'osservazione che potrebbe essere un giudizio travestito.
      </p>

      <SituationBox situation={session.situation} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: coacheeHits > 0 ? "#991B1B" : "#059669" }}>{coacheeHits}</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Parole-spia (Coachee)</div>
        </div>
        <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: coachHits > 0 ? "#991B1B" : "#059669" }}>{coachHits}</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Parole-spia (Coach)</div>
        </div>
        <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0", textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: totalHits === 0 ? "#059669" : BLUE }}>{totalHits === 0 ? "✓" : totalHits}</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{totalHits === 0 ? "Osservazione pulita" : "Totale interpretazioni"}</div>
        </div>
      </div>

      {COLS.map(col => (
        <ComparisonRow key={col.id} col={col} coachValue={coach[col.id]} coacheeValue={coachee[col.id]} />
      ))}

      <div style={{ background: `${BLUE}08`, borderRadius: 12, padding: "18px 20px", marginTop: 10, marginBottom: 20, border: `1px solid ${BLUE}1F` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 12 }}>Tre domande per il debrief</div>
        <ol style={{ paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {DEBRIEF_QUESTIONS.map((q, i) => (
            <li key={i} style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.55 }}>{q}</li>
          ))}
        </ol>
      </div>

      {/* Professor feature placeholders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <div style={{ background: "#FFFBEB", borderRadius: 12, border: "1.5px dashed #F59E0B", padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#92400E", fontStyle: "italic" }}>Implementa qui funzione del prof — <strong>Word Cloud</strong> delle risposte di coach e coachee</div>
        </div>
        <div style={{ background: "#FFFBEB", borderRadius: 12, border: "1.5px dashed #F59E0B", padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#92400E", fontStyle: "italic" }}>Implementa qui funzione del prof — <strong>Text Sentiment Analysis</strong> sulle colonne "Significati" ed "Emozioni"</div>
        </div>
        <div style={{ background: "#FFFBEB", borderRadius: 12, border: "1.5px dashed #F59E0B", padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#92400E", fontStyle: "italic" }}>Implementa qui funzione del prof — <strong>Emotions Analysis</strong> comparata tra le due schede</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {onRestart && <button onClick={onRestart} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }} onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK} onMouseLeave={e => e.currentTarget.style.background = BLUE}>Nuova sessione</button>}
        <button onClick={onHome} style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6B7280" }}>← Home</button>
      </div>
    </div>
  );
}

/* ═══ COACHEE FLOW (initiator peer) ═══ */
function CoacheeFlow({ onHome }) {
  const scrollRef = useRef(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);

  const [phase, setPhase] = useState("setup"); // setup | waiting | filling | submitted | complete
  const [situation, setSituation] = useState("");
  const [shortCode, setShortCode] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [coacheeData, setCoacheeData] = useState(EMPTY);
  const [coachData, setCoachData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [phase]);

  // Peer cleanup on unmount
  useEffect(() => () => {
    if (peerRef.current) { try { peerRef.current.destroy(); } catch (e) { /* noop */ } peerRef.current = null; }
  }, []);

  // Transition to complete as soon as both submissions are present
  useEffect(() => {
    if (coachData && phase === "submitted") setPhase("complete");
  }, [coachData, phase]);

  const createPeer = () => {
    const code = genShortCode();
    const peerId = `${PEER_PREFIX}-${code}`;
    const peer = new Peer(peerId);
    peerRef.current = peer;

    peer.on("open", () => {
      setShortCode(code);
      setPhase("waiting");
    });

    peer.on("error", (err) => {
      if (err.type === "unavailable-id") {
        try { peer.destroy(); } catch (e) { /* noop */ }
        peerRef.current = null;
        createPeer();
      } else {
        setError("Errore di connessione peer-to-peer. Controlla la tua rete e riprova.");
      }
    });

    peer.on("connection", (conn) => {
      connRef.current = conn;
      conn.on("open", () => {
        conn.send({ type: "situation", situation });
        setPhase(prev => prev === "waiting" ? "filling" : prev);
      });
      conn.on("data", (msg) => {
        if (msg && msg.type === "submission") setCoachData(msg.data);
      });
      conn.on("close", () => { connRef.current = null; });
    });
  };

  const handleStart = () => {
    setError("");
    createPeer();
  };

  // Generate QR once shortCode is known
  useEffect(() => {
    if (!shortCode) return;
    const url = `${window.location.origin}${window.location.pathname}?fse=${shortCode}`;
    import("qrcode").then(({ default: QRCode }) => {
      QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: "#0077B3", light: "#F8FBFF" } }).then(setQrDataUrl);
    });
  }, [shortCode]);

  const canSubmit = Object.values(coacheeData).every(v => v.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const conn = connRef.current;
    if (!conn || !conn.open) {
      setError("Connessione col coach perduta. Ricarica l'esercizio.");
      return;
    }
    setSubmitting(true);
    try {
      conn.send({ type: "submission", data: coacheeData });
      setPhase(coachData ? "complete" : "submitted");
    } catch (e) {
      setError("Errore durante l'invio. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    if (peerRef.current) { try { peerRef.current.destroy(); } catch (e) { /* noop */ } peerRef.current = null; }
    connRef.current = null;
    setShortCode(null); setQrDataUrl(""); setSituation(""); setCoacheeData(EMPTY()); setCoachData(null);
    setPhase("setup");
  };

  const sessionUrl = shortCode ? `${window.location.origin}${window.location.pathname}?fse=${shortCode}` : "";
  const session = { situation, coachee: coacheeData, coach: coachData || EMPTY() };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{STYLE_RESET}</style>
      <Navbar exercise="Fatti / Significati / Emozioni" onHome={onHome} subtitle="Coachee" />

      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "32px 24px", animation: "fadeIn 0.4s ease" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* SETUP */}
          {phase === "setup" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Fase Osserva · Nuova sessione</div>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Descrivi la micro-situazione</h1>
              <p style={{ fontSize: 15, color: "#4B5563", lineHeight: 1.6, marginBottom: 22 }}>
                In quanto <strong>coachee</strong>, racconta un episodio concreto su cui vuoi confrontarti con il tuo coach. Dopo la creazione riceverai un QR code: quando il coach lo scansiona potrete entrambi compilare le vostre schede. La connessione è <strong>peer-to-peer</strong>: i dati non transitano da alcun server.
              </p>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1A2B3C", marginBottom: 8 }}>La tua micro-situazione</label>
                <textarea
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  placeholder="Descrivi una scena concreta: chi c'era, cosa è successo, come si sono comportate le persone coinvolte. Min. 20 caratteri."
                  rows={5}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#FFF", fontSize: 15, fontFamily: FONT, color: "#1A2B3C", lineHeight: 1.55, resize: "vertical", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 8 }}>Oppure parti da una scena d'esempio:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {VIGNETTES.map(v => (
                    <button key={v.id} onClick={() => setSituation(v.text)}
                      style={{ background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontFamily: FONT, textAlign: "left", transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${BLUE}66`}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2B3C", marginBottom: 2 }}>{v.title}</div>
                      <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.45 }}>{v.text}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={{ color: "#DC2626", fontSize: 14, marginBottom: 16, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA" }}>{error}</div>}

              <button
                onClick={handleStart}
                disabled={situation.trim().length < 20}
                style={{ background: situation.trim().length >= 20 ? BLUE : "#E2E8F0", color: situation.trim().length >= 20 ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: situation.trim().length >= 20 ? "pointer" : "not-allowed", fontFamily: FONT }}
                onMouseEnter={e => { if (situation.trim().length >= 20) e.currentTarget.style.background = BLUE_DARK; }}
                onMouseLeave={e => { if (situation.trim().length >= 20) e.currentTarget.style.background = BLUE; }}
              >
                Crea sessione e genera QR →
              </button>
            </div>
          )}

          {/* WAITING */}
          {phase === "waiting" && (
            <div>
              <ReloadWarning />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", animation: "pulse 1.5s infinite" }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.08em" }}>In attesa del coach</div>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Codice sessione: <span style={{ color: BLUE, fontFamily: "monospace", letterSpacing: 4 }}>{shortCode}</span></h1>

              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, marginBottom: 20, alignItems: "start" }}>
                <div style={{ background: "#FFF", borderRadius: 16, padding: 16, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  {qrDataUrl
                    ? <img src={qrDataUrl} alt="QR Code sessione" style={{ width: 200, height: 200 }} />
                    : <div style={{ width: 200, height: 200, background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 14 }}>Generazione...</div>}
                  <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>Il coach scansiona per entrare</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>La tua micro-situazione</div>
                    <div style={{ fontSize: 14, color: "#1A2B3C", lineHeight: 1.5 }}>{situation}</div>
                  </div>
                  <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>URL sessione</div>
                    <div style={{ fontSize: 13, color: "#4B5563", wordBreak: "break-all", lineHeight: 1.5 }}>{sessionUrl}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: `${BLUE}08`, borderRadius: 12, padding: "14px 18px", border: `1px solid ${BLUE}1F`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 18, height: 18, border: `2px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", flexShrink: 0 }} />
                <div style={{ fontSize: 14, color: "#1A2B3C" }}>Appena il coach entra, passerai automaticamente alla compilazione della tua scheda.</div>
              </div>
            </div>
          )}

          {/* FILLING */}
          {phase === "filling" && (
            <div>
              <ReloadWarning />
              <RoleBanner role={ROLES.coachee} />
              <SituationBox situation={situation} />
              {COLS.map(col => (
                <ColumnCard key={col.id} col={col} value={coacheeData[col.id]} onChange={v => setCoacheeData(d => ({ ...d, [col.id]: v }))} />
              ))}
              {error && <div style={{ color: "#DC2626", fontSize: 14, marginTop: 12, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA" }}>{error}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  style={{ background: canSubmit ? "#059669" : "#E2E8F0", color: canSubmit ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: canSubmit && !submitting ? "pointer" : "not-allowed", fontFamily: FONT }}
                  onMouseEnter={e => { if (canSubmit && !submitting) e.currentTarget.style.background = "#047857"; }}
                  onMouseLeave={e => { if (canSubmit && !submitting) e.currentTarget.style.background = "#059669"; }}
                >
                  {submitting ? "Invio..." : "Invia la mia scheda ✓"}
                </button>
              </div>
            </div>
          )}

          {/* SUBMITTED */}
          {phase === "submitted" && (
            <div>
              <ReloadWarning />
              <WaitingPanel
                title="Scheda inviata. In attesa del coach…"
                subtitle="Quando anche il coach avrà inviato la sua scheda, vedrete entrambi il confronto affiancato con le parole-spia di interpretazione evidenziate."
              />
            </div>
          )}

          {/* COMPLETE */}
          {phase === "complete" && (
            <CompletionResults session={session} onHome={onHome} onRestart={handleRestart} />
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══ COACH FLOW (joiner peer) ═══ */
function CoachFlow({ sessionCode, onHome }) {
  const scrollRef = useRef(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);

  const [phase, setPhase] = useState("connecting"); // connecting | invalid | filling | submitted | complete
  const [situation, setSituation] = useState("");
  const [coachData, setCoachData] = useState(EMPTY);
  const [coacheeData, setCoacheeData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [phase]);

  useEffect(() => {
    if (!sessionCode) { setPhase("invalid"); return; }
    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", () => {
      const targetId = `${PEER_PREFIX}-${sessionCode}`;
      const conn = peer.connect(targetId, { reliable: true });
      connRef.current = conn;
      conn.on("data", (msg) => {
        if (!msg || !msg.type) return;
        if (msg.type === "situation") {
          setSituation(msg.situation);
          setPhase(prev => prev === "connecting" ? "filling" : prev);
        } else if (msg.type === "submission") {
          setCoacheeData(msg.data);
        }
      });
      conn.on("close", () => { connRef.current = null; });
    });

    peer.on("error", (err) => {
      if (err.type === "peer-unavailable") setPhase("invalid");
      else setError("Errore di connessione peer-to-peer.");
    });

    return () => { try { peer.destroy(); } catch (e) { /* noop */ } peerRef.current = null; };
  }, [sessionCode]);

  // Transition to complete as soon as both submissions are present
  useEffect(() => {
    if (coacheeData && phase === "submitted") setPhase("complete");
  }, [coacheeData, phase]);

  const canSubmit = Object.values(coachData).every(v => v.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const conn = connRef.current;
    if (!conn || !conn.open) {
      setError("Connessione col coachee perduta.");
      return;
    }
    setSubmitting(true);
    try {
      conn.send({ type: "submission", data: coachData });
      setPhase(coacheeData ? "complete" : "submitted");
    } catch (e) {
      setError("Errore durante l'invio. Riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  const session = coacheeData ? { situation, coach: coachData, coachee: coacheeData } : null;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{STYLE_RESET}</style>
      <Navbar exercise="Fatti / Significati / Emozioni" onHome={onHome} subtitle="Coach" />

      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "32px 24px", animation: "fadeIn 0.4s ease" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {phase === "connecting" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 15, color: "#6B7280" }}>Connessione peer-to-peer con il coachee…</div>
              <div style={{ fontSize: 13, color: "#9CA3AF" }}>Codice: {sessionCode}</div>
            </div>
          )}

          {phase === "invalid" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sessione non trovata</h2>
              <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 28 }}>Il codice usato non è valido, la sessione non esiste più o il coachee ha chiuso la pagina. Chiedi al coachee di generarne una nuova.</p>
              <button onClick={onHome} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Torna alla Home</button>
            </div>
          )}

          {phase === "filling" && (
            <div>
              <ReloadWarning />
              <RoleBanner role={ROLES.coach} />
              <SituationBox situation={situation} />
              {COLS.map(col => (
                <ColumnCard key={col.id} col={col} value={coachData[col.id]} onChange={v => setCoachData(d => ({ ...d, [col.id]: v }))} />
              ))}
              {error && <div style={{ color: "#DC2626", fontSize: 14, marginTop: 12, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA" }}>{error}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  style={{ background: canSubmit ? "#059669" : "#E2E8F0", color: canSubmit ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: canSubmit && !submitting ? "pointer" : "not-allowed", fontFamily: FONT }}
                  onMouseEnter={e => { if (canSubmit && !submitting) e.currentTarget.style.background = "#047857"; }}
                  onMouseLeave={e => { if (canSubmit && !submitting) e.currentTarget.style.background = "#059669"; }}
                >
                  {submitting ? "Invio..." : "Invia la mia scheda ✓"}
                </button>
              </div>
            </div>
          )}

          {phase === "submitted" && (
            <div>
              <ReloadWarning />
              <WaitingPanel
                title="Scheda inviata. In attesa del coachee…"
                subtitle="Appena il coachee avrà inviato anche la sua scheda, vedrete entrambi il confronto affiancato."
              />
            </div>
          )}

          {phase === "complete" && session && (
            <CompletionResults session={session} onHome={onHome} onRestart={null} />
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══ MODE SELECT SCREEN ═══ */
function ModeSelectScreen({ onHome, onCoachee, onCoach }) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const trimmed = code.trim().toUpperCase();
  const codeValid = /^[A-F0-9]{6}$/.test(trimmed);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{STYLE_RESET}</style>
      <Navbar exercise="Fatti / Significati / Emozioni" onHome={onHome} />

      <div style={{ flex: 1, overflow: "auto", padding: "48px 24px", animation: "fadeIn 0.4s ease" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Fase Osserva</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Fatti / Significati / Emozioni</h1>
          <p style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.6, marginBottom: 32 }}>
            Due persone osservano la stessa micro-situazione e compilano tre colonne (fatti, significati, emozioni). Alla fine il sistema mostra le schede affiancate evidenziando le parole-spia di interpretazione. La connessione è peer-to-peer: i dati non lasciano mai i vostri browser.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button onClick={onCoachee}
              style={{ background: "#FFF", border: "2px solid #DB277730", borderRadius: 16, padding: "22px 26px", textAlign: "left", cursor: "pointer", fontFamily: FONT, transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#DB2777"; e.currentTarget.style.boxShadow = "0 4px 20px #DB277722"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#DB277730"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#DB277714", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🪞</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "#1A2B3C" }}>Sono il coachee</div>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#DB2777", background: "#DB277712", borderRadius: 6, padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Crea</span>
              </div>
              <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5, paddingLeft: 58 }}>Avvia una nuova sessione, inserisci la micro-situazione e invia al coach il QR code per entrare.</div>
            </button>

            <div style={{ background: "#FFF", border: "2px solid #0099E630", borderRadius: 16, padding: "22px 26px", fontFamily: FONT }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#0099E614", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎯</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "#1A2B3C" }}>Sono il coach</div>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: BLUE, background: `${BLUE}14`, borderRadius: 6, padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Entra</span>
              </div>
              <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5, paddingLeft: 58, marginBottom: 14 }}>
                Se hai ricevuto un link o un QR code dal coachee, apri quello per entrare direttamente nella scheda. Altrimenti inserisci qui il codice sessione che ti ha comunicato.
              </div>

              {!showCodeInput && (
                <button onClick={() => setShowCodeInput(true)}
                  style={{ marginLeft: 58, background: "none", border: `1.5px solid ${BLUE}`, color: BLUE, borderRadius: 10, padding: "8px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                  Inserisci codice manualmente
                </button>
              )}
              {showCodeInput && (
                <div style={{ marginLeft: 58, display: "flex", gap: 8, alignItems: "stretch" }}>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Es: A3F9BC"
                    maxLength={6}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 16, fontFamily: "monospace", letterSpacing: 3, textTransform: "uppercase", outline: "none", color: "#1A2B3C" }}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                  <button onClick={() => onCoach(trimmed)} disabled={!codeValid}
                    style={{ background: codeValid ? BLUE : "#E2E8F0", color: codeValid ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 15, fontWeight: 700, cursor: codeValid ? "pointer" : "not-allowed", fontFamily: FONT }}
                    onMouseEnter={e => { if (codeValid) e.currentTarget.style.background = BLUE_DARK; }}
                    onMouseLeave={e => { if (codeValid) e.currentTarget.style.background = BLUE; }}>
                    Entra →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ ROOT EXPORT ═══ */
export default function FattiSignificatiEmozioni({ onHome }) {
  const urlFseCode = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get("fse");
    if (!raw) return null;
    const up = raw.toUpperCase();
    return /^[A-F0-9]{6}$/.test(up) ? up : null;
  }, []);

  const [mode, setMode] = useState(urlFseCode ? "coach" : null);
  const [coachSessionCode, setCoachSessionCode] = useState(urlFseCode || null);

  const safeOnHome = () => {
    if (window.location.search) window.history.replaceState({}, "", window.location.pathname);
    onHome();
  };

  if (mode === "coach" && coachSessionCode) return <CoachFlow sessionCode={coachSessionCode} onHome={safeOnHome} />;
  if (mode === "coachee") return <CoacheeFlow onHome={safeOnHome} />;
  return (
    <ModeSelectScreen
      onHome={safeOnHome}
      onCoachee={() => setMode("coachee")}
      onCoach={(code) => { setCoachSessionCode(code); setMode("coach"); }}
    />
  );
}
