
# Changelog

All notable changes to PDFusion will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-15

### Added
- **High-Performance Continuous Mode**: Optimized PDF viewing with advanced memory management
  - Intersection Observer API for efficient page visibility detection
  - Automatic cleanup of off-screen pages to prevent memory leaks
  - Smart render queue with concurrency limits
  - Throttled scroll events for smooth performance
- **Enhanced Text Selection**: Full text selection support across PDF pages
  - Transparent text overlays for native text selection
  - Copy to clipboard functionality
  - Proper z-index management to prevent interference
- **Adobe-Style Interface**: Professional toolbar system
  - Clean main toolbar for file operations (Open, Save, Save As, Print)
  - Vertical tools panel with drawing and annotation tools
  - Collapsible navigation panel (collapsed by default)
  - Removed redundant page overlays for cleaner UI
- **Optimized Rendering Engine**: Improved PDF rendering performance
  - Capped device pixel ratio for better performance
  - Disabled non-essential rendering features for speed
  - Smart canvas management with proper cleanup
  - Memory-efficient page loading and unloading

### Improved
- **User Experience**: Eliminated slow rendering and blank pages in continuous mode
- **Memory Management**: Automatic cleanup prevents browser memory issues
- **Visual Design**: Removed unnecessary overlays, focus on content
- **Performance**: 60+ FPS scrolling with optimized render cycles

### Fixed
- **Continuous Mode**: Resolved slow rendering and blank page issues
- **Text Selection**: Fixed text selection interference from overlays
- **Memory Leaks**: Proper cleanup of render tasks and canvas contexts
- **UI Conflicts**: Resolved z-index conflicts between overlays

### Removed
- **Page Number Overlays**: Cleaned up visual clutter (relies on thumbnail strip)
- **Unused Files**: Removed AppNew.tsx and legacy Toolbar.tsx
- **Drawing Overlays**: Simplified continuous mode by removing complex overlays

## [0.3.0] - 2025-08-14

### Added
- **Collapsible PDF Tools Toolbar**: Smart auto-hide toolbar that maximizes reading space
- **Smart Page Selection System**: Enhanced thumbnail-based page selection
- **Enhanced PDF Operations**: Comprehensive PDF manipulation tools
- **OCR text extraction capabilities**
- **PDF signature functionality**

### Improved
- **User Experience**: Space-efficient toolbar design
- **Visual Feedback**: Clear selection states and operation indicators

### Changed
- Replaced complex PageSelector toolbar with intuitive thumbnail checkboxes
- Simplified toolbar interface with collapsible design

## [0.2.0] - 2025-08-13

### Added
- Modern glassmorphism UI with backdrop blur effects
- Professional PDF viewer with thumbnail navigation
- Comprehensive toolbar system
