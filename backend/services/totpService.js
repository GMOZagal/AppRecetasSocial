import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

const APP_NAME = "AppRecetasSocial";

/**
 * Genera un nuevo secreto aleatorio para un usuario.
 */
export const generateTotpSecret = () => {
  return new OTPAuth.Secret({ size: 20 }).base32;
};

/**
 * Devuelve el objeto TOTP configurado para generar/validar tokens
 * @param {string} username - Nombre del usuario a validar
 * @param {string} secret - El secreto base32 guardado en la BD
 */
export const instantiateTotp = (username, secret) => {
  return new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret)
  });
};

/**
 * Genera una imagen QR (en string Base64 Data URL) para que el frontend la muestre
 * @param {string} username - Nombre del usuario
 * @param {string} secret - El secreto del TOTP
 */
export const generateQrCodeUri = async (username, secret) => {
  const totp = instantiateTotp(username, secret);
  const uri = totp.toString(); 
  
  // Convertimos a base64 Data URI
  const qrCodeDataUrl = await QRCode.toDataURL(uri);
  return qrCodeDataUrl;
};

/**
 * Valida un PIN enviado por el usuario contra el secreto almacenado
 * Intercepta la hora atómica de internet para saltarse el reloj descalibrado de Windows
 * @param {string} username - Nombre del usuario
 * @param {string} secret - Secreto TOTP guardado en la BD
 * @param {string} pin - PIN de 6 dígitos introducido por el usuario
 * @returns {boolean} True si es válido
 */
export const validateTotpPin = (username, secret, pin) => {
  const totp = instantiateTotp(username, secret);
  
  const delta = totp.validate({
    token: pin,
    window: 2 // Permite ±1 minuto para solventar latencias o pequeños desfases de reloj
  });

  return delta !== null; 
};
