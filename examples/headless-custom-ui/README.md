# Example: headless cropper with your own UI

This Vite + React app uses **`@mr-mahabeer/react-photo-cropper/headless`** only:

- **`useCropper`** — zoom, pan, clamping, `pixelCrop`, rotation-aware math  
- **`getCroppedImage`** — canvas export (pass `rotation` + `crop` from state)  
- **`normalizeRotation`** — 90° steps for your own rotate buttons  

No `ImageCropper` component and **no** `@mr-mahabeer/react-photo-cropper/styles.css`.

## Run locally

From the **repository root** (so `file:../..` resolves):

```bash
npm run example:headless
```

That builds the library, installs example deps, and starts Vite. Or manually:

```bash
npm run build
cd examples/headless-custom-ui
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Use the same pattern in your app

### 1. Install the package

```bash
npm install @mr-mahabeer/react-photo-cropper
```

### 2. Import the headless surface

```ts
import {
  useCropper,
  getCroppedImage,
  normalizeRotation,
  getPixelCrop
} from "@mr-mahabeer/react-photo-cropper/headless";
```

(You can also import these from the root package `"@mr-mahabeer/react-photo-cropper"`; the `/headless` entry avoids pulling UI components.)

### 3. Own the UI contract

| You build | The library provides |
|-----------|----------------------|
| Viewport `div` (fixed `width`/`height` = `cropSize`) | `cropSize` passed into `useCropper` |
| `<img>` + `onLoad` → `setImageSize({ naturalWidth, naturalHeight })` | `baseSize`, `position`, `state`, pointer handlers |
| `transform` on the image (see `App.tsx`) matching translate → scale → rotate | Same math the full `CropViewport` uses |
| **Overlay** (dimmed outside + crop window) | **`CropOverlayFrame`** — render after `<img>` inside the viewport. Inline styles only (no `styles.css`). Props: `shape` (`"rect"` \| `"circle"`), optional `rectBorderRadius`. |
| `onPointerDown` / `Move` / `Up` on the viewport | `handlePointerDown`, `handlePointerMove`, `handlePointerUp` |
| Zoom / rotate / reset controls | `setZoom`, your `rotation` state + `normalizeRotation`, `reset()` |
| Save button | `getCroppedImage({ ... })` — use the same **`shape`** as `CropOverlayFrame` for consistent export. |

You may skip `CropOverlayFrame` and build your own mask (SVG, canvas, etc.); it only mirrors the full cropper’s “border + spread shadow” trick.

### 4. Rotation

Keep rotation in React state, pass **`rotation`** into `useCropper`, and apply the same value in the image `transform` (`rotate(${rotation}deg)`). On save, pass **`rotation: state.rotation`** into `getCroppedImage`. Reset should set rotation back and call **`reset()`** from the hook.

### 5. CORS

Remote images need **`crossOrigin="anonymous"`** on the `<img>` and CORS headers on the server, or `getCroppedImage` can throw when reading pixels.

## Files

- **`src/App.tsx`** — minimal custom UI wired to the hook and export helper.  
- **`src/App.css`** — example-only styling (not from the library).
