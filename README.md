# @mr-mahabeer/react-photo-cropper

Browser-only **React** image cropper: drag and zoom, **rect** or **circle** mask, **90° rotation**, built-in or **headless** APIs, and **canvas** export with TypeScript types.

## Install

```bash
npm install @mr-mahabeer/react-photo-cropper
```

Styles are optional for the full **`ImageCropper`** component:

```bash
# default + card UI variants use this stylesheet
import "@mr-mahabeer/react-photo-cropper/styles.css";
```

## Quick start (`ImageCropper`)

```tsx
import { ImageCropper } from "@mr-mahabeer/react-photo-cropper";
import "@mr-mahabeer/react-photo-cropper/styles.css";

function AvatarCropper() {
  return (
    <ImageCropper
      src="/images/profile.jpg"
      shape="circle"
      cropWidth={320}
      crossOrigin="anonymous"
      onSave={(result) => {
        console.log(result.blob, result.url);
        result.revoke();
      }}
      onError={(error) => {
        console.error(error.message);
      }}
    />
  );
}
```

**Card-style layout** (full-width zoom slider, Reset / Save row):

```tsx
<ImageCropper
  src={url}
  uiVariant="card"
  shape="rect"
  cropWidth={320}
  crossOrigin="anonymous"
  onSave={handleSave}
/>
```

## `ImageCropper` props

| Prop                  | Type                                       | Default     | Notes                                                                                               |
| --------------------- | ------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------- |
| `src`                 | `string`                                   | required    | Image URL or data URL                                                                               |
| `alt`                 | `string`                                   | preset      | `img` alt text                                                                                      |
| `crossOrigin`         | `"anonymous" \| "use-credentials"`         | unset       | Use `"anonymous"` for remote images you plan to export (CORS)                                       |
| `shape`               | `"circle" \| "rect"`                       | `"circle"`  | Crop mask and export clip                                                                           |
| `cropFrameScale`      | `number`                                   | `1`         | Inner clear area as a fraction of the viewport (each axis), centered; more dimming when lower. Clamped to [0.15, 1] |
| `cropWidth`           | `number`                                   | `320`       | Viewport width (px)                                                                                 |
| `cropHeight`          | `number`                                   | derived     | Viewport height; derived from `aspect` or `shape` if omitted                                        |
| `aspect`              | `number`                                   | unset       | `cropHeight` ≈ `cropWidth / aspect` when height not set                                             |
| `minZoom` / `maxZoom` | `number`                                   | `1` / `3`   | Zoom range                                                                                          |
| `zoomStep`            | `number`                                   | `0.1`       | Slider / button step                                                                                |
| `initialZoom`         | `number`                                   | `1`         | Starting zoom                                                                                       |
| `initialPosition`     | `{ x, y }`                                 | `{0,0}`     | Starting pan                                                                                        |
| `initialRotation`     | `number`                                   | `0`         | Snapped to 0, 90, 180, 270                                                                          |
| `showRotation`        | `boolean`                                  | `true`      | Hide built-in rotate controls when `false`                                                          |
| `uiVariant`           | `"default" \| "card"`                      | `"default"` | Toolbar layout and card chrome                                                                      |
| `toolbarComponent`    | `ComponentType<ImageCropperToolbarProps>`  | unset       | Replace toolbar only; `uiVariant` still sets card/root classes unless you override with `className` |
| `showControls`        | `boolean`                                  | `true`      | Hide all built-in controls                                                                          |
| `disabled`            | `boolean`                                  | `false`     | Disables interaction                                                                                |
| `className` / `style` |                                            |             | Root element                                                                                        |
| `labels`              | `Partial<ImageCropperLabels>`              |             | `zoomIn`, `zoomOut`, `reset`, `save`, `rotateLeft`, `rotateRight`                                   |
| `output`              | `CropOutputOptions`                        | unset       | Export `type`, `quality`, `width`, `height`, `backgroundColor`                                      |
| `onChange`            | `(state: CropperChange) => void`           | unset       | Fires when crop state changes (includes `rotation`, `pixelCrop`)                                    |
| `onComplete`          | `(state: CropperChange) => void`           | unset       | Same payload as `onChange` (both fire on updates)                                                   |
| `onError`             | `(error: Error) => void`                   | unset       | Export / load errors; avoids rethrow when set                                                       |
| `onSave`              | `(result, state) => void \| Promise<void>` | unset       | When set, shows Save; receives `CroppedImageResult`                                                 |

