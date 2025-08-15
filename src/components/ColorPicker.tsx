import React, { useState } from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  colors?: string[];
  size?: 'sm' | 'md';
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  colors = [
    '#FFEB3B', // Yellow (default highlight)
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FF9800', // Orange
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#F44336', // Red
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#000000'  // Black
  ],
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8'
  };

  const containerSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200`}
        style={{ backgroundColor: selectedColor }}
        title="Change color"
      />
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Color palette */}
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-20 grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onColorChange(color);
                  setIsOpen(false);
                }}
                className={`${containerSizeClasses[size]} rounded-full border-2 hover:scale-110 transition-transform duration-200 ${
                  selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPicker;
