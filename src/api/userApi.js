const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_HOST}/api/user`;
const AUTH_URL = `${API_HOST}/api/auth`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const fetchWithAuth = async (url, options = {}) => {
  // Aseguramos credentials: 'include' para enviar cookies como el refreshToken
  let res = await fetch(url, { ...options, headers: getAuthHeaders(), credentials: 'include' });
  
  if (res.status === 401 || res.status === 403) {
    // Si el JWT expiró, intentamos usar el Refresh Token de la cookie
    try {
      const refreshRes = await fetch(`${AUTH_URL}/refresh`, { method: 'POST', credentials: 'include' });
      if (!refreshRes.ok) throw new Error('REFRESH_FAILED');
      
      const { accessToken } = await refreshRes.json();
      localStorage.setItem('token', accessToken); // Guardar nuevo token fresco
      
      // Reintentar la operación
      res = await fetch(url, { ...options, headers: getAuthHeaders(), credentials: 'include' });
      if (!res.ok) throw new Error('UNAUTHORIZED');
    } catch (e) {
      throw new Error('UNAUTHORIZED');
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Error en petición web');
  }
  
  return res.json();
};

export const silentLogin = async () => {
  const refreshRes = await fetch(`${AUTH_URL}/refresh`, { method: 'POST', credentials: 'include' });
  if (!refreshRes.ok) throw new Error('No SSO session found');
  const data = await refreshRes.json();
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
};

export const serverLogout = async () => {
  const res = await fetch(`${AUTH_URL}/logout`, { method: 'POST', credentials: 'include' });
  return res.ok;
};

export const updatePassword = async (currentPassword, newPassword) => {
  return fetchWithAuth(`${BASE_URL}/password`, {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  });
};

export const toggleMFA = async (mfaEnabled) => {
  return fetchWithAuth(`${BASE_URL}/mfa`, {
    method: 'PUT',
    body: JSON.stringify({ mfaEnabled })
  });
};

export const getPreferences = async () => {
  return fetchWithAuth(`${BASE_URL}/preferences`);
};

export const updatePreferences = async (tema, idioma) => {
  return fetchWithAuth(`${BASE_URL}/preferences`, {
    method: 'PUT',
    body: JSON.stringify({ tema, idioma })
  });
};

export const getActiveSessions = async () => {
  return fetchWithAuth(`${BASE_URL}/sessions`);
};

export const revokeSession = async (id) => {
  return fetchWithAuth(`${BASE_URL}/sessions/${id}`, {
    method: 'DELETE'
  });
};

export const getAllUsers = async () => {
  return fetchWithAuth(`${BASE_URL}/all`);
};

export const updateUserRole = async (userId, role) => {
  return fetchWithAuth(`${BASE_URL}/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
};

export const deleteUsuario = async (userId) => {
  return fetchWithAuth(`${BASE_URL}/${userId}`, {
    method: 'DELETE'
  });
};

export const setupSecurityOptions = async (data) => {
  return fetchWithAuth(`${API_HOST}/api/recovery/setup`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const setupAuthenticator = async () => {
  return fetchWithAuth(`${AUTH_URL}/mfa/setup`, { method: 'GET' });
};

export const verifyAuthenticator = async (pin) => {
  return fetchWithAuth(`${AUTH_URL}/mfa/verify-setup`, {
    method: 'POST',
    body: JSON.stringify({ pin })
  });
};
