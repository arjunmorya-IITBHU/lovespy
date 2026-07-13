

// ==========================================
// SEED IN-MEMORY DATABASE FALLBACKS
// ==========================================
export interface ProductType {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  is_hamper_item: boolean;
  category: string;
  image: string;
  desc: string;
  tags: string[];
  stock: number;
  trendingOrder?: number;
  crossedPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  shortDescription?: string;
  gallery?: string[];
  weight?: string;
  dimensions?: string;
  includes?: string;
  deliveryInfo?: string;
  highlights?: string;
  features?: string;
  careInstructions?: string;
  customNotes?: string;
  availability?: "in-stock" | "out-of-stock" | "pre-order";
  costPrice?: number;
  lowStockAlert?: number;
  videoUrl?: string;
  material?: string;
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
  status?: "draft" | "published" | "out-of-stock";
}

export type Product = ProductType;

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "pending" | "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "refunded";
  deliveryType: string;
  items: Array<{ name: string; price: number; qty: number }>;
  tracking: string;
  address: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  shiprocketAwb?: string;
  shiprocketCourier?: string;
  shiprocketStatus?: 'Processing' | 'Packed' | 'Shipped' | 'In Transit' | 'Out For Delivery' | 'Delivered';
  shiprocketDispatchDate?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface HamperBox {
  id: string;
  name: string;
  basePrice: number;
  maxItems: number;
  size: string;
  image: string;
  // Extended fields
  desc?: string;
  shortDescription?: string;
  category?: string;
  tags?: string[];
  costPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  stock?: number;
  lowStockAlert?: number;
  weight?: string;
  dimensions?: string;
  includes?: string;
  features?: string;
  highlights?: string;
  material?: string;
  careInstructions?: string;
  deliveryInfo?: string;
  gallery?: string[];
  videoUrl?: string;
  status?: "draft" | "published" | "out-of-stock";
  availability?: "in-stock" | "out-of-stock" | "pre-order";
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
}

// ==========================================
// DYNAMIC CATEGORY SYSTEM
// Categories are derived from product data + any admin-created custom categories
// ==========================================

/**
 * Returns deduplicated, sorted list of all category strings used across all products.
 * This is the single source of truth for categories throughout the site.
 */
export const getProductCategories = (): string[] => {
  const fromProducts = Array.from(
    new Set(productsList.map((p) => p.category).filter(Boolean))
  );
  // Merge in any admin-created custom categories (may not yet have products)
  const customCats: string[] = (() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("lovespy_custom_categories") || "[]");
    } catch {
      return [];
    }
  })();
  const merged = Array.from(new Set([...fromProducts, ...customCats]));
  return merged.sort((a, b) => a.localeCompare(b));
};

/**
 * Persist a new category name so it's available for future product assignments.
 * Once a product is assigned that category it will appear automatically.
 */
export const addCategory = (name: string): void => {
  if (!name.trim()) return;
  const existing: string[] = (() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("lovespy_custom_categories") || "[]");
    } catch {
      return [];
    }
  })();
  if (!existing.includes(name.trim())) {
    const updated = [...existing, name.trim()];
    if (typeof window !== "undefined") {
      localStorage.setItem("lovespy_custom_categories", JSON.stringify(updated));
    }
  }
};

/**
 * Replace the entire stored custom categories list.
 */
export const setCategories = (cats: string[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("lovespy_custom_categories", JSON.stringify(cats));
  }
};

