import React, { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';

interface TextLayerProps {
  page: pdfjs.PDFPageProxy;
  viewport: pdfjs.PageViewport;
}

export const TextLayer: React.FC<TextLayerProps> = ({ page, viewport }) => {
  const textLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!page || !viewport || !textLayerRef.current) return;

    const renderTextLayer = async () => {
      try {
        // Clear previous text layer
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
        }

        // Get text content
        const textContent = await page.getTextContent();
        
        if (!textLayerRef.current) return;

        // Create text items
        textContent.items.forEach((item: any) => {
          if (item.str) {
            const div = document.createElement('div');
            div.textContent = item.str;
            div.style.position = 'absolute';
            div.style.left = item.transform[4] + 'px';
            div.style.top = (viewport.height - item.transform[5]) + 'px';
            div.style.fontSize = Math.abs(item.transform[0]) + 'px';
            div.style.fontFamily = item.fontName || 'sans-serif';
            div.style.color = 'transparent';
            div.style.userSelect = 'text';
            div.style.cursor = 'text';
            div.style.whiteSpace = 'nowrap';
            
            textLayerRef.current!.appendChild(div);
          }
        });
      } catch (error) {
        console.error('Error rendering text layer:', error);
      }
    };

    renderTextLayer();
  }, [page, viewport]);

  return (
    <div
      ref={textLayerRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        userSelect: 'text',
        cursor: 'text',
        pointerEvents: 'auto'
      }}
    />
  );
};
