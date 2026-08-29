import { Router } from 'express';
import { getStats, getReports, resolveReport, getLogs, toggleUserStatus } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only ADMIN and MODERATOR can access admin stats
router.get('/stats', authenticate, authorize(['ADMIN', 'MODERATOR']), getStats);

// Reports management
router.get('/reports', authenticate, authorize(['ADMIN', 'MODERATOR']), getReports);
router.put('/reports/:id/resolve', authenticate, authorize(['ADMIN', 'MODERATOR']), resolveReport);

// Audit Logs
router.get('/logs', authenticate, authorize(['ADMIN', 'MODERATOR']), getLogs);

// User Management (Ban/Unban)
router.put('/users/:id/status', authenticate, authorize(['ADMIN']), toggleUserStatus);

export default router;
