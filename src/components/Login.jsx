import React, { useState } from 'react';
import { ChefHat, Lock, User, KeyRound } from 'lucide-react';
import MagneticButton from './MagneticButton';

export default function Login({ onLogin, onNavigateToRegister, onNavigateToForgot }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [mfaMethod, setMfaMethod] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_HOST}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
      } else {
        if (data.mfaRequired) {
          // Cambiar al paso 2 y guardar el email para verificar el OTP
          setStep(2);
          setEmail(data.email);
          setMfaMethod(data.method);
          setMessage(data.message);
        } else {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLogin(data.user);
        }
      }
    } catch (err) {
      setError('No se pudo conectar al servidor. Intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 6) {
      setError('Por favor, ingresa el código de 6 dígitos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_HOST}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Código inválido o expirado.');
      } else {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch (err) {
      setError('No se pudo conectar al servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-orange-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center border border-orange-200 shadow-md transform transition-transform hover:scale-110">
            {step === 1 ? <ChefHat className="w-10 h-10 text-orange-600" /> : <KeyRound className="w-10 h-10 text-orange-600" />}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
          {step === 1 ? 'Bienvenido a Recetario' : 'Verificación de Seguridad'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 ? 'Inicia sesión para gestionar tus recetas favoritas' : 
            (mfaMethod === 'authenticator' ? 'Abre la aplicación vinculada para obtener tu código' : 'Ingresa el código temporal que hemos enviado a tu correo')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="bg-white py-8 px-4 shadow-xl shadow-orange-100/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Usuario o Correo
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                    placeholder="Tu nombre de usuario o email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end -mt-2">
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="font-medium text-sm text-orange-600 hover:text-orange-500 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="w-full">
                <MagneticButton className="w-full">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all hover:scale-105 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-95`}
                  >
                    {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                  </button>
                </MagneticButton>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              {message && (
                <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-md">
                  {message}
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">
                  Código OTP (6 dígitos)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otpCode"
                    name="otpCode"
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors text-center tracking-widest font-bold text-lg"
                    placeholder="123456"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {mfaMethod === 'authenticator'
                    ? "Abre tu aplicación Google Authenticator o Authy para ver tu código dinámico."
                    : "Hemos enviado un código temporal de 6 dígitos a tu correo. Tienes 5 minutos para ingresarlo."}
                </p>
              </div>

              <div className="w-full">
                <MagneticButton className="w-full">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all hover:scale-105 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-95`}
                  >
                    {isLoading ? 'Verificando...' : 'Verificar y Entrar'}
                  </button>
                </MagneticButton>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-4 w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium text-gray-600 bg-transparent hover:text-gray-900 focus:outline-none transition-all"
                >
                  Volver al Login
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    ¿No tienes una cuenta?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={onNavigateToRegister}
                  type="button"
                  className="w-full flex justify-center py-2.5 px-4 border-2 border-orange-200 rounded-xl shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                >
                  Crear Usuario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
