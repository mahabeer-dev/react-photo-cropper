import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";
import type { CropperChange, Point, Size, UseCropperOptions, UseCropperReturn } from "../types";
import {
  clamp,
  clampPosition,
  getCoverSize,
  getEffectiveImageSize,
  getMinZoom,
  getPixelCrop,
  getRenderedSize,
  getRotatedRenderedBounds,
  rotatePointerDelta
} from "../utils/cropMath";

interface DragState {
  pointerId: number;
  origin: Point;
  position: Point;
}

export function useCropper({
  cropSize,
  rotation: rotationProp = 0,
  minZoom: requestedMinZoom = 1,
  maxZoom: requestedMaxZoom = 3,
  initialZoom = 1,
  initialPosition = { x: 0, y: 0 },
  onChange,
  onComplete
}: UseCropperOptions): UseCropperReturn {
  const [imageSize, setImageSize] = useState<Size>({ width: 0, height: 0 });
  const rotation = rotationProp;

  const initialResolvedZoom = Math.min(
    Math.max(initialZoom, requestedMinZoom),
    Math.max(requestedMinZoom, requestedMaxZoom)
  );

  const [zoom, setZoom] = useState(initialResolvedZoom);
  const [position, setPosition] = useState<Point>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);

  const effectiveImageSize = useMemo(
    () => getEffectiveImageSize(imageSize, rotation),
    [imageSize, rotation]
  );

  const minZoom = useMemo(
    () => getMinZoom(effectiveImageSize, cropSize, requestedMinZoom),
    [cropSize, effectiveImageSize, requestedMinZoom]
  );
  const maxZoom = Math.max(minZoom, requestedMaxZoom);

  const baseSize = useMemo(
    () => getCoverSize(effectiveImageSize, cropSize),
    [cropSize, effectiveImageSize]
  );
  const renderedSize = useMemo(
    () => getRenderedSize(effectiveImageSize, cropSize, zoom),
    [cropSize, effectiveImageSize, zoom]
  );
  const renderedBounds = useMemo(
    () => getRotatedRenderedBounds(renderedSize, rotation),
    [renderedSize, rotation]
  );

  useEffect(() => {
    setZoom((currentZoom) => clamp(currentZoom, minZoom, maxZoom));
  }, [maxZoom, minZoom]);

  const setSafePosition = useCallback(
    (nextPosition: Point, nextZoom = zoom) => {
      const nextRendered = getRenderedSize(effectiveImageSize, cropSize, nextZoom);
      const bounds = getRotatedRenderedBounds(nextRendered, rotation);
      setPosition(clampPosition(nextPosition, bounds, cropSize));
    },
    [cropSize, effectiveImageSize, rotation, zoom]
  );

  const updateZoom = useCallback(
    (nextZoom: number) => {
      const safeZoom = clamp(nextZoom, minZoom, maxZoom);
      const nextRendered = getRenderedSize(effectiveImageSize, cropSize, safeZoom);
      const bounds = getRotatedRenderedBounds(nextRendered, rotation);

      setZoom(safeZoom);
      setPosition((currentPosition) => clampPosition(currentPosition, bounds, cropSize));
    },
    [cropSize, effectiveImageSize, maxZoom, minZoom, rotation]
  );

  const reset = useCallback(() => {
    setZoom(clamp(initialResolvedZoom, minZoom, maxZoom));
    setSafePosition(initialPosition, clamp(initialResolvedZoom, minZoom, maxZoom));
  }, [initialPosition, initialResolvedZoom, maxZoom, minZoom, setSafePosition]);

  const state = useMemo<CropperChange | null>(() => {
    if (!imageSize.width || !imageSize.height) {
      return null;
    }

    const safePosition = clampPosition(position, renderedBounds, cropSize);

    return {
      zoom,
      position: safePosition,
      rotation,
      cropSize,
      imageSize,
      renderedSize,
      pixelCrop: getPixelCrop(effectiveImageSize, cropSize, safePosition, zoom),
      minZoom,
      maxZoom
    };
  }, [
    cropSize,
    effectiveImageSize,
    imageSize.height,
    imageSize.width,
    maxZoom,
    minZoom,
    position,
    renderedBounds,
    renderedSize,
    rotation,
    zoom
  ]);

  useEffect(() => {
    if (!imageSize.width || !imageSize.height) {
      return;
    }

    setPosition((currentPosition) =>
      clampPosition(currentPosition, renderedBounds, cropSize)
    );
  }, [cropSize, imageSize.height, imageSize.width, renderedBounds, rotation]);

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
      const local = rotatePointerDelta(deltaX, deltaY, rotation);

      setSafePosition({
        x: dragState.position.x + local.x,
        y: dragState.position.y + local.y
      });
    },
    [rotation, setSafePosition]
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
