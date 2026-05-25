# Agent Notes: Retro Corgi Run

## Project Snapshot

This is a small static HTML5 Canvas game called **Retro Corgi Run**. It uses vanilla ES modules, no build step, and a 960x540 internal canvas scaled responsively to a 16:9 viewport. The player controls a pixel-art corgi runner that jumps, double jumps, collects bones, picks up power-ups, and avoids or breaks obstacles.

Serve locally from the repository root with any static server. A reliable command is:

```powershell
node C:\tmp\codex-antigravity-static-server.js
```

or create an equivalent static server rooted at `K:\PythonCodes\Antigravity2` and open `http://127.0.0.1:8000/`.

## Architecture

- `index.html` defines the canvas, HUD, power-up indicators, start/pause/game-over overlays, portrait warning, and sound toggle.
- `index.css` owns all page layout and overlay styling. The game container is locked to 16:9 and centered in the viewport.
- `src/main.js` waits for `DOMContentLoaded`, finds `#game-canvas`, constructs `Game`, and exposes it as `window.game`.
- `src/game.js` is the coordinator. It owns state, timers, entity arrays, scoring, high score, input binding, collision handling, sound calls, and render order.
- `src/dog.js` owns player physics, jump/double-jump state, power-up timers, and programmatic corgi drawing.
- `src/background.js` draws scrolling parallax layers directly on canvas.
- `src/obstacle.js`, `src/collectible.js`, and `src/powerup.js` are simple entity classes with `update`, `draw`, `getBounds`, and `isOffScreen`.
- `src/particle.js` contains `Particle` and `ParticleSystem` for dust, sparkles, and debris bursts.
- `src/physics.js` exports AABB `checkCollision`.
- `src/sound.js` handles Web Audio sound effects and routes `assets/music/AP.mp3` through a `MediaElementAudioSourceNode` and music gain node.

## Runtime Flow

Game states are string values: `START`, `PLAYING`, `PAUSED`, and `GAMEOVER`.

`Game.start()` transitions from `START` to `PLAYING`, hides the overlay, initializes audio, starts background music, resets `lastTime`, and begins the animation loop. `pause()` and `resume()` pause/resume both the loop and music. `restart()` resets score, entities, dog, timers, particles, and music. `triggerGameOver()` stops music, plays the hit sound, emits debris, persists high score, updates final HUD values, and shows the game-over screen.

The animation loop caps `dt` at `0.1` seconds to avoid giant physics jumps after tab sleeps or pauses. When state is not `PLAYING`, it draws one final static frame and stops requesting frames.

Render order in `Game.draw()` is:

1. Background
2. Collectibles
3. Power-ups
4. Obstacles
5. Particles
6. Dog

## Gameplay Constants

Important current values live mostly in `src/game.js` and `src/dog.js`:

- Canvas internal size: `960 x 540`
- Ground Y: `460`
- Dog start x: `100`
- Dog size: `60 x 40`
- Gravity: `1500`
- Jump force: `-520`
- Base speed: `350 px/s`
- Speed scaling: `baseSpeed + floor(score / 100) * 15`, capped at `800`
- Speed power-up adds `250 px/s`
- Passive score: `10 points / second`
- Bone score: `+10`
- Shield duration: `8.0s`
- Speed duration: `6.0s`
- Speed magnet radius: `200 px`
- Speed magnet pull: `600 px/s`
- Obstacle spawn interval: `1.5s` to `2.8s`
- Collectible spawn interval: `1.0s` to `1.8s`
- Power-up spawn interval: `12s` to `18s`

Note: the older design docs sometimes mention different numbers, such as +100 bone score or a 250px/s base speed. Treat the current code as source of truth unless intentionally retuning.

## Input And UI

Keyboard:

- Jump/double jump while playing: `Space`, `ArrowUp`, `W`
- Pause/resume: `Escape`, `P`

Pointer/touch:

- `touchstart` on canvas jumps while playing.
- `pointerdown` jumps for non-touch pointers.
- Buttons start, resume, restart, and toggle mute.

`updateHUD()` pads score and high score to five digits, updates bone count, final score display, and power-up timers. High score uses local storage key `corgi_run_hiscore`.

The HTML currently contains mojibake-looking icon text for speaker, shield, speed, and phone/rotate symbols. If editing UI copy, inspect encoding carefully and prefer replacing those with clean Unicode or CSS/icon alternatives in one deliberate pass.

## Audio

`Sound.init()` is lazy and browser-safe:

- No-ops if `window` is missing.
- Creates `AudioContext` or `webkitAudioContext`.
- Resumes suspended contexts.
- Creates `new Audio('assets/music/AP.mp3')`, loops it, routes it through `musicGain`, and connects to destination.

Sound effects are generated via oscillators/noise buffers. `toggleMute()` only changes `musicGain` when it exists; effects return early when muted.

Be careful not to call `createMediaElementSource()` more than once for the same audio element. The current `!this.music` guard prevents that.

## Tests

Run all tests with:

```powershell
node --test
```

Current tests:

- `test/physics.test.js`: AABB collision behavior, including edge-touching as no collision.
- `test/sound.test.js`: browser audio mocks, music initialization, mute gain, music controls, and effect methods.
- `test/game_sound.test.js`: verifies game state handlers call music play/pause/stop APIs.

Current status from analysis: all 15 tests pass. Node prints a warning because `package.json` does not declare `"type": "module"` even though source and tests use ES module syntax. This is non-failing but worth cleaning up if future work touches package metadata.

## Development Notes

- The project has no npm scripts and only lists `puppeteer-core` as a dependency.
- There is no bundler. Browser imports are relative ES module paths from `index.html`.
- Keep entity modules simple and canvas-native. Existing style favors programmatic pixel/vector drawing over image sprites.
- Use AABB bounds from each entity's `getBounds()` for collision consistency.
- `Game` directly manages arrays by reverse iteration and `splice`; follow this pattern for removals unless a larger refactor is justified.
- Tests run in Node with mocked browser globals, so avoid top-level DOM access in modules. Constructor-time DOM access is acceptable when tests provide mocks.
- If adding browser-only APIs, guard with `typeof window`, `typeof document`, or inject/mimic them in tests.
- If adding new gameplay mechanics, update both `Game.update()` collision/spawn logic and HUD/screen behavior as needed.
- After frontend/gameplay changes, verify manually in a browser because most rendering and input behavior is not covered by automated tests.

## Known Gaps And Risks

- No automated canvas rendering tests or browser smoke tests are currently committed.
- No linting or formatting tooling is configured.
- The current local server was started externally for this session; it is not part of the repo.
- `package.json` lacks `"type": "module"` and test scripts.
- Design docs are useful history but contain stale implementation details.
- Some UI symbol text appears misencoded in `index.html` and `src/game.js`.
- Gameplay randomness is not seeded, so deterministic gameplay tests would need injection points for timers/randomness.
