# RBAC Implementation Plan

This document outlines the detailed implementation plan for the Role-Based Access Control (RBAC) system based on the design specifications in RBAC_Design.md.

## 1. Database Schema Changes

### 1.1 Create Branches Table

Add the branches table to `server/db/schema.ts` after the businesses table and before the businessUsers table:

```typescript
// Branches table - for multi-branch support
export const branches = mysqlTable('branches', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  businessIdx: index('ix_branches_business').on(table.businessId),
}));

// Add relationships for branches
export const branchesRelations = relations(branches, ({ one, many }) => ({
  business: one(businesses, {
    fields: [branches.businessId],
    references: [businesses.id],
  }),
  businessUsers: many(businessUsers),
}));
```

### 1.2 Update BusinessUsers Table

Update the businessUsers table in `server/db/schema.ts` to include branch association:

```typescript
// Business Users junction table - for staff invitations and roles
export const businessUsers = mysqlTable('business_users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  businessId: varchar('business_id', { length: 255 }).notNull(), // references businesses.id
  branchId: varchar('branch_id', { length: 255 }), // New field for branch association
  userId: varchar('user_id', { length: 255 }).notNull(), // references users.id
  role: varchar('role', { length: 50 }).default('staff'), // Update to match RBAC roles: SuperAdmin, Admin, Staff
  permissions: text('permissions'), // JSON string for future role-based permissions
  invitedBy: varchar('invited_by', { length: 255 }), // references users.id
  invitedAt: timestamp('invited_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, accepted, declined
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  businessIdx: index('ix_business_users_business').on(table.businessId),
  branchIdx: index('ix_business_users_branch').on(table.branchId), // New index
}));

// Update relationships for businessUsers
export const businessUsersRelations = relations(businessUsers, ({ one }) => ({
  business: one(businesses, {
    fields: [businessUsers.businessId],
    references: [businesses.id],
  }),
  branch: one(branches, {
    fields: [businessUsers.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [businessUsers.userId],
    references: [users.id],
  }),
}));
```

## 2. Database Migration

Create a new migration file `migrations/0002_add_branches.sql`:

```sql
-- Migration 0002_add_branches.sql: Add branches table and update business_users table

-- Create branches table
CREATE TABLE IF NOT EXISTS `branches` (
  `id` varchar(255) NOT NULL,
  `business_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text,
  `phone` varchar(50),
  `email` varchar(255),
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_branches_business` (`business_id`),
  CONSTRAINT `fk_branches_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
);

-- Add branch_id column to business_users table
ALTER TABLE `business_users` ADD `branch_id` varchar(255);
ALTER TABLE `business_users` ADD KEY `ix_business_users_branch` (`branch_id`);
ALTER TABLE `business_users` ADD CONSTRAINT `fk_business_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL;

-- Update role values to match RBAC design
UPDATE `business_users` SET `role` = 'Staff' WHERE `role` = 'staff';
UPDATE `business_users` SET `role` = 'Admin' WHERE `role` = 'admin';
```

## 3. Authentication System

### 3.1 User Session Context

Create `server/services/auth.ts` to handle authentication logic:

```typescript
import { db } from '../db/index.ts';
import { users, businessUsers, businesses, branches } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserSession;
  businesses?: Array<{ id: string; name: string }>;
  branches?: Array<{ id: string; name: string }>;
  expiresIn?: number;
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
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export async function authenticateUser(request: LoginRequest): Promise<LoginResponse> {
  try {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, request.email));
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Verify password
    const isValid = await bcrypt.compare(request.password, user.passwordHash);
    if (!isValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Check if user is SuperAdmin
    // This would require a separate table or check for SuperAdmin users
    // For now, we'll assume SuperAdmins use a different login endpoint

    // Get user's business associations
    const businessUsers = await db.select().from(businessUsers).where(eq(businessUsers.userId, user.id));

    if (businessUsers.length === 0) {
      return { success: false, message: 'User has no business associations' };
    }

    // If user has only one business, return that business
    if (businessUsers.length === 1) {
      const businessUser = businessUsers[0];
      const [business] = await db.select().from(businesses).where(eq(businesses.id, businessUser.businessId));
      
      // Generate JWT token
      const token = jwt.sign({
        userId: user.id,
        email: user.email,
        role: businessUser.role,
        businessId: businessUser.businessId,
        branchId: businessUser.branchId,
      }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return {
        success: true,
        token,
        user: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: businessUser.role as 'SuperAdmin' | 'Admin' | 'Staff',
          businessId: businessUser.businessId,
          branchId: businessUser.branchId,
        },
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      };
    }

    // If user has multiple businesses, return list of businesses
    const businessIds = businessUsers.map(bu => bu.businessId);
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
      return { success: false, message: 'Invalid email or password' };
    }

    // Verify password
    const isValid = await bcrypt.compare(request.password, user.passwordHash);
    if (!isValid) {
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
  const businessUsers = await db.select().from(businessUsers).where(eq(businessUsers.userId, userId));
  const businessIds = businessUsers.map(bu => bu.businessId);
  return await db.select({
    id: businesses.id,
    name: businesses.name
  }).from(businesses).where(inArray(businesses.id, businessIds));
}

export async function getUserBranches(userId: string, businessId: string) {
  const businessUsers = await db.select().from(businessUsers).where(
    and(
      eq(businessUsers.userId, userId),
      eq(businessUsers.businessId, businessId)
    )
  );
  
  if (businessUsers.length === 0) {
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
```

### 3.2 Authentication Routes

Update `server/routes.ts` to add authentication endpoints:

