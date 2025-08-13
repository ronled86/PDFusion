# PDF Studio

Cross platform PDF reader and writer built with Electron, React, TypeScript, PDF.js for rendering, and pdf-lib for writing.

## Features

- Viewing with zoom and pan
- Page thumbnails and navigation
- Text search with highlight preview
- Ink drawing, add text boxes, highlight by query
- Merge PDFs, extract pages, rotate
- Create a new blank PDF, insert blank pages
- Save and print

## New features

- OCR per page with Tesseract.js, adds an invisible text layer for search
- Graphical signature placement from PNG/JPEG
- Redaction by rasterization: replace a page with a flat image after drawing black boxes

### Usage

- OCR Page: open a PDF page, click "OCR Page".
- Add Signature: click "Add Signature", choose an image, it will be placed near the bottom left.
- Redact Box: click "Redact Box", enter x,y,w,h in PDF coordinates, points.

## Quick start

```bash
npm install
npm run start
```

## Build desktop app

```bash
npm run electron:build
```

Artifacts will be created for your platform, you can extend electron-builder config in `package.json`.

## License

MIT
