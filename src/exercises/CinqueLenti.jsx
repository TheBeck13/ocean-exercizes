import { useState, useEffect, useRef, useMemo } from "react";
import Peer from "peerjs";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const FONT = "'Source Sans 3', sans-serif";

const PEER_PREFIX = "lenti";
const CODE_ALPHABET = "ABCDEF0123456789";
const genShortCode = () => {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return s;
};

const LENSES = [
  { id: "self",     label: "Io, qui e ora",                  description: "Il te stesso, quello di questo momento, che vive il tuo contesto e situazioni attuali.",                                                                            color: "#0099E6" },
  { id: "close",    label: "Una persona a me vicina",         description: "Vesti i panni di una persona a te vicina, ad esempio un partner o un amico.",                                                                                      color: "#7C3AED" },
  { id: "distant",  label: "Una persona distante da me",      description: "Immagina di essere una persona che conosci, ma abbastanza distante, come il tuo capo o un collega con cui hai pochi rapporti.",                                    color: "#D97706" },
  { id: "external", label: "Un osservatore esterno neutrale", description: "Calati nei panni di un osservatore esterno neutrale, come uno sconosciuto che ascolta di sfuggita la conversazione al bar.",                                       color: "#059669" },
  { id: "future",   label: "Te stesso tra 5 anni",            description: "Immagina adesso di essere te stesso fra 5 anni (o com'eri 5 anni fa).",                                                                                            color: "#DC2626" },
];

const EMPTY_LENSES = () => Object.fromEntries(LENSES.map(l => [l.id, { important: "", reaction: "", rationality: "" }]));

/* ═══ SHARED COMPONENTS ═══ */
function ReloadWarning() {
  return (
    <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#92400E", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ fontSize: 16, lineHeight: 1.2 }}>⚠️</span>
      <span>ATTENZIONE: non ricaricare la pagina, perderesti tutti i tuoi progressi di quest'esercizio!</span>
    </div>
  );
}

function StepDot({ index, current }) {
  const done = index < current;
  const active = index === current;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ width: active ? 28 : 22, height: active ? 28 : 22, borderRadius: "50%", background: done || active ? BLUE : "#E2E8F0", color: done || active ? "#FFF" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: active ? 13 : 11, fontWeight: 700, transition: "all 0.2s", border: active ? `2px solid ${BLUE_DARK}` : "none", fontFamily: FONT }}>
        {done ? "✓" : index + 1}
      </div>
    </div>
  );
}

function TextareaField({ label, hint, value, onChange, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#4B5563", marginBottom: 6, fontFamily: FONT }}>{label}</label>
      {hint && <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 6, lineHeight: 1.4 }}>{hint}</div>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: BG, fontSize: 15, fontFamily: FONT, color: "#1A2B3C", lineHeight: 1.55, resize: "vertical" }}
        onFocus={e => e.target.style.borderColor = BLUE}
        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
      />
    </div>
  );
}

function SituationBox({ situation }) {
  return (
    <div style={{ background: "#FFF", borderRadius: 10, padding: "12px 16px", marginBottom: 20, border: "1px solid #E2E8F0", fontSize: 15, color: "#4B5563", lineHeight: 1.5 }}>
      <span style={{ fontWeight: 600, color: "#1A2B3C" }}>Situazione: </span>{situation}
    </div>
  );
}

