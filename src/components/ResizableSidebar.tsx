import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizableSidebarProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  onWidthChange?: (width: number) => void;
}

export const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  defaultWidth = 256, // w-64 = 256px
  minWidth = 200,
  maxWidth = 500,
  className = '',
  onWidthChange
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeStartPos = useRef(0);
  const resizeStartWidth = useRef(0);

  const startResize = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    resizeStartPos.current = e.clientX;
    resizeStartWidth.current = width;
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
  }, [width]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartPos.current;
    const newWidth = resizeStartWidth.current + deltaX;
    
    // Constrain width within bounds
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setWidth(constrainedWidth);
  }, [isResizing, minWidth, maxWidth]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
      
      return () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isResizing, resize, stopResize]);

  // Save width to localStorage and notify parent
  useEffect(() => {
    localStorage.setItem('sidebar-width', width.toString());
    onWidthChange?.(width);
  }, [width, onWidthChange]);

  // Load width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebar-width');
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10);
      if (!isNaN(parsedWidth)) {
        setWidth(Math.max(minWidth, Math.min(maxWidth, parsedWidth)));
      }
    }
  }, [minWidth, maxWidth]);

  return (
    <div 
      ref={sidebarRef}
      className={`relative flex-shrink-0 bg-white/80 backdrop-blur-xl border-r border-white/30 flex flex-col shadow-lg ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}
      
      {/* Resize Handle */}
      <div
        className={`absolute top-0 right-0 w-1 h-full cursor-ew-resize group ${
          isResizing ? 'bg-blue-500' : 'hover:bg-blue-400 bg-transparent'
        } transition-colors duration-200`}
        onMouseDown={startResize}
      >
        {/* Visual indicator for resize handle */}
        <div className="absolute inset-y-0 -right-1 w-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-0.5 h-8 bg-blue-500 rounded-full"></div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
          Drag to resize
        </div>
      </div>
      
      {/* Resize overlay for better UX during resize */}
      {isResizing && (
        <div className="fixed inset-0 z-40 cursor-ew-resize" style={{ backgroundColor: 'transparent' }} />
      )}
    </div>
  );
};
