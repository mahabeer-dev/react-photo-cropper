# react-photo-cropper

Browser-only React image cropper with drag, zoom, circular or rectangular crop overlays, and a typed canvas export helper.

## Install

```bash
npm install react-photo-cropper
```

## Usage

```tsx
import { ImageCropper } from "react-photo-cropper";
import "react-photo-cropper/styles.css";

function AvatarCropper() {
  return (
    <ImageCropper
      src="/images/profile.jpg"
      shape="circle"
      cropWidth={320}
      crossOrigin="anonymous"
      onSave={(result) => {
        console.log(result.blob, result.url);
      }}
      onError={(error) => {
        console.error(error.message);
      }}
    />
  );
}
```

## Core Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | required | Image URL or data URL |
| `shape` | `"circle" \| "rect"` | `"circle"` | Crop overlay shape |
| `cropWidth` | `number` | `320` | Viewport width in pixels |
| `cropHeight` | `number` | derived | Explicit viewport height |
| `aspect` | `number` | unset | Used when `cropHeight` is not provided |
| `minZoom` | `number` | `1` | Lower zoom bound |
| `maxZoom` | `number` | `3` | Upper zoom bound |
| `zoomStep` | `number` | `0.1` | Slider/button zoom increment |
| `showControls` | `boolean` | `true` | Toggles built-in toolbar |
| `crossOrigin` | `"anonymous" \| "use-credentials"` | unset | Required for exporting remote images via canvas |
| `output` | `CropOutputOptions` | unset | Export size, mime type, quality |
| `onChange` | `(state) => void` | unset | Called whenever crop state changes |
| `onComplete` | `(state) => void` | unset | Called with the resolved crop state |
| `onError` | `(error) => void` | unset | Receives export/load errors such as tainted canvas failures |
| `onSave` | `(result, state) => void` | unset | Invoked by the built-in save button |

## Export Helper

```ts
import { getCroppedImage } from "react-photo-cropper";

const result = await getCroppedImage({
  image: htmlImageElement,
  crop: { x: 120, y: 40, width: 320, height: 320 },
  shape: "circle",
  type: "image/png"
});
```

## Cross-Origin Images

If your image comes from another domain, canvas export will fail unless that image is served with valid CORS headers.

Use:

```tsx
<ImageCropper
  src="https://cdn.example.com/avatar.jpg"
  crossOrigin="anonymous"
  onError={(error) => {
    console.error(error.message);
  }}
/>
```

Requirements:
- the image server must return `Access-Control-Allow-Origin`
- `crossOrigin="anonymous"` must be set before the image is fetched
- if the remote server does not allow CORS, browser-side cropping preview may still work but export via `toBlob()` will fail

## Publish Checklist

```bash
npm run lint
npm run test
npm run build
npm run pack:check
```

After that:

```bash
npm login
npm publish --access public
```
