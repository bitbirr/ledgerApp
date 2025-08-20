import { db } from '../db/index.ts';
import { users, businessUsers, businesses, branches } from '../db/schema.ts';
import { eq, and, inArray } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger, { securityLogger } from './logger.ts';
const toUndef = <T>(v: T | null | undefined): T | undefined => (v ?? undefined);

interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'SuperAdmin' | 'Admin' | 'Staff';
  businessId?: string;
  branchId?: string;
}

interface LoginRequest {
  email: string;
  password: string;
  businessId?: string;
  branchId?: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserSession;
  businesses?: Array<{ id: string; name: string }>;
  branches?: Array<{ id: string; name: string }>;
  expiresIn?: number;
  message?: string;
}

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'SuperAdmin';
  };
  expiresIn?: number;
  message?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export async function authenticateUser(request: LoginRequest & { businessId?: string; branchId?: string }): Promise<LoginResponse> {
  try {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, request.email));
    if (!user) {
      securityLogger.loginFailure(request.email, 'User not found', 'unknown');
      return { success: false, message: 'Invalid email or password' };
    }

    // Verify password
    const isValid = await verifyPassword(request.password, user.passwordHash);
    if (!isValid) {
      securityLogger.loginFailure(request.email, 'Invalid password', 'unknown');
      return { success: false, message: 'Invalid email or password' };
    }

    // Get user's business associations
    const userBusinesses = await db.select().from(businessUsers).where(eq(businessUsers.userId, user.id));

    if (userBusinesses.length === 0) {
      return { success: false, message: 'User has no business associations' };
    }

    // If businessId and branchId are provided, validate and use them
    if (request.businessId && request.branchId) {
      const businessUser = userBusinesses.find(bu => bu.businessId === request.businessId && bu.branchId === request.branchId);
      
      if (!businessUser) {
        return { success: false, message: 'Access denied to this business/branch combination' };
      }

      // Generate JWT token with specific business/branch context
      const token = jwt.sign({
        userId: user.id,
        email: user.email,
        role: businessUser.role,
        businessId: businessUser.businessId,
        branchId: businessUser.branchId,
      }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      securityLogger.loginSuccess(user.email, user.id, 'unknown');

      return {
        success: true,
        token,
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: businessUser.role as 'SuperAdmin' | 'Admin' | 'Staff',
          businessId: businessUser.businessId,
          branchId: businessUser.branchId ?? undefined,
        },
        expiresIn: 24 * 60 * 60
      };
    }

    // If user has only one business, return that business
    if (userBusinesses.length === 1) {
      const businessUser = userBusinesses[0];
      const [business] = await db.select().from(businesses).where(eq(businesses.id, businessUser.businessId));
      
      // Generate JWT token
      const token = jwt.sign({
        userId: user.id,
        email: user.email,
        role: businessUser.role,
        businessId: businessUser.businessId,
        branchId: businessUser.branchId || undefined,
      }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // Log successful login
      securityLogger.loginSuccess(user.email, user.id, 'unknown');

      const userSession: UserSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: businessUser.role as 'SuperAdmin' | 'Admin' | 'Staff',
        //businessId: businessUser.businessId ?? undefined,
        //branchId: businessUser.branchId ?? undefined,
        businessId: businessUser.businessId,
        branchId: toUndef(businessUser.branchId),
      };
      return {
        success: true,
        token,
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: businessUser.role as 'SuperAdmin' | 'Admin' | 'Staff',
          businessId: businessUser.businessId,
          branchId: businessUser.branchId || undefined,
        },
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      };
    }

    // If user has multiple businesses, return list of businesses
    const businessIds = userBusinesses.map(bu => bu.businessId);
    const businessesList = await db.select({
      id: businesses.id,
      name: businesses.name
    }).from(businesses).where(inArray(businesses.id, businessIds));

    return {
      success: true,
      businesses: businessesList
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

export async function authenticateSuperAdmin(request: AdminLoginRequest): Promise<AdminLoginResponse> {
  try {
    // For SuperAdmin authentication, we would check against a separate table or specific criteria
    // This is a simplified example
    const [user] = await db.select().from(users).where(eq(users.email, request.email));
    if (!user) {
      securityLogger.loginFailure(request.email, 'User not found', 'unknown');
      return { success: false, message: 'Invalid email or password' };
    }

    // Verify password
    console.log('Verifying password for user:', user.email);
    console.log('Provided password:', request.password);
    console.log('Stored hash:', user.passwordHash);
    
    const isValid = await verifyPassword(request.password, user.passwordHash);
    console.log('Password validation result:', isValid);
    
    if (!isValid) {
      securityLogger.loginFailure(request.email, 'Invalid password', 'unknown');
      return { success: false, message: 'Invalid email or password' };
    }

    // Check if user is SuperAdmin (this would be based on a specific condition)
    // For example, checking if user has a specific email or is in a SuperAdmin table
    const isSuperAdmin = user.email === 'admin@system.com'; // Simplified check
    
    if (!isSuperAdmin) {
      return { success: false, message: 'Access denied' };
    }

    // Generate JWT token for SuperAdmin
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: 'SuperAdmin'
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Log successful login
    securityLogger.loginSuccess(user.email, user.id, 'unknown');

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'SuperAdmin'
      },
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };
  } catch (error) {
    console.error('SuperAdmin authentication error:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

export async function getUserBusinesses(userId: string) {
  const userBusinesses = await db.select().from(businessUsers).where(eq(businessUsers.userId, userId));
  const businessIds = userBusinesses.map(bu => bu.businessId);
  return await db.select({
    id: businesses.id,
    name: businesses.name
  }).from(businesses).where(inArray(businesses.id, businessIds));
}

export async function getUserBranches(userId: string, businessId: string) {
  const userBusinesses = await db.select().from(businessUsers).where(
    and(
      eq(businessUsers.userId, userId),
      eq(businessUsers.businessId, businessId)
    )
  );
  
  if (userBusinesses.length === 0) {
    return [];
  }
  
  // Get all branches for this business
  return await db.select({
    id: branches.id,
    name: branches.name
  }).from(branches).where(eq(branches.businessId, businessId));
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}