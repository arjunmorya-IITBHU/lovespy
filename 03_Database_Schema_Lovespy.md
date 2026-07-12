# Lovespy – Database Schema
**Version:** 1.0 | **Database:** PostgreSQL

---

## Entity Relationship Overview

```
users ──────────────── orders ─────────── order_items
  │                      │                     │
  │                  addresses              products ──── product_images
  │                      │                              └── reviews
  ├── wishlists           └── payments
  ├── reward_points
  └── coupons_used

hampers ─── hamper_items ─── products
        └── personalizations

categories ─── products
```

---

## Tables

### 1. users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    phone           VARCHAR(15) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),                    -- NULL for OAuth users
    auth_provider   VARCHAR(20) DEFAULT 'otp',       -- 'otp' | 'google' | 'email'
    google_id       VARCHAR(100) UNIQUE,
    avatar_url      TEXT,
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    reward_points   INTEGER DEFAULT 0,
    role            VARCHAR(20) DEFAULT 'customer',  -- 'customer' | 'admin'
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. addresses
```sql
CREATE TABLE addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           VARCHAR(50),                     -- 'Home', 'Office', etc.
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(15) NOT NULL,
    line1           VARCHAR(255) NOT NULL,
    line2           VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    pincode         VARCHAR(10) NOT NULL,
    country         VARCHAR(50) DEFAULT 'India',
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. categories
```sql
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    icon_url        TEXT,
    banner_url      TEXT,
    parent_id       UUID REFERENCES categories(id),  -- for sub-categories
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. products
```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id     UUID REFERENCES categories(id),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(200) UNIQUE NOT NULL,
    description     TEXT,
    short_desc      VARCHAR(500),
    price           NUMERIC(10,2) NOT NULL,
    compare_price   NUMERIC(10,2),                   -- original price (for discount badge)
    sku             VARCHAR(100) UNIQUE NOT NULL,
    stock_qty       INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    is_hamper_item  BOOLEAN DEFAULT FALSE,           -- can be added to custom hamper
    weight_grams    INTEGER,
    tags            TEXT[],
    rating_avg      NUMERIC(3,2) DEFAULT 0.00,
    rating_count    INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. product_images
```sql
CREATE TABLE product_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    alt_text        VARCHAR(200),
    sort_order      INTEGER DEFAULT 0,
    is_primary      BOOLEAN DEFAULT FALSE
);
```

### 6. hamper_boxes
```sql
CREATE TABLE hamper_boxes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,           -- 'Small', 'Medium', 'Large', 'Premium Wooden'
    description     TEXT,
    base_price      NUMERIC(10,2) NOT NULL,
    max_items       INTEGER NOT NULL,
    max_weight_g    INTEGER,
    image_url       TEXT,
    is_active       BOOLEAN DEFAULT TRUE
);
```

### 7. wishlists
```sql
CREATE TABLE wishlists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

