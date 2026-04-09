import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Loader2, UtensilsCrossed, Clock, Tag } from 'lucide-react';
import { obtenerGuardadas, toggleLike } from '../api/recipeApi';
import RecipeDetailModal from './RecipeDetailModal';
import AnimateOnScrollItem from './AnimateOnScrollItem';

const avatarUrl = (username) =>
  `https://i.pravatar.cc/150?u=${encodeURIComponent(username || 'user')}`;

export default function SavedRecipes() {
  const [recetas, setRecetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());

  const fetchGuardadas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { recetas: data } = await obtenerGuardadas();
      setRecetas(data);
      setLikedIds(new Set(data.map(r => r.id)));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchGuardadas(); }, [fetchGuardadas]);

  const handleLike = async (id) => {
    try {
      const { liked, likes } = await toggleLike(id);
      setRecetas(prev => prev.map(r => r.id === id ? { ...r, likes } : r));
      if (!liked) {
        // Si quitó el like, remover de guardadas después de un momento
        setTimeout(() => setRecetas(prev => prev.filter(r => r.id !== id)), 600);
        setLikedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        setLikedIds(prev => new Set([...prev, id]));
      }
    } catch (err) {
      console.error('Error al cambiar like:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-gray-400 text-sm">Cargando recetas guardadas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-red-200">
        <p className="text-red-500 mb-3">{error}</p>
        <button onClick={fetchGuardadas} className="text-orange-600 font-semibold hover:underline text-sm">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {recetas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin recetas guardadas</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Explora la comunidad y dale ❤️ a las recetas que te inspiren para verlas aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
          {recetas.map((receta, index) => (
            <AnimateOnScrollItem key={receta.id} index={index}>
              <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden flex flex-col cursor-pointer"
                onClick={() => setSelectedReceta(receta)}
              >
                {/* Imagen */}
                <div className="relative h-44 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
                  {receta.imageUrl ? (
                    <img
                      src={receta.imageUrl}
                      alt={receta.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-12 h-12 text-orange-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {/* Badge liked */}
                  <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img src={avatarUrl(receta.creador?.username)} alt="" className="w-5 h-5 rounded-full" />
                    <span className="text-xs text-gray-400">@{receta.creador?.username}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{receta.titulo}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 flex-1">{receta.descripcion}</p>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{receta.categoria}</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleLike(receta.id); }}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors font-medium"
                    >
                      <Heart className="w-3.5 h-3.5 fill-red-400" />
                      {receta.likes}
                    </button>
                  </div>
                </div>
              </div>
            </AnimateOnScrollItem>
          ))}
        </div>
      )}

      <RecipeDetailModal
        receta={selectedReceta}
        isOpen={!!selectedReceta}
        onClose={() => setSelectedReceta(null)}
        onLike={handleLike}
        likedByMe={selectedReceta ? likedIds.has(selectedReceta.id) : false}
      />
    </>
  );
}
