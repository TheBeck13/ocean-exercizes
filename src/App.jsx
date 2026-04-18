import { useState } from "react";
import LOGO_SVG from "./public/logo.svg?raw";
import StoryMap from "./exercises/StoryMap.jsx";
import CinqueLenti from "./exercises/CinqueLenti.jsx";
import LaFoto from "./exercises/LaFoto.jsx";
import FattiSignificatiEmozioni from "./exercises/FattiSignificatiEmozioni.jsx";
import DalVagoAlloSMART from "./exercises/DalVagoAlloSMART.jsx";
import OggettiParlanti from "./exercises/OggettiParlanti.jsx";
import BiasHunter from "./exercises/BiasHunter.jsx";
import DiarioMicroAbitudini from "./exercises/DiarioMicroAbitudini.jsx";
import BackwardPlanning from "./exercises/BackwardPlanning.jsx";
import DiarioConsolidamento from "./exercises/DiarioConsolidamento.jsx";
import RuotaDellaVita from "./exercises/RuotaDellaVita.jsx";
import ConnessioniCheNutrono from "./exercises/ConnessioniCheNutrono.jsx";
import NutrireNonMotivare from "./exercises/NutrireNonMotivare.jsx";


/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const HEADER_H = 56;
const FONT = "'Source Sans 3', sans-serif";


/* ═══ COMPONENTS ═══ */
function Logo({ size = 40, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size, color: "#1A2B3C", flexShrink: 0, cursor: onClick ? "pointer" : "default" }}
      dangerouslySetInnerHTML={{ __html: LOGO_SVG }}
    />
  );
}


/* ═══ HOME SCREEN ═══ */
const OCEAN_PHASES = [
  { id: "osserva", letter: "O", name: "Osserva", description: "Allena la capacità di osservare il coachee con occhi nuovi, oltre le prime impressioni.", available: true },
  { id: "crea",    letter: "C", name: "Crea",    description: "Costruisci obiettivi concreti e piani d'azione condivisi con il coachee.", available: true },
  { id: "esponi",  letter: "E", name: "Esponi",  description: "Porta alla luce i pattern disfunzionali e le tentate soluzioni del coachee.", available: true },
  { id: "avviva",  letter: "A", name: "Avviva",  description: "Attiva il cambiamento con micro-interventi paradossali e prescrizioni.", available: true },
  { id: "nutri",   letter: "N", name: "Nutri",   description: "Consolida i progressi e sostieni la continuità del cambiamento nel tempo.", available: true },
];

