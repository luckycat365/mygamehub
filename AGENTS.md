# AGENTS.md

## Project

This repository is a static browser game hub rooted at `K:\PythonCodes\Antigravity2`.

- Landing page: `index.html`
- Shared styles: `index.css`
- Landing page behavior bootstrap: `src/landing.js`
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
  - `assets/images/princess-magic-card.png`
- The in-game music uses:
  - `assets/music/AP.mp3`

## Princess Star Adventure Assets

All visual assets for Princess Star Adventure now live under:

`assets/images/PrincessStarAdventure/`

Use that folder as the source of truth for future Princess Star Adventure development. Do not mix new Princess Star Adventure sprites into the older top-level `assets/images/princess`, `assets/images/platforms`, `assets/images/projectiles`, `assets/images/backgrounds`, or `assets/images/enemies` locations.

Current structure:

- `assets/images/PrincessStarAdventure/backgrounds/`
  - Main scene backdrop: `fantasy-sky-background.png`
- `assets/images/PrincessStarAdventure/princess/`
  - Frame directories for gameplay animation:
    - `standing/01.png` through `standing/06.png`
    - `running/01.png` through `running/06.png`
    - `jumping/01.png` through `jumping/06.png`
    - `attacking/01.png` through `attacking/06.png`
  - Sprite sheets and previews for re-export or debugging:
    - `princess-sprite-sheet.png`
    - `princess-sprite-sheet-raw.png`
    - `princess-standing.png`
    - `princess-running.png`
    - `princess-jumping.png`
    - `princess-attacking.png`
    - `princess-sprite-preview.png`
  - Animation metadata:
    - `princess-sprites.json`
- `assets/images/PrincessStarAdventure/projectiles/star/`
  - Projectile sprite: `star-projectile.png`
- `assets/images/PrincessStarAdventure/enemies/teacup-sentry/`
  - Frame directories:
    - `walking/01.png` through `walking/06.png`
    - `hit/01.png`
    - `destroyed/01.png`
  - Combined sheets, sources, and previews:
    - `teacup-sentry-walking.png`
    - `teacup-sentry-walking-source.png`
    - `teacup-sentry-walking-raw.png`
    - `teacup-sentry-preview.png`
  - Enemy metadata:
    - `teacup-sentry.json`
- `assets/images/PrincessStarAdventure/platforms/fantasy/`
  - Individual platform pieces:
    - `grass-short.png`
    - `grass-round.png`
    - `grass-long.png`
    - `flower-bridge.png`
    - `cloud.png`
    - `crystal.png`
  - Sheet/source/reference files:
    - `fantasy-platforms-sheet.png`
    - `fantasy-platforms-source.png`
    - `fantasy-platforms-raw.png`
    - `fantasy-platforms-preview.png`
  - Platform metadata:
    - `fantasy-platforms.json`

How to use these assets in future development:

- For playable character animation, prefer the per-frame directories under `PrincessStarAdventure/princess/` rather than slicing the raw sheet again unless the animation set changes.
- For new character states, keep the same `256x256` transparent PNG frame format already used by the princess and teacup sentry assets.
- Treat `*-raw.png`, `*-source.png`, and `*-preview.png` files as authoring/reference assets. Treat the frame directories and JSON manifests as runtime-facing assets.
- For enemy integration, read the JSON manifest first and keep new animation names aligned with the existing directory naming pattern.
- For platform spawning or terrain assembly, use the individual PNGs in `platforms/fantasy/`; use the sheet/source files only when rebuilding or exporting the set.
- For projectile work, extend `projectiles/star/star-projectile.png` in place unless the game adds more projectile types.
- When updating the landing page card art for Princess Star Adventure, use `assets/images/princess-magic-card.png`. The gameplay assets themselves should continue to come from `assets/images/PrincessStarAdventure/`.

## Implementation Notes

- This project uses plain HTML, CSS, and ES modules. There is no bundler.
- Keep browser imports relative and static-site friendly.
- `src/main.js` should only initialize the game when `#game-canvas` exists.
- `src/landing.js` should only handle landing-page behavior.
- The landing-page game card must remain clickable only on the visible card itself.
- The landing page must scale cleanly for phones as well as desktop.

## Audio Notes

- Browsers may block first-load autoplay for audible media.
- Do not route landing-page behavior through the game sound system unless there is a clear reason.

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
- responsive card sizing
- game startup and in-browser audio

## Editing Guidance

- Prefer small, local changes over broad rewrites.
- Keep asset references stable and URL-safe.
- When changing the landing page, verify both desktop and phone-sized layouts.
- When changing audio behavior, account for autoplay restrictions.
