import React from "react";
import { ASPECT_RATIO_PRESETS } from "../hooks/useCropTool";

type Props = {
  zoom: number;
  setZoom: (z: number) => void;
  rotation: number;
  setRotation: (r: number) => void;
  aspectRatio: number | null;
  setAspectRatioPreset: (ar: number | null) => void;
  resetCrop: () => void;
  onDownload: () => void;
};

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  icon,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono text-xs font-semibold text-blue-400">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-blue-400"
      />
      <div className="flex justify-between text-[10px] text-slate-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function Toolbar({
  zoom, setZoom,
  rotation, setRotation,
  aspectRatio, setAspectRatioPreset,
  resetCrop,
  onDownload,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Aspect Ratio */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Aspect Ratio
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {ASPECT_RATIO_PRESETS.map((preset) => {
            const isActive =
              (preset.value === null && aspectRatio === null) ||
              (preset.value !== null && Math.abs((aspectRatio ?? -1) - preset.value) < 0.01);
            return (
              <button
                key={preset.label}
                onClick={() => setAspectRatioPreset(preset.value)}
                className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition-all duration-150 ${
                  isActive
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                <span className="text-base leading-none">{preset.icon}</span>
                <span className="mt-1 text-[10px] font-semibold">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-700/60" />

      {/* Zoom */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Transform
          </span>
        </div>
        <SliderInput
          label="Zoom"
          value={zoom}
          min={0.5}
          max={3}
          step={0.05}
          onChange={setZoom}
          display={`${zoom.toFixed(2)}×`}
          icon={
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35M11 8v6M8 11h6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />

        <SliderInput
          label="Rotation"
          value={rotation}
          min={-180}
          max={180}
          step={1}
          onChange={setRotation}
          display={`${rotation}°`}
          icon={
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      {/* Quick rotate buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setRotation(Math.max(-180, rotation - 90))}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M2.5 2v6h6M2.5 8C4 4.7 7.3 2.5 11 2.5a8.5 8.5 0 0 1 0 17A8.5 8.5 0 0 1 3.8 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          −90°
        </button>
        <button
          onClick={() => setRotation(0)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          Reset
        </button>
        <button
          onClick={() => setRotation(Math.min(180, rotation + 90))}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          <svg className="h-3.5 w-3.5 scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M2.5 2v6h6M2.5 8C4 4.7 7.3 2.5 11 2.5a8.5 8.5 0 0 1 0 17A8.5 8.5 0 0 1 3.8 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          +90°
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-700/60" />

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={resetCrop}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-400 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 3v5h5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset Crop
        </button>
        <button
          onClick={onDownload}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Export Crop
        </button>
      </div>
    </div>
  );
}
