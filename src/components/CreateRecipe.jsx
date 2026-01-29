import React, { useState } from 'react';

const CreateRecipe = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  // Función para previsualizar la imagen al seleccionarla
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para agregar ingredientes a la lista
  const addIngredient = (e) => {
    e.preventDefault(); // Evita que se recargue la página
    if (currentIngredient.trim() !== "") {
      setIngredients([...ingredients, currentIngredient]);
      setCurrentIngredient(""); // Limpia el input
    }
  };

  // Función para eliminar un ingrediente (UX)
  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Publicar nueva receta</h2>
        
        <form className="space-y-6">
          
          {/* 1. TÍTULO DE LA RECETA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título del Platillo</label>
            <input 
              type="text" 
              placeholder="Ej: Chiles en Nogada de la Abuela" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* 2. SUBIDA DE IMAGEN (Drag & Drop visual) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto del Platillo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors relative">
              
              {/* Si hay imagen, muéstrala. Si no, muestra el icono de subir */}
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="h-64 object-cover rounded-md" />
                  <button 
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                      <span>Sube un archivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                    <p className="pl-1">o arrástralo aquí</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. INGREDIENTES (Lista Dinámica) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</label>
            <div className="flex space-x-2 mb-3">
              <input 
                type="text" 
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient(e)}
                placeholder="Ej: 500g de harina" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
              <button 
                onClick={addIngredient}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Agregar
              </button>
            </div>
            
            {/* Lista de pills de ingredientes */}
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {ing}
                  <button onClick={() => removeIngredient(index)} className="ml-2 text-orange-600 hover:text-orange-900">×</button>
                </span>
              ))}
              {ingredients.length === 0 && <span className="text-sm text-gray-400 italic">No hay ingredientes agregados aún.</span>}
            </div>
          </div>

          {/* 4. PREPARACIÓN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pasos de Preparación</label>
            <textarea 
              rows="4" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe paso a paso cómo preparar tu platillo..."
            ></textarea>
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="pt-4">
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all">
              Publicar Receta
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;