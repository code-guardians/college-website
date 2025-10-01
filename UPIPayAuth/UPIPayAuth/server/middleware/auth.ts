import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../services/firebase-admin';
import { storage } from '../storage';
import { UserRole } from '@shared/schema';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        id: string;
        email?: string;
        role?: UserRole;
        verified?: boolean;
      };
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      id: decodedToken.uid, // Add id for compatibility
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      // Get user role from MongoDB
      const userDoc = await storage.getUser(req.user.uid);
      if (!userDoc || !roles.includes(userDoc.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.user.role = userDoc.role;
      req.user.verified = userDoc.verified;
      next();
    } catch (error) {
      console.error('Role verification failed:', error);
      return res.status(500).json({ message: 'Authorization check failed' });
    }
  };
}

export function requireVerification(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.verified) {
    return res.status(403).json({ 
      message: 'Email verification required. Please use your college email.' 
    });
  }
  next();
}
