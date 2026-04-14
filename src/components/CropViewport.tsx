import type { CSSProperties, PointerEventHandler, RefObject } from "react";
import type { CropShape, CrossOriginValue, Point, Size } from "../types";

interface CropViewportProps {
  src: string;
  alt?: string;
  crossOrigin?: CrossOriginValue;
  cropSize: Size;
  baseSize: Size;
  position: Point;
  zoom: number;
  /** Clockwise degrees (0, 90, 180, 270); applied after scale. */
  rotation?: number;
  shape: CropShape;
  imageRef?: RefObject<HTMLImageElement | null>;
  disabled?: boolean;
  isDragging?: boolean;
  onImageLoad: (size: Size) => void;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  /** Appended to `ic-viewport` (e.g. `ic-viewport--card` from the variant registry). */
  viewportClassName?: string;
}

export function CropViewport({
  src,
  alt = "Image crop preview",
  crossOrigin,
  cropSize,
  baseSize,
  position,
  zoom,
  rotation = 0,
  shape,
  imageRef,
  disabled = false,
  isDragging = false,
  onImageLoad,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  viewportClassName
}: CropViewportProps) {
  const imageStyle: CSSProperties = {
    width: `${baseSize.width}px`,
    height: `${baseSize.height}px`,
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`
  };

  return (
    <div
      className={`ic-viewport${viewportClassName ? ` ${viewportClassName}` : ""}${disabled ? " ic-viewport--disabled" : ""}${isDragging ? " ic-viewport--dragging" : ""}`}
      style={{ width: cropSize.width, height: cropSize.height }}
      onPointerDown={disabled ? undefined : onPointerDown}
      onPointerMove={disabled ? undefined : onPointerMove}
      onPointerUp={disabled ? undefined : onPointerUp}
    >
      <img
        ref={imageRef}
        className="ic-image"
        src={src}
        alt={alt}
        crossOrigin={crossOrigin ?? undefined}
        draggable={false}
        style={imageStyle}
        onLoad={(event) =>
          onImageLoad({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight
          })
        }
      />
      <div className="ic-mask" aria-hidden="true">
        <div className={`ic-frame ic-frame--${shape}`} />
      </div>
    </div>
  );
}
