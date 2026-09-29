# Lyrics Trainer - Claude Notes

This file contains information to help Claude Code assist effectively with this project.

## Project Overview

Lyrics Trainer is a Progressive Web App that displays song lyrics one line at a time. It allows uploading custom lyrics files, provides navigation controls, and remembers the last position.

## Key Directories and Files

- `/src/script.ts` - DOM wiring: rendering, events, persistence, theme
- `/src/lyrics-core.ts` - Pure, DOM-free logic (parsing, navigation, progress, state validation, WCAG contrast). Put new testable logic here
- `/scripts/serve.ts` - Bun static server for `/public`
- `/public/` - Compiled assets and static files
- `/lyrics/` - Lyrics text files (source files)
- `/public/lyrics/` - Lyrics files accessible to the web app
- `/tests/` - Test files for Vitest
- `/vitest.config.ts` - Vitest configuration

## Common Commands

To run these commands, use the Bash tool:

```bash
# Install dependencies (Bun only: never npm/npx)
bun install

# Build the project (tsc: src/*.ts -> public/*.js)
bun run build

# Watch for changes during development
bun run watch

# Build and serve the app locally (http://localhost:5173)
bun run serve

# Run tests (Vitest + jsdom). Use `bun run test`, NOT `bun test`
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with UI
bun run test:ui

# Generate test coverage
bun run test:coverage
```

## Testing

Tests are written using Vitest and located in the `/tests` directory. `tests/lyrics-core.test.ts` tests real code; `tests/app.dom.test.ts` boots `src/script.ts` against the real `public/index.html`. The tests use JSDOM for browser environment simulation and include mocks for:

- localStorage
- fetch
- DOM elements
- Event handling

When adding new features, always create corresponding tests.

## File Structure

Lyrics files are stored in the `/lyrics` directory with `.txt` format. When you edit or add lyrics files, remember to:

1. Add them to the `/lyrics` directory
2. Copy them to `/public/lyrics` for the app to access them
3. Update any references in the code if needed

## Key Features

- Loads lyrics from text files
- Remembers last used file and position
- Supports dark/light theme switching
- Mobile-friendly with swipe gestures
- Auto-advance with configurable delay

## Project Improvements

Refer to `suggested_improvements.md` for planned enhancements and completed tasks.

## When Modifying Code

- Run `bun run build` and `bun run test` after changes
- Keep colour tokens in `public/style.css`; `tests/contrast.test.ts` fails if a text pair drops below WCAG AA
- Animations must be skipped under `prefers-reduced-motion: reduce`
- If you add a file to `public/`, add it to `ASSETS` in `public/service-worker.js` and bump `CACHE`
- Update documentation when adding features
- Follow TypeScript conventions used in `script.ts`
- Ensure the app works in both desktop and mobile environments