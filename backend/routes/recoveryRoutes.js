import express from 'express';
import { 
  requestEmailReset, executeEmailReset, 
  getSecretQuestion, executeSecretReset, 
  requestPhoneRecovery, executePhoneReset,
  setupSecurityOptions 
} from '../controllers/recoveryController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas de recuperación pública (No requieren login)
router.post('/email/request', requestEmailReset);
router.post('/email/execute', executeEmailReset);

router.get('/question/:identifier', getSecretQuestion);
router.post('/question/execute', executeSecretReset);

router.post('/phone/request', requestPhoneRecovery);
router.post('/phone/execute', executePhoneReset);

// Ruta protegida (Requiere login para configurar los métodos)
router.put('/setup', authMiddleware, setupSecurityOptions);

export default router;
