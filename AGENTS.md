<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# StudyFlow

A Next.js App Router app for frontend practice. UI only: no backend, auth, database, API routes, or environment variables. All data is hardcoded mock state inside components.

## Commands

- `npm run dev` — dev server on http://localhost:3000 (Turbopack is the default bundler in Next 16).
- `npm run build` / `npm start` — production build and serve.
- `npm run lint` — bare `eslint` against `eslint.config.mjs` (flat config). `next lint` was removed in Next 16.
- `npx tsc --noEmit` — the only typecheck; there is no `typecheck` script.
- No test runner is installed and there are no tests. Verify UI changes in the browser.

## Stack notes

- Next 16.3.7 + React 19.2. Before touching a Next API, read the bundled docs in `node_modules/next/dist/docs/` — e.g. `01-app/02-guides/upgrading/version-16.md` for what changed vs. Next 15: `middleware.ts` → `proxy.ts`, async `params`/`searchParams`/`cookies()`, `next lint` and AMP removed, Turbopack default.
- Tailwind v4, CSS-first: there is no `tailwind.config.js`. The entry point is `app/globals.css` (`@import "tailwindcss"`); define theme tokens with `@theme`.
- The `@/*` alias maps to the **repo root**, not `app/` (`tsconfig.json`). `@/components/...` will not resolve — use relative imports like the existing code, or `@/app/components/...`.

## Architecture

- `app/layout.tsx` is the app shell: `Sidebar` + `Topbar` wrapped around `{children}`.
- Every route page renders its own `<main className="min-h-screen bg-[#fff9fc] p-8">` inside the layout's `<main>`, which means nested `<main>` elements and doubled `min-h-screen`. This is the established pattern; be consistent rather than "fixing" it in one file.
- `app/components/` holds shared UI (`Sidebar`, `Topbar`, `StatCard`). `StatCard` is currently unused by any page.
- Route folders (`tasks`, `sessions`, `subjects`, `notes`, `progress`, `settings`) each contain a single `page.tsx` that is `'use client'`, declares its own local mock array at the top of the file, and manages everything with `useState`/`useMemo`. There is no shared data layer, store, or context — don't go looking for one, and don't introduce one uninvited.
- State is in-memory only, so every edit is lost on reload. Adding persistence means building it from scratch.
- `/` (`app/page.tsx`) is unfinished: it is a copy of the settings screen (its component is still named `SettingsPage`) and never renders `StatCard`. The dashboard is effectively a TODO.
- Adding a section means editing `menuItems` in `app/components/Sidebar.tsx` **and** creating the matching route folder, or the link 404s.

## Style conventions

- Pastel pink/purple aesthetic: page background `bg-[#fff9fc]`, cards `rounded-3xl border border-pink-100 bg-white p-6 shadow-sm`, primary buttons `bg-pink-500 ... hover:bg-pink-600`.
- Emoji stand in for icons — no icon library is installed.
- Styling is hand-written Tailwind utility classes only: no CSS modules, no styled components, no `clsx`/class-name helper.
- `app/globals.css` has dead code worth knowing about: its dark-mode media query can never apply, because `<body>` carries `bg-[#fff9fc]` in `layout.tsx`, which outranks the `body { background: var(--background) }` rule. Likewise `--font-sans`/`--font-mono` still reference `--font-geist-*` variables that no longer exist after the Geist font import was removed from the layout.