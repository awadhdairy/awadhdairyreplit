# Awadh Dairy - Dairy Farm & Milk Distribution Management System

## Overview

Awadh Dairy is a comprehensive dairy farm and milk distribution management ERP system designed for daily operational use. The application manages cattle, milk production, customer subscriptions, deliveries, billing, employees, inventory, and equipment for a dairy farm operation.

The system is built as a **frontend-only React application** that connects directly to **Supabase** for database, authentication, and backend services. It is designed for deployment on **Vercel** as a static site.

## Recent Changes (January 2026)

### Migration to Supabase + Vercel Deployment
- **Removed Express backend** - All backend logic moved to Supabase client
- **Supabase integration** - Using Supabase PostgreSQL for database, custom PIN-based auth
- **Vercel-ready** - Configured for static deployment with `npm run build`
- **Direct database access** - Frontend uses `@supabase/supabase-js` client directly
- **Schema SQL** - Complete database schema in `supabase/schema.sql` (execute in Supabase SQL Editor)

### Admin Access
- Phone: 7897716792, PIN: 101101 (Super Admin)

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
- **Database Client**: @supabase/supabase-js

### Backend Architecture (Supabase)
- **Database**: Supabase PostgreSQL
- **Authentication**: Custom PIN-based auth with SHA256 hashing
- **Session Management**: user_sessions table with 24-hour token expiry
- **API Pattern**: Direct Supabase client operations (no REST API layer)

### Authentication System
- Custom PIN-based authentication (6-digit PIN with phone number)
- Client-side session management stored in localStorage
- SHA256 password hashing with salt ('awadh_dairy_salt')
- Role-based access control with 7 user roles: super_admin, manager, accountant, delivery_staff, farm_worker, vet_staff, auditor

### Data Layer
- **Database**: Supabase PostgreSQL
- **Client**: @supabase/supabase-js v2
- **Schema Location**: `supabase/schema.sql` (30+ tables)
- **API Layer**: `client/src/lib/supabase.ts`

### Project Structure
```
├── client/               # React frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React contexts (Auth)
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and Supabase client
│       │   └── supabase.ts  # All database operations
│       └── pages/        # Page components
├── supabase/             # Supabase configuration
│   └── schema.sql        # Complete database schema (run in Supabase SQL Editor)
├── shared/               # Shared types and schemas
│   └── types.ts          # TypeScript type definitions
├── vite.config.ts        # Vite configuration for static build
└── vercel.json           # Vercel deployment configuration
```

### Key Design Patterns
- **Supabase API**: All CRUD operations in `client/src/lib/supabase.ts`
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
- **System**: audit_logs, settings

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

### Required for Supabase
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/public key

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy - Vercel will automatically run `npm run build`

### Supabase Setup
1. Create a new Supabase project
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key to environment variables

## Development Commands

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally

## Third-Party Libraries
- **PDF Generation**: jsPDF with jspdf-autotable (for reports/invoices)
- **Excel Export**: xlsx library
- **Database**: @supabase/supabase-js

## Development Tools
- TypeScript with strict mode enabled
- Path aliases: `@/` for client/src, `@shared/` for shared directory
