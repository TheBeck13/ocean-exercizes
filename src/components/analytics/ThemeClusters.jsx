import React, { useMemo } from "react";
import { clusterDocs, silhouetteScore, topKeywordsCorpus } from "../../lib/textProcessing/index.js";

const FONT = "'Source Sans 3','Segoe UI',system-ui,sans-serif";
const CLUSTER_COLORS = ["#0099E6", "#F59E0B", "#10B981", "#7C3AED", "#EF4444", "#06B6D4"];

/*
  Raggruppa i documenti in K cluster usando k-medoids su TF-IDF.
  Per ogni cluster mostra: medoid (documento rappresentativo), membri,
  top-keywords del cluster e punteggio silhouette globale.

  Props:
    documents — [{ label, text }]
    k         — numero cluster (default 3)
    title     — opzionale
*/
export default function ThemeClusters({ documents = [], k = 3, title }) {
  const texts = useMemo(() => documents.map(d => d.text || ""), [documents]);
  const K = Math.min(k, Math.max(1, documents.length));

  const { clusters, assignments, medoids, sil } = useMemo(() => {
    if (texts.length < 2) return { clusters: [], assignments: [], medoids: [], sil: 0 };
    const r = clusterDocs(texts, K);
    const s = r.clusters.length > 1 ? silhouetteScore(texts, r.assignments) : 0;
    return { ...r, sil: s };
  }, [texts, K]);

  if (documents.length < 2) {
    return (
      <div style={styles.wrapper}>
        {title && <div style={styles.title}>{title}</div>}
        <div style={styles.empty}>Servono almeno 2 documenti per trovare cluster.</div>
      </div>
    );
  }

  // Top keywords per cluster (aiuta a dare un nome al tema).
  const keywordsPerCluster = clusters.map(members => {
    if (members.length === 0) return [];
    return topKeywordsCorpus(members.map(i => texts[i]), { topN: 4 });
  });

  return (
    <div style={styles.wrapper}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        {title ? <div style={styles.title}>{title}</div> : <span />}
        <div style={{ fontSize: 11, color: "#6B7280" }}>
          Silhouette: <strong style={{ color: silColor(sil) }}>{sil.toFixed(2)}</strong>
          <span style={{ marginLeft: 6, color: "#9CA3AF" }}>
            ({silLabel(sil)})
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(clusters.length, 3)}, 1fr)`, gap: 12 }}>
        {clusters.map((members, idx) => {
          const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
          const medoidDoc = documents[medoids[idx]];
          const kws = keywordsPerCluster[idx];
          return (
            <div key={idx} style={{ borderRadius: 10, border: `1.5px solid ${color}40`, background: `${color}08`, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 10, background: color }} />
                <span style={{ fontSize: 12, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Cluster {idx + 1}
                </span>
                <span style={{ fontSize: 11, color: "#6B7280", marginLeft: "auto" }}>
                  {members.length} {members.length === 1 ? "elemento" : "elementi"}
                </span>
              </div>

              {kws.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                  {kws.map(k => (
                    <span key={k.word} style={{ fontSize: 11, color, background: "#FFF", border: `1px solid ${color}33`, padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                      {k.word}
                    </span>
                  ))}
                </div>
              )}

              {medoidDoc && (
                <div style={{ background: "#FFF", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#374151", lineHeight: 1.5, marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                    Rappresentativo
                  </div>
                  <div style={{ fontStyle: "italic" }}>"{truncate(medoidDoc.text, 120)}"</div>
                  {medoidDoc.label && (
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>— {medoidDoc.label}</div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {members.filter(i => i !== medoids[idx]).map(i => (
                  <div key={i} style={{ fontSize: 11, color: "#6B7280", paddingLeft: 6, borderLeft: `2px solid ${color}40` }}>
                    {documents[i].label || `#${i + 1}`}: {truncate(documents[i].text || "", 60)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function silColor(s) {
  if (s >= 0.5) return "#10B981";
  if (s >= 0.25) return "#F59E0B";
  return "#EF4444";
}
function silLabel(s) {
  if (s >= 0.5) return "cluster ben separati";
  if (s >= 0.25) return "separazione parziale";
  if (s > 0) return "overlap elevato";
  return "struttura debole";
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
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
  },
  empty: {
    color: "#9CA3AF",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    padding: "24px 0",
  },
};
