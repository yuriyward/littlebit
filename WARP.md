# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is `littlebit.dev`, a personal website/portfolio for Yuriy Babyak (AI Engineer). It's built using **Astro 5** with TypeScript, React components, and a custom Astro integration called "Spectre" for theming and configuration.

## Essential Commands

### Development
```bash
# Start development server with Bun
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Generate search index after build
bun run postbuild
```

### Code Quality
```bash
# Format code
bun run format

# Lint code
bun run lint

# Check and fix all issues
bun run fix
```

## Architecture Overview

### Core Structure
- **Astro 5** framework with TypeScript
- **Custom Spectre Integration** (`/package/`) - provides theming and configuration via virtual modules
- **Content Collections** - structured content management for posts, projects, work experience
- **React Components** - UI components with Radix UI primitives and Tailwind CSS
- **Bun** runtime for package management and development

### Key Directories
- `src/pages/` - Astro pages (index, blog, projects, 404)
- `src/components/` - Astro and React components
- `src/content/` - Content collections (posts, projects, work, etc.)
- `src/layouts/` - Layout components
- `package/` - Custom Spectre Astro integration
- `src/styles/` - CSS files including Tailwind and custom styles

### Content Management
The site uses Astro's Content Collections API v5 with loaders:
- **Posts** (`src/content/posts/`) - Blog posts in MDX format
- **Projects** (`src/content/projects/`) - Portfolio projects in MDX format
- **Work Experience** (`src/content/work.json`) - Job history
- **Socials** (`src/content/socials.json`) - Social media links
- **Tags** (`src/content/tags.json`) - Content tags
- **Info** (`src/content/info.json`) - Quick personal info

### Spectre Integration
The custom integration (`/package/`) uses virtual modules to provide configuration throughout the app:
- Exposes site configuration via `spectre:globals` module
- Handles OpenGraph meta tags, Giscus comments, theme colors
- Built with Zod schemas for type-safe configuration
- Uses Vite virtual module plugin system

### Styling System
- **Tailwind CSS 4** with custom configuration
- **Radix UI** components for accessible UI primitives
- **Biome** for code formatting and linting (space indentation, 120 char line width)
- **Shadcn/ui** component system with New York style

### Search & Comments
- **Pagefind** for client-side search (runs after build)
- **Giscus** for GitHub-based comments (configurable via environment)

## Development Workflow

### Adding Content
1. **Blog Posts**: Create `.mdx` files in `src/content/posts/` with proper frontmatter schema
2. **Projects**: Create `.mdx` files in `src/content/projects/` with project details
3. **Work Experience**: Update `src/content/work.json`

### Component Development
- Use existing Astro/React component patterns in `src/components/`
- Follow Radix UI + Tailwind CSS approach for new UI components
- Components can import from `spectre:globals` for site configuration

### Environment Setup
Copy `.env.example` to `.env` and configure Giscus environment variables for comments functionality.

### Code Style
- **Biome** with latest schema (2.2.0) for formatting and linting
- 2-space indentation (configured in `biome.json`)
- 120 character line width
- Strict linting rules with accessibility checks
- React and TypeScript-specific rules enabled

## Integration Points

### Spectre Integration Configuration
The integration is configured in `astro.config.ts` with:
- Site name and OpenGraph metadata
- Giscus comments configuration
- Theme color settings

### Build Process
1. Astro builds static site to `dist/client/`
2. Pagefind generates search index for the built site
3. Production build supports Node.js adapter in standalone mode
