import React, { useMemo } from "react";
import { similarityMatrix, dissimilarityScores } from "../../lib/textProcessing/index.js";

const FONT = "'Source Sans 3','Segoe UI',system-ui,sans-serif";

/*
  Heatmap di similarità N×N.

  Props:
    documents — [{ label: string, text: string }]
    title     — opzionale
    mode      — "similarity" (default) | "dissimilarity"
*/
export default function SimilarityMatrix({ documents = [], title, mode = "similarity" }) {
  const { matrix, dissim } = useMemo(() => {
    const texts = documents.map(d => d.text || "");
    if (texts.length < 2) return { matrix: [], dissim: [] };
    const sm = similarityMatrix(texts);
    return { matrix: sm.matrix, dissim: dissimilarityScores(texts) };
  }, [documents]);

  if (documents.length < 2) {
    return (
      <div style={styles.wrapper}>
        {title && <div style={styles.title}>{title}</div>}
        <div style={styles.empty}>Servono almeno 2 documenti per calcolare la similarità.</div>
      </div>
    );
  }

  const N = documents.length;
  const labels = documents.map((d, i) => d.label || `#${i + 1}`);

  return (
    <div style={styles.wrapper}>
      {title && <div style={styles.title}>{title}</div>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: FONT, fontSize: 12 }}>
          <thead>
            <tr>
              <th />
              {labels.map((l, i) => (
                <th key={i} style={headStyle}>{truncate(l, 14)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <th style={headStyle}>{truncate(labels[i], 14)}</th>
                {row.map((v, j) => {
                  const display = mode === "dissimilarity" ? 1 - v : v;
                  const bg = colorForSim(display);
                  return (
                    <td
                      key={j}
                      title={`${labels[i]} ↔ ${labels[j]}: ${display.toFixed(2)}`}
                      style={{
                        width: 48,
                        height: 32,
                        textAlign: "center",
                        background: bg,
                        color: display > 0.5 ? "#FFF" : "#111827",
                        fontWeight: 600,
                        border: "1px solid #FFF",
                      }}
                    >
                      {display.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dissimilarità media per documento */}
      {dissim.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Dissimilarità media (quanto ogni documento si discosta dagli altri)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {dissim.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{ minWidth: 120, fontWeight: 600, color: "#374151" }}>{truncate(labels[i], 18)}</span>
                <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, d * 100)}%`, background: "#0099E6", borderRadius: 3 }} />
                </div>
                <span style={{ minWidth: 40, textAlign: "right", color: "#6B7280", fontWeight: 600 }}>
                  {d.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function colorForSim(v) {
  // Scale da bianco (0) a blu brand (1).
  const clamped = Math.max(0, Math.min(1, v));
  // Interpola tra #F8FBFF e #0099E6.
  const r = Math.round(248 + (0 - 248) * clamped);
  const g = Math.round(251 + (153 - 251) * clamped);
  const b = Math.round(255 + (230 - 255) * clamped);
  return `rgb(${r},${g},${b})`;
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

const headStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  padding: "6px 8px",
  textAlign: "center",
  verticalAlign: "middle",
};

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
  empty: {
    color: "#9CA3AF",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    padding: "24px 0",
  },
};
