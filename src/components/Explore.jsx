import React, { useState, useEffect } from 'react';
import { searchRecipesAPI } from '../api/recipeApi';

const Explore = () => {
  // filtros y variables
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  
  // constante de filtros de dificultad
  const [difficultyFilter, setDifficultyFilter] = useState("Todas"); 
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // funcion de busqueda
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      // filtros que busca la api
      const response = await searchRecipesAPI(query, categoryFilter, difficultyFilter);
      if (response.status === 200) {
        setResults(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // filtro automatico
  useEffect(() => {
    handleSearch();
  }, [categoryFilter, difficultyFilter]);

  return (
    <div className="max-w-4xl mx-auto min-h-[60vh] fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Explorar Recetas</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        
        {/* BUSCADOR DE TEXTO */}
        <div className="mb-4 relative">
            <input 
              type="text"
              placeholder="Buscar por nombre (ej: Pizza)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        {/* FILTRO CATEGORIA*/}
        <div className="flex flex-col md:flex-row gap-4">
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="Todas">Todas las categorías</option>
            <option value="Mexicana">Mexicana</option>
            <option value="Italiana">Italiana</option>
            <option value="Japonesa">Japonesa</option>
            <option value="Saludable">Saludable</option>
          </select>

          {/* SELECTOR DE DIFICULTAD */}
          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="Todas">Cualquier dificultad</option>
            <option value="Baja">Fácil (Baja)</option>
            <option value="Media">Media</option>
            <option value="Alta">Difícil (Alta)</option>
            <option value="Experto">Experto</option>
          </select>

          <button 
            onClick={handleSearch}
            className="px-8 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-md whitespace-nowrap"
            disabled={loading}
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* RESULTADOS */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando resultados...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.length > 0 ? (
            results.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover"/>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800">{recipe.title}</h3>
                  <div className="flex space-x-2 mt-2">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">{recipe.category}</span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold">{recipe.difficulty}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            hasSearched && (
              <div className="col-span-3 text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No encontramos recetas con esa combinación. 🍳</p>
                <button 
                  onClick={() => {setQuery(""); setCategoryFilter("Todas"); setDifficultyFilter("Todas");}} 
                  className="mt-2 text-orange-500 font-medium hover:underline"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;