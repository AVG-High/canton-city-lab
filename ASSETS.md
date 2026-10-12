# Manhattan entrance and workspace assets

## Soundtrack — 2026-10-06

The user selected **New York Skyline** by **Geoff Harvey / geoffharvey** (Pixabay track 203813, approximately 2:53). The original MP3 is bundled at `public/game/audio/new-york-skyline-203813.mp3`; it is not streamed from an external player. Retrieved from the track page's observed audio source on 2026-10-06: `https://cdn.pixabay.com/audio/2024/04/22/audio_801ed27ee4.mp3`.

- Track and attribution: https://pixabay.com/music/smooth-jazz-new-york-skyline-203813/
- Artist: https://pixabay.com/users/geoffharvey-9096471/
- Usage conditions: https://pixabay.com/service/license-summary/ and https://pixabay.com/service/terms/
- Original MP3: 5,534,615 bytes; SHA256 `4455da86d781a4e885309c82569c0ac79d7bf4bdb1226e7272fbae63af0ba4c8`.
- The track page identifies the work as covered by the Pixabay Content License and registered with YouTube Content ID. This website use is part of the designed educational experience, not a standalone music catalogue or download offering. The licence is not a claim of unrestricted rights; YouTube redistribution requires a separate claim/licence check.
- Playback is off on a fresh load. An explicit music-button click starts it; no audio URL is assigned beforehand. The same player survives academy navigation. Native looping may have an audible boundary in the original MP3.
- The music disclosure retains the track/artist links and licence. Background-tab pause requires a deliberate click to resume.

## Architectural imagery

Current image edition: **HQ v6, 2026-10-06**. Built-in ImageGen edits retain the approved Manhattan entrance, waterfront, lobby and office composition. They are generated design material, not a claim about the Canton headquarters.

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


Exact prompts, native source paths, hashes and previous JPEGs are preserved in the original local application at `docs/art/hq-v6/`. See [fidelity and limits](docs/NEW_YORK_HQ_ART.md).

All active photo references use `?v=6`, including the panorama fallback/OG image, passing textures, lobby title frames and office workspace background. Existing responsive decode gates and reversible camera behavior remain.

`city-entry-preview.jpg`, `city-flight-office-preview.jpg` and `city-interior-preview.jpg` are browser screenshots of the current educational frontend, refreshed for this image edition. They include no ledger data or personal profile.
