import React, { useState, useMemo, useRef } from 'react';
import { useCommunityData } from '../hooks/useCommunityData';
import {
  Loader2, RefreshCw, AlertCircle, Search, ChefHat,
  Heart, MessageCircle, Clock, Tag, UtensilsCrossed
} from 'lucide-react';
import AnimateOnScrollItem from './AnimateOnScrollItem';
import { debounce } from '../utils/debounce';
import { usePolling } from '../hooks/usePolling';
import { eventBus } from '../utils/eventBus';
import { EVENTS } from './GlobalToast';
import { toggleLike, eliminarReceta } from '../api/recipeApi';
import RecipeDetailModal from './RecipeDetailModal';

const avatarUrl = (username) =>
  `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`;

export default function CommunityDashboard({ userRole = 'usuario' }) {
  const { recetas, isLoading, error, refreshData, checkForNewRecetas } = useCommunityData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal de detalle
  const [selectedReceta, setSelectedReceta] = useState(null);

  // Likes optimistas: { [recetaId]: { liked: bool, likes: number } }
  const [likeState, setLikeState] = useState({});

  const debouncedSearch = useMemo(
    () => debounce((val) => setActiveSearchTerm(val), 500),
    []
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    debouncedSearch(val);
  };

  // IDs conocidos para el polling
  const knownIdsRef = useRef(new Set());
  useMemo(() => { recetas.forEach(r => knownIdsRef.current.add(r.id)); }, [recetas]);

  // Polling real cada 15 s
  usePolling(async () => {
    if (activeSearchTerm || filterCategory !== 'All') return;
    const nuevas = await checkForNewRecetas(knownIdsRef.current);
    if (nuevas.length > 0) {
      nuevas.forEach(r => knownIdsRef.current.add(r.id));
      eventBus.publish(EVENTS.SHOW_TOAST, {
        message: `¡${nuevas.length} receta${nuevas.length > 1 ? 's nuevas' : ' nueva'} en la comunidad!`,
        type: 'success',
      });
    }
  }, 15000);

  // Like handler con actualización optimista
  const handleLike = async (id) => {
    const current = likeState[id] ?? {
      liked: false,
      likes: recetas.find(r => r.id === id)?.likes ?? 0,
    };
    // Actualizar optimistamente
    setLikeState(prev => ({
      ...prev,
      [id]: { liked: !current.liked, likes: current.liked ? current.likes - 1 : current.likes + 1 },
    }));
    // Si hay modal abierto, actualizar también
    if (selectedReceta?.id === id) {
      setSelectedReceta(prev => ({
        ...prev,
        likes: current.liked ? current.likes - 1 : current.likes + 1,
      }));
    }
    try {
      const { liked, likes } = await toggleLike(id);
      setLikeState(prev => ({ ...prev, [id]: { liked, likes } }));
      if (selectedReceta?.id === id) {
        setSelectedReceta(prev => ({ ...prev, likes }));
      }
    } catch {
      // Revertir si falla
      setLikeState(prev => ({ ...prev, [id]: current }));
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post de la comunidad? (Acción de moderación)')) return;
    try {
      await eliminarReceta(id);
      eventBus.publish(EVENTS.SHOW_TOAST, { message: 'Receta eliminada correctamente', type: 'success' });
      setSelectedReceta(null);
      refreshData();
    } catch (err) {
      eventBus.publish(EVENTS.SHOW_TOAST, { message: err.message || 'Error al eliminar', type: 'error' });
    }
  };

  // Filtros derivados
  const filteredRecetas = useMemo(() => {
    let result = [...recetas];
    if (activeSearchTerm) {
      const q = activeSearchTerm.toLowerCase();
      result = result.filter(r =>
        (r.titulo || '').toLowerCase().includes(q) ||
        (r.descripcion || '').toLowerCase().includes(q) ||
        (r.creador?.username || '').toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'All') result = result.filter(r => r.categoria === filterCategory);
    return result;
  }, [recetas, activeSearchTerm, filterCategory]);

  const chefsDestacados = useMemo(() => {
    const map = {};
    recetas.forEach(r => {
      const u = r.creador;
      if (!u) return;
      if (!map[u.id]) map[u.id] = { ...u, total: 0 };
      map[u.id].total += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [recetas]);

  const filteredChefs = useMemo(() => {
    if (!activeSearchTerm) return chefsDestacados;
    const q = activeSearchTerm.toLowerCase();
    return chefsDestacados.filter(u => (u.username || '').toLowerCase().includes(q));
  }, [chefsDestacados, activeSearchTerm]);

  const categorias = useMemo(() => {
    const set = new Set(recetas.map(r => r.categoria).filter(Boolean));
    return Array.from(set).sort();
  }, [recetas]);

  return (
    <div className="space-y-6">

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-24 z-10">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
            placeholder="Buscar recetas, chefs..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            disabled={isLoading || !!error}
            className="block w-full md:w-auto pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-xl bg-white"
          >
            <option value="All">Todas las Categorías</option>
            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-medium border border-orange-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm animate-fade-in">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error al cargar recetas</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button onClick={refreshData} className="mt-2 text-sm font-medium text-red-800 underline">
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-fade-in">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-500 font-medium">Cargando recetas de la comunidad...</p>
        </div>
      )}

      {/* Contenido */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">

          {/* Feed principal (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-600" />
              Recetas Publicadas
              <span className="ml-auto text-sm font-normal text-gray-400">
                {filteredRecetas.length} receta{filteredRecetas.length !== 1 ? 's' : ''}
              </span>
            </h2>

            {filteredRecetas.length > 0 ? (
              <div className="space-y-4">
                {filteredRecetas.map((receta, index) => {
                  const ls = likeState[receta.id];
                  const liked = ls?.liked ?? false;
                  const likesCount = ls?.likes ?? receta.likes;

                  return (
                    <div key={receta.id} className={receta.isNew ? 'animate-[dropIn_0.6s_ease-out_forwards]' : ''}>
                      <AnimateOnScrollItem
                        index={index}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden cursor-pointer group"
                      >
                        {/* Imagen clickable */}
                        {receta.imageUrl && (
                          <div className="relative h-48 overflow-hidden" onClick={() => setSelectedReceta(receta)}>
                            <img
                              src={receta.imageUrl}
                              alt={receta.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}

                        <div className="p-6" onClick={() => setSelectedReceta(receta)}>
                          {/* Autor + categoría */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={avatarUrl(receta.creador?.username)}
                                alt={receta.creador?.username}
                                loading="lazy"
                                className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50"
                              />
                              <div>
                                <p className="font-semibold text-gray-900 leading-tight">
                                  @{receta.creador?.username || 'usuario'}
                                </p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(receta.createdAt).toLocaleDateString('es-MX', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Tag className="w-3 h-3" />{receta.categoria}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                            {receta.titulo}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{receta.descripcion}</p>

                          {/* Preview ingredientes */}
                          {receta.ingredientes?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {receta.ingredientes.slice(0, 4).map((ing, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{ing}</span>
                              ))}
                              {receta.ingredientes.length > 4 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs">
                                  +{receta.ingredientes.length - 4} más
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Métricas — no propagan el click al modal */}
                        <div
                          className="px-6 pb-4 flex items-center gap-4 text-sm text-gray-400"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleLike(receta.id)}
                            className={`flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl ${
                              liked
                                ? 'text-red-500 bg-red-50 border border-red-100'
                                : 'hover:text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                            {likesCount}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />{receta.totalComentarios}
                          </span>
                          <span
                            className="ml-auto text-xs text-orange-600 font-medium cursor-pointer hover:underline"
                            onClick={() => setSelectedReceta(receta)}
                          >
                            Ver receta completa →
                          </span>
                        </div>
                      </AnimateOnScrollItem>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No hay recetas publicadas.</p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeSearchTerm || filterCategory !== 'All'
                    ? 'Intenta ajustar tus filtros.'
                    : '¡Sé el primero en compartir una receta!'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar chefs + stats (1/3) */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-orange-500" />
              Chefs Activos
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredChefs.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {filteredChefs.map((chef, index) => (
                    <AnimateOnScrollItem as="li" key={chef.id} index={index}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img src={avatarUrl(chef.username)} alt={chef.username} className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">@{chef.username}</p>
                          <p className="text-xs text-gray-400">{chef.total} receta{chef.total !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Chef</span>
                    </AnimateOnScrollItem>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-8 text-sm text-gray-400">No hay chefs que coincidan.</p>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100 p-5 space-y-3">
              <h3 className="font-bold text-gray-800 text-sm">Comunidad en números</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-extrabold text-orange-600">{recetas.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Recetas publicadas</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-2xl font-extrabold text-orange-600">{chefsDestacados.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Chefs activos</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Modal de detalle */}
      <RecipeDetailModal
        receta={selectedReceta}
        isOpen={!!selectedReceta}
        onClose={() => setSelectedReceta(null)}
        onLike={handleLike}
        likedByMe={selectedReceta ? (likeState[selectedReceta.id]?.liked ?? false) : false}
        userRole={userRole}
        onDelete={handleDeleteRecipe}
      />
    </div>
  );
}
