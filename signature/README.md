# Signature Experience — Gecenin Sahibi Sensin

An independent personal-premiere concept built on the existing Mercedes Night Signature project. The new experience is served at `signature/`.

## Delivered behaviour

- Optional name or initials, with local-only preference storage and bounded text.
- A six-chapter, 45-second film with pause, chapter selection and a personal final.
- Night, showroom and sunset environments: local photographic concepts plus corresponding lighting in the existing 3D vehicle renderer.
- Free 3D orbit, pinch/keyboard zoom, headlights and the existing driver-door rig where WebGL2 is available.
- Image mode when 3D is unavailable. The cockpit is explicitly a separate concept still.
- A 1600 × 1000 PNG signature card and a shareable URL fragment carrying the name, atmosphere, language and chapter.
- Turkish and English copy, visible keyboard focus, reduced-motion handling and a layout checked at desktop, 390 px and 360 px widths.

## Preview and checks

From the repository root:

```sh
npm ci
npm run build
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
npm run check:signature
npm run check
npm run check:performance
```

The development server redirects its root to `signature/`. Its `/__preview/phone` and `/__preview/small-phone` wrappers are local inspection tools; they are not part of GitHub Pages output.

## Asset and verification limits

The actual 3D model is the existing 2016 GT S, with its original attribution and geometry retained. There is no detailed new 3D cockpit, articulated trunk, dealer inventory connection, booking backend or official Mercedes affiliation. The cockpit still and generated atmosphere photos are independent visual concepts, not a representation of a specific stock vehicle's equipment.

`assets/provenance.json` records the atmosphere derivatives. The built-in image-generation tool expanded the existing black-car reference into a wide night composition, then produced showroom and sunset lighting variants. No credentials, customer names or analytics are sent to a server. A user-triggered share includes the selected name in the URL fragment.

Responsive browser inspection is not physical-phone testing. The current cloud browser does not support WebGL2; the 3D path requires a separate supported-device check before a dealership demonstration. The UI fallback is intentionally usable without WebGL2.
