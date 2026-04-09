import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, PhoneCall, HelpCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { 
  requestEmailReset, executeEmailReset, 
  getSecretQuestion, executeSecretReset, 
  requestPhoneRecovery, executePhoneReset 
} from '../api/recoveryApi';

export default function ForgotPassword({ onNavigateToLogin }) {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Context data
  const [questionText, setQuestionText] = useState('');
  const [phoneHint, setPhoneHint] = useState('');

  // Form inputs
  const [answer, setAnswer] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [emailToken, setEmailToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) return setError('Por favor ingresa tu usuario o correo');
    setError('');
    // Al no saber qué método elegirá, solo validaremos después. Movemos al step 2.
    setStep(2);
  };

  const selectMethod = async (selectedMethod) => {
    setMethod(selectedMethod);
    setError('');
    setIsLoading(true);

    try {
      if (selectedMethod === 'email') {
        await requestEmailReset(identifier);
        setStep(3); // In step 3 for email: user pastes the token they got in console
      } else if (selectedMethod === 'question') {
        const res = await getSecretQuestion(identifier);
        setQuestionText(res.question);
        setStep(3);
      } else if (selectedMethod === 'sms' || selectedMethod === 'call') {
        const res = await requestPhoneRecovery(identifier, selectedMethod);
        setPhoneHint(res.phoneHint);
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar método de recuperación');
      setMethod('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (method === 'email') {
        await executeEmailReset(emailToken, newPassword);
      } else if (method === 'question') {
        await executeSecretReset(identifier, answer, newPassword);
      } else if (method === 'sms' || method === 'call') {
        await executePhoneReset(identifier, otpCode, newPassword);
      }
      setStep(4); // Success!
    } catch (err) {
      setError(err.message || 'Error al recuperar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-orange-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center border border-red-200 shadow-md">
            {step === 4 ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <ShieldAlert className="w-8 h-8 text-red-600" />}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
          Recuperación de Cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Centro de restaurado seguro omnicanal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="bg-white py-8 px-4 shadow-xl shadow-red-100/50 sm:rounded-2xl sm:px-10 border border-gray-100 relative">
          
          <button 
            onClick={onNavigateToLogin}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
            title="Volver al Login"
            type="button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleIdentifierSubmit} className="space-y-6">
              <p className="text-sm text-gray-600 text-center">Para comenzar, ingresa el correo o nombre de usuario asociado a tu cuenta bloqueada.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identificador de la cuenta</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500"
                  placeholder="juanp o juan@ejemplo.com"
                />
              </div>
              <MagneticButton className="w-full">
                <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-all hover:-translate-y-0.5">
                  Localizar Cuenta
                </button>
              </MagneticButton>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-6">Hemos encontrado tu cuenta. Elige uno de los vectores configurados para identificarte.</p>
              
              <button disabled={isLoading} onClick={() => selectMethod('email')} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all text-left gap-4 group disabled:opacity-50">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:text-red-500"><Mail className="w-5 h-5" /></div>
                <div><p className="font-semibold text-gray-900">Enlace por Correo</p><p className="text-xs text-gray-500">Recibe instrucciones en tu bandeja</p></div>
              </button>

              <button disabled={isLoading} onClick={() => selectMethod('question')} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all text-left gap-4 group disabled:opacity-50">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:text-red-500"><HelpCircle className="w-5 h-5" /></div>
                <div><p className="font-semibold text-gray-900">Pregunta Secreta</p><p className="text-xs text-gray-500">Contesta tu pregunta personal de respaldo</p></div>
              </button>

              <button disabled={isLoading} onClick={() => selectMethod('sms')} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all text-left gap-4 group disabled:opacity-50">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:text-red-500"><Phone className="w-5 h-5" /></div>
                <div><p className="font-semibold text-gray-900">Código SMS</p><p className="text-xs text-gray-500">Recibe un pin de 6 dígitos en tu celular</p></div>
              </button>

              <button disabled={isLoading} onClick={() => selectMethod('call')} className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all text-left gap-4 group disabled:opacity-50">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:text-red-500"><PhoneCall className="w-5 h-5" /></div>
                <div><p className="font-semibold text-gray-900">Llamada Robótica</p><p className="text-xs text-gray-500">Recibe una llamada dictándote el código</p></div>
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleExecuteReset} className="space-y-5">
              <div className="text-center mb-6">
                <span className="inline-flex px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">Desafío de Seguridad</span>
                <p className="text-sm font-medium text-gray-700 mt-2">
                  {method === 'email' ? 'Pega el código Token que llegó a tu correo corporativo (búscalo en la terminal de consola local):' :
                   method === 'question' ? `Responde a tu pregunta: "${questionText}"` :
                   `Ingresa el código OTP de 6 dígitos enviado a tu número terminado en ...${phoneHint}`}
                </p>
              </div>

              {method === 'email' && (
                <input type="text" required value={emailToken} onChange={(e) => setEmailToken(e.target.value)} placeholder="f3a2b1c4..." className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 font-mono text-sm" />
              )}
              
              {method === 'question' && (
                <input type="password" required value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Respuesta..." className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500" />
              )}

              {(method === 'sms' || method === 'call') && (
                <input type="number" required value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="000000" className="w-full px-3 py-2 text-center text-2xl tracking-widest border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 font-bold" />
              )}

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500" />
              </div>

              <MagneticButton className="w-full">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all hover:-translate-y-0.5">
                  {isLoading ? 'Validando...' : 'Restablecer Contraseña'}
                </button>
              </MagneticButton>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <h3 className="text-xl font-bold text-gray-900">¡Contraseña Recuperada!</h3>
              <p className="text-sm text-gray-600">Tu identidad fue verificada por el método omnicanal exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
              <button 
                onClick={onNavigateToLogin}
                className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-md text-sm font-medium text-gray-900 bg-white border-2 border-gray-200 hover:border-gray-300 transition-all hover:-translate-y-0.5"
              >
                Volver e Iniciar Sesión
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
