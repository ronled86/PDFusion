import React, { useState, useCallback } from 'react';

interface VerticalNavigationProps {
  pageIndex: number;
  pageCount: number;
  zoom: number;
  scrollMode: 'page' | 'continuous';
  onPageChange: (index: number) => void;
  onZoomChange: (zoom: number) => void;
  onScrollModeChange: (mode: 'page' | 'continuous') => void;
  onFitToPage?: () => void;
  onFitToWidth?: () => void;
  scrollToPage?: (index: number) => void;
  position?: { x: number; y: number };
  onMove?: (position: { x: number; y: number }) => void;
  isMoveable?: boolean;
  className?: string;
}

export const VerticalNavigation: React.FC<VerticalNavigationProps> = ({
  pageIndex,
  pageCount,
  zoom,
  scrollMode,
  onPageChange,
  onZoomChange,
  onScrollModeChange,
  onFitToPage,
  onFitToWidth,
  scrollToPage,
  position = { x: 16, y: 120 },
  onMove,
  isMoveable = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Default collapsed
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Safe page change with bounds checking
  const handlePageChange = (newIndex: number) => {
    const safeIndex = Math.max(0, Math.min(pageCount - 1, newIndex));
    
    // Use scrollToPage if in continuous mode and available
    if (scrollMode === 'continuous' && scrollToPage) {
      scrollToPage(safeIndex);
    } else {
      onPageChange(safeIndex);
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      handlePageChange(pageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) {
      handlePageChange(pageIndex + 1);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty value for user convenience while typing
    if (value === '') return;
    
    const pageNumber = parseInt(value, 10);
    
    // Validate the input
    if (isNaN(pageNumber)) {
      // Reset to current page if invalid
      e.target.value = (pageIndex + 1).toString();
      return;
    }
    
    // Clamp to valid range
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      handlePageChange(pageNumber - 1);
    } else {
      // Reset to valid range
      const clampedPage = Math.max(1, Math.min(pageCount, pageNumber));
      e.target.value = clampedPage.toString();
      handlePageChange(clampedPage - 1);
    }
  };

  const handlePageInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur to validate
    }
  };

  const handlePageInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ensure we have a valid value when losing focus
    if (e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
      e.target.value = (pageIndex + 1).toString();
    }
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMoveable) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !isMoveable) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    onMove?.(newPosition);
  }, [isDragging, isMoveable, dragStart, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Safe zoom change with bounds checking
  const handleZoomChange = (newZoom: number) => {
    const safeZoom = Math.max(0.1, Math.min(5.0, newZoom));
    // Round to 2 decimal places for consistency
    const roundedZoom = Math.round(safeZoom * 100) / 100;
    onZoomChange(roundedZoom);
  };

  const handleZoomIn = () => {
    const increment = zoom < 1 ? 0.1 : zoom < 2 ? 0.25 : 0.5;
    const newZoom = zoom + increment;
    handleZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const decrement = zoom <= 1 ? 0.1 : zoom <= 2 ? 0.25 : 0.5;
    const newZoom = zoom - decrement;
    handleZoomChange(newZoom);
  };

  const handleZoomSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newZoom = parseFloat(e.target.value);
    if (!isNaN(newZoom)) {
      handleZoomChange(newZoom);
    }
  };

  const handleFitToPage = () => {
    if (onFitToPage) {
      onFitToPage();
    } else {
      // Fallback: estimate fit-to-page zoom
      handleZoomChange(0.85);
    }
  };

  const handleFitToWidth = () => {
    if (onFitToWidth) {
      onFitToWidth();
    } else {
      // Fallback: estimate fit-to-width zoom
      handleZoomChange(1.0);
    }
  };

  const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0, 5.0];
  const currentZoomPercent = Math.round(zoom * 100);

  return (
    <div
      className={`fixed bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-xl z-30 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isExpanded ? '200px' : '52px',
        cursor: isDragging ? 'grabbing' : isMoveable ? 'grab' : 'default'
      }}
      onMouseDown={isMoveable ? handleMouseDown : undefined}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-300 bg-gray-50/90 rounded-t-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center hover:bg-gray-100 rounded p-1 transition-colors"
          title={isExpanded ? 'Collapse Navigation' : 'Expand Navigation'}
        >
          <svg 
            className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isExpanded && (
            <span className="ml-2 text-xs font-semibold text-gray-700">Navigation</span>
          )}
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="py-2">
        {/* Page Navigation */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          {/* Previous Page */}
          <button
            onClick={handlePrevPage}
            disabled={pageIndex === 0}
            className="w-full p-2.5 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Input */}
          {isExpanded ? (
            <div className="px-3 py-2">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-600">Page</span>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={pageIndex + 1}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputBlur}
                  onKeyPress={handlePageInputKeyPress}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-xs text-center text-gray-500">
                of {pageCount}
              </div>
            </div>
          ) : (
            <div className="px-2 py-1">
              <div className="text-xs text-center text-gray-600 font-medium">
                {pageIndex + 1}
              </div>
              <div className="text-xs text-center text-gray-400">
                / {pageCount}
              </div>
            </div>
          )}

          {/* Next Page */}
          <button
            onClick={handleNextPage}
            disabled={pageIndex === pageCount - 1}
            className="w-full p-2.5 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="w-full p-2.5 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" />
            </svg>
          </button>

          {/* Zoom Level */}
          {isExpanded ? (
            <div className="px-3 py-2">
              <select
                value={zoom}
                onChange={handleZoomSelect}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {zoomLevels.map(level => (
                  <option key={level} value={level}>
                    {Math.round(level * 100)}%
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="px-2 py-1">
              <div className="text-xs text-center text-gray-600 font-medium">
                {currentZoomPercent}%
              </div>
            </div>
          )}

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="w-full p-2.5 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>

        {/* Fit Controls */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          <button
            onClick={handleFitToPage}
            className="w-full p-2.5 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Fit to Page"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {isExpanded && (
              <span className="ml-2 text-xs">Fit Page</span>
            )}
          </button>

          <button
            onClick={handleFitToWidth}
            className="w-full p-2.5 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Fit to Width"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            {isExpanded && (
              <span className="ml-2 text-xs">Fit Width</span>
            )}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div>
          <button
            onClick={() => onScrollModeChange(scrollMode === 'page' ? 'continuous' : 'page')}
            className={`w-full p-2.5 flex items-center justify-center transition-colors ${
              scrollMode === 'page'
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={scrollMode === 'page' ? 'Switch to Continuous Scrolling' : 'Switch to Page-by-Page Scrolling'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {scrollMode === 'page' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              )}
            </svg>
            {isExpanded && (
              <span className="ml-2 text-xs">
                {scrollMode === 'page' ? 'Page' : 'Continuous'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
