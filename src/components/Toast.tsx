import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-secondary border border-border rounded-lg shadow-lg p-4 flex items-center gap-2 animate-fade-in">
      <CheckCircle className="w-5 h-5 text-green-500" />
      <span>{message}</span>
    </div>
  );
};