# Luxe | Premium eCommerce Platform

A production-ready eCommerce solution built with **Next.js 16**, **TypeScript**, **Prisma**, and **Stripe**. This platform features a high-end storefront and a robust Admin Dashboard for full catalog and order management.

## 🚀 Key Features

### Storefront
*   **Premium UI**: Modern design with Framer Motion animations and responsive layouts.
*   **Global State**: Managed with Zustand for carts and wishlist persistence.
*   **Secure Checkout**: Integrated with Stripe Elements and Server-Side payment validation.
*   **Auth System**: NextAuth v5 implementation with role-based access control.

### Admin Dashboard (`/admin`)
*   **Sales Analytics**: Real-time revenue tracking and sales performance charts.
*   **Product Management**: Full CRUD with soft-deletes, archiving, and automatic Sharp-powered image optimization.
*   **Order Workflow**: Manage statuses (Paid, Processing, Shipped, etc.) with automatic audit logging.
*   **Customer Insights**: Lifetime value tracking and order history metrics.
*   **Audit System**: Complete transparency with an internal audit log tracking all admin actions.

## 🛠️ Tech Stack

*   **Framework**: Next.js 16 (App Router)
*   **Database**: PostgreSQL with Prisma ORM
*   **Styling**: Tailwind CSS + Shadcn/UI
*   **Payments**: Stripe
*   **Storage/Images**: Sharp (Image processing) + Local FS
*   **Validation**: Zod
*   **Authentication**: NextAuth.js v5

## 📦 Getting Started

### 1. Environment Setup
Create a `.env` file based on `.env.example`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
NEXTAUTH_SECRET="your-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 2. Install & Sync
Run the automated setup script to move files into route groups, install dependencies, and sync the database:
```powershell
./setup.ps1
```

### 3. Run Development Server
```bash
npm run dev
```

## 🧪 Admin Credentials
*   **User**: `admin@luxe.com`
*   **Password**: `admin123`

## 🛡️ License
MIT
