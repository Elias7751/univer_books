import { Router } from 'express';
import { getUsers, updateUserRole, updateProfile } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only ADMIN can manage users
router.get('/', authenticate, authorize(['ADMIN']), getUsers);
router.patch('/:id/role', authenticate, authorize(['ADMIN']), updateUserRole);

// Any authenticated user can update their profile
router.put('/profile', authenticate, updateProfile);

export default router;
