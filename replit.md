# Awadh Dairy - Dairy Farm & Milk Distribution Management System

## Overview

Awadh Dairy is a comprehensive dairy farm and milk distribution management ERP system designed for daily operational use. The application manages cattle, milk production, customer subscriptions, deliveries, billing, employees, inventory, and equipment for a dairy farm operation.

The system is built as a full-stack TypeScript application with a React frontend and Express backend, using Replit's PostgreSQL database with Drizzle ORM for data storage and custom PIN-based authentication.

## Recent Changes (January 2026)

### Database Migration: Supabase to Replit PostgreSQL
- Migrated from Supabase to Replit's built-in PostgreSQL database
- Implemented custom PIN-based authentication with SHA256 hashing (salt: 'awadh_dairy_salt')
- Added server-side session management with 24-hour token expiry
- All API routes now protected with Bearer token authentication middleware
- Added Zod validation for all POST/PUT endpoints using drizzle-zod schemas
- Removed @supabase/supabase-js dependency

### Default Admin Users
- Phone: 9876543210, PIN: 123456 (Admin)
- Phone: 9876543211, PIN: 123456 (Manager)
- Phone: 9876543212, PIN: 123456 (Delivery)

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
- **Database**: Replit PostgreSQL with Drizzle ORM
- **Authentication**: Custom PIN-based auth with session tokens

### Authentication System
- Custom PIN-based authentication (6-digit PIN with phone number)
- Server-side session management with 24-hour token expiry
- SHA256 password hashing with salt
- Bearer token authentication for all protected API endpoints
- Role-based access control with 7 user roles: super_admin, manager, accountant, delivery_staff, farm_worker, vet_staff, auditor

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Database**: Replit PostgreSQL (Neon-backed)
- **Schema Location**: `shared/schema.ts` (30+ tables)
- **Connection**: Uses DATABASE_URL environment variable

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React contexts (Auth)
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and API client
│       └── pages/        # Page components
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions with auth middleware
│   ├── storage.ts    # Database operations via Drizzle
│   └── db.ts         # Database connection
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Drizzle database schema (30+ tables)
│   └── types.ts      # TypeScript type definitions
└── drizzle.config.ts # Drizzle configuration
```

### Key Design Patterns
- **Storage Interface**: Database operations via Drizzle ORM in `server/storage.ts`
- **Auth Middleware**: Bearer token validation for protected routes
- **Request Validation**: Zod schemas for all POST/PUT endpoints
- **Protected Routes**: Authentication wrapper for dashboard routes
- **Component Composition**: PageHeader, DataTable, StatusBadge as reusable patterns
- **Theme System**: CSS variable-based theming with light/dark mode support

### Database Schema (30+ tables)
- **Core**: profiles, user_sessions
- **Cattle Management**: cattle, milk_production, health_records, breeding_records
- **Sales & Delivery**: customers, products, routes, deliveries, delivery_items
- **Billing**: invoices, invoice_items, payments, bottle_transactions
- **HR**: employees, attendance, payroll
- **Finance**: expenses, expense_categories
- **Inventory**: inventory_items, inventory_transactions
- **Equipment**: equipment, equipment_maintenance
- **Procurement**: milk_vendors, milk_procurement, vendor_payments
- **Suppliers**: suppliers, purchase_orders, purchase_order_items
- **System**: audit_logs, dairy_settings

### Modern Animation System
The UI includes extensive animations and modern effects:

#### CSS Animation Classes (index.css)
- `gradient-animated` / `gradient-animated-fast` - Animated gradient backgrounds
- `glass-card` / `glass-strong` - Glassmorphism effects with blur
- `gradient-card-green/blue/amber/purple/red` - Colored gradient stat cards
- `glow-green/blue/amber/primary` - Glowing box shadows
- `hover-glow` - Glow effect on hover with lift
- `shimmer` - Loading skeleton animation
- `float` - Floating up/down animation
- `modern-card` - Hover lift with shadow and border color change
- `btn-gradient` / `btn-gradient-blue` - Gradient button styles
- `shine` - Shine sweep effect on hover
- `stagger-1` through `stagger-5` - Sequential animation delays

#### Reusable Animated Components
- `AnimatedCounter` / `AnimatedNumber` - Numbers that count up on scroll
- `GradientCard` - Stat card with gradient background, icon, trend indicator
- `GlowButton` - Gradient button with hover glow and loading state

#### Mobile Layout
- Bottom navigation with gradient-colored active icons
- Glassmorphism mobile header with status indicator
- Safe area padding for notched devices

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string (auto-provided by Replit)

### Optional (No longer required after Supabase migration)
- ~~`VITE_SUPABASE_URL`~~: Removed - was Supabase project URL
- ~~`VITE_SUPABASE_PUBLISHABLE_KEY`~~: Removed - was Supabase anon/public key

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:push --force` - Force push schema (use with caution)

## Third-Party Libraries
- **PDF Generation**: jsPDF with jspdf-autotable (for reports/invoices)
- **Excel Export**: xlsx library
- **Database**: drizzle-orm with pg driver

## Development Tools
- Replit-specific plugins for development (cartographer, dev-banner, runtime-error-modal)
- TypeScript with strict mode enabled
- Path aliases: `@/` for client/src, `@shared/` for shared directory
