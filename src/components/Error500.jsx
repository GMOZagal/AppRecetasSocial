import React from 'react';

const Error500 = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Ícono SVG de advertencia/fuego */}
        <svg className="mx-auto h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">500</h1>
        <p className="mt-2 text-lg font-medium text-gray-900">¡Problemas en la cocina!</p>
        <p className="mt-2 text-base text-gray-500">
          Nuestro chef (el servidor) está teniendo dificultades técnicas. Por favor, intenta de nuevo en unos minutos.
        </p>
        
        <div className="mt-6 flex justify-center space-x-4">
          <button onClick={() => window.location.reload()} className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
            Recargar página
          </button>
          <a href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-orange-600 bg-orange-100 hover:bg-orange-200">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default Error500;