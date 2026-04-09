import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function AnimateOnScrollItem({ children, className = '', index = 0, as: Component = 'div', style = {} }) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  
  // Staggered cascade: delays start incrementing by 100ms per index. Max 10.
  const staggerDelay = (index % 10) * 100;

  return (
    <Component
      ref={ref}
      style={{ ...style, transitionDelay: `${staggerDelay}ms` }}
      className={`animate-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </Component>
  );
}
