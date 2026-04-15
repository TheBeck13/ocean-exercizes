import LOGO_SVG from "../public/logo.svg?raw";

const BLUE = "#0099E6";
const HEADER_H = 56;
const FONT = "'Source Sans 3', sans-serif";

function Logo({ size = 40, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size, color: "#1A2B3C", flexShrink: 0, cursor: onClick ? "pointer" : "default" }}
      dangerouslySetInnerHTML={{ __html: LOGO_SVG }}
    />
  );
}

/**
 * Top navigation bar shared across all exercises.
 *
 * Props:
 *   phase     — breadcrumb level 1 (default "Osserva")
 *   exercise  — breadcrumb level 2, e.g. "Story Map", "Le 5 Lenti"
 *   subtitle  — breadcrumb level 3, optional (e.g. "Sessione Personale")
 *   onHome    — called when Logo or ← Home button is clicked
 *   right     — optional JSX rendered between breadcrumb and ← Home button
 */
export default function Navbar({ phase = "Osserva", exercise, subtitle, onHome, right }) {
  return (
    <header style={{ padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E8ECF0", background: "#FFF", height: HEADER_H, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Logo size={30} onClick={onHome} />
        <span style={{ fontSize: 14, color: "#9CA3AF" }}>›</span>
        <span style={{ fontSize: 14, color: "#9CA3AF" }}>{phase}</span>
        {exercise && (
          <>
            <span style={{ fontSize: 14, color: "#9CA3AF" }}>›</span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{exercise}</span>
          </>
        )}
        {subtitle && (
          <>
            <span style={{ fontSize: 14, color: "#9CA3AF" }}>›</span>
            <span style={{ fontSize: 14, color: "#9CA3AF" }}>{subtitle}</span>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {right}
        <button
          onClick={onHome}
          style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: FONT }}
          onMouseEnter={e => e.currentTarget.style.borderColor = BLUE}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
        >
          ← Home
        </button>
      </div>
    </header>
  );
}
