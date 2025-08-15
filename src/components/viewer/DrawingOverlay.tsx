import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface DrawingOverlayProps {
  width: number;
  height: number;
  zoom: number;
}

interface DrawingPath {
  id: string;
  tool: 'highlight' | 'draw';
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export const DrawingOverlay: React.FC<DrawingOverlayProps> = ({ width, height, zoom }) => {
  const { state, dispatch } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [paths, setPaths] = useState<DrawingPath[]>([]);

  // Get current drawing properties based on selected tool
  const getCurrentDrawingProps = () => {
    if (state.currentTool === 'highlight') {
      return {
        color: state.highlightColor,
        width: 20 * zoom, // Wider for highlighting
        globalCompositeOperation: 'multiply' as GlobalCompositeOperation,
        opacity: 0.3
      };
    } else if (state.currentTool === 'draw') {
      return {
        color: state.drawColor,
        width: state.drawWidth * zoom,
        globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
        opacity: 1
      };
    }
    return null;
  };

  // Redraw all paths on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed paths
    paths.forEach(path => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      // Draw smooth curves between points
      for (let i = 1; i < path.points.length - 1; i++) {
        const current = path.points[i];
        const next = path.points[i + 1];
        const cp1x = current.x + (next.x - path.points[i - 1].x) * 0.1;
        const cp1y = current.y + (next.y - path.points[i - 1].y) * 0.1;
        const cp2x = next.x - (path.points[i + 2] ? path.points[i + 2].x - current.x : next.x - current.x) * 0.1;
        const cp2y = next.y - (path.points[i + 2] ? path.points[i + 2].y - current.y : next.y - current.y) * 0.1;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
      }

      // Set drawing properties based on tool
      if (path.tool === 'highlight') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 20 * zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.lineWidth = path.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      ctx.strokeStyle = path.color;
      ctx.stroke();
    });

    // Draw current path being drawn
    if (currentPath && currentPath.points.length > 1) {
      const props = getCurrentDrawingProps();
      if (props) {
        ctx.beginPath();
        ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
        
        for (let i = 1; i < currentPath.points.length; i++) {
          ctx.lineTo(currentPath.points[i].x, currentPath.points[i].y);
        }

        ctx.globalCompositeOperation = props.globalCompositeOperation;
        ctx.globalAlpha = props.opacity;
        ctx.lineWidth = props.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = props.color;
        ctx.stroke();
      }
    }

    // Reset context
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }, [paths, currentPath, zoom, state.currentTool, state.highlightColor, state.drawColor, state.drawWidth]);

  // Handle canvas setup and redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    redrawCanvas();
  }, [width, height, redrawCanvas]);

  // Get mouse/touch position relative to canvas
  const getEventPosition = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (state.currentTool !== 'highlight' && state.currentTool !== 'draw') return;

    e.preventDefault();
    setIsDrawing(true);

    const pos = getEventPosition(e);
    const newPath: DrawingPath = {
      id: `${Date.now()}-${Math.random()}`,
      tool: state.currentTool,
      color: state.currentTool === 'highlight' ? state.highlightColor : state.drawColor,
      width: state.currentTool === 'highlight' ? 20 * zoom : state.drawWidth * zoom,
      points: [pos]
    };

    setCurrentPath(newPath);
  };

  // Continue drawing
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentPath) return;
    if (state.currentTool !== 'highlight' && state.currentTool !== 'draw') return;

    e.preventDefault();
    const pos = getEventPosition(e);

    setCurrentPath(prev => prev ? {
      ...prev,
      points: [...prev.points, pos]
    } : null);
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing || !currentPath) return;

    setIsDrawing(false);
    
    // Add completed path to paths array
    if (currentPath.points.length > 1) {
      setPaths(prev => [...prev, currentPath]);
      
      // Push to undo stack (we'll implement this later)
      // dispatch({ type: 'PUSH_UNDO', payload: /* current PDF state */ });
    }

    setCurrentPath(null);
  };

  // Clear all drawings
  const clearDrawings = () => {
    setPaths([]);
    setCurrentPath(null);
    redrawCanvas();
  };

  // Only show overlay when using drawing tools
  if (state.currentTool !== 'highlight' && state.currentTool !== 'draw') {
    return null;
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-auto z-10"
        style={{
          width: '100%',
          height: '100%',
          cursor: state.currentTool === 'highlight' || state.currentTool === 'draw' ? 
            (state.currentTool === 'highlight' 
              ? 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23FFEB3B\' stroke-width=\'2\'%3E%3Cpath d=\'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h-2m2 3v16l-7-3-7 3V7\'/%3E%3C/svg%3E") 12 12, crosshair'
              : 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\'%3E%3Cpath d=\'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z\'/%3E%3C/svg%3E") 2 22, crosshair')
            : 'default'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {/* Drawing controls */}
      {paths.length > 0 && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-lg border border-white/30 rounded-lg p-2 shadow-lg">
          <button
            onClick={clearDrawings}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Clear all annotations"
          >
            Clear All
          </button>
        </div>
      )}
    </>
  );
};