function LensForm({ lens, step, data, onChange }) {
  return (
    <div style={{ background: "#FFF", borderRadius: 16, border: `2px solid ${lens.color}22`, padding: "22px 24px", marginBottom: 24, boxShadow: `0 4px 20px ${lens.color}10` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: lens.color, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>{step + 1}</div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700 }}>{lens.label}</div>
          <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.4, marginTop: 2 }}>{lens.description}</div>
        </div>
      </div>
      <TextareaField label="Cosa vede come importante?" hint="Cosa considera prioritario o urgente in questa situazione?" value={data.important} onChange={v => onChange("important", v)} />
      <TextareaField label="Qual è la sua prima reazione tipica?" hint="Come risponde istintivamente a questa situazione?" value={data.reaction} onChange={v => onChange("reaction", v)} />
      <div>
        <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#4B5563", marginBottom: 8, fontFamily: FONT }}>Questa reazione è più emotiva o razionale?</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["Emotiva", "Razionale", "Entrambe"].map(opt => (
            <button key={opt} onClick={() => onChange("rationality", opt)}
              style={{ padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${data.rationality === opt ? lens.color : "#E2E8F0"}`, background: data.rationality === opt ? `${lens.color}14` : "#FFF", color: data.rationality === opt ? lens.color : "#6B7280", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT, transition: "all 0.15s" }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ PERSONAL FLOW (no networking) ═══ */
function PersonalFlow({ onHome }) {
  const [situation, setSituation] = useState("");
  const [step, setStep] = useState(-1);
  const [lenses, setLenses] = useState(EMPTY_LENSES);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  const updateLens = (id, field, value) => setLenses(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  const currentLens = step >= 0 && step < LENSES.length ? LENSES[step] : null;
  const canProceed = currentLens ? lenses[currentLens.id].important.trim() && lenses[currentLens.id].reaction.trim() : true;

  const handleExport = () => {
    const lines = ["MAPPA DI PROSPETTIVE — Le 5 Lenti", "═══════════════════════════════════", "", `SITUAZIONE: ${situation}`, "", ...LENSES.map(l => [`─── ${l.label.toUpperCase()} ───`, `Cosa vede come importante: ${lenses[l.id].important}`, `Prima reazione tipica: ${lenses[l.id].reaction}`, `Tipo di reazione: ${lenses[l.id].rationality || "—"}`, ""].join("\n"))];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "5-lenti-mappa-prospettive.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } textarea { outline: none; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #C0C8D0; border-radius: 3px; }`}</style>

      <Navbar exercise="Le 5 Lenti" onHome={onHome} subtitle="Sessione Personale" />

      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "32px 24px", animation: "fadeIn 0.4s ease" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>

          {step === -1 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Fase Osserva</div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Le 5 Lenti</h1>
              <p style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.65, marginBottom: 24 }}>Ogni situazione può essere vista in modi radicalmente diversi. In questo esercizio analizzerai lo stesso problema attraverso <strong>5 prospettive</strong> diverse, allenando la tua capacità di entrare nel mondo percettivo del coachee.</p>
              <div style={{ background: `${BLUE}08`, borderRadius: 12, padding: "16px 18px", marginBottom: 28, border: `1px solid ${BLUE}18` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 10 }}>Le 5 prospettive che esplorerai:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {LENSES.map((l, i) => (
                    <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: l.color, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div><div style={{ fontSize: 15, fontWeight: 600 }}>{l.label}</div><div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.4 }}>{l.description}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#1A2B3C", marginBottom: 8 }}>Descrivi la situazione problema</label>
                <textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder="Descrivi brevemente una situazione circoscritta su cui lavorare. Es: 'Ho difficoltà a delegare compiti al mio team durante i periodi di picco lavorativo.'" rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#FFF", fontSize: 15, fontFamily: FONT, color: "#1A2B3C", lineHeight: 1.55, resize: "vertical" }} onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </div>
              <button onClick={() => setStep(0)} disabled={!situation.trim()} style={{ background: situation.trim() ? BLUE : "#E2E8F0", color: situation.trim() ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: situation.trim() ? "pointer" : "not-allowed", fontFamily: FONT }} onMouseEnter={e => { if (situation.trim()) e.currentTarget.style.background = BLUE_DARK; }} onMouseLeave={e => { if (situation.trim()) e.currentTarget.style.background = BLUE; }}>
                Inizia le 5 Lenti →
              </button>
            </div>
          )}

          {step >= 0 && step < 5 && currentLens && (
            <div>
              <ReloadWarning />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
                {LENSES.map((_, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}><StepDot index={i} current={step} />{i < LENSES.length - 1 && <div style={{ height: 2, width: 24, background: i < step ? BLUE : "#E2E8F0", borderRadius: 2 }} />}</div>))}
              </div>
              <SituationBox situation={situation} />
              <LensForm lens={currentLens} step={step} data={lenses[currentLens.id]} onChange={(field, val) => updateLens(currentLens.id, field, val)} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setStep(s => s - 1)} style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6B7280" }}>← Indietro</button>
                <button onClick={() => setStep(s => s + 1)} disabled={!canProceed} style={{ background: canProceed ? BLUE : "#E2E8F0", color: canProceed ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 15, fontWeight: 700, cursor: canProceed ? "pointer" : "not-allowed", fontFamily: FONT }} onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = BLUE_DARK; }} onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = BLUE; }}>
                  {step === 4 ? "Vedi Riepilogo →" : "Lente successiva →"}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <ReloadWarning />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✓ Esercizio completato</div>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Mappa di Prospettive</h1>
              <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 24 }}>Hai analizzato la situazione attraverso tutte e 5 le lenti.</p>
              <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 18px", marginBottom: 24, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Situazione</div>
                <div style={{ fontSize: 16, color: "#1A2B3C", lineHeight: 1.55 }}>{situation}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {LENSES.map(l => (
                  <div key={l.id} style={{ background: "#FFF", borderRadius: 12, border: `1.5px solid ${l.color}22`, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: l.color, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{LENSES.indexOf(l) + 1}</div>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{l.label}</span>
                      {lenses[l.id].rationality && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: l.color, background: `${l.color}12`, borderRadius: 8, padding: "2px 8px" }}>{lenses[l.id].rationality}</span>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Cosa vede</div><div style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.5 }}>{lenses[l.id].important}</div></div>
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Prima reazione</div><div style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.5 }}>{lenses[l.id].reaction}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={handleExport} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }} onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK} onMouseLeave={e => e.currentTarget.style.background = BLUE}>↓ Esporta come testo</button>
                <button onClick={() => { setStep(-1); setSituation(""); setLenses(EMPTY_LENSES()); }} style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6B7280" }}>Ricomincia</button>
                <button onClick={onHome} style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "11px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6B7280" }}>← Home</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ TRAINER FLOW (hub peer) ═══ */
