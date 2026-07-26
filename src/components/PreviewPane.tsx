import React, { useEffect, useRef } from "react";
import type { CropBox } from "../hooks/useCropTool";

type Props = {
  imageUrl: string;
  cropBox: CropBox;
  zoom: number;
  rotation: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export default function PreviewPane({ imageUrl, cropBox, zoom, rotation, containerRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerW = container.clientWidth;
      const containerH = container.clientHeight;

      // The displayed image dimensions inside the container (object-fit: contain)
      const imgNaturalW = img.naturalWidth;
      const imgNaturalH = img.naturalHeight;

      const scaleX = containerW / imgNaturalW;
      const scaleY = containerH / imgNaturalH;
      const fitScale = Math.min(scaleX, scaleY);

      // Displayed image size (before zoom/rotation, positioned at center)
      const dispW = imgNaturalW * fitScale * zoom;
      const dispH = imgNaturalH * fitScale * zoom;

      const offsetX = (containerW - dispW) / 2;
      const offsetY = (containerH - dispH) / 2;

      // Crop box in image coordinates
      const cropInImgX = (cropBox.x - offsetX) / dispW;
      const cropInImgY = (cropBox.y - offsetY) / dispH;
      const cropInImgW = cropBox.width / dispW;
      const cropInImgH = cropBox.height / dispH;

      const srcX = cropInImgX * imgNaturalW;
      const srcY = cropInImgY * imgNaturalH;
      const srcW = cropInImgW * imgNaturalW;
      const srcH = cropInImgH * imgNaturalH;

      canvas.width = 240;
      canvas.height = 240 * (cropBox.height / cropBox.width);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (rotation !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
          img,
          srcX, srcY, srcW, srcH,
          -canvas.width / 2, -canvas.height / 2,
          canvas.width, canvas.height
        );
        ctx.restore();
      } else {
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      }
    };
  }, [imageUrl, cropBox, zoom, rotation, containerRef]);

  const aspectRatio = cropBox.width > 0 ? cropBox.height / cropBox.width : 1;
  const previewW = 240;
  const previewH = Math.round(previewW * aspectRatio);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Preview
        </span>
      </div>
      <div
        className="relative overflow-hidden rounded-lg border border-slate-700 bg-[#0f0f1a]"
        style={{
          width: previewW,
          height: previewH,
          maxWidth: "100%",
          maxHeight: 200,
          backgroundImage:
            "repeating-conic-gradient(#1e1e2e 0% 25%, #252535 0% 50%)",
          backgroundSize: "16px 16px",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
        <div className="rounded-md bg-slate-800/60 px-2 py-1.5">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500">Width</span>
          <span className="font-mono font-semibold text-slate-200">
            {Math.round(cropBox.width)}px
          </span>
        </div>
        <div className="rounded-md bg-slate-800/60 px-2 py-1.5">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500">Height</span>
          <span className="font-mono font-semibold text-slate-200">
            {Math.round(cropBox.height)}px
          </span>
        </div>
      </div>
    </div>
  );
}
