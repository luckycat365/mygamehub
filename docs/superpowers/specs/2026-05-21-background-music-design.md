# Background Music Integration Design Spec

This document details the design for integrating `assets/music/AP.mp3` as the looping background music for the 2D Corgi Run game.

## Goal Description
Provide an engaging and immersive audio experience by playing the background music track `assets/music/AP.mp3` during gameplay, while respecting the game's active state (play, pause, game over, restart) and mute settings.

## System Architecture

We will route a standard HTML5 `<audio>` element through our existing Web Audio API context using a `MediaElementAudioSourceNode`. This gives us the best of both worlds: low memory usage/progressive streaming, combined with Web Audio volume controls and clean volume nodes.

```
+------------------------------------+
|  HTML5 Audio Element (AP.mp3)      |
+-----------------+------------------+
                  |
                  v  (MediaElementAudioSourceNode)
+-----------------+------------------+
|  Music Gain Node (musicGain)       |
+-----------------+------------------+
                  |
                  v
+-----------------+------------------+
|  Audio Context Destination         |
+------------------------------------+
```

## Proposed Changes

### Sound Management (`src/sound.js`)

Modify `Sound` class to:
1. Initialize the HTML5 `Audio` element with `assets/music/AP.mp3`.
2. Set it to loop.
3. Wrap it in a `MediaElementAudioSourceNode`.
4. Connect it to a dedicated `GainNode` (`musicGain`) and then to the destination context.
5. Provide methods:
   - `playMusic()`: Triggers play on the audio element (ensuring AudioContext is initialized/resumed).
   - `pauseMusic()`: Pauses the audio element.
   - `stopMusic()`: Pauses the audio element and resets `currentTime` to `0`.
   - `toggleMute()`: Adjusts the gain of `musicGain` to `0` when muted, or back to the default background level (e.g., `0.3`) when unmuted.

### Game State Loop (`src/game.js`)

Modify `Game` class to:
1. Call `this.sound.playMusic()` when starting the game (`start()`).
2. Call `this.sound.pauseMusic()` when pausing the game (`pause()`).
3. Call `this.sound.playMusic()` when resuming the game (`resume()`).
4. Call `this.sound.stopMusic()` followed by `this.sound.playMusic()` when restarting (`restart()`).
5. Call `this.sound.stopMusic()` when the game is over (`triggerGameOver()`).

## Verification Plan

### Automated Tests
- Run existing unit tests (if any) to ensure no regressions in sound creation or game states.

### Manual Verification
- Launch the local dev server using `npm run dev` or `npx serve`.
- Verify background music starts when clicking "Start Run".
- Verify background music pauses when pressing ESC (game pause) and resumes when unpausing.
- Verify background music stops when dog collides with an obstacle (game over).
- Verify background music stops and restarts from the beginning when clicking "Restart Run".
- Verify clicking the Sound button (🔊/🔇) immediately mutes/unmutes the background music.
