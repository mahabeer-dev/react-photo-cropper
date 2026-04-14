import type { CSSProperties } from "react";
import type { CropShape } from "../types";

export interface CropOverlayFrameProps {
  shape: CropShape;
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
  rectBorderRadius = 20,
  className,
  frameClassName
}: CropOverlayFrameProps) {
  const frameStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    border: "2px solid rgba(255, 255, 255, 0.95)",
    boxShadow: "0 0 0 999px rgba(15, 23, 42, 0.28)",
    borderRadius: shape === "circle" ? "9999px" : rectBorderRadius
  };

  return (
    <div className={className} style={maskStyle} aria-hidden="true">
      <div className={frameClassName} style={frameStyle} />
    </div>
  );
}
