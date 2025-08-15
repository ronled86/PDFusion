# PDFusion Test Suite

This directory contains testing resources and validation materials for PDFusion.

## 📁 Directory Structure

```
tests/
├── README.md                          # This file
└── documents/                         # Test PDF documents
    ├── test-document-comprehensive.pdf # 10-page feature test document
    └── test-document-large.pdf        # 50-page performance test document
```

## 🧪 Test Documents

The test documents in `documents/` are generated automatically by scripts in the `scripts/` directory:

- **Comprehensive Test** (10 pages): Complete feature validation
- **Large Test** (50 pages): Performance and memory stress testing

## 🛠️ Generating Test Documents

From the project root:

```bash
# Generate comprehensive test document
node scripts/generate-test-pdf.js

# Generate large stress test document  
node scripts/generate-large-test-pdf.js
```

## 📖 Testing Documentation

For detailed testing procedures and guidelines, see:
- [Testing Guide](../docs/TEST_DOCUMENTS.md) - Complete testing documentation

## ⚠️ Note

Test documents are automatically generated and should not be manually edited. They are excluded from git tracking via `.gitignore` to avoid repository bloat.
