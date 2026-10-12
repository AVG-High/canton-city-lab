# New York entrance flight artwork

Generated 2026-10-04 with the built-in `image_gen.imagegen` tool. These original architectural scenes extend the approved Manhattan entrance into a waterfront approach, building threshold, and quiet office. No external photographs, trademarks, people, or legible financial data are present.

## Continuity and use

The existing `nyc-city-immersive-source.png` was inspected and used as the waterfront image's morning-light/palette reference. The resulting waterfront image was inspected and referenced for the lobby. The lobby image was inspected and referenced for the office. All three accepted results were inspected in `view_image` before delivery. The shared motifs are ivory limestone, dark bronze/copper framing, straight central travel axes, and warm early-morning reflections. They are generated design environments, not photographs of a verified real building or Canton office, and are never ledger evidence. The camera transition is an illustrative entrance into the educational product.

The street vanishing point is approximately 55% across / 54% down. Lobby and office points are approximately 50–52% across / 54% down. A shared CSS transform origin around 53% / 54% is suitable; the application controls transition interpolation separately.

Existing Manhattan, preview, and prior V1 artwork were preserved. New files were saved under unique names in both projects' `public/game/new-york/` folders. Native PNGs live under the original project's `docs/art/`. `nyc-flight-assets.json` records the accepted sources and delivery hashes. `prepare-nyc-flight-delivery.cjs` is the one-time safe conversion script; it refuses to overwrite an existing delivery and depends on the bundled Node sharp package.

## Actual resolution and transformation

The built-in tool returned **1672×941 native images**. The desktop JPEGs are **2560×1441 resampled delivery images**, not native 2.5K detail. The mobile JPEGs are **1280×720 reduced delivery images**. Node sharp's Lanczos3 resize and JPEG conversion (desktop quality 90, mobile quality 84, 4:4:4) were applied; no extra imagery, recoloring, compositing, or generated detail was added during conversion. Conversion to a larger delivery size does not create genuine camera detail. No Python image manipulation or fallback API model was used.

| File | Dimensions / role | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| nyc-waterfront-street-source.png | 1672×941 (native PNG) | 2,732,676 | 317b6030d41dfbf64a3d39464cf21314fa899f7175bde0eae49a23e511e6ff3f |
| nyc-waterfront-street.jpg | 2560×1441 (resampled delivery) | 1,079,046 | 22ff51eb76f5aa4e7133b39642189d6524575c13d52fd2c2d075a75e8ff27ba8 |
| nyc-waterfront-street-mobile.jpg | 1280×720 (reduced delivery) | 292,075 | 8c9b519a7f7368305cbb2b586af032c558abd30e6c9cede575473158c7a948a3 |
| nyc-building-lobby-source.png | 1672×941 (native PNG) | 2,384,518 | bdbaa87abf530f1ef43e463fca120d016d42239230c3d767865aad79bb3e0841 |
| nyc-building-lobby.jpg | 2560×1441 (resampled delivery) | 910,248 | c31788743617973fbf838ff9a416fdbc1efe406ceac9449de4ba25c1379bb749 |
| nyc-building-lobby-mobile.jpg | 1280×720 (reduced delivery) | 253,254 | f0655b9644df5692403c9e30bd0a8c01f74ee13f4b4fc8e523d483eb35462281 |
| nyc-office-arrival-source.png | 1672×941 (native PNG) | 2,290,571 | e1dc98221a9a6b4d6c36d2c48b995c05e614426a8535e2ad8a64cad761d8a01d |
| nyc-office-arrival.jpg | 2560×1441 (resampled delivery) | 867,392 | 3b6701b443f23399b25729702d039b6ab79b7a8838cb8badb1d705edf302b75b |
| nyc-office-arrival-mobile.jpg | 1280×720 (reduced delivery) | 244,829 | aa9e9d5fc4b7111248e3c279dadd33a36dad96c5b4acd468a8ce92d71b1cc274 |

## Exact prompt set

### Waterfront approach

