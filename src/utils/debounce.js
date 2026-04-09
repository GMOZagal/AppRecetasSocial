/**
 * debounce.js
 * 
 * Performance Optimization: Limits the rate at which a function can fire.
 * Useful for inputs, preventing API spam or heavy filtering on every keystroke.
 */
export function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
