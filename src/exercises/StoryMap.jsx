import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { CASES } from "../data/cases.js";
import BULB_SVG from "../public/bulb.svg?raw";
import Navbar from "../components/Navbar.jsx";

/* ═══ CONSTANTS ═══ */
const BG = "#F8FBFF";
const BLUE = "#0099E6";
const BLUE_DARK = "#0077B3";
const GRAY_NODE = "#E0E0E0";
const GRAY_BORDER = "#C0C4CA";
const CYAN_EDGE = "#7DD4F0";
const GRAY_EDGE = "#C8CDD3";
const RED_EDGE = "#F87171";
const RED_DARK = "#DC2626";
const RED_BG = "#FEF2F2";
const HEADER_H = 56;
const FONT = "'Source Sans 3', sans-serif";


/* ═══ LAYOUT ENGINE ═══ */
function measureText(text, fontSize = 13.5) {
  return text.length * fontSize * 0.58 + 24;
}

function computeLayout(allNodes, allEdges, containerWidth = 0) {
  const children = {};
  allEdges.forEach(e => { if (!children[e.from]) children[e.from] = []; if (!children[e.from].includes(e.to)) children[e.from].push(e.to); });
  const depth = {}; const queue = ["root"]; depth["root"] = 0; const visited = new Set(["root"]);
  while (queue.length > 0) { const cur = queue.shift(); (children[cur] || []).forEach(c => { if (!visited.has(c)) { visited.add(c); depth[c] = depth[cur] + 1; queue.push(c); } }); }
  const byDepth = {}; let maxDepth = 0;
  Object.entries(depth).forEach(([id, d]) => { if (!byDepth[d]) byDepth[d] = []; byDepth[d].push(id); if (d > maxDepth) maxDepth = d; });

  const PAD_X = 60; const PAD_Y = 60; const MIN_GAP = 50; const Y_STEP = 100;

  const nodeWidths = {};
  Object.keys(depth).forEach(id => {
    const node = allNodes[id]; const isLeaf = node?.type === "leaf"; const isOrigin = node?.type === "origin";
    const textW = measureText(node?.label || "", isOrigin ? 18 : 13.5);
    nodeWidths[id] = Math.max(isLeaf ? textW + 38 : textW, isOrigin ? 130 : 100);
  });

  const colMaxW = {};
  Object.entries(byDepth).forEach(([d, ids]) => { colMaxW[parseInt(d)] = Math.max(...ids.map(id => nodeWidths[id] || 100)); });

  const colX = {};
  colX[0] = PAD_X + colMaxW[0] / 2;
  for (let d = 1; d <= maxDepth; d++) {
    colX[d] = colX[d - 1] + colMaxW[d - 1] / 2 + MIN_GAP + colMaxW[d] / 2;
  }
  const naturalW = colX[maxDepth] + colMaxW[maxDepth] / 2 + PAD_X;

  const scaledColX = {};
  let totalW = naturalW;
  if (containerWidth > naturalW) {
    const span = naturalW - PAD_X * 2;
    const scale = span > 0 ? (containerWidth - PAD_X * 2) / span : 1;
    for (let d = 0; d <= maxDepth; d++) scaledColX[d] = PAD_X + (colX[d] - PAD_X) * scale;
    totalW = containerWidth;
  } else {
    for (let d = 0; d <= maxDepth; d++) scaledColX[d] = colX[d];
  }

  const maxSlots = Math.max(...Object.values(byDepth).map(a => a.length));
  const totalH = maxSlots * Y_STEP + PAD_Y * 2;

  const positions = {};
  Object.entries(byDepth).forEach(([d, ids]) => {
    const n = ids.length; const blockH = (n - 1) * Y_STEP; const startY = (totalH - blockH) / 2;
    ids.forEach((id, i) => { positions[id] = { x: scaledColX[parseInt(d)], y: startY + i * Y_STEP }; });
  });

  return { positions, nodeWidths, width: totalW, height: totalH };
}

/* ═══ COMPONENTS ═══ */
function BulbIcon({ size = 18, color = "#FFF" }) {
  return <div style={{ width: size, height: size, color, flexShrink: 0, display: "flex", alignItems: "center" }} dangerouslySetInnerHTML={{ __html: BULB_SVG }} />;
}

