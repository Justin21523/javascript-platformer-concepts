# Repository Guidelines

## Project Structure & Module Organization
- `index.html` boots the canvas game; `styles.css` handles base styling.
- `src/main.js` wires the ECS world and registers systems. `ecs/` defines the world, components, and base system class. `systems/` hosts input, physics, collision, camera, render, parallax, and combat logic—add new runtime behavior as a system rather than inline loops.
- `core/` holds math/events helpers; `loaders/` manage tilemaps and actors; `render/` includes overlays and sprite drawing; `entities/` provides factories; `world/` contains infinite-world helpers.
- `assets/` stores Tiled JSON maps (`assets/levels`), sprites/backgrounds (`assets/sprites`, `assets/background`), and tileset definitions. Keep new content organized by type and map name. `docs/` holds supplementary guides; `scripts/` contains optional asset tooling (conda/webui) not required for running the game.

## Build, Test, and Development Commands
- `python -m http.server 8000` (run from repo root) — serve the game locally; open `http://localhost:8000` and load `index.html`.
- `npx http-server` — alternative static server if Node is available.
- `initial_setup.sh` — optional helper for repo bootstrap; review before running. No bundling step exists; reload after asset or map changes.

## Coding Style & Naming Conventions
- ES modules with `const`/`let`; 2-space indentation; keep semicolons as used throughout the codebase.
- File names use kebab-case (`camera-system.js`, `tilemap-loader.js`); classes in PascalCase; components and systems exported explicitly.
- Centralize tunables in `src/config.js` and diagnostics in `src/debug.js`; avoid magic numbers in systems by extending those configs.
- Keep systems single-responsibility and data-driven; prefer component flags and config constants over hard-coded branches.

## Testing Guidelines
- No automated suite yet; rely on manual smoke tests:
  - Serve locally, confirm player spawn, movement, jump, camera follow, and collision.
  - Toggle debug overlays (`F1` metrics, `F2` hitboxes, `F3` slow-mo, `F4` grid, backtick pause) when validating new behavior.
- When adding assets or levels, load them in-game to check sprite origins, animation timing, and collision alignment.

## Commit & Pull Request Guidelines
- Use conventional commits seen in history (`feat(tilemap): …`, `fix(collision): …`); scope by module or system name.
- PRs should include: brief behavior summary, affected assets/maps, manual test notes, and screenshots/GIFs for visual changes.
- Link issues or milestones when relevant; keep branches focused on one feature or fix per PR.
