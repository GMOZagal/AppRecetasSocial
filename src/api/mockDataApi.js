// src/api/mockDataApi.js

const mockUsers = [
  { id: 1, name: "María Gómez", username: "mariag", avatar: "https://i.pravatar.cc/150?u=mariag", role: "Chef" },
  { id: 2, name: "Carlos Ruiz", username: "cruiz_cooks", avatar: "https://i.pravatar.cc/150?u=cruiz", role: "Aficionado" },
  { id: 3, name: "Ana Torres", username: "ana_bakes", avatar: "https://i.pravatar.cc/150?u=ana", role: "Repostera" },
  { id: 4, name: "Luis Fernández", username: "luis_f", avatar: "https://i.pravatar.cc/150?u=luis", role: "Nutricionista" },
  { id: 5, name: "Elena Ramos", username: "elena_r", avatar: "https://i.pravatar.cc/150?u=elena", role: "Aficionado" }
];

const mockPosts = [
  { id: 101, userId: 1, title: "Secretos del Risotto Perfecto", content: "El truco está en no dejar de remover y añadir el caldo poco a poco...", likes: 120, category: "Tips" },
  { id: 102, userId: 3, title: "Galletas de Chocolate Caseras", content: "Usa cacao en polvo al 70% para un sabor intenso y menos azúcar.", likes: 85, category: "Recetas" },
  { id: 103, userId: 4, title: "Platos Saludables para la Semana", content: "Prepara tus vegetales al vapor y guárdalos en recipientes herméticos.", likes: 210, category: "Saludable" },
  { id: 104, userId: 2, title: "Mi Primer Intento: Paella", content: "Quedó un poco seca, ¿algún consejo para el socarrat?", likes: 45, category: "Dudas" },
  { id: 105, userId: 1, title: "Cortes de Carne Básicos", content: "Conocer la diferencia entre lomo, costilla y falda cambiará tus asados.", likes: 150, category: "Guías" },
  { id: 106, userId: 5, title: "Batido Energético Rápido", content: "Banana, espinaca, leche de almendras y un toque de miel.", likes: 65, category: "Saludable" },
];

// Helper for simulated delay with AbortController support
const delay = (ms, signal) => {
  return new Promise((resolve, reject) => {
    // If already aborted before we start
    if (signal?.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'));
    }

    const timer = setTimeout(resolve, ms);

    // Listen for abort event while waiting
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    }
  });
};

export const fetchUsers = async (options = {}) => {
  await delay(1200, options.signal); // Simulate network latency
  // Random failure simulation (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Error de conexión al cargar usuarios');
  }
  return [...mockUsers];
};

export const fetchPosts = async (options = {}) => {
  await delay(2000, options.signal); // Simulate slightly longer network latency
  // Random failure simulation (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Servidor inalcanzable al cargar publicaciones');
  }
  return [...mockPosts];
};

/**
 * MOCK REAL-TIME API
 * Simulates checking for a new post. Returns null 70% of the time,
 * and a new mock post 30% of the time.
 */
export const fetchLatestPost = async () => {
  await delay(500); // Quick check
  if (Math.random() > 0.3) return null; // 70% chance of nothing new

  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  return {
    id: `live-post-${Date.now()}`,
    userId: randomUser.id,
    title: `Receta en Vivo: ${['Pasta al Pesto', 'Tacos al Pastor', 'Ceviche Fresco', 'Brownie Vegano'][Math.floor(Math.random() * 4)]}`,
    content: "¡Acabo de probar esta receta espectacular y tenía que compartirla con ustedes en tiempo real!",
    likes: 0,
    category: ['Tips', 'Recetas', 'Saludable'][Math.floor(Math.random() * 3)],
    isNew: true // Flag to trigger animation explicitly
  };
};
