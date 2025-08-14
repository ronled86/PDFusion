import React from 'react';
import SearchBox from '../SearchBox';

interface PDFViewerNavigationProps {
  pageIndex: number;
  pageCount: number;
  zoom: number;
  scrollMode: 'page' | 'continuous';
  onPageChange: (index: number) => void;
  onZoomChange: (zoom: number) => void;
  onScrollModeChange: (mode: 'page' | 'continuous') => void;
  onSearch: (query: string) => void;
  scrollToPage?: (index: number) => void;
}

export const PDFViewerNavigation: React.FC<PDFViewerNavigationProps> = ({
  pageIndex,
  pageCount,
  zoom,
  scrollMode,
  onPageChange,
  onZoomChange,
  onScrollModeChange,
  onSearch,
  scrollToPage
}) => {
  const handlePageChange = (newIndex: number) => {
    if (scrollMode === 'continuous' && scrollToPage) {
      scrollToPage(newIndex);
    } else {
      onPageChange(newIndex);
    }
  };

  const handlePrevPage = () => {
    const newIndex = Math.max(0, pageIndex - 1);
    handlePageChange(newIndex);
  };

  const handleNextPage = () => {
    const newIndex = Math.min(pageCount - 1, pageIndex + 1);
    handlePageChange(newIndex);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = Math.max(0, Math.min(pageCount - 1, parseInt(e.target.value) - 1));
    handlePageChange(newIndex);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(5.0, zoom + 0.25);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom - 0.25);
    onZoomChange(newZoom);
  };

  const handleFitToWidth = () => {
    // This would need viewer dimensions to calculate properly
    onZoomChange(1.0);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Page Navigation */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrevPage}
            disabled={pageIndex === 0}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Page</span>
            <input 
              type="number" 
              min={1} 
              max={pageCount} 
              value={pageIndex + 1}
              onChange={handlePageInputChange}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
            />
            <span className="text-sm text-gray-600">of {pageCount}</span>
          </div>
          
          <button 
            onClick={handleNextPage}
            disabled={pageIndex === pageCount - 1}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleZoomOut}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button 
            onClick={handleZoomIn}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <button 
            onClick={handleFitToWidth}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fit to Width"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* Right: View Mode and Search */}
        <div className="flex items-center space-x-3">
          {/* Scroll Mode Toggle */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-3">
            <button 
              onClick={() => onScrollModeChange(scrollMode === 'page' ? 'continuous' : 'page')}
              className={`p-2 rounded-lg transition-colors ${
                scrollMode === 'page' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={scrollMode === 'page' ? 'Switch to Continuous Scrolling' : 'Switch to Page-by-Page Scrolling'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {scrollMode === 'page' ? (
                  // Page icon
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ) : (
                  // Continuous scroll icon (multiple pages)
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                )}
              </svg>
            </button>
            <span className="text-xs text-gray-500 hidden sm:block">
              {scrollMode === 'page' ? 'Page' : 'Continuous'}
            </span>
          </div>
          
          <SearchBox onSearch={onSearch} />
        </div>
      </div>
    </div>
  );
};
