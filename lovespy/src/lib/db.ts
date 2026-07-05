import mongoose from "mongoose";
import UserModel from "@/models/User";
import ProductModel from "@/models/Product";
import OrderModel from "@/models/Order";
import CouponModel from "@/models/Coupon";
import SettingsModel from "@/models/Settings";

const MONGODB_URI = process.env.MONGODB_URI || "";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGODB_URI) {
      console.warn("MongoDB connection string missing. Operating in simulated seed database mode.");
      return null;
    }
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

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
}

export type Product = ProductType;

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "confirmed" | "packed" | "shipped" | "delivered";
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
}

const categories: Category[] = [
  { id: "c1", name: "Chocolates", slug: "chocolates", icon: "candy" },
  { id: "c2", name: "Jewelry", slug: "jewelry", icon: "sparkles" },
  { id: "c3", name: "Cosmetics", slug: "cosmetics", icon: "palette" },
  { id: "c4", name: "Plush Toys", slug: "plush-toys", icon: "smile" },
  { id: "c5", name: "Accessories", slug: "accessories", icon: "glasses" },
  { id: "c6", name: "Personalized", slug: "personalized", icon: "image" },
  { id: "c7", name: "Luxury Gifts", slug: "luxury", icon: "crown" }
];

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

export interface HeroSettings {
  title: string;
  subtitle: string;
  image: string;
  video: string;
  ctaText: string;
  ctaLink: string;
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
  points: number;
  orderCount: number;
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
  { id: "c-1", name: "Ananya Sharma", phone: "9876543210", email: "ananya@gmail.com", points: 150, orderCount: 2 },
  { id: "c-2", name: "Rahul Mehra", phone: "9988776655", email: "rahul.m@outlook.com", points: 80, orderCount: 1 },
  { id: "c-3", name: "Priya S.", phone: "9812345678", email: "priya.s@gmail.com", points: 240, orderCount: 3 }
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
  }
};

let productsList = loadFromStorage("lovespy_products", defaultProducts);
let hamperBoxesMock = loadFromStorage("lovespy_boxes", defaultHamperBoxes);
let ordersMock = loadFromStorage("lovespy_orders", defaultOrders);
let surpriseOrdersMock = loadFromStorage("lovespy_surprise_orders", defaultSurpriseOrders);
let offersMock = loadFromStorage("lovespy_offers", defaultOffers);
let heroSettingsMock = loadFromStorage("lovespy_hero", defaultHeroSettings);
let seasonalCampaignsMock = loadFromStorage("lovespy_campaigns", defaultSeasonalCampaigns);
let showcaseMediaMock = loadFromStorage("lovespy_showcase", defaultShowcaseMedia);
let addonsMock = loadFromStorage("lovespy_addons", defaultAddons);
let couponsMock = loadFromStorage("lovespy_coupons", defaultCoupons);
let customersMock = loadFromStorage("lovespy_customers", defaultCustomers);

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
export const getCategories = () => categories;
export const getProducts = () => productsList;
export const setProducts = (newProducts: ProductType[]) => {
  productsList = newProducts;
  saveToStorage("lovespy_products", newProducts);
};

export const getHamperBoxes = () => hamperBoxesMock;
export const setHamperBoxes = (newBoxes: HamperBox[]) => {
  hamperBoxesMock = newBoxes;
  saveToStorage("lovespy_boxes", newBoxes);
};

export const getOrders = () => ordersMock;
export const setOrders = (newOrders: any[]) => {
  ordersMock = newOrders;
  saveToStorage("lovespy_orders", newOrders);
};

export const getSurpriseOrders = () => surpriseOrdersMock;
export const setSurpriseOrders = (newSurpriseOrders: SurpriseOrderType[]) => {
  surpriseOrdersMock = newSurpriseOrders;
  saveToStorage("lovespy_surprise_orders", newSurpriseOrders);
};

export const getOffers = () => offersMock;
export const setOffers = (newOffers: OfferItem[]) => {
  offersMock = newOffers;
  saveToStorage("lovespy_offers", newOffers);
};

export const getHeroBanner = () => heroSettingsMock;
export const setHeroBanner = (newHero: HeroSettings) => {
  heroSettingsMock = newHero;
  saveToStorage("lovespy_hero", newHero);
};

export const getSeasonalCampaigns = () => seasonalCampaignsMock;
export const setSeasonalCampaigns = (newCampaigns: SeasonalCampaign[]) => {
  seasonalCampaignsMock = newCampaigns;
  saveToStorage("lovespy_campaigns", newCampaigns);
};