function TrainerFlow({ onHome }) {
  const [phase, setPhase] = useState("setup");   // setup | active | results
  const [situation, setSituation] = useState("");
  const [shortCode, setShortCode] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [submissions, setSubmissions] = useState([]); // [{studentId, lenses}]
  const [error, setError] = useState("");

  const scrollRef = useRef(null);
  const peerRef = useRef(null);
  const situationRef = useRef("");
  const connsRef = useRef(new Map()); // peerId → DataConnection

  useEffect(() => { situationRef.current = situation; }, [situation]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [phase]);

  useEffect(() => () => {
    if (peerRef.current) { try { peerRef.current.destroy(); } catch (e) { /* noop */ } peerRef.current = null; }
    connsRef.current.clear();
  }, []);

  const createPeer = () => {
    const code = genShortCode();
    const peerId = `${PEER_PREFIX}-${code}`;
    const peer = new Peer(peerId);
    peerRef.current = peer;

    peer.on("open", () => {
      setShortCode(code);
      setPhase("active");
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
      connsRef.current.set(conn.peer, conn);
      conn.on("open", () => {
        conn.send({ type: "situation", situation: situationRef.current });
      });
      conn.on("data", (msg) => {
        if (!msg || !msg.type) return;
        if (msg.type === "submission" && msg.studentId) {
          setSubmissions(prev => {
            const filtered = prev.filter(s => s.studentId !== msg.studentId);
            return [...filtered, { studentId: msg.studentId, lenses: msg.lenses }];
          });
        }
      });
      conn.on("close", () => { connsRef.current.delete(conn.peer); });
    });
  };

  const handleStart = () => {
    setError("");
    createPeer();
  };

  useEffect(() => {
    if (!shortCode) return;
    const url = `${window.location.origin}${window.location.pathname}?session=${shortCode}`;
    import("qrcode").then(({ default: QRCode }) => {
      QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: "#0077B3", light: "#F8FBFF" } })
        .then(setQrDataUrl);
    });
  }, [shortCode]);

  const handleClose = () => {
    connsRef.current.forEach(conn => {
      try { if (conn.open) conn.send({ type: "closed" }); } catch (e) { /* noop */ }
    });
    setPhase("results");
  };

  const sessionUrl = shortCode ? `${window.location.origin}${window.location.pathname}?session=${shortCode}` : "";
  const submissionCount = submissions.length;
  const sessionData = { situation, submissions };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } textarea { outline: none; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #C0C8D0; border-radius: 3px; }`}</style>

      <Navbar exercise="Le 5 Lenti" onHome={onHome} subtitle="Formatore" />

      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "32px 24px", animation: "fadeIn 0.4s ease" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {phase === "setup" && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Sessione in Aula</div>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Avvia Sessione</h1>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, marginBottom: 28 }}>Inserisci la situazione su cui gli studenti lavoreranno. Dopo aver avviato la sessione riceverai un QR code da mostrare in aula. La connessione è <strong>peer-to-peer</strong>: i dati degli studenti non transitano da alcun server.</p>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#1A2B3C", marginBottom: 8 }}>Situazione da analizzare</label>
                <textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder="Es: 'Un manager fatica a comunicare i cambiamenti organizzativi al suo team senza generare resistenze.'" rows={5} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#FFF", fontSize: 15, fontFamily: FONT, color: "#1A2B3C", lineHeight: 1.55, resize: "vertical" }} onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
              </div>
              {error && <div style={{ color: "#DC2626", fontSize: 14, marginBottom: 16, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA" }}>{error}</div>}
              <button onClick={handleStart} disabled={!situation.trim()} style={{ background: situation.trim() ? BLUE : "#E2E8F0", color: situation.trim() ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: situation.trim() ? "pointer" : "not-allowed", fontFamily: FONT }} onMouseEnter={e => { if (situation.trim()) e.currentTarget.style.background = BLUE_DARK; }} onMouseLeave={e => { if (situation.trim()) e.currentTarget.style.background = BLUE; }}>
                Avvia Sessione →
              </button>
            </div>
          )}

          {phase === "active" && (
            <div>
              <ReloadWarning />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", animation: "pulse 1.5s infinite" }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sessione Attiva</div>
              </div>
              <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Codice sessione: <span style={{ color: BLUE, fontFamily: "monospace", letterSpacing: 4 }}>{shortCode}</span></h1>

              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, marginBottom: 28, alignItems: "start" }}>
                <div style={{ background: "#FFF", borderRadius: 16, padding: 16, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  {qrDataUrl
                    ? <img src={qrDataUrl} alt="QR Code sessione" style={{ width: 200, height: 200 }} />
                    : <div style={{ width: 200, height: 200, background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 14 }}>Generazione...</div>
                  }
                  <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>Scansiona per partecipare</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Situazione</div>
                    <div style={{ fontSize: 15, color: "#1A2B3C", lineHeight: 1.5 }}>{situation}</div>
                  </div>
                  <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 16px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>URL sessione</div>
                    <div style={{ fontSize: 13, color: "#4B5563", wordBreak: "break-all", lineHeight: 1.5 }}>{sessionUrl}</div>
                  </div>
                  <div style={{ background: `${BLUE}08`, borderRadius: 12, padding: "16px 18px", border: `1px solid ${BLUE}20` }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: BLUE }}>{submissionCount}</div>
                    <div style={{ fontSize: 14, color: "#4B5563", marginTop: 2 }}>studenti hanno inviato le risposte</div>
                  </div>
                </div>
              </div>

              {error && <div style={{ color: "#DC2626", fontSize: 14, marginBottom: 16, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA" }}>{error}</div>}

              <button onClick={handleClose} style={{ background: "#DC2626", color: "#FFF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT }} onMouseEnter={e => e.currentTarget.style.background = "#B91C1C"} onMouseLeave={e => e.currentTarget.style.background = "#DC2626"}>
                Termina Sessione e Visualizza Risultati
              </button>
            </div>
          )}

          {phase === "results" && (
            <div>
              <ReloadWarning />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✓ Sessione Terminata</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Risultati della Classe</h1>
              <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 20 }}>{sessionData.submissions.length} studenti hanno completato l'esercizio.</p>

              <div style={{ background: "#FFF", borderRadius: 12, padding: "14px 18px", marginBottom: 24, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Situazione</div>
                <div style={{ fontSize: 15, color: "#1A2B3C", lineHeight: 1.55 }}>{sessionData.situation}</div>
              </div>

              <div style={{ background: "#F9FAFB", borderRadius: 12, border: "1.5px dashed #D1D5DB", padding: "18px 20px", marginBottom: 24, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#9CA3AF", fontStyle: "italic" }}>
                  Inserisci qui feature del prof — Analisi completa con risposte di tutti gli studenti
                </div>
              </div>

              {sessionData.submissions.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF", fontSize: 15 }}>Nessuno studente ha inviato risposte.</div>
              )}

              {LENSES.map(lens => (
                <div key={lens.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: lens.color, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{LENSES.indexOf(lens) + 1}</div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{lens.label}</div>
                  </div>
                  {sessionData.submissions.length === 0
                    ? <div style={{ fontSize: 13, color: "#9CA3AF", paddingLeft: 38 }}>—</div>
                    : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {sessionData.submissions.map((sub, i) => {
                          const l = sub.lenses?.[lens.id];
                          if (!l) return null;
                          return (
                            <div key={sub.studentId} style={{ background: "#FFF", borderRadius: 10, border: `1px solid ${lens.color}20`, padding: "12px 14px", marginLeft: 38 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 6 }}>Studente {i + 1}{l.rationality && <span style={{ marginLeft: 8, color: lens.color, background: `${lens.color}12`, borderRadius: 6, padding: "1px 7px" }}>{l.rationality}</span>}</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div><div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 2 }}>Cosa vede</div><div style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.4 }}>{l.important || "—"}</div></div>
                                <div><div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 2 }}>Prima reazione</div><div style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.4 }}>{l.reaction || "—"}</div></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  }
                </div>
              ))}

              <button onClick={onHome} style={{ marginTop: 12, background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }} onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK} onMouseLeave={e => e.currentTarget.style.background = BLUE}>
                Torna alla Home
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══ STUDENT FLOW (peer joiner) ═══ */
function StudentFlow({ sessionCode, onHome }) {
  const scrollRef = useRef(null);
  const peerRef = useRef(null);
  const connRef = useRef(null);

  const studentId = useMemo(() => {
    let id = sessionStorage.getItem("lenti_student_id");
    if (!id) { id = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`; sessionStorage.setItem("lenti_student_id", id); }
    return id;
  }, []);

  const [phase, setPhase] = useState("loading");  // loading | invalid | active | submitted | closed
  const [situation, setSituation] = useState("");
  const [step, setStep] = useState(-1);
  const [lenses, setLenses] = useState(EMPTY_LENSES);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step, phase]);

  const updateLens = (id, field, value) => setLenses(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  const currentLens = step >= 0 && step < LENSES.length ? LENSES[step] : null;
  const canProceed = currentLens ? lenses[currentLens.id].important.trim() && lenses[currentLens.id].reaction.trim() : true;

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
          setPhase(prev => prev === "loading" ? "active" : prev);
        } else if (msg.type === "closed") {
          setPhase(prev => prev === "submitted" ? "closed" : prev === "active" ? "closed" : prev);
        }
      });
      conn.on("close", () => {
        setPhase(prev => (prev === "submitted" || prev === "active") ? "closed" : prev);
      });
    });

    peer.on("error", (err) => {
      if (err.type === "peer-unavailable") setPhase("invalid");
    });

    return () => { try { peer.destroy(); } catch (e) { /* noop */ } peerRef.current = null; };
  }, [sessionCode]);

  const handleSubmit = () => {
    const conn = connRef.current;
    if (!conn || !conn.open) return;
    setSubmitting(true);
    try {
      conn.send({ type: "submission", studentId, lenses });
      setPhase("submitted");
    } catch (e) {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } textarea { outline: none; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #C0C8D0; border-radius: 3px; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <Navbar exercise="Le 5 Lenti" onHome={onHome} subtitle="Studente" />

      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "32px 24px", animation: "fadeIn 0.4s ease" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>

          {phase === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ fontSize: 15, color: "#6B7280" }}>Connessione peer-to-peer alla sessione {sessionCode}…</div>
            </div>
          )}

          {phase === "invalid" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sessione non trovata</h2>
              <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 28 }}>Il link che hai usato non è valido, la sessione è già terminata o il formatore ha chiuso la pagina.</p>
              <button onClick={onHome} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Torna alla Home</button>
            </div>
          )}

          {phase === "active" && step === -1 && (
            <div>
              <ReloadWarning />
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Sessione in Aula — Fase Osserva</div>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Le 5 Lenti</h1>
              <p style={{ fontSize: 15, color: "#4B5563", lineHeight: 1.65, marginBottom: 20 }}>Analizzerai la seguente situazione attraverso <strong>5 prospettive</strong> diverse. Per ciascuna, indica cosa considera importante quella prospettiva e qual è la sua prima reazione.</p>
              <SituationBox situation={situation} />
              <div style={{ background: `${BLUE}08`, borderRadius: 12, padding: "16px 18px", marginBottom: 28, border: `1px solid ${BLUE}18` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 10 }}>Le 5 prospettive che esplorerai:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {LENSES.map((l, i) => (
                    <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: l.color, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div><div style={{ fontSize: 15, fontWeight: 600 }}>{l.label}</div><div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.4 }}>{l.description}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(0)} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT }} onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK} onMouseLeave={e => e.currentTarget.style.background = BLUE}>
                Inizia →
              </button>
            </div>
          )}

          {phase === "active" && step >= 0 && step < 5 && currentLens && (
            <div>
              <ReloadWarning />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
                {LENSES.map((_, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}><StepDot index={i} current={step} />{i < LENSES.length - 1 && <div style={{ height: 2, width: 24, background: i < step ? BLUE : "#E2E8F0", borderRadius: 2 }} />}</div>))}
              </div>
              <SituationBox situation={situation} />
              <LensForm lens={currentLens} step={step} data={lenses[currentLens.id]} onChange={(field, val) => updateLens(currentLens.id, field, val)} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setStep(s => Math.max(-1, s - 1))} style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6B7280" }}>← Indietro</button>
                {step < 4
                  ? <button onClick={() => setStep(s => s + 1)} disabled={!canProceed} style={{ background: canProceed ? BLUE : "#E2E8F0", color: canProceed ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 15, fontWeight: 700, cursor: canProceed ? "pointer" : "not-allowed", fontFamily: FONT }} onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = BLUE_DARK; }} onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = BLUE; }}>Lente successiva →</button>
                  : <button onClick={handleSubmit} disabled={!canProceed || submitting} style={{ background: canProceed ? "#059669" : "#E2E8F0", color: canProceed ? "#FFF" : "#9CA3AF", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 15, fontWeight: 700, cursor: canProceed ? "pointer" : "not-allowed", fontFamily: FONT }} onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = "#047857"; }} onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = "#059669"; }}>
                    {submitting ? "Invio..." : "Invia Risposte ✓"}
                  </button>
                }
              </div>
            </div>
          )}

          {phase === "submitted" && (
            <div>
              <ReloadWarning />
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Grazie per aver partecipato!</h2>
                <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, marginBottom: 28 }}>Le tue risposte sono state inviate con successo.<br />Attendi che il formatore concluda la sessione.</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#9CA3AF", fontSize: 14 }}>
                  <div style={{ width: 18, height: 18, border: "2px solid #9CA3AF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  In attesa...
                </div>
              </div>
            </div>
          )}

          {phase === "closed" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sessione conclusa</h2>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, marginBottom: 28 }}>Il formatore ha terminato la sessione. Grazie per la tua partecipazione!</p>
              <button onClick={onHome} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }} onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK} onMouseLeave={e => e.currentTarget.style.background = BLUE}>
                Torna alla Home
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══ MODE SELECTION SCREEN ═══ */
function ModeSelectScreen({ onHome, onPersonal, onTrainer }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <Navbar exercise="Le 5 Lenti" onHome={onHome} />

      <div style={{ flex: 1, overflow: "auto", padding: "48px 24px", animation: "fadeIn 0.4s ease" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Fase Osserva</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Le 5 Lenti</h1>
          <p style={{ fontSize: 16, color: "#4B5563", lineHeight: 1.6, marginBottom: 36 }}>Scegli come vuoi svolgere l'esercizio:</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button onClick={onPersonal} style={{ background: "#FFF", border: `2px solid ${BLUE}30`, borderRadius: 16, padding: "24px 28px", textAlign: "left", cursor: "pointer", fontFamily: FONT, transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = `0 4px 20px ${BLUE}20`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${BLUE}30`; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "#1A2B3C" }}>Sessione Personale</div>
              </div>
              <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5, paddingLeft: 58 }}>Svolgi l'esercizio individualmente: inserisci la tua situazione e analizzala attraverso le 5 lenti.</div>
            </button>

            <button onClick={onTrainer} style={{ background: "#FFF", border: `2px solid #7C3AED30`, borderRadius: 16, padding: "24px 28px", textAlign: "left", cursor: "pointer", fontFamily: FONT, transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.boxShadow = "0 4px 20px #7C3AED20"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#7C3AED30"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#7C3AED12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏫</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "#1A2B3C" }}>Sessione in Aula</div>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#7C3AED", background: "#7C3AED12", borderRadius: 6, padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Formatore</span>
              </div>
              <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5, paddingLeft: 58 }}>Avvia una sessione collettiva: genera un QR code per gli studenti, monitora le risposte in tempo reale e visualizza i risultati al termine.</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ ROOT EXPORT ═══ */
export default function CinqueLenti({ onHome }) {
  const urlSessionCode = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get("session");
    if (!raw) return null;
    const up = raw.toUpperCase();
    return /^[A-F0-9]{6}$/.test(up) ? up : null;
  }, []);

  const [mode, setMode] = useState(urlSessionCode ? "student" : null);

  const safeOnHome = () => {
    if (window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    onHome();
  };

  if (mode === "student" || urlSessionCode) return <StudentFlow sessionCode={urlSessionCode} onHome={safeOnHome} />;
  if (mode === "personal")                  return <PersonalFlow onHome={safeOnHome} />;
  if (mode === "trainer")                   return <TrainerFlow onHome={safeOnHome} />;
  return <ModeSelectScreen onHome={safeOnHome} onPersonal={() => setMode("personal")} onTrainer={() => setMode("trainer")} />;
}
