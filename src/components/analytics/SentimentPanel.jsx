import React, { useMemo } from "react";
import { analyzeSentimentCorpus } from "../../lib/textProcessing/index.js";

const FONT = "'Source Sans 3','Segoe UI',system-ui,sans-serif";

const POS_COLOR = "#10B981";
const NEU_COLOR = "#9CA3AF";
const NEG_COLOR = "#EF4444";

/*
  Pannello di sentiment analysis.

  Props:
    texts   — string[] testi da analizzare
    title   — titolo opzionale
    compact — layout ridotto (solo barra, nessun breakdown)
*/
export default function SentimentPanel({ texts = [], title, compact = false, series }) {
  const computed = useMemo(
    () => series ? null : analyzeSentimentCorpus(texts),
    [texts, series]
  );
  const data = series || computed;

  if (!data || data.count === 0) {
    return (
      <div style={styles.wrapper}>
        {title && <div style={styles.title}>{title}</div>}
        <div style={styles.empty}>Nessun testo disponibile per l'analisi.</div>
      </div>
    );
  }

  const compound = data.compound;
  const label =
    compound >= 0.20 ? { text: "Positivo", color: POS_COLOR }
    : compound <= -0.20 ? { text: "Negativo", color: NEG_COLOR }
    : { text: "Neutro", color: NEU_COLOR };

  const posPct = Math.round(data.pos * 100);
  const neuPct = Math.round(data.neu * 100);
  const negPct = Math.max(0, 100 - posPct - neuPct);

  return (
    <div style={styles.wrapper}>
      {title && <div style={styles.title}>{title}</div>}

      <div style={styles.header}>
        <div>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
            Polarità complessiva
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: label.color, marginTop: 2 }}>
            {compound >= 0 ? "+" : ""}{compound.toFixed(2)}
          </div>
          <div style={{ fontSize: 13, color: label.color, fontWeight: 600 }}>{label.text}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#6B7280" }}>
          <div>{data.count} {data.count === 1 ? "testo analizzato" : "testi analizzati"}</div>
        </div>
      </div>

      {/* Barra stacked pos/neu/neg */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", height: 20, borderRadius: 8, overflow: "hidden", background: "#F3F4F6" }}>
          {negPct > 0 && <div style={{ width: `${negPct}%`, background: NEG_COLOR }} title={`Negativo: ${negPct}%`} />}
          {neuPct > 0 && <div style={{ width: `${neuPct}%`, background: NEU_COLOR }} title={`Neutro: ${neuPct}%`} />}
          {posPct > 0 && <div style={{ width: `${posPct}%`, background: POS_COLOR }} title={`Positivo: ${posPct}%`} />}
        </div>
        {!compact && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
            <LegendDot color={NEG_COLOR} label={`Negativo ${negPct}%`} />
            <LegendDot color={NEU_COLOR} label={`Neutro ${neuPct}%`} />
            <LegendDot color={POS_COLOR} label={`Positivo ${posPct}%`} />
          </div>
        )}
      </div>

      {/* Parole più impattanti (solo non-compact) */}
      {!compact && <TopHits perDoc={data.perDoc} />}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#4B5563", fontWeight: 600 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function TopHits({ perDoc }) {
  // Aggrega tutti gli hits del corpus con segno, prendi i top 6 per |score|.
  const all = [];
  for (const r of perDoc) for (const h of r.hits) all.push(h);
  const topPos = [...all].filter(h => h.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  const topNeg = [...all].filter(h => h.score < 0).sort((a, b) => a.score - b.score).slice(0, 3);

  if (topPos.length === 0 && topNeg.length === 0) return null;

  return (
    <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <HitCol title="Parole positive" color={POS_COLOR} hits={topPos} />
      <HitCol title="Parole negative" color={NEG_COLOR} hits={topNeg} />
    </div>
  );
}

function HitCol({ title, color, hits }) {
  return (
    <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        {title}
      </div>
      {hits.length === 0 ? (
        <div style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>Nessuna</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {hits.map((h, i) => (
            <span key={`${h.word}-${i}`} style={{ background: "#FFF", border: `1px solid ${color}40`, borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#374151", fontWeight: 600 }}>
              {h.word} <span style={{ color, fontWeight: 700 }}>{h.score > 0 ? "+" : ""}{h.score.toFixed(1)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    background: "#FFF",
    borderRadius: 12,
    padding: "18px 20px",
    border: "1px solid #E2E8F0",
    fontFamily: FONT,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#374151",
    marginBottom: 12,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  empty: {
    color: "#9CA3AF",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    padding: "24px 0",
  },
};
