import { useState, useEffect, useCallback } from 'react';
import { obtenerMisRecetas, eliminarReceta as apiEliminarReceta } from '../api/recipeApi';

/**
 * Hook para gestionar las recetas del usuario autenticado.
 * Recibe `currentUser` (username o null) como dependencia:
 *  - Al cambiar de usuario → limpia el estado y re-fetcha las recetas del nuevo usuario.
 *  - Al cerrar sesión (currentUser = null) → limpia el estado sin hacer fetch.
 */
export function useRecipes(currentUser) {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipes = useCallback(async () => {
    // Solo intentar si hay un usuario autenticado con token
    const token = localStorage.getItem('token');
    if (!token) {
      setRecipes([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { recetas } = await obtenerMisRecetas();
      setRecipes(recetas);
    } catch (err) {
      console.error('Error al cargar recetas:', err);
      setError(err.message);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // No deps — la dependencia del usuario llega desde el useEffect de abajo

  // Se dispara cada vez que cambia el usuario autenticado:
  //   - null → limpia (logout)
  //   - nuevo username → carga sus propias recetas
  useEffect(() => {
    if (!currentUser) {
      // Usuario desconectado: limpiar inmediatamente sin llamar a la API
      setRecipes([]);
      setError(null);
      return;
    }
    // Usuario conectado: cargar sus recetas
    fetchRecipes();
  }, [currentUser, fetchRecipes]);

  // Agrega la receta recién creada al estado local
  const addRecipe = (receta) => {
    setRecipes(prev => [receta, ...prev]);
  };

  // Actualiza la receta editada en el estado local
  const updateRecipe = (id, recetaActualizada) => {
    setRecipes(prev =>
      prev.map(r => (r.id === id ? recetaActualizada : r))
    );
  };

  // Elimina la receta del servidor y del estado local
  const deleteRecipe = async (id) => {
    try {
      await apiEliminarReceta(id);
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error al eliminar receta:', err);
      throw err;
    }
  };

  return {
    recipes,
    isLoading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    refreshRecipes: fetchRecipes,
  };
}
