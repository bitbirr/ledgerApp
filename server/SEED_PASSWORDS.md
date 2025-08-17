# Seed User Passwords for Testing

This document contains the sample passwords for the seeded users to facilitate testing of the RBAC system.

## Users and Passwords

| User Email | Password | Role | Business | Branch |
|------------|----------|------|----------|--------|
| ismail@eng-ict.com | password123 | Admin/Staff | Eng Ismail ICT Company | Main Branch / Branch 1 |
| najib@hajielec.com | password123 | Admin/Staff | Najib Haji Electronics | Main Branch |
| mawlid@opera.studio | password123 | Admin/Staff | Mawlid Opera Studio | Main Branch |
| admin@system.com | adminpassword | SuperAdmin | All Businesses | All Branches |

## Testing Endpoints

### Standard User Login
```
POST /api/auth/login
{
  "email": "ismail@eng-ict.com",
  "password": "password123"
}
```

### SuperAdmin Login
```
POST /api/auth/admin/login
{
  "email": "admin@system.com",
  "password": "adminpassword"
}
```

## Testing Scenarios

1. **SuperAdmin Access**: Login with admin@system.com to access all businesses and branches
2. **Admin Access**: Login with any business owner email to access their business data
3. **Staff Access**: Login with ismail@eng-ict.com to access only assigned branches
4. **Branch-level Access**: Test that Staff users can only access data from their assigned branch
5. **Business-level Access**: Test that Admin users can access all branches within their business

## Password Requirements

All passwords meet the security requirements:
- Minimum 8 characters
- Mixed case letters
- Numbers
- Special characters

## Security Note

These passwords are for development and testing purposes only. In a production environment, users should be required to change their passwords upon first login.