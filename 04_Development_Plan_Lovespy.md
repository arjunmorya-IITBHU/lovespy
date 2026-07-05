# Lovespy – Development Planning
## MVP → V1 → V2 Roadmap

**Version:** 1.0 | **Date:** June 2025

---

## Overview

| Phase | Timeline | Goal |
|---|---|---|
| **MVP** | Weeks 1–8 | Core buying flow live, revenue-generating |
| **V1** | Weeks 9–16 | Full hamper builder + loyalty program |
| **V2** | Weeks 17–24 | AI features, corporate portal, mobile app |

---

## Phase 0: Setup & Infrastructure (Week 1)

### Tasks
- [ ] GitHub monorepo setup (frontend + backend)
- [ ] Next.js 14 project with TypeScript + Tailwind CSS
- [ ] Node.js + Express backend scaffold
- [ ] PostgreSQL database on Railway or Supabase
- [ ] AWS S3 bucket for image/file storage
- [ ] Vercel project for frontend deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment variables strategy (.env structure)
- [ ] Figma design file setup + design tokens defined
- [ ] Postman API collection started

**Deliverables:** Live skeleton app on Vercel, working DB connection

---

## Phase 1: MVP (Weeks 2–8)

### Goal: Users can browse products, sign up, and place orders

---

### Week 2: Auth + Product Catalog Backend

**Backend:**
- [ ] User registration with OTP (SMS via Twilio/MSG91)
- [ ] Google OAuth integration
- [ ] JWT access + refresh token flow
- [ ] Category CRUD endpoints
- [ ] Product CRUD endpoints (admin)
- [ ] Product list + detail endpoints (public)

**Frontend:**
- [ ] Design system setup in Tailwind (colors, fonts, spacing)
- [ ] Reusable component library (Button, Input, Card, Badge, Modal)
- [ ] Login / Register page (OTP + Google)
- [ ] Homepage skeleton with placeholder sections

---

### Week 3: Product Browsing + Cart

**Backend:**
- [ ] Search endpoint with keyword filter
- [ ] Wishlist add/remove endpoints
- [ ] Cart (session-based for guests, DB-backed for logged-in users)

**Frontend:**
- [ ] Category page with filter + sort
- [ ] Product card component
- [ ] Product detail page (image gallery, description, add to cart)
- [ ] Cart page (items, quantity, remove, price summary)
- [ ] Header with cart count indicator

---

### Week 4: Checkout + Payments

**Backend:**
- [ ] Address CRUD endpoints
- [ ] Razorpay order creation endpoint
- [ ] Payment verification + webhook handler
- [ ] Order creation on payment success
- [ ] Order confirmation email (NodeMailer / SendGrid)

**Frontend:**
- [ ] Checkout flow (3 steps): Info → Address → Payment
- [ ] Delivery type + date + slot selector
- [ ] Razorpay checkout integration
- [ ] Order confirmation page

---

### Week 5: Order Tracking + User Dashboard

**Backend:**
- [ ] Order history endpoint
- [ ] Admin order status update endpoint

**Frontend:**
- [ ] Order tracking page with timeline UI
- [ ] User dashboard (orders, saved addresses, profile)
- [ ] Profile edit page
- [ ] Wishlist page

---

### Week 6: Admin Panel (MVP)

**Frontend (Admin):**
- [ ] Admin login (separate route, role check)
- [ ] Dashboard with summary cards (orders, revenue)
- [ ] Product list + add/edit/delete (with image upload to S3)
- [ ] Order list with status filter
- [ ] Order detail + status update buttons

---

### Week 7: Homepage Polish + SEO

**Frontend:**
- [ ] Hero banner slider (dynamic from admin)
- [ ] Shop by Category section
- [ ] Trending Hampers section (manual curation from admin)
- [ ] Customer reviews section (static placeholder for MVP)
- [ ] Meta tags + Open Graph tags + sitemap.xml
- [ ] Google Analytics 4 integration

---

