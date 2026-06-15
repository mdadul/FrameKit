# Screenshot Studio OSS

A browser-based App Store and Google Play screenshot generator. Design once, export all required store sizes, and keep everything local.

## Features

- Canvas editor with text, images, shapes, and device mockups
- 8 device frames (iPhone, iPad, Pixel, Galaxy)
- Layers, assets, templates, and brand kit
- Multi-screen projects (up to 10 screens)
- Undo/redo (100 states)
- IndexedDB autosave and `.ssgproj` import/export
- PNG/JPEG export at 1x/2x/3x
- Bulk ZIP export for Apple and Android store presets
- Light/dark theme and workspace preferences
- Project rename, save status, and confirmation dialogs
- Smart export with ios/ / android/ ZIP folders
- Screen overview mode and dashboard thumbnails
- Per-project brand kit and keyboard shortcuts guide
- First-run onboarding tour

## Tech Stack

- React 19 + TypeScript + Vite
- TanStack Router
- Zustand + Immer
- Konva / React-Konva
- Dexie (IndexedDB)
- Tailwind CSS v4
- dnd-kit, Radix UI, JSZip

## Getting Started

```bash
bun install
bun run dev
```

Open `http://localhost:5173`.

## Scripts

```bash
bun run dev      # Start dev server
bun run build    # Production build
bun run preview  # Preview production build
bun run test     # Run unit tests
bun run lint     # Lint project
```

## Deployment

The app is a static SPA. Build with `bun run build` and deploy the `dist/` folder to:

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

## Project Format

Projects can be exported as `.ssgproj` JSON files containing screens, settings, and embedded assets.

## License

MIT
