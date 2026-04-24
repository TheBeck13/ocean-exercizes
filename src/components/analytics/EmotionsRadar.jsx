import React, { useMemo } from "react";
import { analyzeEmotionsCorpus, EMOTION_LABELS, EMOTION_COLORS } from "../../lib/textProcessing/index.js";

const FONT = "'Source Sans 3','Segoe UI',system-ui,sans-serif";
const EMO_ORDER = ["joy","trust","anticipation","surprise","sadness","disgust","anger","fear"];

/*
  Radar chart 8 emozioni (Plutchik).

  Props:
    texts       — string[] OPPURE
    series      — [{ label, color, texts }] per confronto (es. Coach vs Coachee)
    title       — titolo opzionale
    showLegend  — default true
*/
export default function EmotionsRadar({ texts, series, title, showLegend = true }) {
  const computedSeries = useMemo(() => {
    if (series && series.length > 0) {
      return series.map((s, i) => ({
        label: s.label || `Serie ${i + 1}`,
        color: s.color || defaultSeriesColor(i),
        analysis: analyzeEmotionsCorpus(s.texts || []),
      }));
    }
    if (texts) {
      return [{ label: "", color: "#0099E6", analysis: analyzeEmotionsCorpus(texts) }];
    }
    return [];
  }, [texts, series]);

  const hasData = computedSeries.some(s => s.analysis.totalTokens > 0);
  if (!hasData) {
    return (
      <div style={styles.wrapper}>
        {title && <div style={styles.title}>{title}</div>}
        <div style={styles.empty}>Nessuna parola emotiva rilevata.</div>
      </div>
    );
  }

  // Normalizzazione: l'asse max è la massima percentuale vista su tutte le serie e emozioni
  // (con floor a 5% per evitare radar "schiacciato" quando tutte le % sono <1).
  const maxPct = Math.max(
    5,
    ...computedSeries.flatMap(s => EMO_ORDER.map(e => s.analysis.emotions[e].percent))
  );

  return (
    <div style={styles.wrapper}>
      {title && <div style={styles.title}>{title}</div>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
        <RadarSVG series={computedSeries} maxPct={maxPct} />
        {showLegend && <Legend series={computedSeries} />}
      </div>

      <DominantEmotions series={computedSeries} />
    </div>
  );
}

function defaultSeriesColor(i) {
  return ["#0099E6", "#F59E0B", "#10B981", "#7C3AED"][i % 4];
}

function RadarSVG({ series, maxPct }) {
  const SIZE = 280;
  const PAD = 48;
  const R = (SIZE - PAD * 2) / 2;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const N = EMO_ORDER.length;

  // Angolo per asse i: parte da alto (−π/2) e gira in senso orario.
  const angleFor = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / N;

  const axisPoint = (i, r) => {
    const a = angleFor(i);
    return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
  };

  // Griglia concentrica a 4 livelli.
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-label="Radar emozioni">
      {/* Griglia */}
      {gridLevels.map((g, idx) => {
        const pts = EMO_ORDER.map((_, i) => axisPoint(i, R * g).join(",")).join(" ");
        return <polygon key={idx} points={pts} fill="none" stroke="#E2E8F0" strokeWidth={1} />;
      })}

      {/* Assi */}
      {EMO_ORDER.map((emo, i) => {
        const [x, y] = axisPoint(i, R);
        return <line key={emo} x1={CX} y1={CY} x2={x} y2={y} stroke="#E2E8F0" strokeWidth={1} />;
      })}

      {/* Labels */}
      {EMO_ORDER.map((emo, i) => {
        const [x, y] = axisPoint(i, R + 22);
        return (
          <text
            key={emo}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 700,
              fill: EMOTION_COLORS[emo],
            }}
          >
            {EMOTION_LABELS[emo]}
          </text>
        );
      })}

      {/* Poligoni delle serie */}
      {series.map((s, seriesIdx) => {
        const pts = EMO_ORDER.map((emo, i) => {
          const pct = s.analysis.emotions[emo].percent;
          const r = (pct / maxPct) * R;
          return axisPoint(i, r).join(",");
        }).join(" ");
        return (
          <g key={seriesIdx}>
            <polygon points={pts} fill={s.color} fillOpacity={0.2} stroke={s.color} strokeWidth={2} />
            {EMO_ORDER.map((emo, i) => {
              const pct = s.analysis.emotions[emo].percent;
              const r = (pct / maxPct) * R;
              const [x, y] = axisPoint(i, r);
              return <circle key={emo} cx={x} cy={y} r={3} fill={s.color} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Legend({ series }) {
  if (series.length <= 1 && !series[0]?.label) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {series.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: s.color }} />
          <span style={{ fontWeight: 600, color: "#374151" }}>{s.label}</span>
          <span style={{ fontSize: 12, color: "#6B7280" }}>
            ({s.analysis.perDoc.length} testi)
          </span>
        </div>
      ))}
    </div>
  );
}

function DominantEmotions({ series }) {
  const items = series
    .map(s => {
      let best = null, bestCount = -1;
      for (const emo of EMO_ORDER) {
        if (s.analysis.emotions[emo].count > bestCount) {
          bestCount = s.analysis.emotions[emo].count;
          best = emo;
        }
      }
      return best && bestCount > 0 ? { series: s, emotion: best, count: bestCount } : null;
    })
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #E5E7EB", display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 10 }}>
      {items.map((it, i) => (
        <div key={i} style={{ background: `${EMOTION_COLORS[it.emotion]}12`, borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${EMOTION_COLORS[it.emotion]}` }}>
          <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {it.series.label || "Dominante"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: EMOTION_COLORS[it.emotion], marginTop: 2 }}>
            {EMOTION_LABELS[it.emotion]}
          </div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>{it.count} occorrenze</div>
        </div>
      ))}
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
    marginBottom: 16,
  },
  empty: {
    color: "#9CA3AF",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    padding: "24px 0",
  },
};
