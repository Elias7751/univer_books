import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DocStatus, DocType } from '@prisma/client';
import { logActivity } from '../utils/audit';

// Upload a new document
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const { title, description, type, subjectId, isGeneral } = req.body;
    const uploaderId = req.user?.userId;

    if (!uploaderId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Construct file URL (assuming server runs on localhost:5000 for now)
    // In production, this would be your domain or S3 URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const sizeInBytes = req.file.size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    const fileSize = `${sizeInMB} MB`;

    const document = await prisma.document.create({
      data: {
        title,
        description,
        type: type as DocType,
        fileUrl,
        fileSize,
        isGeneral: isGeneral === 'true',
        subjectId: subjectId ? Number(subjectId) : undefined,
        uploaderId,
        status: DocStatus.PENDING, // Default status
      },
    });

    await logActivity(uploaderId, 'DOCUMENT_UPLOADED', `Uploaded document: ${title}`);

    res.status(201).json({ message: 'Document uploaded successfully and is pending approval', document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading document' });
  }
};

// Get documents (with filters)
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { subjectId, status, type, isGeneral } = req.query;

    const documents = await prisma.document.findMany({
      where: {
        subjectId: subjectId ? Number(subjectId) : undefined,
        status: status ? (status as DocStatus) : DocStatus.APPROVED, // Default to showing only approved
        type: type ? (type as DocType) : undefined,
        isGeneral: isGeneral === 'true' ? true : (subjectId ? false : undefined),
      },
      include: {
        uploader: { select: { name: true } },
        subject: { select: { name: true, level: { select: { name: true, major: { select: { name: true } } } } } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

// Approve or Reject a document
export const reviewDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status should be 'APPROVED' or 'REJECTED'
    const reviewerId = req.user?.userId;

    if (!reviewerId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (status !== DocStatus.APPROVED && status !== DocStatus.REJECTED) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const document = await prisma.document.update({
      where: { id: Number(id) },
      data: {
        status,
        rejectionReason: status === DocStatus.REJECTED ? rejectionReason : null,
        reviewerId,
      },
      include: {
        subject: {
          include: { level: true }
        }
      }
    });

    await logActivity(reviewerId, `DOCUMENT_${status}`, `Reviewed document ID ${id}`);

    // Send Telegram Notification if approved
    if (status === DocStatus.APPROVED && document.subject) {
      try {
        const { bot } = require('../bot/telegram.bot');
        if (bot) {
          // Find all users in the same level who have linked their Telegram
          const usersToNotify = await prisma.user.findMany({
            where: {
              levelId: document.subject.levelId,
              telegramId: { not: null }
            }
          });

          const typeName = document.type === 'BOOK' ? 'كتاب' : document.type === 'SUMMARY' ? 'ملخص' : 'بحث';
          const message = `🔔 *إشعار جديد!*\n\nتم إضافة ${typeName} جديد في مادة *${document.subject.name}*.\n\n📚 *العنوان:* ${document.title}\n\n📥 لتحميل الملف، أرسل:\n/download\\_${document.id}`;

          for (const user of usersToNotify) {
            if (user.telegramId) {
              bot.sendMessage(user.telegramId, message, { parse_mode: 'Markdown' }).catch((e: any) => console.error(`Failed to send to ${user.telegramId}:`, e));
            }
          }
        }
      } catch (err) {
        console.error('Error sending Telegram notification:', err);
      }
    }

    res.json({ message: `Document ${status.toLowerCase()} successfully`, document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reviewing document' });
  }
};

// Report a document
export const reportDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const reporterId = req.user?.userId;

    if (!reporterId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!reason) {
      res.status(400).json({ message: 'Reason is required' });
      return;
    }

    const report = await prisma.report.create({
      data: {
        reason,
        documentId: Number(id),
        reporterId,
      },
    });

    res.status(201).json({ message: 'Document reported successfully', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reporting document' });
  }
};

// Toggle Favorite
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const documentId = Number(id);

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      res.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          documentId,
        },
      });
      res.status(201).json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Error toggling favorite' });
  }
};

// Get user's favorites
export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        document: {
          include: {
            subject: { select: { name: true } },
            uploader: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(favorites.map(f => f.document));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
};

// Add or update a review
export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
      return;
    }

    const documentId = Number(id);

    const review = await prisma.review.upsert({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId,
        documentId,
        rating,
        comment,
      },
    });

    res.status(200).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Error submitting review' });
  }
};

// Get reviews for a document
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: { documentId: Number(id) },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length 
      : 0;

    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
