# PDFusion

A modern, high-performance PDF viewer and editor built with React, TypeScript, and Electron. PDFusion combines the power of Adobe-style interface design with cutting-edge web technologies to deliver a seamless PDF experience.

![PDFusion](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)
![Electron](https://img.shields.io/badge/electron-31.3.1-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## ✨ Features

### 🎨 Modern Interface
- **Adobe-style UI** with glassmorphism design
- **Responsive toolbar** with intelligent tool grouping
- **Smooth animations** and micro-interactions
- **Dark/light theme** support

### 📄 PDF Capabilities
- **High-performance rendering** with PDF.js
- **Continuous & page-by-page viewing** modes
- **Advanced zoom controls** with fit-to-width/height
- **Text selection & search** functionality
- **Thumbnail navigation** with quick preview

### ⚡ Performance
- **Optimized continuous mode** with Intersection Observer API
- **Memory management** with automatic cleanup
- **Lazy loading** for large documents
- **Smooth scrolling** at 60fps

### 🛠️ Editing Tools
- **Text highlighting** and annotations
- **Drawing tools** with multiple colors
- **Page rotation** and manipulation
- **OCR text extraction** (Tesseract.js)
- **Digital signatures** support

### 💾 File Operations
- **Save/Save As** functionality
- **Print support** (native & browser)
- **Export capabilities**
- **Drag & drop** file loading

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Electron app in development
npm run start
```

### Production Build
```bash
# Build for production
npm run build

# Build Electron distributables
npm run electron:build
```

## 📚 Documentation

- [📖 Architecture Guide](docs/ARCHITECTURE.md) - System design and component structure
- [🔧 Development Guide](docs/DEVELOPMENT.md) - Setup and development workflow  
- [📋 API Reference](docs/API.md) - Component APIs and interfaces
- [🔄 Migration Guide](docs/MIGRATION.md) - Upgrade and migration instructions
- [📊 Module Index](docs/MODULE_INDEX.md) - Complete module documentation

## 🧪 Testing

Test documents and validation tools are available in the `tests/` directory:

```bash
# Generate test documents
node scripts/generate-test-pdf.js        # 10-page comprehensive test
node scripts/generate-large-test-pdf.js  # 50-page stress test
```

See [Testing Documentation](docs/TEST_DOCUMENTS.md) for detailed testing guidelines.

## 🛡️ Security

PDFusion follows security best practices:
- ✅ Secure Electron configuration with context isolation
- ✅ No hardcoded credentials or API keys
- ✅ Regular dependency security audits
- ✅ Input validation and sanitization

For security reports, see our [Security Policy](SECURITY.md).

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and version history.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🎯 Project Status

**Current Version**: 1.0.0 (Stable Release)
- ✅ Core PDF viewing functionality
- ✅ Modern UI with glassmorphism design
- ✅ Performance optimizations complete
- ✅ Security audit passed
- ✅ Production ready

---

**Built with ❤️ using React, TypeScript, and Electron**