const defaultProducts: ProductType[] = [
  {
    id: "p1",
    name: "Symphony of Roses Hamper prem mourya",
    slug: "symphony-roses-hamper",
    price: 2499,
    rating: 4.8,
    is_hamper_item: false,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "A luxury arrangement of crimson roses, premium milk chocolate pralines, and a mini rose-gold bracelet. The ultimate romantic anniversary package.",
    tags: ["Romantic", "Luxury", "Anniversary", "Trending"],
    stock: 15,
    trendingOrder: 1
  },
  {
    id: "p2",
    name: "Midnight Sweetheart Box prem mourya",
    slug: "midnight-sweetheart-box",
    price: 1899,
    rating: 4.9,
    is_hamper_item: false,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Crafted specifically for midnight surprises. Contains velvet rose petals, premium lavender bath salt, scented heart candle, and artisanal chocolates.",
    tags: ["Midnight", "Chocolates", "Anniversary", "Featured", "Trending"],
    stock: 24,
    trendingOrder: 2
  },
  {
    id: "p3",
    name: "BFF Birthday Goodie Tub",
    slug: "bff-birthday-goodie",
    price: 1299,
    rating: 4.7,
    is_hamper_item: false,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Fun-sized tub containing keychains, fuzzy socks, birthday mug, candy pops, and a cute desk succulent. High vibe Gen-Z friendship starter.",
    tags: ["Friendship", "Birthday", "Playful", "Best Seller", "Trending"],
    stock: 40,
    trendingOrder: 3
  },
  {
    id: "h1",
    name: "Artisanal Strawberry Truffles",
    slug: "strawberry-truffles",
    price: 349,
    rating: 4.5,
    is_hamper_item: true,
    category: "chocolates",
    image: "https://images.unsplash.com/photo-1548907040-4d42b52115ca?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Box of 6 organic white chocolate truffles with real strawberry center.",
    tags: ["Sweet", "Gourmet"],
    stock: 120
  },
  {
    id: "h2",
    name: "Dark Velvet Hazelnut Bar",
    slug: "dark-hazelnut-bar",
    price: 199,
    rating: 4.6,
    is_hamper_item: true,
    category: "chocolates",
    image: "https://images.unsplash.com/photo-1549007994-cb92ca813bec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "70% Single-origin dark chocolate bar sprinkled with roasted hazelnuts.",
    tags: ["Vegan", "Rich"],
    stock: 95
  },
  {
    id: "h3",
    name: "Minimalist Heart Silver Ring",
    slug: "silver-heart-ring",
    price: 599,
    rating: 4.9,
    is_hamper_item: true,
    category: "jewelry",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "925 sterling silver band featuring a dainty heart design. Adjustable size.",
    tags: ["Minimalist", "Silver"],
    stock: 35
  },
  {
    id: "h4",
    name: "Celestial Star Pendant Necklet",
    slug: "celestial-pendant",
    price: 799,
    rating: 4.8,
    is_hamper_item: true,
    category: "jewelry",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "A stunning golden astronomical necklet embedded with tiny cubic zirconia stars.",
    tags: ["Gold", "Modern"],
    stock: 18
  },
  {
    id: "h5",
    name: "Peach Blossom Tinted Balm",
    slug: "peach-lip-balm",
    price: 299,
    rating: 4.4,
    is_hamper_item: true,
    category: "cosmetics",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Hydrating organic cherry lip stain that leaves a natural rosy tint.",
    tags: ["Organic", "Cruelty-free"],
    stock: 80
  },
  {
    id: "h6",
    name: "Glitter Glow Highlighter Stick",
    slug: "glow-highlighter",
    price: 449,
    rating: 4.5,
    is_hamper_item: true,
    category: "cosmetics",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Strobe highlighter stick that provides a radiant, dew-finished glow.",
    tags: ["Highlight", "Sparkle"],
    stock: 45
  },
  {
    id: "h7",
    name: "Fluffy Pink Teddy Bear",
    slug: "pink-teddy-bear",
    price: 499,
    rating: 4.7,
    is_hamper_item: true,
    category: "plush-toys",
    image: "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Super soft, huggable pastel pink teddy holding a tiny plush red heart.",
    tags: ["Plush", "Cute"],
    stock: 65
  },
  {
    id: "h8",
    name: "Angry & Happy Octopus Plush",
    slug: "reversible-octopus",
    price: 349,
    rating: 4.8,
    is_hamper_item: true,
    category: "plush-toys",
    image: "https://images.unsplash.com/photo-1562040506-a9b32cb51b94?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "The trending double-sided reversible octopus plush toy showing your mood.",
    tags: ["Reversible", "Trending"],
    stock: 110
  },
  {
    id: "h9",
    name: "Luxe Satin Sleep Eye Mask",
    slug: "satin-eye-mask",
    price: 249,
    rating: 4.3,
    is_hamper_item: true,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "Smooth luxury satin mask to ensure peaceful and stylish sleep cycles.",
    tags: ["Silk", "Sleep"],
    stock: 75
  },
  {
    id: "h10",
    name: "Polaroid Photo Frame Magnet",
    slug: "polaroid-magnet",
    price: 199,
    rating: 4.8,
    is_hamper_item: true,
    category: "personalized",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    desc: "A customized retro mini Polaroid frame printed with your uploaded image.",
    tags: ["Polaroid", "FridgeMagnet"],
    stock: 150
  }
];

export let HAMPER_COMPONENTS: Record<string, Array<{ id: string; qty: number }>> = {};

export function getEffectiveStock(productId: string, products: ProductType[]): number {
  const prod = products.find(p => p.id === productId);
  if (!prod) return 0;

  if (HAMPER_COMPONENTS[productId] && HAMPER_COMPONENTS[productId].length > 0) {
    let minStock = Infinity;
    for (const comp of HAMPER_COMPONENTS[productId]) {
      const compProd = products.find(p => p.id === comp.id);
      if (!compProd) {
        minStock = 0;
        break;
      }
      const possibleHampers = Math.floor(compProd.stock / comp.qty);
      if (possibleHampers < minStock) {
        minStock = possibleHampers;
      }
    }
    return minStock === Infinity ? 0 : minStock;
  }

  return prod.stock;
}

