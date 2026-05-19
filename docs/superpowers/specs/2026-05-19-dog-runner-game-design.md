# 2D Dog Runner Game Design Specification

This document details the architectural design and gameplay specification for a 2D side-scrolling runner game featuring a cute dog. The game is built using a pure HTML5 Canvas and Vanilla JavaScript in a modular ES6 structure.

## Overview

The player controls a running dog (a retro pixel-art styled Corgi) moving from left to right. The player must jump over ground obstacles, collect floating bones, and obtain power-ups to achieve the highest score. The game speed increases progressively as the player travels further.

### Core Decisions
- **Rendering Engine:** HTML5 Canvas (2D Context). High performance, lightweight, responsive.
- **Assets Strategy:** Programmatic canvas drawings (pure code-defined vectors/pixels). Zero image loading lag, zero asset load failure, completely responsive.
- **Code Architecture:** Modular ES6 Javascript modules.
- **Audio Strategy:** Synthesized retro 8-bit sound effects using the browser's **Web Audio API** (synth beeps, jump blips, coin collection sounds). Zero audio file assets to load.

---

## 1. Gameplay & Mechanics

### Controls
- **Jump / Double Jump:** Pressing `Spacebar`, clicking the mouse, or tapping the screen triggers a jump. If pressed again in mid-air, a **Double Jump** is triggered.
- **Pause:** Pressing `Escape` or `P` toggles the paused state.

### Score & Progress
- **Distance Score:** The score increments continuously as time passes.
- **Collectibles (Bones):** Collecting a bone adds +100 points to the current score and increments the bone count.
- **Speed Increase:** The scroll speed starts at 250px/sec and increases by 10px/sec every 10 seconds, up to a maximum speed of 600px/sec.

### Power-ups
Power-ups appear occasionally along the path:
1. **Shield (Blue Orb):** Grants a temporary shield. If the dog hits an obstacle while shielded, the shield is consumed, destroying the obstacle, and the dog survives. Lasts for 10 seconds if not consumed.
2. **Speed Boost (Golden Bone):** Doubles scroll speed, makes the dog invincible, and automatically attracts nearby bones (magnet effect) for 5 seconds.

### Obstacles
- **Wooden Fences / Rocks:** Ground obstacles of varying heights and widths.
- Spawning interval is randomized within a range that adapts to the current game speed to ensure jumpability.

### Particle Effects
- **Paw Dust:** Spawns tiny brown particles at the dog's rear paws while running on the ground.
- **Bone Sparkles:** Spawns gold stars when a bone is collected.
- **Power-up Flash:** Spawns a ring of blue/gold particles when a power-up is picked up.
- **Crash Explosion:** Spawns a burst of wooden debris and dust particles when the dog crashes or breaks an obstacle.

---

## 2. Technical Stack

- **HTML5:** Structures the canvas element, HUD wrapper, and overlay modals.
- **Vanilla CSS:** Custom fonts, glassmorphism UI, buttons, and animations.
- **Vanilla JavaScript (ES6):** Game state, physics, rendering, sound synthesis.

---

## 3. Architecture & File Structure

```
/
├── index.html                  # Game container, UI, and style link
├── index.css                   # Premium CSS styles, overlays, typography
└── src/
    ├── main.js                 # Entry point, event listeners, main loop
    ├── game.js                 # Core Game class, state coordinator
    ├── dog.js                  # Dog player physics and programmatic drawing
    ├── background.js           # Parallax scrolling layers
    ├── obstacle.js             # Obstacle spawning and scrolling
    ├── collectible.js          # Bone spawning and collection logic
    ├── powerup.js              # Shield/Speed boost items
    ├── particle.js             # High-performance particle burst systems
    └── sound.js                # Programmatic Web Audio API synthesiser
```

### Component Details

#### [main.js](file:///k:/PythonCodes/Antigravity2/src/main.js)
Initializes the `Game` instance when the DOM is loaded. Handles global events (resize, keyboard, focus lost/pause).

#### [game.js](file:///k:/PythonCodes/Antigravity2/src/game.js)
Coordinates the game loop using `requestAnimationFrame`. Manages:
- Game states: `START`, `PLAYING`, `PAUSED`, `GAMEOVER`.
- Spawn loops for obstacles, bones, and power-ups.
- Collision detection (AABB bounding boxes).
- Score accumulation and `localStorage` high score saving.
- Canvas resizing and high-DPI scaling (crisp retro rendering).

#### [dog.js](file:///k:/PythonCodes/Antigravity2/src/dog.js)
Handles the player's entity:
- Physics: velocity, gravity, jump force, ground boundary.
- Double-jump available flag.
- Drawing: draws a custom retro Corgi. Running animation alternates leg angles based on game time. Jump pose tucks legs. Tail wags while running.
- Draws active shield indicator (glowing cyan circle wrapping the dog) and invincibility/speed trails.

#### [background.js](file:///k:/PythonCodes/Antigravity2/src/background.js)
Manages layers scrolling at different speeds relative to the game speed:
- **Layer 1 (Sky):** Pure sky blue gradient with scrolling clouds.
- **Layer 2 (Distant Hills):** Light green hill shapes.
- **Layer 3 (Trees):** Forest green pine silhouettes.
- **Layer 4 (Near Fences/Bushes):** Green bushes/hedges.
- **Layer 5 (Ground):** Dirt trail with grass border.

#### [sound.js](file:///k:/PythonCodes/Antigravity2/src/sound.js)
Creates retro sounds using `AudioContext`:
- `playJump()`: Frequency sweep upwards (e.g. triangle wave 150Hz to 600Hz in 0.15s).
- `playCollect()`: Short high-pitch arpeggio (e.g. sine wave 800Hz to 1200Hz in 0.1s).
- `playPowerUp()`: Synthesized laser charge.
- `playHit()`: Low noise crash sound (using AudioBuffer with random noise buffer and exponential gain decay).
- Mute/Unmute toggle.

---

## 4. Visual Layout (HTML/CSS UI)

- **Canvas Size:** Fixed internal aspect ratio (16:9, e.g. 800x450), CSS scaled to fit screen responsively.
- **Glassmorphism Overlays:** Start, Game Over, and Pause screens feature frosted glass background, glowing neon drop shadows, and big retro-arcade typography.
- **Sound Toggle Button:** Floating speaker icon in top-right.

---

## 5. Verification Plan

### Automated / Browser Testing
- Open the local dev server using Chrome or Edge.
- Verify game loop runs at consistent 60fps.
- Verify scaling handles screen resizing without stretching or blurriness.
- Verify high score persists in local storage after a page refresh.

### Manual Gameplay Checklist
1. **Jump Mechanic:** Confirm spacebar and tap/click jump. Confirm double jump operates in mid-air.
2. **Obstacle Collision:** Hit an obstacle. Verify the game switches to GAMEOVER, plays the hit sound, and saves score if it's a new high score.
3. **Bone Collection:** Jump through floating bones. Confirm score increments by 100, bone counter increases, and sparkle particles appear.
4. **Shield Power-up:** Pick up a Shield item. Verify shield visual appears around dog. Hit an obstacle. Confirm obstacle breaks with debris particles, shield disappears, and dog continues running without dying.
5. **Speed Power-up:** Pick up Speed item. Verify game speed doubles, dog leaves trails, and bones are magnetically attracted.
