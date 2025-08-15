import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface ToolGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  tools: Tool[];
  isExpanded?: boolean;
}

interface Tool {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  shortcut?: string;
}

interface VerticalToolbarProps {
  className?: string;
  isMoveable?: boolean;
  position?: { x: number; y: number };
  onMove?: (position: { x: number; y: number }) => void;
}

export const VerticalToolbar: React.FC<VerticalToolbarProps> = ({
  className = '',
  isMoveable = true,
  position = { x: 16, y: 120 },
  onMove
}) => {
  const { state, dispatch } = useAppContext();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['selection']));
  const [isExpanded, setIsExpanded] = useState(false); // Controls width expansion, not visibility
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Define tool groups similar to Adobe
  const toolGroups: ToolGroup[] = [
    {
      id: 'selection',
      label: 'Selection Tools',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
        </svg>
      ),
      tools: [
        {
          id: 'select',
          label: 'Selection Tool',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
            </svg>
          ),
          action: () => dispatch({ type: 'SET_CURRENT_TOOL', payload: 'select' }),
          isActive: state.currentTool === 'select',
          shortcut: 'V'
        },
        {
          id: 'hand',
          label: 'Hand Tool',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3.5M3 16.5h12" />
            </svg>
          ),
          action: () => dispatch({ type: 'SET_CURRENT_TOOL', payload: 'hand' }),
          isActive: state.currentTool === 'hand',
          shortcut: 'H'
        }
      ]
    },
    {
      id: 'annotate',
      label: 'Annotation Tools',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      tools: [
        {
          id: 'highlight',
          label: 'Highlight Tool',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ),
          action: () => dispatch({ type: 'SET_CURRENT_TOOL', payload: 'highlight' }),
          isActive: state.currentTool === 'highlight',
          shortcut: 'U'
        },
        {
          id: 'draw',
          label: 'Draw Tool',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ),
          action: () => dispatch({ type: 'SET_CURRENT_TOOL', payload: 'draw' }),
          isActive: state.currentTool === 'draw',
          shortcut: 'P'
        },
        {
          id: 'text',
          label: 'Add Text',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          action: () => dispatch({ type: 'SET_CURRENT_TOOL', payload: 'text' }),
          isActive: state.currentTool === 'text',
          shortcut: 'T'
        }
      ]
    },
    {
      id: 'shapes',
      label: 'Shape Tools',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      tools: [
        {
          id: 'rectangle',
          label: 'Rectangle',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
          ),
          action: () => dispatch({ type: 'SET_CURRENT_TOOL', payload: 'rectangle' }),
          isActive: state.currentTool === 'rectangle',
          shortcut: 'R'
        },
        {
          id: 'circle',
          label: 'Circle',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
            </svg>
          ),
          action: () => dispatch({ type: 'SET_CURRENT_TOOL', payload: 'circle' }),
          isActive: state.currentTool === 'circle',
          shortcut: 'O'
        },
        {
          id: 'arrow',
          label: 'Arrow',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          ),
          action: () => dispatch({ type: 'SET_CURRENT_TOOL', payload: 'arrow' }),
          isActive: state.currentTool === 'arrow',
          shortcut: 'A'
        }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMoveable) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isMoveable) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    onMove?.(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      className={`fixed bg-gray-50/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-xl z-30 transition-all duration-200 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isExpanded ? '200px' : '52px',
        cursor: isDragging ? 'grabbing' : isMoveable ? 'grab' : 'default'
      }}
      onMouseDown={isMoveable ? handleMouseDown : undefined}
    >
      {/* Toolbar Header */}
      <div className="p-3 border-b border-gray-300 bg-gray-100/90 rounded-t-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center hover:bg-gray-100 rounded p-1 transition-colors"
          title={isExpanded ? 'Collapse Tools' : 'Expand Tools'}
        >
          <svg 
            className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isExpanded && (
            <span className="ml-2 text-xs font-semibold text-gray-700">Tools</span>
          )}
        </button>
      </div>

      {/* Tool Groups */}
      <div className="py-1">
        {toolGroups.map((group) => {
          const isGroupExpanded = expandedGroups.has(group.id);
          
          return (
            <div key={group.id} className="border-b border-gray-200 last:border-b-0">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-100 transition-colors group"
                title={group.label}
              >
                <div className="flex items-center space-x-2">
                  <div className="text-gray-600 group-hover:text-gray-800">
                    {group.icon}
                  </div>
                  {isExpanded && (
                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-800">
                      {group.label}
                    </span>
                  )}
                </div>
                <svg 
                  className={`w-3 h-3 text-gray-500 transition-transform ${isGroupExpanded ? 'rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Group Tools */}
              {isGroupExpanded && (
                <div className="bg-white/50">
                  {group.tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={tool.action}
                      className={`w-full p-2.5 flex items-center transition-all group relative ${
                        isExpanded ? 'justify-start space-x-2' : 'justify-center'
                      } ${
                        tool.isActive 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                      }`}
                      title={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
                    >
                      <div className={`transition-colors ${tool.isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'}`}>
                        {tool.icon}
                      </div>
                      {isExpanded && (
                        <span className={`text-xs font-medium ${tool.isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-800'}`}>
                          {tool.label}
                        </span>
                      )}
                      
                      {/* Tooltip - only show when collapsed */}
                      {!isExpanded && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {tool.label}
                          {tool.shortcut && (
                            <span className="ml-2 text-gray-300">({tool.shortcut})</span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {isExpanded && (
        <div className="px-3 py-2 border-t border-gray-300 bg-gray-100/90 rounded-b-lg">
          <div className="text-xs text-gray-600 text-center font-medium">
            {toolGroups.reduce((count, group) => count + group.tools.length, 0)} tools
          </div>
        </div>
      )}
    </div>
  );
};
