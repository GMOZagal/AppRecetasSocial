import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js';
import { PrismaClient } from '@prisma/client';
import { sendMfaEmail } from '../services/emailService.js';
import { generateTotpSecret, generateQrCodeUri, validateTotpPin } from '../services/totpService.js';

const prisma = new PrismaClient();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Corta duración
  );

  const refreshToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' } // Larga duración
  );

  return { accessToken, refreshToken };
};

const sendRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Accesible solo por el backend
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  });
};

const createSessionRecord = async (req, userId, refreshToken) => {
  // INVALIDAR cualquier sesión activa anterior para garantizar Sesión Única
  await prisma.sesion.deleteMany({
    where: { usuarioId: userId }
  });

  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  const browser = result.browser.name ? `${result.browser.name} ${result.browser.version}` : 'Navegador desconocido';
  const os = result.os.name ? `${result.os.name} ${result.os.version || ''}` : 'SO desconocido';
  
  await prisma.sesion.create({
    data: {
      usuarioId: userId,
      refreshToken,
      dispositivo: `${browser} en ${os}`,
      ipAddress: req.ip || req.connection?.remoteAddress || 'Desconocida',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, phone, adminKey } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    let role = 'usuario';
    if (adminKey) {
      if (adminKey === process.env.ADMIN_REGISTRATION_KEY) {
        role = 'admin';
      } else {
        return res.status(400).json({ error: 'Clave de administrador incorrecta' });
      }
    }

    const existingUser = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario o correo ya están registrados' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.usuario.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        phone: phone || null  // Guardamos el teléfono si fue provisto
      }
    });

    const { accessToken, refreshToken } = generateTokens(newUser);
    sendRefreshTokenCookie(res, refreshToken);
    await createSessionRecord(req, newUser.id, refreshToken);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      accessToken,
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Proporciona usuario/correo y contraseña' });
    }

    const user = await prisma.usuario.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (user.mfaEnabled) {
      if (user.totpSecret) {
        // --- TOTP LOGIC ---
        return res.status(200).json({
          mfaRequired: true,
          method: 'authenticator',
          email: user.email,
          message: 'Introduce el código numérico de tu App Autenticadora'
        });
      } else {
        // --- EMAIL OTP LOGIC ---
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await prisma.usuario.update({
          where: { id: user.id },
          data: { otpCode, otpExpiresAt }
        });

        const emailResult = await sendMfaEmail(user.email, otpCode);
        
        if (!emailResult.success) {
          return res.status(500).json({ error: 'Error al enviar código al correo.' });
        }

        return res.status(200).json({
          mfaRequired: true,
          method: 'email',
          email: user.email,
          message: 'Se ha enviado un código de acceso a tu correo'
        });
      }
    }

    // --- NO MFA LOGIC ---
    const { accessToken, refreshToken } = generateTokens(user);
    sendRefreshTokenCookie(res, refreshToken);
    await createSessionRecord(req, user.id, refreshToken);

    res.status(200).json({
      message: 'Login exitoso',
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email y código son obligatorios' });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    
    if (user.totpSecret) {
      // Validación Google Authenticator / Authy
      const isValid = validateTotpPin(user.username, user.totpSecret, code);
      if (!isValid) return res.status(401).json({ error: 'PIN de autenticador inválido' });
    } else {
      // Validación Email OTP
      if (user.otpCode !== code) {
        return res.status(401).json({ error: 'Código de correo inválido' });
      }
      if (user.otpExpiresAt < new Date()) {
        return res.status(401).json({ error: 'El código de correo ha expirado' });
      }

      // Código válido, limpiar OTP y continuar login
      await prisma.usuario.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpiresAt: null }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    sendRefreshTokenCookie(res, refreshToken);
    await createSessionRecord(req, user.id, refreshToken);

    res.status(200).json({
      message: 'Login exitoso',
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Error en verifyOtp:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No autorizado, token ausente' });
    }

    // Verificar firma del refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Refresh Token inválido o expirado' });
      }

      // Validar si el usuario sigue existiendo
      const user = await prisma.usuario.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario ya no existe' });
      }

      const session = await prisma.sesion.findUnique({
        where: { refreshToken }
      });

      if (!session) {
        return res.status(401).json({ error: 'Sesión revocada remotamente' });
      }

      await prisma.sesion.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() }
      });

      // Generar nuevo Access Token de 15 min
      const newAccessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({ 
        accessToken: newAccessToken,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    });
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({ error: 'Error interno en la renovación del token' });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await prisma.sesion.deleteMany({ where: { refreshToken } });
    }
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'lax' });
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

// ===================================
// Endpoints de App Autenticadora
// ===================================

export const generarQrMfa = async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { id: req.user.id } });
    const secret = generateTotpSecret();
    
    await prisma.usuario.update({
      where: { id: user.id },
      data: { totpSecret: secret } // Se guarda pero mfaEnabled sigue siendo la configuración base hasta que lo valide
    });

    const qrCode = await generateQrCodeUri(user.username, secret);
    
    res.status(200).json({ qrCode, secret });
  } catch (error) {
    console.error('Generar QR error:', error);
    res.status(500).json({ error: 'Error generando configuración 2FA' });
  }
};

export const activarMfaAuthenticator = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await prisma.usuario.findUnique({ where: { id: req.user.id } });

    if (!user.totpSecret) {
      return res.status(400).json({ error: 'Debe generar un QR primero' });
    }

    const isValid = validateTotpPin(user.username, user.totpSecret, pin);

    if (!isValid) {
      return res.status(400).json({ error: 'PIN inválido, asegúrese de escanear el QR correcto' });
    }

    await prisma.usuario.update({
      where: { id: user.id },
      data: { mfaEnabled: true }
    });

    res.status(200).json({ message: 'Autenticación 2FA con App activada con éxito' });
  } catch (error) {
    console.error('Activar MFA error:', error);
    res.status(500).json({ error: 'Error activando 2FA' });
  }
};
