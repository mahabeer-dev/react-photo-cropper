import type { ImageCropperToolbarProps } from "../../types";

export function CardCropperToolbar({
  labels,
  zoom,
  minZoom,
  maxZoom,
  zoomStep,
  disabled,
  hasCropState,
  isSaving,
  showSaveButton,
  onZoomChange,
  onReset,
  onSave
}: ImageCropperToolbarProps) {
  const controlsDisabled = disabled || !hasCropState;

  return (
    <div className="ic-toolbar ic-toolbar--card">
      <input
        className="ic-slider ic-slider--card"
        type="range"
        min={minZoom}
        max={maxZoom}
        step={zoomStep}
        value={zoom}
        onChange={onZoomChange}
        disabled={controlsDisabled}
        aria-label="Zoom"
      />

      <div className="ic-card-actions">
        <button type="button" className="ic-buttonReset" onClick={onReset} disabled={controlsDisabled}>
          {labels.reset}
        </button>

        {showSaveButton ? (
          <button
            type="button"
            className="ic-saveButton ic-saveButton--card"
            onClick={onSave}
            disabled={controlsDisabled || isSaving}
          >
            {isSaving ? "Saving..." : labels.save}
          </button>
        ) : null}
      </div>
    </div>
  );
}
