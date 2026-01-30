# Awadh Dairy - Dairy Farm & Milk Distribution Management System

## Overview

Awadh Dairy is a comprehensive dairy farm and milk distribution management ERP system designed for daily operational use. The application manages cattle, milk production, customer subscriptions, deliveries, billing, employees, inventory, and equipment for a dairy farm operation.

The system is built as a full-stack TypeScript application with a React frontend and Express backend, using Supabase for authentication and PostgreSQL for data storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Date Handling**: date-fns

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build Tool**: Vite for frontend, esbuild for server bundling
- **API Pattern**: RESTful endpoints prefixed with `/api`

### Authentication System
- Custom PIN-based authentication (6-digit PIN with phone number)
- Session management via Supabase with custom `auth_sessions` table
- Rate limiting for failed login attempts
- Role-based access control with 7 user roles: super_admin, manager, accountant, delivery_staff, farm_worker, vet_staff, auditor

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Database**: PostgreSQL (via Supabase)
- **Schema Location**: `shared/schema.ts`

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React contexts (Auth)
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and configurations
│       └── pages/        # Page components
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data storage interface
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Drizzle database schema
│   └── types.ts      # TypeScript type definitions
└── migrations/       # Database migrations
```

### Key Design Patterns
- **Storage Interface**: Abstract `IStorage` interface for data operations, currently using `MemStorage` (in-memory) with easy path to database implementation
- **Protected Routes**: Authentication wrapper for dashboard routes
- **Component Composition**: PageHeader, DataTable, StatusBadge as reusable patterns
- **Theme System**: CSS variable-based theming with light/dark mode support

## External Dependencies

### Supabase Integration
- **Purpose**: Authentication, database, and real-time features
- **Client Library**: `@supabase/supabase-js`
- **Environment Variables Required**:
  - `VITE_SUPABASE_URL`: Supabase project URL
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/public key
  - `DATABASE_URL`: PostgreSQL connection string for Drizzle

### Database
- PostgreSQL via Supabase
- Drizzle ORM for schema management and queries
- Migrations stored in `/migrations` directory
- Push schema changes with `npm run db:push`

### Third-Party Libraries
- **PDF Generation**: jsPDF with jspdf-autotable (for reports/invoices)
- **Excel Export**: xlsx library
- **Session Storage**: connect-pg-simple for Express sessions

### Development Tools
- Replit-specific plugins for development (cartographer, dev-banner, runtime-error-modal)
- TypeScript with strict mode enabled
- Path aliases: `@/` for client/src, `@shared/` for shared directory