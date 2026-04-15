# O.C.E.A.N. Exercizes — React + Vite

Interactive graph-based coaching simulation for the **Observe** phase of the O.C.E.A.N. model by [Steering Change](https://steeringchange.com).

---

## Prerequisites

| Tool       | Version  | Install                                                |
|------------|----------|--------------------------------------------------------|
| Node.js    | ≥ 18     | https://nodejs.org or `brew install node`              |
| npm        | ≥ 9      | comes with Node                                        |
| Docker     | ≥ 24     | https://docs.docker.com/get-docker/ (only for Docker)  |

---

## 1. Local Development (no Docker)

```bash
# 1. Clone / download the project
cd observe-react

# 2. Install dependencies
npm install

# 3. Start dev server with hot reload
npm run dev
```

Open **http://localhost:3000** in your browser.
Any file change triggers instant HMR (Hot Module Replacement).

### What you'll see

1. **Case selection** → click "Il Caso di Marco"
2. **Intro screen** → read the coachee context, click "Inizia la Sessione"
3. **Graph view** → click the blue "Origine" node → question drawer slides up
4. **Pick a question** → answer modal appears → close it → new node visible
5. **Repeat** as many times as you want
6. **Click "Termina Osservazione"** → summary page with full graph + 3 cards

---

## 2. Production Build (local preview)

```bash
# Build optimized static files
npm run build

# Preview the production build locally
npm run preview
```

Open **http://localhost:3000**.
The `dist/` folder contains the final static files (~150KB gzipped).

### Verify the build output

```bash
ls -lh dist/
# Expected:
# index.html        (~1KB)
# assets/
#   index-XXXX.js   (~140KB, or ~45KB gzipped)
#   index-XXXX.css   (0KB — styles are inline in JSX)
# logo.svg
```

---

## 3. Docker — Build and Run

### Quick start

```bash
docker compose up --build
```

Open **http://localhost:3000**.

### Step by step

```bash
# Build the image (multi-stage: Node build → Nginx serve)
docker build -t ocean-exercizes .

# Run the container
docker run -d -p 3000:80 --name observe ocean-exercizes

# Verify it's running
docker ps
curl http://localhost:3000

# View logs
docker logs observe

# Stop
docker stop observe && docker rm observe
```

### What the Dockerfile does

```
Stage 1 (node:20-alpine):
  - npm install
  - npm run build → produces dist/

Stage 2 (nginx:alpine):
  - Copies dist/ into nginx html root
  - Applies SPA fallback config
  - Serves on port 80
  - Final image: ~25MB
```

---

## 4. Deploy to Production

### Option A: Vercel (easiest, free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# Or deploy from the build output directly
npm run build
vercel deploy dist/ --prod
```

Vercel auto-detects Vite and configures everything.
Custom domain: Vercel dashboard → Settings → Domains.

### Option B: Netlify (free)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

Or connect your Git repo in the Netlify dashboard:
- Build command: `npm run build`
- Publish directory: `dist`

Add a `public/_redirects` file for SPA routing:
```
/*    /index.html   200
```

### Option C: GitHub Pages (free)

```bash
# Install gh-pages
npm i -D gh-pages

# Add to package.json scripts:
#   "deploy": "npm run build && gh-pages -d dist"

npm run deploy
```

Set `base` in `vite.config.js` if using a subpath:
```js
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

### Option D: Docker on a VPS (DigitalOcean, Hetzner, etc.)

```bash
# On your server
git clone <your-repo>
cd observe-react
docker compose up -d --build

# With a reverse proxy (Caddy — auto HTTPS)
# Caddyfile:
#   yourdomain.com {
#       reverse_proxy localhost:3000
#   }
sudo caddy run
```

### Option E: AWS S3 + CloudFront

```bash
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## 5. Adding New Cases

Edit `src/data/cases.js` and add a new key to the `CASES` object:

```js
export const CASES = {
  marco: { /* ... existing ... */ },

  lucia: {
    id: "lucia",
    title: "Il Caso di Lucia",
    subtitle: "Manager che fatica a gestire i conflitti",
    coachee: {
      name: "Lucia",
      role: "Operations Manager",
      context: "Lucia gestisce un team di 12 persone...",
    },
    nodes: {
      root: {
        id: "root",
        label: "Origine",
        type: "origin",
        description: "Lucia arriva puntuale...",
        traits: [],
      },
      // ... more nodes
    },
    edges: [
      { from: "root", to: "n1a", question: "Come descriveresti il clima nel team?" },
      // ... more edges
    ],
    nuggets: [
      "I conflitti sono spesso sintomi di bisogni inascoltati",
      // ...
    ],
  },
};
```

### Node types

| Type     | Appearance          | Meaning                          |
|----------|---------------------|----------------------------------|
| `origin` | Blue filled pill    | Starting node of the case        |
| `mid`    | White rounded rect  | Intermediate conversation state  |
| `leaf`   | Blue + lightbulb    | Deep insight / final discovery   |

---

## Project Structure

```
observe-react/
├── index.html              ← HTML shell
├── package.json            ← Dependencies + scripts
├── vite.config.js          ← Build configuration
├── nginx.conf              ← Production SPA routing
├── Dockerfile              ← Multi-stage build
├── docker-compose.yml      ← One-command Docker run
├── public/
│   └── logo.svg            ← Steering Change favicon
└── src/
    ├── main.jsx            ← React entry point
    ├── App.jsx             ← Full application (638 lines)
    └── data/
        └── cases.js        ← Case definitions (add more here)
```

---

## Troubleshooting

| Problem                           | Fix                                                      |
|-----------------------------------|----------------------------------------------------------|
| `npm install` fails               | Delete `node_modules` and `package-lock.json`, retry     |
| Port 3000 already in use          | `npx kill-port 3000` or change port in vite.config.js    |
| Docker build fails at npm install | Check you have `.dockerignore` excluding `node_modules`  |
| Blank page after deploy           | Ensure SPA fallback is configured (see deploy sections)  |
| Graph not scrolling               | The graph area is scrollable — try click-drag or trackpad|
| Font not loading                  | Google Fonts CDN is loaded at runtime — needs internet   |
