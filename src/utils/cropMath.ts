import type { CropArea, PixelCrop, Point, Size } from "../types";

export function normalizeRotation(degrees: number): 0 | 90 | 180 | 270 {
  const snapped = Math.round(degrees / 90) * 90;
  const normalized = ((snapped % 360) + 360) % 360;
  return normalized as 0 | 90 | 180 | 270;
}

/** Size used for cover/zoom math when the image is shown rotated in 90° steps. */
export function getEffectiveImageSize(imageSize: Size, rotationDeg: number): Size {
  const r = normalizeRotation(rotationDeg);
  if (r === 90 || r === 270) {
    return { width: imageSize.height, height: imageSize.width };
  }
  return { width: imageSize.width, height: imageSize.height };
}

/** Viewport bounds for clamping drag when the scaled image is rotated in 90° steps. */
export function getRotatedRenderedBounds(renderedSize: Size, rotationDeg: number): Size {
  const r = normalizeRotation(rotationDeg);
  if (r === 90 || r === 270) {
    return { width: renderedSize.height, height: renderedSize.width };
  }
  return { width: renderedSize.width, height: renderedSize.height };
}

/** Map pointer delta from screen space into pre-rotation image local space. */
export function rotatePointerDelta(deltaX: number, deltaY: number, rotationDeg: number): Point {
  const r = normalizeRotation(rotationDeg);
  const rad = (-r * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: deltaX * cos - deltaY * sin,
    y: deltaX * sin + deltaY * cos
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Smallest allowed `cropFrameScale` (avoids a degenerate aperture). */
export const MIN_CROP_FRAME_SCALE = 0.15;

/** Clamp `cropFrameScale` to a supported range for overlay + export math. */
export function normalizeCropFrameScale(scale: number): number {
  return clamp(scale, MIN_CROP_FRAME_SCALE, 1);
}

/**
 * Inner crop aperture size (centered in the viewport) for a given scale.
 * `1` = full viewport; `0.85` = 85% width and height, centered (smaller “hole”, more dimming).
 */
export function getApertureCropSize(viewportSize: Size, frameScale: number): Size {
  const s = normalizeCropFrameScale(frameScale);
  return {
    width: Math.max(1, Math.round(viewportSize.width * s)),
    height: Math.max(1, Math.round(viewportSize.height * s))
  };
}

export function getCoverSize(imageSize: Size, cropSize: Size): Size {
  if (!imageSize.width || !imageSize.height || !cropSize.width || !cropSize.height) {
    return { width: 0, height: 0 };
  }

  const scale = Math.max(cropSize.width / imageSize.width, cropSize.height / imageSize.height);

  return {
    width: imageSize.width * scale,
    height: imageSize.height * scale
  };
}

export function getMinZoom(
  imageSize: Size,
  cropSize: Size,
  requestedMinZoom = 1
): number {
  if (!imageSize.width || !imageSize.height) {
    return requestedMinZoom;
  }

  const baseSize = getCoverSize(imageSize, cropSize);
  if (!baseSize.width || !baseSize.height) {
    return requestedMinZoom;
  }

  return Math.max(
    requestedMinZoom,
    cropSize.width / baseSize.width,
    cropSize.height / baseSize.height
  );
}

export function getRenderedSize(
  imageSize: Size,
  cropSize: Size,
  zoom: number
): Size {
  const baseSize = getCoverSize(imageSize, cropSize);

  return {
    width: baseSize.width * zoom,
    height: baseSize.height * zoom
  };
}

export function clampPosition(position: Point, renderedSize: Size, cropSize: Size): Point {
  const maxX = Math.max(0, (renderedSize.width - cropSize.width) / 2);
  const maxY = Math.max(0, (renderedSize.height - cropSize.height) / 2);
  const x = clamp(position.x, -maxX, maxX);
  const y = clamp(position.y, -maxY, maxY);

  return {
    x: Object.is(x, -0) ? 0 : x,
    y: Object.is(y, -0) ? 0 : y
  };
}

export function getPixelCrop(
  imageSize: Size,
  cropSize: Size,
  position: Point,
  zoom: number
): PixelCrop {
  const renderedSize = getRenderedSize(imageSize, cropSize, zoom);
  const safePosition = clampPosition(position, renderedSize, cropSize);

  const sourceX = ((renderedSize.width - cropSize.width) / 2 - safePosition.x) / renderedSize.width;
  const sourceY = ((renderedSize.height - cropSize.height) / 2 - safePosition.y) / renderedSize.height;
  const sourceWidth = cropSize.width / renderedSize.width;
  const sourceHeight = cropSize.height / renderedSize.height;

  const x = clamp(Math.round(sourceX * imageSize.width), 0, imageSize.width);
  const y = clamp(Math.round(sourceY * imageSize.height), 0, imageSize.height);
  const width = clamp(Math.round(sourceWidth * imageSize.width), 1, imageSize.width - x);
  const height = clamp(Math.round(sourceHeight * imageSize.height), 1, imageSize.height - y);

  return { x, y, width, height };
}

export function getCropArea(
  imageSize: Size,
  cropSize: Size,
  position: Point,
  zoom: number
): CropArea {
  const pixelCrop = getPixelCrop(imageSize, cropSize, position, zoom);

  return {
    ...pixelCrop,
    zoom
  };
}
