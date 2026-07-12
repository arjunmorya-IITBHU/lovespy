# Product Requirements Document (PRD)
## Lovespy – Personalized Gift & Hamper E-Commerce Platform
**Version:** 1.0  
**Date:** June 2025  
**Status:** Draft for Review

---

## 1. Executive Summary

Lovespy is a Gen-Z-focused gifting e-commerce platform targeting 18–35-year-old users. Its core differentiator is the **Build Your Own Hamper** feature, supported by an emotional avatar assistant, deep personalization tools, and a premium aesthetics-first design language. The platform aims to make gifting an experience, not just a transaction.

**Business Goals:**
- Conversion Rate > 3%
- Cart Abandonment < 40%
- Average Order Value > ₹1,500
- Customer Satisfaction > 4.5/5
- Repeat Purchase Rate > 25%

---

## 2. Problem Statement

Current gifting platforms are transactional, impersonal, and UI-dull. Young buyers want:
1. Personalized, curated hampers they can customize
2. An engaging, emotionally resonant shopping experience
3. Premium presentation that feels like a gift in itself
4. Mobile-first, fast, visually delightful interfaces

---

## 3. Target Users

### 3.1 Primary Personas

**Persona A – "The Thoughtful Gifter" (Priya, 22)**
- College student, Delhi
- Buys for birthdays, friendships, anniversaries
- Budget: ₹500–₹2,000
- Device: Mobile-first
- Pain point: Can't find something "personal enough"

**Persona B – "The Romantic Partner" (Arjun, 28)**
- Young professional, Bengaluru
- Buys for partner on Valentine's Day, anniversaries
- Budget: ₹2,000–₹5,000
- Device: Mobile + Desktop
- Pain point: Wants premium delivery experience, midnight options

**Persona C – "The Corporate Buyer" (HR Manager, 35)**
- Needs bulk gifting for festivals/events
- Budget: ₹500–₹1,500 per head, 50–500 units
- Device: Desktop
- Pain point: Needs invoicing, bulk discounts, customisation at scale

### 3.2 Secondary Personas
- Festival/occasion shoppers (Diwali, Raksha Bandhan, Christmas)
- Family gifting (parents to children, siblings)

---

## 4. Feature Requirements

### 4.1 Home Page

| Feature | Priority | Notes |
|---|---|---|
| Hero banner slider with offers | P0 | Auto-rotate, seasonal campaigns |
| Shop by Category grid | P0 | 7 categories, icon-based cards |
| Trending Hampers section | P0 | Best sellers, new arrivals, limited edition |
| Customer reviews/testimonials | P1 | Photos, ratings, UGC |
| Featured collections | P1 | Romantic, Festival, Luxury |
| Avatar assistant widget | P1 | Persistent across pages |
| Newsletter / WhatsApp opt-in | P2 | Bottom section |

### 4.2 Product Catalog

| Feature | Priority | Notes |
|---|---|---|
| Category filter + sort | P0 | Price, rating, popularity |
| Product cards with quick view | P0 | Image, price, rating, add-to-cart |
| Search with suggestions | P0 | Autocomplete |
| Wishlist toggle | P1 | Heart icon on product card |
| Product detail page | P0 | Images, zoom, description, reviews |
| Related products | P1 | Recommendation rail |

### 4.3 Build Your Own Hamper (Core USP)

| Feature | Priority | Notes |
|---|---|---|
| Step 1: Box type selection | P0 | 4 options with visual preview |
| Step 2: Product picker grid | P0 | Filter by category, real-time add |
| Step 3: Live basket with animation | P0 | Fly-to-basket animation, price counter |
| Step 4: Personalization add-ons | P0 | Letter, photo, voice QR, name tag |
| Step 5: Hamper preview mockup | P1 | 2D illustrated mockup of hamper |
| Capacity indicator | P0 | Max items per box type |
| Save hamper as draft | P1 | User must be logged in |
| Share hamper link | P2 | Social sharing |

