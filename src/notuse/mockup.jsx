import Navbar from './components/Navbar';
import Feed from './components/Feed';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      <main className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Título de Sección */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Descubre Sabores</h1>
            <p className="text-gray-500 mt-2">Las mejores recetas compartidas por la comunidad</p>
          </div>
          
          {/* Aquí insertamos el Mockup del Feed */}
          <Feed />
          
        </div>
      </main>
    </div>
  );
}

export default App;