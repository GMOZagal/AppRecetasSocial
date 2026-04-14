import React, { useState, useEffect } from 'react';
import { UserPlus, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import MagneticButton from './MagneticButton';

export default function Register({ onRegister, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    adminKey: '',
  });
  
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate a simple math CAPTCHA on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Requisitos de la contraseña
  const passwordRules = [
    { id: 'length',  label: 'Mínimo 8 caracteres',   test: (p) => p.length >= 8 },
    { id: 'letter',  label: 'Al menos una letra',     test: (p) => /[a-zA-Z]/.test(p) },
    { id: 'number',  label: 'Al menos un número',     test: (p) => /[0-9]/.test(p) },
    { id: 'symbol',  label: 'Al menos un símbolo',    test: (p) => /[^a-zA-Z0-9]/.test(p) },
  ];

  const passwordValid = passwordRules.every(r => r.test(formData.password));
  const [showRules, setShowRules] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation (adminKey y phone son opcionales)
    const requiredFields = { ...formData };
    delete requiredFields.adminKey;
    delete requiredFields.phone;
    if (Object.values(requiredFields).some(val => !val.trim())) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    // Validación de contraseña
    if (!passwordValid) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
      setShowRules(true);
      return;
    }

    // CAPTCHA validation
    const expectedAnswer = captcha.num1 + captcha.num2;
    if (parseInt(captcha.answer.trim()) !== expectedAnswer) {
      setError('El CAPTCHA es incorrecto. Intenta de nuevo.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_HOST}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          adminKey: formData.adminKey.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al registrar usuario');
        generateCaptcha(); // regenerate captcha on error
      } else {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        onRegister(data.user);
      }
    } catch (err) {
      setError('No se pudo conectar al servidor. Intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-orange-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center border border-orange-200 shadow-md">
            <UserPlus className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Únete a la comunidad de Recetario
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="bg-white py-8 px-4 shadow-xl shadow-orange-100/50 sm:rounded-2xl sm:px-10 border border-gray-100 relative">
          
          <button 
            onClick={onNavigateToLogin}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
            title="Volver al Login"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
              <input
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="juanp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setShowRules(true)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="••••••••"
              />
              {/* Indicador de requisitos */}
              {showRules && (
                <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                  {passwordRules.map(rule => {
                    const ok = rule.test(formData.password);
                    return (
                      <div key={rule.id} className={`flex items-center gap-2 text-xs transition-colors duration-200 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                        {ok
                          ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número de Teléfono
                <span className="ml-1 text-xs font-normal text-gray-400">(Opcional, para recuperación por SMS)</span>
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="+52 55 1234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Key (Opcional)</label>
              <input
                name="adminKey"
                type="password"
                value={formData.adminKey}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-blue-100 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-blue-50/30"
                placeholder="Código para ser administrador"
              />
            </div>

            {/* Mock CAPTCHA Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Verificación de seguridad
              </label>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-gray-700">
                  ¿Cuánto es {captcha.num1} + {captcha.num2}?
                </span>
                <input
                  type="number"
                  required
                  value={captcha.answer}
                  onChange={(e) => {
                    setCaptcha(prev => ({ ...prev, answer: e.target.value }));
                    setError('');
                  }}
                  className="block w-20 px-3 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-center font-bold"
                  placeholder="?"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Para comprobar que no eres un robot, por favor resuelve esta suma.
              </p>
            </div>

            <div className="w-full">
              <MagneticButton className="w-full">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all hover:scale-105 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:scale-95`}
                >
                  {isLoading ? 'Registrando...' : 'Registrar Cuenta'}
                </button>
              </MagneticButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
