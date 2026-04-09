// 1. IMPORTAR useEffect
import React, { useState, useEffect } from 'react';

const CreateRecipe = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  
  // ESTADOS PARA VALIDACIÓN
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  // 2. FALTABAN ESTOS ESTADOS PARA EL CAPTCHA
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // 3. FALTABA EL GENERADOR DE NÚMEROS ALEATORIOS
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1
    });
    setCaptchaAnswer(""); // Limpiamos la respuesta al generar uno nuevo
  };

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

  const addIngredient = (e) => {
    e.preventDefault();
    if (currentIngredient.trim() !== "") {
      setIngredients([...ingredients, currentIngredient]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  // FUNCIÓN DE ENVÍO CON VALIDACIÓN
  const handleSubmit = (e) => {
    e.preventDefault(); 

    // Validación del Checkbox
    if (!acceptedTerms) {
      setError("🛑 Debes aceptar las políticas de contenido para publicar.");
      return;
    }

    // 4. FALTABA LA VALIDACIÓN DE LA SUMA
    const expectedSum = captcha.num1 + captcha.num2;
    if (parseInt(captchaAnswer) !== expectedSum) {
      setError(`🤖 Verificación fallida: ${captcha.num1} + ${captcha.num2} no es ${captchaAnswer}. Intenta de nuevo.`);
      generateCaptcha(); // Generamos uno nuevo si fallan
      return;
    }

    // Si todo está correcto:
    setError("");
    alert("¡Verificación Humana Exitosa! Receta Publicada.");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-fade-in-up">
      <div className="px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Publicar nueva receta</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título del Platillo</label>
            <input 
              type="text" 
              required
              placeholder="Ej: Chiles en Nogada de la Abuela" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Foto del Platillo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors relative">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="h-64 object-cover rounded-md" />
                  <button 
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500">
                      <span>Sube un archivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredientes</label>
            <div className="flex space-x-2 mb-3">
              <input 
                type="text" 
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient(e)}
                placeholder="Ej: 500g de harina" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
              />
              <button 
                onClick={addIngredient}
                type="button"
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {ing}
                  <button type="button" onClick={() => removeIngredient(index)} className="ml-2 text-orange-600 hover:text-orange-900">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pasos de Preparación</label>
            <textarea 
              rows="4" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe paso a paso cómo preparar tu platillo..."
            ></textarea>
          </div>

          {/* CHECKBOX DE VALIDACIÓN*/}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if(e.target.checked) setError(""); 
                }}
              />
              <span className="text-sm text-gray-600">
                Confirmo que esta receta es de mi autoría o tengo derechos sobre ella, y acepto las <span className="text-orange-600 font-bold underline">Políticas de Contenido</span> y <span className="text-orange-600 font-bold underline">Acuerdos de Comunidad</span>.
              </span>
            </label>
            {/* Mensaje de error condicional */}
            {error && (
              <p className="text-red-600 text-sm mt-2 font-bold flex items-center animate-pulse">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                {error}
              </p>
            )}
          </div>
          
          {/* SECCIÓN DE CAPTCHA */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <label className="block text-sm font-bold text-orange-800 mb-2">
              🛡️ Verificación de Seguridad (Anti-Robot)
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-mono font-bold text-gray-700 bg-white px-3 py-1 rounded border border-gray-300">
                {/* Ahora sí funcionará porque 'captcha' existe */}
                {captcha.num1} + {captcha.num2} = ?
              </span>
              <input 
                type="number" 
                required
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-center font-bold"
                placeholder="#"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
              />
              <button 
                type="button" 
                onClick={generateCaptcha} 
                className="text-xs text-gray-500 underline hover:text-orange-600"
              >
                Cambiar pregunta
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Resuelve la suma para demostrar que eres humano.</p>
          </div>

          <div className="pt-2">
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