const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_HOST}/api/recovery`;

export const requestEmailReset = async (email) => {
  const res = await fetch(`${BASE_URL}/email/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const error = await res.json().catch(()=>({}));
    throw new Error(error.error || 'Error al solicitar enlace de correo');
  }
  return res.json();
};

export const executeEmailReset = async (token, newPassword) => {
  const res = await fetch(`${BASE_URL}/email/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Error al restablecer contraseña');
  return res.json();
};

export const getSecretQuestion = async (identifier) => {
  const res = await fetch(`${BASE_URL}/question/${identifier}`);
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Error al obtener pregunta secreta');
  return res.json();
};

export const executeSecretReset = async (identifier, answer, newPassword) => {
  const res = await fetch(`${BASE_URL}/question/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, answer, newPassword })
  });
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Error al verificar respuesta');
  return res.json();
};

export const requestPhoneRecovery = async (identifier, method) => {
  const res = await fetch(`${BASE_URL}/phone/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, method })
  });
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Error al solicitar código telefónico');
  return res.json();
};

export const executePhoneReset = async (identifier, otpCode, newPassword) => {
  const res = await fetch(`${BASE_URL}/phone/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otpCode, newPassword })
  });
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Error al procesar el código temporal');
  return res.json();
};
