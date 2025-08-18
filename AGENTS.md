# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/`: Astro pages (routes), e.g., `index.astro`, `blog.astro`.
- `src/components/`: UI components (Astro + React islands). PascalCase components; `src/components/ui/` uses lowercase filenames.
- `src/content/`: Content collections and JSON data; schemas in `src/content.config.ts`.
- `src/styles/`, `src/assets/`, `src/scripts/`, `src/lib/`: Styles, static assets, utilities.
- `public/`: Static files copied as-is. `public/pagefind/` is generated.
- `package/`: Spectre integration source used by `astro.config.ts`.
- `dist/`, `.astro/`: Build outputs (ignored).

## Build, Test, and Development Commands
- `bun run dev`: Start Astro dev server with HMR.
- `bun run dev:search`: Build once, copy Pagefind assets, then dev.
- `bun run build`: Production build (static output under `dist/`).
- `bun run preview`: Preview the production build locally.
- `bun run format`: Format code with Biome.
- `bun run lint`: Lint code with Biome.
- `bun run fix`: Autofix issues (Biome check --write).

## Coding Style & Naming Conventions
- Indentation: 2 spaces; max line width 120; trailing commas `es5` (Biome).
- Imports: organized automatically (Biome assist).
- Components: Astro/TSX in PascalCase (`Navbar.astro`, `SearchCommand.tsx`); shared primitives lowercase in `components/ui/`.
- Paths: use alias `@/*` (see `tsconfig.json`).
- Run `bun run format && bun run lint` before commits; keep pages accessible (A11y rules enabled).

## Testing Guidelines
- No formal test suite. Validate changes by `bun run build && bun run preview` and exercising key pages.
- For search, ensure `bun run dev:search` works and `postbuild` generates Pagefind.
- Prefer small, pure utilities in `src/lib/` with local usage examples.

## Commit & Pull Request Guidelines
- Commits: concise, imperative summary (e.g., "Fix pagefind copy path"). Conventional Commits not required.
- PRs: include a clear description, linked issues, and screenshots/GIFs for UI changes.
- Pre-flight: run `format`, `lint`, and a local `build`. Do not commit `dist/` or `.astro/`.

## Security & Configuration Tips
- Environment: copy `.env.example` to `.env`. Configure Giscus via `astro.config.ts` env vars: `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`, `GISCUS_CATEGORY_ID`, `GISCUS_MAPPING`, `GISCUS_STRICT`, `GISCUS_REACTIONS_ENABLED`, `GISCUS_EMIT_METADATA`, `GISCUS_LANG`.
- Do not commit secrets. Use `process.env` via Vite `loadEnv` (already configured).

## Architecture Overview
- Astro static site with React islands, Tailwind CSS (Vite plugin), and a custom Spectre integration (`package/`).
- Content collections define blog/projects metadata and validation in `src/content.config.ts`.
- Path aliases and Biome enforce consistency across TS/JS/Astro.

