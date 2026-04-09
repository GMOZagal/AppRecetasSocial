import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  crearReceta,
  obtenerRecetas,
  obtenerMisRecetas,
  obtenerGuardadas,
  obtenerRecetaPorId,
  actualizarReceta,
  eliminarReceta,
  toggleLike,
} from '../controllers/recipeController.js';

const router = express.Router();

// ── Rutas específicas antes de /:id para evitar conflictos ────────────────────
router.get('/mis-recetas', authMiddleware, obtenerMisRecetas);   // GET  /api/recetas/mis-recetas
router.get('/guardadas',   authMiddleware, obtenerGuardadas);    // GET  /api/recetas/guardadas
router.post('/',           authMiddleware, crearReceta);         // POST /api/recetas
router.put('/:id',         authMiddleware, actualizarReceta);    // PUT  /api/recetas/:id
router.delete('/:id',      authMiddleware, eliminarReceta);      // DELETE /api/recetas/:id
router.post('/:id/like',   authMiddleware, toggleLike);          // POST /api/recetas/:id/like

// ── Rutas públicas ────────────────────────────────────────────────────────────
router.get('/',    obtenerRecetas);        // GET /api/recetas
router.get('/:id', obtenerRecetaPorId);   // GET /api/recetas/:id

export default router;
