import { useState, useEffect, useRef } from 'react';

export function useScrollAnimation(options = { threshold: 0.1, triggerOnce: true }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      // Si el elemento entra en el viewport
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Dejar de observar si solo queremos la animación la primera vez (comportamiento usual)
        if (options.triggerOnce) {
          observer.unobserve(element);
        }
      } else if (!options.triggerOnce) {
        // En caso de querer repetir la animación cada vez que entra y sale
        setIsVisible(false);
      }
    }, options);

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.triggerOnce]);

  return [ref, isVisible];
}