### Week 8: QA + Launch Prep

- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsiveness audit (320px → 1440px)
- [ ] Lighthouse performance audit + fixes
- [ ] Security audit (API rate limiting, CORS, input validation)
- [ ] Load test with k6 (simulate 500 concurrent users)
- [ ] Payment flow end-to-end test
- [ ] Staging → Production deployment
- [ ] Domain + SSL setup

**MVP Launch Checklist:**
- ✅ Users can register, browse, add to cart, checkout, pay
- ✅ Order confirmation emails sent
- ✅ Admin can manage products + update order status
- ✅ Tracking page works
- ✅ Mobile-responsive

---

## Phase 2: V1 – Full Product (Weeks 9–16)

### Goal: Hamper builder live, loyalty program, full UX polish

---

### Week 9–10: Build Your Own Hamper

**Backend:**
- [ ] Hamper box CRUD
- [ ] Custom hamper create/update/delete
- [ ] Hamper items add/remove
- [ ] Personalization save (letter, photo, voice QR)
- [ ] Hamper pricing calculation endpoint
- [ ] File upload for photos + audio (S3)
- [ ] Draft hamper save/restore

**Frontend:**
- [ ] Hamper builder UI (Step 1: Box selection)
- [ ] Step 2: Product picker with category filter
- [ ] Fly-to-basket animation (CSS + Framer Motion)
- [ ] Live basket panel (count, price, capacity indicator)
- [ ] Step 3: Personalization form
- [ ] Step 4: Preview mockup (illustrated 2D hamper)
- [ ] Hamper to cart flow

---

### Week 11: Emotional Avatar Assistant

**Frontend:**
- [ ] Avatar mascot design (5 states)
- [ ] Avatar floating widget component
- [ ] Cart value → avatar state mapping logic
- [ ] Context-aware message suggestions
- [ ] Avatar animations per state (CSS keyframes)
- [ ] Avatar product recommendation bubbles

---

### Week 12: Coupons + Loyalty Program

**Backend:**
- [ ] Coupon validation endpoint
- [ ] Coupon apply/remove in cart
- [ ] Reward points calculation on order complete (webhook)
- [ ] Reward points redemption at checkout
- [ ] Referral code generation + tracking
- [ ] Points history endpoint

**Frontend:**
- [ ] Coupon input field in cart
- [ ] Rewards dashboard page
- [ ] Points balance in header (for logged-in users)
- [ ] "Use Points" toggle at checkout

---

### Week 13: Reviews + UGC

**Backend:**
- [ ] Review submit endpoint (with photo upload)
- [ ] Review approval (admin)
- [ ] Rating aggregation on product update

**Frontend:**
- [ ] Review form on order detail page (post-delivery)
- [ ] Reviews section on product detail page
- [ ] UGC photo gallery on homepage
- [ ] Admin review moderation panel

---

### Week 14: Advanced Admin Panel

**Frontend (Admin):**
- [ ] Analytics dashboard (Chart.js: revenue graph, top products)
- [ ] Coupon management (CRUD)
- [ ] Banner management (CRUD + preview)
- [ ] Customer database table (search, export CSV)
- [ ] Inventory alerts (low stock products)

---

### Week 15: Performance + Notifications

**Backend:**
- [ ] WhatsApp Business API integration (order status updates)
- [ ] Cron job: occasion reminders (birthday, anniversary)
- [ ] Redis caching for product listing endpoints

**Frontend:**
- [ ] Notification preferences in user settings
- [ ] PWA manifest + service worker (offline product cache)

---

### Week 16: V1 QA + Launch

- [ ] Full regression test suite
- [ ] Hamper builder E2E test (Playwright)
- [ ] Payment retry flow test
- [ ] Accessibility audit (axe-core)
- [ ] V1 launch

---

## Phase 3: V2 – Growth Features (Weeks 17–24)

### Goal: AI features, corporate portal, React Native app

---

### Week 17–18: AI Gift Recommender

