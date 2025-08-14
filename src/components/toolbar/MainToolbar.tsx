import React, { useState } from 'react';
import { ToolButton } from '../ui/ToolButton';

interface MainToolbarProps {
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onPrint: () => void;
  onShowInFolder: () => void;
  fileName?: string;
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  onOpen,
  onSave,
  onSaveAs,
  onPrint,
  onShowInFolder,
  fileName
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      {/* Glassmorphism background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 backdrop-blur-xl border-b border-white/20"></div>
      
      {/* Main toolbar content */}
      <div 
        className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Brand and file operations */}
          <div className="flex items-center space-x-6">
            {/* Brand with animated logo */}
            <div className="flex items-center space-x-3 group">
              <div className={`relative transform transition-all duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PDFusion
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Professional PDF Editor</p>
              </div>
            </div>

            {/* Animated separator */}
            <div className={`h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent transition-all duration-300 ${isHovered ? 'scale-y-125' : ''}`}></div>
            
            {/* File operations with enhanced buttons */}
            <div className="flex items-center space-x-3">
              <div className="group relative">
                <button
                  onClick={onOpen}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Open</span>
                </button>
                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                  Open PDF (Ctrl+O)
                </div>
              </div>
              
              {fileName && (
                <>
                  <QuickActionButton 
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    }
                    label="Save"
                    onClick={onSave}
                    shortcut="Ctrl+S"
                    color="green"
                  />
                  <QuickActionButton 
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    }
                    label="Save As"
                    onClick={onSaveAs}
                    shortcut="Ctrl+Shift+S"
                    color="teal"
                  />
                  <QuickActionButton 
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    }
                    label="Print"
                    onClick={onPrint}
                    shortcut="Ctrl+P"
                    color="purple"
                  />
                  <QuickActionButton 
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                    }
                    label="Show"
                    onClick={onShowInFolder}
                    shortcut=""
                    color="orange"
                  />
                </>
              )}
            </div>
          </div>

          {/* Center: File name with enhanced styling */}
          {fileName && (
            <div className="flex-1 flex justify-center">
              <div className="group relative">
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 truncate max-w-xs">
                      {fileName}
                    </span>
                    <span className="text-xs text-gray-500">Active Document</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Right: Application controls with modern icons */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200 hover:scale-110">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200 hover:scale-110">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  shortcut: string;
  color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, onClick, shortcut, color }) => {
  const colorClasses = {
    green: 'hover:bg-green-50 hover:text-green-700 hover:border-green-200',
    teal: 'hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200',
    purple: 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200',
    orange: 'hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'
  };

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-white/60 backdrop-blur-lg border border-white/30 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </button>
      {/* Tooltip */}
      {shortcut && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
          {label} ({shortcut})
        </div>
      )}
    </div>
  );
};