### 8. coupons
```sql
CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) UNIQUE NOT NULL,
    description     VARCHAR(200),
    type            VARCHAR(20) NOT NULL,            -- 'percent' | 'flat' | 'free_shipping'
    value           NUMERIC(10,2) NOT NULL,          -- percent or flat amount
    min_order_value NUMERIC(10,2) DEFAULT 0,
    max_discount    NUMERIC(10,2),                   -- cap for percent discounts
    usage_limit     INTEGER,                         -- total uses allowed
    used_count      INTEGER DEFAULT 0,
    per_user_limit  INTEGER DEFAULT 1,
    valid_from      TIMESTAMPTZ,
    valid_until     TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. orders
```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(20) UNIQUE NOT NULL,     -- e.g., 'LS-2025-00001'
    user_id         UUID NOT NULL REFERENCES users(id),
    address_id      UUID REFERENCES addresses(id),

    -- Snapshot of address at time of order
    delivery_name   VARCHAR(100),
    delivery_phone  VARCHAR(15),
    delivery_line1  VARCHAR(255),
    delivery_line2  VARCHAR(255),
    delivery_city   VARCHAR(100),
    delivery_state  VARCHAR(100),
    delivery_pincode VARCHAR(10),

    status          VARCHAR(30) DEFAULT 'pending',   -- 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
    delivery_type   VARCHAR(20) DEFAULT 'standard',  -- 'standard' | 'express' | 'midnight'
    delivery_date   DATE,
    delivery_slot   VARCHAR(50),

    subtotal        NUMERIC(10,2) NOT NULL,
    shipping_charge NUMERIC(10,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    total_amount    NUMERIC(10,2) NOT NULL,

    coupon_id       UUID REFERENCES coupons(id),
    coupon_code     VARCHAR(50),
    points_redeemed INTEGER DEFAULT 0,

    tracking_number VARCHAR(100),
    notes           TEXT,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. order_items
```sql
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id),
    hamper_id       UUID,                            -- FK to custom_hampers if applicable
    item_type       VARCHAR(20) NOT NULL,            -- 'product' | 'hamper'

    name            VARCHAR(200) NOT NULL,           -- snapshot
    price           NUMERIC(10,2) NOT NULL,          -- snapshot
    quantity        INTEGER NOT NULL DEFAULT 1,
    subtotal        NUMERIC(10,2) NOT NULL,

    -- Personalization for hampers
    has_gift_wrap       BOOLEAN DEFAULT FALSE,
    has_lights          BOOLEAN DEFAULT FALSE,
    has_greeting_card   BOOLEAN DEFAULT FALSE,
    personalization_fee NUMERIC(10,2) DEFAULT 0
);
```

### 11. custom_hampers
```sql
CREATE TABLE custom_hampers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    box_id          UUID NOT NULL REFERENCES hamper_boxes(id),
    status          VARCHAR(20) DEFAULT 'draft',     -- 'draft' | 'ordered'
    total_price     NUMERIC(10,2),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 12. hamper_items
```sql
CREATE TABLE hamper_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hamper_id       UUID NOT NULL REFERENCES custom_hampers(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    quantity        INTEGER DEFAULT 1,
    unit_price      NUMERIC(10,2) NOT NULL
);
```

### 13. hamper_personalizations
```sql
CREATE TABLE hamper_personalizations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hamper_id           UUID NOT NULL REFERENCES custom_hampers(id) ON DELETE CASCADE,
    custom_letter       TEXT,
    message_card_text   TEXT,
    photo_url           TEXT,                        -- S3 URL
    voice_qr_url        TEXT,                        -- S3 URL for audio
    name_tag            VARCHAR(100),
    has_fairy_lights    BOOLEAN DEFAULT FALSE,
    has_flowers         BOOLEAN DEFAULT FALSE,
    has_ribbon          BOOLEAN DEFAULT FALSE,
    extra_cost          NUMERIC(10,2) DEFAULT 0
);
```

### 14. payments
```sql
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES orders(id),
    gateway             VARCHAR(30) NOT NULL,         -- 'razorpay' | 'paypal' | 'upi'
    gateway_order_id    VARCHAR(100),
    gateway_payment_id  VARCHAR(100) UNIQUE,
    gateway_signature   VARCHAR(300),
    amount              NUMERIC(10,2) NOT NULL,
    currency            VARCHAR(5) DEFAULT 'INR',
    status              VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'success' | 'failed' | 'refunded'
    method              VARCHAR(30),                  -- 'upi' | 'card' | 'netbanking' | 'wallet'
    refund_id           VARCHAR(100),
    refund_amount       NUMERIC(10,2),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### 15. reviews
```sql
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id),
    order_id        UUID REFERENCES orders(id),
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(200),
    body            TEXT,
    photo_urls      TEXT[],
    is_approved     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

### 16. reward_transactions
```sql
CREATE TABLE reward_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    type            VARCHAR(20) NOT NULL,            -- 'earn' | 'redeem'
    points          INTEGER NOT NULL,
    reason          VARCHAR(100),                    -- 'purchase' | 'review' | 'referral' | 'redemption'
    reference_id    UUID,                            -- order_id or review_id
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 17. banners
```sql
CREATE TABLE banners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200),
    image_url       TEXT NOT NULL,
    link_url        TEXT,
    position        VARCHAR(30) DEFAULT 'hero',      -- 'hero' | 'sidebar' | 'category'
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    valid_from      TIMESTAMPTZ,
    valid_until     TIMESTAMPTZ
);
```

### 18. otp_verifications
```sql
CREATE TABLE otp_verifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(15) NOT NULL,
    otp_code        VARCHAR(6) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_otp_phone ON otp_verifications(phone);
```

---

## Indexes

```sql
-- Performance critical indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_hamper_items_hamper ON hamper_items(hamper_id);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_reward_tx_user ON reward_transactions(user_id);
```

---

## Enumerations (TypeScript types for backend)

```typescript
type UserRole = 'customer' | 'admin';
type AuthProvider = 'otp' | 'google' | 'email';
type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
type DeliveryType = 'standard' | 'express' | 'midnight';
type PaymentGateway = 'razorpay' | 'paypal' | 'upi';
type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
type CouponType = 'percent' | 'flat' | 'free_shipping';
type RewardType = 'earn' | 'redeem';
type ItemType = 'product' | 'hamper';
```
