import React, { useEffect, useRef, useState } from 'react';
import { renderPageToCanvas } from '../../lib/pdfRender';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await renderPageToCanvas(
          pdf, 
          pageIndex, 
          zoom, 
          canvasRef.current
        );
        
        setDimensions(result);
      } catch (err) {
        console.error("Error rendering PDF page:", err);
        setError(err instanceof Error ? err.message : "Failed to render PDF page");
      } finally {
        setIsLoading(false);
      }
    };

    renderPage();
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

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
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
            display: isLoading ? 'block' : 'block',
            opacity: isLoading ? 0.5 : 1,
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
        
        {dimensions.width > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
          </div>
        )}
      </div>
    </div>
  );
};
