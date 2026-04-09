const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_HOST}/api/recetas`;
const AUTH_URL = `${API_HOST}/api/auth`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchWithAuth = async (url, options = {}) => {
  let res = await fetch(url, { ...options, headers: getAuthHeaders(), credentials: 'include' });

  if (res.status === 401 || res.status === 403) {
    try {
      const refreshRes = await fetch(`${AUTH_URL}/refresh`, { method: 'POST', credentials: 'include' });
      if (!refreshRes.ok) throw new Error('REFRESH_FAILED');
      const { accessToken } = await refreshRes.json();
      localStorage.setItem('token', accessToken);
      res = await fetch(url, { ...options, headers: getAuthHeaders(), credentials: 'include' });
      if (!res.ok) throw new Error('UNAUTHORIZED');
    } catch {
      throw new Error('UNAUTHORIZED');
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Error en petición');
  }
  return res.json();
};

// ── API pública ───────────────────────────────────────────────────────────────

/** Lista recetas publicadas (paginadas). Parámetros opcionales: pagina, limite, categoria, buscar */
export const obtenerRecetas = async ({ pagina = 1, limite = 10, categoria, buscar } = {}) => {
  const params = new URLSearchParams({ pagina, limite });
  if (categoria && categoria !== 'Todas') params.set('categoria', categoria);
  if (buscar) params.set('buscar', buscar);
  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error('Error al cargar recetas.');
  return res.json();
};

/** Obtiene una receta por su ID */
export const obtenerRecetaPorId = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error('Receta no encontrada.');
  return res.json();
};

// ── API protegida (requiere sesión activa) ────────────────────────────────────

/** Devuelve las recetas del usuario autenticado */
export const obtenerMisRecetas = () =>
  fetchWithAuth(`${BASE_URL}/mis-recetas`);

/**
 * Crea una nueva receta.
 * @param {{ titulo, descripcion, ingredientes: string[], instrucciones, imageUrl?, categoria?, estado? }} data
 */
export const crearReceta = (data) =>
  fetchWithAuth(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Actualiza una receta existente (solo el creador).
 * @param {number} id
 * @param {object} data - Campos a actualizar
 */
export const actualizarReceta = (id, data) =>
  fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Elimina una receta (solo el creador).
 * @param {number} id
 */
export const eliminarReceta = (id) =>
  fetchWithAuth(`${BASE_URL}/${id}`, { method: 'DELETE' });

/** Da o quita like. Devuelve { liked: boolean, likes: number } */
export const toggleLike = (id) =>
  fetchWithAuth(`${BASE_URL}/${id}/like`, { method: 'POST' });

/** Recetas que el usuario autenticado ha marcado con like (guardadas) */
export const obtenerGuardadas = () =>
  fetchWithAuth(`${BASE_URL}/guardadas`);