import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Omitimos instanciar si faltan credenciales para no crashear en desarrollo
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Envia un SMS con el código de recuperación
 */
export const sendSms = async (toPhone, otpCode) => {
  if (!client) {
    console.warn('[SMS Service] Credenciales de Twilio no configuradas. Simulando SMS a', toPhone);
    return { success: false, error: 'Twilio no configurado' };
  }

  try {
    const message = await client.messages.create({
      body: `App Recetas: Tu código de recuperación temporal es ${otpCode}. Expira en 5 minutos.`,
      from: twilioPhoneNumber,
      to: toPhone
    });
    console.log(`[SMS Service] SMS enviado a ${toPhone} | SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error(`[SMS Service] Error enviando SMS a ${toPhone}:`, error);
    return { success: false, error };
  }
};

/**
 * Llama al usuario y una voz robótica le dicta el código
 */
export const makeVoiceCall = async (toPhone, otpCode) => {
  if (!client) {
    console.warn('[SMS Service] Credenciales de Twilio no configuradas. Simulando Llamada a', toPhone);
    return { success: false, error: 'Twilio no configurado' };
  }

  try {
    // Al separar los dígitos con comas o espacios, el sintetizador los leerá uno por uno (Ej: 1, 2, 3...)
    const spacedCode = otpCode.split('').join('. '); 
    
    const call = await client.calls.create({
      twiml: `<Response>
                <Say language="es-MX" voice="Polly.Mia">Hola. Tu código de recuperación de Recetas es.</Say>
                <Pause length="1"/>
                <Say language="es-MX" voice="Polly.Mia">${spacedCode}</Say>
                <Pause length="1"/>
                <Say language="es-MX" voice="Polly.Mia">Repito. Tu código es.</Say>
                <Say language="es-MX" voice="Polly.Mia">${spacedCode}</Say>
                <Say language="es-MX" voice="Polly.Mia">Adiós.</Say>
              </Response>`,
      from: twilioPhoneNumber,
      to: toPhone
    });
    console.log(`[SMS Service] Llamada iniciada a ${toPhone} | SID: ${call.sid}`);
    return { success: true, sid: call.sid };
  } catch (error) {
    console.error(`[SMS Service] Error haciendo llamada a ${toPhone}:`, error);
    return { success: false, error };
  }
};
