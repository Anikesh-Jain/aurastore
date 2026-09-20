# AuraStore — Modern Full-Stack E-Commerce Platform

A production-grade, full-stack modern e-commerce marketplace engineered with **Next.js 15 (App Router, TypeScript, React 19)**, **PostgreSQL exclusively with Prisma ORM**, **Tailwind CSS + Shadcn UI**, **Auth.js / NextAuth (Role-Based Access Control)**, **Razorpay (Orders API + Cryptographic HMAC Webhook)**, **Cloudinary** media storage, and **Resend** transactional emails.

## 🌐 Live Demo & Repository

- **Live Website:** https://aurastore-nu.vercel.app/
- **GitHub Repository:** https://github.com/Anikesh-Jain/aurastore
- **Developer Portfolio:** https://anikesh-portfolio-seven.vercel.app/

---

## 🚀 Key Highlights & Architectural Features

- **⚡ Full-Stack Next.js 15 App Router:** Server Components, Server Actions, Route Handlers, and Turbo-optimized builds.
- **🐘 Pure PostgreSQL with Prisma ORM:** Relational database schema with strict types, indexes, and transactional guarantees (`prisma.$transaction`).
- **🔐 Role-Based Access Control (RBAC):** NextAuth session authentication protecting customer routes (`/profile`, `/orders`, `/checkout`) and admin management routes (`/admin/*`).
- **💳 Razorpay Payment Gateway & Secure Webhooks:** Client-side Razorpay modal paired with HMAC-SHA256 signature verification and `/api/webhooks/razorpay` asynchronous event fulfillment.
- **📸 Cloudinary Media Storage:** Direct and server-side image uploads for products, categories, and customer photo reviews (`ReviewImage`).
- **📧 Resend Transactional Emails:** Automated HTML email dispatch for Order Confirmations, Order Status Updates (`PROCESSING` → `SHIPPED` → `DELIVERED`), and Welcome notices.
- **🎨 Modern Design System:** Fully responsive Tailwind CSS + Shadcn UI with accessible dark/light theme switching (`next-themes`) and Sonner toast feedback.

### 🛍️ Complete Customer Storefront

- Dynamic Hero Spotlight, Category cards, and Deals banner.
- Multi-faceted Product Catalog (`/products`) with Category filter, Price range slider, In-stock checkbox, Rating filters, and Instant Search.
- Product Details (`/products/[slug]`) with multi-image gallery, dynamic stock indicators, related products carousel, and customer reviews with photo attachments.
- Persistent Shopping Cart & Wishlist powered by Zustand with real-time Coupon Code validation (`WELCOME20`, `MEGA500`).
- Interactive Multi-step Checkout & Order Status Milestone Timeline (`/orders/[id]`).

### 📊 Comprehensive Admin Management Portal (`/admin`)

- KPI Dashboard with live revenue calculation and Recharts visual trends.
- Product CRUD with Cloudinary multi-image uploader & active/featured toggles.
- Category CRUD with cover imagery.
- Order Fulfillment manager with 1-click status updater triggering live customer Resend emails.
- Coupon Code manager & Customer directory with lifetime spend tracking.

---

## 📸 Screenshots

### Storefront

| Homepage | Category Showcase |
|---|---|
| ![AuraStore Homepage](docs/screenshots/01-homepage.png) | ![Category Showcase](docs/screenshots/02-category-showcase.png) |

| Offers & Benefits |
|---|
| ![Offers & Benefits](docs/screenshots/03-offers-footer.png) |

### Shopping Experience

| Product Catalog | Wishlist |
|---|---|
| ![Product Catalog](docs/screenshots/04-product-catalog.png) | ![Wishlist](docs/screenshots/05-wishlist.png) |

| Shopping Cart | Secure Checkout |
|---|---|
| ![Shopping Cart](docs/screenshots/06-shopping-cart.png) | ![Secure Checkout](docs/screenshots/07-checkout.png) |

### Orders

| Order Confirmation | Order Tracking |
|---|---|
| ![Order Confirmation](docs/screenshots/08-order-confirmation.png) | ![Order Tracking](docs/screenshots/09-order-tracking.png) |

### Admin Portal

| Admin Dashboard |
|---|
| ![Admin Dashboard](docs/screenshots/10-admin-dashboard.png) |

---

## 🛠️ Tech Stack Overview

| Category | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, React 19, TypeScript) |
| **Database & ORM** | PostgreSQL + Prisma ORM |
| **Styling & Components** | Tailwind CSS + Shadcn UI + Radix UI + Lucide Icons |
| **Authentication** | NextAuth.js v4 (Credentials) + bcryptjs |
| **Payment Gateway** | Razorpay SDK + Cryptographic SHA-256 HMAC Webhook |
| **Media Storage** | Cloudinary SDK |
| **Transactional Email** | Resend SDK |
| **State Management** | Zustand (with LocalStorage persistence) |
| **Charts & Analytics** | Recharts |
| **Forms & Validation** | Zod + React Hook Form |

---

## 📁 Project Directory Structure

```text
ecommerce-platform/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── profile/
│   │   ├── wishlist/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── layout/
│   │   ├── product/
│   │   ├── profile/
│   │   ├── ui/
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── prisma.ts
│   │   ├── razorpay.ts
│   │   ├── resend.ts
│   │   └── utils.ts
│   ├── stores/
│   │   ├── cartStore.ts
│   │   └── wishlistStore.ts
│   ├── types/
│   │   └── next-auth.d.ts
│   └── middleware.ts
├── .env.example
├── components.json
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env` and fill in your connection details:

```bash
cp .env.example .env
```

```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db?schema=public"

# NextAuth / Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-long"

# Admin Initial Seed Credentials (Used during prisma db seed)
ADMIN_NAME="Platform Admin"
ADMIN_EMAIL="admin@ecommerce.com"
ADMIN_PASSWORD="AdminSecurePassword123!"

# Cloudinary Media Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay Payments & Webhook
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret_key"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"

# Resend Transactional Emails
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="AuraStore <onboarding@resend.dev>"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🛠️ Quick Start Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client & Push Database Schema

Ensure your PostgreSQL server is running and `DATABASE_URL` is configured in `.env`:

```bash
npx prisma db push
```

### 3. Seed Sample Database

Populate realistic categories, products, customer reviews with images, coupons, and the admin account:

```bash
npm run prisma:seed
```

### 4. Start the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 🔑 Demo Login Accounts

Both accounts can be autofilled with 1-click on the `/auth/signin` page:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Store Admin** | `admin@ecommerce.com` | `AdminSecurePassword123!` | Full access to `/admin` dashboard, product/category/order CRUD, and customer analytics |
| **Customer** | `customer@ecommerce.com` | `Customer123!` | Standard shopping, cart, wishlist, checkout, orders tracking, and review writing |

---

## 🎟️ Demo Promo Codes

Test these at `/cart` or `/checkout`:

- **`WELCOME20`**: 20% discount on cart subtotal ≥ ₹2,000 (Max discount ₹1,000)
- **`MEGA500`**: Flat ₹500 discount on orders ≥ ₹3,000
- **`FESTIVE10`**: 10% discount on orders ≥ ₹1,000

---

## 👨‍💻 Author

**Anikesh Jain**  
B.Tech CSE Student — Acropolis Institute of Technology and Research (AITR), Indore

- Portfolio: https://anikesh-portfolio-seven.vercel.app/
- GitHub: https://github.com/Anikesh-Jain
- LinkedIn: https://www.linkedin.com/in/anikeshjain/

---

## 📄 License

Personal portfolio and creative work. Do not reuse personal information, photographs, certificates, or creative assets without permission.
