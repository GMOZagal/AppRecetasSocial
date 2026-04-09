import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en updatePassword:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const toggleMFA = async (req, res) => {
  try {
    const { mfaEnabled } = req.body;
    const userId = req.user.id;

    if (typeof mfaEnabled !== 'boolean') {
      return res.status(400).json({ error: 'Estado MFA inválido' });
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: { mfaEnabled }
    });

    res.status(200).json({ message: `MFA ${mfaEnabled ? 'activado' : 'desactivado'}` });
  } catch (error) {
    console.error('Error en toggleMFA:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { tema, idioma } = req.body;
    const userId = req.user.id;

    const data = {};
    if (tema) data.tema = tema;
    if (idioma) data.idioma = idioma;

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data
    });

    res.status(200).json({
      message: 'Preferencias actualizadas',
      tema: updatedUser.tema,
      idioma: updatedUser.idioma
    });
  } catch (error) {
    console.error('Error en updatePreferences:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { tema: true, idioma: true, mfaEnabled: true }
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener preferencias' });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    // Opcionalmente podemos identificar la sesión actual buscando cuál refreshToken hace match con req.cookies.refreshToken
    const currentRefreshToken = req.cookies?.refreshToken;

    const sesiones = await prisma.sesion.findMany({
      where: { usuarioId: userId },
      orderBy: { lastUsedAt: 'desc' }
    });

    const formattedSessions = sesiones.map(s => ({
      ...s,
      isCurrent: s.refreshToken === currentRefreshToken && currentRefreshToken !== undefined
    }));

    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error('Error en getActiveSessions:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sesion = await prisma.sesion.findUnique({ where: { id: parseInt(id) } });

    if (!sesion) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    if (sesion.usuarioId !== userId) {
      return res.status(403).json({ error: 'No autorizado para eliminar esta sesión' });
    }

    await prisma.sesion.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Sesión terminada exitosamente' });
  } catch (error) {
    console.error('Error en revokeSession:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: { id: true, username: true, email: true, role: true, createdAt: true }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'editor', 'usuario'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    
    // Evitar que el admin se quite el rol a sí mismo por accidente
    if (req.user.id === parseInt(id)) {
      return res.status(403).json({ error: 'No puedes cambiar tu propio rol' });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, username: true, role: true }
    });
    
    res.status(200).json({ message: 'Rol actualizado', user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
