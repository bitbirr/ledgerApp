# Postman Collection for RBAC Testing

This Postman collection provides a comprehensive set of requests for testing the Role-Based Access Control (RBAC) system implementation in the CreditDebit application.

## Prerequisites

1. Postman installed on your system
2. The CreditDebit application running locally or on a server
3. The database seeded with test data (refer to `server/SEED_PASSWORDS.md` for credentials)

## Collection Structure

The collection is organized into the following folders:

1. **Authentication** - Requests for user login and session management
2. **Business Management** - Requests for creating, reading, updating, and deleting businesses
3. **Branch Management** - Requests for managing branches within businesses
4. **User Management** - Requests for managing users and their roles
5. **Audit Trail** - Requests for viewing audit logs
6. **Data Access Tests** - Requests for testing data access based on user roles

## Environment Variables

The collection uses the following environment variables:

- `base_url` - The base URL of your application (default: http://localhost:5000)
- `auth_token` - The JWT token obtained after login
- `business_id` - The ID of a business for testing
- `branch_id` - The ID of a branch for testing
- `user_id` - The ID of a user for testing
- `account_id` - The ID of an account for testing

## Testing Workflow

### 1. User Login
1. Select the "User Login" request
2. Send the request with valid credentials
3. Copy the token from the response
4. Set the `auth_token` variable in Postman

### 2. SuperAdmin Testing
1. Select the "SuperAdmin Login" request
2. Send the request with SuperAdmin credentials
3. Copy the token from the response
4. Set the `auth_token` variable in Postman
5. Test SuperAdmin-only endpoints

### 3. Business and Branch Management
1. Use the Business Management and Branch Management folders
2. Test CRUD operations with different user roles
3. Verify access restrictions based on user roles

### 4. User Management
1. Test creating, reading, updating, and deleting users
2. Verify role-based permissions
3. Test branch-level user assignments

### 5. Audit Trail
1. Test viewing audit logs
2. Verify logs are created for user actions
3. Test filtering logs by user, business, or branch

## Testing Different User Roles

### SuperAdmin Testing
- Login with admin@system.com / adminpassword
- Test access to all businesses and branches
- Test business creation/deletion
- Test global audit trail access

### Admin Testing
- Login with business owner credentials
- Test access to all branches within their business
- Test user management within their business
- Test branch management within their business

### Staff Testing
- Login with staff credentials
- Test access only to their assigned branch
- Test data entry functionality
- Verify inability to access other branches' data

## Expected Results

### SuperAdmin
- Full access to all endpoints
- Ability to create/delete businesses
- Access to global audit logs
- Ability to manage users across all businesses

### Admin
- Access to their business data only
- Ability to manage users within their business
- Ability to manage branches within their business
- Access to business-specific audit logs

### Staff
- Access only to their assigned branch
- Ability to view/create data for their branch
- No access to user or branch management
- Limited menu and feature access

## Troubleshooting

If you encounter issues:

1. Verify the application is running and accessible
2. Check that the database is properly seeded
3. Ensure environment variables are correctly set
4. Verify JWT tokens are properly formatted
5. Check server logs for error messages

## Security Notes

- Always use HTTPS in production environments
- Store passwords securely and never hardcode them
- Regularly rotate JWT secret keys
- Implement rate limiting for login endpoints
- Monitor audit logs for suspicious activity