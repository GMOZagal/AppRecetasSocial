import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.API_KEY_RESEND);

// Usamos onboarding de Resend como remitente de prueba, en un escenario real sería desde tu propio dominio.
const FROM_EMAIL = 'Equipo de Seguridad <onboarding@resend.dev>';

/**
 * Envia el OTP para Autenticación de Múltiples Factores
 */
export const sendMfaEmail = async (toEmail, otpCode) => {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: 'Tu código de acceso - App de Recetas',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">Código de Verificación</h2>
          <p>Hola,</p>
          <p>Has solicitado iniciar sesión. Tu código temporal de acceso es:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 5px; width: fit-content; margin: 20px auto;">
            ${otpCode}
          </div>
          <p>Este código expira en 5 minutos. Si no has solicitado este código, ignora este correo.</p>
          <p>Saludos,<br>El equipo de App Recetas Sociales</p>
        </div>
      `
    });

    console.log(`[EmailService] OTP Enviado exitosamente a ${toEmail} | ID:`, data.id);
    return { success: true, data };
  } catch (error) {
    console.error(`[EmailService] Error enviando OTP a ${toEmail}:`, error);
    // No lanzamos el error para no crashear, solo devolvemos falso.
    return { success: false, error };
  }
};

/**
 * Envia el enlace de recuperación de contraseña
 */
export const sendPasswordResetEmail = async (toEmail, resetToken) => {
  try {
    // Al no estar conectado a un front, enviaremos el token como un código para copiar/pegar temporalmente
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: 'Recuperación de Contraseña - App de Recetas',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #f44336;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña. Para continuar, utiliza este token de seguridad temporal en tu aplicación:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-family: monospace; word-break: break-all; text-align: center; border-radius: 5px; margin: 20px 0;">
            ${resetToken}
          </div>
          <p>Este token expira en 15 minutos por tu seguridad.</p>
          <p>Si no has solicitado este cambio, tu cuenta sigue estando segura y puedes ignorar este correo.</p>
          <p>Saludos,<br>El equipo de App Recetas Sociales</p>
        </div>
      `
    });

    console.log(`[EmailService] Enlace de recuperación enviado a ${toEmail} | ID:`, data.id);
    return { success: true, data };
  } catch (error) {
    console.error(`[EmailService] Error enviando token de recuperación a ${toEmail}:`, error);
    return { success: false, error };
  }
};
