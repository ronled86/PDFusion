import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFileSync } from 'fs';
import path from 'path';

async function generateTestPDF() {
  console.log('🔄 Generating comprehensive test PDF...');
  
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

  // Page 1: Title Page with Large Text
  console.log('📄 Creating Page 1: Title Page');
  const page1 = pdfDoc.addPage([612, 792]); // Standard letter size
  const { width, height } = page1.getSize();
  
  page1.drawText('PDFusion Test Document', {
    x: 50,
    y: height - 100,
    size: 36,
    font: helveticaBoldFont,
    color: rgb(0, 0.2, 0.8),
  });
  
  page1.drawText('Comprehensive Rendering Test', {
    x: 50,
    y: height - 150,
    size: 24,
    font: helveticaFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page1.drawText('Version 1.0.0', {
    x: 50,
    y: height - 200,
    size: 18,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Add some decorative rectangles
  page1.drawRectangle({
    x: 50,
    y: height - 250,
    width: 500,
    height: 3,
    color: rgb(0, 0.2, 0.8),
  });
  
  page1.drawText('This document contains multiple pages with various content types\nto test PDF rendering performance, text selection, and scrolling.', {
    x: 50,
    y: height - 300,
    size: 14,
    font: helveticaFont,
    color: rgb(0, 0, 0),
    lineHeight: 20,
  });
  
  // Add test instructions
  const instructions = [
    '• Test continuous mode scrolling',
    '• Test page-by-page navigation', 
    '• Test text selection on different fonts',
    '• Test zoom controls (Ctrl + Mouse Wheel)',
    '• Test memory usage with large documents',
    '• Test drawing and highlighting tools',
    '• Test thumbnail navigation'
  ];
  
  let yPos = height - 380;
  page1.drawText('Test Instructions:', {
    x: 50,
    y: yPos,
    size: 16,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  yPos -= 30;
  for (const instruction of instructions) {
    page1.drawText(instruction, {
      x: 70,
      y: yPos,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;
  }

  // Page 2: Lorem Ipsum with Multiple Fonts
  console.log('📄 Creating Page 2: Text Content');
  const page2 = pdfDoc.addPage([612, 792]);
  
  page2.drawText('Page 2: Text Rendering Test', {
    x: 50,
    y: height - 50,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  const loremText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`;

  // Draw text in chunks to fit on page
  const lines = loremText.split('\n');
  let textY = height - 100;
  
  for (const line of lines) {
    if (textY < 100) break; // Don't go too close to bottom
    
    const words = line.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = helveticaFont.widthOfTextAtSize(testLine, 12);
      
      if (textWidth > 500 && currentLine) {
        // Draw current line and start new one
        page2.drawText(currentLine, {
          x: 50,
          y: textY,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        textY -= 18;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    // Draw remaining text
    if (currentLine) {
      page2.drawText(currentLine, {
        x: 50,
        y: textY,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      textY -= 24; // Extra space between paragraphs
    }
  }

  // Page 3: Different Font Styles
  console.log('📄 Creating Page 3: Font Styles');
  const page3 = pdfDoc.addPage([612, 792]);
  
  page3.drawText('Page 3: Font and Style Tests', {
    x: 50,
    y: height - 50,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  const fontTests = [
    { text: 'Helvetica Regular Font - Standard readability test', font: helveticaFont, size: 14 },
    { text: 'Helvetica Bold Font - Bold text rendering test', font: helveticaBoldFont, size: 14 },
    { text: 'Times Roman Font - Serif font rendering test', font: timesRomanFont, size: 14 },
    { text: 'Courier Font - Monospace font rendering test', font: courierFont, size: 14 },
    { text: 'Large Text Size Test - 24pt', font: helveticaFont, size: 24 },
    { text: 'Small Text Size Test - 8pt', font: helveticaFont, size: 8 },
  ];
  
  let fontY = height - 100;
  for (const test of fontTests) {
    page3.drawText(test.text, {
      x: 50,
      y: fontY,
      size: test.size,
      font: test.font,
      color: rgb(0, 0, 0),
    });
    fontY -= test.size + 15;
  }
  
  // Add colored text
  const colors = [
    { text: 'Red Text Color Test', color: rgb(1, 0, 0) },
    { text: 'Green Text Color Test', color: rgb(0, 1, 0) },
    { text: 'Blue Text Color Test', color: rgb(0, 0, 1) },
    { text: 'Purple Text Color Test', color: rgb(0.5, 0, 0.5) },
    { text: 'Orange Text Color Test', color: rgb(1, 0.5, 0) },
  ];
  
  fontY -= 30;
  page3.drawText('Color Tests:', {
    x: 50,
    y: fontY,
    size: 16,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  fontY -= 30;
  for (const colorTest of colors) {
    page3.drawText(colorTest.text, {
      x: 50,
      y: fontY,
      size: 12,
      font: helveticaFont,
      color: colorTest.color,
    });
    fontY -= 20;
  }

  // Page 4: Shapes and Graphics
  console.log('📄 Creating Page 4: Graphics');
  const page4 = pdfDoc.addPage([612, 792]);
  
  page4.drawText('Page 4: Graphics and Shapes Test', {
    x: 50,
    y: height - 50,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  // Draw various shapes
  page4.drawRectangle({
    x: 50,
    y: height - 150,
    width: 100,
    height: 60,
    color: rgb(1, 0, 0),
  });
  
  page4.drawRectangle({
    x: 170,
    y: height - 150,
    width: 100,
    height: 60,
    borderColor: rgb(0, 1, 0),
    borderWidth: 3,
  });
  
  page4.drawCircle({
    x: 320,
    y: height - 120,
    size: 30,
    color: rgb(0, 0, 1),
  });
  
  page4.drawEllipse({
    x: 420,
    y: height - 120,
    xScale: 50,
    yScale: 30,
    color: rgb(1, 1, 0),
  });
  
  // Add labels for shapes
  page4.drawText('Filled Rectangle', {
    x: 50,
    y: height - 170,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page4.drawText('Outlined Rectangle', {
    x: 170,
    y: height - 170,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page4.drawText('Circle', {
    x: 300,
    y: height - 170,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  
  page4.drawText('Ellipse', {
    x: 400,
    y: height - 170,
    size: 10,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // Page 5: Dense Text for Performance Testing
  console.log('📄 Creating Page 5: Dense Text');
  const page5 = pdfDoc.addPage([612, 792]);
  
  page5.drawText('Page 5: Dense Text Performance Test', {
    x: 50,
    y: height - 50,
    size: 16,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });
  
  // Generate lots of text for performance testing
  const denseText = 'This is line number ';
  let denseY = height - 100;
  let lineNumber = 1;
  
  while (denseY > 50) {
    page5.drawText(`${denseText}${lineNumber} - Testing continuous mode rendering performance with dense text content.`, {
      x: 50,
      y: denseY,
      size: 9,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    denseY -= 12;
    lineNumber++;
  }

  // Pages 6-10: Additional pages for continuous mode testing
  for (let pageNum = 6; pageNum <= 10; pageNum++) {
    console.log(`📄 Creating Page ${pageNum}: Content Variation`);
    const page = pdfDoc.addPage([612, 792]);
    
    page.drawText(`Page ${pageNum}: Continuous Mode Test`, {
      x: 50,
      y: height - 50,
      size: 18,
      font: helveticaBoldFont,
      color: rgb(0.1 * pageNum, 0, 0.8),
    });
    
    // Add varied content for each page
    const content = [
      'This page tests continuous scrolling performance.',
      'Each page has unique content to test memory management.',
      'Text selection should work consistently across all pages.',
      'Zoom controls should maintain quality at different scales.',
      '',
      'Lorem ipsum content for this specific page:',
    ];
    
    let contentY = height - 100;
    for (const line of content) {
      page.drawText(line, {
        x: 50,
        y: contentY,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      contentY -= 20;
    }
    
    // Add page-specific numbered content
    for (let i = 1; i <= 25; i++) {
      page.drawText(`Page ${pageNum}, Line ${i}: This is test content for rendering validation.`, {
        x: 50,
        y: contentY,
        size: 10,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      contentY -= 15;
      
      if (contentY < 50) break;
    }
    
    // Add page number at bottom
    page.drawText(`--- Page ${pageNum} of 10 ---`, {
      x: width / 2 - 50,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), 'test-document-comprehensive.pdf');
  
  writeFileSync(outputPath, pdfBytes);
  console.log(`✅ Generated comprehensive test PDF: ${outputPath}`);
  console.log(`📊 Document stats: 10 pages, ${Math.round(pdfBytes.length / 1024)}KB`);
  
  return outputPath;
}

// Run the generator
generateTestPDF().catch(console.error);