function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }) {
  const btn = { background: "#FFF", border: "1px solid #D0D5DC", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, color: "#4B5563", fontWeight: 600, fontFamily: FONT, transition: "background 0.15s" };
  return (
    <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", flexDirection: "column", gap: 4, zIndex: 50, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", borderRadius: 10, overflow: "hidden" }}>
      <button style={btn} onClick={onZoomIn} title="Zoom in">+</button>
      <button style={{ ...btn, fontSize: 13 }} onClick={onReset} title="Reset zoom">{Math.round(zoom * 100)}%</button>
      <button style={btn} onClick={onZoomOut} title="Zoom out">−</button>
    </div>
  );
}

function GraphCanvas({ caseData, exploredPath, exploredEdges, selectedNodeId, onNodeClick, showFullGraph, wrongAttempts = [] }) {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    setContainerW(ref.current.clientWidth);
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerW(w);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const exploredSet = new Set(exploredPath);
  const exploredEdgeKeys = new Set(exploredEdges.map(e => `${e.from}->${e.to}`));
  const realEdges = useMemo(() => caseData.edges.filter(e => !e.wrong), [caseData]);
  const layout = useMemo(() => computeLayout(caseData.nodes, realEdges, containerW), [caseData, realEdges, containerW]);
  const { positions, nodeWidths, width: svgW, height: svgH } = layout;
  const NODE_H = 46; const RX = 12;

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.min(2, Math.max(0.3, z + (e.deltaY > 0 ? -0.08 : 0.08)))); }
  }, []);
  useEffect(() => { const el = ref.current; if (!el) return; el.addEventListener("wheel", handleWheel, { passive: false }); return () => el.removeEventListener("wheel", handleWheel); }, [handleWheel]);

  useEffect(() => {
    if (!ref.current || !selectedNodeId || !positions[selectedNodeId] || showFullGraph) return;
    const p = positions[selectedNodeId];
    ref.current.scrollTo({ left: Math.max(0, p.x * zoom - ref.current.clientWidth / 2), top: Math.max(0, p.y * zoom - ref.current.clientHeight / 2), behavior: "smooth" });
  }, [selectedNodeId, positions, zoom, showFullGraph]);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
  }, [layout]);

  const visibleNodes = showFullGraph ? Object.keys(caseData.nodes) : exploredPath;
  const visibleEdges = showFullGraph ? realEdges : realEdges.filter(e => exploredEdgeKeys.has(`${e.from}->${e.to}`));

  return (
    <div ref={ref} style={{ width: "100%", height: showFullGraph ? "calc(100vh - 56px - 260px)" : `calc(100vh - ${HEADER_H}px)`, overflow: "auto", background: BG, position: "relative" }}>
      {!showFullGraph && <ZoomControls zoom={zoom} onZoomIn={() => setZoom(z => Math.min(2, z + 0.15))} onZoomOut={() => setZoom(z => Math.max(0.3, z - 0.15))} onReset={() => setZoom(1)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "100%", minHeight: "100%" }}>
      <svg width={Math.max(svgW, 700) * zoom} height={Math.max(svgH, 400) * zoom} viewBox={`0 0 ${Math.max(svgW, 700)} ${Math.max(svgH, 400)}`} style={{ display: "block" }} overflow="visible">
        <defs>
          <marker id="arrowCyan" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
            <polygon points="0 0, 9 3.5, 0 7" fill={CYAN_EDGE} opacity="0.85" />
          </marker>
          <marker id="arrowGray" markerWidth="9" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
            <polygon points="0 0, 9 3.5, 0 7" fill={GRAY_EDGE} opacity="0.4" />
          </marker>
        </defs>
        {/* Correct edges */}
        {(showFullGraph ? realEdges : visibleEdges).map((e, i) => {
          const fp = positions[e.from], tp = positions[e.to]; if (!fp || !tp) return null;
          const isExp = exploredEdgeKeys.has(`${e.from}->${e.to}`);
          const fw = (nodeWidths[e.from] || 120) / 2; const tw = (nodeWidths[e.to] || 120) / 2;
          const x1 = fp.x + fw, y1 = fp.y, x2 = tp.x - tw - 2, y2 = tp.y;
          const mx = (x1 + x2) / 2 + 20;
          const stroke = showFullGraph ? (isExp ? CYAN_EDGE : GRAY_EDGE) : CYAN_EDGE;
          const marker = showFullGraph ? (isExp ? "url(#arrowCyan)" : "url(#arrowGray)") : "url(#arrowCyan)";
          return <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} fill="none" stroke={stroke} strokeWidth={isExp ? 3 : 2} strokeDasharray={showFullGraph && !isExp ? "6 4" : "none"} opacity={showFullGraph && !isExp ? 0.4 : 0.85} markerEnd={marker} />;
        })}
        {/* Wrong attempt edges — dangling red lines ending with ✕ */}
        {wrongAttempts.filter(a => positions[a.from]).map((attempt, gi) => {
          const fp = positions[attempt.from];
          const fw = (nodeWidths[attempt.from] || 120) / 2;
          const x1 = fp.x + fw;
          const y1 = fp.y;
          const sameNode = wrongAttempts.filter(a => a.from === attempt.from);
          const li = sameNode.indexOf(attempt);
          const offset = (li - (sameNode.length - 1) / 2) * 28;
          const x2 = x1 + 90;
          const y2 = y1 + offset;
          const mx = x1 + 40;
          return (
            <g key={`wrong-${gi}`}>
              <path d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} fill="none" stroke={RED_EDGE} strokeWidth={2} strokeDasharray="5 3" opacity={0.85} />
              <circle cx={x2} cy={y2} r={8} fill={RED_BG} stroke={RED_EDGE} strokeWidth={1.5} />
              <text x={x2} y={y2 + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill={RED_DARK} style={{ fontFamily: FONT, pointerEvents: "none" }}>✕</text>
            </g>
          );
        })}
        {/* Nodes */}
        {visibleNodes.map(nid => {
          const node = caseData.nodes[nid]; if (!node || !positions[nid]) return null;
          const pos = positions[nid]; const isExp = exploredSet.has(nid); const isSel = nid === selectedNodeId;
          const isOrigin = node.type === "origin"; const isLeaf = node.type === "leaf";
          const w = nodeWidths[nid] || 120; const hasOut = realEdges.some(e => e.from === nid);
          const canClick = !showFullGraph && isExp && hasOut;
          let fill, stroke, textCol;
          if (isOrigin) { fill = BLUE; stroke = BLUE_DARK; textCol = "#FFF"; }
          else if (isLeaf && isExp) { fill = BLUE; stroke = BLUE; textCol = "#FFF"; }
          else if (isLeaf) { fill = GRAY_NODE; stroke = GRAY_BORDER; textCol = "#888"; }
          else if (isExp) { fill = "#FFF"; stroke = "#C8CED6"; textCol = "#2A3545"; }
          else { fill = GRAY_NODE; stroke = GRAY_BORDER; textCol = "#888"; }
          return (
            <g key={nid} style={{ cursor: canClick ? "pointer" : "default" }} onClick={canClick ? () => onNodeClick(nid) : undefined}>
              {isSel && <rect x={pos.x - w/2 - 5} y={pos.y - NODE_H/2 - 5} width={w + 10} height={NODE_H + 10} rx={RX + 5} fill="none" stroke={BLUE} strokeWidth={2} opacity={0.25}><animate attributeName="opacity" values="0.25;0.08;0.25" dur="2.2s" repeatCount="indefinite"/></rect>}
              <rect x={pos.x - w/2} y={pos.y - NODE_H/2} width={w} height={NODE_H} rx={RX} fill={fill} stroke={stroke} strokeWidth={isSel ? 2 : 1.5} />
              {isLeaf && (
                <foreignObject x={pos.x - w/2 + 7} y={pos.y - 13} width={24} height={24}>
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: 24, height: 24, color: isExp ? "#FFF" : "#999" }} dangerouslySetInnerHTML={{ __html: BULB_SVG }} />
                </foreignObject>
              )}
              <text x={isLeaf ? pos.x + 14 : pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central" fontSize={isOrigin ? 18 : 13.5} fontWeight={isOrigin ? 700 : 500} fill={textCol} style={{ fontFamily: FONT, pointerEvents: "none" }}>{node.label}</text>
              {isExp && node.traits.length > 0 && !showFullGraph && (<><circle cx={pos.x + w/2 - 2} cy={pos.y - NODE_H/2 + 2} r={9} fill="#F59E0B" stroke="#FFF" strokeWidth={2}/><text x={pos.x + w/2 - 2} y={pos.y - NODE_H/2 + 3} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="#FFF" style={{ pointerEvents: "none" }}>{node.traits.length}</text></>)}
            </g>
          );
        })}
      </svg>
      </div>
    </div>
  );
}