const defaultHamperBoxes: HamperBox[] = [
  { id: "box-sm", name: "Blossom Box (Small)", basePrice: 199, maxItems: 3, size: "15x15x10 cm", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500" },
  { id: "box-md", name: "Lavender Box (Medium)", basePrice: 299, maxItems: 6, size: "22x22x12 cm", image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500" },
  { id: "box-lg", name: "Royal Pink Box (Large)", basePrice: 399, maxItems: 10, size: "30x30x15 cm", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500" },
  { id: "box-wood", name: "Premium Wooden Box", basePrice: 599, maxItems: 15, size: "35x35x18 cm", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500" },
  { id: "box-ribbon", name: "Luxury Ribbon Box", basePrice: 799, maxItems: 20, size: "40x40x20 cm", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500" }
];

const defaultOrders: any[] = [
  {
    id: "ord-1",
    orderNumber: "LS-2026-88021",
    date: "2026-05-18",
    total: 2499,
    status: "delivered",
    deliveryType: "standard",
    items: [{ name: "Symphony of Roses Hamper", price: 2499, qty: 1 }],
    tracking: "TRK-99088",
    address: "Home, Priya Sharma, 9876543210, Green Park Ext, Delhi, 110016"
  }
];

// ==========================================
// MOCK SURPRISE PAGE ORDERS DATABASES
// ==========================================
export interface SurpriseOrderType {
  id: string;
  orderNumber: string;
  date: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paymentId?: string;
  senderName: string;
  receiverName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  photos: string[];
  videos: string[];
  audioFile?: string;
  voiceRecording?: string;
  theme: string;
  customThemeIdea?: string;
  songName?: string;
  songUrl?: string;
  instructions?: string;
  messages: {
    main?: string;
    loveLetter?: string;
    birthdayWish?: string;
    anniversaryWish?: string;
  };
  paymentStatus: 'paid' | 'pending';
  orderStatus: 'New Order' | 'In Progress' | 'Completed' | 'Delivered';
  price: number;
}

const defaultSurpriseOrders: SurpriseOrderType[] = [
  {
    id: "sp-1",
    orderNumber: "SP-2026-99321",
    date: "2026-06-01",
    senderName: "Aman Verma",
    receiverName: "Neha Kapoor",
    mobileNumber: "9876543210",
    whatsappNumber: "9876543210",
    email: "aman@example.com",
    photos: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300", "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=300"],
    videos: ["couple_dance_slow.mp4", "birthday_surprise_reaction.mov"],
    audioFile: "secret_voice_message.wav",
    voiceRecording: "",
    theme: "shinchan",
    customThemeIdea: "",
    songName: "Tum Se Hi",
    songUrl: "https://spotify.link/tum-se-hi",
    instructions: "Please make it very cute, add Shinchan expressions in the background, use red/yellow colors, and place the photos in a retro polaroid grid.",
    messages: {
      main: "Happy Birthday my love! You mean the absolute world to me.",
      loveLetter: "From the day we met at the library, I knew there was something magical about you...",
      birthdayWish: "May this year bring you endless laughter, success, and all the Shinchan comic books you want!",
      anniversaryWish: ""
    },
    paymentStatus: "paid",
    orderStatus: "New Order",
    price: 299
  }
];

// ==========================================
// MOCK CMS AND DASHBOARD CONFIGURATIONS
// ==========================================
export interface OfferItem {
  id: string;
  text: string;
  textColor: string;
  bgColor: string;
  isEnabled: boolean;
  displayOrder: number;
}

export interface HeroCta {
  text: string;
  url: string;
  target: "_self" | "_blank";
  style: "primary" | "secondary";
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
  video: string;
  ctas: HeroCta[];
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:MM
  timezone: string;
  campaignType: string; // Valentines Day, Fathers Day, etc.
  priority: number;
  showDesktop: boolean;
  showMobile: boolean;
  showTablet: boolean;
  showForLoggedIn: boolean;
  showForGuests: boolean;
  overlayColor: string;
  overlayOpacity: number;
  textAlignment: "left" | "center" | "right";
  textColor: string;
  contentPosition: "left" | "center" | "right";
  status: "published" | "draft" | "publish-later";
  isEnabled: boolean;
  duration: number; // in seconds
  views: number;
  clicks: number;
  offerText?: string;
  badgeLabel?: string;
  backgroundType: "image" | "video" | "color";
  backgroundColor: string;
  rightImage?: string;
  rightImageMobile?: string;
}

export interface HeroSliderSettings {
  autoRotate: boolean;
  rotationSpeed: number; // in seconds
  infiniteLoop: boolean;
  showArrows: boolean;
  showDots: boolean;
}

export interface HeroSettings {
  title: string;
  subtitle: string;
  image: string;
  video: string;
  ctaText: string;
  ctaLink: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  title?: string;
  userImage?: string;
  date?: string;
  status: "pending" | "approved" | "rejected";
  photos?: string[];
  reply?: string;
}

export interface SeasonalCampaign {
  id: string;
  name: string;
  slug: string;
  isEnabled: boolean;
  bannerImage: string;
}

export interface ShowcaseMedia {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  displayOrder: number;
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  isEnabled: boolean;
  image?: string;
  // Extended fields
  desc?: string;
  shortDescription?: string;
  category?: string;
  tags?: string[];
  costPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  lowStockAlert?: number;
  weight?: string;
  dimensions?: string;
  includes?: string;
  features?: string;
  highlights?: string;
  material?: string;
  careInstructions?: string;
  deliveryInfo?: string;
  gallery?: string[];
  videoUrl?: string;
  status?: "draft" | "published" | "out-of-stock";
  availability?: "in-stock" | "out-of-stock" | "pre-order";
  metaTitle?: string;
  metaDesc?: string;
  metaKeywords?: string;
}

export interface CouponItem {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  desc: string;
}

export interface CustomerType {
  id: string;
  name: string;
  phone: string;
  email: string;
  registeredDate: string;
  lastLogin: string;
  totalOrders: number;
  totalAmountSpent: number;
  status: "Active" | "Inactive";
}

// Seed CMS state fallbacks
const defaultOffers: OfferItem[] = [
  { id: "o1", text: "10% OFF on Orders Above ₹1,999! Code: LOVESPY10", textColor: "#ffffff", bgColor: "#121212", isEnabled: true, displayOrder: 1 },
  { id: "o2", text: "Free Shipping on Orders Above ₹2,999!", textColor: "#DFBA6B", bgColor: "#121212", isEnabled: true, displayOrder: 2 },
  { id: "o3", text: "Next-day Delivery & Midnight Delivery Slots Available!", textColor: "#FFCCD5", bgColor: "#121212", isEnabled: true, displayOrder: 3 }
];

const defaultHeroSettings: HeroSettings = {
  title: "Make Every Gift Tell A Story",
  subtitle: "Build bespoke, high-quality gift baskets designed to evoke tears of joy. Add handwritten letters, polaroid magnet wraps, and custom voice greeting cards.",
  image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80",
  video: "",
  ctaText: "Design A Custom Hamper",
  ctaLink: "/hamper-builder"
};

const defaultSeasonalCampaigns: SeasonalCampaign[] = [
  { id: "sc-1", name: "Valentine's Week Special", slug: "valentines-day", isEnabled: true, bannerImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500" },
  { id: "sc-2", name: "Friendship Day", slug: "friendship-day", isEnabled: false, bannerImage: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500" },
  { id: "sc-3", name: "Mother's Day", slug: "mothers-day", isEnabled: false, bannerImage: "" },
  { id: "sc-4", name: "Father's Day", slug: "fathers-day", isEnabled: false, bannerImage: "" },
  { id: "sc-5", name: "New Year Celebration", slug: "new-year", isEnabled: false, bannerImage: "" },
  { id: "sc-6", name: "Christmas Gifting", slug: "christmas", isEnabled: false, bannerImage: "" }
];

const defaultShowcaseMedia: ShowcaseMedia[] = [
  { id: "sm-1", title: "Birthday Theme (Shinchan)", type: "image", url: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600", displayOrder: 1 },
  { id: "sm-2", title: "Proposal Theme (Neon Lights)", type: "image", url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600", displayOrder: 2 },
  { id: "sm-3", title: "Anniversary Retro Cassette", type: "image", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600", displayOrder: 3 },
  { id: "sm-4", title: "Shinchan Cute Animation Loop", type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-valentines-day-gift-box-opening-40092-large.mp4", displayOrder: 4 },
  { id: "sm-5", title: "Retro Tape Cassette Spindle Loop", type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-cassette-tape-41982-large.mp4", displayOrder: 5 }
];

const defaultAddons: AddonItem[] = [
  { id: "ad-1", name: "Fairy Lights Wrap", price: 99, stock: 120, isEnabled: true, image: "https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?w=500" },
  { id: "ad-2", name: "Pastel Baby Breaths Flowers", price: 149, stock: 85, isEnabled: true, image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500" },
  { id: "ad-3", name: "Satin Red Ribbon Bow", price: 49, stock: 250, isEnabled: true, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500" },
  { id: "ad-4", name: "Custom Stickers Pack", price: 29, stock: 500, isEnabled: true, image: "https://images.unsplash.com/photo-1572375995301-40088b106337?w=500" },
  { id: "ad-5", name: "Premium Velvet Packaging Wrap", price: 199, stock: 60, isEnabled: true, image: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=500" }
];

const defaultCoupons: CouponItem[] = [
  { code: "LOVESPY10", type: "percent", value: 10, minOrder: 1999, desc: "10% off on orders above ₹1,999" },
  { code: "FREEGP", type: "flat", value: 150, minOrder: 1499, desc: "Flat ₹150 off on orders above ₹1,499" }
];

const defaultCustomers: CustomerType[] = [
  { id: "c-1", name: "Ananya Sharma", phone: "9876543210", email: "ananya@gmail.com", registeredDate: "2026-05-10", lastLogin: "2026-07-08 14:30", totalOrders: 2, totalAmountSpent: 3500, status: "Active" },
  { id: "c-2", name: "Rahul Mehra", phone: "9988776655", email: "rahul.m@outlook.com", registeredDate: "2026-06-01", lastLogin: "2026-07-08 15:45", totalOrders: 1, totalAmountSpent: 1200, status: "Active" },
  { id: "c-3", name: "Priya S.", phone: "9812345678", email: "priya.s@gmail.com", registeredDate: "2026-06-15", lastLogin: "2026-07-07 09:20", totalOrders: 3, totalAmountSpent: 5200, status: "Active" }
];

// LocalStorage helpers for Next.js browser execution
const isClient = typeof window !== "undefined";

const loadFromStorage = (key: string, fallback: any) => {
  if (isClient) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error reading localStorage key: " + key, e);
      }
    }
  }
  return fallback;
};

const saveToStorage = (key: string, data: any) => {
  if (isClient) {
    localStorage.setItem(key, JSON.stringify(data));
    fetch("/api/db/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: data })
    })
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.success) {
          console.error(`[MongoDB Sync Error] Failed to sync ${key}:`, resData.error);
          if (window.location.pathname.startsWith("/admin")) {
            alert(`⚠️ WARNING: Failed to save changes to production cloud database. Your changes are only saved locally on this browser.\n\nError: ${resData.error || "Unknown server error"}`);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to sync key to MongoDB:", err);
        if (window.location.pathname.startsWith("/admin")) {
          alert(`⚠️ WARNING: Network error. Failed to save changes to production database.\n\nError: ${err.message}`);
        }
      });
  }
};

let productsList: ProductType[] = loadFromStorage("lovespy_products", defaultProducts);
let hamperBoxesMock: HamperBox[] = loadFromStorage("lovespy_boxes", defaultHamperBoxes);
let ordersMock: Order[] = loadFromStorage("lovespy_orders", defaultOrders);
let surpriseOrdersMock: SurpriseOrderType[] = loadFromStorage("lovespy_surprise_orders", defaultSurpriseOrders);
let offersMock: OfferItem[] = loadFromStorage("lovespy_offers", defaultOffers);
let heroSettingsMock: HeroSettings = loadFromStorage("lovespy_hero", defaultHeroSettings);

const defaultHeroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    title: "Make Every Gift <br><span class='bg-gradient-to-r from-brand-pink to-brand-lavender bg-clip-text text-transparent'>Tell A Story</span>",
    subtitle: "Build bespoke, high-quality gift baskets designed to evoke tears of joy.",
    description: "Add handwritten letters, polaroid magnet wraps, and custom voice greeting cards.",
    desktopImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80",
    video: "",
    ctas: [
      { text: "Design A Custom Hamper", url: "/hamper-builder", target: "_self", style: "primary" },
      { text: "Browse Readymade", url: "/shop?tab=hampers", target: "_self", style: "secondary" }
    ],
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    timezone: "local",
    campaignType: "None",
    priority: 1,
    showDesktop: true,
    showMobile: true,
    showTablet: true,
    showForLoggedIn: true,
    showForGuests: true,
    overlayColor: "#000000",
    overlayOpacity: 0.3,
    textAlignment: "left",
    textColor: "#ffffff",
    contentPosition: "left",
    status: "published",
    isEnabled: true,
    duration: 5,
    views: 0,
    clicks: 0,
    offerText: "Bespoke Packaging Included",
    badgeLabel: "Featured",
    backgroundType: "image",
    backgroundColor: "#1e1e1e"
  },
  {
    id: "slide-2",
    title: "Valentine's Week Celebration",
    subtitle: "Express your love with premium red velvet hampers.",
    description: "Custom letterpress stationery, polaroid magnets, and chocolate bouquets.",
    desktopImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&auto=format&fit=crop&q=80",
    video: "",
    ctas: [
      { text: "Shop Valentine Hampers", url: "/shop?tab=hampers", target: "_self", style: "primary" }
    ],
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    timezone: "local",
    campaignType: "Valentines Day",
    priority: 2,
    showDesktop: true,
    showMobile: true,
    showTablet: true,
    showForLoggedIn: true,
    showForGuests: true,
    overlayColor: "#000000",
    overlayOpacity: 0.4,
    textAlignment: "left",
    textColor: "#ffffff",
    contentPosition: "left",
    status: "published",
    isEnabled: true,
    duration: 5,
    views: 0,
    clicks: 0,
    offerText: "Flat 10% OFF",
    badgeLabel: "Limited Time",
    backgroundType: "image",
    backgroundColor: "#2c0e12"
  }
];

const defaultSliderSettings: HeroSliderSettings = {
  autoRotate: true,
  rotationSpeed: 5,
  infiniteLoop: true,
  showArrows: true,
  showDots: true
};

const defaultReviews: ProductReview[] = [
  { id: "r1", productId: "p1", userName: "Ananya S.", rating: 5, comment: "Absolutely loved it! The roses were fresh and packaging was gorgeous.", title: "Wonderful anniversary gift!", date: "2026-06-15", status: "approved" },
  { id: "r2", productId: "p1", userName: "Rahul M.", rating: 4, comment: "Delivered on time for our anniversary. Highly recommended.", title: "Fresh roses and fast shipping", date: "2026-06-20", status: "approved" },
  { id: "r3", productId: "p2", userName: "Deepika R.", rating: 5, comment: "The midnight delivery was so exact! Best service ever.", title: "Perfect midnight surprise", date: "2026-06-22", status: "approved" }
];

let heroSlidesMock: HeroSlide[] = loadFromStorage("lovespy_hero_slides", defaultHeroSlides);
let reviewsMock: ProductReview[] = loadFromStorage("lovespy_reviews", defaultReviews);
let sliderSettingsMock: HeroSliderSettings = loadFromStorage("lovespy_slider_settings", defaultSliderSettings);
let seasonalCampaignsMock: SeasonalCampaign[] = loadFromStorage("lovespy_campaigns", defaultSeasonalCampaigns);
let showcaseMediaMock: ShowcaseMedia[] = loadFromStorage("lovespy_showcase", defaultShowcaseMedia);
let addonsMock: AddonItem[] = loadFromStorage("lovespy_addons", defaultAddons);
let couponsMock: CouponItem[] = loadFromStorage("lovespy_coupons", defaultCoupons);
let customersMock: CustomerType[] = loadFromStorage("lovespy_customers", defaultCustomers);

const defaultHamperComponents = {
  p1: [
    { id: "h1", qty: 2 },
    { id: "h3", qty: 1 }
  ],
  p2: [
    { id: "h2", qty: 1 },
    { id: "h9", qty: 1 }
  ],
  p3: [
    { id: "h8", qty: 1 },
    { id: "h10", qty: 1 }
  ]
};

const loadedHamperComponents = loadFromStorage("lovespy_hamper_components", defaultHamperComponents);
Object.assign(HAMPER_COMPONENTS, loadedHamperComponents);

export const setHamperComponents = (newHamperComponents: Record<string, Array<{ id: string; qty: number }>>) => {
  Object.keys(HAMPER_COMPONENTS).forEach(k => delete HAMPER_COMPONENTS[k]);
  Object.assign(HAMPER_COMPONENTS, newHamperComponents);
  saveToStorage("lovespy_hamper_components", newHamperComponents);
};

// Export helpers
/**
 * Returns Category objects derived dynamically from current product data.
 * Any new product category or admin-added category automatically appears here.
 */
export const getCategories = (): Category[] => {
  const catStrings = getProductCategories();
  return catStrings.map((name, idx) => ({
    id: `cat-${name.toLowerCase().replace(/\s+/g, "-")}-${idx}`,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    icon: "tag",
  }));
};
export const getProducts = (): ProductType[] => productsList;
export const setProducts = (newProducts: ProductType[]) => {
  productsList = newProducts;
  saveToStorage("lovespy_products", newProducts);
};

export const getHamperBoxes = (): HamperBox[] => hamperBoxesMock;
export const setHamperBoxes = (newBoxes: HamperBox[]) => {
  hamperBoxesMock = newBoxes;
  saveToStorage("lovespy_boxes", newBoxes);
};

export const getOrders = (): Order[] => ordersMock;
export const setOrders = (newOrders: any[]) => {
  ordersMock = newOrders;
  saveToStorage("lovespy_orders", newOrders);
};

export const getSurpriseOrders = (): SurpriseOrderType[] => surpriseOrdersMock;
export const setSurpriseOrders = (newSurpriseOrders: SurpriseOrderType[]) => {
  surpriseOrdersMock = newSurpriseOrders;
  saveToStorage("lovespy_surprise_orders", newSurpriseOrders);
};

export const getOffers = (): OfferItem[] => offersMock;
export const setOffers = (newOffers: OfferItem[]) => {
  offersMock = newOffers;
  saveToStorage("lovespy_offers", newOffers);
};

export const getHeroBanner = (): HeroSettings => heroSettingsMock;
export const getHeroSlides = (): HeroSlide[] => heroSlidesMock;
export const setHeroSlides = (newSlides: HeroSlide[]) => {
  heroSlidesMock = newSlides;
  saveToStorage("lovespy_hero_slides", newSlides);
};

export const getHeroSliderSettings = (): HeroSliderSettings => sliderSettingsMock;

export const getReviews = (): ProductReview[] => reviewsMock;
export const setReviews = (newReviews: ProductReview[]) => {
  reviewsMock = newReviews;
  saveToStorage("lovespy_reviews", newReviews);
};
export const setHeroSliderSettings = (newSettings: HeroSliderSettings) => {
  sliderSettingsMock = newSettings;
  saveToStorage("lovespy_slider_settings", newSettings);
};

export const trackHeroView = (slideId: string) => {
  heroSlidesMock = heroSlidesMock.map(s => {
    if (s.id === slideId) {
      return { ...s, views: (s.views || 0) + 1 };
    }
    return s;
  });
  saveToStorage("lovespy_hero_slides", heroSlidesMock);
};

export const trackHeroClick = (slideId: string) => {
  heroSlidesMock = heroSlidesMock.map(s => {
    if (s.id === slideId) {
      return { ...s, clicks: (s.clicks || 0) + 1 };
    }
    return s;
  });
  saveToStorage("lovespy_hero_slides", heroSlidesMock);
};

export const getActiveHeroSlides = (
  slides: HeroSlide[],
  isMobile: boolean,
  isTablet: boolean,
  isLoggedIn: boolean
): HeroSlide[] => {
  const now = new Date();

  return slides
    .filter(slide => {
      // 1. Is enabled & published
      if (!slide.isEnabled || slide.status !== "published") return false;

      // 2. Responsive display rules
      if (isMobile && !slide.showMobile) return false;
      if (!isMobile && isTablet && !slide.showTablet) return false;
      if (!isMobile && !isTablet && !slide.showDesktop) return false;

      // 3. Auth rules
      if (isLoggedIn && !slide.showForLoggedIn) return false;
      if (!isLoggedIn && !slide.showForGuests) return false;

      // 4. Scheduling checks
      if (slide.startDate) {
        const startString = `${slide.startDate}T${slide.startTime || "00:00"}:00`;
        const startDateTime = new Date(startString);
        if (now < startDateTime) return false;
      }
      if (slide.endDate) {
        const endString = `${slide.endDate}T${slide.endTime || "23:59"}:59`;
        const endDateTime = new Date(endString);
        if (now > endDateTime) return false;
      }

      return true;
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
};
export const setHeroBanner = (newHero: HeroSettings) => {
  heroSettingsMock = newHero;
  saveToStorage("lovespy_hero", newHero);
};

export const getSeasonalCampaigns = (): SeasonalCampaign[] => seasonalCampaignsMock;
export const setSeasonalCampaigns = (newCampaigns: SeasonalCampaign[]) => {
  seasonalCampaignsMock = newCampaigns;
  saveToStorage("lovespy_campaigns", newCampaigns);
};

export const getShowcaseMedia = (): ShowcaseMedia[] => showcaseMediaMock;
export const setShowcaseMedia = (newShowcase: ShowcaseMedia[]) => {
  showcaseMediaMock = newShowcase;
  saveToStorage("lovespy_showcase", newShowcase);
};

export const getAddons = (): AddonItem[] => addonsMock;
export const setAddons = (newAddons: AddonItem[]) => {
  addonsMock = newAddons;
  saveToStorage("lovespy_addons", newAddons);
};

export const getCoupons = (): CouponItem[] => couponsMock;
export const setCoupons = (newCoupons: CouponItem[]) => {
  couponsMock = newCoupons;
  saveToStorage("lovespy_coupons", newCoupons);
};

export const getCustomers = (): CustomerType[] => customersMock;
export const setCustomers = (newCustomers: CustomerType[]) => {
  customersMock = newCustomers;
  saveToStorage("lovespy_customers", newCustomers);
};

export interface StoreSettings {
  deliveryCharge: number;
  freeShippingThreshold: number;
  freeShippingEnabled: boolean;
  shiprocketEmail?: string;
  shiprocketPassword?: string;
  shiprocketToken?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
}

export const defaultStoreSettings: StoreSettings = {
  deliveryCharge: 150,
  freeShippingThreshold: 2999,
  freeShippingEnabled: true,
  shiprocketEmail: "",
  shiprocketPassword: "",
  shiprocketToken: "",
  twilioAccountSid: "",
  twilioAuthToken: "",
  twilioFromNumber: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: ""
};

export let storeSettingsMock = loadFromStorage("lovespy_store_settings", defaultStoreSettings);

export const getStoreSettings = async (): Promise<StoreSettings> => {
  return storeSettingsMock;
};

export const setStoreSettings = async (newSettings: StoreSettings): Promise<void> => {
  storeSettingsMock = newSettings;
  saveToStorage("lovespy_store_settings", newSettings);
};

export const createOrder = (orderData: any) => {
  const newOrder = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber: `LS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString().split("T")[0],
    status: "confirmed",
    tracking: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    shiprocketStatus: orderData.shiprocketStatus || "",
    shiprocketAwb: orderData.shiprocketAwb || "",
    shiprocketCourier: orderData.shiprocketCourier || "",
    shiprocketOrderId: orderData.shiprocketOrderId || "",
    shiprocketShipmentId: orderData.shiprocketShipmentId || "",
    shiprocketDispatchDate: orderData.shiprocketDispatchDate || ""
  };

  // Deduct stock pool
  const currentProducts = [...productsList];
  let stockUpdated = false;

  const deductProductStock = (prodId: string, quantity: number) => {
    const prod = currentProducts.find(p => p.id === prodId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - quantity);
      stockUpdated = true;
    }
  };

  if (newOrder.items && Array.isArray(newOrder.items)) {
    for (const item of newOrder.items) {
      if (item.type === "custom-hamper") {
        if (item.details && item.details.items && Array.isArray(item.details.items)) {
          for (const component of item.details.items) {
            deductProductStock(component.id, (component.qty || 1) * item.qty);
          }
        }
      } else if (item.type === "custom-surprise-page") {
        const surpriseData = {
          ...item.details,
          razorpayPaymentId: newOrder.razorpayPaymentId,
          razorpayOrderId: newOrder.razorpayOrderId,
          razorpaySignature: newOrder.razorpaySignature,
          date: newOrder.date,
          paymentStatus: "paid",
        };
        createSurpriseOrder(surpriseData);
      } else {
        // Simple product or preset hamper
        const originalId = (item.details && item.details.productId) ? item.details.productId : item.id;
        if (HAMPER_COMPONENTS[originalId]) {
          for (const comp of HAMPER_COMPONENTS[originalId]) {
            deductProductStock(comp.id, comp.qty * item.qty);
          }
        } else {
          deductProductStock(originalId, item.qty);
        }
      }
    }
  }

  if (stockUpdated) {
    setProducts(currentProducts);
  }

  ordersMock.unshift(newOrder);
  saveToStorage("lovespy_orders", ordersMock);

  return newOrder;
};

export const updateOrderStatus = (id: string, status: string) => {
  const ord = ordersMock.find(o => o.id === id);
  if (ord) {
    ord.status = status as any;
    saveToStorage("lovespy_orders", ordersMock);
    return true;
  }
  return false;
};

export const updateOrderDetails = async (id: string, updates: Partial<Order>) => {
  const ord = ordersMock.find(o => o.id === id || o.orderNumber === id);
  if (ord) {
    Object.assign(ord, updates);
    saveToStorage("lovespy_orders", ordersMock);
  }

  return !!ord;
};


export const createSurpriseOrder = (orderData: any) => {
  const newOrder: SurpriseOrderType = {
    ...orderData,
    id: `sp-${Date.now()}`,
    orderNumber: `SP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString().split("T")[0],
    paymentStatus: "paid",
    orderStatus: "New Order",
    price: 299
  };
  surpriseOrdersMock.unshift(newOrder);
  saveToStorage("lovespy_surprise_orders", surpriseOrdersMock);
  return newOrder;
};

export const updateSurpriseOrderStatus = (id: string, status: any) => {
  const ord = surpriseOrdersMock.find(o => o.id === id);
  if (ord) {
    ord.orderStatus = status;
    saveToStorage("lovespy_surprise_orders", surpriseOrdersMock);
    return true;
  }
  return false;
};

// ==========================================
// WISH THEMES (Admin-managed, for Hamper Builder Step 4)
// ==========================================
export interface WishTheme {
  id: string;
  name: string;
  description: string;
  bgColor: string;          // CSS color or gradient, e.g. "linear-gradient(135deg, #f9c4d2, #fde8f0)"
  bgImage?: string;         // optional URL to a background image
  decorations?: string;     // emoji or short label, e.g. "🌹💕"
  previewColor?: string;    // short hex for the card accent, e.g. "#f472b6"
}

const defaultWishThemes: WishTheme[] = [
  {
    id: "romantic",
    name: "Romantic Rose",
    description: "Velvet roses, floating hearts",
    bgColor: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
    decorations: "🌹💕",
    previewColor: "#ec4899"
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon",
    description: "Glitch text, techno beats",
    bgColor: "linear-gradient(135deg, #1e1b4b, #4c1d95)",
    decorations: "⚡🎮",
    previewColor: "#a855f7"
  },
  {
    id: "retro",
    name: "Retro Polaroid",
    description: "Vintage journal, tape cassette",
    bgColor: "linear-gradient(135deg, #fef3c7, #fde68a)",
    decorations: "📷🎞️",
    previewColor: "#f59e0b"
  },
  {
    id: "disco",
    name: "Party Disco",
    description: "Sparkle lights, confetti drop",
    bgColor: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
    decorations: "🪩✨",
    previewColor: "#6366f1"
  }
];

let wishThemesMock: WishTheme[] = loadFromStorage("lovespy_wish_themes", defaultWishThemes);

export const getThemes = (): WishTheme[] => {
  wishThemesMock = loadFromStorage("lovespy_wish_themes", defaultWishThemes);
  return wishThemesMock;
};

export const setThemes = (themes: WishTheme[]) => {
  wishThemesMock = themes;
  saveToStorage("lovespy_wish_themes", themes);
};

export const addTheme = (theme: Omit<WishTheme, "id">) => {
  const newTheme: WishTheme = { ...theme, id: `theme-${Date.now()}` };
  wishThemesMock = [...wishThemesMock, newTheme];
  saveToStorage("lovespy_wish_themes", wishThemesMock);
  return newTheme;
};

export const updateTheme = (id: string, updates: Partial<WishTheme>) => {
  wishThemesMock = wishThemesMock.map(t => t.id === id ? { ...t, ...updates } : t);
  saveToStorage("lovespy_wish_themes", wishThemesMock);
};

export const deleteTheme = (id: string) => {
  wishThemesMock = wishThemesMock.filter(t => t.id !== id);
  saveToStorage("lovespy_wish_themes", wishThemesMock);
};
