import React, { useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { useAppContext } from '../../contexts/AppContext';

interface TextLayerProps {
  page: pdfjs.PDFPageProxy;
  viewport: pdfjs.PageViewport;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const TextLayer: React.FC<TextLayerProps> = ({ page, viewport, containerRef }) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const textLayerRef = containerRef ?? internalRef;
  const { state } = useAppContext();

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
      const left = item.transform[4];
      const top = (viewport.height - item.transform[5]);
      const width = item.width ?? Math.abs(item.transform[0]);
      const height = item.height ?? Math.abs(item.transform[3]);
      div.style.left = left + 'px';
      div.style.top = top + 'px';
            div.style.fontSize = Math.abs(item.transform[0]) + 'px';
            div.style.fontFamily = item.fontName || 'sans-serif';
            div.style.color = 'transparent';
            div.style.userSelect = 'text';
            div.style.cursor = 'text';
            div.style.whiteSpace = 'nowrap';
      // Data attributes for selection mapping
      div.dataset.x = String(left);
      div.dataset.y = String(top);
      div.dataset.w = String(width);
      div.dataset.h = String(height);
            
            textLayerRef.current!.appendChild(div);
          }
        });
      } catch (error) {
        console.error('Error rendering text layer:', error);
      }
    };

    renderTextLayer();
  }, [page, viewport]);

  // Apply native selection for current search hit on this page
  useEffect(() => {
    const el = textLayerRef.current;
    if (!el) return;
    if (!page) return;

    // Clear previous selection classes
    Array.from(el.querySelectorAll('[data-selected="true"]')).forEach((n) => {
      n.removeAttribute('data-selected');
      (n as HTMLElement).classList.remove('pdf-native-selection');
    });

    const hits = state.flattenedSearchHits;
    const cur = state.currentSearchHitGlobalIndex;
    if (cur < 0 || cur >= hits.length) return;
    const hit = hits[cur];
    // Only act if this page matches
    const pageIndex = state.pageIndex; // 0-based
    if (hit.pageIndex !== pageIndex) return;

    // Find overlapping text divs by bounding box intersection
    const { x, y, w, h } = hit.rect;
    const targetLeft = x;
    const targetTop = y;
    const targetRight = x + w;
    const targetBottom = y + h;

    let firstEl: HTMLElement | null = null;
    let lastEl: HTMLElement | null = null;

    Array.from(el.children).forEach((child) => {
      const div = child as HTMLElement;
      const left = parseFloat(div.dataset.x || '0');
      const top = parseFloat(div.dataset.y || '0');
      const width = parseFloat(div.dataset.w || '0');
      const height = parseFloat(div.dataset.h || '0');
      const right = left + width;
      const bottom = top + height;
      const intersects = !(right < targetLeft || left > targetRight || bottom < targetTop || top > targetBottom);
      if (intersects) {
        if (!firstEl) firstEl = div;
        lastEl = div;
  div.setAttribute('data-selected', 'true');
  // Visible highlight for native text; keep transparent text color
  div.classList.add('pdf-native-selection');
      }
    });

    // Scroll into view smoothly and create native selection for copyability
    if (firstEl) {
      (firstEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      try {
        const selection = window.getSelection();
        if (selection && lastEl) {
          selection.removeAllRanges();
          const range = document.createRange();
          range.setStart(firstEl as Node, 0);
          const endNode = (lastEl as HTMLElement);
          const endLen = (endNode.textContent || '').length;
          range.setEnd(endNode.firstChild ? (endNode.firstChild as Node) : (endNode as Node), endLen);
          selection.addRange(range);
        }
      } catch {
        // ignore
      }
    }
  }, [state.currentSearchHitGlobalIndex, state.flattenedSearchHits, state.pageIndex]);

  return (
    <div
      ref={textLayerRef}
  className="absolute inset-0 overflow-hidden select-text cursor-text pointer-events-auto"
    />
  );
};
