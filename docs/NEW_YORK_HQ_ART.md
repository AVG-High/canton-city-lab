# Manhattan image fidelity update — 2026-10-06

All four approved scenes were edited using **built-in ImageGen**: Manhattan panorama, waterfront building approach, glass-door lobby and office. Camera/framing, warm ivory/bronze/walnut materials and room placements were retained. Window grids, bridge cables, stone joints, leaves, water and glass framing were regenerated with cleaner photographic detail. These remain illustrative generated scenes, not photographs of Canton headquarters or a geographically continuous 3D reconstruction.

## Native resolution and delivery limits

The requested native size was 3840×2160 or the largest supported landscape output. **Every selected native result is actually 1672×941**. One street retry also produced 1672×941 and was discarded because its stone texture was less faithful. The higher delivery dimensions below are Lanczos3 resampling, not native 4K detail. Zoom crops still have a finite detail limit. No separate API/CLI image-generation path was used.

Bundled Node Sharp performs delivery resizing and progressive JPEG conversion only: desktop quality 95, mobile quality 92, color sampling 4:4:4. It adds no artificial sharpening or blur. Desktop delivery is now 3840×2160 for all four scenes; mobile is 1920×1080. The fallback/sharing image uses the same edited panorama at 1920×1080, quality 95.

| File | Delivery dimensions | Bytes | JPEG quality |
| --- | --- | ---: | ---: |
| `nyc-city-immersive.jpg` | 3840×2160 | 2,831,059 | 95 |
| `nyc-city-immersive-mobile.jpg` | 1920×1080 | 825,478 | 92 |
| `nyc-waterfront-street.jpg` | 3840×2160 | 2,838,898 | 95 |
| `nyc-waterfront-street-mobile.jpg` | 1920×1080 | 822,147 | 92 |
| `nyc-building-lobby.jpg` | 3840×2160 | 2,536,149 | 95 |
| `nyc-building-lobby-mobile.jpg` | 1920×1080 | 721,856 | 92 |
| `nyc-office-arrival.jpg` | 3840×2160 | 2,485,204 | 95 |
| `nyc-office-arrival-mobile.jpg` | 1920×1080 | 705,317 | 92 |
| `nyc-hero.jpg` | 1920×1080 | 1,039,768 | 95 |

## Source, prompts and rollback

Native sources: `docs/art/hq-v6/*-source.png` in the original local application. Exact prompts and generated output paths: [prompt set](art/hq-v6/prompts.json), [street prompt and retry](art/hq-v6/nyc-waterfront-street-remaster.json). Full native/delivery hashes and copy verification: [manifest](art/hq-v6/manifest.json). Reproducible delivery encoding: [encode.cjs](art/hq-v6/encode.cjs). Previous active JPEG bytes were retained in `docs/art/hq-v6/previous-web-assets/`; original native sources and V1/prior release archives remain untouched.

## Application integration and checks

Nine active JPEGs match byte-for-byte in both the original application and hosted Site. The same updated images are used by the entrance, passing façade/river texture, lobby title frames and office workspace background. Every active photo URL—including dynamic scene URLs, CSS backgrounds, fallback and hosted social sharing image—has `?v=6` to avoid a cached older photo. There are no changes to camera stages, menu flow, permissions, authenticated ledger logic or learning progress. Each destination's existing decode gate remains in place.

Desktop 1280×720 and mobile 390×844 browser checks inspected the four loaded image sources (3840px / 1920px respectively), ready states, entrance stages and workspace reuse. Public proof screenshots contain only this educational frontend; no ledger responses, keys or personal profile are included. Actual iPhone/Safari GPU/touch performance was not measured. Four desktop decoded photos use about 133 MB before compositor overhead; the mobile pictures reduce image memory and download size. Native output limits remain relevant to deep zoom.
