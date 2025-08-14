import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'success',
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const typeStyles = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30',
    error: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/30', 
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/30',
    info: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/30'
  };

  const icons = {
    success: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    ),
    error: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ),
    warning: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
    ),
    info: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    )
  };

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-6 right-6 z-50 
      transform transition-all duration-300 ease-out
      ${isExiting ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
      ${isVisible ? 'animate-slide-in-bottom' : ''}
    `}>
      <div className={`
        px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20
        flex items-center space-x-3 max-w-sm
        ${typeStyles[type]}
        hover:scale-105 transition-transform duration-200
      `}>
        {/* Icon with glow effect */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {icons[type]}
            </svg>
          </div>
        </div>
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5 break-words">
            {message}
          </p>
        </div>
        
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 group"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white/60 rounded-b-2xl transition-all ease-linear"
            style={{
              width: '100%',
              animation: `notification-progress ${duration}ms linear`
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes notification-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