function QuestionDrawer({ questions, nodeName, onSelect, onClose }) {
  return (<>
    <div style={{ position: "fixed", inset: 0, zIndex: 290 }} onClick={onClose} />
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#FFF", borderTop: "1px solid #E2E8F0", boxShadow: "0 -8px 40px rgba(0,0,0,0.1)", borderRadius: "18px 18px 0 0", padding: "22px 28px 28px", zIndex: 300, animation: "slideUp 0.3s ease", maxHeight: "48vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8492A6", textTransform: "uppercase", letterSpacing: "0.06em" }}>Da: {nodeName}</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#1A2B3C", marginTop: 2 }}>Scegli cosa chiedere</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: "#B0B8C4", cursor: "pointer", padding: 4 }}>✕</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {questions.map((q, i) => (
          <button key={i} onClick={() => onSelect(q)} style={{ display: "flex", alignItems: "center", gap: 12, background: BG, border: "1px solid #E2E8F0", borderRadius: 10, padding: "13px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", fontSize: 16, color: "#1A2B3C", fontFamily: FONT, lineHeight: 1.4 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#E3F2FD"; e.currentTarget.style.borderColor = CYAN_EDGE; e.currentTarget.style.transform = "translateX(3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = BG; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.transform = "translateX(0)"; }}>
            <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: `${BLUE}14`, color: BLUE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{String.fromCharCode(65 + i)}</span>
            <span>{q.question}</span>
          </button>
        ))}
      </div>
    </div>
  </>);
}

