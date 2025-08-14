# PDFusion

Cross platform PDF reader and writer built with Electron, React, TypeScript, PDF.js for rendering, and pdf-lib for writing.

## ✨ Key Features

### 🎯 Smart User Interface
- **Collapsible Toolbar System**: Space-efficient design that maximizes reading area
  - Auto-hide after 3 seconds of inactivity
  - Hover to expand with smooth animations
  - Compact tab with selected page counter
- **Smart Page Selection**: Intuitive thumbnail-based selection system
  - Individual checkboxes on page thumbnails
  - Visual selection indicators with green highlighting
  - "Select All" and "Clear Selection" controls
  - Real-time selection counter

### 📄 PDF Operations
- **Viewing**: Zoom, pan, and navigation with page thumbnails
- **Text Features**: Search with highlight preview, add text boxes
- **Page Management**: 
  - Smart rotation for selected pages or current page
  - Extract pages with visual selection
  - Merge PDFs and insert blank pages
- **Advanced Tools**:
  - OCR text extraction with Tesseract.js
  - Graphical signature placement from PNG/JPEG
  - Content redaction by rasterization
  - Ink drawing and highlighting capabilities

### 🎨 Modern Design
- Professional glassmorphism UI with backdrop blur effects
- Organized tool groups (View, Edit, Pages, Process, Advanced)
- Professional SVG icons with visual feedback
- Responsive design optimized for document reading

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


# PDFusion

PDFusion is a modern PDF management and editing tool built with Electron, React, and TypeScript. It provides features such as PDF viewing, annotation, OCR, redaction, and digital signatures in a user-friendly interface.

## Features
- PDF viewing and navigation
- Search and text selection
- OCR (Optical Character Recognition)
- Redaction tools
- Digital signatures
- Thumbnail and sidebar navigation
- Customizable toolbar

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm or yarn

### Installation
```sh
npm install
```

### Running the App
```sh
npm run dev
```

### Building for Production
```sh
npm run build
```

## Versioning
This project uses [Semantic Versioning](https://semver.org/). Version information is maintained in `package.json` and all changes are tracked in [CHANGELOG.md](CHANGELOG.md).

## Security

If you discover a security vulnerability, please report it by opening an issue on GitHub or contacting the maintainers directly. Do not disclose security issues publicly until they have been addressed. See [SECURITY.md](SECURITY.md) for more details.

## License
This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
