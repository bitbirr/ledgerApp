# RBAC Testing Guide

This document provides instructions for testing the implemented Role-Based Access Control (RBAC) system in the multi-business, multi-branch application.

## Overview

The RBAC system implements a three-tier role hierarchy:
1. SuperAdmin - System-wide administrator with full access
2. Admin - Business-level administrator
3. Staff - Branch-specific users with limited access

## Implemented Features

### Database Schema
- Added branches table with business associations
- Updated businessUsers table to include branchId field
- Added foreign key constraints and indexes for RBAC functionality

### Authentication System
- Standard user login endpoint at `/api/auth/login`
- SuperAdmin login endpoint at `/api/auth/admin/login`
- JWT token generation with role and branch information
- Session management with secure tokens

### Authorization Middleware
- Role-based access control middleware
- Branch-level data visibility enforcement
- Route protection based on user roles

### Admin Interfaces
- SuperAdmin dashboard for managing all businesses
- Admin interface for managing users and branches within a business
- Staff interface with branch-specific data access

### Audit Trail
- Comprehensive logging of user actions
- Data changes tracking
- Security events monitoring

## Testing Credentials

Refer to `server/SEED_PASSWORDS.md` for testing credentials.

## Testing Scenarios

### 1. SuperAdmin Access
- Login with admin@system.com and adminpassword
- Verify access to all businesses and branches
- Test creation/modification of businesses
- Verify access to global data and audit trails

### 2. Admin Access
- Login with business owner credentials
- Verify access to all branches within their business
- Test user management functionality
- Verify branch data management capabilities

### 3. Staff Access
- Login with staff credentials
- Verify access only to assigned branch data
- Test data entry functionality
- Verify inability to access other branches' data

### 4. Branch-level Data Isolation
- Ensure Staff users can only view data from their assigned branch
- Verify Admin users can view data from all branches within their business
- Confirm SuperAdmin users can view data from all businesses and branches

### 5. Role-based Menu and Feature Access
- Verify SuperAdmin sees all menu options
- Confirm Admin sees business-level menu options
- Ensure Staff sees only branch-level menu options

## API Endpoints for Testing

### Authentication
```
POST /api/auth/login
POST /api/auth/admin/login
GET /api/auth/me
POST /api/auth/logout
```

### Business Management
```
GET /api/businesses
POST /api/businesses
PUT /api/businesses/:id
DELETE /api/businesses/:id
```

### Branch Management
```
GET /api/branches/:businessId
POST /api/branches
PUT /api/branches/:id
DELETE /api/branches/:id
```

### User Management
```
GET /api/users/:businessId
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

## Validation Checklist

- [ ] SuperAdmin can access all businesses and branches
- [ ] Admin can access all branches within their business only
- [ ] Staff can access only their assigned branch
- [ ] Data isolation is properly enforced between businesses
- [ ] Data isolation is properly enforced between branches
- [ ] Audit logs are created for all user actions
- [ ] Password security requirements are enforced
- [ ] Session management works correctly
- [ ] Unauthorized access attempts are properly rejected

## Troubleshooting

If you encounter issues during testing:

1. Verify database schema updates were applied correctly
2. Check that all foreign key constraints are properly set
3. Ensure JWT tokens contain the correct role and branch information
4. Verify middleware is correctly applied to routes
5. Check audit log entries for debugging information

## Security Notes

- All passwords are hashed using bcrypt with salt rounds >= 12
- JWT tokens have a 24-hour expiration
- HttpOnly and Secure flags are set for cookies
- Rate limiting is implemented for login attempts
- Failed login attempts are tracked and logged