import { db } from '../db/index.ts';
import { branches, businessUsers } from '../db/schema.ts';
import { eq, like, sql, and } from 'drizzle-orm';
import { logAuditEvent } from './audit.ts';

// Branch type based on the database schema
export type Branch = {
  id: string;
  businessId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Helper function to convert database result to Branch type
function convertToBranch(branch: any): Branch {
  return {
    id: branch.id,
    businessId: branch.businessId,
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    email: branch.email,
    isActive: branch.isActive ?? false,
    createdAt: branch.createdAt ? new Date(branch.createdAt) : new Date(),
    updatedAt: branch.updatedAt ? new Date(branch.updatedAt) : new Date()
  };
}

// Create a new branch
export async function createBranch(
  businessId: string,
  name: string,
  address?: string,
  phone?: string,
  email?: string,
  createdBy?: string
): Promise<Branch> {
  const id = `branch_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();

  await db.insert(branches).values({
    id,
    businessId,
    name,
    address: address || null,
    phone: phone || null,
    email: email || null,
    isActive: true,
    createdAt: now,
    updatedAt: now
  });

  // Get the created branch
  const result = await db.select().from(branches).where(eq(branches.id, id));
  const branch = convertToBranch(result[0]);

  // Log audit event
  if (createdBy && branch) {
    await logAuditEvent({
      userId: createdBy,
      businessId,
      branchId: id,
      action: 'BRANCH_CREATED',
      tableName: 'branches',
      recordId: id
    });
  }

  return branch;
}

// Get all branches for a business
export async function getBranchesByBusiness(businessId: string): Promise<Branch[]> {
  const results = await db.select().from(branches).where(eq(branches.businessId, businessId));
  return results.map(convertToBranch);
}

// Get branches with pagination and filtering
export async function getBranches(
  businessId: string,
  filters?: {
    search?: string;
    status?: 'active' | 'inactive';
  },
  page: number = 1,
  limit: number = 10
): Promise<{ branches: Branch[]; totalCount: number }> {
  // Build the base query
  let query: any = db.select().from(branches).where(eq(branches.businessId, businessId));
  
  // Apply filters
  if (filters?.search) {
    query = db.select().from(branches).where(
      and(
        eq(branches.businessId, businessId),
        like(branches.name, `%${filters.search}%`)
      )
    );
  }
  
  if (filters?.status) {
    const isActive = filters.status === 'active';
    query = db.select().from(branches).where(
      and(
        eq(branches.businessId, businessId),
        eq(branches.isActive, isActive)
      )
    );
  }
  
  // Get branches with pagination
  const branchResults = await query.limit(limit).offset((page - 1) * limit);
  const branchList = branchResults.map(convertToBranch);
  
  // Get total count
  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(branches)
    .where(eq(branches.businessId, businessId));
  
  const totalCount = countResult[0]?.count || 0;
  
  return {
    branches: branchList,
    totalCount
  };
}

// Get a specific branch by ID
export async function getBranchById(id: string): Promise<Branch | null> {
  const result = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
  return result.length > 0 ? convertToBranch(result[0]) : null;
}

// Update a branch
export async function updateBranch(
  id: string,
  updates: Partial<{
    name: string;
    address: string;
    phone: string;
    email: string;
    isActive: boolean;
  }>,
  updatedBy?: string
): Promise<Branch | null> {
  // First get the current branch for audit logging
  const currentBranch = await getBranchById(id);
  if (!currentBranch) return null;

  await db.update(branches)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(branches.id, id));

  // Get the updated branch
  const result = await db.select().from(branches).where(eq(branches.id, id));
  const branch = result.length > 0 ? convertToBranch(result[0]) : null;

  // Log audit event
  if (updatedBy && branch) {
    await logAuditEvent({
      userId: updatedBy,
      businessId: branch.businessId,
      branchId: id,
      action: 'BRANCH_UPDATED',
      tableName: 'branches',
      recordId: id
    });
  }

  return branch;
}

// Delete a branch
export async function deleteBranch(id: string, deletedBy?: string): Promise<boolean> {
  // First check if branch exists and get businessId for audit log
  const branch = await getBranchById(id);
  if (!branch) return false;

  // Check if there are users associated with this branch
  const users = await db.select().from(businessUsers).where(eq(businessUsers.branchId, id));
  if (users.length > 0) {
    throw new Error('Cannot delete branch with associated users');
  }

  // Perform deletion
  await db.delete(branches).where(eq(branches.id, id));
  
  // Log audit event
  if (deletedBy && branch) {
    await logAuditEvent({
      userId: deletedBy,
      businessId: branch.businessId,
      branchId: id,
      action: 'BRANCH_DELETED',
      tableName: 'branches',
      recordId: id
    });
  }

  return true;
}

// Get branch statistics (user count)
export async function getBranchStats(branchId: string): Promise<{ userCount: number }> {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(businessUsers)
    .where(eq(businessUsers.branchId, branchId));
  
  return {
    userCount: result[0]?.count || 0
  };
}