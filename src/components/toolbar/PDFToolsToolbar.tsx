import React, { useState } from 'react';
import { ToolButton } from '../ui/ToolButton';

interface PDFToolsToolbarProps {
  onAddText: () => void;
  onHighlight: () => void;
  onSign: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onExtract: () => void;
  onOCR: () => void;
  onRedact: () => void;
  onRefresh: () => void;
}

export const PDFToolsToolbar: React.FC<PDFToolsToolbarProps> = ({
  onAddText,
  onHighlight,
  onSign,
  onRotateLeft,
  onRotateRight,
  onExtract,
  onOCR,
  onRedact,
  onRefresh
}) => {
  const [activeTool, setActiveTool] = useState<string>('select');
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  const toolGroups = [
    {
      id: 'selection',
      name: 'Selection',
      color: 'blue',
      tools: [
        { id: 'select', icon: 'cursor', label: 'Select', action: () => setActiveTool('select') },
        { id: 'hand', icon: 'hand', label: 'Pan', action: () => setActiveTool('hand') }
      ]
    },
    {
      id: 'annotation',
      name: 'Annotation',
      color: 'green', 
      tools: [
        { id: 'text', icon: 'text', label: 'Text', action: onAddText },
        { id: 'highlight', icon: 'marker', label: 'Highlight', action: onHighlight },
        { id: 'draw', icon: 'pen', label: 'Draw', action: () => {} },
        { id: 'sign', icon: 'signature', label: 'Sign', action: onSign }
      ]
    },
    {
      id: 'transform',
      name: 'Transform',
      color: 'purple',
      tools: [
        { id: 'rotateLeft', icon: 'rotateLeft', label: 'Rotate Left', action: onRotateLeft },
        { id: 'rotateRight', icon: 'rotateRight', label: 'Rotate Right', action: onRotateRight }
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced',
      color: 'orange',
      tools: [
        { id: 'extract', icon: 'extract', label: 'Extract', action: onExtract },
        { id: 'ocr', icon: 'ocr', label: 'OCR', action: onOCR },
        { id: 'redact', icon: 'redact', label: 'Redact', action: onRedact }
      ]
    },
    {
      id: 'utility',
      name: 'Utility',
      color: 'gray',
      tools: [
        { id: 'refresh', icon: 'refresh', label: 'Refresh', action: onRefresh }
      ]
    }
  ];

  const getGroupColorClasses = (color: string, isHovered: boolean) => {
    const colors = {
      blue: isHovered ? 'bg-blue-50 border-blue-200' : 'bg-white/60 border-white/30',
      green: isHovered ? 'bg-green-50 border-green-200' : 'bg-white/60 border-white/30',
      purple: isHovered ? 'bg-purple-50 border-purple-200' : 'bg-white/60 border-white/30',
      orange: isHovered ? 'bg-orange-50 border-orange-200' : 'bg-white/60 border-white/30',
      gray: isHovered ? 'bg-gray-50 border-gray-200' : 'bg-white/60 border-white/30'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="relative">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 backdrop-blur-lg"></div>
      
      <div className="relative bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Tool Groups */}
          <div className="flex items-center space-x-6">
            {toolGroups.map((group, groupIndex) => (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => setHoveredGroup(group.id)}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                {/* Group Label */}
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.name}
                  </span>
                </div>
                
                {/* Tool Group Container */}
                <div className={`
                  flex items-center space-x-1 p-2 rounded-2xl border backdrop-blur-lg
                  transition-all duration-300 transform
                  ${getGroupColorClasses(group.color, hoveredGroup === group.id)}
                  ${hoveredGroup === group.id ? 'scale-105 shadow-lg' : 'shadow-sm'}
                `}>
                  {group.tools.map((tool, toolIndex) => (
                    <React.Fragment key={tool.id}>
                      <ModernToolButton
                        icon={tool.icon}
                        label={tool.label}
                        onClick={() => {
                          if (tool.id === 'select' || tool.id === 'hand') {
                            setActiveTool(tool.id);
                          }
                          tool.action();
                        }}
                        active={activeTool === tool.id}
                        groupColor={group.color}
                        isGroupHovered={hoveredGroup === group.id}
                      />
                      {toolIndex < group.tools.length - 1 && (
                        <div className="h-6 w-px bg-gray-200 opacity-50"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                {/* Group separator */}
                {groupIndex < toolGroups.length - 1 && (
                  <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                )}
              </div>
            ))}
          </div>

          {/* Right side - Status and quick actions */}
          <div className="flex items-center space-x-4">
            {/* Current tool indicator */}
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-lg border border-white/30 rounded-xl px-4 py-2 shadow-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {activeTool} Tool
              </span>
            </div>

            {/* Quick settings */}
            <button className="p-2.5 text-gray-600 hover:text-gray-800 bg-white/60 backdrop-blur-lg border border-white/30 hover:bg-white/80 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Tool Button Component
interface ModernToolButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  groupColor: string;
  isGroupHovered: boolean;
}

const ModernToolButton: React.FC<ModernToolButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  active = false,
  groupColor,
  isGroupHovered
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getActiveColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
      green: 'bg-green-500 text-white shadow-lg shadow-green-500/30',
      purple: 'bg-purple-500 text-white shadow-lg shadow-purple-500/30',
      orange: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
      gray: 'bg-gray-500 text-white shadow-lg shadow-gray-500/30'
    };
    return colors[color as keyof typeof colors];
  };

  const getHoverColorClasses = (color: string) => {
    const colors = {
      blue: 'hover:bg-blue-100 hover:text-blue-700',
      green: 'hover:bg-green-100 hover:text-green-700',
      purple: 'hover:bg-purple-100 hover:text-purple-700',
      orange: 'hover:bg-orange-100 hover:text-orange-700',
      gray: 'hover:bg-gray-100 hover:text-gray-700'
    };
    return colors[color as keyof typeof colors];
  };

  // Simple icon mapping - you'll need to import your actual icons
  const iconElements = {
    cursor: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />,
    hand: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />,
    text: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    marker: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h-2m2 3v16l-7-3-7 3V7" />,
    pen: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />,
    signature: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    rotateLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 20v-5h-.582m-15.356-2A8.001 8.001 0 0119.418 15m0 0H15m-11-11v5h.581m0 0a8.003 8.003 0 0115.357 2M4.581 9H9" />,
    rotateRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    extract: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    ocr: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    redact: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  };

  return (
    <div className="group relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative flex items-center justify-center w-10 h-10 rounded-xl
          transition-all duration-200 transform
          ${active 
            ? getActiveColorClasses(groupColor)
            : `text-gray-600 bg-transparent ${getHoverColorClasses(groupColor)}`
          }
          ${isHovered || isGroupHovered ? 'scale-110' : ''}
          hover:shadow-lg
        `}
        title={label}
      >
        <svg 
          className="w-5 h-5 stroke-current" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {iconElements[icon as keyof typeof iconElements]}
        </svg>
        
        {/* Active indicator */}
        {active && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-current rounded-full"></div>
        )}
      </button>
      
      {/* Tooltip */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
        {label}
      </div>
    </div>
  );
};
