import React, { useState } from 'react';

const Feed = () => {
  const [activeTab, setActiveTab] = useState('populares');

  // Datos simulados (Mock Data) para visualizar el diseño
  const recipes = [
    {
      id: 1,
      title: "Pasta Carbonara Auténtica",
      author: "ChefMario",
      avatar: "https://www.nicepng.com/png/full/128-1280406_view-user-icon-png-user-circle-icon-png.png",
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      likes: 120,
      time: "20 min",
      description: "La receta original romana, sin nata, solo huevo, pecorino y guanciale."
    },
    {
      id: 2,
      title: "Tacos de Birria con Consomé",
      author: "AnaCocina",
      avatar: "https://www.nicepng.com/png/full/128-1280406_view-user-icon-png-user-circle-icon-png.png",
      image: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      likes: 85,
      time: "3 horas",
      description: "Tacos crujientes bañados en su propio jugo, ideales para fin de semana."
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* 1. SECCIÓN DE FILTROS (Navegación Secundaria) */}
      <div className="flex justify-center space-x-4 mb-8 sticky top-20 z-40 bg-gray-50 py-4">
        {['populares', 'recientes', 'seguidos'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. LISTA DE TARJETAS (CARD UI) */}
      <div className="space-y-8">
        {recipes.map((recipe) => (
          <article key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            
            {/* A. Encabezado de la Tarjeta (Autor) */}
            <div className="flex items-center p-4">
              <img src={recipe.avatar} alt={recipe.author} className="h-10 w-10 rounded-full object-cover" />
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900">{recipe.author}</p>
                <p className="text-xs text-gray-500">{recipe.time} • Público</p>
              </div>
            </div>

            {/* B. Imagen Principal (Contenido Prioritario) */}
            <div className="relative aspect-video">
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
            </div>

            {/* C. Cuerpo y Acciones (Jerarquía de Texto) */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  {/* Título Principal (H2) */}
                  <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{recipe.title}</h2>
                  {/* Descripción corta (Escaneabilidad) */}
                  <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                </div>
              </div>

              {/* D. Llamadas a la Acción (CTA) */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <span className="text-sm font-medium">{recipe.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 8 9 8z"></path></svg>
                    <span className="text-sm font-medium">Comentar</span>
                  </button>
                </div>
                
                {/* CTA Principal */}
                <button className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-bold rounded-lg hover:bg-orange-200 transition">
                  Ver Receta
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Feed;