```text
Use case: photorealistic-natural.
Asset type: full screen cinematic website environment, 16:9 landscape.
Reference image: the attached existing Manhattan city panorama is a lighting and palette reference, NOT an image to recreate. Create the next shot as the camera has flown over the river and reached the waterfront.
Scene: low camera at eye level moving straight along a beautiful empty Manhattan waterfront financial district stone promenade/courtyard, toward a refined institutional building entrance centered in frame. The water is a subtle strip to the far left; tall architectural façades frame and crop both edges. Authentic pale limestone, brushed copper and dark bronze trim, floor-to-ceiling clear glass doorway. Use elegant believable New York financial architecture, not futuristic fantasy.
Composition: strong forward-travel depth with straight converging paving lines from both bottom corners to the main entrance at x54%, y54%. Wide 24mm architectural lens, completely straight verticals, no warped lines. Doorway and further interior at central travel axis. Camera is very close to beautiful building edges so they can sweep past later. Framing and lighting must support a continuous film-like approach from the provided skyline into this doorway.
Lighting: same warm, restrained soft early morning light as the supplied city reference, not bright yellow and not blue-cold. Muted ivory, warm taupe limestone, charcoal ink shadows, quiet copper reflections. Highly detailed professional architectural photograph, sharp believable materials, minimal cinematic editorial polish.
Constraints: one image, a clean environment only, no people, no cars in foreground, no words, no signage, no logos, no watermarks, no interface, no frames, no split scenes. No text and no data. Not an illustration. No fog hiding the destination.
```

### Building threshold / lobby

```text
Use case: photorealistic-natural.
Asset type: the next full-screen environment in a continuous architectural camera flythrough, 16:9 landscape.
Input reference image: this is the actual previous waterfront street shot; preserve its architectural identity, pale limestone, dark bronze / copper window framing, proportions of the doorway, and warm restrained morning light.
Primary request: move the camera directly forward along the same entrance axis until it is at the threshold of this exact elegant Manhattan building. The outdoor courtyard now falls behind the camera. We look straight through the large central glass doorway into a refined premium financial-office lobby. Do not show another street or a different building.
Composition: near symmetrical architectural view from eye level, rectilinear 24mm lens, travel axis and bright opening at x54%, y54%. Close limestone/bronze doorway jambs frame left and right edges. Beautiful pale ivory stone floor continues into the lobby with subtle lines converging toward the same bright central opening. Lobby depth has restrained copper metallic trims, quiet limestone walls, dark walnut inserts, a tasteful reception element far to right but no desk blocking the path. The bright central doorway beyond reveals a quiet institutional office with blank monitors toward the sides. Keep the center open so a later camera move can pass through the doorway.
Lighting: exact calm early morning light and tones of the reference. Real physically plausible glass reflections, highly detailed believable architectural photography, no oversaturation, no dramatic haze. Warm ivory and taupe, copper highlights, ink shadows.
Constraints: clean original environment, no people, no readable text, no signage, no company marks, no logos, no watermarks, no UI, no frame, no split scene. Straight non-warped architecture. One landscape image.
```

### Office arrival

```text
Use case: photorealistic-natural.
Asset type: final full-screen architectural environment in a continuous website camera flythrough, 16:9 landscape.
Input reference: this is the previous shot at the building lobby threshold. The new image is the view after the camera has continued straight ahead through this lobby into the actual institutional office. Keep the same warm limestone, dark walnut, dark bronze/copper trim, calm morning lighting, rectilinear perspective and identity of the architecture.
Scene: a beautiful quiet contemporary Manhattan financial research office. View straight inside from its entry; open central walkway leads deep into the room, premium pale ivory stone flooring, refined dark walnut / charcoal desks toward left and right foreground/midground, empty premium chairs, each desk has a simple blank dark computer monitor, elegant thin glass walls and partitions, warm copper rails and fixtures, tall windows across the back with a believable soft Manhattan view. Not a hotel reception, not a living room, not a futuristic lab, not a corporate stock photo with people.
Composition: cinematic straight-ahead eye-level 24mm photograph, clear unobstructed forward travel axis at x54%, y54%, desks and partitions close to both edges can sweep past, bright deep office center. Maintain a feeling of entering a real workplace from the previous threshold, never a split image. Center and foreground corridor open and uncluttered, no huge desk blocking camera.
Lighting: warm restrained early morning daylight, atmospheric yet sharply detailed, muted ivory, warm greige, copper accents, dark ink monitors, natural and tactile materials, excellent architectural magazine photography, realistic highlights and shadows.
Constraints: NO people, NO readable text, NO charts, NO pseudo data, NO signage, NO logos or words, NO watermark, NO UI. Blank monitor screens only. No oversized screens or cyberpunk lighting. Natural real architecture, straight lines, one clean landscape image.
```

## Limitations

The images share reference-driven materials and composition, but are independent generated views rather than a reconstructed three-dimensional model. The website can create a reversible cinematic depth illusion using overlapping planes and foreground parallax; it must not present the views as a literal geospatial journey into a documented institutional building. The office's monitors are blank. The entrance artwork conveys no claim about privacy, selective disclosure, performance, or headquarters location.

