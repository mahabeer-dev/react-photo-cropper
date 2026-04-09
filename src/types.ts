import type { CSSProperties } from "react";

export type CropShape = "circle" | "rect";
export type OutputMimeType = "image/png" | "image/jpeg" | "image/webp";
export type CrossOriginValue = "anonymous" | "use-credentials";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PixelCrop extends Size, Point {}

export interface CropArea extends Size, Point {
  zoom: number;
}

export interface CropperState {
  zoom: number;
  position: Point;
  cropSize: Size;
  imageSize: Size;
  renderedSize: Size;
  pixelCrop: PixelCrop;
}

export interface CropperChange extends CropperState {
  minZoom: number;
  maxZoom: number;
}

export interface CropOutputOptions {
  type?: OutputMimeType;
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface CroppedImageResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  revoke: () => void;
}

export interface CropImageSource {
  src: string;
  alt?: string;
  crossOrigin?: CrossOriginValue;
}

export interface ImageCropperLabels {
  zoomIn: string;
  zoomOut: string;
  reset: string;
  save: string;
}

export interface ImageCropperProps extends CropImageSource {
  cropWidth?: number;
  cropHeight?: number;
  aspect?: number;
  shape?: CropShape;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  initialZoom?: number;
  initialPosition?: Point;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  showControls?: boolean;
  output?: CropOutputOptions;
  labels?: Partial<ImageCropperLabels>;
  onChange?: (state: CropperChange) => void;
  onComplete?: (state: CropperChange) => void;
  onError?: (error: Error) => void;
  onSave?: (result: CroppedImageResult, state: CropperChange) => void | Promise<void>;
}

export interface GetCroppedImageParams extends CropOutputOptions {
  image: HTMLImageElement | string;
  crop: PixelCrop;
  shape?: CropShape;
  crossOrigin?: CrossOriginValue;
}
