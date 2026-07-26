import React from "react";
import type { CropBox, DragHandle } from "../hooks/useCropTool";

type Props = {
  imageUrl: string;
  zoom: number;
  rotation: number;
  cropBox: CropBox;
  startDrag: (e: React.MouseEvent | React.TouchEvent, handle: DragHandle) => void;
  isDragging: boolean;
  activeHandle: DragHandle;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

const HANDLE_SIZE = 10;

const handles: { id: DragHandle; cx: (b: CropBox) => number; cy: (b: CropBox) => number; cursor: string }[] = [
  { id: "nw", cx: (b) => b.x,              cy: (b) => b.y,               cursor: "nw-resize" },
  { id: "n",  cx: (b) => b.x + b.width/2,  cy: (b) => b.y,               cursor: "n-resize"  },
  { id: "ne", cx: (b) => b.x + b.width,    cy: (b) => b.y,               cursor: "ne-resize" },
  { id: "e",  cx: (b) => b.x + b.width,    cy: (b) => b.y + b.height/2,  cursor: "e-resize"  },
  { id: "se", cx: (b) => b.x + b.width,    cy: (b) => b.y + b.height,    cursor: "se-resize" },
  { id: "s",  cx: (b) => b.x + b.width/2,  cy: (b) => b.y + b.height,    cursor: "s-resize"  },
  { id: "sw", cx: (b) => b.x,              cy: (b) => b.y + b.height,    cursor: "sw-resize" },
  { id: "w",  cx: (b) => b.x,              cy: (b) => b.y + b.height/2,  cursor: "w-resize"  },
];

export default function CropCanvas({
  imageUrl, zoom, rotation, cropBox, startDrag, isDragging, containerRef,
}: Props) {
  const { x, y, width, height } = cropBox;

  const containerW = containerRef.current?.clientWidth ?? 600;
  const containerH = containerRef.current?.clientHeight ?? 400;

  // Rule-of-thirds lines
  const thirds = [
    { x1: x + width / 3,     y1: y, x2: x + width / 3,     y2: y + height },
    { x1: x + (width * 2)/3, y1: y, x2: x + (width * 2)/3, y2: y + height },
    { x1: x, y1: y + height / 3,     x2: x + width, y2: y + height / 3     },
    { x1: x, y1: y + (height * 2)/3, x2: x + width, y2: y + (height * 2)/3 },
  ];

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl bg-[#0f0f1a] select-none"
      style={{ width: "100%", height: "100%", minHeight: 360 }}
    >
      {/* Image layer */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <img
          src={imageUrl}
          alt="Source"
          draggable={false}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </div>

      {/* Dark overlay SVG */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={containerW}
        height={containerH}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <mask id="crop-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={x} y={y} width={width} height={height} fill="black" />
          </mask>
        </defs>
        {/* Darkened area outside crop */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#crop-mask)"
        />
        {/* Rule-of-thirds lines */}
        {thirds.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        {/* Crop border */}
        <rect
          x={x} y={y} width={width} height={height}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
        {/* Corner accents */}
        {[
          { cx: x,         cy: y,          d: "M0,16 L0,0 L16,0" },
          { cx: x+width,   cy: y,          d: "M-16,0 L0,0 L0,16" },
          { cx: x,         cy: y+height,   d: "M0,-16 L0,0 L16,0" },
          { cx: x+width,   cy: y+height,   d: "M-16,0 L0,0 L0,-16" },
        ].map((corner, i) => (
          <path
            key={i}
            d={corner.d}
            transform={`translate(${corner.cx},${corner.cy})`}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Move handle (over crop area) */}
      <div
        className="absolute"
        style={{
          left: x, top: y, width, height,
          cursor: isDragging ? "grabbing" : "grab",
          zIndex: 10,
        }}
        onMouseDown={(e) => startDrag(e, "move")}
        onTouchStart={(e) => startDrag(e, "move")}
      />

      {/* Resize handles */}
      {handles.map((h) => (
        <div
          key={h.id as string}
          className="absolute z-20 rounded-full border-2 border-blue-400 bg-white shadow-md"
          style={{
            width: HANDLE_SIZE * 2,
            height: HANDLE_SIZE * 2,
            left: h.cx(cropBox) - HANDLE_SIZE,
            top: h.cy(cropBox) - HANDLE_SIZE,
            cursor: h.cursor,
            boxShadow: "0 0 0 2px rgba(96,165,250,0.5)",
          }}
          onMouseDown={(e) => startDrag(e, h.id)}
          onTouchStart={(e) => startDrag(e, h.id)}
        />
      ))}
    </div>
  );
}