function AnswerModal({ node, onContinue }) {
  const [show, setShow] = useState(false); useEffect(() => { setTimeout(() => setShow(true), 40); }, []);
  const isLeaf = node.type === "leaf";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,20,40,0.32)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 20 }} onClick={onContinue}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#FFF", borderRadius: 18, padding: "30px 34px", maxWidth: 500, width: "100%", boxShadow: "0 16px 60px rgba(0,0,0,0.16)", opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.96)", transition: "all 0.35s ease" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>{isLeaf ? <><BulbIcon size={14} color={BLUE} /> Insight scoperto</> : "Risposta del coachee"}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#1A2B3C", marginBottom: 10 }}>{node.label}</div>
        <div style={{ fontSize: 17.5, color: "#4B5563", lineHeight: 1.7, marginBottom: 18 }}>{node.description}</div>
        {node.traits.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Tratti emersi</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {node.traits.map((t, i) => <span key={i} style={{ background: isLeaf ? "#E0F2FE" : "#FEF3C7", color: isLeaf ? "#0369A1" : "#92400E", fontSize: 14, fontWeight: 500, padding: "4px 12px", borderRadius: 16, border: `1px solid ${isLeaf ? "#BAE6FD" : "#FDE68A"}` }}>{t}</span>)}
            </div>
          </div>
        )}
        <button onClick={onContinue} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "11px 26px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: FONT }} onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK} onMouseLeave={e => e.currentTarget.style.background = BLUE}>Continua</button>
      </div>
    </div>
  );
}

function ErrorModal({ errorNode, onContinue }) {
  const [show, setShow] = useState(false); useEffect(() => { setTimeout(() => setShow(true), 40); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,20,40,0.40)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 20 }} onClick={onContinue}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#FFF", borderRadius: 18, padding: "30px 34px", maxWidth: 500, width: "100%", boxShadow: "0 16px 60px rgba(0,0,0,0.2)", border: `1.5px solid #FECACA`, opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(0.96)", transition: "all 0.35s ease" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: RED_DARK, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", background: RED_DARK, color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>✕</span>
          Domanda non corretta
        </div>
        <div style={{ fontSize: 18.5, fontWeight: 600, color: "#1A2B3C", marginBottom: 14, fontStyle: "italic", lineHeight: 1.45 }}>"{errorNode.question}"</div>
        <div style={{ background: RED_BG, borderRadius: 10, padding: "14px 16px", marginBottom: 22, fontSize: 16, color: "#991B1B", lineHeight: 1.75, border: `1px solid #FECACA` }}>{errorNode.errorReason}</div>
        <button onClick={onContinue} style={{ background: RED_DARK, color: "#FFF", border: "none", borderRadius: 10, padding: "11px 26px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: FONT, transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#B91C1C"} onMouseLeave={e => e.currentTarget.style.background = RED_DARK}>Ho capito</button>
      </div>
    </div>
  );
}

