
import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 5000 }) => {
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
      className="fixed top-5 right-5 bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg animate-slide-in-down z-50"
      role="alert"
    >
      <div className="flex items-center">
        <span className="font-semibold mr-3">Error</span>
        <p>{message}</p>
        <button onClick={onClose} className="ml-4 text-xl font-light leading-none">&times;</button>
      </div>
    </div>
  );
};

export default Toast;
