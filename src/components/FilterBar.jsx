import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowDownAZ, CalendarDays, ChevronDown } from 'lucide-react';

export default function FilterBar({ 
  searchQuery, setSearchQuery, 
  filterCategory, setFilterCategory, 
  filterStatus, setFilterStatus, 
  sortBy, setSortBy 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4 transition-all duration-300">
      {/* Top row: Search input and Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar recetas por título o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-gray-50/50"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-center shrink-0 px-4 rounded-xl border transition-colors ${isExpanded ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          title="Filtros avanzados"
        >
          <SlidersHorizontal className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline font-medium text-sm">Filtros</span>
          <ChevronDown className={`hidden sm:block w-4 h-4 ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
        </button>
      </div>

      {/* Bottom row: Filters and Sorting (ANIMATED MAX-HEIGHT) */}
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {/* Filters */}
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="All">Todas las Categorías</option>
                  <option value="Desayuno">Desayuno</option>
                  <option value="Almuerzo">Almuerzo</option>
                  <option value="Cena">Cena</option>
                  <option value="Postre">Postre</option>
                  <option value="Bebida">Bebida</option>
                </select>
              </div>

              <div className="relative flex-1 group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="All">Todos los Estados</option>
                  <option value="Publicado">Solo Publicados</option>
                  <option value="Borrador">Solo Borradores</option>
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="relative sm:w-48 group border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
              <div className="absolute top-1/2 -translate-y-1/2 left-3 flex items-center pointer-events-none text-gray-400 mt-1.5 sm:mt-0">
                {sortBy === 'dateDesc' || sortBy === 'dateAsc' ? (
                    <CalendarDays className="h-4 w-4" />
                ) : (
                    <ArrowDownAZ className="h-4 w-4" />
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="dateDesc">Más Recientes</option>
                <option value="dateAsc">Más Antiguas</option>
                <option value="titleAsc">Título (A-Z)</option>
                <option value="titleDesc">Título (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
