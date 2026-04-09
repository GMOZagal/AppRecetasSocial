import React, { useRef, useState, useEffect } from 'react';

export default function MagneticButton({ children, className = '', magneticPull = 0.3 }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    // Get the bounding rectangle of the element
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate the center point of the element
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate the distance from mouse to the center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Apply the pull factor
    setPosition({
      x: distanceX * magneticPull,
      y: distanceY * magneticPull
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 && position.y === 0 
          ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' // Spring back slowly
          : 'transform 0.1s linear' // Follow mouse quickly without delay lag
      }}
    >
      {children}
    </div>
  );
}
