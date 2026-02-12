import React, { useState, useEffect } from 'react';
import { searchRecipesAPI } from '../api/recipeApi';

const Explore = () => {
  // --- ZONA DE ESTADOS (Aquí creamos las variables) ---
  const [query, setQuery] = useState("");
  
  // ¡OJO AQUÍ! Definimos 'categoryFilter' y 'setCategoryFilter'
  const [categoryFilter, setCategoryFilter] = useState("Todas"); 
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // --- FUNCIÓN DE BÚSQUEDA ---
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await searchRecipesAPI(query, categoryFilter);
      if (response.status === 200) {
        setResults(response.data);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- EFECTO AUTOMÁTICO ---
  useEffect(() => {
    handleSearch();
  }, [categoryFilter]); // Aquí usamos la variable creada arriba

  return (
    <div className="max-w-4xl mx-auto min-h-[60vh] fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Explorar Recetas</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* INPUT DE TEXTO */}
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="¿Qué se te antoja hoy? (ej: Tacos)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* SELECTOR DE CATEGORÍA (Donde te daba error) */}
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)} // <--- ESTO DEBE COINCIDIR CON EL STATE DE ARRIBA
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="Todas">Todas las categorías</option>
            <option value="Mexicana">Mexicana</option>
            <option value="Italiana">Italiana</option>
            <option value="Japonesa">Japonesa</option>
            <option value="Saludable">Saludable</option>
          </select>

          <button 
            onClick={handleSearch}
            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
            disabled={loading}
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* RESULTADOS */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando recetas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.length > 0 ? (
            results.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover"/>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{recipe.title}</h3>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">{recipe.category}</span>
                </div>
              </div>
            ))
          ) : (
            hasSearched && <div className="col-span-3 text-center text-gray-500">No se encontraron recetas.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;