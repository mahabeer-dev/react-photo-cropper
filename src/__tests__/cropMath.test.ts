import { describe, expect, it } from "vitest";
import {
  clampPosition,
  getCoverSize,
  getMinZoom,
  getPixelCrop
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
});
