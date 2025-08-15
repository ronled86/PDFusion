import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderPageToCanvas, createRenderTask } from '../../lib/pdfRender';
import { useAppContext } from '../../contexts/AppContext';
import { useContentAnalysis } from '../../hooks/useContentAnalysis';
import { DrawingOverlay } from './DrawingOverlay';
import { TextSelectionOverlay } from './TextSelectionOverlay';
import { TextLayer } from './TextLayer';
import { ContinuousPDFViewer } from './ContinuousPDFViewer';
import * as pdfjs from 'pdfjs-dist';

interface PDFViewerProps {
  pdf: pdfjs.PDFDocumentProxy | null;
  pageIndex: number;
  zoom: number;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdf, 
  pageIndex, 
  zoom, 
  className = ""
}) => {
  const { state, dispatch } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null); // Track current render task
  const isMountedRef = useRef(true); // Track if component is mounted
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [currentViewport, setCurrentViewport] = useState<any>(null);

  // Content analysis for intelligent cursor behavior
  const {
    pageAnalysis,
    isAnalyzing,
    getTextSelectionBounds,
    getContentAtPosition,
    isTextAtPosition,
    isImageAtPosition,
    getTextAtPosition
  } = useContentAnalysis({
    pdfPage: currentPage,
    viewport: currentViewport,
    pageNumber: pageIndex,
    containerRef
  });

  // Calculate auto-fit zoom level
  const calculateAutoFitZoom = useCallback(async (fitMode: 'page' | 'width' = 'page') => {
    if (!pdf || !containerRef.current) return;
    
    try {
      const page = await pdf.getPage(pageIndex + 1);
      const naturalViewport = page.getViewport({ scale: 1.0 });
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Account for padding and margins (assuming 32px total padding)
      const availableWidth = containerRect.width - 64;
      const availableHeight = containerRect.height - 64;
      
      // Calculate zoom levels for fit-to-width and fit-to-height
      const fitToWidthZoom = availableWidth / naturalViewport.width;
      const fitToHeightZoom = availableHeight / naturalViewport.height;
      
      // Choose zoom based on fit mode
      let optimalZoom: number;
      if (fitMode === 'width') {
        optimalZoom = fitToWidthZoom;
      } else {
        // Use the smaller zoom to ensure the page fits entirely
        optimalZoom = Math.min(fitToWidthZoom, fitToHeightZoom);
      }
      
      // Clamp zoom between reasonable bounds
      const minZoom = 0.25;
      const maxZoom = 3.0;
      const finalZoom = Math.max(minZoom, Math.min(maxZoom, optimalZoom));
      
      dispatch({ type: 'SET_ZOOM', payload: finalZoom });
      
      page.cleanup();
    } catch (error) {
      console.error('Error calculating auto-fit zoom:', error);
    }
  }, [pdf, pageIndex, dispatch]);

  // Expose fit functions (can be called from parent via ref)
  const handleFitToPage = useCallback(() => {
    calculateAutoFitZoom('page');
  }, [calculateAutoFitZoom]);

  const handleFitToWidth = useCallback(() => {
    calculateAutoFitZoom('width');
  }, [calculateAutoFitZoom]);

  // Auto-fit when PDF loads or page changes
  useEffect(() => {
    if (pdf && state.isFirstLoad) {
      // Delay to ensure container is properly sized
      const timer = setTimeout(() => {
        calculateAutoFitZoom('page');
        dispatch({ type: 'SET_FIRST_LOAD', payload: false });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pdf, state.isFirstLoad, calculateAutoFitZoom, dispatch]);

  // Recalculate auto-fit on window resize
  useEffect(() => {
    const handleResize = () => {
      if (pdf && !state.isFirstLoad) {
        calculateAutoFitZoom('page');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdf, state.isFirstLoad, calculateAutoFitZoom]);

  // Get page count when PDF loads
  useEffect(() => {
    if (pdf) {
      setPageCount(pdf.numPages);
    }
  }, [pdf]);

  // Handle scroll events for page-by-page mode and zoom
  const handleScroll = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Scroll for zoom
      e.preventDefault();
      
      const delta = e.deltaY;
      const zoomStep = 0.1;
      const minZoom = 0.25;
      const maxZoom = 5.0;
      
      let newZoom = state.zoom;
      if (delta < 0) {
        // Scroll up - zoom in
        newZoom = Math.min(maxZoom, state.zoom + zoomStep);
      } else {
        // Scroll down - zoom out
        newZoom = Math.max(minZoom, state.zoom - zoomStep);
      }
      
      if (newZoom !== state.zoom) {
        dispatch({ type: 'SET_ZOOM', payload: newZoom });
      }
    } else if (state.scrollMode === 'page' && pdf) {
      // Page navigation
      e.preventDefault();
      
      const delta = e.deltaY;
      const threshold = 50; // Minimum scroll amount to trigger page change
      
      if (Math.abs(delta) > threshold) {
        if (delta > 0 && pageIndex < pdf.numPages - 1) {
          // Scroll down - next page
          dispatch({ type: 'SET_PAGE_INDEX', payload: pageIndex + 1 });
        } else if (delta < 0 && pageIndex > 0) {
          // Scroll up - previous page
          dispatch({ type: 'SET_PAGE_INDEX', payload: pageIndex - 1 });
        }
      }
    }
  }, [state.scrollMode, state.zoom, pdf, pageIndex, dispatch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdf) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          if (pageIndex > 0) {
            dispatch({ type: 'SET_PAGE_INDEX', payload: pageIndex - 1 });
          }
          break;
        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Spacebar
          e.preventDefault();
          if (pageIndex < pdf.numPages - 1) {
            dispatch({ type: 'SET_PAGE_INDEX', payload: pageIndex + 1 });
          }
          break;
        case 'Home':
          e.preventDefault();
          dispatch({ type: 'SET_PAGE_INDEX', payload: 0 });
          break;
        case 'End':
          e.preventDefault();
          dispatch({ type: 'SET_PAGE_INDEX', payload: pdf.numPages - 1 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdf, pageIndex, dispatch]);

  useEffect(() => {
    isMountedRef.current = true;
    
    const renderPage = async () => {
      if (!pdf || !canvasRef.current || !isMountedRef.current) {
        return;
      }

      // Validate page index bounds
      const pageCount = pdf.numPages;
      if (pageIndex < 0 || pageIndex >= pageCount) {
        console.error(`Invalid page index: ${pageIndex}. Document has ${pageCount} pages (0-${pageCount - 1})`);
        setError(`Invalid page index: ${pageIndex + 1}. Document has ${pageCount} pages.`);
        setIsLoading(false);
        return;
      }

      console.log(`Rendering page ${pageIndex + 1} of ${pageCount}`);

      try {
        // Cancel any existing render task
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // Ignore cancellation errors
          }
          renderTaskRef.current = null;
        }

        if (!isMountedRef.current) return;

        setIsLoading(true);
        setError(null);
        
        // Create the render task
        const { renderTask, page, viewport, dimensions } = await createRenderTask(
          pdf,
          pageIndex,
          zoom,
          canvasRef.current
        );
        
        console.log(`Created render task for page ${pageIndex + 1}, viewport: ${viewport.width}x${viewport.height}`);
        
        if (!isMountedRef.current) {
          // Cancel if component unmounted during setup
          try {
            renderTask.cancel();
            page.cleanup();
          } catch (e) {
            // Ignore errors
          }
          return;
        }
        
        // Store the render task for potential cancellation
        renderTaskRef.current = renderTask;
        
        // Store page and viewport for content analysis
        setCurrentPage(page);
        setCurrentViewport(viewport);
        
        // Wait for render to complete
        await renderTask.promise;
        console.log(`Successfully rendered page ${pageIndex + 1}`);
        
        if (!isMountedRef.current) return;
        
        // Clean up the page to free memory
        page.cleanup();
        
        setDimensions(dimensions);
        renderTaskRef.current = null;
      } catch (err) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
          // Ignore cancelled renders
          return;
        }
        if (!isMountedRef.current) return;
        
        console.error("Error rendering PDF page:", err);
        setError(err instanceof Error ? err.message : "Failed to render PDF page");
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    renderPage();

    // Cleanup function to cancel render task on unmount
    return () => {
      isMountedRef.current = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdf, pageIndex, zoom]);

  if (!pdf) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No PDF loaded</p>
          <p className="text-sm text-gray-400">Open a PDF file to view it here</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-red-500 max-w-md mx-auto p-6">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium mb-2">Error rendering PDF</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Use continuous viewer for continuous mode
  if (state.scrollMode === 'continuous') {
    return <ContinuousPDFViewer pdf={pdf} className={className} />;
  }

  // Original single-page viewer for page mode
  return (
    <div 
      className={`flex items-center justify-center p-4 pdf-viewer-container ${className}`}
      ref={containerRef}
      onWheelCapture={handleScroll} // Use onWheelCapture to avoid passive event listener
    >
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Rendering page...</span>
            </div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full shadow-lg rounded-lg border border-gray-200"
          style={{
            display: 'block',
            opacity: isLoading ? 0.5 : 1,
            transition: 'opacity 0.2s ease-in-out',
            backgroundColor: '#ffffff' // Ensure white background
          }}
        />

        {/* Text Layer for Selection */}
        {dimensions.width > 0 && currentPage && currentViewport && (
          <div 
            className="absolute top-0 left-0 pointer-events-auto z-30"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              userSelect: 'text',
              cursor: 'text'
            }}
          >
            <TextLayer 
              page={currentPage} 
              viewport={currentViewport}
            />
          </div>
        )}

        {/* Drawing Overlay */}
        {dimensions.width > 0 && (
          <div className="absolute top-0 left-0 z-10">
            <DrawingOverlay
              width={dimensions.width}
              height={dimensions.height}
              zoom={zoom}
            />
          </div>
        )}

        {/* Text Selection Overlay - Only when using select tool */}
        {dimensions.width > 0 && pageAnalysis && state.currentTool === 'select' && (
          <div className="absolute top-0 left-0 z-20">
            <TextSelectionOverlay
              width={dimensions.width}
              height={dimensions.height}
              zoom={zoom}
              pageAnalysis={pageAnalysis}
              getTextSelectionBounds={getTextSelectionBounds}
              isTextAtPosition={isTextAtPosition}
              getTextAtPosition={getTextAtPosition}
            />
          </div>
        )}

        {/* Page navigation hints for page mode */}
        {pdf && (
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 pointer-events-none">
            {pageIndex > 0 && (
              <div className="absolute left-2 top-0 bg-black/50 text-white p-2 rounded-full opacity-30 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            )}
            {pageIndex < pdf.numPages - 1 && (
              <div className="absolute right-2 top-0 bg-black/50 text-white p-2 rounded-full opacity-30 hover:opacity-70 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        )}
        
        {/* Scroll mode indicator */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Page Mode
        </div>
      </div>
    </div>
  );
};
