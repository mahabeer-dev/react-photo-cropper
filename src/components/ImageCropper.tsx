import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent
} from "react";
import type { ImageCropperLabels, ImageCropperProps, Size } from "../types";
import { getCroppedImage } from "../utils/canvas";
import { CropViewport } from "./CropViewport";
import { useCropper } from "../hooks/useCropper";

const DEFAULT_LABELS: ImageCropperLabels = {
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  reset: "Reset",
  save: "Save"
};

function resolveCropSize({
  cropWidth = 320,
  cropHeight,
  aspect,
  shape
}: Pick<ImageCropperProps, "cropWidth" | "cropHeight" | "aspect" | "shape">): Size {
  const width = cropWidth;

  if (cropHeight) {
    return { width, height: cropHeight };
  }

  if (aspect && aspect > 0) {
    return { width, height: Math.round(width / aspect) };
  }

  if (shape === "circle") {
    return { width, height: width };
  }

  return { width, height: 320 };
}

export function ImageCropper({
  src,
  alt,
  crossOrigin,
  cropWidth = 320,
  cropHeight,
  aspect,
  shape = "circle",
  minZoom = 1,
  maxZoom = 3,
  zoomStep = 0.1,
  initialZoom = 1,
  initialPosition,
  disabled = false,
  className,
  style,
  showControls = true,
  output,
  labels,
  onChange,
  onComplete,
  onError,
  onSave
}: ImageCropperProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const cropSize = useMemo(
    () => resolveCropSize({ cropWidth, cropHeight, aspect, shape }),
    [aspect, cropHeight, cropWidth, shape]
  );

  const {
    baseSize,
    isDragging,
    minZoom: safeMinZoom,
    maxZoom: safeMaxZoom,
    position,
    state,
    setImageSize,
    setZoom,
    reset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  } = useCropper({
    cropSize,
    minZoom,
    maxZoom,
    initialZoom,
    initialPosition,
    onChange,
    onComplete
  });

  const rootClassName = `ic-root${className ? ` ${className}` : ""}`;
  const zoomPercentage =
    safeMaxZoom === safeMinZoom
      ? 100
      : Math.round(((state?.zoom ?? safeMinZoom) - safeMinZoom) / (safeMaxZoom - safeMinZoom) * 100);

  const handleZoomChange = (event: ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(event.target.value));
  };

  const handleSave = async () => {
    if (!onSave || !state || !imageRef.current || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await getCroppedImage({
        image: crossOrigin ? src : imageRef.current,
        crop: state.pixelCrop,
        shape,
        crossOrigin,
        ...output
      });

      await onSave(result, state);
    } catch (error) {
      const cropError =
        error instanceof Error ? error : new Error("Failed to save cropped image.");
      onError?.(cropError);

      if (!onError) {
        throw cropError;
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={rootClassName} style={style}>
      <CropViewport
        src={src}
        alt={alt}
        crossOrigin={crossOrigin}
        cropSize={cropSize}
        baseSize={baseSize}
        position={position}
        zoom={state?.zoom ?? safeMinZoom}
        shape={shape}
        imageRef={imageRef}
        disabled={disabled}
        isDragging={isDragging}
        onImageLoad={setImageSize}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {showControls ? (
        <div className="ic-toolbar">
          <button
            type="button"
            className="ic-iconButton"
            onClick={() => setZoom((state?.zoom ?? safeMinZoom) - zoomStep)}
            disabled={disabled || !state || state.zoom <= safeMinZoom}
            aria-label={resolvedLabels.zoomOut}
          >
            -
          </button>

          <input
            className="ic-slider"
            type="range"
            min={safeMinZoom}
            max={safeMaxZoom}
            step={zoomStep}
            value={state?.zoom ?? safeMinZoom}
            onChange={handleZoomChange}
            disabled={disabled || !state}
            aria-label="Zoom"
          />

          <span className="ic-zoomValue">{zoomPercentage}%</span>

          <button
            type="button"
            className="ic-iconButton"
            onClick={reset}
            disabled={disabled || !state}
            aria-label={resolvedLabels.reset}
          >
            reset
          </button>

          {onSave ? (
            <button
              type="button"
              className="ic-saveButton"
              onClick={handleSave}
              disabled={disabled || !state || isSaving}
            >
              {isSaving ? "Saving..." : resolvedLabels.save}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
