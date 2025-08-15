import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFileSync } from 'fs';
import path from 'path';

async function generateLargeTestPDF() {
  console.log('🔄 Generating large test PDF for stress testing...');
  
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Generate 50 pages for stress testing
  for (let pageNum = 1; pageNum <= 50; pageNum++) {
    console.log(`📄 Creating Page ${pageNum}/50`);
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    // Page header
    page.drawText(`Stress Test Page ${pageNum}`, {
      x: 50,
      y: height - 50,
      size: 18,
      font: helveticaBoldFont,
      color: rgb(0, 0.2, 0.8),
    });
    
    // Add unique content for each page
    let contentY = height - 100;
    
    // Add paragraph about the page
    const pageDescription = `This is page ${pageNum} of a 50-page stress test document. This document is designed to test continuous mode performance, memory management, and rendering stability with large documents.`;
    
    page.drawText(pageDescription, {
      x: 50,
      y: contentY,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
      maxWidth: 500,
    });
    
    contentY -= 40;
    
    // Add numbered lines for detailed testing
    for (let line = 1; line <= 40; line++) {
      if (contentY < 80) break;
      
      const lineText = `Page ${pageNum}, Line ${line}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
      
      page.drawText(lineText, {
        x: 50,
        y: contentY,
        size: 9,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2),
        maxWidth: 500,
      });
      
      contentY -= 12;
    }
    
    // Add page progress indicator
    page.drawText(`Progress: ${Math.round((pageNum / 50) * 100)}% complete`, {
      x: 50,
      y: 50,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add colored rectangle for visual variety
    const colorIntensity = (pageNum % 10) / 10;
    page.drawRectangle({
      x: 450,
      y: 30,
      width: 100,
      height: 20,
      color: rgb(colorIntensity, 0.3, 1 - colorIntensity),
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), 'test-document-large.pdf');
  
  writeFileSync(outputPath, pdfBytes);
  console.log(`✅ Generated large test PDF: ${outputPath}`);
  console.log(`📊 Document stats: 50 pages, ${Math.round(pdfBytes.length / 1024)}KB`);
  
  return outputPath;
}

// Run the generator
generateLargeTestPDF().catch(console.error);
