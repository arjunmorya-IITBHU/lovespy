# Lovespy – User Flows
**Version:** 1.0 | **Date:** June 2025

---

## Flow 1: New User Registration & Onboarding

```
[Land on Homepage]
    → Click "Sign Up" / "Login with Google"
    
  Path A – Google OAuth:
    → Google consent screen
    → Profile created automatically
    → Redirect to Homepage (logged in state)
    
  Path B – OTP Login:
    → Enter mobile number
    → Receive OTP via SMS
    → Enter OTP (6-digit)
    → [First time?] → Set name + email (optional)
    → Redirect to Homepage (logged in state)
    
  Path C – Email Registration:
    → Enter name, email, password
    → Email verification link sent
    → Click link → Account verified
    → Redirect to Homepage
```

---

## Flow 2: Browse & Buy a Ready-Made Product

```
[Homepage]
    → Click Category (e.g., "Birthday Gifts") 
        OR use Search bar
    
[Category / Search Results Page]
    → Filter by: Price range, Rating, Occasion
    → Sort by: Popularity / Price Low-High / New Arrivals
    → Click on Product Card
    
[Product Detail Page]
    → View images (zoom / swipe gallery)
    → Read description, specs, reviews
    → Select quantity
    → Click "Add to Cart" → Cart icon updates
        OR Click "Buy Now" → Direct to Checkout
    → Optionally click "Add to Wishlist"
    
[Cart Page]
    → Review items
    → Adjust quantity / Remove item
    → Add gift wrap / card (optional upsell)
    → Apply coupon code (optional)
    → View price breakdown
    → Click "Proceed to Checkout"
    
[Checkout – Step 1: Customer Info]
    → Enter / confirm Name, Mobile, Email
    
[Checkout – Step 2: Delivery Address]
    → Enter new address OR select saved address
    → Enter pincode → city/state auto-filled
    
[Checkout – Step 3: Delivery + Payment]
    → Select delivery type: Standard / Express / Midnight
    → Pick delivery date + time slot
    → Select payment method
    → Click "Pay Now"
    → Razorpay payment sheet opens
    → Payment success → 
    
[Order Confirmation Page]
    → Order ID displayed
    → Expected delivery date shown
    → "Track Order" button
    → "Continue Shopping" button
```

---

## Flow 3: Build Your Own Hamper (Core USP)

```
[Homepage or Navigation]
    → Click "Build Your Hamper" CTA
    
[Hamper Builder – Step 1: Choose Box]
    → Visual grid: Small / Medium / Large / Premium Wooden
    → Each box shows: Max items, price range, dimensions
    → Click to select → Highlighted with tick
    → Click "Next"
    
[Hamper Builder – Step 2: Pick Products]
    → Grid of products with category filter tabs
    → Categories: Chocolates / Jewelry / Cosmetics / Toys / Stationery / Accessories / Personalized
    → Each product card: Image, name, price, rating, "+ Add" button
    → Click "+ Add":
        → Product animates and flies to hamper basket (top right)
        → Basket counter updates
        → Running total updates
        → Remaining capacity indicator decreases
    → Can remove items from mini basket panel
    → Click "Next" (active only when ≥ 1 item added)
    
[Hamper Builder – Step 3: Personalize]
    → Toggle switches for optional add-ons:
        □ Custom handwritten letter (text input)
        □ Printed message card
        □ Personalized photo upload
        □ Voice message QR code (record / upload)
        □ Custom name tag
    → Optional decorations (checkbox):
        □ Fairy Lights (+₹99)
        □ Decorative Flowers (+₹149)
        □ Ribbon Decoration (+₹49)
    → Live price total updates
    → Click "Preview Hamper"
    
[Hamper Builder – Step 4: Preview]
    → 2D illustrated mockup of hamper with items
    → Tabs: Contents list / Personalization summary
    → Edit button → Back to Step 2 or Step 3
    → "Add to Cart" button
    
[Cart Page → Checkout (same as Flow 2)]
```

---

## Flow 4: Order Tracking

```
[Order Confirmation Email / SMS Link]
    OR
[User Dashboard → Orders → Click Order]
    
[Order Tracking Page]
    → Visual timeline:
       ✅ Order Confirmed (timestamp)
       ✅ Packed (timestamp)
       🔄 Shipped (tracking number shown)
       ○ Out for Delivery
       ○ Delivered
    → Contact support button
    → Download invoice button
```

---

## Flow 5: User Dashboard Navigation

```
[Login → Profile icon → "My Account"]

[Dashboard Home]
    → Stats: Reward Points | Active Orders | Wishlist count
    
  ├── My Orders
  │     → List of orders with status badge
  │     → Click order → Order detail + tracking
  │     → Reorder button
  │
  ├── Wishlist
  │     → Grid of saved products
  │     → Add to Cart / Remove
  │
  ├── Saved Addresses
  │     → List of addresses
  │     → Add new / Edit / Delete / Set as default
  │
  ├── Reward Points
  │     → Balance display
  │     → History table (earned/redeemed)
  │
  ├── Coupons
  │     → Active coupons (copy code)
  │     → Expired coupons (greyed out)
  │
  └── Profile Settings
        → Edit name, email, phone
        → Change password
        → Notification preferences
        → Delete account
```

---

## Flow 6: Admin – Process an Order

```
[Admin Login]
    → Admin dashboard
    
[Orders Module]
    → Filter: New / Processing / Shipped / Delivered / Cancelled
    → Click order row
    
[Order Detail View]
    → Customer info
    → Items list (with personalization details)
    → Delivery info + date slot
    → Action buttons:
        → [Mark as Packed]
        → [Add Tracking Number + Mark Shipped]
        → [Mark Delivered]
        → [Process Refund] → Confirm modal → Razorpay refund API
    → Internal notes field
    → Download packing slip
```

---

## Flow 7: Loyalty & Rewards

```
[Purchase completed]
    → Points credited automatically (1 point per ₹10 spent)
    
[Write a review]
    → 50 bonus points credited after review approved
    
[Refer a friend]
    → Unique referral link generated
    → Friend signs up + places first order
    → 100 points to referrer, 50 to new user
    
[Redeem points at checkout]
    → "Use Reward Points" toggle in cart
    → Max redemption: 10% of order value
    → Points deducted, discount applied
```

---

## Error & Edge Case Flows

| Scenario | Handling |
|---|---|
| OTP expired | "Resend OTP" button after 30s countdown |
| Payment failed | Return to checkout with error message, retry option |
| Product out of stock | Show "Notify Me" button, disable add-to-cart |
| Hamper box full | Disable "+ Add" with tooltip "Box is full. Upgrade box." |
| Pincode not serviceable | Show message: "We don't deliver to this pincode yet" |
| Order cancelled | Auto-refund initiated, email sent within 2 hours |
| Session expired mid-checkout | Cart saved, redirect to login, return to checkout |