function SummaryPage({ caseData, exploredPath, exploredEdges, wrongAttempts, onRestart, onHome }) {
  const allTraits = []; exploredPath.forEach(nid => { const n = caseData.nodes[nid]; if (n?.traits) allTraits.push(...n.traits); });
  const total = Object.keys(caseData.nodes).length;
  const coverage = Math.round((exploredPath.length / total) * 100);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, overflow: "hidden" }}>
      <Navbar exercise="Story Map" onHome={onHome} right={
        <button onClick={onRestart} style={{ background: BLUE, color: "#FFF", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Inizia un altro intervento</button>
      } />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <GraphCanvas caseData={caseData} exploredPath={exploredPath} exploredEdges={exploredEdges} selectedNodeId={null} onNodeClick={() => {}} showFullGraph={true} wrongAttempts={wrongAttempts} />
      </div>
      <div style={{ flexShrink: 0, borderTop: "1px solid #E8ECF0", background: "#FFF", padding: "24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ background: "#FFF", borderRadius: 14, padding: "22px 22px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", border: "1px solid #E8ECF0" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A2B3C", marginBottom: 10, fontFamily: FONT }}>Fase <em>Osserva</em> terminata</h3>
            <p style={{ fontSize: 15, color: "#5A6577", lineHeight: 1.6 }}>Hai terminato la fase <em>Osserva</em> del tuo intervento di Coaching. Grazie alle tue domande sei riuscito ad apprendere tratti importanti del tuo coachee che ti aiuteranno nelle fasi successive!</p>
          </div>
          <div style={{ background: "#FFF", borderRadius: 14, padding: "22px 22px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", border: "1px solid #E8ECF0" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A2B3C", marginBottom: 10, fontFamily: FONT }}>Risultati ottenuti</h3>
            <p style={{ fontSize: 15, color: "#5A6577", lineHeight: 1.6 }}>Con questo approccio, sei riuscito a coprire il <strong style={{ color: BLUE }}>{coverage}%</strong> dell'albero delle consapevolezze.</p>
            {wrongAttempts.length > 0 && (
              <p style={{ fontSize: 15, color: "#5A6577", lineHeight: 1.6, marginTop: 8 }}>
                Hai posto <strong style={{ color: RED_DARK }}>{wrongAttempts.length}</strong> domanda{wrongAttempts.length === 1 ? "" : " errata"}{wrongAttempts.length === 1 ? " errata" : " errate"} — visibili come linee rosse nel grafico.
              </p>
            )}
            <p style={{ fontSize: 15, color: "#5A6577", lineHeight: 1.6, marginTop: 8 }}>Prova con un altro intervento per migliorare la tua capacità di osservazione!</p>
          </div>
          <div style={{ background: `linear-gradient(150deg, #00B4F0 0%, ${BLUE} 40%, ${BLUE_DARK} 100%)`, borderRadius: 14, padding: "22px 22px", color: "#FFF" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, fontFamily: FONT }}>Nuggets</h3>
            <ul style={{ fontSize: 14, lineHeight: 1.65, paddingLeft: 16, margin: 0 }}>
              {caseData.nuggets.map((n, i) => <li key={i} style={{ marginBottom: 6 }}>{n}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ STORY MAP EXERCISE ═══ */
export default function StoryMap({ onHome }) {
  const [mode, setMode] = useState("errors"); // "standard" | "errors"
  const [phase, setPhase] = useState("select");
  const [caseId, setCaseId] = useState(null);
  const [exploredPath, setExploredPath] = useState(["root"]);
  const [exploredEdges, setExploredEdges] = useState([]);
  const [discoveredTraits, setDiscoveredTraits] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState("root");
  const [drawerNodeId, setDrawerNodeId] = useState(null);
  const [answerNode, setAnswerNode] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState([]);
  const [errorNode, setErrorNode] = useState(null);
  const caseData = caseId ? CASES[caseId] : null;

  const reset = useCallback(() => {
    setPhase("select"); setCaseId(null); setExploredPath(["root"]); setExploredEdges([]);
    setDiscoveredTraits([]); setSelectedNodeId("root"); setDrawerNodeId(null);
    setAnswerNode(null); setWrongAttempts([]); setErrorNode(null);
  }, []);

  const drawerQuestions = useMemo(() => {
    if (!drawerNodeId || !caseData) return [];
    const allEdges = caseData.edges.filter(e => e.from === drawerNodeId);
    if (mode === "standard") return allEdges.filter(e => !e.wrong);
    const attemptedWrong = new Set(wrongAttempts.filter(a => a.from === drawerNodeId).map(a => a.question));
    return allEdges.filter(e => !e.wrong || !attemptedWrong.has(e.question));
  }, [drawerNodeId, caseData, mode, wrongAttempts]);

  const handleNodeClick = useCallback((nid) => { setSelectedNodeId(nid); setDrawerNodeId(nid); }, []);

  const handleQuestion = useCallback((edge) => {
    setDrawerNodeId(null);
    if (edge.wrong) {
      setWrongAttempts(p => [...p, { from: edge.from, question: edge.question, errorReason: edge.errorReason }]);
      setErrorNode({ question: edge.question, errorReason: edge.errorReason });
      return;
    }
    const target = caseData.nodes[edge.to];
    setExploredEdges(p => [...p, { from: edge.from, to: edge.to }]);
    setExploredPath(p => [...new Set([...p, edge.to])]);
    setSelectedNodeId(edge.to);
    if (target.traits.length > 0) setDiscoveredTraits(p => [...new Set([...p, ...target.traits])]);
    setAnswerNode(target);
  }, [caseData]);

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: BG, fontFamily: FONT, color: "#1A2B3C" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#C0C8D0; border-radius:3px; }
      `}</style>

      {/* ── SELECT ── */}
      {phase === "select" && (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Navbar exercise="Story Map" onHome={onHome} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, overflow: "auto", animation: "fadeIn 0.5s ease" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 6 }}>Scegli un caso</h1>
          <p style={{ fontSize: 16, color: "#6B7280", marginBottom: 28, textAlign: "center", maxWidth: 400 }}>Simulazione interattiva della fase <em>Osserva</em> del modello O.C.E.A.N.</p>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 4, marginBottom: 32, background: "#EEF2F7", borderRadius: 20, padding: 4, width: "fit-content" }}>
            <button onClick={() => setMode("standard")} style={{ padding: "8px 20px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 15, fontWeight: 600, background: mode === "standard" ? "#FFF" : "transparent", color: mode === "standard" ? "#1A2B3C" : "#6B7280", boxShadow: mode === "standard" ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
              Simulazione Standard
            </button>
            <button onClick={() => setMode("errors")} style={{ padding: "8px 20px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 15, fontWeight: 600, background: mode === "errors" ? "#FFF" : "transparent", color: mode === "errors" ? RED_DARK : "#6B7280", boxShadow: mode === "errors" ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
              Con Domande Errate
            </button>
          </div>

          {mode === "errors" && (
            <div style={{ background: RED_BG, border: `1px solid #FECACA`, borderRadius: 10, padding: "10px 18px", marginBottom: 20, maxWidth: 440, fontSize: 15, color: "#991B1B", lineHeight: 1.55, textAlign: "center" }}>
              Alcune domande nel cassetto potrebbero essere scorrette. Scopri quali sono — e perché.
            </div>
          )}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {Object.values(CASES).map(c => (
              <button key={c.id} onClick={() => { setCaseId(c.id); setPhase("intro"); }}
                style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "22px 26px", maxWidth: 300, textAlign: "left", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,153,230,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)"; }}>
                <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 5 }}>{c.title}</div>
                <div style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.45 }}>{c.subtitle}</div>
                <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: BLUE }}>Inizia →</div>
              </button>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* ── INTRO ── */}
      {phase === "intro" && caseData && (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Navbar exercise="Story Map" onHome={onHome} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, overflow: "auto" }}>
          <div style={{ background: "#FFF", borderRadius: 18, padding: "40px 44px", maxWidth: 500, width: "100%", boxShadow: "0 6px 32px rgba(0,0,0,0.06)", border: "1px solid #E8ECF0", animation: "fadeIn 0.4s ease" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Fase Osserva</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, lineHeight: 1.25 }}>{caseData.title}</h1>
            <div style={{ background: BG, borderRadius: 12, padding: "16px 20px", marginBottom: 20, border: "1px solid #E8F0F8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${BLUE}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: BLUE }}>{caseData.coachee.name[0]}</div>
                <div><div style={{ fontSize: 16, fontWeight: 600 }}>{caseData.coachee.name}</div><div style={{ fontSize: 14, color: "#6B7280" }}>{caseData.coachee.role}</div></div>
              </div>
              <p style={{ fontSize: 15.5, color: "#4B5563", lineHeight: 1.6 }}>{caseData.coachee.context}</p>
            </div>
            <div style={{ background: `${BLUE}08`, borderRadius: 8, padding: "12px 16px", marginBottom: mode === "errors" ? 14 : 24, fontSize: 15, color: "#1A5276", lineHeight: 1.5, border: `1px solid ${BLUE}18` }}>
              Clicca su un nodo esplorato per porre domande. Ogni risposta rivela nuovi nodi e tratti del coachee. Decidi tu quando hai osservato abbastanza.
            </div>
            {mode === "errors" && (
              <div style={{ background: RED_BG, borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 15, color: "#991B1B", lineHeight: 1.5, border: `1px solid #FECACA` }}>
                Modalità avanzata attiva: alcune domande potrebbero non essere corrette. Scegli con cura — le domande sbagliate lasciano una traccia rossa sul grafico.
              </div>
            )}
            <button onClick={() => { setExploredPath(["root"]); setExploredEdges([]); setDiscoveredTraits([]); setSelectedNodeId("root"); setDrawerNodeId(null); setAnswerNode(null); setWrongAttempts([]); setErrorNode(null); setPhase("play"); }}
              style={{ width: "100%", background: BLUE, color: "#FFF", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,153,230,0.25)", fontFamily: FONT }}
              onMouseEnter={e => e.currentTarget.style.background = BLUE_DARK} onMouseLeave={e => e.currentTarget.style.background = BLUE}>
              Inizia la Sessione
            </button>
          </div>
          </div>
        </div>
      )}

      {/* ── PLAY ── */}
      {phase === "play" && caseData && (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Navbar
            exercise="Story Map"
            subtitle={caseData.title}
            onHome={onHome}
            right={<>
              {discoveredTraits.length > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: "#D97706", background: "#FFFBEB", padding: "3px 10px", borderRadius: 16, border: "1px solid #FDE68A" }}>{discoveredTraits.length} tratt{discoveredTraits.length === 1 ? "o" : "i"}</span>}
              {mode === "errors" && wrongAttempts.length > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: RED_DARK, background: RED_BG, padding: "3px 10px", borderRadius: 16, border: "1px solid #FECACA" }}>{wrongAttempts.length} errat{wrongAttempts.length === 1 ? "a" : "e"}</span>}
              <span style={{ fontSize: 13, color: "#A0AABB" }}>Clicca un nodo · Ctrl+scroll per zoom</span>
            </>}
          />
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <GraphCanvas caseData={caseData} exploredPath={exploredPath} exploredEdges={exploredEdges} selectedNodeId={selectedNodeId} onNodeClick={handleNodeClick} showFullGraph={false} wrongAttempts={wrongAttempts} />
          </div>
          {drawerNodeId && drawerQuestions.length > 0 && <QuestionDrawer questions={drawerQuestions} nodeName={caseData.nodes[drawerNodeId]?.label || ""} onSelect={handleQuestion} onClose={() => setDrawerNodeId(null)} />}
          {answerNode && <AnswerModal node={answerNode} onContinue={() => setAnswerNode(null)} />}
          {errorNode && <ErrorModal errorNode={errorNode} onContinue={() => setErrorNode(null)} />}
          {exploredPath.length > 2 && !drawerNodeId && !answerNode && !errorNode && (
            <button onClick={() => { setDrawerNodeId(null); setAnswerNode(null); setErrorNode(null); setPhase("summary"); }}
              style={{ position: "fixed", bottom: 24, right: 24, background: BLUE, color: "#FFF", border: "none", borderRadius: 24, padding: "11px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 18px rgba(0,153,230,0.3)", fontFamily: FONT, zIndex: 200, transition: "transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              Termina Osservazione
            </button>
          )}
        </div>
      )}

      {/* ── SUMMARY ── */}
      {phase === "summary" && caseData && <SummaryPage caseData={caseData} exploredPath={exploredPath} exploredEdges={exploredEdges} wrongAttempts={wrongAttempts} onRestart={reset} onHome={onHome} />}
    </div>
  );
}
