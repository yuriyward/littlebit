# Repository Guidelines

This guide summarizes how to work effectively in this Astro + React islands project. Follow the conventions below to keep changes consistent and easy to review.

## Project Structure & Module Organization
- `src/pages/`: Routes (e.g., `index.astro`, `blog.astro`).
- `src/components/`: UI (Astro + React islands). PascalCase; `src/components/ui/` uses lowercase (e.g., `button.tsx`).
- `src/content/`: Collections and JSON; schemas in `src/content.config.ts`.
- `src/styles/`, `src/assets/`, `src/scripts/`, `src/lib/`: Styles, static assets, small utilities.
- `public/`: Static files; `public/pagefind/` is generated.
- `package/`: Custom Spectre integration used by `astro.config.ts`.
- Build outputs: `dist/`, `.astro/` (ignored).

## Build, Test, and Development Commands
- `bun run dev`: Start Astro dev server with HMR.
- `bun run dev:search`: Build once, copy Pagefind assets, then dev.
- `bun run build`: Production build to `dist/`.
- `bun run preview`: Serve the production build locally.
- `bun run format` / `bun run lint` / `bun run fix`: Format, lint, and autofix with Biome.

## Coding Style & Naming Conventions
- Indentation 2 spaces; max width 120; trailing commas `es5` (Biome).
- Imports organized automatically (Biome assist).
- Components in PascalCase (`Navbar.astro`, `SearchCommand.tsx`); primitives in `components/ui/` are lowercase.
- Use path alias `@/*` (see `tsconfig.json`). Keep pages accessible (A11y rules enabled).

## Testing Guidelines
- No formal test suite. Validate with: `bun run build && bun run preview` and exercise key pages.
- For search, verify `bun run dev:search` and that postbuild generates Pagefind assets.
- Prefer small, pure utilities in `src/lib/` with local usage examples.

## Commit & Pull Request Guidelines
- Commits: concise, imperative summary (e.g., "Fix pagefind copy path"). Conventional Commits not required.
- PRs: clear description, linked issues, and screenshots/GIFs for UI changes.
- Pre‑flight: run `bun run format`, `bun run lint`, and a local `bun run build`. Do not commit `dist/` or `.astro/`.

## Security & Configuration Tips
- Copy `.env.example` to `.env`. Configure Giscus via env in `astro.config.ts`: `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`, `GISCUS_CATEGORY_ID`, `GISCUS_MAPPING`, `GISCUS_STRICT`, `GISCUS_REACTIONS_ENABLED`, `GISCUS_EMIT_METADATA`, `GISCUS_LANG`.
- Never commit secrets. Access via `process.env` (Vite `loadEnv` is configured).

## Architecture Overview
- Astro static site with React islands, Tailwind CSS (Vite plugin), and a custom Spectre integration under `package/`.
- Content collections validate blog/project metadata in `src/content.config.ts`.
- Path aliases and Biome enforce consistency across TS/JS/Astro.
