import { useRef, useEffect, useCallback, useState } from "react";
import CropCanvas from "./components/CropCanvas";
import Toolbar from "./components/Toolbar";
import PreviewPane from "./components/PreviewPane";
import { useCropTool } from "./hooks/useCropTool";

const IMAGE_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    zoom, setZoom,
    rotation, setRotation,
    cropBox,
    aspectRatio,
    setAspectRatioPreset,
    startDrag,
    isDragging,
    activeHandle,
    resetCrop,
  } = useCropTool(containerRef);

  // Initialize crop once container is measured
  useEffect(() => {
    if (!ready) return;
    resetCrop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Mark ready after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleDownload = useCallback(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = IMAGE_URL;
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerW = container.clientWidth;
      const containerH = container.clientHeight;

      const imgNaturalW = img.naturalWidth;
      const imgNaturalH = img.naturalHeight;

      const scaleX = containerW / imgNaturalW;
      const scaleY = containerH / imgNaturalH;
      const fitScale = Math.min(scaleX, scaleY);

      const dispW = imgNaturalW * fitScale * zoom;
      const dispH = imgNaturalH * fitScale * zoom;

      const offsetX = (containerW - dispW) / 2;
      const offsetY = (containerH - dispH) / 2;

      const cropInImgX = (cropBox.x - offsetX) / dispW;
      const cropInImgY = (cropBox.y - offsetY) / dispH;
      const cropInImgW = cropBox.width / dispW;
      const cropInImgH = cropBox.height / dispH;

      const srcX = Math.max(0, cropInImgX * imgNaturalW);
      const srcY = Math.max(0, cropInImgY * imgNaturalH);
      const srcW = Math.min(imgNaturalW - srcX, cropInImgW * imgNaturalW);
      const srcH = Math.min(imgNaturalH - srcY, cropInImgH * imgNaturalH);

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(srcW);
      canvas.height = Math.round(srcH);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (rotation !== 0) {
        const diag = Math.sqrt(srcW * srcW + srcH * srcH);
        canvas.width = Math.round(diag);
        canvas.height = Math.round(diag);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, srcX, srcY, srcW, srcH, -srcW / 2, -srcH / 2, srcW, srcH);
      } else {
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cropped-image.png";
        a.click();
        URL.revokeObjectURL(url);
        showToast("✅ Cropped image downloaded!");
      }, "image/png");
    };
    img.onerror = () => showToast("⚠️ Could not export — try a local image.");
  }, [cropBox, zoom, rotation]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d1a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/30">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" />
              <path d="m16 10-4 4-4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">CropStudio</h1>
            <p className="text-[10px] text-slate-500">Professional Image Cropping Tool</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-400">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Abstract Sample
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar – controls */}
        <aside className="flex w-64 flex-shrink-0 flex-col gap-6 overflow-y-auto border-r border-slate-800 bg-[#111120] p-5">
          <Toolbar
            zoom={zoom}
            setZoom={setZoom}
            rotation={rotation}
            setRotation={setRotation}
            aspectRatio={aspectRatio}
            setAspectRatioPreset={setAspectRatioPreset}
            resetCrop={resetCrop}
            onDownload={handleDownload}
          />
        </aside>

        {/* Center – crop canvas */}
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-6">
          {/* Zoom quick controls */}
          <div className="absolute right-4 top-4 z-30 flex flex-col gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 p-1.5 shadow-xl backdrop-blur">
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Zoom In"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35M11 8v6M8 11h6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="mx-auto h-px w-5 bg-slate-700" />
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Zoom Out"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35M8 11h6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="mx-auto h-px w-5 bg-slate-700" />
            <button
              onClick={() => setZoom(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-slate-400 transition hover:bg-slate-700 hover:text-white"
              title="Reset Zoom"
            >
              1×
            </button>
          </div>

          {/* Rotation quick controls */}
          <div className="absolute left-4 top-4 z-30 flex gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 p-1.5 shadow-xl backdrop-blur">
            <button
              onClick={() => setRotation(Math.max(-180, rotation - 15))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Rotate −15°"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M2.5 2v6h6M2.5 8A9.5 9.5 0 1 1 5 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex items-center px-1 text-[11px] font-mono font-bold text-blue-400 min-w-[40px] justify-center">
              {rotation}°
            </div>
            <button
              onClick={() => setRotation(Math.min(180, rotation + 15))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="Rotate +15°"
            >
              <svg className="h-4 w-4 scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M2.5 2v6h6M2.5 8A9.5 9.5 0 1 1 5 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Canvas area */}
          <div
            className="relative w-full"
            style={{ maxWidth: 800, height: "min(calc(100vh - 200px), 560px)" }}
          >
            {ready && (
              <CropCanvas
                imageUrl={IMAGE_URL}
                zoom={zoom}
                rotation={rotation}
                cropBox={cropBox}
                startDrag={startDrag}
                isDragging={isDragging}
                activeHandle={activeHandle}
                containerRef={containerRef}
              />
            )}
          </div>

          {/* Keyboard hint */}
          <p className="mt-3 text-center text-[11px] text-slate-600">
            Drag the crop box to reposition · Drag handles to resize · Use sliders to zoom &amp; rotate
          </p>
        </main>

        {/* Right sidebar – preview */}
        <aside className="flex w-64 flex-shrink-0 flex-col gap-4 overflow-y-auto border-l border-slate-800 bg-[#111120] p-5">
          {ready && (
            <PreviewPane
              imageUrl={IMAGE_URL}
              cropBox={cropBox}
              zoom={zoom}
              rotation={rotation}
              containerRef={containerRef}
            />
          )}

          {/* Crop info */}
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Crop Info
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {[
                { label: "X Position", value: `${Math.round(cropBox.x)}px` },
                { label: "Y Position", value: `${Math.round(cropBox.y)}px` },
                { label: "Zoom", value: `${zoom.toFixed(2)}×` },
                { label: "Rotation", value: `${rotation}°` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-md bg-slate-800/40 px-2.5 py-1.5">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-mono font-semibold text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-auto rounded-xl border border-slate-700/50 bg-slate-800/30 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tips</p>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500">◆</span>
                Drag corner handles to resize freely
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-violet-500">◆</span>
                Lock aspect ratio with presets
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500">◆</span>
                Rule-of-thirds grid guides composition
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500">◆</span>
                Export downloads a real PNG file
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-slate-600 bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
