import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
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
  const { state } = useAppContext();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedRegions, setSelectedRegions] = useState<any[]>([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

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
    
    console.log('Text check:', { 
      isTextHere, 
      textAtPosition,
      x, 
      y 
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
    if (!isSelecting || !selectionBox) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setSelectionBox(prev => prev ? {
      ...prev,
      endX: x,
      endY: y
    } : null);
  }, [isSelecting, selectionBox]);

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
      // TODO: Trigger search with selected text
      console.log('Search for:', selectedText);
    }
  }, [selectedText]);

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