```typescript
// Add these imports at the top
import { authenticateUser, authenticateSuperAdmin, getUserBusinesses, getUserBranches, verifyToken } from './services/auth.ts';

// Add authentication routes after the health check route
  // -------- Authentication
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const result = await authenticateUser({ email, password });
    res.json(result);
  });
  
  app.post('/api/auth/admin/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const result = await authenticateSuperAdmin({ email, password });
    res.json(result);
  });
  
  app.get('/api/auth/businesses', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const userSession = verifyToken(token);
    if (!userSession) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    const businesses = await getUserBusinesses(userSession.userId);
    res.json({ businesses });
  });
  
  app.get('/api/auth/branches/:businessId', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const userSession = verifyToken(token);
    if (!userSession) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    const { businessId } = req.params;
    const branches = await getUserBranches(userSession.userId, businessId);
    res.json({ branches });
  });
```

## 4. Authorization Middleware

Create `server/middleware/auth.ts` for authorization middleware:

```typescript
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
```

## 5. Audit Trail Functionality

### 5.1 Audit Logs Table

Add to `server/db/schema.ts`:

```typescript
// Audit Logs table - for tracking user actions
export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  businessId: varchar('business_id', { length: 255 }),
  branchId: varchar('branch_id', { length: 255 }),
  action: varchar('action', { length: 100 }).notNull(),
  tableName: varchar('table_name', { length: 100 }),
  recordId: varchar('record_id', { length: 255 }),
  oldValues: text('old_values'), // JSON string
  newValues: text('new_values'), // JSON string
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('ix_audit_logs_user').on(table.userId),
  businessIdx: index('ix_audit_logs_business').on(table.businessId),
  branchIdx: index('ix_audit_logs_branch').on(table.branchId),
  actionIdx: index('ix_audit_logs_action').on(table.action),
  tableIdx: index('ix_audit_logs_table').on(table.tableName),
  dateIdx: index('ix_audit_logs_date').on(table.createdAt),
}));
```

### 5.2 Audit Service

Create `server/services/audit.ts`:

```typescript
import { db } from '../db/index.ts';
import { auditLogs } from '../db/schema.ts';

interface AuditLogEntry {
  userId: string;
  businessId?: string;
  branchId?: string;
  action: string;
  tableName?: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      id: `audit_${crypto.randomUUID().slice(0, 8)}`,
      userId: entry.userId,
      businessId: entry.businessId,
      branchId: entry.branchId,
      action: entry.action,
      tableName: entry.tableName,
      recordId: entry.recordId,
      oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
      newValues: entry.newValues ? JSON.stringify(entry.newValues) : null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw error as audit logging shouldn't break main functionality
  }
}

// Predefined audit actions
export const AuditActions = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  BUSINESS_CREATED: 'business_created',
  BUSINESS_UPDATED: 'business_updated',
  BUSINESS_DELETED: 'business_deleted',
  BRANCH_CREATED: 'branch_created',
  BRANCH_UPDATED: 'branch_updated',
  BRANCH_DELETED: 'branch_deleted',
  TRANSACTION_CREATED: 'transaction_created',
  TRANSACTION_UPDATED: 'transaction_updated',
  TRANSACTION_DELETED: 'transaction_deleted',
  ACCOUNT_CREATED: 'account_created',
  ACCOUNT_UPDATED: 'account_updated',
  ACCOUNT_DELETED: 'account_deleted',
  ITEM_CREATED: 'item_created',
  ITEM_UPDATED: 'item_updated',
  ITEM_DELETED: 'item_deleted',
  INVOICE_CREATED: 'invoice_created',
  INVOICE_UPDATED: 'invoice_updated',
  INVOICE_DELETED: 'invoice_deleted',
  CASHBOOK_CREATED: 'cashbook_created',
  CASHBOOK_UPDATED: 'cashbook_updated',
  CASHBOOK_DELETED: 'cashbook_deleted',
  ROLE_ASSIGNED: 'role_assigned',
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
};
```

## 6. Admin Interfaces

### 6.1 SuperAdmin Dashboard

Create components for SuperAdmin dashboard in `client/src/components/admin/superadmin/`:

1. BusinessManagement.tsx
2. GlobalSettings.tsx
3. AuditTrailViewer.tsx
4. SystemStatusDashboard.tsx

### 6.2 Admin Dashboard

Create components for Admin dashboard in `client/src/components/admin/business/`:

1. UserManagement.tsx
2. BranchManagement.tsx
3. StaffAssignment.tsx
4. BusinessReporting.tsx

### 6.3 Staff Interface

Update existing components to respect branch-level access restrictions.

## 7. Security Measures

### 7.1 Password Security

Implement in `server/services/auth.ts`:

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### 7.2 Session Security

Implement JWT-based session management with refresh tokens.

### 7.3 Data Isolation

Ensure all database queries are properly filtered based on user context.

## 8. Implementation Steps

1. Create branches table in database schema
2. Update businessUsers table to include branch association
3. Create database migration for schema changes
4. Implement authentication service
5. Add authentication routes
6. Create authorization middleware
7. Implement audit trail functionality
8. Create admin interfaces
9. Add security measures
10. Test and validate implementation

## 9. Testing Strategy

### 9.1 Unit Tests

- Authentication logic
- Authorization checks
- Data isolation enforcement
- Password hashing and validation
- Session management functions
- Audit logging service

### 9.2 Integration Tests

- Login flows
- Role-based access
- Branch-level data visibility
- API endpoint protection
- Data filtering mechanisms
- Audit trail recording

### 9.3 Security Tests

- Data leakage prevention
- Unauthorized access attempts
- Session security validation
- Password security validation
- Rate limiting effectiveness
- Input validation and sanitization