**Backend:**
- [ ] Claude API integration (gift recommendation engine)
- [ ] Recommendation prompt engineering
- [ ] User preference storage
- [ ] Recommendation logging + feedback

**Frontend:**
- [ ] "Find the Perfect Gift" wizard (age, gender, relationship, occasion, budget)
- [ ] AI result page with product recommendations
- [ ] Thumbs up/down feedback
- [ ] Save recommendation to wishlist

---

### Week 19: Corporate Portal

**Backend:**
- [ ] Corporate account type
- [ ] Bulk order endpoint
- [ ] GST invoice generation
- [ ] Volume discount rules

**Frontend:**
- [ ] Corporate signup/profile
- [ ] Bulk order manager (CSV upload or item picker)
- [ ] GST/company details form
- [ ] Invoice download

---

### Week 20–21: React Native Mobile App

- [ ] React Native + Expo setup
- [ ] Shared API with web backend
- [ ] Core screens: Home, Browse, Cart, Checkout, Dashboard
- [ ] Push notifications (Expo Notifications)
- [ ] Deep links for order tracking
- [ ] App Store + Play Store submission

---

### Week 22–23: Advanced Personalization

**Backend:**
- [ ] Occasion reminder storage
- [ ] Scheduled reminder emails/WhatsApp
- [ ] "Recently Viewed" product tracking
- [ ] Personalized homepage recommendations (collaborative filtering)

**Frontend:**
- [ ] Occasion reminder setup in dashboard
- [ ] Personalized "For You" section on homepage
- [ ] Recently viewed rail

---

### Week 24: V2 QA + Launch

- [ ] Full platform audit
- [ ] Performance benchmarking
- [ ] Security penetration test
- [ ] V2 launch + marketing push

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Animation | Framer Motion |
| State Management | Zustand |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Railway/Supabase) |
| Cache | Redis |
| Storage | AWS S3 |
| Auth | JWT, Google OAuth, OTP (MSG91) |
| Payments | Razorpay, PayPal |
| Email | SendGrid |
| WhatsApp | WhatsApp Business Cloud API |
| Analytics | Google Analytics 4, Microsoft Clarity |
| Testing | Jest (unit), Playwright (E2E), k6 (load) |
| Deployment | Vercel (frontend), Railway or AWS (backend) |
| Mobile (V2) | React Native + Expo |

---

## Team Structure (Recommended)

| Role | MVP | V1 | V2 |
|---|---|---|---|
| Frontend Dev | 2 | 2 | 3 |
| Backend Dev | 1 | 2 | 2 |
| UI/UX Designer | 1 | 1 | 1 |
| QA Engineer | 0.5 | 1 | 1 |
| DevOps / Infra | 0.5 | 0.5 | 1 |
| Product Manager | 1 | 1 | 1 |

---

## API Endpoint Summary (MVP)

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/otp/send | Send OTP to phone |
| POST | /api/auth/otp/verify | Verify OTP, return token |
| POST | /api/auth/google | Google OAuth callback |
| GET | /api/products | List products (with filters) |
| GET | /api/products/:slug | Product detail |
| GET | /api/categories | All categories |
| POST | /api/cart | Add to cart |
| GET | /api/cart | Get cart |
| DELETE | /api/cart/:itemId | Remove from cart |
| GET | /api/wishlist | Get wishlist |
| POST | /api/wishlist | Add to wishlist |
| GET | /api/addresses | User addresses |
| POST | /api/addresses | Add address |
| POST | /api/orders/payment/initiate | Create Razorpay order |
| POST | /api/orders/payment/verify | Verify payment signature |
| GET | /api/orders | User order history |
| GET | /api/orders/:id | Order detail |
| GET | /api/admin/orders | All orders (admin) |
| PATCH | /api/admin/orders/:id/status | Update order status |
| POST | /api/admin/products | Create product |
| PUT | /api/admin/products/:id | Update product |
| DELETE | /api/admin/products/:id | Delete product |
