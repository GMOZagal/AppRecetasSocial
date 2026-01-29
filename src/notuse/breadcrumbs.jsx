import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';

function App() {
  // Simulamos la ruta: Inicio > Explorar > Recetas Mexicanas > Tacos al Pastor
  const breadcrumbPath = [
    { label: 'Explorar', href: '#' },
    { label: 'Recetas Mexicanas', href: '#' },
    { label: 'Tacos al Pastor', href: '#' }, // El último no lleva link
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="pt-24 px-4 max-w-7xl mx-auto">
        
        {/* AQUÍ ESTÁ EL COMPONENTE DE LA ACTIVIDAD 3 */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbPath} />
        </div>

        {/* Contenido simulado de la receta */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tacos al Pastor Caseros</h1>
          <div className="h-64 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
            <span className="text-orange-400 font-medium">Imagen de la Receta</span>
          </div>
          <p className="text-gray-600">
            Aquí iría la descripción completa de la receta, los ingredientes y los pasos de preparación...
          </p>
        </div>
      </div>
    </div>
  )
}

export default App