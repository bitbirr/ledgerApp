# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Multi-tenant business and branch management system
- Role-based access control (RBAC) with SuperAdmin, Admin, and Staff roles
- Branch-level data isolation and access controls
- JWT-based authentication with HttpOnly cookies
- Comprehensive audit logging system
- Double-entry bookkeeping with GL accounts
- Invoice management with PDF generation
- Inventory tracking with movement history
- Tax management with configurable rates and codes
- PWA support with offline capabilities
- Responsive design with dark mode support
- Integration testing suite with Postman collections

### Changed
- Migrated from single-tenant to multi-tenant architecture
- Enhanced authentication flow to support business/branch selection
- Improved database schema with proper indexing and relationships
- Refactored frontend to use Zustand for state management
- Updated API endpoints to include business/branch context

### Fixed
- Resolved TypeScript type mismatches in authentication service
- Fixed branch fetching in login component
- Corrected RBAC middleware for proper access control
- Addressed database connection and schema validation issues
- Fixed "unexpected token '<'" error in business login by implementing missing API endpoints

### Security
- Implemented secure password hashing with bcrypt
- Added comprehensive security logging
- Enhanced JWT token validation and refresh mechanisms
- Implemented proper CORS and security headers

## [1.0.0] - 2025-08-20
### Added
- Initial release of the multi-tenant ledger application
- Core accounting features with double-entry bookkeeping
- User authentication and authorization system
- Business and branch management
- Invoice and transaction management
- Basic reporting and dashboard functionality
- Database migrations and seeding scripts
- Development and production environment configurations