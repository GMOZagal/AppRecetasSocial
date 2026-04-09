import React, { useState, useEffect } from 'react';
import { Shield, Key, Laptop, Smartphone, Palette, Globe, XCircle, CheckCircle2, Monitor } from 'lucide-react';
import { updatePassword, toggleMFA, getPreferences, updatePreferences, getActiveSessions, revokeSession, setupSecurityOptions, setupAuthenticator, verifyAuthenticator } from '../api/userApi';
import MagneticButton from './MagneticButton';

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState('security');
  
  // States - Passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });
  
  // States - MFA
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [qrCodeData, setQrCodeData] = useState({ qrCode: '', secret: '' });
  const [mfaPin, setMfaPin] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  
  // States - Sessions
  const [sessions, setSessions] = useState([]);
  
  // States - Preferences
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('es');
  const [prefMessage, setPrefMessage] = useState({ text: '', type: '' });

  // States - Recovery
  const [secretQuestion, setSecretQuestion] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [phone, setPhone] = useState('');
  const [recMessage, setRecMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const prefs = await getPreferences();
      setMfaEnabled(prefs.mfaEnabled);
      setTheme(prefs.tema);
      setLanguage(prefs.idioma);

      const sess = await getActiveSessions();
      setSessions(sess);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMessage({ text: 'Actualizando...', type: 'info' });
    try {
      await updatePassword(currentPassword, newPassword);
      setPassMessage({ text: 'Contraseña actualizada correctamente', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPassMessage({ text: err.message || 'Error al actualizar', type: 'error' });
    }
    setTimeout(() => setPassMessage({ text: '', type: '' }), 3000);
  };

  const handleMfaToggle = async () => {
    if (mfaEnabled) {
      try {
        await toggleMFA(false);
        setMfaEnabled(false);
      } catch (err) {
        alert('Error al desactivar MFA');
      }
    } else {
      setShowMfaSetup(true);
      setSetupLoading(true);
      try {
        const data = await setupAuthenticator();
        setQrCodeData({ qrCode: data.qrCode, secret: data.secret });
      } catch(err) {
        alert("Error iniciando MFA");
        setShowMfaSetup(false);
      } finally {
        setSetupLoading(false);
      }
    }
  };

  const handleVerifyMfaSetup = async (e) => {
    e.preventDefault();
    setSetupLoading(true);
    try {
      await verifyAuthenticator(mfaPin);
      setMfaEnabled(true);
      setShowMfaSetup(false);
      setMfaPin('');
    } catch(err) {
      alert(err.message || 'Código inválido');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleRevokeSession = async (id) => {
    try {
      await revokeSession(id);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err) {
      alert('Error al revocar la sesión');
    }
  };

  const handleThemeChange = async (newTheme) => {
    try {
      await updatePreferences(newTheme, language);
      setTheme(newTheme);
      setPrefMessage({ text: 'Preferencia guardada', type: 'success' });
      setTimeout(() => setPrefMessage({ text: '', type: '' }), 2000);
    } catch (err) {
      alert('Error al cambiar tema');
    }
  };

  const handleLanguageChange = async (newLang) => {
    try {
      await updatePreferences(theme, newLang);
      setLanguage(newLang);
      setPrefMessage({ text: 'Preferencia guardada', type: 'success' });
      setTimeout(() => setPrefMessage({ text: '', type: '' }), 2000);
    } catch (err) {
      alert('Error al cambiar idioma');
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setRecMessage({ text: 'Guardando...', type: 'info' });
    try {
      const payload = {};
      if (phone) payload.phone = phone;
      if (secretQuestion && secretAnswer) {
        payload.secretQuestion = secretQuestion;
        payload.secretAnswer = secretAnswer;
      }
      
      if (Object.keys(payload).length > 0) {
        await setupSecurityOptions(payload);
        setRecMessage({ text: 'Opciones de recuperación guardadas', type: 'success' });
        setSecretAnswer(''); // Clear secret answer for security
      } else {
        setRecMessage({ text: 'Por favor llena algún campo', type: 'error' });
      }
    } catch (err) {
      setRecMessage({ text: err.message || 'Error al guardar', type: 'error' });
    }
    setTimeout(() => setRecMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
        Configuración de Usuario
      </h1>

      {/* MODAL CONFIGURACIÓN APPS AUTENTICADORAS */}
      {showMfaSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Seguridad: Escanea el QR</h3>
              <button onClick={() => {setShowMfaSetup(false); setMfaPin('');}} className="text-gray-400 hover:text-red-500 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {setupLoading && !qrCodeData.qrCode ? (
              <p className="text-center text-gray-500 py-8 font-medium animate-pulse">Generando Token Seguro...</p>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-600 text-center mb-4 leading-relaxed">
                  Abre tu aplicación <strong className="font-semibold text-orange-600">Google Authenticator</strong> o <strong className="font-semibold text-orange-600">Authy</strong> y escanea este código.
                </p>
                <div className="p-2 border-2 border-gray-100 rounded-xl bg-gray-50 mb-4 shadow-inner">
                  {qrCodeData.qrCode ? (
                    <img src={qrCodeData.qrCode} alt="Código QR 2FA" className="w-48 h-48 mix-blend-multiply" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                  )}
                </div>
                <form className="w-full flex flex-col gap-3" onSubmit={handleVerifyMfaSetup}>
                  <label className="text-sm font-semibold text-gray-700 text-center">Introduce el código generado:</label>
                  <input type="text" maxLength={6} required placeholder="000000" value={mfaPin} onChange={e=>setMfaPin(e.target.value)}
                         className="text-center text-3xl font-mono tracking-[0.3em] p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 shadow-sm transition-shadow" />
                  <button type="submit" disabled={setupLoading || mfaPin.length < 6}
                          className="mt-2 w-full bg-gradient-to-r from-orange-600 to-red-600 font-bold text-white py-3 rounded-xl hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-all shadow-md">
                    {setupLoading ? 'Validando...' : 'Activar Protección'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-orange-100 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Shield className="w-5 h-5" />
            Seguridad
          </button>
          
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'preferences' ? 'bg-orange-100 text-orange-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Palette className="w-5 h-5" />
            Apariencia
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          
          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-10 animate-slide-up">
              
              {/* Cambiar Contraseña */}
              <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                  <Key className="w-5 h-5 text-orange-500" /> Cambiar Contraseña
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  {passMessage.text && (
                    <div className={`p-3 text-sm rounded-lg ${passMessage.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
                      {passMessage.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                    <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  <MagneticButton>
                    <button type="submit" className="px-6 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-lg">
                      Actualizar
                    </button>
                  </MagneticButton>
                </form>
              </section>

              <hr className="border-gray-100" />

              {/* MFA */}
              <section className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Smartphone className="w-5 h-5 text-orange-500" /> Verificación en Dos Pasos (MFA)
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Protege tu cuenta requiriendo un código de verificación cada vez que inicies sesión.
                  </p>
                </div>
                <button 
                  onClick={handleMfaToggle}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${mfaEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${mfaEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </section>

              <hr className="border-gray-100" />

              {/* Opciones de Recuperación Omnicanal */}
              <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                  <Shield className="w-5 h-5 text-orange-500" /> Métodos de Recuperación
                </h2>
                <form onSubmit={handleRecoverySubmit} className="space-y-4 max-w-md">
                  {recMessage.text && (
                    <div className={`p-3 text-sm rounded-lg ${recMessage.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
                      {recMessage.text}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">Configura estos canales vitales para recuperar tu cuenta en caso de que olvides la contraseña principal.</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Para SMS o Llamada robotizada)</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+52 123 456 7890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta Secreta Personalizada</label>
                    <input type="text" value={secretQuestion} onChange={e => setSecretQuestion(e.target.value)} placeholder="Ej: Nombre de mi director de primaria"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta a la Pregunta</label>
                    <input type="password" value={secretAnswer} onChange={e => setSecretAnswer(e.target.value)} placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                  </div>

                  <MagneticButton>
                    <button type="submit" className="px-6 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-lg">
                      Guardar Métodos de Respaldo
                    </button>
                  </MagneticButton>
                </form>
              </section>

              <hr className="border-gray-100" />

              {/* Sesiones Activas */}
              <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                  <Monitor className="w-5 h-5 text-orange-500" /> Sesiones Activas
                </h2>
                <div className="space-y-4">
                  {sessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {session.dispositivo.toLowerCase().includes('mobile') || session.dispositivo.toLowerCase().includes('iphone') ? <Smartphone className="w-6 h-6 text-gray-600" /> : <Laptop className="w-6 h-6 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            {session.dispositivo} 
                            {session.isCurrent && <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">Actual</span>}
                          </p>
                          <p className="text-sm text-gray-500">Último uso: {new Date(session.lastUsedAt).toLocaleString()} • IP: {session.ipAddress}</p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <button 
                          onClick={() => handleRevokeSession(session.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Cerrar sesión
                        </button>
                      )}
                    </div>
                  ))}
                  {sessions.length === 0 && <p className="text-gray-500 text-sm">Cargando sesiones...</p>}
                </div>
              </section>

            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-10 animate-slide-up">
              {prefMessage.text && (
                <div className={`p-3 text-sm rounded-lg flex items-center gap-2 ${prefMessage.type === 'success' ? 'bg-green-50 text-green-700' : ''}`}>
                  <CheckCircle2 className="w-4 h-4" /> {prefMessage.text}
                </div>
              )}
              
              <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                  <Palette className="w-5 h-5 text-orange-500" /> Tema de la Interfaz
                </h2>
                <div className="flex gap-4">
                  <button onClick={() => handleThemeChange('light')} className={`flex-1 border-2 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 ${theme === 'light' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-300 shadow-inner" />
                    <span className="font-medium text-gray-800">Modo Claro</span>
                  </button>
                  <button onClick={() => handleThemeChange('dark')} className={`flex-1 border-2 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 ${theme === 'dark' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="w-12 h-12 bg-gray-900 rounded-full border border-gray-700 shadow-inner" />
                    <span className="font-medium text-gray-800">Modo Oscuro</span>
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-500 italic">Nota: El modo oscuro completo requeriría aplicar la clase globalmente en App.jsx, esta preferencia ya se está guardando en tu BD.</p>
              </section>

              <hr className="border-gray-100" />

              <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800">
                  <Globe className="w-5 h-5 text-orange-500" /> Idioma
                </h2>
                <div className="max-w-xs">
                  <select 
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    <option value="es">Español</option>
                    <option value="en">English (US)</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </section>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
