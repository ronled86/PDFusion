# PDFusion Test Documents

This directory contains comprehensive test PDF documents designed to validate various aspects of PDFusion's rendering engine and user interface.

## 📄 Test Documents

### 1. `tests/documents/test-document-comprehensive.pdf` (10 pages, ~11KB)
**Purpose**: Complete feature testing and validation

**Content Structure**:
- **Page 1**: Title page with test instructions
- **Page 2**: Lorem ipsum text content for readability testing
- **Page 3**: Font variety tests (Helvetica, Times, Courier) and color tests
- **Page 4**: Graphics and shapes (rectangles, circles, ellipses)
- **Page 5**: Dense text for performance testing
- **Pages 6-10**: Continuous mode testing with varied content

**Test Scenarios**:
- ✅ Text selection across different fonts and sizes
- ✅ Continuous vs page-by-page viewing modes
- ✅ Zoom controls (Ctrl + mouse wheel)
- ✅ Thumbnail navigation
- ✅ Drawing and highlighting tools
- ✅ Memory management with medium-sized documents

### 2. `tests/documents/test-document-large.pdf` (50 pages, ~76KB)
**Purpose**: Stress testing and performance validation

**Content Structure**:
- **50 pages** of structured content with proper text wrapping
- Each page contains multiple paragraphs with varied content
- Progressive color indicators for visual verification
- Page progress indicators and chapter markers
- Unique content per page for memory testing

**Test Scenarios**:
- 🚀 Continuous mode performance with large documents
- 🧠 Memory management and cleanup
- ⚡ Intersection Observer efficiency
- 📊 Render queue management
- 🔄 Page-to-page navigation speed
- 💾 Browser memory usage monitoring

## 🧪 Testing Guidelines

### Basic Testing Workflow
1. **Open Test Document**: Load `tests/documents/test-document-comprehensive.pdf`
2. **Test View Modes**: Switch between page and continuous modes
3. **Test Navigation**: Use thumbnails, arrow keys, and page controls
4. **Test Text Selection**: Try selecting text across different pages
5. **Test Zoom**: Use Ctrl+wheel to zoom in/out
6. **Test Tools**: Try drawing, highlighting, and annotation tools

### Performance Testing Workflow
1. **Load Large Document**: Open `tests/documents/test-document-large.pdf`
2. **Monitor Memory**: Check browser memory usage in dev tools
3. **Test Continuous Scrolling**: Scroll rapidly through all 50 pages
4. **Test Memory Cleanup**: Verify memory doesn't continuously increase
5. **Test Responsiveness**: Ensure UI remains responsive during operations

### Expected Results
- **✅ Smooth Scrolling**: No lag or stuttering in continuous mode
- **✅ Memory Stability**: Memory usage should stabilize, not continuously grow
- **✅ Text Selection**: Should work consistently across all pages
- **✅ Rapid Navigation**: Quick page switching without blank pages
- **✅ Visual Quality**: Sharp text and graphics at all zoom levels

## 🛠️ Regenerating Test Documents

To regenerate the test documents with updated content:

```bash
# Generate comprehensive test document (10 pages)
node scripts/generate-test-pdf.js

# Generate large stress test document (50 pages)
node scripts/generate-large-test-pdf.js
```

## 🐛 Issue Reporting

When reporting issues, please include:
- Which test document was used
- Browser/platform information  
- View mode (page vs continuous)
- Specific page numbers where issues occur
- Screenshots or screen recordings if applicable
- Browser memory usage (from dev tools)

## 📊 Performance Benchmarks

**Target Performance Metrics**:
- Initial page render: < 200ms
- Page-to-page navigation: < 100ms
- Continuous scroll frame rate: > 30fps
- Memory usage growth: < 2MB per 10 pages viewed
- Text selection response: < 50ms

These test documents provide comprehensive coverage for validating PDFusion's performance, stability, and user experience across various scenarios.
