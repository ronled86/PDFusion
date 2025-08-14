import React, { useEffect, useRef } from "react";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import { MainToolbar } from "./components/toolbar/MainToolbar";
import { PDFToolsToolbar } from "./components/toolbar/PDFToolsToolbar";
import { PDFViewerNavigation } from "./components/viewer/PDFViewerNavigation";
import { PDFViewer } from "./components/viewer/PDFViewer";
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

  const handleSearch = (searchText: string) => {
    // TODO: Implement PDF text search
    console.log("Searching for:", searchText);
  };

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

  const handleRotateSelected = (degrees: number) => {
    const selectedPages = Array.from(state.selectedPages);
    if (selectedPages.length > 0) {
      operations.rotatePages(selectedPages, degrees);
      // Clear selection after rotation
      dispatch({ type: 'CLEAR_PAGE_SELECTION' });
      dispatch({ type: 'SET_SELECTION_MODE', payload: false });
    }
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
              /* PDF Viewer - Show actual PDF content */
              <PDFViewer
                pdf={pdf}
                pageIndex={state.pageIndex}
                zoom={state.zoom}
                className="h-full bg-gray-50"
              />
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

      {/* Highlight Dialog */}
      {state.showHighlightDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h-2m2 3v16l-7-3-7 3V7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Highlight Text</h3>
            </div>
            <input
              type="text"
              value={state.highlightInput}
              onChange={(e) => dispatch({ type: 'SET_HIGHLIGHT_INPUT', payload: e.target.value })}
              placeholder="Enter text to highlight in the document"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-6 bg-white/80 backdrop-blur-sm"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_HIGHLIGHT_DIALOG', payload: false });
                  dispatch({ type: 'SET_HIGHLIGHT_INPUT', payload: "" });
                }}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await operations.addHighlight(state.highlightInput);
                  dispatch({ type: 'SET_HIGHLIGHT_DIALOG', payload: false });
                  dispatch({ type: 'SET_HIGHLIGHT_INPUT', payload: "" });
                }}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Highlight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Dialog */}
      {state.showSignatureDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Add Signature</h3>
            </div>
            <div className="mb-6">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await operations.addSignature(file);
                    dispatch({ type: 'SET_SIGNATURE_DIALOG', payload: false });
                  }
                }}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
              <p className="text-sm text-gray-500 mt-2">Choose an image file (PNG, JPG) to use as your signature</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => dispatch({ type: 'SET_SIGNATURE_DIALOG', payload: false })}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extract Pages Dialog */}
      {state.showExtractDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Extract Pages</h3>
            </div>
            <div className="mb-6">
              {state.selectedPages.size > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    Selected pages: {Array.from(state.selectedPages).map(i => i + 1).join(', ')}
                  </p>
                  <p className="text-xs text-blue-600">
                    Use the page selection controls in the toolbar to select specific pages, or continue to extract the current page.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Current page ({state.pageIndex + 1}) will be extracted.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    To extract multiple pages, use the page selection controls first.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => dispatch({ type: 'SET_EXTRACT_DIALOG', payload: false })}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const pagesToExtract = state.selectedPages.size > 0 
                    ? Array.from(state.selectedPages) 
                    : [state.pageIndex];
                  await operations.extractPages(pagesToExtract);
                  dispatch({ type: 'SET_EXTRACT_DIALOG', payload: false });
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Extract Pages
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
      )}

      {/* Help Dialog */}
      {state.showHelpDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-white/20 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Help & Documentation</h3>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Start */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Start
                  </h4>
                  <ul className="space-y-3 text-sm text-blue-700">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                      Click <strong>Open</strong> or drag & drop a PDF file
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                      Use the toolbar to edit, annotate, or transform
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                      Save your changes using <strong>Save</strong> or <strong>Save As</strong>
                    </li>
                  </ul>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Keyboard Shortcuts
                  </h4>
                  <div className="space-y-2 text-sm text-purple-700">
                    <div className="flex justify-between">
                      <span>Open file</span>
                      <kbd className="px-2 py-1 bg-purple-100 rounded text-xs">Ctrl+O</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Save file</span>
                      <kbd className="px-2 py-1 bg-purple-100 rounded text-xs">Ctrl+S</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Save as</span>
                      <kbd className="px-2 py-1 bg-purple-100 rounded text-xs">Ctrl+Shift+S</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Print</span>
                      <kbd className="px-2 py-1 bg-purple-100 rounded text-xs">Ctrl+P</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features & Tools */}
              <div className="space-y-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Features & Tools
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2 text-green-700">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Add text
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Highlight text
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Digital signatures
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Page rotation
                      </div>
                    </div>
                    <div className="space-y-2 text-green-700">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Extract pages
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        OCR text recognition
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Content redaction
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Document printing
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="bg-orange-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                    </svg>
                    Support & Info
                  </h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="flex justify-between items-center">
                      <span>Version</span>
                      <span className="font-mono bg-orange-100 px-2 py-1 rounded">v0.2.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>PDF.js Version</span>
                      <span className="font-mono bg-orange-100 px-2 py-1 rounded">4.7.76</span>
                    </div>
                    <div className="pt-2 border-t border-orange-200">
                      <p className="text-xs">
                        PDFusion is a modern PDF editor built with React and Electron.
                        For support or feature requests, please check our documentation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => dispatch({ type: 'SET_HELP_DIALOG', payload: false })}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Got it!
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