### 4.4 Cart & Checkout

| Feature | Priority | Notes |
|---|---|---|
| Cart with quantity controls | P0 | Inline edit |
| Gift wrap / lights / card add-on | P1 | Upsell in cart |
| Price breakdown (subtotal, shipping, discount) | P0 | Live calculation |
| Coupon code field | P1 | Validation feedback |
| 3-step checkout | P0 | Info → Address → Payment |
| Delivery slot selection | P0 | Standard / Express / Midnight |
| Razorpay + UPI + Cards | P0 | Payment gateway integration |
| Order confirmation page | P0 | Summary + tracking info |

### 4.5 Order Tracking

| Feature | Priority | Notes |
|---|---|---|
| Status timeline | P0 | Confirmed → Packed → Shipped → OFD → Delivered |
| WhatsApp notifications | P1 | Key status updates |
| Email notifications | P0 | Order confirm, ship, deliver |

### 4.6 User Dashboard

| Feature | Priority | Notes |
|---|---|---|
| Order history | P0 | Status, reorder button |
| Saved addresses | P1 | Add/edit/delete |
| Wishlist | P1 | Manage saved items |
| Reward points summary | P1 | Balance + history |
| Coupons wallet | P1 | Active/expired coupons |
| Profile management | P0 | Name, phone, email, password |

### 4.7 Emotional Avatar Assistant

| Cart Value | Avatar State | Suggested Message |
|---|---|---|
| ₹0 | Angry/Sad | "Don't leave me empty! Add something..." |
| ₹500 | Neutral | "Good start! Add chocolates?" |
| ₹1,000 | Happy | "Your hamper is taking shape!" |
| ₹2,000 | Excited | "Ooh this is going to be amazing!" |
| ₹5,000+ | In Love | "Whoever gets this is so lucky!" |

### 4.8 Admin Panel

| Module | Features |
|---|---|
| Dashboard | Revenue, orders, conversion, best sellers |
| Product Management | CRUD, inventory, image upload |
| Order Management | Status update, refunds |
| Customer Management | Database, support tickets |
| Marketing | Coupons, banners, campaigns |
| Analytics | Google Analytics + Clarity integration |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Lighthouse score > 85; LCP < 2.5s |
| Mobile | Fully responsive, mobile-first design |
| Security | JWT auth, HTTPS, Razorpay PCI-DSS compliance |
| Scalability | Handle 10,000 concurrent users at launch |
| Availability | 99.9% uptime SLA |
| Accessibility | WCAG 2.1 AA compliance |
| SEO | SSR via Next.js, meta tags, schema markup |

---

## 6. Design System

| Token | Value |
|---|---|
| Primary color | Soft Pink (#FFB6C1) |
| Secondary color | Lavender (#E6CCFF) |
| Accent | Gold (#D4AF37) |
| Background | White (#FFFFFF) |
| Text primary | Charcoal (#1A1A1A) |
| Font | Poppins (headings), Inter (body) |
| Border radius | 16px (cards), 8px (inputs) |
| UI style | Glassmorphism, Rounded cards, Micro-interactions |

---

## 7. Success Metrics (KPIs)

| Metric | Target |
|---|---|
| Conversion Rate | > 3% |
| Cart Abandonment Rate | < 40% |
| Average Order Value (AOV) | > ₹1,500 |
| Customer Satisfaction (CSAT) | > 4.5/5 |
| Repeat Purchase Rate | > 25% |
| Hamper Builder Completion Rate | > 60% |
| App Load Time (P95) | < 3s |

---

## 8. Open Questions

1. Will WhatsApp Business API be integrated at launch or V2?
2. Is there a B2B (corporate) portal or same UI with bulk pricing?
3. Is voice message QR code generated internally or via third party?
4. What is the maximum SKU count at launch?
5. Will midnight delivery be self-operated or through logistics partners?
