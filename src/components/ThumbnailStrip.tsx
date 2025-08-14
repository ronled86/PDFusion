import React, { useEffect, useRef } from "react";
import { renderPageToCanvas } from "../lib/pdfRender";

// Thumbnail component for individual pages
const PageThumbnail = ({ 
  pdf, 
  pageIndex, 
  isActive, 
  onClick 
}: { 
  pdf: any; 
  pageIndex: number; 
  isActive: boolean; 
  onClick: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const renderingRef = useRef<boolean>(false);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!pdf || !canvasRef.current || renderingRef.current) return;
      
      try {
        renderingRef.current = true;
        await renderPageToCanvas(pdf, pageIndex, 0.2, canvasRef.current); // Small scale for thumbnail
      } catch (error) {
        console.error(`Error rendering thumbnail for page ${pageIndex + 1}:`, error);
      } finally {
        renderingRef.current = false;
      }
    };

    // Small delay to prevent too many simultaneous renders
    const timeoutId = setTimeout(renderThumbnail, pageIndex * 50);
    return () => clearTimeout(timeoutId);
  }, [pdf, pageIndex]);

  // Auto-scroll into view when this thumbnail becomes active
  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isActive]);

  return (
    <button
      ref={buttonRef}
      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
        isActive 
          ? "bg-blue-100 border-2 border-blue-500 text-blue-700 shadow-md" 
          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:shadow-sm"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Page {pageIndex + 1}</span>
        {isActive && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
      <div className="flex justify-center">
        <div className={`bg-white border rounded shadow-sm overflow-hidden ${
          isActive ? "border-blue-300" : "border-gray-200"
        }`}>
          <canvas 
            ref={canvasRef}
            className="block max-w-full h-auto"
            style={{ maxHeight: "80px" }}
          />
        </div>
      </div>
    </button>
  );
};

export default function ThumbnailStrip({
  pageCount, 
  current, 
  onJump,
  pdf
}: { 
  pageCount: number; 
  current: number; 
  onJump: (i: number) => void;
  pdf?: any;
}) {
  return (
    <div className="space-y-3 p-3">
      {Array.from({ length: pageCount }).map((_, i) => (
        <PageThumbnail
          key={i}
          pdf={pdf}
          pageIndex={i}
          isActive={i === current}
          onClick={() => onJump(i)}
        />
      ))}
    </div>
  );
}
