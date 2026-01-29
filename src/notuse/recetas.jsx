import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import CreateRecipe from './components/CreateRecipe';

function App() {
  // Estado para controlar qué vista estamos viendo ('feed' o 'create')
  const [currentView, setCurrentView] = useState('feed');

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      {/* Pasamos la función setCurrentView al Navbar para que los botones funcionen.
         Nota: Tendremos que hacer un pequeño ajuste en el Navbar para recibir esta prop.
      */}
      <Navbar onNavigate={setCurrentView} />
      
      <main className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* RENDERIZADO CONDICIONAL: */}
          {currentView === 'feed' ? (
            <>
              <div className="text-center mb-8 fade-in">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Descubre Sabores</h1>
                <p className="text-gray-500 mt-2 text-lg">Las mejores recetas compartidas por la comunidad</p>
              </div>
              <Feed />
            </>
          ) : (
            /* Vista de Crear Receta */
            <div className="fade-in">
               {/* Botón "Volver" simple para mejorar UX */}
               <button 
                 onClick={() => setCurrentView('feed')}
                 className="mb-4 text-sm text-gray-500 hover:text-orange-500 flex items-center"
               >
                 ← Volver al feed
               </button>
               <CreateRecipe />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;