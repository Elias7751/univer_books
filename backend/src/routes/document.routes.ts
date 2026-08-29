import { Router } from 'express';
import { uploadDocument, getDocuments, reviewDocument, reportDocument, toggleFavorite, getFavorites, addReview, getReviews } from '../controllers/document.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Public route to get documents (with filters)
router.get('/', getDocuments);

// Get user's favorites
router.get('/favorites', authenticate, getFavorites);

// Upload document (Students & Representatives)
router.post('/', authenticate, upload.single('file'), uploadDocument);

// Review document (Admin & Moderator)
router.put('/:id/review', authenticate, authorize(['ADMIN', 'MODERATOR']), reviewDocument);

// Report document (Any authenticated user)
router.post('/:id/report', authenticate, reportDocument);

// Toggle Favorite (Any authenticated user)
router.post('/:id/favorite', authenticate, toggleFavorite);

// Add or update a review (Any authenticated user)
router.post('/:id/review', authenticate, addReview);

// Get reviews for a document
router.get('/:id/reviews', getReviews);

export default router;
