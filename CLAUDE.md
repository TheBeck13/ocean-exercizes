# CLAUDE.md — O.C.E.A.N. Exercizes

## What This Project Is

An interactive graph-based coaching simulation for the **Osserva** phase of the [O.C.E.A.N. coaching model](https://steeringchange.com). The correct Italian phase names are: **Osserva, Crea, Esponi, Avviva, Nutri**. Trainee coaches navigate a directed graph by choosing questions to ask a coachee. Each question reveals new conversation nodes and unlocks personality traits, resources, or blockers. At the end, a summary shows coverage vs. the full ground-truth graph.

The summary basics of the Observe phase are in the file `osserva-riepilogo.txt`. Always remember the golden rule: **The word why is banned when asking a question**.

One implementation exists in this repo:

- `ocean-exercizes/` — React + Vite SPA, served via Nginx in Docker. **This is the primary implementation.**

Both are independently deployable. The React version is preferred for production (zero server, pure static files, ~25MB Docker image).

---

## Project Context

- **Client**: Steering Change (steeringchange.com) — coaching/change management consultancy
- **Users**: Trainee coaches learning the O.C.E.A.N. methodology
- **Language**: All UI text is in **Italian**. Variable names and code comments are in English.
- **Design reference**: Figma file "ObserveStoryMap.fig" (proprietary binary kiwi format, not parseable). Key design screenshots were used instead.
- **Logo**: Steering Change steering wheel icon — `logo.svg`, embedded inline as `LOGO_SVG` constant
- **Lightbulb icon**: `lampadina.svg` — used on leaf nodes, embedded inline as `BULB_SVG` constant

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Browser                                                 │
│ ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐ │
│ │  Case     │→│  Graph    │→│  Answer  │→│ Summary│ │
│ │  Select   │  │  + Drawer │  │  Modal   │  │  Page  │ │
│ └──────────┘  └───────────┘  └──────────┘  └────────┘ │
│                                                         │
│  State machine: select → intro → play → summary         │
└─────────────────────────────────────────────────────────┘
         │ (React: all client-side)
         │ (Python: REST API for case data + summary compute)
```

### State Machine Phases

| Phase     | What Happens                                                        |
|-----------|---------------------------------------------------------------------|
| `select`  | User picks a case from available options                            |
| `intro`   | Case briefing: coachee name, role, context, instructions            |
| `play`    | Interactive graph exploration with question drawer and answer modal  |
| `summary` | Full graph overlay + 3 summary cards (completion, results, nuggets) |

### Session State (client-side only, no persistence)

```
exploredPath:     string[]     — ordered list of visited node IDs, always starts with "root"
exploredEdges:    {from, to}[] — edges the user has traversed
discoveredTraits: string[]     — deduplicated traits collected from explored nodes
selectedNodeId:   string       — currently highlighted node
drawerNodeId:     string|null  — node whose questions are showing (null = drawer closed)
answerNode:       object|null  — node whose answer modal is showing (null = modal closed)
zoom:             number       — graph zoom level (0.3–2.0, default 1)
```

---

## Design System

### Colors

| Token        | Hex       | Usage                                    |
|--------------|-----------|------------------------------------------|
| `BG`         | `#F8FBFF` | Page/section background                  |
| `BLUE`       | `#0099E6` | Primary brand, origin/leaf nodes, CTAs   |
| `BLUE_DARK`  | `#0077B3` | Hover states, origin node stroke         |
| `CYAN_EDGE`  | `#7DD4F0` | Explored edge color                      |
| `GRAY_NODE`  | `#E0E0E0` | Unexplored node fill                     |
| `GRAY_BORDER`| `#C0C4CA` | Unexplored node/leaf stroke              |
| `GRAY_EDGE`  | `#C8CDD3` | Unexplored edge color (summary view)     |
| Amber accent | `#F59E0B` | Trait badges on nodes                    |
| Nuggets grad | `linear-gradient(150deg, #00B4F0 0%, #0099E6 40%, #0077B3 100%)` | Nuggets card |

### Typography

- **Font**: Source Sans 3 (Google Fonts, loaded at runtime)
- **Fallback**: `'Segoe UI', system-ui, sans-serif`
- Origin node labels: 15px/700, Leaf/mid labels: 11.5px/500

### Layout Rules

- **Every screen fills 100vh exactly** — no page-level scrolling
- **Header is always fixed** at top via flex column with `flexShrink: 0`
- **Graph area** gets `flex: 1; minHeight: 0; overflow: auto` — only this scrolls
- **Summary page**: header (56px) + graph (flex) + cards panel (flexShrink: 0) = 100vh

### Node Types

| Type     | Shape                 | Fill (explored)  | Icon                |
|----------|-----------------------|------------------|---------------------|
| `origin` | Rounded rect 130+px  | `#0099E6` solid  | None                |
| `mid`    | Rounded rect auto-w  | `#FFF` + border  | None                |
| `leaf`   | Rounded rect auto-w  | `#0099E6` solid  | Lightbulb (left)    |

Node width is computed dynamically: `text.length × fontSize × 0.58 + 24` (+ 30px extra for leaf icon). This lives in `measureText()`.

---

## Data Model — Case Schema

Both implementations use the same data structure. In React it's a JS object in `src/data/cases.js`. In Python it's a JSON file in `app/cases/*.json` validated by Pydantic.

```
Case {
  id:       string              — unique slug, used as key ("marco")
  title:    string              — display title ("Il Caso di Marco")
  subtitle: string              — one-line description
  coachee: {
    name:    string             — "Marco"
    role:    string             — "Team Lead, Sviluppo Prodotto"
    context: string             — paragraph describing the situation
  }
  nodes: {
    [nodeId]: {
      id:          string       — must match the key
      label:       string       — short display name (fits in node box)
      type:        "origin" | "mid" | "leaf"
      description: string       — full text shown in answer modal
      traits:      string[]     — traits unlocked when this node is explored
    }
  }
  edges: [
    {
      from:     string          — source node ID
      to:       string          — target node ID
      question: string          — the coaching question text shown in drawer
    }
  ]

  // Wrong-question edges (shown only in "errors" mode, not in normal play):
  edges (wrong variant): [
    {
      from:        string       — source node ID (same as above)
      wrong:       true         — flags this edge as an incorrect coaching question
      question:    string       — the wrong question text
      errorReason: string       — explanation of why the question violates O.C.E.A.N. principles
      // NOTE: no "to" field — wrong edges do not navigate to any node
    }
  ]
  nuggets: string[]             — learning insights shown on summary page
}
```

**Constraints**:
- Every case MUST have a node with `id: "root"` and `type: "origin"` — it's the starting node
- All `from`/`to` values in edges must reference existing node IDs
- The graph is a DAG (directed acyclic graph) — no cycles allowed
- Node IDs should be short slugs (e.g. `n1a`, `n2b`, `n3c`)
- `type: "leaf"` nodes are terminal insights — they typically have no outgoing edges
- The `traits` array can contain any string; prefixes like "Insight:", "Risorsa:", "Blocco:" are used for semantic categorization but are not enforced

**Adding a new case**:
- React: add a new key to the `CASES` object in `src/data/cases.js`
- Python: drop a new `.json` file in `app/cases/` matching the schema above

---

## React Implementation

### File Map

```
src/
├── main.jsx                    ← React root mount
├── App.jsx                     ← Routing shell + HomeScreen + PhaseScreen
├── components/
│   └── Navbar.jsx              ← Shared top navigation bar (used by ALL exercises)
├── data/
│   └── cases.js                ← Case data (exported CASES object)
├── exercises/
│   ├── StoryMap.jsx            ← Observe → Story Map exercise
│   ├── CinqueLenti.jsx         ← Observe → Le 5 Lenti exercise
│   └── LaFoto.jsx              ← Observe → La Foto exercise
└── public/
    ├── logo.svg                ← Steering Change logo (used inside Navbar.jsx)
    └── bulb.svg                ← Lightbulb icon (used in StoryMap leaf nodes)
```

### Key Design Decision: Single-File Exercises

Each exercise lives in its own file under `src/exercises/`. All constants, layout helpers, and sub-components that are private to an exercise are defined locally in that file. If an exercise file grows past ~600 lines, consider splitting into sub-components.

`App.jsx` is a pure routing shell: it renders `HomeScreen`, `PhaseScreen`, or delegates to an exercise component. It contains no exercise-specific logic.

### Shared Components

`src/components/` holds UI components used across multiple exercises. Currently:

| Component   | File                      | Purpose                                      |
|-------------|---------------------------|----------------------------------------------|
| `Navbar`    | `components/Navbar.jsx`   | Top navigation bar, breadcrumb, ← Home button |

**Every new exercise MUST use `<Navbar>` from `src/components/Navbar.jsx`.** Never reimplement a local header or Logo component inside an exercise.

#### Navbar API

```jsx
import Navbar from "../components/Navbar.jsx";

<Navbar
  exercise="Nome Esercizio"   // breadcrumb level 2 — REQUIRED
  phase="Osserva"             // breadcrumb level 1 — default "Osserva"
  subtitle="..."              // breadcrumb level 3 — optional
  onHome={fn}                 // called on Logo click and ← Home button — REQUIRED
  right={<JSX />}             // contextual content rendered left of ← Home — optional
/>
```

The `right` prop is a render slot: pass badges, counters, or action buttons specific to the current screen state. The ← Home button is always rendered by `Navbar` itself — never add a separate one.

### Component Tree

```
ObserveStoryMap (root, state machine)
├── [select]  → case picker cards
├── [intro]   → briefing card with coachee info
├── [play]    → header + GraphCanvas + QuestionDrawer? + AnswerModal? + FAB
│   ├── GraphCanvas (SVG rendering + zoom state + scroll)
│   │   └── ZoomControls (+/−/reset buttons)
│   ├── QuestionDrawer (bottom sheet with question buttons)
│   └── AnswerModal (centered overlay with node description + traits)
└── [summary] → SummaryPage
    ├── header + restart button
    ├── GraphCanvas (showFullGraph=true, explored=cyan, unexplored=gray dashed)
    └── 3 summary cards (completion, results %, nuggets gradient)
```

### Graph Rendering Pipeline

1. `computeLayout(nodes, edges)` → BFS from "root", assigns depth (x-axis) and slot (y-axis), computes per-node width via `measureText()`
2. Returns `{ positions: {id: {x,y}}, nodeWidths: {id: number}, width, height }`
3. `GraphCanvas` renders an `<svg>` with width/height multiplied by zoom factor
4. Edges: cubic bezier paths connecting node edges (using `nodeWidths` for attachment points)
5. Nodes: `<rect>` + `<text>`, leaf nodes get `<foreignObject>` with lightbulb SVG
6. Trait badges: `<circle>` + `<text>` at top-right corner of explored nodes
7. Selection glow: animated `<rect>` with pulsing opacity

### Zoom

- State: `zoom` in `GraphCanvas` (local useState, range 0.3–2.0)
- SVG width/height are multiplied by zoom; `viewBox` stays constant → scales content
- Controls: `ZoomControls` component (bottom-left), plus `Ctrl+scroll` / `⌘+scroll`
- Summary graph has no zoom controls (fixed view)

### Commands

```bash
npm install          # install deps
npm run dev          # dev server on :3000 with HMR
npm run build        # production build → dist/
npm run preview      # preview production build on :3000
docker compose up --build   # build + run on :3000
```

---

## Common Patterns & Conventions

### Interaction Flow

```
User clicks explored node
  → drawer opens (bottom sheet) with questions from that node
    → user clicks a question
      → drawer closes
      → edge + target node added to explored state
      → traits from target node added to discoveredTraits
      → answer modal opens showing node description + traits
        → user clicks "Continua"
          → modal closes
          → graph re-renders with new node visible
          → auto-scrolls to new node
```

### Graph Layout Algorithm

Both implementations use identical logic:
1. Build children adjacency map from edges
2. BFS from "root" to assign depth (0, 1, 2, ...) to each node
3. Group nodes by depth → each depth becomes an x-column
4. Within each column, space nodes evenly on y-axis, centered vertically
5. Horizontal spacing: `X_STEP = 210px`, vertical: `Y_STEP = 100px`, padding: `PAD_X = 120px, PAD_Y = 60px`

### SVG Rendering

- Edges: cubic bezier `M x1 y1 C mx y1, mx y2, x2 y2` where `mx = midpoint + 20px`
- Edge attachment: at horizontal node edges (uses `nodeWidths[id]/2` offset)
- Lightbulb icon: rendered via `<foreignObject>` to support complex SVG path inside a `<div>` with CSS `color` for theming
- Trait badge: `<circle r=9>` + `<text>` at node top-right

### Summary Page — Full Graph Overlay

When `showFullGraph=true`:
- ALL nodes are rendered (not just explored)
- Explored nodes/edges: normal colors (cyan edges, white/blue fills)
- Unexplored nodes: gray fill + gray border
- Unexplored edges: gray dashed lines at 40% opacity
- No click handlers, no zoom controls, no selection glow

---

## Common Gotchas

1. **Node "root" is hardcoded** — the layout engine starts BFS from `"root"`. Every case must have this node. If you want configurable start nodes, change the BFS seed in `computeLayout()`.

2. **Inline SVGs are large** — `LOGO_SVG` (in `Navbar.jsx`) and `BULB_SVG` (in `StoryMap.jsx`) are embedded as string constants (~3KB each). This avoids network requests but bloats the source. Don't add more inline SVGs without good reason. `LOGO_SVG` lives only in `Navbar.jsx` — exercises must never import it directly.

3. **Zoom state is local to GraphCanvas** (React) — it resets when the component unmounts (e.g., switching phases). This is intentional. The summary page has no zoom.

4. **No persistence** — session state is lost on page refresh. This is by design (stateless server). To add persistence, use localStorage on the client or add a session API endpoint.

5. **`measureText()` is an approximation** — it uses `charCount × fontSize × 0.58 + padding`. This works for Source Sans 3 but will be inaccurate for other fonts. For pixel-perfect sizing, you'd need a canvas-based text measurement.

6. **No CSS file in React** — all styles are inline JSX objects. The Python version uses a proper `.css` file with CSS variables. If migrating styles, the CSS var names map directly to the React constants.

7. **Clean Code Rules** – always follow Uncle Bob's Clean Code guidelines.

---

## Testing

### React: manual

No automated tests yet. To verify:
1. `npm run dev` → navigate all 4 phases
2. Click every node, verify questions appear
3. Explore 3+ nodes → "Termina Osservazione" button appears
4. Summary page shows correct coverage %
5. Zoom: Ctrl+scroll, +/− buttons, reset to 100%

---

## Deployment

### React (preferred)

```bash
# Static hosting (Vercel/Netlify) — zero config
npm run build && vercel deploy dist/ --prod

# Docker on VPS
docker compose up -d --build  # serves on :3000 via nginx
```

Final Docker image: ~25MB (nginx:alpine + ~150KB static files).

### Resource Requirements

| Implementation | Image Size | Memory  | CPU    |
|----------------|-----------|---------|--------|
| React/Nginx    | ~25MB     | 64MB    | 0.25   |