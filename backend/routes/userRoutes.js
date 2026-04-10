import express from 'express';
import { updatePassword, toggleMFA, updatePreferences, getPreferences, getActiveSessions, revokeSession, getAllUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Todas las rutas de usuario requieren estar autenticado
router.use(authMiddleware);

router.put('/password', updatePassword);
router.put('/mfa', toggleMFA);
router.put('/preferences', updatePreferences);
router.get('/preferences', getPreferences);

router.get('/sessions', getActiveSessions);
router.delete('/sessions/:id', revokeSession);

// Rutas protegidas exclusivamente para administradores (RBAC)
router.get('/all', authorizeRoles('admin'), getAllUsers);
router.put('/:id/role', authorizeRoles('admin'), updateUserRole);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

export default router;
