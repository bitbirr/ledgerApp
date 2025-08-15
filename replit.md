# Credit Debit Financial Management App  
## Overview  
Credit Debit is an offline-first Progressive Web App designed for comprehensive financial management. The application enables users to track credit/debit accounts, manage invoices, maintain cash flow records, and generate financial reports. Built with modern web technologies, it provides a mobile-first experience with robust offline capabilities and optional cloud backup integration.  

The application follows a client-centric architecture where all data is stored locally in IndexedDB using Dexie, ensuring full offline functionality. 

The backend serves only as a static file server and API endpoint placeholder, with the primary business logic residing entirely on the client side.  

## User Preferences  
Preferred communication style: Simple, everyday language.  

## System Architecture  
### Frontend Architecture 
- **Framework**: React 18 with TypeScript and Vite for development tooling

- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling 

- **State Management**: Zustand for global application state with simple, centralized store pattern 

- **Routing**: Custom screen-based navigation using Zustand state instead of traditional URL routing 

- **Styling**: Tailwind CSS with Material Design 3 color scheme and CSS custom properties for theming  ### Data Management 

- **Local Storage**: Dexie (IndexedDB wrapper) serves as the primary database with typed schemas 

- **Data Models**: Comprehensive schema covering accounts, transactions, categories, cashbook entries, invoices, items, and user preferences 

- **Caching**: TanStack Query for server state management and caching (minimal server interaction) 

- **Offline Strategy**: All data operations occur locally with IndexedDB as the single source of truth  

### Progressive Web App Features 

- **Service Worker**: Custom implementation with precaching of static assets and runtime caching for external resources 

- **Manifest**: Comprehensive PWA manifest with shortcuts for quick actions 

- **Mobile Optimization**: Mobile-first responsive design with touch -friendly interactions  

### Component Architecture 

- **Layout Components**: Modular layout system with AppBar, NavigationDrawer, and BottomActionBar 

- **Form Handling**: React Hook Form with Zod validation for type-safe form management 

- **UI Components**: Extensive component library following Material Design principles 

- **Modal System**: Dialog-based modals for data entry and confirmations  

### Backend Architecture 

- **Server Framework**: Express.js serving as a minimal API server and static file host 

- **Development Setup**: Vite middleware integration for hot module replacement 

- **Storage Interface**: Abstract storage interface with in-memory implementation (not actively used) 

- **Static Assets**: Serves the built React application and handles API routing placeholder  

## External Dependencies  
### Core Frontend Dependencies 

- **React Ecosystem**: React 18, React DOM with TypeScript support 

- **Build Tools**: Vite for development and build processes with TypeScript configuration 

- **UI Framework**: Radix UI components (@radix-ui/*) for accessible primitive components 

- **Styling**: Tailwind CSS with PostCSS for processing and custom design system  ### Data and State Management 

- **Database**: Dexie for IndexedDB operations with migration support 

- **State Management**: Zustand for client-side state management 

- **Server State**: TanStack Query for async operations and caching 

- **Form Management**: React Hook Form with Hookform Resolvers for Zod integration 

- **Validation**: Zod for runtime type checking and schema validation  

### Development and Quality Tools 

- **TypeScript**: Full TypeScript support with strict configuration 

- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer 

- **Development Utilities**: Various Replit-specific plugins for enhanced development experience  

### Planned Integrations (Not Currently Implemented) 

- **Google Drive API**: For cloud backup and synchronization using OAuth 

- **WebAuthn API**: For biometric authentication support 

- **Web Share API**: For sharing PDFs and receiving receipt images 

- **Notification APIs**: Web Notifications and Push API for reminders 

- **File System Access API**: For local file import/export operations 

- **PDF Generation**: Libraries like pdfmake or jsPDF for report generation 

- **Excel Export**: SheetJS (xlsx) for spreadsheet generation 

 ### Database Configuration - **Drizzle ORM**: Configured for MariaDB with schema definitions in TypeScript 

- **Neon Database**: @neondatabase/serverless for Mariadb connection (currently unused as app is offline-first) 

- **Migrations**: Drizzle Kit for database schema migrations  The application is designed to work entirely offline with all business logic and data storage happening on the client side, making it ideal for users who need reliable financial tracking without internet dependency.