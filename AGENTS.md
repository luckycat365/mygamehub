# AGENTS.md

## Project

This repository is a static browser game hub rooted at `K:\PythonCodes\Antigravity2`.

- Landing page: `index.html`
- Shared styles: `index.css`
- Landing page music bootstrap: `src/landing.js`
- Game page: `games/corgi-run/index.html`
- Game bootstrap: `src/main.js`
- Main gameplay coordinator: `src/game.js`

Serve the repo as a static site from the repository root. A working local URL in this environment is:

`http://127.0.0.1:4173/`

## Current Product Shape

- `/` is the game hub landing page.
- `/games/corgi-run/` is the playable Corgi Run game.
- The landing page uses:
  - `assets/images/Landing page background.png`
  - `assets/images/corgi-run-card.png`
  - `assets/music/AI for Beauty.mp3`
- The in-game music uses:
  - `assets/music/AP.mp3`

## Implementation Notes

- This project uses plain HTML, CSS, and ES modules. There is no bundler.
- Keep browser imports relative and static-site friendly.
- `src/main.js` should only initialize the game when `#game-canvas` exists.
- `src/landing.js` should only handle landing-page behavior.
- The landing-page game card must remain clickable only on the visible card itself.
- The landing page must scale cleanly for phones as well as desktop.

## Audio Notes

- Browsers may block first-load autoplay for audible media.
- Landing-page music should retry on user interaction and page visibility changes.
- Do not route landing-page music through the game sound system unless there is a clear reason.

## Testing

Run the existing automated tests with:

```powershell
node --test test\*.js
```

Current tests cover:

- collision logic
- game sound lifecycle calls
- sound module behavior

Manual browser checks are still required for:

- landing-page layout
- landing-page music behavior
- responsive card sizing
- game startup and in-browser audio

## Editing Guidance

- Prefer small, local changes over broad rewrites.
- Keep asset references stable and URL-safe.
- When changing the landing page, verify both desktop and phone-sized layouts.
- When changing audio behavior, account for autoplay restrictions.
