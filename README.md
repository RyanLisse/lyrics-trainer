# Lyrics Trainer

An offline-capable Progressive Web App that steps you through song lyrics (or poems) one line at a time, so you can memorise them. It ships with two public-domain texts (Shakespeare's Sonnet 18 and "Casey at the Bat") and lets you upload your own `.txt` files. You get manual and automatic navigation, keyboard and swipe support, persistent state, and a mobile-friendly layout.

## Credit and origin

This is a derived version of **Ken Kousen's** `lyrics-trainer` exercise from his Claude Code training course:
<https://github.com/kousen/claude-code-training/tree/main/exercises/javascript/lyrics-trainer>

The original is MIT-licensed, © Kenneth Kousen. It's a great teaching project, and all the core ideas (one line at a time, playlist, upload, PWA) are his. This version keeps the same app and adds the changes listed below. Any bugs I introduced are mine.

### What changed in this version

- **Bun tooling.** `bun install` / `bun run …` replaces npm. `package-lock.json` became `bun.lock`, and the `serve` package was replaced by a 20-line `Bun.serve` script (`scripts/serve.ts`). Tests still run on Vitest + jsdom.
- **Progress bar.** A `role="progressbar"` bar shows how far through the song you are.
- **Smooth line transitions.** Each new line slides in from the direction you moved. The animation is skipped when the OS asks for reduced motion (`prefers-reduced-motion`).
- **Accessibility.**
  - A hidden live region announces "Line 3 of 14: …" to screen readers on every line change.
  - Labels describe the action a control will take ("Restart from the first line", "Pause auto-advance", "Switch to dark theme").
  - The seek slider has an `aria-valuetext`.
  - Every control gets a visible `:focus-visible` ring, and pinch-zoom is no longer disabled.
- **WCAG AA contrast.** Every text colour pair passes 4.5:1 in both themes, enforced by a test. Dark-mode buttons were 3.07:1 and error text 3.35:1 before.
- **Offline mode actually works.** The original service worker precached a non-existent `lyrics.json`, so installation failed. It now caches the real app shell and bundled lyrics, and drops old cache versions.
- **Small fixes.**
  - Arrow keys on a focused slider no longer move two lines.
  - Home/End no longer scroll the page.
  - Corrupt saved state is repaired instead of trusted.
  - The default-lyrics label now says "Sonnet 18" instead of the old "This is the Moment".
  - `\r\n` files parse cleanly.
- **Tests against real code.** Pure logic moved to `src/lyrics-core.ts` and is tested directly. A jsdom test boots the real app against the real `index.html`. The suite has 104 tests and no skips.

## Features

- **Display lyrics one line at a time** with animated transitions and a progress bar
- **Upload custom lyrics** from text files (.txt format)
- **Playlist** of bundled lyrics files
- **Manual navigation** (Next, Previous, Seek slider, Keyboard shortcuts)
- **Mobile-friendly** with swipe gestures and responsive design
- **Theme support** with manual dark/light toggle and system preference detection
- **Auto-advance** with configurable delay (0.5-10 seconds)
- **Persistent state** via `localStorage` (remembers position, settings, and custom lyrics)
- **Offline support** via service worker (full PWA capabilities)
- **Accessible**: screen-reader announcements, focus rings, WCAG AA contrast, reduced-motion support

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.1 or newer

### Installation

```bash
bun install
```

### Build

Compile the TypeScript sources (`src/`) to the `public/` directory:

```bash
bun run build
```

### Development

Rebuild on changes:

```bash
bun run watch
```

### Serve

Build, then serve `public/` on http://localhost:5173:

```bash
bun run serve
```

To use a different port, run `bun scripts/serve.ts 8080` (after a build).

### Testing

Run the test suite (Vitest + jsdom):

```bash
bun run test
```

Use `bun run test`, not `bun test`. The bare command starts Bun's own test runner, which has no DOM, so `bunfig.toml` stops it with a pointer to the right command.

Other test commands:

```bash
bun run test:watch      # rerun on changes
bun run test:ui         # Vitest UI dashboard
bun run test:coverage   # coverage report (istanbul)
```

See [TESTING.md](TESTING.md) for more details on the testing approach.

### Mobile Access

To access on mobile devices on the same network:
1. Run `bun run serve` (it listens on all interfaces)
2. Find your computer's IP address
3. Navigate to `http://[YOUR-IP]:5173` on your mobile device

## Usage

### Desktop
- **Navigate**: Use Previous/Next buttons, arrow keys, or the seek slider
- **Play/Pause**: Press spacebar or click the Play button
- **Theme**: Click the moon/sun icon to toggle dark/light mode
- **Keyboard shortcuts** (ignored while a slider has focus):
  - `←` Previous line
  - `→` Next line
  - `Space` Play/Pause
  - `Home` First line
  - `End` Last line

### Mobile
- **Swipe gestures**: Swipe left/right on the lyrics to navigate
- **Touch-friendly**: All buttons are optimized for touch
- **Theme**: Tap the moon/sun icon to switch themes

### Custom Lyrics
- **Upload**: Click "Upload Lyrics (.txt)" and select a text file
- **Format**: One line per row in the text file (blank lines are skipped)
- **Lyrics Folder**: Bundled lyrics live in `lyrics/` and are served from `public/lyrics/` (listed in `public/lyrics-list.json`)
- **Reset**: Click "Reset to Default" to return to the original lyrics
- **Persistence**: Last used lyrics file is remembered between sessions

## Project Structure

```
.
├── lyrics/                     # Lyrics text files (source copies)
├── public/                     # Static site root
│   ├── index.html
│   ├── style.css               # Colour tokens, transitions, progress bar
│   ├── playlist-styles.css
│   ├── playlist-api.js         # Reads lyrics-list.json
│   ├── playlist-component.js   # Playlist UI
│   ├── lyrics-list.json
│   ├── lyrics/                 # Served lyrics files
│   ├── manifest.json
│   ├── service-worker.js
│   ├── icon-192.png / icon-512.png
│   ├── script.js               # (generated by `bun run build`)
│   └── lyrics-core.js          # (generated by `bun run build`)
├── src/
│   ├── lyrics-core.ts          # Pure logic: parsing, navigation, progress, state, contrast
│   └── script.ts               # DOM wiring, rendering, events, persistence
├── scripts/
│   ├── serve.ts                # Bun static server for public/
│   └── bun-test-guard.ts       # Redirects `bun test` to `bun run test`
├── tests/                      # Vitest suites (see TESTING.md)
├── bunfig.toml
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

## PWA / Offline Support

The app is a full Progressive Web App with:
- A service worker that precaches the app shell and bundled lyrics
- Network-first loading for lyrics (with cache fallback when offline)
- App manifest and icons for installation

## Suggested Improvements

See [suggested_improvements.md](suggested_improvements.md) for what has been done and what's still open (lyrics search, bookmarks, text-size controls, .lrc support, and more).

## Deployment

This app can be deployed to any static hosting service. Run `bun run build` first, then publish the `public/` directory (GitHub Pages, Netlify, Vercel, or any web server). It needs no backend.

## License

MIT. See [LICENSE](LICENSE).
Original work © 2025 Kenneth Kousen; modifications © 2026 Ryan Lisse.
