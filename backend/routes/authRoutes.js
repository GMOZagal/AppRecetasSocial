import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, verifyOtp, refresh, logout, register, generarQrMfa, activarMfaAuthenticator } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 peticiones por IP
  message: { error: 'Demasiados intentos de inicio de sesión desde esta IP, intente más tarde' }
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/verify-otp', verifyOtp);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Rutas para configuración de MFA App Autenticadora
router.get('/mfa/setup', authMiddleware, generarQrMfa);
router.post('/mfa/verify-setup', authMiddleware, activarMfaAuthenticator);

export default router;
