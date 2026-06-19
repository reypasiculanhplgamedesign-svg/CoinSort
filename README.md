# Coin Sort - Multi Grocery Playable

Coin Sort - Multi Grocery is a Phaser 3 and Vite playable ad game built around sorting coin stacks, completing 10-coin tray sets, merging those sets into higher-value coins, and purchasing grocery product cards around the board.

The project keeps the existing playable ad wrapper, responsive canvas behavior, network bridge, CTA flow, and single-file build pipeline while replacing the original template gameplay with the Coin Sort puzzle loop.

## Gameplay Overview

The player manages a 4x5 board of coin trays. Each tray can hold up to 10 coins, stacked vertically from the top of the tray downward.

Core loop:

- Deal new coins into available trays.
- Sort visible top coin stacks between trays.
- Build trays containing 10 identical coins.
- Merge completed trays to consume the 10 matching coins.
- Generate 3 coins of the next level after each merge.
- Unlock and purchase product cards whose required value matches completed merge levels.
- Continue until the playable reaches its configured end condition.

## Core Features

- **Coin tray board**
  - 20 trays arranged in a central grid.
  - Each tray has a strict capacity of 10 coins.
  - Completed trays with 10 identical coins show a green ready border.

- **Deal button**
  - Adds randomized coin levels into available trays.
  - Does not reset existing board state.
  - Disables only when every tray is full.

- **Drag-and-drop sorting**
  - The player can drag the front/top matching coin stack from one tray to another.
  - A stack may be dropped only onto an empty tray or onto a tray whose top coin matches the dragged level.

- **Tap-to-transfer sorting**
  - The player can tap a top coin stack to select it.
  - Tapping a valid destination tray transfers the selected stack.
  - Transfers use a smooth coin-flip travel animation.

- **Merge system**
  - A tray with 10 identical coins can be merged.
  - Merging consumes the 10 matching coins.
  - The tray receives exactly 3 coins of the next level.
  - Example: 10 Level 3 coins become 3 Level 4 coins.

- **Product purchase loop**
  - Product cards require specific coin levels.
  - Merging the matching level unlocks matching products.
  - Purchased products receive a checkmark and remain marked.
  - Cards move around the perimeter track while preserving purchase order.

- **EndScene**
  - Displays the Coin Sort logo, procedural spinning sunrays, and CTA button.
  - `audioFinishedMP3` is triggered when the EndScene is presented.

## Build Mode Configuration

The playable supports three deployment variations controlled by one global flag:

```text
BUILD_MODE = "10_CLICKS" | "60_SECONDS" | "FULL"
```

The flag is read in [src/config.js](src/config.js) and injected by the Vite configs.

### 10 Clicks Mode

```powershell
$env:BUILD_MODE='10_CLICKS'; npm run build:inline; Remove-Item Env:BUILD_MODE
```

Behavior:

- Counts valid player interactions.
- Ends immediately when the 10th valid interaction is reached.
- Valid interactions include accepted button presses, valid coin selections, valid drag transfers, valid tap transfers, valid merges, and product interactions.

Output:

```text
dist-inline-applovin-10_CLICKS/
```

### 60 Seconds Mode

```powershell
$env:BUILD_MODE='60_SECONDS'; npm run build:inline; Remove-Item Env:BUILD_MODE
```

Behavior:

- Starts a 60-second gameplay timer when the Game scene begins.
- Forces a transition to the EndScene when the timer expires.

Output:

```text
dist-inline-applovin-60_SECONDS/
```

### Full Gameplay Mode

```powershell
$env:BUILD_MODE='FULL'; npm run build:inline; Remove-Item Env:BUILD_MODE
```

Behavior:

- No click limit.
- No time limit.
- The player progresses naturally until an organic win or fail condition triggers the EndScene.

Output:

```text
dist-inline-applovin-FULL/
```

If no `BUILD_MODE` is provided, the project defaults to `FULL`.

## Development Setup

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Build the default inline playable:

```bash
npm run build:inline
```

The inline build produces a single-file playable HTML output for the selected network and build mode.

## Useful Scripts

```bash
npm run assets:prepare
npm run base64
npm run build:inline
npm run build:all
```

- `assets:prepare` prepares optimized Coin Sort assets.
- `base64` encodes prepared assets into importable media modules.
- `build:inline` creates the single-file playable build.
- `build:all` runs the multi-network build workflow.

## Project Structure

```text
src/
  config.js              Global network/build-mode configuration
  main.js                Phaser bootstrap and responsive canvas setup
  networkPlugin.js       Playable ad network bridge and CTA integration
  scenes/
    Preloader.js         Loads required images/audio
    Game.js              Coin Sort gameplay scene
    EndScene.js          End card and CTA scene
  game/
    AudioController.js   Audio unlock/playback/lifecycle helper

media-coin-sort/         Base64 encoded runtime assets
public/assets/           Source asset folders
vite/                    Build configs
```

## Notes

- The project targets playable ad deployment and keeps the output under the 5 MB target.
- MRAID-capable networks receive the required `mraid.js` injection through the build config.
- CTA behavior is handled through `networkPlugin.js` and should not be called directly from gameplay modules.
- Store URLs should be reviewed in [src/config.js](src/config.js) before final submission.
