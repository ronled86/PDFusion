import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface TextContextMenuProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
  onCopy: () => void;
  onHighlight: (color?: string) => void;
  onAddNote: () => void;
  onSearch: () => void;
}

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  disabled?: boolean;
  submenu?: MenuAction[];
}

export const TextContextMenu: React.FC<TextContextMenuProps> = ({
  selectedText,
  position,
  onClose,
  onCopy,
  onHighlight,
  onAddNote,
  onSearch
}) => {
  const { state } = useAppContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);

  // Highlight color options
  const highlightColors = [
    { id: 'yellow', label: 'Yellow', color: '#FFEB3B', bg: 'bg-yellow-300' },
    { id: 'green', label: 'Green', color: '#4CAF50', bg: 'bg-green-300' },
    { id: 'blue', label: 'Blue', color: '#2196F3', bg: 'bg-blue-300' },
    { id: 'red', label: 'Red', color: '#F44336', bg: 'bg-red-300' },
    { id: 'purple', label: 'Purple', color: '#9C27B0', bg: 'bg-purple-300' },
    { id: 'orange', label: 'Orange', color: '#FF9800', bg: 'bg-orange-300' }
  ];

  const menuActions: MenuAction[] = [
    {
      id: 'copy',
      label: 'Copy',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      action: () => {
        onCopy();
        onClose();
      },
      shortcut: 'Ctrl+C'
    },
    {
      id: 'highlight',
      label: 'Highlight',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      action: () => {
        onHighlight();
        onClose();
      },
      submenu: highlightColors.map(color => ({
        id: color.id,
        label: color.label,
        icon: <div className={`w-4 h-4 rounded ${color.bg} border border-gray-300`}></div>,
        action: () => {
          onHighlight(color.color);
          onClose();
        }
      }))
    },
    {
      id: 'note',
      label: 'Add Note',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      action: () => {
        onAddNote();
        onClose();
      },
      shortcut: 'Ctrl+N'
    },
    {
      id: 'search',
      label: 'Search Document',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      action: () => {
        onSearch();
        onClose();
      },
      shortcut: 'Ctrl+F'
    },
    {
      id: 'separator1',
      label: '',
      icon: null,
      action: () => {},
      disabled: true
    },
    {
      id: 'properties',
      label: 'Text Properties',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: () => {
        // Show text properties
        onClose();
      }
    }
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculate menu position to stay within viewport
  const getMenuStyle = (): React.CSSProperties => {
    const menuWidth = 200;
    const menuHeight = 280;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = position.x;
    let top = position.y;

    // Adjust horizontal position if menu would go off-screen
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 10;
    }

    // Adjust vertical position if menu would go off-screen
    if (top + menuHeight > viewportHeight) {
      top = position.y - menuHeight - 10;
    }

    return {
      left: `${Math.max(10, left)}px`,
      top: `${Math.max(10, top)}px`,
      minWidth: `${menuWidth}px`
    };
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
      style={getMenuStyle()}
    >
      {/* Menu Header */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Text Actions</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1 truncate max-w-[160px]">
          "{selectedText.substring(0, 30)}..."
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuActions.map((action) => {
          if (action.id.startsWith('separator')) {
            return <div key={action.id} className="border-t border-gray-100 my-1"></div>;
          }

          return (
            <div key={action.id} className="relative">
              <button
                className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors text-left ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={action.action}
                disabled={action.disabled}
                onMouseEnter={() => action.submenu && setSubmenuOpen(action.id)}
                onMouseLeave={() => action.submenu && setSubmenuOpen(null)}
              >
                <div className="flex items-center space-x-3">
                  {action.icon && (
                    <div className="text-gray-500">
                      {action.icon}
                    </div>
                  )}
                  <span className="text-sm text-gray-700">{action.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {action.shortcut && (
                    <span className="text-xs text-gray-400">{action.shortcut}</span>
                  )}
                  {action.submenu && (
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Submenu */}
              {action.submenu && submenuOpen === action.id && (
                <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px] z-10">
                  {action.submenu.map((subAction) => (
                    <button
                      key={subAction.id}
                      className="w-full px-3 py-2 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
                      onClick={subAction.action}
                    >
                      {subAction.icon && (
                        <div className="text-gray-500">
                          {subAction.icon}
                        </div>
                      )}
                      <span className="text-sm text-gray-700">{subAction.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Character count footer */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
        <div className="text-xs text-gray-500">
          {selectedText.length} characters selected
        </div>
      </div>
    </div>
  );
};
