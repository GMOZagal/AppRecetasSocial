import React from 'react';
import { TriangleAlert, X } from 'lucide-react';
import { useMountTransition } from '../hooks/useMountTransition';

export default function DeleteModal({ isOpen, onClose, onConfirm, recipeTitle }) {
  const hasTransitionedIn = useMountTransition(isOpen, 300);

  if (!isOpen && !hasTransitionedIn) return null;

  const isVisible = isOpen && hasTransitionedIn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Modal / Dialog */}
      <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 transform transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center mb-6 mt-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
            <TriangleAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar receta?</h3>
          <p className="text-gray-500 text-center">
            Estás a punto de eliminar <span className="font-semibold text-gray-800">"{recipeTitle}"</span>. Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
