import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.ts';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'SuperAdmin' | 'Admin' | 'Staff';
    businessId?: string;
    branchId?: string;
  };
}

// Middleware to verify JWT token
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  req.user = user;
  next();
}

// Middleware to require specific roles
export function requireRole(roles: ('SuperAdmin' | 'Admin' | 'Staff')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Middleware to enforce branch-level data access
export function requireBranchAccess() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRole = req.user.role;
    const userBranchId = req.user.branchId;
    const requestedBranchId = req.params.branchId || req.body.branchId || req.query.branchId;
    
    // SuperAdmins can access any branch
    if (userRole === 'SuperAdmin') {
      return next();
    }
    
    // Admins can access any branch within their business
    if (userRole === 'Admin') {
      // In a full implementation, we would verify the branch belongs to the user's business
      return next();
    }
    
    // Staff can only access their assigned branch
    if (userRole === 'Staff') {
      if (userBranchId === requestedBranchId) {
        return next();
      } else {
        return res.status(403).json({ error: 'Access denied to this branch' });
      }
    }
    
    return res.status(403).json({ error: 'Access denied' });
  };
}

// Middleware to automatically filter data based on user context
export function applyDataFilter() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Add filter parameters to request for use in controllers
    (req as any).dataFilter = {
      businessId: req.user.businessId,
      branchId: req.user.branchId,
      role: req.user.role
    };
    
    next();
  };
}