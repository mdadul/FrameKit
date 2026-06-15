# Framekit

**Store-ready screenshots** — a browser-based App Store and Google Play screenshot generator. Design once, export every required store size, and keep everything on your machine.

[GitHub](https://github.com/mdadul/FrameKit) · [Contributing](CONTRIBUTING.md)

## Why Framekit

- **Local-first** — projects autosave to IndexedDB in your browser; no account or cloud upload required
- **Store export built in** — Apple and Google Play size presets, bulk ZIP export with `ios/` and `android/` folders
- **Multi-platform workflow** — design on iOS frames, copy screens to Android with one action
- **Open source** — MIT licensed; fork it, self-host it, or contribute back

## Features

- Canvas editor with text, images, shapes, and device mockups
- 8 device frames (iPhone, iPad, Pixel, Galaxy)
- Layers, assets, starter templates, and per-project brand kit
- Multi-screen projects (up to 10 screens)
- Undo/redo (100 history states)
- IndexedDB autosave and `.ssgproj` import/export
- PNG/JPEG export at 1×, 2×, and 3×
- Bulk ZIP export for Apple and Android store presets
- Light/dark theme and workspace preferences
- Screen overview mode and dashboard thumbnails
- Keyboard shortcuts and first-run onboarding tour

## Tech stack

| Layer | Tools |
|-------|-------|
| UI | React 19, TypeScript, Tailwind CSS v4, Radix UI |
| Routing | TanStack Router |
| Canvas | Konva / React-Konva |
| State | Zustand + Immer |
| Storage | Dexie (IndexedDB) |
| Export | Canvas2D renderer, JSZip, Comlink workers |
| Build | Vite 8, Vitest, ESLint |

## Getting started

**Prerequisites:** [Bun](https://bun.sh) (recommended) or Node.js 20+

```bash
git clone https://github.com/mdadul/FrameKit.git
cd FrameKit
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

With npm:

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Typecheck and production build → `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run test` | Run unit tests (Vitest) |
| `bun run lint` | Lint with ESLint |

## Project layout

```
src/
├── components/     # React UI (canvas, panels, toolbar, landing)
├── hooks/          # Thin React hooks (selection, export, canvas)
├── lib/            # Pure business logic (export, templates, canvas math)
├── routes/         # TanStack Router pages
├── stores/         # Zustand stores (project, editor, history)
└── test/           # Shared test fixtures and setup
```

Pure logic lives in `src/lib/`; stores orchestrate mutations; components stay thin. See [CONTRIBUTING.md](CONTRIBUTING.md) for conventions.

## Deployment

Framekit is a static SPA. Build with `bun run build` and deploy the `dist/` folder to any static host:

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

## Project format

Projects can be exported as `.ssgproj` JSON files. A file contains screens, project settings, and embedded asset data so you can back up or share work outside the browser.

## Contributing

Bug reports, feature ideas, and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, architecture notes, and the PR checklist.

## License

[MIT](LICENSE)
