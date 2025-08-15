import React, { useState, useEffect } from 'react';

interface ToolbarPreset {
  id: string;
  name: string;
  toolbars: {
    [key: string]: {
      position: { x: number; y: number };
      visible: boolean;
    };
  };
}

interface ToolbarManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPositions: { [key: string]: { x: number; y: number } };
  onApplyPreset: (preset: ToolbarPreset) => void;
  onSavePreset: (name: string) => void;
}

export const ToolbarManager: React.FC<ToolbarManagerProps> = ({
  isOpen,
  onClose,
  currentPositions,
  onApplyPreset,
  onSavePreset
}) => {
  const [presets, setPresets] = useState<ToolbarPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Default presets similar to Adobe
  const defaultPresets: ToolbarPreset[] = [
    {
      id: 'default',
      name: 'Default',
      toolbars: {
        vertical: { position: { x: 16, y: 120 }, visible: true },
        navigation: { position: { x: 16, y: 400 }, visible: true }
      }
    },
    {
      id: 'review',
      name: 'Review & Comment',
      toolbars: {
        vertical: { position: { x: 16, y: 80 }, visible: true },
        navigation: { position: { x: 16, y: 350 }, visible: true }
      }
    },
    {
      id: 'editing',
      name: 'Advanced Editing',
      toolbars: {
        vertical: { position: { x: 80, y: 120 }, visible: true },
        navigation: { position: { x: 16, y: 400 }, visible: true }
      }
    }
  ];

  // Load presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('toolbarPresets');
    if (saved) {
      try {
        const savedPresets = JSON.parse(saved);
        setPresets([...defaultPresets, ...savedPresets]);
      } catch {
        setPresets(defaultPresets);
      }
    } else {
      setPresets(defaultPresets);
    }
  }, []);

  // Save presets to localStorage
  const savePresetsToStorage = (presetsToSave: ToolbarPreset[]) => {
    const customPresets = presetsToSave.filter(p => !defaultPresets.some(dp => dp.id === p.id));
    localStorage.setItem('toolbarPresets', JSON.stringify(customPresets));
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: ToolbarPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      toolbars: {
        vertical: { position: currentPositions.vertical || { x: 16, y: 120 }, visible: true },
        navigation: { position: currentPositions.navigation || { x: 16, y: 400 }, visible: true }
      }
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    
    setNewPresetName('');
    setShowSaveDialog(false);
    onSavePreset(newPreset.name);
  };

  const handleDeletePreset = (presetId: string) => {
    // Don't allow deleting default presets
    if (defaultPresets.some(p => p.id === presetId)) return;

    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
  };

  const resetToDefault = () => {
    const defaultPreset = defaultPresets[0];
    onApplyPreset(defaultPreset);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Toolbar Manager</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Manage toolbar layouts and positions like Adobe Acrobat
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Presets List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Workspace Presets</h4>
            
            {presets.map((preset) => {
              const isDefault = defaultPresets.some(p => p.id === preset.id);
              
              return (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                      <div className="text-xs text-gray-500">
                        {Object.keys(preset.toolbars).length} toolbars
                        {isDefault && ' • Default'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onApplyPreset(preset)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Apply
                    </button>
                    {!isDefault && (
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete preset"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save New Preset */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            {!showSaveDialog ? (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="w-full px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Save Current Layout as Preset
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Enter preset name..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim()}
                    className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setNewPresetName('');
                    }}
                    className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <button
              onClick={resetToDefault}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
