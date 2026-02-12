import React, { useState } from 'react';

// Recibimos la función 'onNavigate' desde App.jsx
const Navbar = ({ onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Función auxiliar para navegar y cerrar el menú móvil al mismo tiempo
  const handleMobileNavigate = (view) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* LOGO (Clic lleva al Feed) */}
          <div className="flex-shrink-0 flex items-center">
            <span 
              onClick={() => onNavigate('feed')} 
              className="text-orange-500 font-bold text-2xl cursor-pointer select-none"
            >
              RecetaSocial
            </span>
          </div>

          {/* MENÚ DE ESCRITORIO */}
          <div className="hidden md:flex space-x-8 items-center">
            <button 
              onClick={() => onNavigate('feed')} 
              className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Inicio
            </button>

            <button
              onClick={() => onNavigate('explore')}
              className='text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition'
              >
                Explorar
            </button>
            
            <button 
              onClick={() => onNavigate('create')} 
              className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-full text-sm font-medium transition shadow-sm"
            >
              + Crear Receta
            </button>

            {/* AVATAR DE USUARIO */}
            <div className="relative ml-3">
              <div>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-orange-300 transition"
                >
                  <img className="h-8 w-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Avatar" />
                </button>
              </div>

              {/* Dropdown del perfil */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <button onClick={() => { onNavigate('Profile'); setIsProfileOpen(false);}}className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Guardados</button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Cerrar Sesión</button>
                </div>
              )}
            </div>
          </div>

          {/* BOTÓN MÓVIL (HAMBURGUESA) */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-orange-500 hover:bg-gray-100 focus:outline-none"
            >
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => handleMobileNavigate('feed')}
              className="w-full text-left text-gray-900 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              Inicio
            </button>
            <button 
              onClick={() => handleMobileNavigate('explore')}
              className="w-full text-left text-gray-900 hover:text-orange-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              Explorar
            </button>
            <button 
              onClick={() => handleMobileNavigate('create')}
              className="w-full text-left text-orange-600 font-bold block px-3 py-2 rounded-md text-base"
            >
              + Crear Receta
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;