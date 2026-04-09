import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useMountTransition } from '../hooks/useMountTransition';
import { crearReceta, actualizarReceta } from '../api/recipeApi';

export default function RecipeForm({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    ingredientes: [],
    instrucciones: '',
    imageUrl: '',
    categoria: 'Desayuno',
    estado: 'borrador',
  });
  const [nuevoIngrediente, setNuevoIngrediente] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || '',
        descripcion: initialData.descripcion || '',
        ingredientes: initialData.ingredientes || [],
        instrucciones: initialData.instrucciones || '',
        imageUrl: initialData.imageUrl || '',
        categoria: initialData.categoria || 'Desayuno',
        estado: initialData.estado || 'borrador',
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        ingredientes: [],
        instrucciones: '',
        imageUrl: '',
        categoria: 'Desayuno',
        estado: 'borrador',
      });
    }
    setErrors({});
    setApiError('');
    setNuevoIngrediente('');
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es obligatorio';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
    if (!formData.instrucciones.trim()) newErrors.instrucciones = 'Las instrucciones son obligatorias';
    if (formData.ingredientes.length === 0) newErrors.ingredientes = 'Agrega al menos un ingrediente';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const agregarIngrediente = () => {
    const trimmed = nuevoIngrediente.trim();
    if (!trimmed) return;
    setFormData(prev => ({ ...prev, ingredientes: [...prev.ingredientes, trimmed] }));
    setNuevoIngrediente('');
    if (errors.ingredientes) setErrors(prev => ({ ...prev, ingredientes: '' }));
  };

  const eliminarIngrediente = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');
    try {
      let result;
      if (initialData?.id) {
        result = await actualizarReceta(initialData.id, formData);
      } else {
        result = await crearReceta(formData);
      }
      onSave(result.receta);
      onClose();
    } catch (err) {
      setApiError(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasTransitionedIn = useMountTransition(isOpen, 300);
  if (!isOpen && !hasTransitionedIn) return null;

  const isEditing = !!initialData;
  const isVisible = isOpen && hasTransitionedIn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-left">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Receta' : 'Nueva Receta'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="recipe-form" onSubmit={handleSubmit} className="space-y-5">

            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {apiError}
              </div>
            )}

            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Tacos al Pastor"
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.titulo ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none`}
              />
              {errors.titulo && <p className="mt-1 text-sm text-red-500">{errors.titulo}</p>}
            </div>

            {/* Descripción corta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Descripción corta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Un resumen atractivo de tu platillo (1-2 oraciones)"
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none`}
              />
              {errors.descripcion && <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>}
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ingredientes <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ej. 500g de harina"
                  value={nuevoIngrediente}
                  onChange={e => setNuevoIngrediente(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregarIngrediente())}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={agregarIngrediente}
                  className="px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-1 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              {formData.ingredientes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.ingredientes.map((ing, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      {ing}
                      <button type="button" onClick={() => eliminarIngrediente(i)} className="text-orange-600 hover:text-orange-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.ingredientes && <p className="mt-1 text-sm text-red-500">{errors.ingredientes}</p>}
            </div>

            {/* Instrucciones */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Instrucciones de elaboración <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="5"
                placeholder="Describe paso a paso cómo preparar tu platillo..."
                value={formData.instrucciones}
                onChange={e => setFormData({ ...formData, instrucciones: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.instrucciones ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none resize-none`}
              />
              {errors.instrucciones && <p className="mt-1 text-sm text-red-500">{errors.instrucciones}</p>}
            </div>

            {/* Categoría y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all outline-none"
                >
                  <option>Desayuno</option>
                  <option>Almuerzo</option>
                  <option>Cena</option>
                  <option>Postre</option>
                  <option>Bebida</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all outline-none"
                >
                  <option value="publicado">Publicado</option>
                  <option value="borrador">Borrador</option>
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                URL de la Imagen (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                />
              </div>
              {formData.imageUrl && (
                <div className="mt-3 relative h-32 w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                    onLoad={e => { e.target.style.display = 'block'; }}
                  />
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="recipe-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Receta'}
          </button>
        </div>
      </div>
    </div>
  );
}