export const getShowcaseMedia = () => showcaseMediaMock;
export const setShowcaseMedia = (newShowcase: ShowcaseMedia[]) => {
  showcaseMediaMock = newShowcase;
  saveToStorage("lovespy_showcase", newShowcase);
};

export const getAddons = () => addonsMock;
export const setAddons = (newAddons: AddonItem[]) => {
  addonsMock = newAddons;
  saveToStorage("lovespy_addons", newAddons);
};

export const getCoupons = () => couponsMock;
export const setCoupons = (newCoupons: CouponItem[]) => {
  couponsMock = newCoupons;
  saveToStorage("lovespy_coupons", newCoupons);
};

export const getCustomers = () => customersMock;
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

const defaultStoreSettings: StoreSettings = {
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

let storeSettingsMock = loadFromStorage("lovespy_store_settings", defaultStoreSettings);

export const getStoreSettings = async (): Promise<StoreSettings> => {
  const conn = await dbConnect();
  if (conn) {
    try {
      let settings = await SettingsModel.findOne();
      if (!settings) {
        settings = await SettingsModel.create(defaultStoreSettings);
      }
      return settings.toObject();
    } catch (err) {
      console.error("Failed to load settings from MongoDB:", err);
    }
  }
  return storeSettingsMock;
};

export const setStoreSettings = async (newSettings: StoreSettings): Promise<void> => {
  storeSettingsMock = newSettings;
  saveToStorage("lovespy_store_settings", newSettings);

  const conn = await dbConnect();
  if (conn) {
    try {
      let settings = await SettingsModel.findOne();
      if (settings) {
        Object.assign(settings, newSettings);
        await settings.save();
      } else {
        await SettingsModel.create(newSettings);
      }
    } catch (err) {
      console.error("Failed to save settings to MongoDB:", err);
    }
  }
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

  // Save to MongoDB asynchronously
  dbConnect().then((conn) => {
    if (conn) {
      const uId = mongoose.Types.ObjectId.isValid(newOrder.user_id)
        ? new mongoose.Types.ObjectId(newOrder.user_id)
        : new mongoose.Types.ObjectId(); // generated fallback

      OrderModel.create({
        orderNumber: newOrder.orderNumber,
        userId: uId,
        deliveryName: newOrder.delivery_name,
        deliveryPhone: newOrder.delivery_phone,
        deliveryLine1: newOrder.delivery_line1,
        deliveryLine2: newOrder.delivery_line2 || "",
        deliveryCity: newOrder.delivery_city,
        deliveryState: newOrder.delivery_state,
        deliveryPincode: newOrder.delivery_pincode,
        status: "confirmed",
        deliveryType: newOrder.delivery_type || "standard",
        deliveryDate: newOrder.delivery_date,
        deliverySlot: newOrder.delivery_slot || "Standard Slot",
        subtotal: newOrder.subtotal,
        shippingCharge: newOrder.shipping_charge || 0,
        discountAmount: newOrder.discount_amount || 0,
        totalAmount: newOrder.total_amount || newOrder.total || 0,
        couponCode: newOrder.coupon_code || "",
        pointsRedeemed: newOrder.points_redeemed || 0,
        trackingNumber: newOrder.tracking,
        items: newOrder.items || [],
        razorpayPaymentId: newOrder.razorpayPaymentId,
        razorpayOrderId: newOrder.razorpayOrderId,
        razorpaySignature: newOrder.razorpaySignature,
        shiprocketOrderId: newOrder.shiprocketOrderId || "",
        shiprocketShipmentId: newOrder.shiprocketShipmentId || "",
        shiprocketAwb: newOrder.shiprocketAwb || "",
        shiprocketCourier: newOrder.shiprocketCourier || "",
        shiprocketStatus: newOrder.shiprocketStatus || "Processing",
        shiprocketDispatchDate: newOrder.shiprocketDispatchDate || ""
      }).then((created) => {
        console.log("Successfully persisted order to MongoDB:", created.orderNumber);
      }).catch(err => {
        console.error("Failed to create Order in MongoDB:", err);
      });
    }
  });

  return newOrder;
};

export const updateOrderStatus = (id: string, status: string) => {
  const ord = ordersMock.find(o => o.id === id);
  if (ord) {
    ord.status = status;
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

  const conn = await dbConnect();
  if (conn) {
    try {
      const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isMongoId ? { _id: id } : { orderNumber: id };
      const orderDoc = await OrderModel.findOne(query);
      if (orderDoc) {
        // Map the fields to schema names if needed, or assign directly
        Object.assign(orderDoc, updates);
        await orderDoc.save();
        return true;
      }
    } catch (err) {
      console.error("Failed to update order details in MongoDB:", err);
    }
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
