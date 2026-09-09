**# AuraStore — Modern Full-Stack E-Commerce Platform**

A production-grade, full-stack modern e-commerce marketplace engineered with **\*\*Next.js 15 (App Router, TypeScript, React 19)\*\***, **\*\*PostgreSQL exclusively with Prisma ORM\*\***, **\*\*Tailwind CSS + Shadcn UI\*\***, **\*\*Auth.js / NextAuth (Role-Based Access Control)\*\***, **\*\*Razorpay (Orders API + Cryptographic HMAC Webhook)\*\***, **\*\*Cloudinary\*\*** media storage, and **\*\*Resend\*\*** transactional emails.

\---

**## 🚀 Key Highlights & Architectural Features**

\- **\*\*⚡ Full-Stack Next.js 15 App Router:\*\*** Server Components, Server Actions, Route Handlers, and Turbo-optimized builds.

\- **\*\*🐘 Pure PostgreSQL with Prisma ORM:\*\*** Relational database schema with strict types, indexes, and transactional guarantees (\`prisma.$transaction\`).

\- **\*\*🔐 Role-Based Access Control (RBAC):\*\*** NextAuth session authentication protecting customer routes (\`/profile\`, \`/orders\`, \`/checkout\`) and admin management routes (\`/admin/\*\`).

\- **\*\*💳 Razorpay Payment Gateway & Secure Webhooks:\*\*** Client-side Razorpay modal (UPI, Cards, NetBanking, Wallets) paired with a dedicated HMAC-SHA256 signature verification endpoint and \`/api/webhooks/razorpay\` asynchronous event fulfillment listener.

\- **\*\*📸 Cloudinary Media Storage:\*\*** Direct and server-side image uploads for products, categories, and customer photo reviews (\`ReviewImage\`).

\- **\*\*📧 Resend Transactional Emails:\*\*** Automated HTML email dispatch for Order Confirmations, Order Status Updates (\`PROCESSING\` $\rightarrow$ \`SHIPPED\` $\rightarrow$ \`DELIVERED\`), and Welcome notices.

\- **\*\*🎨 Modern Design System:\*\*** Fully responsive Tailwind CSS + Shadcn UI with accessible dark/light theme switching (\`next-themes\`) and Sonner toast feedback.

\- **\*\*🛍️ Complete Customer Storefront:\*\***

  - Dynamic Hero Spotlight, Category cards, and Deals banner.

  - Multi-faceted Product Catalog (\`/products\`) with Category filter, Price range slider, In-stock checkbox, Rating filters, and Instant Search.

  - Product Details (\`/products/[slug]\`) with multi-image gallery, dynamic stock indicators, related products carousel, and customer reviews with photo attachments.

  - Persistent Shopping Cart & Wishlist powered by Zustand with real-time Coupon Code validation (\`WELCOME20\`, \`MEGA500\`).

  - Interactive Multi-step Checkout & Order Status Milestone Timeline (\`/orders/[id]\`).

\- **\*\*📊 Comprehensive Admin Management Portal (\`/admin\`):\*\***

  - KPI Dashboard with live revenue calculation and Recharts visual trends.

  - Product CRUD with Cloudinary multi-image uploader & active/featured toggles.

  - Category CRUD with cover imagery.

  - Order Fulfillment manager with 1-click status updater triggering live customer Resend emails.

  - Coupon Code manager & Customer directory with lifetime spend tracking.

\---

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

**## 🛠️ Tech Stack Overview**

\| Category                 | Technology                                         |

\| :----------------------- | :------------------------------------------------- |

\| **\*\*Framework\*\***            | Next.js 15 (App Router, React 19, TypeScript)      |

\| **\*\*Database & ORM\*\***       | PostgreSQL + Prisma ORM                            |

\| **\*\*Styling & Components\*\*** | Tailwind CSS + Shadcn UI + Radix UI + Lucide Icons |

\| **\*\*Authentication\*\***       | NextAuth.js v4 (Credentials) + bcryptjs            |

\| **\*\*Payment Gateway\*\***      | Razorpay SDK + Cryptographic SHA-256 HMAC Webhook  |

\| **\*\*Media Storage\*\***        | Cloudinary SDK                                     |

\| **\*\*Transactional Email\*\***  | Resend SDK                                         |

\| **\*\*State Management\*\***     | Zustand (with LocalStorage persistence)            |

\| **\*\*Charts & Analytics\*\***   | Recharts                                           |

\| **\*\*Forms & Validation\*\***   | Zod + React Hook Form                              |

\---

**## 📁 Project Directory Structure**

\`\`\`text

ecommerce-platform/

├── prisma/

│   ├── schema.prisma              # PostgreSQL schema with pure relational models & ReviewImage

│   └── seed.ts                    # Environment-driven database seeding script

├── src/

│   ├── app/

│   │   ├── admin/                 # Admin Portal (Dashboard, Products, Categories, Orders, Coupons, Customers)

│   │   ├── api/                   # REST Route Handlers (Auth, Upload, Checkout, Webhooks, Reviews, Coupons)

│   │   ├── auth/                  # Sign In & Sign Up pages with demo autofill buttons

│   │   ├── cart/                  # Shopping Cart page with promo code validator

│   │   ├── checkout/              # Multi-step checkout & Order success confirmation

│   │   ├── orders/                # Customer order history & visual milestone tracker

│   │   ├── products/              # Catalog with faceted sidebar filters & Product Details

│   │   ├── profile/               # Customer account profile & delivery addresses manager

│   │   ├── wishlist/              # Customer saved items wishlist

│   │   ├── globals.css            # Tailwind base & dark/light CSS variables

│   │   ├── layout.tsx             # Root layout with Theme, Auth & Toast Providers

│   │   └── page.tsx               # Homepage with Hero, Categories & Featured gear

│   ├── components/

│   │   ├── admin/                 # Admin dashboard, products, categories, orders, coupons clients

│   │   ├── cart/                  # Slide-over CartDrawer

│   │   ├── checkout/              # CheckoutClient with Razorpay modal

│   │   ├── layout/                # Navbar, Footer, ModeToggle

│   │   ├── product/               # ProductCard, ProductCatalogClient, ProductDetailsClient

│   │   ├── profile/               # ProfileClient

│   │   ├── ui/                    # Shadcn UI primitives (Button, Card, Input, Dialog, etc.)

│   │   └── providers.tsx          # Client-side Theme, Session & Toast wrapper

│   ├── lib/

│   │   ├── auth.ts                # NextAuth options & JWT RBAC callbacks

│   │   ├── cloudinary.ts          # Cloudinary upload & delete helpers

│   │   ├── prisma.ts              # Singleton Prisma client instance

│   │   ├── razorpay.ts            # Razorpay client & HMAC signature verifier

│   │   ├── resend.ts              # Resend email templates & dispatchers

│   │   └── utils.ts               # Price formatting (₹ INR), discount calculation, cn helper

│   ├── stores/

│   │   ├── cartStore.ts           # Zustand Cart store with persistence

│   │   └── wishlistStore.ts       # Zustand Wishlist store with persistence

│   ├── types/

│   │   └── next-auth.d.ts         # TypeScript module augmentations for custom roles

│   └── middleware.ts              # Next.js Route protection & Admin RBAC guard

├── .env.example                   # Clean environment configuration template

├── components.json                # Shadcn UI configuration

├── next.config.ts                 # Next.js config with remote image domains

├── package.json                   # Dependencies and npm scripts

├── tailwind.config.ts             # Tailwind CSS theme extension

└── tsconfig.json                  # TypeScript compiler options and @/\* aliases

\`\`\`

\---

**## ⚙️ Environment Variables Setup**

Copy \`.env.example\` to \`.env\` and fill in your connection details:

\`\`\`bash

cp .env.example .env

\`\`\`

\`\`\`env

\# PostgreSQL Database URL

DATABASE\_URL="postgresql://username\:password\@localhost:5432/ecommerce\_db?schema=public"

\# NextAuth / Auth.js

NEXTAUTH\_URL="http\://localhost:3000"

NEXTAUTH\_SECRET="your-super-secret-key-min-32-chars-long"

\# Admin Initial Seed Credentials (Used during prisma db seed)

ADMIN\_NAME="Platform Admin"

ADMIN\_EMAIL="admin\@ecommerce.com"

ADMIN\_PASSWORD="AdminSecurePassword123!"

\# Cloudinary Media Storage

NEXT\_PUBLIC\_CLOUDINARY\_CLOUD\_NAME="your-cloud-name"

CLOUDINARY\_API\_KEY="your-api-key"

CLOUDINARY\_API\_SECRET="your-api-secret"

\# Razorpay Payments & Webhook

NEXT\_PUBLIC\_RAZORPAY\_KEY\_ID="rzp\_test\_your\_key\_id"

RAZORPAY\_KEY\_SECRET="your\_razorpay\_secret\_key"

RAZORPAY\_WEBHOOK\_SECRET="your\_razorpay\_webhook\_secret"

\# Resend Transactional Emails

RESEND\_API\_KEY="re\_your\_resend\_api\_key"

EMAIL\_FROM="AuraStore \<onboarding\@resend.dev>"

\# Application Base URL

NEXT\_PUBLIC\_APP\_URL="http\://localhost:3000"

\`\`\`

\---

**## 🛠️ Quick Start Guide**

**### 1. Install Dependencies**

\`\`\`bash

npm install

\`\`\`

**### 2. Generate Prisma Client & Push Database Schema**

Ensure your PostgreSQL server is running and \`DATABASE\_URL\` is configured in \`.env\`:

\`\`\`bash

npx prisma db push

\`\`\`

**### 3. Seed Sample Database**

Populate realistic categories, products, customer reviews with images, coupons, and the admin account:

\`\`\`bash

npm run prisma\:seed

\`\`\`

**### 4. Start the Development Server**

\`\`\`bash

npm run dev

\`\`\`

Open [http\://localhost:3000]\(http\://localhost:3000) in your browser.

\---

**## 🔑 Demo Login Accounts**

Both accounts can be autofilled with 1-click on the \`/auth/signin\` page:

\| Role            | Email                    | Password                  | Access Rights                                                                          |

\| :-------------- | :----------------------- | :------------------------ | :------------------------------------------------------------------------------------- |

\| **\*\*Store Admin\*\*** | \`admin\@ecommerce.com\`    | \`AdminSecurePassword123!\` | Full access to \`/admin\` dashboard, product/category/order CRUD, and customer analytics |

\| **\*\*Customer\*\***    | \`customer\@ecommerce.com\` | \`Customer123!\`            | Standard shopping, cart, wishlist, checkout, orders tracking, and review writing       |

\---

**## 🎟️ Demo Promo Codes**

Test these at \`/cart\` or \`/checkout\`:

\- **\*\*\`WELCOME20\`\*\***: 20% discount on cart subtotal $\ge$ ₹2,000 (Max discount ₹1,000)

\- **\*\*\`MEGA500\`\*\***: Flat ₹500 discount on orders $\ge$ ₹3,000

\- **\*\*\`FESTIVE10\`\*\***: 10% discount on orders $\ge$ ₹1,000