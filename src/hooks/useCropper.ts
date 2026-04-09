import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import type { CropperChange, Point, Size } from "../types";
import {
  clamp,
  clampPosition,
  getCoverSize,
  getMinZoom,
  getPixelCrop,
  getRenderedSize
} from "../utils/cropMath";

interface UseCropperOptions {
  cropSize: Size;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  initialPosition?: Point;
  onChange?: (state: CropperChange) => void;
  onComplete?: (state: CropperChange) => void;
}

interface DragState {
  pointerId: number;
  origin: Point;
  position: Point;
}

export function useCropper({
  cropSize,
  minZoom: requestedMinZoom = 1,
  maxZoom: requestedMaxZoom = 3,
  initialZoom = 1,
  initialPosition = { x: 0, y: 0 },
  onChange,
  onComplete
}: UseCropperOptions) {
  const [imageSize, setImageSize] = useState<Size>({ width: 0, height: 0 });

  const initialResolvedZoom = Math.min(
    Math.max(initialZoom, requestedMinZoom),
    Math.max(requestedMinZoom, requestedMaxZoom)
  );

  const [zoom, setZoom] = useState(initialResolvedZoom);
  const [position, setPosition] = useState<Point>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);

  const minZoom = useMemo(
    () => getMinZoom(imageSize, cropSize, requestedMinZoom),
    [cropSize, imageSize, requestedMinZoom]
  );
  const maxZoom = Math.max(minZoom, requestedMaxZoom);

  const baseSize = useMemo(
    () => getCoverSize(imageSize, cropSize),
    [cropSize, imageSize]
  );
  const renderedSize = useMemo(
    () => getRenderedSize(imageSize, cropSize, zoom),
    [cropSize, imageSize, zoom]
  );

  useEffect(() => {
    setZoom((currentZoom) => clamp(currentZoom, minZoom, maxZoom));
  }, [maxZoom, minZoom]);

  const setSafePosition = useCallback(
    (nextPosition: Point, nextZoom = zoom) => {
      const nextRenderedSize = getRenderedSize(imageSize, cropSize, nextZoom);
      setPosition(clampPosition(nextPosition, nextRenderedSize, cropSize));
    },
    [cropSize, imageSize, zoom]
  );

  const updateZoom = useCallback(
    (nextZoom: number) => {
      const safeZoom = clamp(nextZoom, minZoom, maxZoom);
      const nextRenderedSize = getRenderedSize(imageSize, cropSize, safeZoom);

      setZoom(safeZoom);
      setPosition((currentPosition) =>
        clampPosition(currentPosition, nextRenderedSize, cropSize)
      );
    },
    [cropSize, imageSize, maxZoom, minZoom]
  );

  const reset = useCallback(() => {
    setZoom(clamp(initialResolvedZoom, minZoom, maxZoom));
    setSafePosition(initialPosition, clamp(initialResolvedZoom, minZoom, maxZoom));
  }, [initialPosition, initialResolvedZoom, maxZoom, minZoom, setSafePosition]);

  const state = useMemo<CropperChange | null>(() => {
    if (!imageSize.width || !imageSize.height) {
      return null;
    }

    const safePosition = clampPosition(position, renderedSize, cropSize);

    return {
      zoom,
      position: safePosition,
      cropSize,
      imageSize,
      renderedSize,
      pixelCrop: getPixelCrop(imageSize, cropSize, safePosition, zoom),
      minZoom,
      maxZoom
    };
  }, [cropSize, imageSize, maxZoom, minZoom, position, renderedSize, zoom]);

  useEffect(() => {
    if (!state) {
      return;
    }

    onChange?.(state);
    onComplete?.(state);
  }, [onChange, onComplete, state]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!imageSize.width || !imageSize.height) {
        return;
      }

      dragStateRef.current = {
        pointerId: event.pointerId,
        origin: { x: event.clientX, y: event.clientY },
        position
      };

      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [imageSize.height, imageSize.width, position]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - dragState.origin.x;
      const deltaY = event.clientY - dragState.origin.y;

      setSafePosition({
        x: dragState.position.x + deltaX,
        y: dragState.position.y + deltaY
      });
    },
    [setSafePosition]
  );

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  return {
    imageSize,
    baseSize,
    isDragging,
    minZoom,
    maxZoom,
    position: state?.position ?? position,
    renderedSize,
    state,
    setImageSize,
    setPosition: setSafePosition,
    setZoom: updateZoom,
    reset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
