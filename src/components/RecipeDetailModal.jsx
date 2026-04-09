import React from 'react';
import {
  X, Heart, MessageCircle, Clock, Tag, User,
  ChefHat, BookOpen, UtensilsCrossed
} from 'lucide-react';
import { useMountTransition } from '../hooks/useMountTransition';

const avatarUrl = (username) =>
  `https://i.pravatar.cc/150?u=${encodeURIComponent(username || 'user')}`;

export default function RecipeDetailModal({ receta, isOpen, onClose, onLike, likedByMe }) {
  const hasTransitionedIn = useMountTransition(isOpen, 300);
  if (!isOpen && !hasTransitionedIn) return null;

  const isVisible = isOpen && hasTransitionedIn;

  const pasos = receta?.instrucciones
    ?.split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>

        {/* Hero Image */}
        <div className="relative h-56 w-full flex-shrink-0 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
          {receta?.imageUrl ? (
            <img
              src={receta.imageUrl}
              alt={receta.titulo}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-20 h-20 text-orange-200" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Título sobre imagen */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500 text-white mb-2">
              <Tag className="w-3 h-3" /> {receta?.categoria}
            </span>
            <h2 className="text-2xl font-extrabold text-white leading-tight drop-shadow">
              {receta?.titulo}
            </h2>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* Meta: autor + fecha + métricas */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl(receta?.creador?.username)}
                alt={receta?.creador?.username}
                className="w-10 h-10 rounded-full border-2 border-orange-200"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  @{receta?.creador?.username}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {receta?.createdAt
                    ? new Date(receta.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })
                    : ''}
                </p>
              </div>
            </div>

            {/* Like button */}
            <button
              onClick={() => onLike(receta.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                likedByMe
                  ? 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${likedByMe ? 'fill-red-500 text-red-500' : ''}`} />
              {receta?.likes ?? 0}
            </button>
          </div>

          <div className="px-6 py-5 space-y-6">

            {/* Descripción */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
                Sobre este platillo
              </h3>
              <p className="text-gray-700 leading-relaxed">{receta?.descripcion}</p>
            </div>

            {/* Ingredientes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-2">
                <ChefHat className="w-4 h-4" /> Ingredientes
                <span className="text-gray-400 font-normal normal-case tracking-normal">
                  ({receta?.ingredientes?.length ?? 0})
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {receta?.ingredientes?.map((ing, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-xl text-sm text-gray-700 border border-orange-100"
                  >
                    <span className="w-5 h-5 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    {ing}
                  </div>
                ))}
              </div>
            </div>

            {/* Instrucciones */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Instrucciones
              </h3>
              {pasos.length > 0 ? (
                <ol className="space-y-3">
                  {pasos.map((paso, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed pt-0.5">{paso}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500 italic text-sm">
                  {receta?.instrucciones}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b-3xl">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Heart className={`w-4 h-4 ${likedByMe ? 'fill-red-400 text-red-400' : ''}`} />
              {receta?.likes ?? 0} likes
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {receta?.totalComentarios ?? 0} comentarios
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
