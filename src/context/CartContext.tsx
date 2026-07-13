"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getAddons } from "@/lib/db";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  type: "product" | "custom-hamper" | "custom-surprise-page";
  image: string;
  details?: any;
}

export interface CustomHamper {
  box: { id: string; name: string; basePrice: number; maxItems: number; size: string; image: string } | null;
  items: Array<{ id: string; name: string; price: number; qty: number }>;
  personalization: {
    letter: string;
    card: string;
    photoName: string;
    photos?: string[];
    voiceQrAttached: boolean;
    nameTag: string;
    decorations: Record<string, boolean>;
  };
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  customHamper: CustomHamper;
  appliedCoupon: { code: string; type: string; value: number; minOrder: number } | null;
  useRewardPoints: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  setHamperBox: (box: any) => void;
  addHamperItem: (product: any) => void;
  removeHamperItem: (productId: string) => void;
  updateHamperPersonalization: (field: string, value: any) => void;
  toggleHamperDecoration: (key: string) => void;
  commitCustomHamperToCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setUseRewardPoints: (use: boolean) => void;
  calculateSubtotal: () => number;
  calculateDetailedBreakdown: () => {
    productsTotal: number;
    boxPrice: number;
    fairyLights: number;
    flowers: number;
    ribbon: number;
    stickers: number;
    velvet: number;
    photoUpload: number;
    voiceQr: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [useRewardPoints, setUseRewardPoints] = useState<boolean>(false);
  const [customHamper, setCustomHamper] = useState<CustomHamper>({
    box: null,
    items: [],
    personalization: {
      letter: "",
      card: "",
      photoName: "",
      photos: [],
      voiceQrAttached: false,
      nameTag: "",
      decorations: {},
    },
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("lovespy_cart");
    const savedWish = localStorage.getItem("lovespy_wishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWish) setWishlist(JSON.parse(savedWish));
  }, []);

  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("lovespy_cart", JSON.stringify(newCart));
  };

  const addToCart = (item: CartItem) => {
    const existing = cart.find((i) => i.id === item.id && i.type === item.type);
    if (existing) {
      existing.qty += item.qty;
      saveCartToStorage([...cart]);
    } else {
      saveCartToStorage([...cart, item]);
    }
  };

  const removeFromCart = (id: string) => {
    saveCartToStorage(cart.filter((i) => i.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      const updated = cart.map((i) => (i.id === id ? { ...i, qty } : i));
      saveCartToStorage(updated);
    }
  };

  const clearCart = () => {
    saveCartToStorage([]);
    setAppliedCoupon(null);
    setUseRewardPoints(false);
    setCustomHamper({
      box: null,
      items: [],
      personalization: {
        letter: "",
        card: "",
        photoName: "",
        photos: [],
        voiceQrAttached: false,
        nameTag: "",
        decorations: {},
      },
    });
  };

  const toggleWishlist = (productId: string) => {
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem("lovespy_wishlist", JSON.stringify(updated));
  };

  const setHamperBox = (box: any) => {
    setCustomHamper({ ...customHamper, box, items: [] });
  };

  const addHamperItem = (product: any) => {
    if (!customHamper.box) return;
    const currentQty = customHamper.items.reduce((acc, i) => acc + i.qty, 0);
    if (currentQty >= customHamper.box.maxItems) return;

    const existing = customHamper.items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += 1;
      setCustomHamper({ ...customHamper, items: [...customHamper.items] });
    } else {
      setCustomHamper({
        ...customHamper,
        items: [...customHamper.items, { id: product.id, name: product.name, price: product.price, qty: 1 }],
      });
    }
  };

  const removeHamperItem = (productId: string) => {
    const existing = customHamper.items.find((i) => i.id === productId);
    if (!existing) return;
    existing.qty -= 1;
    let newItems = [...customHamper.items];
    if (existing.qty <= 0) {
      newItems = newItems.filter((i) => i.id !== productId);
    }
    setCustomHamper({ ...customHamper, items: newItems });
  };

  const updateHamperPersonalization = (field: string, value: any) => {
    setCustomHamper({
      ...customHamper,
      personalization: { ...customHamper.personalization, [field]: value },
    });
  };

  const toggleHamperDecoration = (key: string) => {
    const decors = customHamper.personalization.decorations as any;
    setCustomHamper({
      ...customHamper,
      personalization: {
        ...customHamper.personalization,
        decorations: { ...decors, [key]: !decors[key] },
      },
    });
  };

  const calculateCustomHamperTotal = (hamper: CustomHamper) => {
    if (!hamper.box) return 0;
    let total = hamper.box.basePrice;
    total += hamper.items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const pers = hamper.personalization;
    const photoCount = (pers.photos || (pers.photoName ? [pers.photoName] : [])).length;
    total += photoCount * 15;
    if (pers.voiceQrAttached) total += 25;
    
    // Dynamic addon calculation
    const addons = getAddons();
    addons.forEach((ad: any) => {
      if (pers.decorations && pers.decorations[ad.id]) {
        total += ad.price;
      }
    });
    return total;
  };

  const commitCustomHamperToCart = () => {
    if (!customHamper.box) return;
    const finalPrice = calculateCustomHamperTotal(customHamper);
    const boxName = customHamper.box.name;
    const cartId = `hmp-${Date.now()}`;

    addToCart({
      id: cartId,
      name: `Bespoke Custom Box (${boxName})`,
      price: finalPrice,
      qty: 1,
      type: "custom-hamper",
      image: customHamper.box.image,
      details: { ...customHamper },
    });

    setCustomHamper({
      box: null,
      items: [],
      personalization: {
        letter: "",
        card: "",
        photoName: "",
        photos: [],
        voiceQrAttached: false,
        nameTag: "",
        decorations: {},
      },
    });
  };

  const applyCoupon = (code: string): boolean => {
    const subtotal = calculateSubtotal();
    if (code === "LOVESPY10" && subtotal >= 1999) {
      setAppliedCoupon({ code, type: "percent", value: 10, minOrder: 1999 });
      return true;
    }
    if (code === "FREEGP" && subtotal >= 1499) {
      setAppliedCoupon({ code, type: "flat", value: 150, minOrder: 1499 });
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  const calculateDetailedBreakdown = () => {
    let productsTotal = 0;
    let boxPrice = 0;
    let fairyLights = 0;
    let flowers = 0;
    let ribbon = 0;
    let stickers = 0;
    let velvet = 0;
    let photoUpload = 0;
    let voiceQr = 0;

    cart.forEach(item => {
      if (item.type === 'custom-hamper') {
        const details = item.details;
        if (details?.box) {
          boxPrice += details.box.basePrice * item.qty;
        }
        if (details?.items) {
          details.items.forEach((it: any) => {
            productsTotal += it.price * it.qty * item.qty;
          });
        }
        const pers = details?.personalization;
        if (pers) {
          const photoCount = (pers.photos || (pers.photoName ? [pers.photoName] : [])).length;
          photoUpload += photoCount * 15 * item.qty;
          if (pers.voiceQrAttached) voiceQr += 25 * item.qty;
          if (pers.decorations) {
            if (pers.decorations['ad-1']) fairyLights += 99 * item.qty;
            if (pers.decorations['ad-2']) flowers += 149 * item.qty;
            if (pers.decorations['ad-3']) ribbon += 49 * item.qty;
            if (pers.decorations['ad-4']) stickers += 29 * item.qty;
            if (pers.decorations['ad-5']) velvet += 199 * item.qty;
          }
        }
      } else {
        productsTotal += item.price * item.qty;
      }
    });

    return {
      productsTotal,
      boxPrice,
      fairyLights,
      flowers,
      ribbon,
      stickers,
      velvet,
      photoUpload,
      voiceQr
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        customHamper,
        appliedCoupon,
        useRewardPoints,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        setHamperBox,
        addHamperItem,
        removeHamperItem,
        updateHamperPersonalization,
        toggleHamperDecoration,
        commitCustomHamperToCart,
        applyCoupon,
        removeCoupon,
        setUseRewardPoints,
        calculateSubtotal,
        calculateDetailedBreakdown,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
