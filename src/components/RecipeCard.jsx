import React, { useState } from 'react';
import { Clock, Tag, Edit2, Trash2, Heart, MessageCircle } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function RecipeCard({ recipe, onEdit, onDelete, index = 0, userRole = 'usuario' }) {
  const isDraft = (recipe.estado || '').toLowerCase() === 'borrador';
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const [imagePos, setImagePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * -20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setImagePos({ x, y });
  };

  const handleMouseLeave = () => setImagePos({ x: 0, y: 0 });

  const staggerDelay = (index % 10) * 100;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${staggerDelay}ms` }}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full hover:-translate-y-1`}
    >
      {/* Image */}
      <div
        className="relative h-48 w-full overflow-hidden bg-gray-100"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1000'}
          alt={recipe.titulo}
          loading="lazy"
          style={{
            transform: `scale(1.1) translate(${imagePos.x}px, ${imagePos.y}px)`,
            transition: imagePos.x === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s linear',
          }}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1000';
          }}
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md ${
            isDraft
              ? 'bg-orange-100/90 text-orange-700 border border-orange-200/50'
              : 'bg-green-100/90 text-green-700 border border-green-200/50'
          }`}>
            {isDraft ? 'Borrador' : 'Publicado'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2 gap-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
            {recipe.titulo}
          </h3>
          {/* Always show edit/delete for the owner */}
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(recipe)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar receta"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(recipe)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar receta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
          {recipe.descripcion}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            <span>{recipe.categoria}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {recipe.likes ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {recipe.totalComentarios ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(recipe.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
