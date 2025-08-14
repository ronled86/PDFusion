import React, { useEffect, useRef } from "react";
import { renderPageToCanvas } from "../lib/pdfRender";
import { useAppContext } from "../contexts/AppContext";

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
  const { state, dispatch } = useAppContext();

  const isSelected = state.selectedPages.has(pageIndex);

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent triggering the button click
    dispatch({ type: 'TOGGLE_PAGE_SELECTION', payload: pageIndex });
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
          isActive 
            ? "bg-blue-100 border-2 border-blue-500 text-blue-700 shadow-md" 
            : isSelected
            ? "bg-green-50 border-2 border-green-400 shadow-sm"
            : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:shadow-sm"
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Page {pageIndex + 1}</span>
          <div className="flex items-center space-x-2">
            {isSelected && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            {isActive && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <div className={`bg-white border rounded shadow-sm overflow-hidden ${
            isActive ? "border-blue-300" : isSelected ? "border-green-300" : "border-gray-200"
          }`}>
            <canvas 
              ref={canvasRef}
              className="block max-w-full h-auto"
              style={{ maxHeight: "80px" }}
            />
          </div>
        </div>
      </button>
      
      {/* Selection checkbox */}
      <div className="absolute top-2 right-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
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
  const { state, dispatch } = useAppContext();
  const selectedCount = state.selectedPages.size;

  const selectAllPages = () => {
    dispatch({ type: 'SELECT_ALL_PAGES', payload: pageCount });
  };

  const clearSelection = () => {
    dispatch({ type: 'CLEAR_PAGE_SELECTION' });
  };

  return (
    <div className="space-y-3 p-3">
      {/* Selection Controls */}
      {selectedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700 font-medium">
              {selectedCount} page{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={selectAllPages}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
      
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
