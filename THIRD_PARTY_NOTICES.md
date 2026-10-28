# Third-party notices

## Vehicle geometry

Source: GabrielPedroza / Mercedes-AMG-GT-S-2016
https://github.com/GabrielPedroza/Mercedes-AMG-GT-S-2016
Pinned source commit: c7fef03252288ba6b858da2078e6e69a364930a1.
The source README declares MIT licensing. Retain this source attribution with the adapted model. This project changes paint/materials, separates existing mesh components into a driver-door hinge and wheel groups, resizes textures and recompresses geometry. The shape is a GT S 2016; the independent concept imagery is separate.

## Three.js

Three.js 0.180.0, Copyright three.js authors. MIT license text is included in vendor/THREE-LICENSE.txt. The bundled GLTFLoader, DRACOLoader, RoomEnvironment, RectAreaLightUniformsLib and Reflector are from the same release.
https://github.com/mrdoob/three.js

## Draco

Google Draco geometry decoder. Apache License 2.0. The decoder notice and license are retained in vendor/draco. https://github.com/google/draco

## Campaign media

Six storyboard keyframes were generated specifically for this project using the built-in image generation tool. Twelve short TR/EN narration clips were generated using AI Voice Generator. Their static copies are shipped with the project; no temporary playback URL is needed at runtime. Sound effects are synthesized by this project's Web Audio code.

Mercedes-Benz and Mercedes-AMG names and marks identify the subject of this independent concept; no endorsement or official commission is asserted.

The Studio mobile model is a simplified derivative of the same credited GT S 2016 source, generated with glTF Transform and meshoptimizer. Node names and door/wheel rig hierarchy are retained.

The black Studio models (`car-black.glb`, `car-black-mobile.glb`) correct all four body-paint materials and out-of-range clearcoat values from those existing derivatives. They retain the same source attribution and geometry. The earlier Studio and original model files remain available. These material changes do not add a C192 model, detailed interior, or trunk mechanism.

## Signature Experience atmosphere images

`signature/assets/night.webp`, `studio.webp` and `sunset.webp` were generated for this independent concept with the built-in image-generation tool, using the existing campaign image as a visual reference. They are separate photographic concepts, not photographs of the credited 2016 3D model or representations of actual stock-vehicle equipment. Local WebP derivatives and their hashes are recorded in `signature/assets/provenance.json`. The new 3D renderer adapts the existing GT Studio renderer and preserves the same model and third-party attributions.
