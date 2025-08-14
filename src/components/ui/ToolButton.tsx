import React, { useState } from 'react';
import { IconSVGs, IconName } from '../../constants/icons';

interface ToolButtonProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'glassmorphism';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  showLabel?: boolean;
  glowColor?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({ 
  icon, 
  label, 
  onClick,
  disabled = false,
  active = false,
  variant = 'default',
  size = 'md',
  tooltip,
  showLabel = true,
  glowColor = 'blue'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = "flex items-center space-x-2 rounded-xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";
  
  const variantClasses = {
    default: "px-3 py-2 text-gray-700 hover:bg-white hover:shadow-lg hover:scale-105 backdrop-blur-sm",
    primary: "px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105",
    secondary: "px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105",
    glassmorphism: "px-4 py-2.5 bg-white/60 backdrop-blur-lg border border-white/30 text-gray-700 hover:bg-white/80 hover:scale-105 shadow-lg hover:shadow-xl"
  };

  const sizeClasses = {
    sm: "text-xs", 
    md: "text-sm", 
    lg: "text-base"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const activeClasses = active ? `
    ${variant === 'primary' ? 'ring-2 ring-blue-300 ring-offset-2' : 'bg-blue-100 text-blue-600 shadow-lg'}
    transform scale-105
  ` : "";

  const glowClasses = {
    blue: 'shadow-blue-500/30',
    green: 'shadow-green-500/30',
    purple: 'shadow-purple-500/30',
    orange: 'shadow-orange-500/30',
    red: 'shadow-red-500/30'
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${baseClasses} 
          ${variantClasses[variant]} 
          ${sizeClasses[size]} 
          ${activeClasses}
          ${isHovered && variant === 'primary' ? `shadow-2xl ${glowClasses[glowColor as keyof typeof glowClasses]}` : ''}
        `}
        title={tooltip || label}
      >
        {/* Animated background for primary buttons */}
        {variant === 'primary' && (
          <div className={`
            absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
            transform -skew-x-12 transition-transform duration-700
            ${isHovered ? 'translate-x-full' : '-translate-x-full'}
          `} />
        )}
        
        {/* Icon with enhanced animations */}
        <div className={`relative ${isHovered ? 'animate-pulse' : ''}`}>
          <svg 
            className={`${iconSizes[size]} stroke-current transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {IconSVGs[icon]}
          </svg>
        </div>
        
        {/* Label */}
        {showLabel && (
          <span className={`relative font-medium transition-all duration-300 ${isHovered ? 'tracking-wide' : ''}`}>
            {label}
          </span>
        )}
        
        {/* Active indicator */}
        {active && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-current rounded-full animate-pulse" />
        )}
      </button>
      
      {/* Enhanced tooltip */}
      {tooltip && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
            <div className="relative">
              {tooltip}
              {/* Tooltip arrow */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ripple effect for glassmorphism variant */}
      {variant === 'glassmorphism' && isHovered && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping opacity-75" />
      )}
    </div>
  );
};
