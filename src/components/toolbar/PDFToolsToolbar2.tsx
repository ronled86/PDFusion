import React, { useState, useEffect } from 'react';

interface PDFToolsToolbarProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
  selectedPagesCount: number;
}

const PDFToolsToolbar: React.FC<PDFToolsToolbarProps> = ({ 
  onRotateLeft, 
  onRotateRight, 
  selectedPagesCount 
}) => {
  const [activeTool, setActiveTool] = useState('hand');
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  // Auto-collapse after a period of inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isToolbarVisible) {
      timer = setTimeout(() => {
        setIsToolbarVisible(false);
      }, 3000); // Hide after 3 seconds of no interaction
    }
    return () => clearTimeout(timer);
  }, [isToolbarVisible]);

  const handleMouseEnter = () => {
    setIsToolbarVisible(true);
  };

  const handleMouseLeave = () => {
    // Don't hide immediately, let the timer handle it
  };

  const toolGroups = [
    {
      id: 'view',
      name: 'View',
      color: 'blue',
      tools: [
        {
          id: 'select',
          icon: 'cursor',
          label: 'Selection Mode',
          action: () => setActiveTool('select')
        },
        {
          id: 'hand',
          icon: 'hand',
          label: 'Pan Mode',
          action: () => setActiveTool('hand')
        }
      ]
    },
    {
      id: 'edit',
      name: 'Edit',
      color: 'green',
      tools: [
        {
          id: 'text',
          icon: 'text',
          label: 'Add Text',
          action: () => {}
        },
        {
          id: 'highlight',
          icon: 'marker',
          label: 'Highlight',
          action: () => {}
        },
        {
          id: 'draw',
          icon: 'pen',
          label: 'Draw',
          action: () => {}
        },
        {
          id: 'signature',
          icon: 'signature',
          label: 'Sign',
          action: () => {}
        }
      ]
    },
    {
      id: 'pages',
      name: 'Pages',
      color: 'purple',
      tools: [
        {
          id: 'rotateLeft',
          icon: 'rotateLeft',
          label: 'Rotate Left',
          action: onRotateLeft,
          badge: selectedPagesCount > 0 ? selectedPagesCount : undefined
        },
        {
          id: 'rotateRight',
          icon: 'rotateRight',
          label: 'Rotate Right',
          action: onRotateRight,
          badge: selectedPagesCount > 0 ? selectedPagesCount : undefined
        },
        {
          id: 'extract',
          icon: 'extract',
          label: 'Extract Pages',
          action: () => {},
          badge: selectedPagesCount > 0 ? selectedPagesCount : undefined
        }
      ]
    },
    {
      id: 'process',
      name: 'Process',
      color: 'orange',
      tools: [
        {
          id: 'ocr',
          icon: 'ocr',
          label: 'OCR Text',
          action: () => {}
        },
        {
          id: 'redact',
          icon: 'redact',
          label: 'Redact',
          action: () => {}
        }
      ]
    }
  ];

  return (
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-300`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Collapsed tab indicator */}
      {isCollapsed && !isToolbarVisible && (
        <div className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-lg px-4 py-2 mb-2 text-sm font-medium text-gray-700 flex items-center gap-2 shadow-lg cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span>PDF Tools</span>
          {selectedPagesCount > 0 && (
            <div className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
              {selectedPagesCount}
            </div>
          )}
        </div>
      )}

      {/* Main toolbar */}
      <div className={`transition-all duration-300 ${
        isCollapsed && !isToolbarVisible ? 'opacity-0 pointer-events-none transform scale-95' : 'opacity-100'
      }`}>
        <div className="bg-white/95 backdrop-blur-lg border border-white/30 rounded-2xl p-4 shadow-xl relative">
          {/* Collapse button */}
          <div className="absolute top-2 right-4">
            <button
              onClick={() => {
                setIsCollapsed(true);
                setIsToolbarVisible(false);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Collapse toolbar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center gap-6">
            {toolGroups.map((group) => (
              <div
                key={group.id}
                className="flex gap-2 items-center"
                onMouseEnter={() => setHoveredGroup(group.id)}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                  {group.name}
                </div>
                <div className="flex gap-1 bg-gray-50/50 p-1.5 rounded-xl">
                  {group.tools.map((tool) => (
                    <ModernToolButton
                      key={tool.id}
                      icon={tool.icon}
                      label={tool.label}
                      onClick={tool.action}
                      groupColor={group.color}
                      isGroupHovered={hoveredGroup === group.id}
                      active={activeTool === tool.id}
                      badge={tool.badge}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Advanced Tools */}
            <div className="flex gap-2 items-center">
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">ADVANCED</div>
              <div className="flex gap-1 bg-gray-50/50 p-1.5 rounded-xl">
                <button className="p-2.5 text-gray-600 hover:text-gray-800 bg-white/60 backdrop-blur-lg border border-white/30 hover:bg-white/80 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button className="p-2.5 text-gray-600 hover:text-gray-800 bg-white/60 backdrop-blur-lg border border-white/30 hover:bg-white/80 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
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
  badge?: string | number;
}

const ModernToolButton: React.FC<ModernToolButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  active = false,
  groupColor,
  isGroupHovered,
  badge
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

  const iconElements = {
    cursor: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />,
    hand: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />,
    text: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    marker: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h-2m2 3v16l-7-3-7 3V7" />,
    pen: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />,
    signature: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    rotateLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 20v-5h-.582m-15.356-2A8.001 8.001 0 0119.418 15m0 0H15m-11-11v5h.581m0 0a8.003 8.003 0 0115.357 2M4.581 9H9" />,
    rotateRight: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 12a9 9 0 0 1-9 9c-2.39 0-4.68-.94-6.36-2.64" 
              fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 21a9 9 0 0 1-6.36-2.64L4.36 17.08" 
              fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 10 L21 12 L17 14" 
              fill="none" />
      </>
    ),
    extract: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    ocr: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    redact: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        
        {badge && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 z-10">
            {badge}
          </div>
        )}
        
        {active && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-current rounded-full"></div>
        )}
      </button>
      
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
        {label}
      </div>
    </div>
  );
};

export default PDFToolsToolbar;
