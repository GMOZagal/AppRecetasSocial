import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
          isSuccess 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        {isSuccess ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className={`ml-2 p-1 rounded-full hover:bg-black/5 transition-colors ${
            isSuccess ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
