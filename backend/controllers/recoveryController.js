import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { sendSms, makeVoiceCall } from '../services/smsService.js';

const prisma = new PrismaClient();

// ============================================
// VECTOR 1: CORREO ELECTRÓNICO
// ============================================
export const requestEmailReset = async (req, res) => {
  try {
    const { email: identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Proporcione un identificador' });

    const user = await prisma.usuario.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });
    
    if (!user) return res.status(404).json({ error: 'No existe cuenta asociada a este identificador' });

    // Generar token criptográficamente seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires
      }
    });

    // Enviar email real con Resend
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Hubo un error al intentar enviar el correo de recuperación.' });
    }

    res.status(200).json({ message: 'Instrucciones enviadas al correo' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const executeEmailReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Faltan datos' });

    const user = await prisma.usuario.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() } // Mayor a la hora actual
      }
    });

    if (!user) return res.status(400).json({ error: 'Token inválido o expirado' });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// VECTOR 2: PREGUNTA SECRETA
// ============================================
export const getSecretQuestion = async (req, res) => {
  try {
    const { identifier } = req.params;
    const user = await prisma.usuario.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });

    if (!user || !user.secretQuestion) return res.status(400).json({ error: 'El usuario no tiene pregunta secreta configurada' });

    res.status(200).json({ question: user.secretQuestion });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar pregunta' });
  }
};

export const executeSecretReset = async (req, res) => {
  try {
    const { identifier, answer, newPassword } = req.body;
    
    const user = await prisma.usuario.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });

    if (!user || !user.secretAnswerHash) return res.status(400).json({ error: 'Usuario incompatible' });

    if (user.failedSecretAttempts >= 3) {
      return res.status(403).json({ error: 'Vector de recuperación bloqueado por demasiados intentos fallidos. Use otro método.' });
    }

    const isMatch = await bcrypt.compare(answer.trim().toLowerCase(), user.secretAnswerHash);

    if (!isMatch) {
      await prisma.usuario.update({
        where: { id: user.id },
        data: { failedSecretAttempts: { increment: 1 } }
      });
      return res.status(401).json({ error: 'Respuesta incorrecta' });
    }

    // Respuesta correcta
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        passwordHash,
        failedSecretAttempts: 0 // Reiniciar intentos
      }
    });

    res.status(200).json({ message: 'Contraseña recuperada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar por pregunta' });
  }
};

// ============================================
// VECTORES 3 Y 4: SMS Y LLAMADA
// ============================================
export const requestPhoneRecovery = async (req, res) => {
  try {
    const { identifier, method } = req.body; // method = 'sms' o 'call'
    
    const user = await prisma.usuario.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });

    if (!user || !user.phone) return res.status(400).json({ error: 'El usuario no tiene un teléfono configurado' });

    const recoveryOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const recoveryOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await prisma.usuario.update({
      where: { id: user.id },
      data: { recoveryOtpCode, recoveryOtpExpiresAt }
    });

    let smsResult;
    if (method === 'call') {
      smsResult = await makeVoiceCall(user.phone, recoveryOtpCode);
    } else {
      smsResult = await sendSms(user.phone, recoveryOtpCode);
    }

    if (!smsResult.success) {
      return res.status(500).json({ error: 'Hubo un error al contactar al teléfono. Es posible que el servicio no esté configurado.' });
    }

    res.status(200).json({ message: `Código enviado por ${method === 'call' ? 'llamada' : 'SMS'} al número registrado`, phoneHint: user.phone.slice(-4) });
  } catch (error) {
    res.status(500).json({ error: 'Error al solicitar código OTP' });
  }
};

export const executePhoneReset = async (req, res) => {
  try {
    const { identifier, otpCode, newPassword } = req.body;

    const user = await prisma.usuario.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });

    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    if (!user.recoveryOtpCode || user.recoveryOtpCode !== otpCode) {
      return res.status(401).json({ error: 'El código OTP es inválido' });
    }

    if (user.recoveryOtpExpiresAt < new Date()) {
      return res.status(401).json({ error: 'El código OTP ha expirado' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        passwordHash,
        recoveryOtpCode: null,
        recoveryOtpExpiresAt: null
      }
    });

    res.status(200).json({ message: 'Contraseña recuperada exitosamente usando OTP' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// CONFIGURACIÓN DE SEGURIDAD (Usuario Logueado)
// ============================================
export const setupSecurityOptions = async (req, res) => {
  try {
    const { secretQuestion, secretAnswer, phone } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;

    if (secretQuestion && secretAnswer) {
      updateData.secretQuestion = secretQuestion;
      updateData.secretAnswerHash = await bcrypt.hash(secretAnswer.trim().toLowerCase(), 10);
      updateData.failedSecretAttempts = 0;
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: updateData
    });

    res.status(200).json({ message: 'Opciones de recuperación actualizadas exitosamente' });
  } catch (error) {
    console.error('Error config seguridad', error);
    res.status(500).json({ error: 'Error al configurar seguridad' });
  }
};
