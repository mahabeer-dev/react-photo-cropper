import type { ImageCropperToolbarProps } from "../../types";

export function DefaultCropperToolbar({
  labels,
  zoom,
  minZoom,
  maxZoom,
  zoomStep,
  zoomPercentage,
  disabled,
  hasCropState,
  isSaving,
  showSaveButton,
  showRotation,
  rotation,
  onRotate,
  onZoomChange,
  onAdjustZoom,
  onReset,
  onSave
}: ImageCropperToolbarProps) {
  const controlsDisabled = disabled || !hasCropState;

  return (
    <div className="ic-toolbar">
      {showRotation ? (
        <>
          <button
            type="button"
            className="ic-iconButton"
            onClick={() => onRotate(-90)}
            disabled={controlsDisabled}
            aria-label={labels.rotateLeft}
          >
            ↺
          </button>
          <button
            type="button"
            className="ic-iconButton"
            onClick={() => onRotate(90)}
            disabled={controlsDisabled}
            aria-label={labels.rotateRight}
          >
            ↻
          </button>
        </>
      ) : null}

      <button
        type="button"
        className="ic-iconButton"
        onClick={() => onAdjustZoom(-zoomStep)}
        disabled={controlsDisabled || zoom <= minZoom}
        aria-label={labels.zoomOut}
      >
        -
      </button>

      <input
        className="ic-slider"
        type="range"
        min={minZoom}
        max={maxZoom}
        step={zoomStep}
        value={zoom}
        onChange={onZoomChange}
        disabled={controlsDisabled}
        aria-label="Zoom"
      />

      <span className="ic-zoomValue">{zoomPercentage}%</span>

      <button
        type="button"
        className="ic-iconButton"
        onClick={onReset}
        disabled={controlsDisabled}
        aria-label={labels.reset}
      >
        reset
      </button>

      {showSaveButton ? (
        <button
          type="button"
          className="ic-saveButton"
          onClick={onSave}
          disabled={controlsDisabled || isSaving}
        >
          {isSaving ? "Saving..." : labels.save}
        </button>
      ) : null}
    </div>
  );
}
