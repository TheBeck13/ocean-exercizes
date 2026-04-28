import React, { useEffect, useMemo, useRef, useState } from "react";
import cloud from "d3-cloud";
import { buildWordCloudData } from "../../lib/textProcessing/index.js";

const FONT = "'Source Sans 3','Segoe UI',system-ui,sans-serif";

/*
  Wordle-style word cloud: spiral packing with d3-cloud, SVG output.

  Props:
    texts          — string[] obbligatorio (corpus da analizzare)
    maxWords       — numero di parole da mostrare (default 60)
    palette        — "byfreq" (quartili) | "bold5" | "brand" | "wb" | "bw"
    minFontSize    — px (default 14)
    maxFontSize    — px (default 64)
    uppercase      — maiuscolo (default false)
    title          — titolo opzionale sopra la nuvola
    extraStopwords — parole aggiuntive da ignorare
    height         — altezza area cloud in px (default 360)
    rotate         — "mixed" (0/90) | "horizontal" (solo 0) | "scatter" (-30..30)
*/
export default function WordCloud({
  texts = [],
  maxWords = 60,
  palette = "byfreq",
  minFontSize = 14,
  maxFontSize = 64,
  uppercase = false,
  title,
  extraStopwords = [],
  emptyLabel = "Non ci sono abbastanza parole da mostrare.",
  height = 360,
  rotate = "mixed",
}) {
  // Hash stabile sul CONTENUTO (non sulla reference) di texts/extraStopwords:
  // così un parent che ricrea l'array a ogni render non invalida la memoization.
  const inputsKey = useMemo(
    () => `${hashStrings(texts)}|${hashStrings(extraStopwords)}|${maxWords}|${palette}|${uppercase ? 1 : 0}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hashStrings(texts), hashStrings(extraStopwords), maxWords, palette, uppercase]
  );

  const data = useMemo(
    () => buildWordCloudData(texts, { maxWords, palette, uppercase, extraStopwords }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputsKey]
  );

  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [placed, setPlaced] = useState([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastW = 0;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.max(0, Math.floor(e.contentRect.width));
        // Ignora micro-oscillazioni (es. scrollbar di 1-2px) che farebbero
        // ripartire il layout in loop con il proprio output.
        if (Math.abs(w - lastW) < 2) continue;
        lastW = w;
        setWidth(w);
      }
    });
    ro.observe(el);
    lastW = el.clientWidth;
    setWidth(lastW);
    return () => ro.disconnect();
  }, []);

  // Chiave di layout stabile: dipende solo da contenuto + dimensioni.
  const layoutKey = `${inputsKey}|${width}|${height}|${minFontSize}|${maxFontSize}|${rotate}`;
  const lastLayoutKeyRef = useRef("");

  useEffect(() => {
    if (!width || data.length === 0) {
      setPlaced([]);
      lastLayoutKeyRef.current = "";
      return;
    }
    // Evita di rilanciare d3-cloud se la chiave è identica all'ultima eseguita.
    if (lastLayoutKeyRef.current === layoutKey) return;
    lastLayoutKeyRef.current = layoutKey;

    const rotateFn = pickRotateFn(rotate);
    const words = data.map((d) => ({
      text: d.word,
      size: minFontSize + d.weight * (maxFontSize - minFontSize),
      freq: d.freq,
      color: d.color,
    }));

    let cancelled = false;
    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(2)
      .rotate(rotateFn)
      .font(FONT)
      .fontWeight((w) => 600 + Math.round(((w.size - minFontSize) / Math.max(1, maxFontSize - minFontSize)) * 300))
      .fontSize((w) => w.size)
      .spiral("archimedean")
      .random(seededRandom(hashStrings(words.map((w) => w.text))))
      .on("end", (out) => {
        if (!cancelled) setPlaced(out);
      });

    layout.start();

    return () => {
      cancelled = true;
      layout.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey]);

  const bg = palette === "wb" ? "#111827" : "#FFF";
  const defaultColor = palette === "wb" ? "#FFF" : "#111827";

  if (data.length === 0) {
    return (
      <div style={{ ...styles.wrapper, background: bg, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#9CA3AF", fontSize: 13, fontStyle: "italic" }}>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ ...styles.wrapper, background: bg }}>
      {title && <div style={{ ...styles.title, color: palette === "wb" ? "#FFF" : "#111827" }}>{title}</div>}
      <div style={{ width: "100%", height, position: "relative" }} aria-label="Word cloud" role="img">
        {width > 0 && placed.length > 0 && (
          <svg width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`} style={{ display: "block" }}>
            <g>
              {placed.map((w) => (
                <text
                  key={w.text}
                  textAnchor="middle"
                  transform={`translate(${w.x},${w.y}) rotate(${w.rotate})`}
                  style={{
                    fontFamily: FONT,
                    fontSize: w.size,
                    fontWeight: w.weight || 700,
                    fill: w.color || defaultColor,
                    cursor: "default",
                    userSelect: "none",
                  }}
                >
                  <title>{`${w.text} — ${w.freq} occorrenze`}</title>
                  {w.text}
                </text>
              ))}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}

function pickRotateFn(mode) {
  if (mode === "horizontal") return () => 0;
  if (mode === "scatter") return () => Math.round((Math.random() - 0.5) * 60);
  // "mixed": ~75% orizzontale, ~25% verticale (-90), come nei Wordle classici
  return () => (Math.random() < 0.75 ? 0 : -90);
}

function hashStrings(arr) {
  if (!arr || arr.length === 0) return 0;
  let h = 2166136261;
  for (const s of arr) {
    const str = typeof s === "string" ? s : String(s);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    // separatore tra elementi per evitare collisioni "ab"+"c" vs "a"+"bc"
    h ^= 0x1f;
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
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
};
