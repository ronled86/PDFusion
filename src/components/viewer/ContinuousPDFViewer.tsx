import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { useAppContext } from '../../contexts/AppContext';

interface ContinuousPDFViewerProps {
  pdf: PDFDocumentProxy | null;
  className?: string;
}

interface PageDimensions {
  width: number;
  height: number;
  top: number;
}

export const ContinuousPDFViewer: React.FC<ContinuousPDFViewerProps> = ({ 
  pdf, 
  className = '' 
}) => {
  if (!pdf) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500">
          <p>No PDF loaded</p>
        </div>
      </div>
    );
  }

  const { state, dispatch } = useAppContext();
  const { pageIndex, zoom } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasksRef = useRef<Map<number, any>>(new Map()); // Track render tasks per page
  const [pageDimensions, setPageDimensions] = useState<Map<number, PageDimensions>>(new Map());
  const [isLoading, setIsLoading] = useState<Map<number, boolean>>(new Map());
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [totalHeight, setTotalHeight] = useState(0);

  // Calculate auto-fit zoom level for continuous view
  const calculateAutoFitZoom = useCallback(async () => {
    if (!pdf || !containerRef.current) return;
    
    try {
      const page = await pdf.getPage(1); // Use first page for sizing
      const naturalViewport = page.getViewport({ scale: 1.0 });
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // Account for padding and scrollbar (assuming 64px total padding + scrollbar)
      const availableWidth = containerRect.width - 80;
      
      // Calculate zoom level for fit-to-width (continuous view typically uses fit-to-width)
      const fitToWidthZoom = availableWidth / naturalViewport.width;
      
      // Clamp zoom between reasonable bounds
      const minZoom = 0.25;
      const maxZoom = 3.0;
      const finalZoom = Math.max(minZoom, Math.min(maxZoom, fitToWidthZoom));
      
      // Only update if the zoom is significantly different
      if (Math.abs(zoom - finalZoom) > 0.05) {
        dispatch({ type: 'SET_ZOOM', payload: finalZoom });
      }
      
      page.cleanup();
    } catch (error) {
      console.error('Error calculating auto-fit zoom for continuous view:', error);
    }
  }, [pdf, zoom, dispatch]);

  // Auto-fit when PDF loads
  useEffect(() => {
    if (pdf && state.isFirstLoad) {
      // Delay to ensure container is properly sized
      const timer = setTimeout(() => {
        calculateAutoFitZoom();
        dispatch({ type: 'SET_FIRST_LOAD', payload: false });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pdf, state.isFirstLoad, calculateAutoFitZoom, dispatch]);

  // Recalculate auto-fit on window resize
  useEffect(() => {
    const handleResize = () => {
      if (pdf && !state.isFirstLoad) {
        calculateAutoFitZoom();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdf, state.isFirstLoad, calculateAutoFitZoom]);

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdf) return;

    // Skip if already being rendered
    if (renderTasksRef.current.has(pageNum)) {
      return;
    }

    // Skip if already rendered and visible
    const canvas = canvasRefs.current.get(pageNum);
    if (renderedPages.has(pageNum) && canvas && canvas.width > 0) {
      return;
    }

    try {
      setIsLoading(prev => new Map(prev).set(pageNum, true));
      
      const page = await pdf.getPage(pageNum);
      
      if (!canvas) {
        page.cleanup();
        setIsLoading(prev => {
          const newMap = new Map(prev);
          newMap.delete(pageNum);
          return newMap;
        });
        return;
      }
      
      const context = canvas.getContext('2d');
      if (!context) {
        page.cleanup();
        setIsLoading(prev => {
          const newMap = new Map(prev);
          newMap.delete(pageNum);
          return newMap;
        });
        return;
      }

      // Calculate dimensions with lower device pixel ratio for better performance
      const viewport = page.getViewport({ scale: zoom });
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5); // Cap at 1.5 for performance
      
      // Set canvas size
      canvas.width = viewport.width * devicePixelRatio;
      canvas.height = viewport.height * devicePixelRatio;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      
      // Scale context for device pixel ratio
      context.scale(devicePixelRatio, devicePixelRatio);
      
      // Create render task with lower quality for performance
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        intent: 'display', // Use display intent for faster rendering
        renderInteractiveForms: false, // Disable forms for performance
        annotationMode: 0, // Disable annotations for performance
      };
      
      const renderTask = page.render(renderContext);
      renderTasksRef.current.set(pageNum, renderTask);
      
      await renderTask.promise;
      
      // Clean up
      renderTasksRef.current.delete(pageNum);
      page.cleanup();
      
      setRenderedPages(prev => new Set(prev).add(pageNum));
      setError(null);
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
        // Ignore cancelled renders
        return;
      }
      console.error(`Error rendering page ${pageNum}:`, err);
      setError(`Failed to render page ${pageNum}`);
      
      // Clean up failed render
      renderTasksRef.current.delete(pageNum);
    } finally {
      setIsLoading(prev => {
        const newMap = new Map(prev);
        newMap.delete(pageNum);
        return newMap;
      });
    }
  }, [pdf, zoom, renderedPages]);

  // Calculate page positions and dimensions
  useEffect(() => {
    if (!pdf) return;

    const calculateDimensions = async () => {
      const dimensions = new Map<number, PageDimensions>();
      let currentTop = 0;
      const pageSpacing = 20; // Space between pages

      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: zoom });
          
          dimensions.set(i, {
            width: viewport.width,
            height: viewport.height,
            top: currentTop
          });

          currentTop += viewport.height + pageSpacing;
        } catch (err) {
          console.error(`Error calculating dimensions for page ${i}:`, err);
        }
      }

      setPageDimensions(dimensions);
      setTotalHeight(currentTop - pageSpacing); // Remove last spacing
    };

    calculateDimensions();
  }, [pdf, zoom]);

  // Clean up non-visible pages to save memory
  useEffect(() => {
    if (!containerRef.current || pageDimensions.size === 0) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const cleanupBuffer = containerHeight * 2; // Keep pages within 2 viewport heights

    for (let [pageNum, dims] of pageDimensions.entries()) {
      const pageTop = dims.top;
      const pageBottom = dims.top + dims.height;

      // If page is far from visible area, clean it up
      if (pageBottom < scrollTop - cleanupBuffer || pageTop > scrollTop + containerHeight + cleanupBuffer) {
        if (renderedPages.has(pageNum)) {
          const canvas = canvasRefs.current.get(pageNum);
          if (canvas) {
            // Clear canvas to free memory
            const context = canvas.getContext('2d');
            if (context) {
              context.clearRect(0, 0, canvas.width, canvas.height);
            }
            canvas.width = 0;
            canvas.height = 0;
          }
          
          setRenderedPages(prev => {
            const newSet = new Set(prev);
            newSet.delete(pageNum);
            return newSet;
          });
        }
        
        // Cancel any pending render task for this page
        const renderTask = renderTasksRef.current.get(pageNum);
        if (renderTask) {
          try {
            renderTask.cancel();
          } catch (e) {
            // Ignore cancellation errors
          }
          renderTasksRef.current.delete(pageNum);
        }
      }
    }
  }, [pageDimensions, renderedPages]);

  // Handle scroll to update current page (throttled)
  const lastScrollTime = useRef(0);
  const handleScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollTime.current < 100) return; // Throttle to 10fps
    lastScrollTime.current = now;

    if (!containerRef.current || pageDimensions.size === 0) return;

    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;
    const centerY = scrollTop + containerHeight / 2;

    // Find which page is in the center of the viewport
    for (let [pageNum, dims] of pageDimensions.entries()) {
      if (centerY >= dims.top && centerY <= dims.top + dims.height) {
        if (pageIndex !== pageNum - 1) {
          dispatch({ type: 'SET_PAGE_INDEX', payload: pageNum - 1 });
        }
        break;
      }
    }
  }, [pageDimensions, pageIndex, dispatch]);

  // Scroll to specific page
  useEffect(() => {
    if (!containerRef.current || !pageDimensions.has(pageIndex + 1)) return;

    const targetPage = pageDimensions.get(pageIndex + 1);
    if (targetPage) {
      containerRef.current.scrollTo({
        top: targetPage.top,
        behavior: 'smooth'
      });
    }
  }, [pageIndex, pageDimensions]);

  // Use Intersection Observer for better performance
  useEffect(() => {
    if (!containerRef.current || pageDimensions.size === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = parseInt(entry.target.getAttribute('data-page') || '0');
          if (pageNum > 0) {
            if (entry.isIntersecting) {
              // Page is visible, render it
              if (!renderedPages.has(pageNum) && !renderTasksRef.current.has(pageNum)) {
                renderPage(pageNum);
              }
            }
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '100px', // Start rendering 100px before page becomes visible
        threshold: 0.01 // Trigger when 1% of the page is visible
      }
    );

    // Observe all page containers
    const pageElements = containerRef.current.querySelectorAll('[data-page]');
    pageElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [pageDimensions, renderPage, renderedPages]);

  // Handle Ctrl+scroll for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const zoomStep = 0.1;
      const minZoom = 0.25;
      const maxZoom = 5;
      
      let newZoom: number;
      if (e.deltaY < 0) {
        // Scroll up - zoom in
        newZoom = Math.min(maxZoom, zoom + zoomStep);
      } else {
        // Scroll down - zoom out
        newZoom = Math.max(minZoom, zoom - zoomStep);
      }
      
      if (newZoom !== zoom) {
        dispatch({ type: 'SET_ZOOM', payload: newZoom });
      }
    }
  }, [zoom, dispatch]);

  // Cleanup render tasks on unmount or zoom change
  useEffect(() => {
    // Clear all rendered pages when zoom changes
    setRenderedPages(new Set());
    setIsLoading(new Map());
    
    return () => {
      // Cancel all pending render tasks
      for (const [pageNum, renderTask] of renderTasksRef.current.entries()) {
        try {
          renderTask.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
      }
      renderTasksRef.current.clear();
    };
  }, [zoom]); // Clean up when zoom changes

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

  return (
    <div 
      ref={containerRef}
      className={`overflow-auto h-full bg-gray-100 pdf-viewer-container ${className}`}
      onScroll={handleScroll}
      onWheel={handleWheel}
    >
      <div 
        className="relative mx-auto py-8"
        style={{ height: totalHeight + 60 }} // Add padding
      >
        {Array.from({ length: pdf.numPages }, (_, i) => i + 1).map(pageNum => {
          const dims = pageDimensions.get(pageNum);
          if (!dims) return null;

          return (
            <div
              key={pageNum}
              data-page={pageNum}
              className="relative mx-auto mb-5 shadow-lg rounded-lg bg-white"
              style={{
                width: dims.width,
                height: dims.height,
                position: 'absolute',
                top: dims.top + 40, // Add top padding
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              {/* Loading indicator or placeholder */}
              {!renderedPages.has(pageNum) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                  {isLoading.get(pageNum) ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading page {pageNum}...</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Page {pageNum}
                    </div>
                  )}
                </div>
              )}

              {/* PDF Canvas */}
              <canvas
                ref={(canvas) => {
                  if (canvas) {
                    canvasRefs.current.set(pageNum, canvas);
                  } else {
                    canvasRefs.current.delete(pageNum);
                  }
                }}
                className="w-full h-full rounded-lg border border-gray-200"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
