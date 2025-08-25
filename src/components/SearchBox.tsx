import React, { useState, useEffect } from "react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
  totalResults?: number;
  currentResultIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onClear?: () => void;
  query?: string;
}

export default function SearchBox({
  onSearch,
  isSearching = false,
  totalResults = 0,
  currentResultIndex = -1,
  onNext,
  onPrev,
  onClear
  ,
  query = ""
}: SearchBoxProps) {
  const [q, setQ] = useState("");

  // Sync external query into input
  useEffect(() => {
    setQ(query);
  }, [query]);
  
  const handleSearch = () => {
    onSearch(q);
  };

  const handleClear = () => {
    setQ("");
    onClear?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <input 
          className="w-64 pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
          placeholder="Search in document..." 
          value={q} 
          onChange={e => setQ(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSearching}
        />
        <svg 
          className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {q && (
          <button 
            className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
            title="Clear search"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSearch}
        disabled={isSearching || !q.trim()}
      >
        {isSearching ? 'Searching...' : 'Find'}
      </button>

      {/* Search Results Navigation */}
      {totalResults > 0 && (
        <>
          <div className="text-sm text-gray-600 px-2">
            {totalResults} results
          </div>
          <div className="flex space-x-1">
            <button 
              className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onPrev}
              disabled={totalResults <= 1}
              title="Previous result"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onNext}
              disabled={totalResults <= 1}
              title="Next result"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      )}

      {totalResults === 0 && q && !isSearching && (
        <div className="text-sm text-gray-500 px-2">
          No results
        </div>
      )}
    </div>
  );
}
