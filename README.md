# CommandBase

A personal **cybersecurity knowledge base** — built with Electron, React, TypeScript, and SQLite.

Store, search, and run your commands, tools, workflows, resources, and notes in a fast, offline, HUD-style desktop app.

---

## Features

- **Commands** — multi-line syntax editor with `{{variable}}` template support, line numbers, descriptions, examples, and expected output
- **Template Runner** — fill variables, copy the result instantly, remembers last-used values
- **Workflows** — step-by-step playbooks with drag-and-drop reorder, per-step notes, run mode with tick-off and "copy all as .sh"
- **Tools & Categories** — organize everything
- **Resources** — bookmarks and notes for links, docs, writeups
- **Blog** — personal notes / writeups
- **Global Search** — Ctrl+K, searches all content including tags and step notes
- **Favorites, tags, use counts** — find your most-used commands fast
- **Export / Import** — JSON export and merge-import (no duplicates, no deletes)
- **Auto-backup** — SQLite db backed up on every start, last 5 kept

## Screenshots

<!-- TODO: add screenshots -->

## Install & Run

```bash
# Prerequisites: Node.js 20+
git clone https://github.com/SELMANI-Lyna/CommandBase
cd CommandBase
npm install
npm run dev
```

## Build

```bash
npm run build:linux   # Linux AppImage / deb
npm run build:win     # Windows NSIS installer
npm run build:mac     # macOS dmg (requires macOS host)
```

Installers are output to `dist/`.

## Data Location

Your database lives at:
- **Linux**: `~/.config/commandbase/commandbase.db`
- **Windows**: `%APPDATA%\commandbase\commandbase.db`
- **macOS**: `~/Library/Application Support/commandbase/commandbase.db`

Auto-backups: `commandbase.db.bak-<timestamp>` in the same folder (last 5 kept).

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+K | Global search |
| Ctrl+N | New command (from Commands view) |
| Ctrl+S | Save (inside command editor) |
| Esc | Close modal / cancel |
| Tab | Insert 2 spaces (syntax editor) |
| F1 / ? | Keyboard shortcuts |

## Tech Stack

- [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/)
- [React 19](https://react.dev/) + TypeScript
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Framer Motion](https://www.framer.com/motion/)
- [@dnd-kit](https://dndkit.com/)
- [Lucide React](https://lucide.dev/)

## License

MIT — see [LICENSE](LICENSE)
