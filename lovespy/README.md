# Lovespy - Personalized Gifting Platform

Lovespy is a modern, premium e-commerce platform designed for Gen-Z. It allows users to browse curated gifts, purchase ready-made hampers, and build fully customized hampers with emotional personalization elements (e.g., handwritten letters, Polaroid photos, and voice QR codes).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion
- **Database Layer**: PostgreSQL (development seeds provided in `src/lib/db.ts`)
- **Authentication**: OTP Phone Sign-In & Google OAuth (JWT-secured)
- **Payment Gateways**: Razorpay (Domestic) & PayPal (International)
- **Media Hosting**: AWS S3 Bucket (for uploading Polaroid prints and voice messages)

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18.0.0 or higher
- npm, yarn, or pnpm package manager

### Installation

1. Navigate to the project folder:
   ```bash
   cd lovespy
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env.local`
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and configure your credentials (e.g., Database URLs, JWT secrets, S3 bucket keys, Razorpay keys).

### Running Locally

To run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🏗️ Folder Structure

```
lovespy/
├── package.json           # Dependencies and build scripts
├── tsconfig.json          # TypeScript compiler parameters
├── tailwind.config.ts     # Brand styling palette and keyframe animations
├── .env.example           # Configuration credential placeholders
└── src/
    ├── app/               # Next.js App Router Page layouts
    │   ├── page.tsx       # Home Page (Hero, Curated Occasions, Testimonials)
    │   ├── shop/          # Gifting catalog (advanced sorting & price filters)
    │   │   ├── page.tsx
    │   │   └── [slug]/    # Dynamic details page (zooms, specifications, custom reviews)
    │   ├── hamper-builder/# 4-Step Interactive custom chest compiler (Flagship)
    │   ├── cart/          # Cart management, coupon discount, reward redemptions
    │   ├── checkout/      # Multi-step checkout & payment simulators
    │   ├── tracking/      # Visual logistics tracking status timeline
    │   ├── dashboard/     # User profile, wishlists, address books
    │   ├── admin/         # Analytics charts, product CRUD & order management
    │   └── api/           # Backend App Router Route Handlers (OTP, verification, Orders)
    ├── components/        # Reusable global layout elements
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   └── AvatarWidget.tsx # Animated Emotional mascot wiggling based on cart totals
    ├── context/           # React hooks for global states (Cart state, Auth states)
    ├── lib/               # Database connectors & utilities
    │   └── db.ts          # Seed data lists & mock database
    └── styles/
        └── globals.css    # Custom scrollbar, glassmorphic layout utility classes
```

---

## 💳 Payment Gateway Integration (Razorpay)

To activate Razorpay in checkout:
1. Ensure your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are declared in your `.env.local` file.
2. Include the official Razorpay checkout script in `src/app/layout.tsx`:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```
3. Initialize a transaction request inside `/api/orders` to get an order ID, and bind it to the Razorpay Checkout form on the client side.

---

## 🔒 Security Audit & Production Release

1. **Environment Variables**: Never commit `.env.local` to public repositories. Set up secrets in your Vercel/Railway dashboard.
2. **CORS Headers**: Set up Next.js configuration to only allow requests from secure origins.
3. **Build Target**: Compile the optimized bundle:
   ```bash
   npm run build
   ```
4. **Deploy**: Deploy the frontend folder directly to **Vercel** with one click. Deploy databases to **Supabase** or **Railway**.
