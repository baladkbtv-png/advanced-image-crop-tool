# CropStudio – Advanced Image Crop Tool

A professional, modern image cropping tool built with **React 19**, **Vite**, and **Tailwind CSS**.

![CropStudio](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=60)

## Features

- 🖱️ Drag to move the crop box
- 🔲 8 resize handles (corners + edges)
- 📐 Aspect ratio presets (Free, 1:1, 4:3, 16:9, 3:2, 2:3, 9:16, 3:4)
- 🔍 Zoom (0.5× – 3×)
- 🔄 Rotation (−180° to +180°)
- 📏 Rule-of-thirds grid overlay
- 👁️ Live preview pane
- 💾 Export cropped image as PNG
- 📱 Touch support

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production (Single File)

This project uses `vite-plugin-singlefile` so the production build produces **one self-contained HTML file**.

```bash
npm run build
```

The output will be in `dist/index.html` – perfect for GitHub Pages or any static host.

## Deploy to GitHub Pages

1. Run `npm run build`
2. Create a `gh-pages` branch (or use the `docs/` folder)
3. Copy the contents of `dist/` into the root of that branch / folder
4. In repository **Settings → Pages**, set the source to the `gh-pages` branch (or `/docs`)

Alternatively, after building you can just open `dist/index.html` locally.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- vite-plugin-singlefile

## License

MIT
