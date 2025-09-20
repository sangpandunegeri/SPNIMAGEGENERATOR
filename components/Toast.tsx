
import React, { useEffect } from 'react';

interface ToastProps {
  message: React.ReactNode | null;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 8000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div 
      className="fixed top-5 right-5 max-w-sm bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg animate-slide-in-down z-50"
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="font-semibold mr-2">Error:</span>
        </div>
        <div className="flex-grow">
          {message}
        </div>
        <button onClick={onClose} className="ml-4 -mt-1 text-2xl font-light leading-none">&times;</button>
      </div>
    </div>
  );
};

export default Toast;
