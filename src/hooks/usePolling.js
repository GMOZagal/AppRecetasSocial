import { useEffect, useRef } from 'react';

/**
 * Intelligent Polling Hook
 * 
 * Performance Optimization:
 * Listens to the Page Visibility API. If the user changes tabs or minimizes
 * the browser, the polling stops entirely to save network and CPU resources.
 * 
 * @param {Function} callback - The async function to execute during the poll.
 * @param {number} delay - The interval in milliseconds (default 10s).
 */
export function usePolling(callback, delay = 10000) {
  const savedCallback = useRef();
  const isTabActive = useRef(true);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval and exact intelligent visibility logic
  useEffect(() => {
    let intervalId;

    const tick = () => {
      // Control de Frecuencia: only trigger if tab is visible
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    };

    const handleVisibilityChange = () => {
      isTabActive.current = document.visibilityState === 'visible';
      
      if (isTabActive.current) {
        // Immediately fetch if coming back after being hidden
        tick();
      }
    };

    // Start interval
    intervalId = setInterval(tick, delay);

    // Attach visibility listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay]);
}
