/**
 * EventBus (Observer / Pub-Sub Pattern)
 * 
 * Provides a central decoupled messaging channel. 
 * Allows components to publish and subscribe to events without 
 * needing to know about each other or pass props down the tree.
 */
class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Suscribe a un evento
   * @param {string} event - Nombre del evento (ej: 'SHOW_TOAST')
   * @param {function} callback - Función a ejecutar cuando ocurra el evento
   */
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return an unsubscribe function for convenience
    return () => this.unsubscribe(event, callback);
  }

  /**
   * Desuscribe una función de un evento
   */
  unsubscribe(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Publica un evento, notificando a todos los suscriptores
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos a pasar a los callbacks
   */
  publish(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

// Export a singleton instance to be used globally
export const eventBus = new EventBus();
