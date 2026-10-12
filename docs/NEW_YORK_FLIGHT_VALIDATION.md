# New York entrance flight — final validation

Resumed and checked 2026-10-06 KST. The original artwork and initial implementation were prepared on 2026-10-04. This record concerns the entrance UI, not new Canton/EVM ledger evidence.

## Implemented behavior

The same camera position drives panorama → waterfront street → building threshold → office, with reversible input. Near water/façade planes move outward at different speeds, and bronze glass leaves pass the viewport before office arrival. Feathered destination masks avoid floating rectangular pictures. The office fills the viewport without vertical drift and remains visible for at least 650 ms before a 220 ms workspace fade. Direct menus, Enter and the entry button bypass the visual journey.

Selected picture URLs and decode revisions determine readiness. Pending responsive sources pause at the current camera position; their actual failure cancels readiness and holds at a safe boundary. Obsolete decode completions cannot ready a newly selected source. Touch cancellation reschedules arrival even when no travel needs restoring. Listeners, animations and timers are cleaned up on unmount. Mobile scene magnification is restrained because portrait cover already crops into the artwork.

## Commands actually completed

Both `npm.cmd run build` commands exited 0. Hosted TypeScript/Vite output: CSS 110.94 kB, JS 314.34 kB. Original app: CSS 191.70 kB, JS 461.90 kB.

Hosted `npm.cmd test`: **32/32 passed**, exit 0, including the static release allowlist. Original scoped command: **94/94 passed**, exit 0:

```text
node --test --test-concurrency=1 tests/city-entry.test.ts tests/city-flight-readiness.test.ts tests/game-curriculum.test.ts tests/game-trainingPreview.test.ts tests/game-liveProgress.test.ts tests/game-liveApi.test.ts tests/role-workspace.test.ts tests/result-summary.test.ts tests/experiment-guide.test.ts
```

Hosted `git diff --check` exited 0. Matched source hashes include the entrance component, camera model, readiness helper, CSS and both camera/readiness test files. The six delivered scene images and artwork provenance match between the two projects. Earlier test counts remain historical.

## Browser checks

Desktop 1280×720: panorama, approximately .44/.47/.49 approach, .64 street, .81 lobby, .92/.97 office, reverse navigation, native wheel forward/reverse and automatic dashboard entry. Mobile 390×844: entrance, .65 building approach and .95 office; document horizontal and vertical overflow both 0. Desktop/mobile source changes at the street and office preserve the camera position, show loading while decoding and return to ready for the correct selected URLs. Mobile scene transforms use the reduced magnification factor.

Proof files in the original project's `docs/screenshots/`:

- `nyc-flight-waterfront-desktop.jpg`
- `nyc-flight-office-desktop.jpg`
- `nyc-flight-waterfront-mobile.jpg`
- `nyc-flight-office-mobile.jpg`

The static release includes `public/game/new-york/city-flight-office-preview.jpg`, a desktop browser screenshot without learner profile or ledger data. Later publication identifiers are recorded in the original project's `docs/ONLINE_SITE.md`.

## Scope and limits

These are generated architectural images and layered 2.5D motion, not a reconstructed 3D/geospatial city or verified Canton headquarters. Native image resolution and delivery resampling are separate; see `NEW_YORK_FLIGHT_ART.md`. Actual iPhone/Safari touch, OS reduced-motion switching and GPU performance benchmarks have not been device-tested. Source-aware failures and stale completions are covered by meaningful state tests; no browser network-failure injection was performed. Hosted lessons remain REFERENCE_ONLY and have no actual ledger connection. Original authentication, evidence evaluation, learning progress and V1 were retained. No real-money transaction, new ledger observation, Railway workload or GitHub change was made.
