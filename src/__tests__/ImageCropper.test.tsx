import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ImageCropper } from "../components/ImageCropper";
import * as canvasUtils from "../utils/canvas";

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: vi.fn()
  });

  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    configurable: true,
    value: vi.fn()
  });
});

describe("ImageCropper", () => {
  it("emits crop updates for zoom and drag interactions", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ImageCropper
        src="avatar.png"
        shape="rect"
        cropWidth={200}
        cropHeight={200}
        onChange={onChange}
      />
    );

    const image = screen.getByAltText("Image crop preview");
    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 1000 });
    Object.defineProperty(image, "naturalHeight", { configurable: true, value: 500 });

    fireEvent.load(image);

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.lastCall?.[0].pixelCrop).toEqual({
      x: 250,
      y: 0,
      width: 500,
      height: 500
    });

    const slider = screen.getByLabelText("Zoom");
    fireEvent.change(slider, { target: { value: "2" } });

    expect(onChange.mock.lastCall?.[0].zoom).toBe(2);

    const viewport = container.querySelector(".ic-viewport");
    if (!viewport) {
      throw new Error("Viewport not found");
    }

    fireEvent.pointerDown(viewport, {
      pointerId: 1,
      clientX: 100,
      clientY: 100
    });
    fireEvent.pointerMove(viewport, {
      pointerId: 1,
      clientX: 160,
      clientY: 100
    });
    fireEvent.pointerUp(viewport, {
      pointerId: 1,
      clientX: 160,
      clientY: 100
    });

    expect(onChange.mock.lastCall?.[0].position.x).toBeGreaterThan(0);
    expect(onChange.mock.lastCall?.[0].pixelCrop.x).toBeGreaterThan(250);
  });

  it("surfaces export failures through onError", async () => {
    const onError = vi.fn();
    vi.spyOn(canvasUtils, "getCroppedImage").mockRejectedValue(
      new Error("Failed to export cropped image because the canvas is tainted.")
    );

    const { container } = render(
      <ImageCropper
        src="https://cdn.example.com/avatar.png"
        crossOrigin="anonymous"
        onError={onError}
        onSave={vi.fn()}
      />
    );

    const image = container.querySelector(".ic-image");
    if (!image) {
      throw new Error("Image not found");
    }

    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 1000 });
    Object.defineProperty(image, "naturalHeight", { configurable: true, value: 500 });
    fireEvent.load(image);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
