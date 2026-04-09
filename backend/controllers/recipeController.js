import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── POST /api/recetas ────────────────────────────────────────────────────────
export const crearReceta = async (req, res) => {
  try {
    const { titulo, descripcion, ingredientes, instrucciones, imageUrl, categoria, estado } = req.body;
    const creadorId = req.user.id;

    if (!titulo || !descripcion || !instrucciones) {
      return res.status(400).json({ error: 'Título, descripción e instrucciones son obligatorios.' });
    }

    if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
      return res.status(400).json({ error: 'Debes incluir al menos un ingrediente.' });
    }

    const receta = await prisma.receta.create({
      data: {
        titulo,
        descripcion,
        ingredientes,
        instrucciones,
        imageUrl: imageUrl || null,
        categoria: categoria || 'General',
        estado: estado || 'borrador',
        creadorId,
      },
      include: {
        creador: { select: { id: true, username: true } },
      },
    });

    res.status(201).json({ message: 'Receta creada exitosamente.', receta });
  } catch (error) {
    console.error('Error al crear receta:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /api/recetas ─────────────────────────────────────────────────────────
export const obtenerRecetas = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, categoria, buscar } = req.query;

    const where = { estado: 'publicado' };
    if (categoria && categoria !== 'Todas') where.categoria = categoria;
    if (buscar) {
      where.OR = [
        { titulo: { contains: buscar, mode: 'insensitive' } },
        { descripcion: { contains: buscar, mode: 'insensitive' } },
      ];
    }

    const [recetas, total] = await Promise.all([
      prisma.receta.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(pagina) - 1) * Number(limite),
        take: Number(limite),
        include: {
          creador: { select: { id: true, username: true } },
        },
      }),
      prisma.receta.count({ where }),
    ]);

    res.json({ recetas, meta: { total, pagina: Number(pagina), limite: Number(limite) } });
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /api/recetas/mis-recetas ─────────────────────────────────────────────
export const obtenerMisRecetas = async (req, res) => {
  try {
    const creadorId = req.user.id;

    const recetas = await prisma.receta.findMany({
      where: { creadorId },
      orderBy: { updatedAt: 'desc' },
      include: {
        creador: { select: { id: true, username: true } },
      },
    });

    res.json({ recetas });
  } catch (error) {
    console.error('Error al obtener mis recetas:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /api/recetas/:id ─────────────────────────────────────────────────────
export const obtenerRecetaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const receta = await prisma.receta.findUnique({
      where: { id: Number(id) },
      include: {
        creador: { select: { id: true, username: true } },
      },
    });

    if (!receta) return res.status(404).json({ error: 'Receta no encontrada.' });

    res.json({ receta });
  } catch (error) {
    console.error('Error al obtener receta:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── PUT /api/recetas/:id ─────────────────────────────────────────────────────
export const actualizarReceta = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const receta = await prisma.receta.findUnique({ where: { id: Number(id) } });
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada.' });
    if (receta.creadorId !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta receta.' });
    }

    const { titulo, descripcion, ingredientes, instrucciones, imageUrl, categoria, estado } = req.body;

    const recetaActualizada = await prisma.receta.update({
      where: { id: Number(id) },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(ingredientes !== undefined && { ingredientes }),
        ...(instrucciones !== undefined && { instrucciones }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(categoria !== undefined && { categoria }),
        ...(estado !== undefined && { estado }),
      },
      include: {
        creador: { select: { id: true, username: true } },
      },
    });

    res.json({ message: 'Receta actualizada correctamente.', receta: recetaActualizada });
  } catch (error) {
    console.error('Error al actualizar receta:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── DELETE /api/recetas/:id ──────────────────────────────────────────────────
export const eliminarReceta = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const receta = await prisma.receta.findUnique({ where: { id: Number(id) } });
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada.' });
    if (receta.creadorId !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta receta.' });
    }

    await prisma.receta.delete({ where: { id: Number(id) } });

    res.json({ message: 'Receta eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar receta:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /api/recetas/guardadas ────────────────────────────────────────────────
export const obtenerGuardadas = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const likeRows = await prisma.like.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: {
        receta: {
          include: { creador: { select: { id: true, username: true } } },
        },
      },
    });
    const recetas = likeRows.map(l => l.receta);
    res.json({ recetas });
  } catch (error) {
    console.error('Error al obtener guardadas:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── POST /api/recetas/:id/like ────────────────────────────────────────────────
// Toggle: da like si no existe, lo quita si ya existe
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const recetaId = Number(id);

    const receta = await prisma.receta.findUnique({ where: { id: recetaId } });
    if (!receta) return res.status(404).json({ error: 'Receta no encontrada.' });

    const likeExistente = await prisma.like.findUnique({
      where: { usuarioId_recetaId: { usuarioId, recetaId } },
    });

    let liked;
    if (likeExistente) {
      await prisma.like.delete({ where: { id: likeExistente.id } });
      await prisma.receta.update({ where: { id: recetaId }, data: { likes: { decrement: 1 } } });
      liked = false;
    } else {
      await prisma.like.create({ data: { usuarioId, recetaId } });
      await prisma.receta.update({ where: { id: recetaId }, data: { likes: { increment: 1 } } });
      liked = true;
    }

    const actualizada = await prisma.receta.findUnique({ where: { id: recetaId } });
    res.json({ liked, likes: actualizada.likes });
  } catch (error) {
    console.error('Error al togglear like:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
