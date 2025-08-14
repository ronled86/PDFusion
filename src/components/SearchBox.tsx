import React, { useState } from "react";

export default function SearchBox({
  onSearch
}: { onSearch: (query: string) => void }) {
  const [q, setQ] = useState("");
  
  const handleSearch = () => {
    onSearch(q);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <input 
          className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
          placeholder="Search in document..." 
          value={q} 
          onChange={e => setQ(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <svg 
          className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <button 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        onClick={handleSearch}
      >
        Find
      </button>
    </div>
  );
}
