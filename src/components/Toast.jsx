import { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <CheckCircleIcon className="h-5 w-5 text-green-400" />
        <span>{message}</span>
      </div>
    </div>
  );
}