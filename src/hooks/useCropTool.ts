import { useState, useRef, useCallback, useEffect } from "react";

export type AspectRatioPreset = {
  label: string;
  value: number | null;
  icon: string;
};

export type CropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DragHandle =
  | "nw" | "n" | "ne"
  | "w"  |        "e"
  | "sw" | "s" | "se"
  | "move"
  | null;

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  { label: "Free",    value: null,      icon: "⊞" },
  { label: "1:1",     value: 1,         icon: "□" },
  { label: "4:3",     value: 4 / 3,     icon: "▭" },
  { label: "16:9",    value: 16 / 9,    icon: "▬" },
  { label: "3:2",     value: 3 / 2,     icon: "▭" },
  { label: "2:3",     value: 2 / 3,     icon: "▯" },
  { label: "9:16",    value: 9 / 16,    icon: "▯" },
  { label: "3:4",     value: 3 / 4,     icon: "▯" },
];

const MIN_CROP_SIZE = 30;

export function useCropTool(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropBox, setCropBox] = useState<CropBox>({ x: 50, y: 50, width: 300, height: 200 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, cropBox: cropBox });

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const getContainerRect = useCallback(() => {
    return containerRef.current?.getBoundingClientRect() ?? { width: 600, height: 400, left: 0, top: 0 };
  }, [containerRef]);

  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent, handle: DragHandle) => {
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragStartRef.current = {
        mouseX: clientX,
        mouseY: clientY,
        cropBox: { ...cropBox },
      };
      setActiveHandle(handle);
      setIsDragging(true);
    },
    [cropBox]
  );

  const constrainCropBox = useCallback(
    (box: CropBox, containerW: number, containerH: number, ar: number | null): CropBox => {
      let { x, y, width, height } = box;

      width = clamp(width, MIN_CROP_SIZE, containerW);
      height = clamp(height, MIN_CROP_SIZE, containerH);

      if (ar !== null) {
        // enforce aspect ratio
        if (width / height > ar) {
          width = height * ar;
        } else {
          height = width / ar;
        }
        width = clamp(width, MIN_CROP_SIZE, containerW);
        height = clamp(height, MIN_CROP_SIZE, containerH);
      }

      x = clamp(x, 0, containerW - width);
      y = clamp(y, 0, containerH - height);

      return { x, y, width, height };
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - dragStartRef.current.mouseX;
      const dy = clientY - dragStartRef.current.mouseY;
      const start = dragStartRef.current.cropBox;
      const rect = getContainerRect();
      const W = rect.width;
      const H = rect.height;

      let newBox = { ...start };

      switch (activeHandle) {
        case "move": {
          newBox.x = start.x + dx;
          newBox.y = start.y + dy;
          break;
        }
        case "nw": {
          newBox.x = start.x + dx;
          newBox.y = start.y + dy;
          newBox.width = start.width - dx;
          newBox.height = start.height - dy;
          break;
        }
        case "n": {
          newBox.y = start.y + dy;
          newBox.height = start.height - dy;
          break;
        }
        case "ne": {
          newBox.y = start.y + dy;
          newBox.width = start.width + dx;
          newBox.height = start.height - dy;
          break;
        }
        case "e": {
          newBox.width = start.width + dx;
          break;
        }
        case "se": {
          newBox.width = start.width + dx;
          newBox.height = start.height + dy;
          break;
        }
        case "s": {
          newBox.height = start.height + dy;
          break;
        }
        case "sw": {
          newBox.x = start.x + dx;
          newBox.width = start.width - dx;
          newBox.height = start.height + dy;
          break;
        }
        case "w": {
          newBox.x = start.x + dx;
          newBox.width = start.width - dx;
          break;
        }
      }

      setCropBox(constrainCropBox(newBox, W, H, aspectRatio));
    };

    const onUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, activeHandle, aspectRatio, constrainCropBox, getContainerRect]);

  const setAspectRatioPreset = useCallback(
    (ar: number | null) => {
      setAspectRatio(ar);
      if (ar !== null) {
        const rect = getContainerRect();
        setCropBox((prev) => constrainCropBox({ ...prev }, rect.width, rect.height, ar));
      }
    },
    [constrainCropBox, getContainerRect]
  );

  const resetCrop = useCallback(() => {
    const rect = getContainerRect();
    const W = rect.width;
    const H = rect.height;
    const margin = 40;
    let w = W - margin * 2;
    let h = H - margin * 2;
    if (aspectRatio !== null) {
      if (w / h > aspectRatio) w = h * aspectRatio;
      else h = w / aspectRatio;
    }
    setCropBox({ x: (W - w) / 2, y: (H - h) / 2, width: w, height: h });
  }, [aspectRatio, getContainerRect]);

  return {
    zoom, setZoom,
    rotation, setRotation,
    cropBox, setCropBox,
    aspectRatio,
    setAspectRatioPreset,
    startDrag,
    isDragging,
    activeHandle,
    resetCrop,
  };
}
