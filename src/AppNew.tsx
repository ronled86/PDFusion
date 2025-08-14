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

  // Rotation handlers
  const handleRotateLeft = () => {
    const selectedPages = Array.from(state.selectedPages);
    if (selectedPages.length > 0) {
      operations.rotatePages(selectedPages, -90);
      operations.showNotification(`${selectedPages.length} pages rotated left`);
    } else {
      operations.rotatePage(-90);
    }
  };

  const handleRotateRight = () => {
    const selectedPages = Array.from(state.selectedPages);
    if (selectedPages.length > 0) {
      operations.rotatePages(selectedPages, 90);
      operations.showNotification(`${selectedPages.length} pages rotated right`);
    } else {
      operations.rotatePage(90);
    }
  };

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
        onShowSettings={() => dispatch({ type: 'SET_SETTINGS_DIALOG', payload: true })}
        onShowHelp={() => dispatch({ type: 'SET_HELP_DIALOG', payload: true })}
        fileName={state.file?.name}
      />

      {/* PDF Tools Toolbar */}
      <PDFToolsToolbar
        onAddText={() => dispatch({ type: 'SET_TEXT_DIALOG', payload: true })}
        onHighlight={() => dispatch({ type: 'SET_HIGHLIGHT_DIALOG', payload: true })}
        onSign={() => dispatch({ type: 'SET_SIGNATURE_DIALOG', payload: true })}
        onRotateLeft={handleRotateLeft}
        onRotateRight={handleRotateRight}
        onExtract={() => dispatch({ type: 'SET_EXTRACT_DIALOG', payload: true })}
        onOCR={() => operations.performOCR()}
        onRedact={() => dispatch({ type: 'SET_REDACT_DIALOG', payload: true })}
        onRefresh={operations.refreshDocument}
        selectedPagesCount={state.selectedPages.size}
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

      {/* Settings Dialog */}
      {state.showSettingsDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[85vh] border border-white/20 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Settings</h3>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_SETTINGS_DIALOG', payload: false })}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
              {/* PDF Settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF Preferences
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Zoom Level</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                      <option>Fit to Width</option>
                      <option>Fit to Page</option>
                      <option>100%</option>
                      <option>125%</option>
                      <option>150%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Scroll Mode</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                      <option value="page">Single Page</option>
                      <option value="continuous">Continuous</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-save changes</label>
                      <p className="text-xs text-gray-500">Save changes automatically</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>

              {/* App Settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Application
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show notifications</label>
                      <p className="text-xs text-gray-500">Display operation feedback</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Dark mode</label>
                      <p className="text-xs text-gray-500">Switch to dark theme</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Performance Settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Performance
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rendering Quality: <span className="text-blue-600">High</span>
                    </label>
                    <input type="range" min="1" max="3" defaultValue="2" className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Fast</span>
                      <span>High Quality</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Hardware acceleration</label>
                      <p className="text-xs text-gray-500">Use GPU for better performance</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Memory optimization</label>
                      <p className="text-xs text-gray-500">Optimize memory usage</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => dispatch({ type: 'SET_SETTINGS_DIALOG', payload: false })}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  operations.showNotification("Settings saved successfully");
                  dispatch({ type: 'SET_SETTINGS_DIALOG', payload: false });
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}      {/* Help Dialog */}
      {state.showHelpDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-3xl border border-white/20 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Help</h3>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_HELP_DIALOG', payload: false })}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Quick Start</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  <li>Click Open or drag & drop a PDF file</li>
                  <li>Use toolbar tools to edit and annotate</li>
                  <li>Save your changes</li>
                </ol>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Available Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                  <div>• Add text</div>
                  <div>• Highlight text</div>
                  <div>• Digital signatures</div>
                  <div>• Page rotation</div>
                  <div>• Extract pages</div>
                  <div>• OCR recognition</div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">Keyboard Shortcuts</h4>
                <div className="space-y-1 text-sm text-purple-700">
                  <div className="flex justify-between">
                    <span>Open file</span>
                    <kbd className="bg-purple-200 px-2 py-1 rounded text-xs">Ctrl+O</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Save</span>
                    <kbd className="bg-purple-200 px-2 py-1 rounded text-xs">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Print</span>
                    <kbd className="bg-purple-200 px-2 py-1 rounded text-xs">Ctrl+P</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => dispatch({ type: 'SET_HELP_DIALOG', payload: false })}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
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
