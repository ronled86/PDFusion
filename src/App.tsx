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
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

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
      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Left Panel - Page Thumbnails */}
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/30 flex flex-col shadow-lg">
          <div className="p-4 border-b border-white/30 bg-white/60 backdrop-blur-lg">
            <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Pages</span>
              {pageCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {pageCount}
                </span>
              )}
            </h3>
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
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm font-medium text-gray-400">No pages to display</p>
                <p className="text-xs text-gray-300 mt-1">Open a PDF to see thumbnails</p>
              </div>
            )}
          </div>
        </div>

        {/* Main PDF Viewer */}
        <div className="flex-1 flex flex-col">
          <div 
            ref={viewerRef}
            className="flex-1 overflow-auto relative"
            style={{ 
              scrollBehavior: 'smooth',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc'
            }}
          >
            {!state.file ? (
              /* Enhanced Welcome Screen */
              <div className="h-full flex items-center justify-center relative">
                <div className="text-center max-w-2xl mx-auto px-8">
                  {/* Main icon with glow effect */}
                  <div className="relative mb-8 group">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500 group-hover:rotate-3">
                      <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Title with gradient */}
                  <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                    Welcome to PDFusion
                  </h2>
                  
                  {/* Subtitle */}
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    The most <span className="font-semibold text-blue-600">powerful</span> and <span className="font-semibold text-purple-600">intuitive</span> PDF editor.
                    <br />
                    Edit, annotate, and transform your documents with ease.
                  </p>
                  
                  {/* Features grid */}
                  <div className="grid grid-cols-3 gap-6 mb-10">
                    <FeatureCard 
                      icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />}
                      title="Edit Text"
                      description="Add and modify text anywhere"
                    />
                    <FeatureCard 
                      icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h-2m2 3v16l-7-3-7 3V7" />}
                      title="Highlight"
                      description="Mark important content"
                    />
                    <FeatureCard 
                      icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                      title="Sign"
                      description="Add digital signatures"
                    />
                  </div>
                  
                  {/* CTA Button */}
                  <button
                    onClick={operations.openFiles}
                    className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
                  >
                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Open PDF Files</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  
                  {/* Quick tips */}
                  <div className="mt-8 text-sm text-gray-500">
                    <p>💡 <strong>Pro tip:</strong> Drag & drop files or use <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+O</kbd></p>
                  </div>
                </div>
              </div>
            ) : (
              /* PDF Content - Enhanced placeholder */
              <div className="p-8 text-center bg-white/60 backdrop-blur-lg m-4 rounded-2xl border border-white/30 shadow-lg">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">PDF Loaded Successfully!</h3>
                  <p className="text-gray-600 mb-4">Your document is ready for editing</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p><strong>File:</strong> {state.file?.name}</p>
                    <p><strong>Page:</strong> {state.pageIndex + 1} of {pageCount}</p>
                    <p><strong>Zoom:</strong> {Math.round(state.zoom * 100)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs - Enhanced with modern styling */}
      {state.showTextDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Add Text</h3>
            </div>
            <input
              type="text"
              value={state.textInput}
              onChange={(e) => dispatch({ type: 'SET_TEXT_INPUT', payload: e.target.value })}
              placeholder="Enter text to add to the document"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 bg-white/80 backdrop-blur-sm"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_TEXT_DIALOG', payload: false });
                  dispatch({ type: 'SET_TEXT_INPUT', payload: "" });
                }}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await operations.addText(state.textInput);
                  dispatch({ type: 'SET_TEXT_DIALOG', payload: false });
                  dispatch({ type: 'SET_TEXT_INPUT', payload: "" });
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
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

// Feature Card Component for Welcome Screen
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="group p-4 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
    </div>
    <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
    <p className="text-xs text-gray-600">{description}</p>
  </div>
);

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
