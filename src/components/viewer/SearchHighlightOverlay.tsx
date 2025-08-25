import React from 'react';

interface SearchHighlightOverlayProps {
  highlights: Array<{ x: number; y: number; w: number; h: number }>;
  pageScale: number;
  pageWidth: number;
  pageHeight: number;
  isCurrentPage: boolean;
  currentHitIndexOnThisPage?: number; // index in highlights for the current page
}

export const SearchHighlightOverlay: React.FC<SearchHighlightOverlayProps> = ({
  highlights,
  pageScale,
  pageWidth,
  pageHeight,
  isCurrentPage,
  currentHitIndexOnThisPage,
}) => {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        width: pageWidth * pageScale,
        height: pageHeight * pageScale,
      }}
    >
      {highlights.map((highlight, index) => {
        const isCurrent = typeof currentHitIndexOnThisPage === 'number' && index === currentHitIndexOnThisPage;
        const baseColor = isCurrent ? 'bg-yellow-400 bg-opacity-70 border-yellow-600 ring-2 ring-yellow-500' :
                          isCurrentPage ? 'bg-yellow-300 bg-opacity-50 border-yellow-500' :
                          'bg-yellow-200 bg-opacity-30 border-yellow-400';
        return (
          <div
            key={index}
            className={`absolute border-2 ${baseColor}`}
            style={{
              left: highlight.x * pageScale,
              top: highlight.y * pageScale,
              width: highlight.w * pageScale,
              height: highlight.h * pageScale,
            }}
          />
        );
      })}
    </div>
  );
};
