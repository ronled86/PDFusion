import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFileSync } from 'fs';
import path from 'path';

// Helper function to wrap text properly
function wrapText(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

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
    let contentY = height - 90;
    
    // Add paragraph about the page with proper text wrapping
    const pageDescription = `This is page ${pageNum} of a 50-page stress test document. This document is designed to test continuous mode performance, memory management, and rendering stability with large documents. Each page contains varied content to ensure proper testing of the PDF viewer capabilities.`;
    
    const descriptionLines = wrapText(pageDescription, helveticaFont, 12, 500);
    for (const line of descriptionLines) {
      page.drawText(line, {
        x: 50,
        y: contentY,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      contentY -= 18;
    }
    
    contentY -= 20; // Extra space after description
    
    // Add section header
    page.drawText(`Content Section for Page ${pageNum}:`, {
      x: 50,
      y: contentY,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0.2, 0.2, 0.8),
    });
    contentY -= 30;
    
    // Add numbered paragraphs with proper spacing
    for (let para = 1; para <= 8; para++) {
      if (contentY < 120) break; // Leave space for footer
      
      const paragraphText = `Paragraph ${para} on page ${pageNum}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;
      
      const paragraphLines = wrapText(paragraphText, helveticaFont, 10, 500);
      for (const line of paragraphLines) {
        if (contentY < 120) break;
        
        page.drawText(line, {
          x: 50,
          y: contentY,
          size: 10,
          font: helveticaFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        contentY -= 14;
      }
      contentY -= 10; // Space between paragraphs
    }
    
    // Add page progress indicator
    page.drawText(`Progress: ${Math.round((pageNum / 50) * 100)}% complete`, {
      x: 50,
      y: 70,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add page number
    page.drawText(`Page ${pageNum} of 50`, {
      x: width - 150,
      y: 70,
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
    
    // Add chapter markers every 10 pages
    if (pageNum % 10 === 0) {
      const chapterNum = Math.floor(pageNum / 10);
      page.drawText(`Chapter ${chapterNum} Complete`, {
        x: 50,
        y: 30,
        size: 12,
        font: helveticaBoldFont,
        color: rgb(0.8, 0, 0.2),
      });
    }
  }
  
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), 'tests', 'documents', 'test-document-large.pdf');
  
  writeFileSync(outputPath, pdfBytes);
  console.log(`✅ Generated large test PDF: ${outputPath}`);
  console.log(`📊 Document stats: 50 pages, ${Math.round(pdfBytes.length / 1024)}KB`);
  
  return outputPath;
}

// Run the generator
generateLargeTestPDF().catch(console.error);