## Export helper (`getCroppedImage`)

Works with an **`HTMLImageElement`** or image URL string. Pass **`rotation`** when the preview was rotated (same values as `CropperChange.rotation`).

```ts
import { getCroppedImage } from "@mr-mahabeer/react-photo-cropper";

const result = await getCroppedImage({
  image: htmlImageElement,
  crop: { x: 120, y: 40, width: 320, height: 320 },
  shape: "circle",
  rotation: 0,
  type: "image/png",
  width: 256,
  height: 256,
});

// result.blob, result.url, result.width, result.height
result.revoke();
```

## Headless API (`/headless`)

For **custom UI**, import from the subpath (no bundled toolbar; **`CropOverlayFrame`** uses inline styles so you can skip package CSS):

```ts
import {
  useCropper,
  getCroppedImage,
  CropOverlayFrame,
  normalizeRotation,
} from "@mr-mahabeer/react-photo-cropper/headless";
```

| What                                          | Purpose                                                             |
| --------------------------------------------- | ------------------------------------------------------------------- |
| **`useCropper`**                              | Zoom, pan, clamping, `state.pixelCrop`, optional **`cropFrameScale`** (smaller clear window), rotation-aware bounds |
| **`getCroppedImage`**                         | Same export as above                                                |
| **`CropOverlayFrame`**                        | Dimmed outside + crop window; pass **`frameScale`** to match `useCropper`’s `cropFrameScale` |
| **`normalizeRotation`**, **`normalizeCropFrameScale`**, **`getApertureCropSize`**, other **cropMath** | Rotation, frame scale, geometry helpers |

Types include **`UseCropperOptions`**, **`UseCropperReturn`**, **`CropperChange`**, **`CropOverlayFrameProps`**, **`PixelCrop`**, and more. The same symbols are also available from the **package root** if you prefer a single import graph.

**Runnable example** (Vite, custom markup/CSS): **[examples/headless-custom-ui](./examples/headless-custom-ui/)**. From the repo root:

```bash
npm run example:headless
```

## Extending the built-in UI

Reusable toolbars and registry:

```ts
import {
  ImageCropper,
  DefaultCropperToolbar,
  CardCropperToolbar,
  IMAGE_CROPPER_VARIANT_REGISTRY,
  type ImageCropperToolbarProps,
} from "@mr-mahabeer/react-photo-cropper";
```

Implement **`ImageCropperToolbarProps`** and pass **`toolbarComponent={MyToolbar}`** for a fully custom control strip while reusing **`useCropper`** indirectly via **`ImageCropper`**.

## Programmatic utilities (tree-shakeable)

From the main entry (also re-exported on `/headless` where applicable):

`clamp`, `clampPosition`, `getApertureCropSize`, `getCoverSize`, `getCropArea`, `getEffectiveImageSize`, `getMinZoom`, `getPixelCrop`, `getRenderedSize`, `getRotatedRenderedBounds`, `MIN_CROP_FRAME_SCALE`, `normalizeCropFrameScale`, `normalizeRotation`, `rotatePointerDelta`

## Package exports

| Path                                          | Use                                      |
| --------------------------------------------- | ---------------------------------------- |
| `@mr-mahabeer/react-photo-cropper`            | `ImageCropper`, hooks, helpers, types    |
| `@mr-mahabeer/react-photo-cropper/headless`   | Headless surface (no full chrome)        |
| `@mr-mahabeer/react-photo-cropper/styles.css` | Styles for `ImageCropper` / card variant |

## Cross-origin images

Canvas export needs CORS on the image response and **`crossOrigin="anonymous"`** (or `"use-credentials"`) on the `<img>` before load. Without it, preview may work but **`getCroppedImage`** / Save can throw (tainted canvas).

```tsx
<ImageCropper
  src="https://cdn.example.com/avatar.jpg"
  crossOrigin="anonymous"
  onError={(e) => console.error(e.message)}
/>
```
