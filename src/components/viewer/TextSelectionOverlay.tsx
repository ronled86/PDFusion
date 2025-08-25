import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useSearch } from '../../hooks/useSearch';
import { useContentAnalysis } from '../../hooks/useContentAnalysis';
import { TextContextMenu } from '../ui/TextContextMenu';

interface TextSelectionOverlayProps {
  width: number;
  height: number;
  zoom: number;
  pageAnalysis: any;
  getTextSelectionBounds: (startX: number, startY: number, endX: number, endY: number) => any[];
  isTextAtPosition: (x: number, y: number) => boolean;
  getTextAtPosition: (x: number, y: number) => string;
}

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive: boolean;
}

export const TextSelectionOverlay: React.FC<TextSelectionOverlayProps> = ({
  width,
  height,
  zoom,
  pageAnalysis,
  getTextSelectionBounds,
  isTextAtPosition,
  getTextAtPosition
}) => {
  const { state, dispatch } = useAppContext();
  const search = useSearch();
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Debug: Log when overlay mounts/unmounts
  useEffect(() => {
    console.log('🔧 TextSelectionOverlay mounted with:', { 
      width, 
      height, 
      zoom, 
      currentTool: state.currentTool 
    });
    return () => console.log('🔧 TextSelectionOverlay unmounted');
  }, []);
  
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedRegions, setSelectedRegions] = useState<any[]>([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  // Debug state for coordinate testing
  const [debugInfo, setDebugInfo] = useState({
    mouseX: 0,
    mouseY: 0,
    overlayX: 0,
    overlayY: 0,
    isTextAtMouse: false,
    textAtMouse: '',
    lastClickResult: null as any,
    zoom: zoom,
    overlayDimensions: { width, height }
  });

  // Handle mouse down for text selection
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // Enable text selection for select and text tools
    if (state.currentTool !== 'select' && state.currentTool !== 'text') return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get coordinates relative to the overlay
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Debug logging
    console.log('Mouse click:', { 
      clientX: event.clientX, 
      clientY: event.clientY,
      rectLeft: rect.left,
      rectTop: rect.top,
      overlayX: x, 
      overlayY: y,
      overlayWidth: rect.width,
      overlayHeight: rect.height,
      canvasWidth: width,
      canvasHeight: height
    });

    // Check if we're clicking on text
    const isTextHere = isTextAtPosition(x, y);
    const textAtPosition = getTextAtPosition(x, y);
    
    // Enhanced debug logging with comprehensive coordinate info
    const clickDebugInfo = {
      // Mouse event coordinates
      clientX: event.clientX,
      clientY: event.clientY,
      
      // Overlay bounding rect
      rectLeft: rect.left,
      rectTop: rect.top,
      rectWidth: rect.width,
      rectHeight: rect.height,
      
      // Calculated overlay coordinates
      overlayX: x,
      overlayY: y,
      
      // Overlay dimensions from props
      overlayWidth: width,
      overlayHeight: height,
      
      // Zoom level
      zoom: zoom,
      
      // Text detection results
      isTextHere,
      textAtPosition,
      
      // Current tool
      currentTool: state.currentTool
    };
    
    console.log('🎯 CLICK TEST:', clickDebugInfo);
    
    // Store the last click result for the debug display
    setDebugInfo(prev => ({
      ...prev,
      lastClickResult: clickDebugInfo
    }));

    console.log('Text check:', { 
      isTextHere, 
      textAtPosition,
      overlayCoords: { x, y },
      zoom,
      overlayDimensions: { width, height },
      rectBounds: { 
        left: rect.left, 
        top: rect.top, 
        width: rect.width, 
        height: rect.height 
      }
    });
    
    if (!isTextHere) return;

    event.preventDefault();
    setIsSelecting(true);
    setSelectionBox({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      isActive: true
    });
  }, [state.currentTool, isTextAtPosition]);

  // Handle mouse move during selection
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Update debug info for coordinate tracking
    const isTextHere = isTextAtPosition(x, y);
    const textAtPosition = getTextAtPosition(x, y);

    setDebugInfo(prev => ({
      ...prev,
      mouseX: event.clientX,
      mouseY: event.clientY,
      overlayX: x,
      overlayY: y,
      isTextAtMouse: isTextHere,
      textAtMouse: textAtPosition || '',
      zoom: zoom,
      overlayDimensions: { width, height }
    }));

    // Handle selection dragging
    if (!isSelecting || !selectionBox) return;

    setSelectionBox(prev => prev ? {
      ...prev,
      endX: x,
      endY: y
    } : null);
  }, [isSelecting, selectionBox, isTextAtPosition, getTextAtPosition, zoom, width, height]);

  // Handle mouse up to complete selection
  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isSelecting || !selectionBox) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Get text in the selection area
    const regions = getTextSelectionBounds(
      selectionBox.startX,
      selectionBox.startY,
      x,
      y
    );

    if (regions.length > 0) {
      // Combine text from all selected regions
      const combinedText = regions
        .map(region => region.metadata?.textContent || '')
        .join(' ')
        .trim();

      setSelectedText(combinedText);
      setSelectedRegions(regions);

      // Update selection box to final position
      setSelectionBox(prev => prev ? {
        ...prev,
        endX: x,
        endY: y,
        isActive: true
      } : null);

      // Show context menu if text was selected
      if (combinedText.length > 0) {
        setContextMenuPosition({
          x: event.clientX,
          y: event.clientY
        });
        setShowContextMenu(true);
      }
    } else {
      // Clear selection if no text found
      clearSelection();
    }

    setIsSelecting(false);
  }, [isSelecting, selectionBox, getTextSelectionBounds]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectionBox(null);
    setSelectedText('');
    setSelectedRegions([]);
    setIsSelecting(false);
    setShowContextMenu(false);
  }, []);

  // Context menu handlers
  const handleCopy = useCallback(async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
  }, [selectedText]);

  const handleHighlight = useCallback((color: string = '#FFEB3B') => {
    if (selectedRegions.length > 0) {
      // TODO: Implement highlighting functionality
      console.log('Highlight text with color:', color, selectedText);
      // This would integrate with your annotation system
    }
  }, [selectedRegions, selectedText]);

  const handleAddNote = useCallback(() => {
    if (selectedText) {
      // TODO: Open note dialog
      console.log('Add note for text:', selectedText);
    }
  }, [selectedText]);

  const handleSearch = useCallback(() => {
    if (selectedText) {
      // Run a document search immediately
      search.searchInDocument(selectedText);
      // Focus and populate search input for visibility
      dispatch({ type: 'SET_SEARCH_QUERY', payload: selectedText });
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  }, [selectedText, search, dispatch]);

  // Handle global mouse up (for when mouse leaves the overlay)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSelecting]);

  // Clear selection when tool changes
  useEffect(() => {
    if (state.currentTool !== 'select') {
      clearSelection();
    }
  }, [state.currentTool, clearSelection]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedText && state.currentTool === 'select') {
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 'c':
              // Copy selected text
              event.preventDefault();
              navigator.clipboard.writeText(selectedText).catch(console.error);
              break;
            case 'a':
              // Select all text (could be implemented later)
              event.preventDefault();
              break;
          }
        } else if (event.key === 'Escape') {
          // Clear selection on Escape
          clearSelection();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedText, state.currentTool, clearSelection]);

  // Calculate selection box dimensions
  const getSelectionBoxStyle = (): React.CSSProperties => {
    if (!selectionBox) return { display: 'none' };

    const { startX, startY, endX, endY } = selectionBox;
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      pointerEvents: 'none',
      zIndex: 10
    };
  };

  // Show text selection tools
  const showSelectionBox = selectionBox && (isSelecting || selectedText.length > 0);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-20"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        cursor: (state.currentTool === 'select' || state.currentTool === 'text') ? 'text' : 'default',
        pointerEvents: 'auto' // Always allow pointer events since this overlay only renders for select tool
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Selection box */}
      {showSelectionBox && (
        <div style={getSelectionBoxStyle()} />
      )}

      {/* Debug coordinate display */}
      <div 
        className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs pointer-events-none font-mono"
        style={{ zIndex: 1000 }}
      >
        <div className="text-yellow-300 font-bold mb-1">🔍 COORDINATE DEBUG</div>
        <div>Mouse: ({debugInfo.mouseX}, {debugInfo.mouseY})</div>
        <div>Overlay: ({debugInfo.overlayX.toFixed(1)}, {debugInfo.overlayY.toFixed(1)})</div>
        <div>Text: {debugInfo.isTextAtMouse ? '✅' : '❌'} "{debugInfo.textAtMouse}"</div>
        <div>Zoom: {debugInfo.zoom}x</div>
        <div>Size: {debugInfo.overlayDimensions.width}x{debugInfo.overlayDimensions.height}</div>
        {debugInfo.lastClickResult && (
          <div className="mt-2 pt-2 border-t border-gray-500">
            <div className="text-red-300 font-bold">Last Click:</div>
            <div>Text Found: {debugInfo.lastClickResult.isTextHere ? '✅' : '❌'}</div>
            <div>Content: "{debugInfo.lastClickResult.textAtPosition || 'none'}"</div>
            <div>Coords: ({debugInfo.lastClickResult.overlayX.toFixed(1)}, {debugInfo.lastClickResult.overlayY.toFixed(1)})</div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {showContextMenu && selectedText && (
        <TextContextMenu
          selectedText={selectedText}
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
          onCopy={handleCopy}
          onHighlight={handleHighlight}
          onAddNote={handleAddNote}
          onSearch={handleSearch}
        />
      )}

      {/* Debug info for development */}
      {selectedRegions.length > 0 && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs">
          <div>Selected regions: {selectedRegions.length}</div>
          <div>Text: "{selectedText.substring(0, 50)}..."</div>
          <div>Tool: {state.currentTool}</div>
        </div>
      )}
    </div>
  );
};
