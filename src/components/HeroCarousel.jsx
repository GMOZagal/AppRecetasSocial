import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function HeroCarousel({ items, onCtaClick }) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const dragStartRef = useRef(0);

  // For infinite scroll illusion, we clone the first and last slides
  const slides = [...items];
  const firstClone = { ...slides[0], _id: 'clone-first' };
  const lastClone = { ...slides[slides.length - 1], _id: 'clone-last' };
  
  // Custom CTA slide at the end
  const ctaSlide = {
    _id: 'cta-slide',
    isCTA: true,
    title: 'Descubre tu próxima receta',
    subtitle: 'Únete a la comunidad de amantes de la cocina y comparte tus creaciones.',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80&w=2000'
  };

  const extendedSlides = [lastClone, ctaSlide, ...slides, ctaSlide, firstClone];
  const realSlideCount = slides.length + 1; // +1 for the CTA slide

  // --- AutoPlay Logic ---
  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentIndex]); // Restart timer if manually changed

  // --- Navigation Defaults ---
  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDotClick = (index) => {
    if (isTransitioning || currentIndex === index + 2) return;
    setIsTransitioning(true);
    setCurrentIndex(index + 2); // Shift by 2 because of clone + cta at start
  };

  // --- Infinite Loop Trick ---
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    
    // If we reached the end clone (index: length - 1)
    if (currentIndex === extendedSlides.length - 1) {
      setCurrentIndex(3); // Snap back to the real first slide (index 3 because [lastClone, CTA_CLONE, slide1, slide2...])
    }
    // If we moved backwards to the start clone (index: 0)
    else if (currentIndex === 0) {
      setCurrentIndex(extendedSlides.length - 3); // Snap to real last slide
    }
    else if (currentIndex === 1) {
       // It landed on the CTA clone at the beginning, snap back to the real CTA at the end
       setCurrentIndex(extendedSlides.length - 2);
    }
  };

  // --- Touch/Swipe Events ---
  const onDragStart = (e) => {
    stopAutoPlay();
    setIsDragging(true);
    setIsTransitioning(false); // Stop CSS transition while dragging
    dragStartRef.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  };

  const dragRafRef = useRef(null);

  const onDragMove = (e) => {
    if (!isDragging) return;
    const currentPosition = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const diff = currentPosition - dragStartRef.current;
    
    // Performance Optimization: Minimize Reflows with requestAnimationFrame
    if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
    dragRafRef.current = requestAnimationFrame(() => {
      setDragOffset(diff);
    });
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsTransitioning(true);
    
    const threshold = 75; // px to drag before changing slide
    if (dragOffset > threshold) {
      setCurrentIndex((prev) => prev - 1);
    } else if (dragOffset < -threshold) {
      setCurrentIndex((prev) => prev + 1);
    }
    
    setDragOffset(0);
    startAutoPlay();
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-gray-900 group select-none touch-pan-y"
      style={{ height: 'calc(100vh - 80px)' }} // Subtract navbar height
      onMouseEnter={stopAutoPlay}
      onMouseLeave={() => { if (!isDragging) startAutoPlay(); }}
      
      // Touch/Mouse bindings
      onTouchStart={onDragStart}
      onTouchMove={onDragMove}
      onTouchEnd={onDragEnd}
      onMouseDown={onDragStart}
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
    >
      {/* The Track */}
      <div 
        ref={containerRef}
        className="flex h-full w-full will-change-transform"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
        }}
      >
        {extendedSlides.map((slide, i) => (
          <div key={`${slide._id || slide.id}-${i}`} className="w-full h-full flex-shrink-0 relative">
            
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={slide.imageUrl} 
                alt={slide.title} 
                className="w-full h-full object-cover opacity-60"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            </div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className={`max-w-3xl transform transition-all duration-700 delay-100 ${currentIndex === i ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
                {slide.category && (
                  <span className="inline-block px-4 py-1.5 rounded-full bg-orange-600/90 text-white font-semibold text-sm mb-6 backdrop-blur-sm shadow-xl">
                    {slide.category}
                  </span>
                )}
                
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight leading-tight">
                  {slide.title}
                </h2>
                
                {slide.isCTA ? (
                  <>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
                      {slide.subtitle}
                    </p>
                    <button 
                      onClick={onCtaClick}
                      className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-orange-600 rounded-full hover:bg-orange-500 overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95"
                    >
                      <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
                      <span className="relative flex items-center gap-2 text-lg">
                        Comezar ahora
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </>
                ) : (
                  <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md line-clamp-3">
                    {slide.description}
                  </p>
                )}
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* Manual Controls - Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-orange-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-orange-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Manual Controls - Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, idx) => {
          // Calculate if this dot is active
          // Note: index 0 and 1 in extendedSlides are clones/cta, so real slides start at index 2
          const isRealActive = currentIndex === idx + 2; 
          
          return (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`transition-all duration-300 rounded-full ${isRealActive ? 'w-8 h-2.5 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'}`}
              aria-label={`Ir a diapositiva ${idx + 1}`}
            />
          );
        })}
        {/* The CTA dot */}
        <button
          onClick={() => {
             if (isTransitioning || currentIndex === extendedSlides.length - 2) return;
             setIsTransitioning(true);
             setCurrentIndex(extendedSlides.length - 2);
          }}
          className={`transition-all duration-300 rounded-full ${currentIndex === extendedSlides.length - 2 ? 'w-8 h-2.5 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'}`}
          aria-label="Ir a diapositiva final"
        />
      </div>
    </div>
  );
}
