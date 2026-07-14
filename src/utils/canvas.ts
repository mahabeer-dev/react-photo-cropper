import type {
  CrossOriginValue,
  CroppedImageResult,
  GetCroppedImageParams,
  OutputMimeType
} from "../types";
import { getEffectiveImageSize, normalizeRotation } from "./cropMath";

function loadImageElement(
  src: string,
  crossOrigin?: CrossOriginValue
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    if (crossOrigin) {
      image.crossOrigin = crossOrigin;
    }

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: OutputMimeType,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to export cropped image."));
          return;
        }

        resolve(blob);
      }, type, quality);
    } catch (error) {
      if (error instanceof DOMException && error.name === "SecurityError") {
        reject(
          new Error(
            "Failed to export cropped image because the canvas is tainted by a cross-origin image. Load the image from the same origin, or use a CORS-enabled image URL with crossOrigin=\"anonymous\"."
          )
        );
        return;
      }

      reject(error instanceof Error ? error : new Error("Failed to export cropped image."));
    }
  });
}

function createLogicalOrientationCanvas(
  source: HTMLImageElement,
  rotation: 0 | 90 | 180 | 270
): HTMLCanvasElement {
  const naturalWidth = source.naturalWidth || source.width;
  const naturalHeight = source.naturalHeight || source.height;
  const effective = getEffectiveImageSize(
    { width: naturalWidth, height: naturalHeight },
    rotation
  );

  const logical = document.createElement("canvas");
  logical.width = Math.max(1, Math.round(effective.width));
  logical.height = Math.max(1, Math.round(effective.height));

  const logicalContext = logical.getContext("2d");
  if (!logicalContext) {
    throw new Error("Canvas rendering context is not available.");
  }

  logicalContext.translate(logical.width / 2, logical.height / 2);
  logicalContext.rotate((rotation * Math.PI) / 180);
  logicalContext.drawImage(
    source,
    -naturalWidth / 2,
    -naturalHeight / 2,
    naturalWidth,
    naturalHeight
  );

  return logical;
}

export async function getCroppedImage({
  image,
  crop,
  shape = "rect",
  type = "image/png",
  quality = 0.92,
  width,
  height,
  backgroundColor,
  crossOrigin,
  rotation: rotationInput = 0,
  fit = "cover",
  frame,
  renderedSize,
  position = { x: 0, y: 0 }
}: GetCroppedImageParams): Promise<CroppedImageResult> {
  const sourceImage =
    typeof image === "string" ? await loadImageElement(image, crossOrigin) : image;

  const rotation = normalizeRotation(rotationInput);

  // Contain letterboxes the whole image into the crop frame (aspect preserved,
  // transparent padding) instead of sampling a source sub-rectangle. It needs
  // the render geometry; without it, fall back to the cover source-rect path.
  const isContain = fit === "contain" && !!frame && !!renderedSize;
  const outputWidth = width ?? (isContain ? frame!.width : crop.width);
  const outputHeight = height ?? (isContain ? frame!.height : crop.height);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(outputWidth));
  canvas.height = Math.max(1, Math.round(outputHeight));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering context is not available.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (shape === "circle") {
    context.save();
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
    context.closePath();
    context.clip();
  }

  if (isContain) {
    // Draw the whole (rotation-corrected) image scaled to its rendered size and
    // centered in the frame with the current pan; the canvas clips any overflow
    // and leaves transparent padding where the image is smaller than the frame.
    const drawSource =
      rotation === 0 ? sourceImage : createLogicalOrientationCanvas(sourceImage, rotation);
    try {
      const scaleX = canvas.width / frame!.width;
      const scaleY = canvas.height / frame!.height;
      const destWidth = renderedSize!.width * scaleX;
      const destHeight = renderedSize!.height * scaleY;
      const destX = ((frame!.width - renderedSize!.width) / 2 + position.x) * scaleX;
      const destY = ((frame!.height - renderedSize!.height) / 2 + position.y) * scaleY;
      context.drawImage(drawSource, destX, destY, destWidth, destHeight);
    } finally {
      if (drawSource !== sourceImage) {
        (drawSource as HTMLCanvasElement).width = 0;
        (drawSource as HTMLCanvasElement).height = 0;
      }
    }
  } else if (rotation === 0) {
    context.drawImage(
      sourceImage,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  } else {
    const logical = createLogicalOrientationCanvas(sourceImage, rotation);
    try {
      context.drawImage(
        logical,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } finally {
      logical.width = 0;
      logical.height = 0;
    }
  }

  if (shape === "circle") {
    context.restore();
  }

  const blob = await canvasToBlob(canvas, type, quality);
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    width: canvas.width,
    height: canvas.height,
    revoke: () => URL.revokeObjectURL(url)
  };
}
