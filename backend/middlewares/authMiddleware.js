import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado.' });
    }

    // Verify short-lived access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Novedad: Verificar si el refreshToken de la cookie todavía existe en la BD
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const session = await prisma.sesion.findUnique({ where: { refreshToken } });
      if (!session) {
        return res.status(401).json({ error: 'Sesión revocada o finalizada' });
      }
    }

    req.user = decoded; // Attach user payload to request
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
};
