import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    
    // Check if user exists and is active
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    prisma.user.findUnique({ where: { id: decoded.userId } }).then((user: any) => {
      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }
      
      if (!user.isActive) {
        res.status(403).json({ message: 'Your account has been suspended. Please contact the administrator.' });
        return;
      }

      req.user = decoded;
      next();
    }).catch(() => {
      res.status(500).json({ message: 'Internal server error' });
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied: insufficient permissions' });
      return;
    }

    next();
  };
};
