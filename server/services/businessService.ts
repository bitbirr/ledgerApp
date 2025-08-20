import { db } from '../db/index.ts';
import { businesses, users, businessUsers } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { hashPassword } from './auth.ts';
import { logAuditEvent } from './audit.ts';

// Business type based on the database schema
export type Business = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Helper function to convert database result to Business type
function convertToBusiness(business: any): Business {
  return {
    id: business.id,
    name: business.name,
    address: business.address,
    phone: business.phone,
    email: business.email,
    website: business.website,
    logo: business.logo,
    ownerId: business.ownerId,
    createdAt: business.createdAt ? new Date(business.createdAt) : new Date(),
    updatedAt: business.updatedAt ? new Date(business.updatedAt) : new Date()
  };
}

// Create a new business
export async function createBusiness(
  name: string,
  ownerId: string,
  address?: string,
  phone?: string,
  email?: string,
  website?: string,
  logo?: string
): Promise<Business> {
  const id = `biz_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();

  await db.insert(businesses).values({
    id,
    name,
    address: address || null,
    phone: phone || null,
    email: email || null,
    website: website || null,
    logo: logo || null,
    ownerId,
    createdAt: now,
    updatedAt: now
  });

  // Get the created business
  const result = await db.select().from(businesses).where(eq(businesses.id, id));
  return convertToBusiness(result[0]);
}

// Get a business by ID
export async function getBusinessById(id: string): Promise<Business | null> {
  const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return result.length > 0 ? convertToBusiness(result[0]) : null;
}

// Get all businesses
export async function getAllBusinesses(): Promise<Business[]> {
  const results = await db.select().from(businesses);
  return results.map(convertToBusiness);
}

// Create a user and associate them with a business
export async function createBusinessUser(
  businessId: string,
  email: string,
  name: string,
  role: 'Admin' | 'Staff',
  password: string,
  branchId?: string
): Promise<{ user: any; businessUser: any }> {
  // Check if user already exists
  const existingUsers = await db.select().from(users).where(eq(users.email, email));
  let userId: string;
  
  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    // Create new user
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = await hashPassword(password);
    
    await db.insert(users).values({
      id: userId,
      email,
      name,
      passwordHash,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Create business user association
  const businessUserId = `bu_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();
  
  await db.insert(businessUsers).values({
    id: businessUserId,
    businessId,
    branchId: branchId || null,
    userId,
    role,
    permissions: null,
    invitedBy: userId,
    invitedAt: now,
    acceptedAt: now,
    status: 'accepted',
    createdAt: now
  });

  // Get the created user and business user
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [businessUser] = await db.select().from(businessUsers).where(eq(businessUsers.id, businessUserId));
  
  // Log audit event
  await logAuditEvent({
    userId,
    businessId,
    action: 'USER_CREATED',
    tableName: 'businessUsers',
    recordId: businessUserId
  });

  return { user, businessUser };
}