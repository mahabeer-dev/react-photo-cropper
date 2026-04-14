/**
 * Headless API — crop state hook, canvas export, crop math, and an optional **overlay** (`CropOverlayFrame`)
 * without importing the full `ImageCropper` or `styles.css`.
 * @packageDocumentation
 */
export { CropOverlayFrame } from "./components/CropOverlayFrame";
export { useCropper } from "./hooks/useCropper";
export { getCroppedImage } from "./utils/canvas";
export {
  clamp,
  clampPosition,
  getCoverSize,
  getCropArea,
  getEffectiveImageSize,
  getMinZoom,
  getPixelCrop,
  getRenderedSize,
  getRotatedRenderedBounds,
  normalizeRotation,
  rotatePointerDelta
} from "./utils/cropMath";
export type { CropOverlayFrameProps } from "./components/CropOverlayFrame";
export type {
  CropArea,
  CropOutputOptions,
  CropShape,
  CrossOriginValue,
  CroppedImageResult,
  CropperChange,
  CropperState,
  GetCroppedImageParams,
  OutputMimeType,
  PixelCrop,
  Point,
  Size,
  UseCropperOptions,
  UseCropperReturn
} from "./types";
