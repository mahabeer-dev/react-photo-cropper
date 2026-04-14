import type { CSSProperties } from "react";
import type { CropShape } from "../types";
import { normalizeCropFrameScale } from "../utils/cropMath";

export interface CropOverlayFrameProps {
  shape: CropShape;
  /**
   * Inner frame as a fraction of the mask (centered). `1` = full area (default).
   * Match `cropFrameScale` / `useCropper`’s `cropFrameScale` for aligned preview and export.
   */
  frameScale?: number;
  /** Corner radius when `shape` is `"rect"` (default matches main cropper). */
  rectBorderRadius?: number;
  /** Optional class on the outer mask for theme hooks (e.g. `ic-mask`). */
  className?: string;
  /** Optional class on the inner frame (e.g. `ic-frame ic-frame--rect`). */
  frameClassName?: string;
}

const maskStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none"
};

/**
 * Dimmed outside + clear crop window (same technique as the full `ImageCropper` viewport).
 * Uses inline styles so it works with the **headless** entry without importing `styles.css`.
 */
export function CropOverlayFrame({
  shape,
  frameScale: frameScaleProp = 1,
  rectBorderRadius = 20,
  className,
  frameClassName
}: CropOverlayFrameProps) {
  const frameScale = normalizeCropFrameScale(frameScaleProp);
  const borderRadius = shape === "circle" ? "9999px" : rectBorderRadius;
  const frameBorder = "2px solid rgba(255, 255, 255, 0.95)";
  const frameShadow = "0 0 0 9999px rgba(15, 23, 42, 0.28)";

  const frameStyle: CSSProperties =
    frameScale >= 1 - 1e-6
      ? {
          position: "absolute",
          inset: 0,
          border: frameBorder,
          boxShadow: frameShadow,
          borderRadius
        }
      : {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: `${frameScale * 100}%`,
          height: `${frameScale * 100}%`,
          transform: "translate(-50%, -50%)",
          border: frameBorder,
          boxShadow: frameShadow,
          borderRadius
        };

  return (
    <div className={className} style={maskStyle} aria-hidden="true">
      <div className={frameClassName} style={frameStyle} />
    </div>
  );
}
