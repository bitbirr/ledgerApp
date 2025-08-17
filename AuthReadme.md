Implement a comprehensive Role-Based Access Control (RBAC) system for a multi-business, multi-branch application with the following specifications:

**System Architecture:**
- Multiple businesses, each containing multiple branches
- Dedicated user management per branch
- Three-tier role hierarchy: SuperAdmin, Admin, and Staff
- Complete user authentication and authorization framework

**Role Definitions:**
- **SuperAdmin**: System-wide administrator with full access to create/modify businesses, manage global data, view application status, handle audit trails, process issues/feedback, and maintain user manuals. Access via /admin/login endpoint.
- **Admin**: Business-level administrator who can manage all users, branch data, and assign staff to specific branches within their business
- **Staff**: Branch-specific users who can only view, add, and generate data for their assigned branch

**Current State:**
3 existing businesses with no user accounts or role assignments

**Login System:**
- Standard user login at /login with username/password authentication
- Dropdown selection flow: Business → Branch → Role
- Separate SuperAdmin login at /admin/login

**Security Requirements:**
- Strict data isolation between businesses and branches
- Role-based menu and feature access control
- Comprehensive audit logging for all user actions
- Secure password storage and session management
- Branch-level data visibility enforcement

**Implementation Scope:**
- Database schema design for businesses, branches, users, and roles
- Authentication system with session management
- Authorization middleware for role-based access control
- Admin interfaces for user and branch management
- Audit trail functionality
- Login portals for both standard users and SuperAdmin