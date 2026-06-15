# Contributing to Framekit

Thank you for helping improve Framekit. This guide covers local setup, project conventions, and what we expect in pull requests.

## Ways to contribute

- **Report bugs** — [open an issue](https://github.com/mdadul/FrameKit/issues) with steps to reproduce, expected vs. actual behavior, and browser/OS
- **Suggest features** — describe the problem you are solving and how it fits store-screenshot workflows
- **Submit code** — bug fixes, tests, docs, and focused refactors are all welcome
- **Improve docs** — README, inline comments for non-obvious logic, and onboarding clarity

## Development setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/<your-username>/FrameKit.git
   cd FrameKit
   ```

2. Install dependencies (Bun recommended):

   ```bash
   bun install
   ```

3. Start the dev server:

   ```bash
   bun run dev
   ```

4. Before opening a PR, run:

   ```bash
   bun run test
   bun run build
   bun run lint
   ```

All three should pass. `build` runs TypeScript project references (`tsc -b`) in addition to the Vite bundle.

## Architecture

Framekit follows a simple layering model:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Lib** | `src/lib/` | Pure functions: export planning, template apply, canvas math, asset persistence. No React, no Zustand. |
| **Stores** | `src/stores/` | Domain state and mutations. `project-store` delegates to `stores/project/*` modules. |
| **Hooks** | `src/hooks/` | Thin React adapters (selection, export form, canvas viewport). |
| **Components** | `src/components/` | UI only — panels, canvas, toolbar, landing. |

**Rules of thumb:**

- Put reusable business rules in `src/lib/` with unit tests.
- Keep Zustand actions as thin wrappers: clone project → call lib/module → persist history.
- Prefer extending existing helpers over duplicating logic (especially export, templates, and asset upload).
- Use `@/` path aliases (`@/lib/...`, `@/components/...`).

## Code style

- **TypeScript** — strict types; avoid `any` unless unavoidable at a library boundary.
- **Naming** — intention-revealing names; functions do one thing; constants in `src/lib/constants/`.
- **Components** — match surrounding patterns (Tailwind utility classes, Radix primitives, existing panel layout).
- **Comments** — only where behavior is non-obvious; let code and tests document contracts.
- **Scope** — keep PRs focused. A bug fix should not include unrelated refactors.

## Testing

Tests use [Vitest](https://vitest.dev/) with jsdom. Shared fixtures live in `src/test/fixtures/`.

- Add or update tests when changing `src/lib/` behavior.
- Characterization tests are preferred for refactors: lock current behavior before moving code.
- Run `bun run test` locally; CI expects a green suite.

Example:

```bash
bun run test                           # all tests
bun run test src/lib/export/zip.ts     # path filter (Vitest)
```

## Pull request checklist

- [ ] `bun run test` passes
- [ ] `bun run build` passes
- [ ] `bun run lint` passes (or no new lint violations in touched files)
- [ ] Behavior change is intentional and described in the PR
- [ ] Refactors preserve existing UI, store actions, export output, and shortcuts unless the PR explicitly changes them
- [ ] No secrets, API keys, or personal data committed

### Commit messages

Use clear, imperative subjects. Prefer **why** over **what** when it helps reviewers:

```
fix export ZIP paths for Android tablet presets

Extract prepare-export-screen helper so ExportDialog and zip share resize logic
```

### PR description

Include:

1. **Summary** — what changed and why (1–3 bullets)
2. **Test plan** — commands run and any manual smoke steps (editor open, export preview, template apply, etc.)

## Manual smoke testing

For UI or export changes, quickly verify:

1. Landing page loads; create or open a project
2. Add text, image, shape, and device elements on the canvas
3. Apply a template; undo/redo
4. Export preview and download a PNG or ZIP
5. Import/export a `.ssgproj` file

## Project file format

`.ssgproj` files are JSON project bundles. Changes to the schema or import logic should remain backward compatible when possible, and should be called out in the PR if not.

## Questions

Open an issue if you are unsure whether an idea fits. For substantial features, filing an issue first helps align on scope before you invest in a large PR.
