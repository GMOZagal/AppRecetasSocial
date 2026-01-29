import React from 'react';

const Error404 = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Ícono SVG ilustrativo (Plato vacío) */}
        <svg className="mx-auto h-24 w-24 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">404</h1>
        <p className="mt-2 text-lg font-medium text-gray-900">¡Ups! No encontramos esa receta.</p>
        <p className="mt-2 text-base text-gray-500">
          Parece que la página que buscas se ha esfumado de la cocina o nunca existió.
        </p>
        
        <div className="mt-6">
          <a href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-orange-500 hover:bg-orange-600 transition shadow-md">
            Regresar al Inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default Error404;