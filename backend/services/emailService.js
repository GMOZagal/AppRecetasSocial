import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Usamos SMTP explícito con SSL en puerto 465.
// NO usamos service:'gmail' porque ese modo (STARTTLS/puerto 587)
// puede ser bloqueado por proveedores cloud como Render en plan gratuito.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL directo, nunca usa STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS  // Contraseña de aplicación de 16 caracteres
  }
});

const FROM_EMAIL = `"App Recetas Sociales" <${process.env.GMAIL_USER}>`;

/**
 * Envia el OTP para Autenticación de Múltiples Factores
 */
export const sendMfaEmail = async (toEmail, otpCode) => {
  try {
    const mailOptions = {
      from: FROM_EMAIL,
      to: toEmail,
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] OTP Enviado exitosamente a ${toEmail} | ID:`, info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error(`[EmailService] Error enviando OTP a ${toEmail}:`, error.message);
    return { success: false, error };
  }
};

/**
 * Envia el token de recuperación de contraseña
 */
export const sendPasswordResetEmail = async (toEmail, resetToken) => {
  try {
    const mailOptions = {
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Recuperación de Contraseña - App de Recetas',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #f44336;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña. Usa este token en la aplicación:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-family: monospace; word-break: break-all; text-align: center; border-radius: 5px; margin: 20px 0;">
            ${resetToken}
          </div>
          <p>Este token expira en 15 minutos por tu seguridad.</p>
          <p>Si no has solicitado este cambio, ignora este correo.</p>
          <p>Saludos,<br>El equipo de App Recetas Sociales</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Enlace de recuperación enviado a ${toEmail} | ID:`, info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error(`[EmailService] Error enviando token de recuperación a ${toEmail}:`, error.message);
    return { success: false, error };
  }
};
