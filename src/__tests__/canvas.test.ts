import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCroppedImage } from "../utils/canvas";

describe("getCroppedImage", () => {
  const drawImage = vi.fn();
  const clearRect = vi.fn();
  const fillRect = vi.fn();
  const save = vi.fn();
  const beginPath = vi.fn();
  const arc = vi.fn();
  const closePath = vi.fn();
  const clip = vi.fn();
  const restore = vi.fn();
  const translate = vi.fn();
  const rotate = vi.fn();
  const createObjectURL = vi.fn(() => "blob:cropped-image");
  const revokeObjectURL = vi.fn();

  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    originalCreateElement = document.createElement.bind(document);

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL
    });

    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName !== "canvas") {
        return originalCreateElement(tagName);
      }

      return {
        width: 0,
        height: 0,
        getContext: () => ({
          clearRect,
          fillRect,
          save,
          beginPath,
          arc,
          closePath,
          clip,
          drawImage,
          restore,
          translate,
          rotate
        }),
        toBlob: (callback: BlobCallback) =>
          callback(new Blob(["cropped"], { type: "image/png" }))
      } as unknown as HTMLCanvasElement;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draws the requested crop area into a canvas and returns a revokable url", async () => {
    const result = await getCroppedImage({
      image: {} as HTMLImageElement,
      crop: { x: 12, y: 18, width: 80, height: 90 },
      width: 160,
      height: 180,
      shape: "circle",
      backgroundColor: "#fff"
    });

    expect(clearRect).toHaveBeenCalledWith(0, 0, 160, 180);
    expect(fillRect).toHaveBeenCalledWith(0, 0, 160, 180);
    expect(clip).toHaveBeenCalledTimes(1);
    expect(drawImage).toHaveBeenCalledWith(
      {},
      12,
      18,
      80,
      90,
      0,
      0,
      160,
      180
    );
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(result.url).toBe("blob:cropped-image");

    result.revoke();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:cropped-image");
  });

  it("uses a logical canvas when rotation is non-zero", async () => {
    const image = {
      naturalWidth: 100,
      naturalHeight: 200,
      width: 100,
      height: 200
    } as HTMLImageElement;

    await getCroppedImage({
      image,
      crop: { x: 10, y: 20, width: 30, height: 40 },
      rotation: 90,
      width: 60,
      height: 80
    });

    expect(translate).toHaveBeenCalled();
    expect(rotate).toHaveBeenCalled();
    expect(drawImage.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("returns a helpful error when the canvas is tainted by a cross-origin image", async () => {
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName !== "canvas") {
        return originalCreateElement(tagName);
      }

      return {
        width: 0,
        height: 0,
        getContext: () => ({
          clearRect,
          fillRect,
          save,
          beginPath,
          arc,
          closePath,
          clip,
          drawImage,
          restore,
          translate,
          rotate
        }),
        toBlob: () => {
          throw new DOMException("Tainted canvas", "SecurityError");
        }
      } as unknown as HTMLCanvasElement;
    });

    await expect(
      getCroppedImage({
        image: {} as HTMLImageElement,
        crop: { x: 0, y: 0, width: 80, height: 80 }
      })
    ).rejects.toThrow(/cross-origin image/i);
  });
});
