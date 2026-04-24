import React, { useMemo } from "react";
import { buildWordCloudData } from "../../lib/textProcessing/index.js";

const FONT = "'Source Sans 3','Segoe UI',system-ui,sans-serif";

/*
  Tag-cloud layout: più leggibile e responsive di una nuvola a spirale
  per corpus piccoli (<100 parole), specialmente su mobile.

  Props:
    texts         — string[] obbligatorio (corpus da analizzare)
    maxWords      — numero di parole da mostrare (default 50)
    palette       — "byfreq" (quartili) | "bold5" | "brand" | "wb" | "bw"
    minFontSize   — px (default 14)
    maxFontSize   — px (default 44)
    uppercase     — maiuscolo (default false, come wcloudparams)
    title         — titolo opzionale sopra la nuvola
    extraStopwords — parole aggiuntive da ignorare (es. nome del coachee)
*/
export default function WordCloud({
  texts = [],
  maxWords = 50,
  palette = "byfreq",
  minFontSize = 14,
  maxFontSize = 44,
  uppercase = false,
  title,
  extraStopwords = [],
  emptyLabel = "Non ci sono abbastanza parole da mostrare.",
}) {
  const data = useMemo(
    () => buildWordCloudData(texts, { maxWords, palette, uppercase, extraStopwords }),
    [texts, maxWords, palette, uppercase, extraStopwords]
  );

  if (data.length === 0) {
    return (
      <div style={{ ...styles.wrapper, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#9CA3AF", fontSize: 13, fontStyle: "italic" }}>{emptyLabel}</span>
      </div>
    );
  }

  const bg = palette === "wb" ? "#111827" : "#FFF";
  const defaultColor = palette === "wb" ? "#FFF" : "#111827";

  return (
    <div style={{ ...styles.wrapper, background: bg }}>
      {title && <div style={{ ...styles.title, color: palette === "wb" ? "#FFF" : "#111827" }}>{title}</div>}
      <div style={styles.cloud} role="list" aria-label="Word cloud">
        {data.map(({ word, freq, color, weight }) => {
          const size = minFontSize + weight * (maxFontSize - minFontSize);
          return (
            <span
              key={word}
              role="listitem"
              title={`${word} — ${freq} occorrenze`}
              style={{
                fontSize: size,
                fontWeight: 600 + Math.round(weight * 300), // 600..900
                color: color || defaultColor,
                lineHeight: 1.15,
                padding: "2px 4px",
                whiteSpace: "nowrap",
                cursor: "default",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
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
    marginBottom: 12,
  },
  cloud: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 10px",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
};
