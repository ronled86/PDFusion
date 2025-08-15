import { useCallback, useEffect, useState, useRef } from 'react';
import { contentAnalyzer, PageAnalysis, getCursorForContent } from '../lib/contentAnalysis';
import { useAppContext } from '../contexts/AppContext';
import { setCursor } from '../lib/cursorManager';

interface UseContentAnalysisProps {
  pdfPage?: any;
  viewport?: any;
  pageNumber: number;
  containerRef: React.RefObject<HTMLElement>;
}

export const useContentAnalysis = ({
  pdfPage,
  viewport,
  pageNumber,
  containerRef
}: UseContentAnalysisProps) => {
  const { state } = useAppContext();
  const [pageAnalysis, setPageAnalysis] = useState<PageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const currentCursorRef = useRef<string>('default');

  // Analyze page content when page or viewport changes
  useEffect(() => {
    if (!pdfPage || !viewport) return;

    const analyzePageContent = async () => {
      setIsAnalyzing(true);
      try {
        console.log('Starting content analysis for page:', pageNumber);
        const analysis = await contentAnalyzer.analyzePage(pdfPage, viewport, pageNumber);
        console.log('Content analysis completed:', {
          pageNumber,
          textBlocks: analysis.textBlocks.length,
          regions: analysis.regions.length,
          images: analysis.images.length
        });
        setPageAnalysis(analysis);
      } catch (error) {
        console.warn('Content analysis failed:', error);
        setPageAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzePageContent();

    // Cleanup cache when component unmounts or page changes
    return () => {
      contentAnalyzer.clearCache(pageNumber);
    };
  }, [pdfPage, viewport, pageNumber]);

  // Handle mouse movement for intelligent cursor
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !pageAnalysis) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mousePositionRef.current = { x, y };

    // Determine cursor based on content analysis
    const newCursor = getCursorForContent(x, y, pageAnalysis, state.currentTool);
    
    if (newCursor !== currentCursorRef.current) {
      currentCursorRef.current = newCursor;
      setCursor(newCursor);
    }
  }, [pageAnalysis, state.currentTool, containerRef]);

  // Handle mouse leave - reset cursor
  const handleMouseLeave = useCallback(() => {
    if (currentCursorRef.current !== 'default') {
      currentCursorRef.current = 'default';
      setCursor('default');
    }
  }, []);

  // Set up mouse event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Update cursor when tool changes
  useEffect(() => {
    if (!pageAnalysis) return;

    const { x, y } = mousePositionRef.current;
    const newCursor = getCursorForContent(x, y, pageAnalysis, state.currentTool);
    
    if (newCursor !== currentCursorRef.current) {
      currentCursorRef.current = newCursor;
      setCursor(newCursor);
    }
  }, [state.currentTool, pageAnalysis]);

  // Get text selection bounds for intelligent text selection
  const getTextSelectionBounds = useCallback((
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    if (!pageAnalysis) return [];
    
    return contentAnalyzer.getTextSelectionBounds(
      startX, startY, endX, endY, pageAnalysis
    );
  }, [pageAnalysis]);

  // Get content region at specific position
  const getContentAtPosition = useCallback((x: number, y: number) => {
    if (!pageAnalysis) return null;

    return contentAnalyzer.getCursorContext(x, y, pageAnalysis, state.currentTool);
  }, [pageAnalysis, state.currentTool]);

  // Check if position contains text
  const isTextAtPosition = useCallback((x: number, y: number) => {
    const context = getContentAtPosition(x, y);
    return context?.region?.type === 'text';
  }, [getContentAtPosition]);

  // Check if position contains image
  const isImageAtPosition = useCallback((x: number, y: number) => {
    const context = getContentAtPosition(x, y);
    return context?.region?.type === 'image';
  }, [getContentAtPosition]);

  // Get text content at position
  const getTextAtPosition = useCallback((x: number, y: number) => {
    const context = getContentAtPosition(x, y);
    if (context?.region?.type === 'text') {
      return context.region.metadata?.textContent || '';
    }
    return '';
  }, [getContentAtPosition]);

  return {
    pageAnalysis,
    isAnalyzing,
    getTextSelectionBounds,
    getContentAtPosition,
    isTextAtPosition,
    isImageAtPosition,
    getTextAtPosition,
    // Analysis results for debugging/display
    textBlocks: pageAnalysis?.textBlocks || [],
    images: pageAnalysis?.images || [],
    regions: pageAnalysis?.regions || []
  };
};
