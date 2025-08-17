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