import { useMemo, useRef, useState } from "react";
import {
  CropOverlayFrame,
  getCroppedImage,
  normalizeRotation,
  useCropper,
  type CropShape,
} from "@mr-mahabeer/react-photo-cropper/headless";
import "./App.css";

/** Viewport size passed into `useCropper({ cropSize })` — your layout chooses this. */
const CROP_SIZE = { width: 300, height: 300 };

/** Demo image (CORS-friendly for canvas export). Swap for your own URL + `crossOrigin` rules. */
const DEMO_SRC = "https://picsum.photos/id/237/900/700";

export default function App() {
  const imageRef = useRef<HTMLImageElement>(null);
  const [rotation, setRotation] = useState(0);
  const [cropFrameScale, setCropFrameScale] = useState(1);
  const [cropShape, setCropShape] = useState<CropShape>("rect");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState(
    "Drag the image. Use controls below — none of this chrome comes from the library.",
  );

  console.log("cropFrameScale", cropFrameScale);

  const {
    baseSize,
    position,
    state,
    isDragging,
    minZoom,
    maxZoom,
    setImageSize,
    setZoom,
    reset: resetCropper,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCropper({
    cropSize: CROP_SIZE,
    cropFrameScale,
    rotation,
    minZoom: 1,
    maxZoom: 3,
    initialZoom: 1,
    onChange: (next) => {
      setStatus(
        `zoom ${next.zoom.toFixed(2)} · frame ${next.cropFrameScale.toFixed(2)} · rotation ${next.rotation}° · crop ${next.pixelCrop.width}×${next.pixelCrop.height}px`,
      );
    },
  });

  const zoom = state?.zoom ?? minZoom;

  const imageStyle = useMemo(
    () => ({
      width: `${baseSize.width}px`,
      height: `${baseSize.height}px`,
      transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
    }),
    [baseSize.height, baseSize.width, position.x, position.y, rotation, zoom],
  );

  const handleRotate = (delta: number) => {
    setRotation((r) => normalizeRotation(r + delta));
  };

  const handleReset = () => {
    setRotation(0);
    setCropFrameScale(1);
    resetCropper();
  };

  const handleSave = async () => {
    if (!state || !imageRef.current) {
      setStatus("Wait for the image to load.");
      return;
    }
    try {
      const result = await getCroppedImage({
        image: imageRef.current,
        crop: state.pixelCrop,
        rotation: state.rotation,
        shape: cropShape,
        type: "image/jpeg",
        quality: 0.9,
      });
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return result.url;
      });
      setStatus(
        `Saved JPEG ${result.width}×${result.height}px (object URL in preview below).`,
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Export failed");
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Headless cropper</h1>
        <p className="lede">
          UI and CSS here are <strong>100% example-only</strong>. Logic comes
          from <code>@mr-mahabeer/react-photo-cropper/headless</code> (
          <code>useCropper</code>, <code>getCroppedImage</code>,{" "}
          <code>CropOverlayFrame</code>, <code>normalizeRotation</code>).
        </p>
      </header>

      <section className="demo">
        <div
          className={`viewport ${isDragging ? "viewport--drag" : ""}`}
          style={{ width: CROP_SIZE.width, height: CROP_SIZE.height }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            ref={imageRef}
            className="demo-image"
            src={DEMO_SRC}
            alt="Photo to crop"
            crossOrigin="anonymous"
            draggable={false}
            style={imageStyle}
            onLoad={(e) =>
              setImageSize({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })
            }
          />
          <CropOverlayFrame
            shape={cropShape}
            frameScale={cropFrameScale}
            rectBorderRadius={14}
          />
        </div>

        <div className="controls">
          <label className="control">
            <span>Zoom</span>
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={!state}
            />
          </label>

          <label className="control">
            <span>Crop window size (cropFrameScale)</span>
            <input
              type="range"
              min={0.15}
              max={1}
              step={0.05}
              value={cropFrameScale}
              onChange={(e) => setCropFrameScale(Number(e.target.value))}
              disabled={!state}
            />
          </label>

          <div className="button-row button-row--shape">
            <span className="control-label">Overlay</span>
            <button
              type="button"
              className={cropShape === "rect" ? "active" : ""}
              onClick={() => setCropShape("rect")}
              disabled={!state}
            >
              Rect
            </button>
            <button
              type="button"
              className={cropShape === "circle" ? "active" : ""}
              onClick={() => setCropShape("circle")}
              disabled={!state}
            >
              Circle
            </button>
          </div>

          <div className="button-row">
            <button
              type="button"
              onClick={() => setZoom(zoom - 0.15)}
              disabled={!state || zoom <= minZoom}
            >
              Zoom −
            </button>
            <button
              type="button"
              onClick={() => setZoom(zoom + 0.15)}
              disabled={!state || zoom >= maxZoom}
            >
              Zoom +
            </button>
            <button
              type="button"
              onClick={() => handleRotate(-90)}
              disabled={!state}
            >
              Rotate ⟲
            </button>
            <button
              type="button"
              onClick={() => handleRotate(90)}
              disabled={!state}
            >
              Rotate ⟳
            </button>
            <button type="button" onClick={handleReset} disabled={!state}>
              Reset
            </button>
            <button
              type="button"
              className="primary"
              onClick={handleSave}
              disabled={!state}
            >
              Save JPEG
            </button>
          </div>
        </div>
      </section>

      <p className="status" role="status">
        {status}
      </p>

      {previewUrl ? (
        <section className="preview-block">
          <h2>Last export</h2>
          <img
            className="preview-thumb"
            src={previewUrl}
            alt="Cropped result"
          />
        </section>
      ) : null}
    </div>
  );
}
