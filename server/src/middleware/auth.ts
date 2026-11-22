import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { Role } from '../types';
import prisma from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    vendorProfileId?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // If role is VENDOR, fetch vendorProfileId for convenient controller access
    let vendorProfileId: string | undefined;
    if (decoded.role === Role.VENDOR) {
      const vendor = await prisma.vendorProfile.findUnique({
        where: { userId: decoded.userId },
        select: { id: true }
      });
      vendorProfileId = vendor?.id;
    }

    req.user = {
      ...decoded,
      vendorProfileId
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Token expired or invalid',
      details: err.message
    });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No active session' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access requires one of [${roles.join(', ')}] role(s)`
      });
    }

    next();
  };
}
