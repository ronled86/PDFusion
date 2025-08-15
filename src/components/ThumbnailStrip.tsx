import React, { useEffect, useRef, useState } from "react";
import { renderPageToCanvas } from "../lib/pdfRender";
import { useAppContext } from "../contexts/AppContext";

// Thumbnail component for individual pages
const PageThumbnail = ({ 
  pdf, 
  pageIndex, 
  isActive, 
  onClick,
  onDeletePage,
  onRotatePage
}: { 
  pdf: any; 
  pageIndex: number; 
  isActive: boolean; 
  onClick: () => void;
  onDeletePage: (pageIndex: number) => void;
  onRotatePage: (pageIndex: number, direction: 'left' | 'right') => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const renderingRef = useRef<boolean>(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { state, dispatch } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = state.selectedPages.has(pageIndex);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!pdf || !canvasRef.current || renderingRef.current) return;
      
      try {
        renderingRef.current = true;
        
        console.log(`Rendering thumbnail for page ${pageIndex + 1}`);
        
        // Get container width to determine thumbnail scale
        const container = canvasRef.current.closest('.thumbnail-container');
        const containerWidth = container ? container.clientWidth - 40 : 200; // Account for padding
        
        // Calculate scale based on container width (min 0.15, max 0.4)
        const baseScale = Math.max(0.15, Math.min(0.4, containerWidth / 300));
        
        await renderPageToCanvas(pdf, pageIndex, baseScale, canvasRef.current);
        console.log(`Successfully rendered thumbnail for page ${pageIndex + 1}`);
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

  // Add resize observer to re-render thumbnails when container size changes
  useEffect(() => {
    if (!canvasRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce the resize handler
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        if (canvasRef.current && pdf && !renderingRef.current) {
          const container = canvasRef.current.closest('.thumbnail-container');
          const containerWidth = container ? container.clientWidth - 40 : 200;
          const baseScale = Math.max(0.15, Math.min(0.4, containerWidth / 300));
          
          renderingRef.current = true;
          renderPageToCanvas(pdf, pageIndex, baseScale, canvasRef.current)
            .catch(error => {
              console.error('Error re-rendering thumbnail:', error);
            })
            .finally(() => {
              renderingRef.current = false;
            });
        }
      }, 100);
    });

    const container = canvasRef.current.closest('.thumbnail-container');
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [pdf, pageIndex]);

  // Note: Removed auto-scroll to prevent layout shifting when clicking thumbnails
  // useEffect(() => {
  //   if (isActive && buttonRef.current) {
  //     // Auto-scroll behavior removed to prevent main toolbar displacement
  //   }
  // }, [isActive]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent triggering the button click
    dispatch({ type: 'TOGGLE_PAGE_SELECTION', payload: pageIndex });
  };

  return (
    <div 
      className="relative thumbnail-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
              className="block w-full h-auto"
              style={{ 
                minHeight: "60px",
                maxHeight: "150px",
                objectFit: "contain"
              }}
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

      {/* Hover Controls - Vertical on Left Side */}
      {(isHovered || isSelected) && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-1 flex flex-col space-y-1 z-20">
          {/* Rotate Left */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotatePage(pageIndex, 'left');
            }}
            className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            title="Rotate Left"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          {/* Rotate Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotatePage(pageIndex, 'right');
            }}
            className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            title="Rotate Right"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          {/* Delete Page */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletePage(pageIndex);
            }}
            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Delete Page"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default function ThumbnailStrip({
  pageCount, 
  current, 
  onJump,
  pdf,
  onDeletePage,
  onRotatePage
}: { 
  pageCount: number; 
  current: number; 
  onJump: (i: number) => void;
  pdf?: any;
  onDeletePage?: (pageIndex: number) => void;
  onRotatePage?: (pageIndex: number, direction: 'left' | 'right') => void;
}) {
  const { state, dispatch } = useAppContext();
  const selectedCount = state.selectedPages.size;

  const selectAllPages = () => {
    dispatch({ type: 'SELECT_ALL_PAGES', payload: pageCount });
  };

  const clearSelection = () => {
    dispatch({ type: 'CLEAR_PAGE_SELECTION' });
  };

  const handleDeletePage = (pageIndex: number) => {
    if (onDeletePage) {
      const confirmed = window.confirm(`Are you sure you want to delete page ${pageIndex + 1}?`);
      if (confirmed) {
        onDeletePage(pageIndex);
      }
    }
  };

  const handleRotatePage = (pageIndex: number, direction: 'left' | 'right') => {
    if (onRotatePage) {
      onRotatePage(pageIndex, direction);
    }
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
          onDeletePage={handleDeletePage}
          onRotatePage={handleRotatePage}
        />
      ))}
    </div>
  );
}
