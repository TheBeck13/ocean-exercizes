import React, { useMemo } from "react";
import { topKeywordsCorpus, topKeywordsPerDoc } from "../../lib/textProcessing/index.js";

const FONT = "'Source Sans 3','Segoe UI',system-ui,sans-serif";
const BLUE = "#0099E6";

/*
  Lista top keywords TF-IDF.

  Modalità:
    - groups: { [label]: string[] } → top-N per ciascun gruppo (es. "Coach", "Coachee")
    - texts: string[] → top-N sull'intero corpus unito

  Props:
    topN       — quante parole mostrare (default 10)
    title      — opzionale
    extraStopwords — parole aggiuntive da ignorare
*/
export default function KeywordRanking({ groups, texts = [], topN = 10, title, extraStopwords = [] }) {
  const corpusData = useMemo(() => {
    if (groups) {
      return Object.entries(groups).map(([label, ts]) => ({
        label,
        keywords: topKeywordsCorpus(ts || [], { topN, extraStopwords }),
      }));
    }
    return [{
      label: "",
      keywords: topKeywordsCorpus(texts, { topN, extraStopwords }),
    }];
  }, [groups, texts, topN, extraStopwords]);

  const hasData = corpusData.some(g => g.keywords.length > 0);
  if (!hasData) {
    return (
      <div style={styles.wrapper}>
        {title && <div style={styles.title}>{title}</div>}
        <div style={styles.empty}>Nessuna parola chiave da mostrare.</div>
      </div>
    );
  }

  const cols = corpusData.length;
  const hasAnyLabel = corpusData.some(g => !!g.label);

  return (
    <div style={styles.wrapper}>
      {title && <div style={styles.title}>{title}</div>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: 20,
          alignItems: "start",
        }}
      >
        {corpusData.map((g, i) => {
          const colMax = Math.max(...g.keywords.map(k => k.weight), 0.0001);
          return (
            <div key={i} style={{ minWidth: 0 }}>
              {hasAnyLabel && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: BLUE,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 10,
                    minHeight: "2.4em",
                    lineHeight: 1.2,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  {g.label || ""}
                </div>
              )}
              <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {g.keywords.map((k, idx) => (
                  <li key={k.word} style={{ display: "grid", gridTemplateColumns: "18px minmax(0, 1fr) auto", alignItems: "center", columnGap: 8 }}>
                    <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textAlign: "right" }}>
                      {idx + 1}.
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#111827",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: 3,
                        }}
                        title={k.word}
                      >
                        {k.word}
                      </div>
                      <div style={{ height: 4, background: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${(k.weight / colMax) * 100}%`,
                            background: BLUE,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        fontWeight: 600,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {k.weight.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Variante: top keywords di OGNI documento (usa topKeywordsPerDoc).
export function PerDocumentKeywords({ documents, topN = 5, title }) {
  const keywords = useMemo(
    () => topKeywordsPerDoc(documents.map(d => d.text), { topN }),
    [documents, topN]
  );
  return (
    <div style={styles.wrapper}>
      {title && <div style={styles.title}>{title}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {documents.map((d, i) => (
          <div key={i} style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 6 }}>
              {d.label || `Documento ${i + 1}`}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {keywords[i].length === 0 ? (
                <span style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>nessuna keyword</span>
              ) : keywords[i].map(k => (
                <span key={k.word} style={{ background: "#FFF", border: `1px solid ${BLUE}33`, color: BLUE, borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 600 }}>
                  {k.word}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
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
  empty: {
    color: "#9CA3AF",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    padding: "24px 0",
  },
};
