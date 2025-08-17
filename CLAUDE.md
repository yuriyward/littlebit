# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `bun run dev` - Start development server
- `bun run dev:search` - Build first, copy pagefind, then start dev (for testing search)
- `bun run build` - Build for production
- `bun run start` - Run production build locally
- `bun run preview` - Preview production build

### Code Quality
- `bun run format` - Format code with Biome
- `bun run lint` - Lint code with Biome
- `bun run fix` - Auto-fix issues with Biome

### Search Infrastructure
- `bun run postbuild` - Generates pagefind search index (runs automatically after build)
- `bun run copy:pagefind` - Copy pagefind assets to public directory

## Architecture Overview

This is an Astro-based personal website built with TypeScript, React components, and TailwindCSS. It uses a custom Astro integration called "Spectre" for theming and configuration.

### Key Technologies
- **Astro 5** - Static site generator with content collections
- **React 19** - For interactive components
- **TailwindCSS 4** - Styling with custom theme
- **Biome** - Formatting and linting
- **Pagefind** - Static search functionality
- **Giscus** - Comments system
- **Shadcn/ui** - UI component library adapted for this project

### Content Architecture
The site uses Astro Content Collections with these types:
- `posts` - Blog posts (MDX files in `src/content/posts/`)
- `projects` - Project showcases (MDX files in `src/content/projects/`)
- `other` - Miscellaneous pages like About (MDX files in `src/content/other/`)
- `tags` - Tag definitions (JSON in `src/content/tags.json`)
- `socials` - Social media links (JSON in `src/content/socials.json`)
- `workExperience` - Work history (JSON in `src/content/work.json`)
- `quickInfo` - Quick info items for home page (JSON in `src/content/info.json`)

### Custom Integration
The `/package` directory contains a custom Astro integration called "Spectre" that:
- Provides virtual modules for global configuration (`spectre:globals`)
- Configures OpenGraph metadata
- Sets up Giscus comments integration
- Manages theme configuration

### Component Structure
- **React Components** in `src/components/` - Interactive elements like SearchCommand, ButtonWrapper
- **Astro Components** in `src/components/` - Static elements like Navbar, Background, Card
- **UI Components** in `src/components/ui/` - Shadcn-based design system components
- **Layouts** in `src/layouts/` - Main layout with SEO, search highlighting, and structured data

### Styling Approach
- Uses TailwindCSS 4 with custom configuration
- Global styles in `src/styles/global.css` and `src/styles/reset.css`
- Giscus-specific styles in `src/styles/giscus.css`
- Custom color scheme and typography defined in the Spectre integration

### Search Functionality
- **Pagefind** provides static search across all content
- Search index built during `postbuild` step
- Interactive search component with command palette interface
- URL-based search result highlighting with navigation controls

### Environment Configuration
Giscus comments require environment variables:
- `GISCUS_REPO`, `GISCUS_REPO_ID`, `GISCUS_CATEGORY`, `GISCUS_CATEGORY_ID`
- `GISCUS_MAPPING`, `GISCUS_STRICT`, `GISCUS_REACTIONS_ENABLED`
- `GISCUS_EMIT_METADATA`, `GISCUS_LANG`

## Development Notes

- Site configured for static output with Node.js adapter in standalone mode
- Uses Bun as package manager and runtime
- Biome configuration includes strict rules for unused imports/variables and accessibility
- Custom code theme defined in `src/code-theme.ts` for syntax highlighting
- All content uses frontmatter with strict TypeScript schemas for type safety