# City entry input — 2026-10-10

The user reported that MacBook trackpad pinch enlarged the webpage instead of entering the city and requested gradual rightward dragging. The entrance now supports:

- Hold and drag right to advance; left to reverse. About two viewport lengths cover the full decoded journey. Drag again after releasing if more distance is needed.
- Mouse wheel and two-finger trackpad scrolling on either dominant axis. Diagonal deltas are not added together. Ctrl/Meta-modified wheel remains browser zoom.
- Single-finger mobile horizontal dragging and vertical swiping. CSS `touch-action: pinch-zoom` reserves two-finger pinch for the browser; a second pointer cancels the partial camera drag.
- A six-pixel threshold, axis locking, pointer capture, grab/grabbing cursors and explicit release before automatic office entry. Controls do not begin drags; dragging across a menu does not click it.
- Existing Page Up/Down, arrow keys, Enter, direct entry, left menus, decoded-image gates and reduced-motion behavior remain available.

Source changes are limited to `NewYorkLanding.tsx`, `cityEntryModel.ts`, `new-york-landing.css` and the corresponding input tests. The same four files were synchronized to the original local application only after verifying its prior contents matched the published source before this edit. Artwork, BGM, academy lesson answers and authenticated ledger behavior were not changed. The v13 rollback directory, ZIP and tag are retained.

## Verification

- Online `npm test`: exit 0, 36/36.
- Online `npm run build`: exit 0, TypeScript and Vite.
- Original `node --test --test-concurrency=1 tests/city-entry.test.ts tests/city-flight-readiness.test.ts tests/game-curriculum.test.ts tests/game-trainingPreview.test.ts`: exit 0, 35/35.
- Original `npm run build`: exit 0, TypeScript and Vite.
- Headless installed Chrome, desktop 1440×900 and mobile touch emulation 390×844: 9/9 interaction checks, no page/console errors. The checks cover tiny click jitter, reversible drag, both wheel axes and preserved modified-wheel default behavior, menu interactions, all scene transitions and held-pointer office arrival, mobile horizontal/vertical touch, cancellation on a second finger, reduced motion/direct entry, and delayed image decoding without queued jumps.
- Local captures and browser JSON are in ignored `work/entry-input-browser/`; a safe JSON copy is retained at `docs/entry-input-browser.json`. The reproducible browser script is in ignored `work/check-entry-input.mjs`.

Native MacBook hardware, Safari, actual OS trackpad gestures and iPhone Safari are **NOT_TESTED**. Automated touch tests used Chromium/CDP and are not native Apple-device verification. No Canton/Ganache execution was performed for this input-only change, and the public educational frontend remains REFERENCE_ONLY.
