import { describe, expect, it } from "vitest";
import {
  clampPosition,
  getApertureCropSize,
  getCoverSize,
  getEffectiveImageSize,
  getMinZoom,
  getPixelCrop,
  getPixelCropInAperture,
  getRotatedRenderedBounds,
  normalizeCropFrameScale,
  normalizeRotation,
  rotatePointerDelta
} from "../utils/cropMath";

describe("cropMath", () => {
  it("computes a cover size that fully fills the crop viewport", () => {
    expect(
      getCoverSize({ width: 1000, height: 500 }, { width: 200, height: 200 })
    ).toEqual({
      width: 400,
      height: 200
    });
  });

  it("keeps the minimum zoom at or above the requested value", () => {
    expect(
      getMinZoom(
        { width: 1000, height: 500 },
        { width: 200, height: 200 },
        1.25
      )
    ).toBe(1.25);
  });

  it("clamps image movement so the crop viewport never shows empty space", () => {
    expect(
      clampPosition(
        { x: 999, y: -999 },
        { width: 400, height: 200 },
        { width: 200, height: 200 }
      )
    ).toEqual({
      x: 100,
      y: 0
    });
  });

  it("projects the visible viewport back into source image pixels", () => {
    expect(
      getPixelCrop(
        { width: 1000, height: 500 },
        { width: 200, height: 200 },
        { x: 100, y: 0 },
        1
      )
    ).toEqual({
      x: 0,
      y: 0,
      width: 500,
      height: 500
    });
  });

  it("maps centered aperture to the same image region shown in overlay", () => {
    expect(
      getPixelCropInAperture(
        { width: 900, height: 700 },
        { width: 300, height: 300 },
        { width: 180, height: 180 },
        { x: 0, y: 0 },
        1
      )
    ).toEqual({
      x: 240,
      y: 140,
      width: 420,
      height: 420
    });
  });

  it("normalizes rotation to 90° steps", () => {
    expect(normalizeRotation(45)).toBe(90);
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(360)).toBe(0);
  });

  it("swaps effective dimensions for 90° and 270°", () => {
    expect(getEffectiveImageSize({ width: 1000, height: 500 }, 0)).toEqual({ width: 1000, height: 500 });
    expect(getEffectiveImageSize({ width: 1000, height: 500 }, 90)).toEqual({ width: 500, height: 1000 });
    expect(getEffectiveImageSize({ width: 1000, height: 500 }, 180)).toEqual({ width: 1000, height: 500 });
  });

  it("returns AABB size for rotated rendered box", () => {
    expect(getRotatedRenderedBounds({ width: 400, height: 200 }, 0)).toEqual({ width: 400, height: 200 });
    expect(getRotatedRenderedBounds({ width: 400, height: 200 }, 90)).toEqual({ width: 200, height: 400 });
  });

  it("rotates pointer delta into local image space", () => {
    const p = rotatePointerDelta(10, 0, 90);
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeCloseTo(-10, 5);
  });

  it("scales aperture crop size and clamps crop frame scale", () => {
    expect(getApertureCropSize({ width: 200, height: 300 }, 0.5)).toEqual({
      width: 100,
      height: 150
    });
    expect(normalizeCropFrameScale(2)).toBe(1);
    expect(normalizeCropFrameScale(0.05)).toBe(0.15);
  });
});
