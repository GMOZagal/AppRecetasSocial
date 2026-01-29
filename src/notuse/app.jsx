// este es el dash original
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Aquí insertamos el componente de la Actividad 2 */}
      <Navbar />

      {/* Contenido de relleno para probar el scroll y ver que el menú es fijo */}
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Bienvenido a CocinaSocial</h1>
        <p className="text-gray-600 mb-8">
          Haz scroll hacia abajo para verificar que el menú se queda fijo arriba (Sticky/Fixed).
        </p>
        
        {/* Generamos muchos párrafos para forzar el scroll */}
        {[...Array(20)].map((_, i) => (
          <p key={i} className="mb-4 text-gray-500">
            Contenido de prueba para verificar la navegación... (Párrafo {i + 1})
          </p>
        ))}
      </div>
    </div>
  )
}

export default App