function HomeScreen({ onSelectPhase }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin:0; padding:0; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <header style={{ padding: "0 32px", display: "flex", alignItems: "center", borderBottom: "1px solid #E8ECF0", background: "#FFF", height: HEADER_H, flexShrink: 0 }}>
        <Logo size={36} />
        <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 10, color: "#1A2B3C" }}>Steering Change — Esercizi per il Coach</span>
      </header>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", animation: "fadeIn 0.5s ease" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Modello O.C.E.A.N.</h1>
        <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 48, textAlign: "center", maxWidth: 480 }}>
          Seleziona una fase del modello di coaching per accedere agli esercizi interattivi.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
          {OCEAN_PHASES.map(ph => (
            <div
              key={ph.id}
              onClick={ph.available ? () => onSelectPhase(ph.id) : undefined}
              style={{ width: 158, background: "#FFF", border: `1.5px solid ${ph.available ? "#E2E8F0" : "#EAECEF"}`, borderRadius: 16, padding: "24px 18px 20px", cursor: ph.available ? "pointer" : "default", transition: "all 0.2s", opacity: ph.available ? 1 : 0.65, position: "relative", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}
              onMouseEnter={e => { if (ph.available) { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,153,230,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
              onMouseLeave={e => { if (ph.available) { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)"; e.currentTarget.style.transform = "translateY(0)"; } }}
            >
              {!ph.available && <div style={{ position: "absolute", top: 10, right: 10, fontSize: 10, fontWeight: 700, color: "#9CA3AF", background: "#F3F4F6", borderRadius: 8, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Presto</div>}
              <div style={{ width: 44, height: 44, borderRadius: 12, background: ph.available ? `${BLUE}14` : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: ph.available ? BLUE : "#9CA3AF" }}>{ph.letter}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: ph.available ? "#1A2B3C" : "#9CA3AF" }}>{ph.name}</div>
              <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5 }}>{ph.description}</div>
              {ph.available && <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: BLUE }}>Esplora →</div>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


/* ═══ PHASE SCREEN ═══ */
const PHASE_EXERCISES = {
  osserva: [
    { id: "storymap",     name: "Story Map",   description: "Simulazione interattiva della fase Osserva: naviga la mappa delle consapevolezze del coachee scegliendo le domande giuste.", tag: "Simulazione" },
    { id: "cinque-lenti", name: "Le 5 Lenti",  description: "Allena la capacità di immaginare 5 rappresentazioni diverse della stessa situazione, allenando il perception–reaction system.", tag: "Riflessione" },
    { id: "la-foto",      name: "La Foto",     description: "Allena l'attenzione intenzionale osservando la stessa immagine per 7 giorni consecutivi e scoprendo sempre nuovi dettagli.", tag: "Diario" },
    { id: "fatti-significati-emozioni", name: "Fatti / Significati / Emozioni", description: "Allena la distinzione tra osservazione e interpretazione compilando tre colonne su una micro-situazione prima come coach e poi come coachee, con confronto affiancato.", tag: "Analisi" },
  ],
  crea: [
    { id: "dal-vago-allo-smart", name: "Dal vago allo SMART", description: "Trasforma un desiderio vago in un obiettivo concreto e temporizzato, con scala di avanzamento e piano di micro-azioni.", tag: "Pianificazione" },
    { id: "oggetti-parlanti",    name: "Oggetti Parlanti",    description: "Usa oggetti quotidiani come metafore per esplorare l'obiettivo del coachee, le sue risorse e i possibili blocchi.", tag: "Metafora" },
  ],
  esponi: [
    { id: "bias-hunter",           name: "Bias Hunter",                     description: "Identifica 5 bias cognitivi comuni nella tua vita, analizza le decisioni influenzate e costruisci scenari alternativi.", tag: "Analisi" },
    { id: "diario-micro-abitudini", name: "Diario Micro-Abitudini",          description: "Tracker rapido delle tue micro-abitudini comunicative: registra ogni episodio in 30–60 secondi e visualizza il riepilogo settimanale.", tag: "Diario" },
  ],
  avviva: [
    { id: "backward-planning", name: "Backward Planning", description: "Costruisci un piano di cambiamento dal futuro al presente: visione a 6 mesi, traguardi intermedi e un primo passo concreto per i prossimi 7 giorni.", tag: "Pianificazione" },
  ],
  nutri: [
    { id: "diario-consolidamento",    name: "Diario di Consolidamento",  description: "Wizard guidato per costruire un piano strutturato di nuova abitudine: gancio alla routine, versione minima, piano anti-ricaduta.", tag: "Diario" },
    { id: "ruota-della-vita",         name: "Ruota della Vita",          description: "Ruota interattiva con 8 aree di vita: assegna punteggi 0–10, visualizza la forma della ruota e confronta le sessioni nel tempo.", tag: "Riflessione" },
    { id: "connessioni-che-nutrono",  name: "Connessioni che Nutrono",   description: "Mappa relazionale a cerchi concentrici: posiziona persone e contesti e scrivi una domanda di coaching per ogni relazione.", tag: "Simulazione" },
    { id: "nutrire-non-motivare",     name: "Nutrire ≠ Motivare",        description: "Classifica 8 frasi tipiche del coach e riscrivile trasformando la motivazione vuota in nutrimento reale attraverso metafore e storytelling.", tag: "Analisi" },
  ],
};

function PhaseScreen({ phaseId, onSelectExercise, onHome }) {
  const phase = OCEAN_PHASES.find(p => p.id === phaseId);
  const exercises = PHASE_EXERCISES[phaseId] || [];
  const TAG_COLORS = { "Simulazione": BLUE, "Riflessione": "#7C3AED", "Diario": "#059669", "Pianificazione": "#D97706", "Metafora": "#DB2777", "Analisi": "#DC2626" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: FONT, color: "#1A2B3C", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin:0; padding:0; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <header style={{ padding: "0 32px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #E8ECF0", background: "#FFF", height: HEADER_H, flexShrink: 0 }}>
        <Logo size={32} onClick={onHome} />
        <span style={{ fontSize: 14, color: "#9CA3AF" }}>›</span>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Fase {phase?.name}</span>
      </header>
      <main style={{ flex: 1, overflow: "auto", padding: "48px 32px", animation: "fadeIn 0.4s ease" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Fase {phase?.name}</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Esercizi disponibili</h1>
          <p style={{ fontSize: 16, color: "#6B7280", marginBottom: 40, maxWidth: 500 }}>{phase?.description}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {exercises.map(ex => {
              const tagColor = TAG_COLORS[ex.tag] || BLUE;
              return (
                <div
                  key={ex.id}
                  onClick={() => onSelectExercise(ex.id)}
                  style={{ background: "#FFF", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: "22px 26px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: 20 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,153,230,0.12)"; e.currentTarget.style.transform = "translateX(3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"; e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${tagColor}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 24 }}>
                      {ex.tag === "Simulazione" ? "🗺" : ex.tag === "Riflessione" ? "🔍" : ex.tag === "Diario" ? "📷" : ex.tag === "Pianificazione" ? "🎯" : ex.tag === "Metafora" ? "🪞" : ex.tag === "Analisi" ? "🧠" : "📝"}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 19, fontWeight: 700 }}>{ex.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: tagColor, background: `${tagColor}14`, borderRadius: 8, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{ex.tag}</span>
                    </div>
                    <div style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.5 }}>{ex.description}</div>
                  </div>
                  <span style={{ fontSize: 21, color: "#C0C8D4", flexShrink: 0 }}>›</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}


/* ═══ ROOT APP ═══ */
export default function App() {
  // If URL contains ?session=ID → CinqueLenti in student mode
  // If URL contains ?fse=ID → FattiSignificatiEmozioni in coach mode (joins coachee's session)
  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fse")) return "exercise:fatti-significati-emozioni";
    if (params.get("session")) return "exercise:cinque-lenti";
    return "home";
  });

  const goHome = () => {
    // Clear session param from URL without reloading
    window.history.replaceState({}, "", window.location.pathname);
    setScreen("home");
  };
  const goPhase = (id) => setScreen(`phase:${id}`);
  const goExercise = (id) => setScreen(`exercise:${id}`);

  if (screen.startsWith("phase:")) {
    const phaseId = screen.slice(6);
    return <PhaseScreen phaseId={phaseId} onSelectExercise={goExercise} onHome={goHome} />;
  }
  if (screen === "exercise:storymap")          return <StoryMap onHome={() => goPhase("osserva")} />;
  if (screen === "exercise:cinque-lenti")      return <CinqueLenti onHome={() => goPhase("osserva")} />;
  if (screen === "exercise:la-foto")           return <LaFoto onHome={() => goPhase("osserva")} />;
  if (screen === "exercise:fatti-significati-emozioni") return <FattiSignificatiEmozioni onHome={() => goPhase("osserva")} />;
  if (screen === "exercise:dal-vago-allo-smart") return <DalVagoAlloSMART onHome={() => goPhase("crea")} />;
  if (screen === "exercise:oggetti-parlanti")    return <OggettiParlanti onHome={() => goPhase("crea")} />;
  if (screen === "exercise:bias-hunter")            return <BiasHunter onHome={() => goPhase("esponi")} />;
  if (screen === "exercise:diario-micro-abitudini") return <DiarioMicroAbitudini onHome={() => goPhase("esponi")} />;
  if (screen === "exercise:backward-planning")         return <BackwardPlanning onHome={() => goPhase("avviva")} />;
  if (screen === "exercise:diario-consolidamento")    return <DiarioConsolidamento onHome={() => goPhase("nutri")} />;
  if (screen === "exercise:ruota-della-vita")         return <RuotaDellaVita onHome={() => goPhase("nutri")} />;
  if (screen === "exercise:connessioni-che-nutrono")  return <ConnessioniCheNutrono onHome={() => goPhase("nutri")} />;
  if (screen === "exercise:nutrire-non-motivare")     return <NutrireNonMotivare onHome={() => goPhase("nutri")} />;

  return <HomeScreen onSelectPhase={goPhase} />;
}
