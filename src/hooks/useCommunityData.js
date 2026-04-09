import { useState, useEffect, useCallback, useRef } from 'react';
import { obtenerRecetas } from '../api/recipeApi';

// Caché en memoria: evita re-fetches innecesarios mientras la página no se recarga
const memoryCache = {
  recetas: null,
  timestamp: 0,
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos (más corto porque son datos reales en vivo)

export function useCommunityData() {
  const [recetas, setRecetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const isCacheValid = memoryCache.recetas && (now - memoryCache.timestamp < CACHE_DURATION);

    if (!forceRefresh && isCacheValid) {
      setRecetas(memoryCache.recetas);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const { recetas: data } = await obtenerRecetas({ limite: 50 });

      if (signal.aborted) return;

      memoryCache.recetas = data;
      memoryCache.timestamp = Date.now();

      setRecetas(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Error al cargar las recetas de la comunidad');
      setRecetas([]);
    } finally {
      if (!signal.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [loadData]);

  const refreshData = () => loadData(true);

  /**
   * Polling real: compara los IDs conocidos con los que devuelve el servidor.
   * Devuelve las recetas nuevas que aún no están en el estado local.
   */
  const checkForNewRecetas = useCallback(async (knownIds) => {
    try {
      const { recetas: latest } = await obtenerRecetas({ limite: 20 });
      const nuevas = latest.filter(r => !knownIds.has(r.id));
      if (nuevas.length > 0) {
        setRecetas(prev => {
          const prevIds = new Set(prev.map(r => r.id));
          const sinDuplicados = nuevas.filter(r => !prevIds.has(r.id));
          return sinDuplicados.length > 0 ? [...sinDuplicados, ...prev] : prev;
        });
        // Actualizar caché
        if (memoryCache.recetas) {
          const prevIds = new Set(memoryCache.recetas.map(r => r.id));
          memoryCache.recetas = [
            ...nuevas.filter(r => !prevIds.has(r.id)),
            ...memoryCache.recetas
          ];
        }
      }
      return nuevas;
    } catch {
      return [];
    }
  }, []);

  return { recetas, isLoading, error, refreshData, checkForNewRecetas };
}
