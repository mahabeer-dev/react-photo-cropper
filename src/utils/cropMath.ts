import type { CropArea, PixelCrop, Point, Size } from "../types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
