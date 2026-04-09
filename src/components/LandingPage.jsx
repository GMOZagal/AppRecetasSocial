import React from 'react';
import { ChefHat, ArrowRight } from 'lucide-react';
import HeroCarousel from './HeroCarousel';
import MagneticButton from './MagneticButton';

export default function LandingPage({ onNavigateToLogin, onNavigateToRegister }) {
  // Mock Top Recipes for the Carousel
  const topRecipes = [
    {
      id: 'r1',
      title: 'Pasta Carbonara Auténtica',
      description: 'Descubre el secreto de Roma: yemas de huevo frescas, queso pecorino romano crujiente guanciale y un toque de pimienta negra. Sin crema.',
      category: 'Cena',
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: 'r2',
      title: 'Tacos al Pastor',
      description: 'Marinado tradicional con achiote, especias y chiles secos. Asados a la perfección y servidos con piña, cilantro y cebolla fresca.',
      category: 'Almuerzo',
      imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=2000'
    },
    {
      id: 'r3',
      title: 'Tarta de Queso Vasca',
      description: 'La famosa tarta quemada de San Sebastián. Cremosa, fluida por dentro y maravillosamente tostada por fuera. Un postre inolvidable.',
      category: 'Postre',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=2000'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-orange-200 overflow-x-hidden">
      
      {/* Landing Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center border border-orange-200 shadow-sm">
              <ChefHat className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
              Recetario
            </h1>
          </div>

          <div className="flex items-center gap-4 animate-slide-up">
            <MagneticButton magneticPull={0.15}>
              <button
                onClick={onNavigateToLogin}
                className="text-gray-600 hover:text-gray-900 font-medium px-2 py-2 transition-colors"
              >
                Entrar
              </button>
            </MagneticButton>

            <MagneticButton magneticPull={0.15}>
              <button
                onClick={onNavigateToRegister}
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Registrarse
              </button>
            </MagneticButton>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 mt-20 flex flex-col">
          <HeroCarousel 
            items={topRecipes} 
            onCtaClick={onNavigateToRegister} 
          />
      </main>

    </div>
  );
}
