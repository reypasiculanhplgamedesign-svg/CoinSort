# Coin Sort - Multi Grocery Playable

A Phaser 3 / Vite playable ad where the player deals and merges coins to buy grocery products from a conveyor shop.

## Gameplay

- The player follows a guided tray-stack sequence matching the supplied mockups.
- The hand highlights the exact matching coin number, then guides the player to drag that coin into the tray.
- After several matching coin drops, the player taps **Merge** and sees a merge animation with spark effects.
- The player then buys the matching product from the menu using the product's **Buy** button.
- After purchase, the item is checked, the tray/menu presentation rotates, and an incorrect product selection demonstrates the red shake/fade fail feedback.
- The playable then transitions to the Coin Sort end card.

## Iterations

The playable supports the assessment's three end modes:

- `10clicks`
- `60sec`
- `full`

Set the mode with `ITERATION_MODE`. The default in [src/config.js](src/config.js) is `full`.

## Asset Pipeline

Source assets remain in `public/assets/images`. Runtime assets are selected and optimized into `public/assets/coin-sort`, then base64 encoded into `media-coin-sort`.

```bash
npm run assets:prepare
npm run base64
```

The old `media/` folder is not used by Coin Sort. It may remain in the project because some Windows/OneDrive environments can deny deletion of generated files.

## Development

```bash
npm install
npm run dev
```

## Single HTML Build

Build the default network and iteration:

```bash
npm run build:inline
```

Build a specific network/iteration in PowerShell:

```powershell
$env:AD_NETWORK='applovin'; $env:ITERATION_MODE='10clicks'; npm run build:inline
```

Outputs are written to `dist-inline-<network>-<iteration>`.

## Multi-Network Build

```bash
npm run build:all
```

The interactive builder creates all three iterations for each selected network under `ad-builds/<iteration>/<network>/inline`.

## Notes

- `autoRedirectOnEnd` is enabled in [src/config.js](src/config.js) because the assessment asks for store redirection right before the end screen. The end card also redirects on any click.
- The prepared 3.3 MB WAV music loop and very large food PNGs are intentionally excluded from the runtime set to keep the final HTML under the 5 MB target.
- Replace the placeholder store URLs in [src/config.js](src/config.js) before submission.
