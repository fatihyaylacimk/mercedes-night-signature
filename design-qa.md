# Signature Experience — design and interaction QA

Date: 2026-10-28

final result: passed

Scope: the new personal-premiere interface and its visual fallback. This is an extension of the existing site's art direction, not a pixel-for-pixel clone. Free 3D rendering, touch performance on physical devices, and real vehicle accuracy are outside this visual pass and remain separate validation requirements.

## Evidence and normalization

- Source visual truth: the existing public final at `https://fatihyaylacimk.github.io/mercedes-night-signature/#scene-06`, captured as `/workspace/scratch/signature-qa-source-final.jpg`.
- Source image dimensions: 1353 × 929 pixels. Implementation final: 1363 × 936 pixels at `/workspace/scratch/signature-experience-final.jpg`.
- Both were captured in the same cloud-browser session. The source's scrollable page has a slightly different content/export boundary. Both images were displayed at the same width with their aspect ratios preserved on `/qa-evidence/`; no differences were filed for that approximately 1% boundary variation.
- Combined full-view comparison: `/workspace/scratch/signature-qa-comparison.jpg`. This is a browser-rendered comparison containing both actual screenshots, not two separately described images.
- Current desktop intro: `/workspace/scratch/signature-experience-desktop.jpg`.
- Responsive CSS viewports: 390 × 844 and 360 × 740, inspected in same-origin frames. Their enclosing screenshots are 1363 × 936 and include the inspection frame; no claim of a physical phone or device-scale-factor emulation is made.
- Small viewport evidence: `/workspace/scratch/signature-qa-small-before.jpg`, `signature-qa-small-after.jpg`, `signature-qa-small-final.jpg`, and final contrast correction `signature-qa-small-contrast.jpg` in the same directory.
- Long name check: `Abdülkadir İskenderoğlu`, with a 342 px headline width and a 342 px scroll width in the 390 px frame.
- Export evidence: `/workspace/scratch/Signature-Experience-sunset.png`, downloaded through the actual UI, opened and inspected; 1600 × 1000 pixels with the selected atmosphere and correct personal title.

The combined source/final comparison establishes composition and visual continuity. Full-size desktop captures and the unscaled 360/390 CSS frames were also inspected for text and control details. Separate magnified crops were not necessary for this sparse interface; there are no dense tables, icon grids or fine data visualizations.

## Required fidelity surfaces

| Surface | Result |
| --- | --- |
| Fonts and typography | Georgia display type and italic secondary lines retain the source's serif language. Arial controls remain plain. Long personal names shrink to the available title width. TR/EN possessive forms are checked. |
| Spacing and rhythm | A larger, complete vehicle occupies the right side on desktop; input and actions occupy the left. Mobile has a dedicated lower input/action area. The source's narrow portrait band is intentionally replaced by a landscape composition. |
| Colours and tokens | Night, showroom and sunset each have foreground, muted text, background and action tokens. Form and description surfaces keep text readable above bright photographic reflections. No claim of measured WCAG conformance is made. |
| Image quality | Three local WebP derivatives are sharp at the inspected sizes: approximately 164, 108 and 179 KB. The car is complete in the checked frames. The source 3D model and independent concept photography remain explicitly distinguished. No approximate CSS vehicle artwork is substituted. |
| App-specific copy | Optional identity entry, six chapters, explicit concept-cockpit wording, download, share and edit are present in TR/EN. There are no invented prices, specifications, live inventory or booking confirmations. |

## Comparison history and fixes

1. **P1 — short-height form overlapped the masthead.** At 360 × 740, changing a nested form from fixed to absolute positioned it relative to the editorial container. Fixed with explicit local top positions for intro/final/orbit action regions. Post-fix intro form bounds: y=449…589.5; final bounds: y=479…567. All controls fit in their intended regions and horizontal scroll width equals 360.
2. **P2 — personal names could wrap into the vehicle area.** Added measured fitting for the personal title line, retaining a readable minimum. The long Turkish-name test has no horizontal overflow.
3. **P2 — photo reflections reduced caption/form readability.** Added small theme-coloured support surfaces for the visual caption and mobile text/input rows, and raised mobile labels. Final evidence: `signature-qa-small-contrast.jpg`.
4. **P2 — long English download copy crowded the smaller final.** Shortened it to “Save my signature”; the 312 px final action group fits, including both primary actions and the edit/replay row.
5. **P2 — accessibility navigation labels remained in Turkish after language change.** Translated skip navigation, main/chapters/canvas descriptions, Studio return label and independent-concept credit. The skip target follows the currently available form or chapter navigation.

No actionable P0/P1/P2 interface findings remain in the inspected visual mode. The additional 3D/device work is an explicit validation limit rather than an implied pass.

## Interaction verification

- Optional name entry updates the title and persists locally; long and Unicode names are bounded and treated as text.
- Start, pause, chapter selection, cockpit concept, final jump and personal final were exercised through the actual UI.
- Night, showroom and sunset changed the selected control, text palette and local photograph.
- Language change updates personal titles, controls and accessibility labels.
- A real PNG was downloaded and visually inspected.
- A generated share link was opened in a separate tab and restored Fatih / sunset / final chapter correctly.
- Clipboard denial has a manual-select fallback. Native OS share delivery was not sent to another person.
- App-origin console errors/warnings were checked: none observed. Browser-extension metadata errors were excluded and are not claimed as app faults.

## Automated validation

- Build passed; the new renderer is bundled locally with the pinned existing dependencies.
- `npm run check:signature`: 933 checks passed, including finite cinematic poses, timing boundaries, door state, name handling, preference serialization and asset availability.
- Existing `npm run check`: 274 checks passed.
- Existing `npm run check:performance`: 14 checks passed.
- Existing black-model checks passed for full and mobile variants.
- Syntax and whitespace checks passed.

## Remaining practical limits

This cloud browser has no WebGL2. Actual 3D lighting, free-orbit touch behavior, GPU frame rate, heat and battery consumption must be checked on supported physical devices. The current source model does not add an accurate modern-model cockpit or an articulated trunk. There is no dealership backend or booking integration. A dealership-ready release must resolve these items with the appropriate model and dealer data.
