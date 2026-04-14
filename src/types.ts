import type { ChangeEvent, ComponentType, CSSProperties } from "react";

export type CropShape = "circle" | "rect";

/** `default` — compact toolbar with zoom +/- and percentage. `card` — stacked layout with slider and Reset / Save row (see package styles). */
export type ImageCropperUIVariant = "default" | "card";
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
  /** Clockwise degrees; normalized to 0, 90, 180, or 270. */
  rotation: number;
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
  rotateLeft: string;
  rotateRight: string;
}

/** Props passed to built-in and custom cropper toolbar components. */
export interface ImageCropperToolbarProps {
  labels: ImageCropperLabels;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  /** 0–100 derived from zoom between min and max. */
  zoomPercentage: number;
  /** Parent `disabled` prop. */
  disabled: boolean;
  /** False until the image has loaded and crop state exists. */
  hasCropState: boolean;
  isSaving: boolean;
  /** Whether `onSave` was provided to `ImageCropper`. */
  showSaveButton: boolean;
  showRotation: boolean;
  rotation: number;
  onRotate: (deltaDegrees: number) => void;
  onZoomChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAdjustZoom: (delta: number) => void;
  onReset: () => void;
  onSave: () => void;
}

export type ImageCropperToolbarComponent = ComponentType<ImageCropperToolbarProps>;

export interface ImageCropperProps extends CropImageSource {
  /** When `"card"`, uses the alternate layout (rounded card, full-width slider, Reset + Save). Default keeps the original toolbar. */
  uiVariant?: ImageCropperUIVariant;
  /** Renders instead of the toolbar for `uiVariant`. Use with `uiVariant` for root/viewport styling from the registry, or set `className` on `ImageCropper` for fully custom chrome. */
  toolbarComponent?: ImageCropperToolbarComponent;
  /** Initial rotation in degrees (snapped to the nearest multiple of 90). */
  initialRotation?: number;
  /** When false, rotation controls are hidden (rotation stays at `initialRotation`). Default true. */
  showRotation?: boolean;
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
  /** Clockwise degrees (0, 90, 180, 270). When set, `crop` is in logical pixel space after rotation (same as `CropperState.pixelCrop`). */
  rotation?: number;
}
