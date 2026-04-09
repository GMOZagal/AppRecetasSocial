/**
 * throttle.js
 * 
 * Performance Optimization: Ensures a function is called at most once
 * in a specified time period. Perfect for high-frequency events like scrolling.
 */
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}
