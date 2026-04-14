import { describe, expect, it } from "vitest";
import { getPixelCrop, normalizeRotation, useCropper } from "../headless";

describe("headless entry", () => {
  it("exports crop math", () => {
    expect(normalizeRotation(90)).toBe(90);
    expect(
      getPixelCrop({ width: 1000, height: 500 }, { width: 200, height: 200 }, { x: 100, y: 0 }, 1)
    ).toEqual({
      x: 0,
      y: 0,
      width: 500,
      height: 500
    });
  });

  it("exports useCropper as a function", () => {
    expect(typeof useCropper).toBe("function");
  });
});
