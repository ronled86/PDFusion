import React, { useEffect, useRef } from "react";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import { MainToolbar } from "./components/toolbar/MainToolbar";
import { PDFToolsToolbar } from "./components/toolbar/PDFToolsToolbar";
import { PDFViewerNavigation } from "./components/viewer/PDFViewerNavigation";
import { Notification } from "./components/ui/Notification";
import Sidebar from "./components/Sidebar";
import { usePdfDocument } from "./hooks/usePdfDocument";
import { usePDFOperations } from "./hooks/usePDFOperations";

// Import dialogs (these would be created similar to the other components)
// For now, keeping minimal structure

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { pdf, pageCount } = usePdfDocument(state.file);
  const operations = usePDFOperations();
  const viewerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'o':
            e.preventDefault();
            operations.openFiles();
            break;
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              operations.saveAsFile();
            } else {
              operations.saveFile();
            }
            break;
          case 'p':
            e.preventDefault();
            operations.printFile();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [operations]);

  // Update viewer dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (viewerRef.current) {
        const rect = viewerRef.current.getBoundingClientRect();
        dispatch({ 
          type: 'SET_VIEWER_DIMENSIONS', 
          payload: { width: rect.width, height: rect.height }
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [dispatch]);

  const handleSearch = async (query: string) => {
    // Implementation would go here - extract from original App
    console.log("Search for:", query);
  };

  const handleInkStroke = async (pts: {x:number;y:number}[]) => {
    // Implementation would go here - extract from original App
    console.log("Ink stroke:", pts);
  };

  const scrollToPage = (index: number) => {
    // Implementation would go here - extract from original App
    dispatch({ type: 'SET_PAGE_INDEX', payload: index });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Toolbar */}
      <MainToolbar
        onOpen={operations.openFiles}
        onSave={operations.saveFile}
        onSaveAs={operations.saveAsFile}
        onPrint={operations.printFile}
        onShowInFolder={operations.showFileInFolder}
        fileName={state.file?.name}
      />

      {/* PDF Tools Toolbar */}
      <PDFToolsToolbar
        onAddText={() => dispatch({ type: 'SET_TEXT_DIALOG', payload: true })}
        onHighlight={() => dispatch({ type: 'SET_HIGHLIGHT_DIALOG', payload: true })}
        onSign={() => {/* TODO: implement signature */}}
        onRotateLeft={() => operations.rotatePage(-90)}
        onRotateRight={() => operations.rotatePage(90)}
        onExtract={() => {/* TODO: implement extract */}}
        onOCR={() => {/* TODO: implement OCR */}}
        onRedact={() => dispatch({ type: 'SET_REDACT_DIALOG', payload: true })}
        onRefresh={operations.refreshDocument}
      />

      {/* PDF Viewer Navigation */}
      {pageCount > 0 && (
        <PDFViewerNavigation
          pageIndex={state.pageIndex}
          pageCount={pageCount}
          zoom={state.zoom}
          scrollMode={state.scrollMode}
          onPageChange={(index) => dispatch({ type: 'SET_PAGE_INDEX', payload: index })}
          onZoomChange={(zoom) => dispatch({ type: 'SET_ZOOM', payload: zoom })}
          onScrollModeChange={(mode) => dispatch({ type: 'SET_SCROLL_MODE', payload: mode })}
          onSearch={handleSearch}
          scrollToPage={scrollToPage}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Page Thumbnails */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Pages</h3>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            {pageCount > 0 ? (
              <Sidebar 
                pageCount={pageCount} 
                current={state.pageIndex} 
                onJump={(index) => dispatch({ type: 'SET_PAGE_INDEX', payload: index })} 
                pdf={pdf} 
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No pages to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Main PDF Viewer */}
        <div className="flex-1 flex flex-col">
          <div 
            ref={viewerRef}
            className="flex-1 overflow-auto bg-gray-100 relative"
            style={{ 
              scrollBehavior: 'smooth',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc'
            }}
          >
            {!state.file ? (
              /* Welcome Screen */
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to PDFusion</h2>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Open a PDF file to start editing. You can add text, highlight content, rotate pages, and much more.
                  </p>
                  <button
                    onClick={operations.openFiles}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            ) : (
              /* PDF Content - This would include the actual PDF rendering */
              <div className="p-4 text-center">
                <p>PDF Viewer Content Goes Here</p>
                <p>File: {state.file.name}</p>
                <p>Page: {state.pageIndex + 1} of {pageCount}</p>
                <p>Zoom: {Math.round(state.zoom * 100)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs - These would be separate components */}
      {state.showTextDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Text</h3>
            <input
              type="text"
              value={state.textInput}
              onChange={(e) => dispatch({ type: 'SET_TEXT_INPUT', payload: e.target.value })}
              placeholder="Enter text to add to the document"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_TEXT_DIALOG', payload: false });
                  dispatch({ type: 'SET_TEXT_INPUT', payload: "" });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await operations.addText(state.textInput);
                  dispatch({ type: 'SET_TEXT_DIALOG', payload: false });
                  dispatch({ type: 'SET_TEXT_INPUT', payload: "" });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flying Notification */}
      {state.notification && (
        <Notification 
          message={state.notification}
          onClose={() => dispatch({ type: 'SET_NOTIFICATION', payload: null })}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
