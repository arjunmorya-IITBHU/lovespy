"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getProducts,
  setProducts,
  getOrders,
  setOrders,
  updateOrderStatus,
  updateOrderDetails,
  getSurpriseOrders,
  setSurpriseOrders,
  updateSurpriseOrderStatus,
  getHamperBoxes,
  getEffectiveStock,
  setHamperBoxes,
  HAMPER_COMPONENTS,
  setHamperComponents,
  getOffers,
  setOffers,
  getHeroBanner,
  setHeroBanner,
  getSeasonalCampaigns,
  setSeasonalCampaigns,
  getShowcaseMedia,
  setShowcaseMedia,
  getAddons,
  setAddons,
  getCoupons,
  setCoupons,
  getCustomers,
  setCustomers,
  getReviews,
  setReviews,
  getProductCategories,
  addCategory,
  ProductReview,
  Product as ProductType,
  Order as OrderType,
  SurpriseOrderType,
  OfferItem,
  HeroSettings, HeroSlide, getHeroSlides, setHeroSlides, HeroSliderSettings, getHeroSliderSettings, setHeroSliderSettings,
  SeasonalCampaign,
  ShowcaseMedia,
  AddonItem,
  CouponItem,
  CustomerType,
  HamperBox,
  WishTheme,
  getThemes,
  addTheme,
  updateTheme,
  deleteTheme
} from "@/lib/db";
import {
  BarChart3,
  Database,
  Award,
  PackageOpen,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Check,
  ShieldAlert,
  Lock,
  User as UserIcon,
  Gift,
  Megaphone,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  Layers,
  Sparkle,
  Ticket,
  Heart,
  Users,
  Settings as SettingsIcon,
  Star
} from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (user) {
      const isProfileAdmin = user.name === "Arjun Morya" && user.phone === "9950669088";
      if (isProfileAdmin) {
        setIsAuthenticated(true);
      } else {
        alert("Unauthorized access. Admins only.");
        router.push("/");
      }
    }
  }, [user, router]);

  const [activeTab, setActiveTab] = useState<
    | "offers"
    | "hero"
    | "campaigns"
    | "trending"
    | "trending_hampers"
    | "gifts"
    | "hampers"
    | "boxes"
    | "addons"
    | "showcase"
    | "orders"
    | "coupons"
    | "customers"
    | "reviews"
    | "inventory"
    | "settings"
    | "themes"
  >("offers");

  // Internal component states synchronized with db.ts
  const [productsList, setProductsList] = useState<ProductType[]>(getProducts());
  const [boxesList, setBoxesList] = useState<HamperBox[]>(getHamperBoxes());
  const [ordersList, setOrdersList] = useState<any[]>(getOrders());
  const [surpriseOrdersList, setSurpriseOrdersList] = useState<SurpriseOrderType[]>(getSurpriseOrders());
  const [offersList, setOffersList] = useState<OfferItem[]>(getOffers());
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(getReviews());
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(getHeroBanner());
  const [heroSlides, setHeroSlidesState] = useState<HeroSlide[]>(getHeroSlides());
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [sliderSettings, setSliderSettings] = useState<HeroSliderSettings | null>(null);
  const [previewSlide, setPreviewSlide] = useState<HeroSlide | null>(null);
  const [productModalTab, setProductModalTab] = useState<"basic" | "media" | "pricing" | "inventory" | "details" | "reviews" | "seo" | "visibility">("basic");
  const [editingManualReviewId, setEditingManualReviewId] = useState<string | null>(null);
  
  // Reviews global tab filters & edits
  const [reviewsSearch, setReviewsSearch] = useState("");
  const [reviewsFilterRating, setReviewsFilterRating] = useState<number | "all">("all");
  const [reviewsFilterStatus, setReviewsFilterStatus] = useState<string>("all");
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);

  useEffect(() => {
    setSliderSettings(getHeroSliderSettings());
  }, []);

  useEffect(() => {
    if (activeTab === "customers") {
      setCustomersList(getCustomers());
    }
  }, [activeTab]);
  const [campaignsList, setCampaignsList] = useState<SeasonalCampaign[]>(getSeasonalCampaigns());
  const [showcaseList, setShowcaseList] = useState<ShowcaseMedia[]>(getShowcaseMedia());
  const [addonsList, setAddonsList] = useState<AddonItem[]>(getAddons());
  const [couponsList, setCouponsList] = useState<CouponItem[]>(getCoupons());
  const [customersList, setCustomersList] = useState<CustomerType[]>(getCustomers());
  const [themesList, setThemesList] = useState<WishTheme[]>(getThemes());

  // ── Confirm Delete Modal + Toast ──────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; label: string; onConfirm: () => void }>({ open: false, label: "", onConfirm: () => {} });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const openDeleteConfirm = (label: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, label, onConfirm });
  };
  const closeDeleteConfirm = () => setConfirmModal({ open: false, label: "", onConfirm: () => {} });
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Unified Order sub-tab
  const [orderSubTab, setOrderSubTab] = useState<"general" | "surprise">("general");

  // Settings state
  const [storeSettings, setStoreSettings] = useState<any>({
    deliveryCharge: 150,
    freeShippingThreshold: 2999,
    freeShippingEnabled: true,
    shiprocketEmail: "",
    shiprocketPassword: "",
    shiprocketToken: ""
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Modals state
  const [selectedGeneralOrder, setSelectedGeneralOrder] = useState<any | null>(null);
  const [selectedSurpriseOrder, setSelectedSurpriseOrder] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingItemType, setEditingItemType] = useState<"product" | "box" | "addon" | null>(null);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<"all" | "low" | "out">("all");
  const [tempRecipe, setTempRecipe] = useState<Record<string, number>>({});
  const [tempGiftStocks, setTempGiftStocks] = useState<Record<string, number>>({});
  const [costPrice, setCostPrice] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [discountPct, setDiscountPct] = useState(0);
  // Dynamic category system state
  const [categoryOptions, setCategoryOptions] = useState<string[]>(getProductCategories());
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [selectedCategoryValue, setSelectedCategoryValue] = useState("");

  React.useEffect(() => {
    if (editingProduct) {
      setCostPrice(editingProduct.costPrice || 0);
      setMrp(editingProduct.originalPrice || editingProduct.crossedPrice || editingProduct.price || editingProduct.basePrice || 0);
      setDiscountPct(editingProduct.discountPercentage || 0);

      const stocks: Record<string, number> = {};
      productsList.forEach(p => {
        if (p.is_hamper_item) {
          stocks[p.id] = p.stock;
        }
      });
      setTempGiftStocks(stocks);

      if (editingProduct.is_hamper_item !== undefined && !editingProduct.is_hamper_item) {
        const currentRecipe: Record<string, number> = {};
        const comps = HAMPER_COMPONENTS[editingProduct.id] || [];
        comps.forEach((c) => {
          currentRecipe[c.id] = c.qty;
        });
        setTempRecipe(currentRecipe);
      } else {
        setTempRecipe({});
      }
    } else {
      setTempRecipe({});
      setTempGiftStocks({});
    }
    // Refresh category options and set the current product's category
    const freshCats = getProductCategories();
    setCategoryOptions(freshCats);
    setSelectedCategoryValue(editingProduct?.category || "");
    setNewCategoryInput("");
    setShowNewCategoryInput(false);
  }, [editingProduct]);

  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setStoreSettings(data.settings);
        }
        setLoadingSettings(false);
      })
      .catch((err) => {
        console.error("Failed to fetch settings:", err);
        setLoadingSettings(false);
      });
  }, []);

  const handleUpdateFullOrder = (updatedOrder: any) => {
    const updatedList = ordersList.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    setOrdersList(updatedList);
    setOrders(updatedList);
  };

  const handleUpdateFullSurpriseOrder = (updatedOrder: any) => {
    const updatedList = surpriseOrdersList.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    setSurpriseOrdersList(updatedList);
    setSurpriseOrders(updatedList);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeSettings),
      });
      const data = await res.json();
      if (data.success) {
        alert("Settings saved successfully!");
      } else {
        alert(data.error || "Failed to save settings.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Error saving settings.");
    }
  };

  const totalSales = ordersList.reduce((sum, o) => sum + (o.total || 0), 0) + surpriseOrdersList.length * 299;



  const handleStatusChange = (orderId: string, status: any) => {
    updateOrderStatus(orderId, status);
    setOrdersList([...getOrders()]);
  };

  const handleSurpriseStatusChange = (orderId: string, status: SurpriseOrderType["orderStatus"]) => {
    updateSurpriseOrderStatus(orderId, status);
    setSurpriseOrdersList([...getSurpriseOrders()]);
  };

  const [dispatchingOrder, setDispatchingOrder] = useState<string | null>(null);
  const [generatingAwb, setGeneratingAwb] = useState<string | null>(null);
  const [testingSrConnection, setTestingSrConnection] = useState(false);

  const handleTestConnection = async () => {
    setTestingSrConnection(true);
    try {
      const res = await fetch("/api/shiprocket/test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Connection successful!");
      } else {
        alert(data.error || "Connection failed.");
      }
    } catch (err) {
      console.error("Test connection error:", err);
      alert("Error testing connection.");
    } finally {
      setTestingSrConnection(false);
    }
  };

  const handleDispatchShiprocket = async (orderId: string) => {
    setDispatchingOrder(orderId);
    try {
      const res = await fetch("/api/shiprocket/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        const updates = {
          shiprocketOrderId: data.shiprocketOrderId,
          shiprocketShipmentId: data.shipmentId,
          shiprocketStatus: "Processing" as const,
          status: "confirmed" as const,
        };
        await updateOrderDetails(orderId, updates);
        
        const freshOrders = getOrders();
        setOrdersList([...freshOrders]);
        
        const updatedOrder = freshOrders.find((o: any) => o.id === orderId);
        if (updatedOrder) {
          setSelectedGeneralOrder(updatedOrder);
        }
        alert("Order dispatched to Shiprocket successfully!");
      } else {
        alert(data.error || "Failed to dispatch order.");
      }
    } catch (err) {
      console.error("Dispatch error:", err);
      alert("Error dispatching order.");
    } finally {
      setDispatchingOrder(null);
    }
  };

  const handleGenerateAWB = async (orderId: string) => {
    setGeneratingAwb(orderId);
    try {
      const res = await fetch("/api/shiprocket/awb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        const updates = {
          shiprocketAwb: data.awbCode,
          shiprocketCourier: data.courierName,
          shiprocketStatus: "Packed" as const,
          shiprocketDispatchDate: new Date().toISOString().split("T")[0],
          status: "packed" as const,
        };
        await updateOrderDetails(orderId, updates);
        
        const freshOrders = getOrders();
        setOrdersList([...freshOrders]);

        const updatedOrder = freshOrders.find((o: any) => o.id === orderId);
        if (updatedOrder) {
          setSelectedGeneralOrder(updatedOrder);
        }
        alert("Shiprocket AWB generated successfully!");
      } else {
        alert(data.error || "Failed to generate AWB.");
      }
    } catch (err) {
      console.error("AWB generation error:", err);
      alert("Error generating AWB.");
    } finally {
      setGeneratingAwb(null);
    }
  };

  const handlePrintLabel = (orderId: string) => {
    window.open(`/api/shiprocket/label?orderId=${orderId}`, "_blank");
  };

  const [initiatingReturn, setInitiatingReturn] = useState<string | null>(null);
  const handleInitiateReturn = async (orderId: string) => {
    setInitiatingReturn(orderId);
    try {
      const res = await fetch("/api/shiprocket/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Return Order initiated successfully! ID: ${data.returnOrderId}`);
        const freshOrders = getOrders();
        setOrdersList([...freshOrders]);
        const updatedOrder = freshOrders.find((o: any) => o.id === orderId);
        if (updatedOrder) {
          setSelectedGeneralOrder(updatedOrder);
        }
      } else {
        alert(data.error || "Failed to initiate return.");
      }
    } catch (err) {
      console.error("Return error:", err);
      alert("Error initiating return.");
    } finally {
      setInitiatingReturn(null);
    }
  };



  // 1. Offers CRUD
  const handleAddOffer = () => {
    const newOffer: OfferItem = {
      id: `o-${Date.now()}`,
      text: "New Promo Offer Scrolling Text Banner Alert!",
      textColor: "#ffffff",
      bgColor: "#C1121F",
      isEnabled: true,
      displayOrder: offersList.length + 1
    };
    const updated = [...offersList, newOffer];
    setOffersList(updated);
    setOffers(updated);
  };

  const handleUpdateOffer = (id: string, field: keyof OfferItem, value: any) => {
    const updated = offersList.map((o) => (o.id === id ? { ...o, [field]: value } : o));
    setOffersList(updated);
    setOffers(updated);
  };

  const handleDeleteOffer = (id: string) => {
    openDeleteConfirm("Scrolling Offer Banner", () => {
      const updated = offersList.filter((o) => o.id !== id);
      setOffersList(updated);
      setOffers(updated);
      showToast("Item deleted successfully.");
    });
  };

  // Hero Slideshow CRUD
  const handleAddHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      title: "New Seasonal Banner",
      subtitle: "Offer details or celebratory campaign tagline",
      description: "",
      desktopImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
      mobileImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
      video: "",
      ctas: [
        { text: "Explore Collection", url: "/shop", target: "_self", style: "primary" }
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
      offerText: "",
      badgeLabel: "",
      backgroundType: "image",
      backgroundColor: "#1e1e1e",
      rightImage: "",
      rightImageMobile: ""
    };
    const updated = [...heroSlides, newSlide];
    setHeroSlidesState(updated);
    setHeroSlides(updated);
  };

  const handleUpdateSlideToggle = (id: string) => {
    const updated = heroSlides.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s);
    setHeroSlidesState(updated);
    setHeroSlides(updated);
  };

  const handleDeleteHeroSlide = (id: string) => {
    openDeleteConfirm("Hero Slide", () => {
      const updated = heroSlides.filter(s => s.id !== id);
      setHeroSlidesState(updated);
      setHeroSlides(updated);
      showToast("Item deleted successfully.");
    });
  };

  const updateSliderGlobalSetting = (field: keyof HeroSliderSettings, value: any) => {
    if (!sliderSettings) return;
    const updated = { ...sliderSettings, [field]: value };
    setSliderSettings(updated);
    setHeroSliderSettings(updated);
  };

  const handleSaveEditingSlide = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSlide) return;
    const formData = new FormData(e.currentTarget);
    
    // Parse CTAs
    const ctas = [];
    const text1 = formData.get("cta1Text") as string;
    const url1 = formData.get("cta1Url") as string;
    if (text1 && url1) {
      ctas.push({
        text: text1,
        url: url1,
        target: formData.get("cta1Target") as "_self" | "_blank",
        style: formData.get("cta1Style") as "primary" | "secondary"
      });
    }

    const text2 = formData.get("cta2Text") as string;
    const url2 = formData.get("cta2Url") as string;
    if (text2 && url2) {
      ctas.push({
        text: text2,
        url: url2,
        target: formData.get("cta2Target") as "_self" | "_blank",
        style: formData.get("cta2Style") as "primary" | "secondary"
      });
    }

    const updatedSlide: HeroSlide = {
      ...editingSlide,
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      description: formData.get("description") as string,
      desktopImage: formData.get("image") as string,
      mobileImage: formData.get("mobileImage") as string,
      video: formData.get("video") as string,
      ctas,
      campaignType: formData.get("campaignType") as string,
      startDate: formData.get("startDate") as string,
      startTime: formData.get("startTime") as string,
      endDate: formData.get("endDate") as string,
      endTime: formData.get("endTime") as string,
      priority: parseInt(formData.get("priority") as string || "1"),
      showDesktop: formData.get("showDesktop") === "on",
      showTablet: formData.get("showTablet") === "on",
      showMobile: formData.get("showMobile") === "on",
      showForLoggedIn: formData.get("showForLoggedIn") === "on",
      showForGuests: formData.get("showForGuests") === "on",
      overlayColor: formData.get("overlayColor") as string,
      overlayOpacity: parseFloat(formData.get("overlayOpacity") as string || "0.3"),
      textAlignment: formData.get("textAlignment") as "left" | "center" | "right",
      textColor: formData.get("textColor") as string,
      contentPosition: formData.get("contentPosition") as "left" | "center" | "right",
      duration: parseInt(formData.get("duration") as string || "5"),
      status: formData.get("status") as "published" | "draft" | "publish-later",
      offerText: formData.get("offerText") as string,
      badgeLabel: formData.get("badgeLabel") as string,
      backgroundType: formData.get("backgroundType") as "image" | "video" | "color",
      backgroundColor: formData.get("backgroundColor") as string,
      rightImage: formData.get("rightImage") as string,
      rightImageMobile: formData.get("rightImageMobile") as string,
    };

    const updated = heroSlides.map(s => s.id === editingSlide.id ? updatedSlide : s);
    setHeroSlidesState(updated);
    setHeroSlides(updated);
    setEditingSlide(null);
    alert("Slide updated successfully!");
  };

  const handlePreviewSlideTrigger = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    
    // Parse CTAs
    const ctas = [];
    const text1 = formData.get("cta1Text") as string;
    const url1 = formData.get("cta1Url") as string;
    if (text1 && url1) {
      ctas.push({
        text: text1,
        url: url1,
        target: formData.get("cta1Target") as "_self" | "_blank",
        style: formData.get("cta1Style") as "primary" | "secondary"
      });
    }
    const text2 = formData.get("cta2Text") as string;
    const url2 = formData.get("cta2Url") as string;
    if (text2 && url2) {
      ctas.push({
        text: text2,
        url: url2,
        target: formData.get("cta2Target") as "_self" | "_blank",
        style: formData.get("cta2Style") as "primary" | "secondary"
      });
    }

    const tempSlide: HeroSlide = {
      id: "preview",
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      description: formData.get("description") as string,
      desktopImage: formData.get("image") as string,
      mobileImage: formData.get("mobileImage") as string,
      video: formData.get("video") as string,
      ctas,
      campaignType: formData.get("campaignType") as string,
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      timezone: "local",
      priority: 1,
      showDesktop: true,
      showTablet: true,
      showMobile: true,
      showForLoggedIn: true,
      showForGuests: true,
      overlayColor: formData.get("overlayColor") as string,
      overlayOpacity: parseFloat(formData.get("overlayOpacity") as string || "0.3"),
      textAlignment: formData.get("textAlignment") as "left" | "center" | "right",
      textColor: formData.get("textColor") as string,
      contentPosition: formData.get("contentPosition") as "left" | "center" | "right",
      duration: 5,
      status: "published",
      isEnabled: true,
      views: 0,
      clicks: 0,
      offerText: formData.get("offerText") as string,
      badgeLabel: formData.get("badgeLabel") as string,
      backgroundType: formData.get("backgroundType") as "image" | "video" | "color",
      backgroundColor: formData.get("backgroundColor") as string,
      rightImage: formData.get("rightImage") as string,
      rightImageMobile: formData.get("rightImageMobile") as string,
    };
    setPreviewSlide(tempSlide);
  };

  // 2. Hero Banner Save
  const handleSaveManualReview = (e: React.FormEvent<HTMLFormElement>, prodId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("reviewName") as string;
    const title = formData.get("reviewTitle") as string;
    const rating = parseInt(formData.get("reviewRating") as string) || 5;
    const comment = formData.get("reviewComment") as string;
    const date = formData.get("reviewDate") as string || new Date().toISOString().split("T")[0];
    const image = formData.get("reviewImageHidden") as string || "";

    const newRev = {
      id: editingManualReviewId || 'r-' + Date.now(),
      productId: prodId,
      userName: name,
      title: title,
      rating: rating,
      comment: comment,
      date: date,
      userImage: image,
      status: "approved" as const
    };

    let updatedReviews = [...reviewsList];
    if (editingManualReviewId) {
      updatedReviews = updatedReviews.map(r => r.id === editingManualReviewId ? newRev : r);
    } else {
      updatedReviews.unshift(newRev);
    }

    setReviewsList(updatedReviews);
    setReviews(updatedReviews);
    setEditingManualReviewId(null);
    e.currentTarget.reset();
    const hidden = document.getElementById("manual-review-hidden-img") as HTMLInputElement;
    if (hidden) hidden.value = "";
    const preview = document.getElementById("manual-review-img-preview");
    if (preview) preview.classList.add("hidden");
    alert("Manual review saved successfully!");
  };

  const handleDeleteManualReview = (id: string) => {
    openDeleteConfirm("Product Review", () => {
      const updated = reviewsList.filter(r => r.id !== id);
      setReviewsList(updated);
      setReviews(updated);
      if (editingManualReviewId === id) setEditingManualReviewId(null);
      showToast("Item deleted successfully.");
    });
  };

  const handleSaveHero = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: HeroSettings = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      image: formData.get("image") as string,
      video: formData.get("video") as string,
      ctaText: formData.get("ctaText") as string,
      ctaLink: formData.get("ctaLink") as string
    };
    setHeroSettings(updated);
    setHeroBanner(updated);
    alert("Homepage Hero settings updated successfully!");
  };

  // 3. Seasonal campaigns CRUD
  const handleAddCampaign = () => {
    const newC: SeasonalCampaign = {
      id: `sc-${Date.now()}`,
      name: "New Festive Occasion",
      slug: "new-festive",
      isEnabled: false,
      bannerImage: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500"
    };
    const updated = [...campaignsList, newC];
    setCampaignsList(updated);
    setSeasonalCampaigns(updated);
  };

  const handleUpdateCampaign = (id: string, field: keyof SeasonalCampaign, value: any) => {
    const updated = campaignsList.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    setCampaignsList(updated);
    setSeasonalCampaigns(updated);
  };

  const handleDeleteCampaign = (id: string) => {
    openDeleteConfirm("Seasonal Campaign", () => {
      const updated = campaignsList.filter((c) => c.id !== id);
      setCampaignsList(updated);
      setSeasonalCampaigns(updated);
      showToast("Item deleted successfully.");
    });
  };

  // 4. Trending Products Tagging
  const handleToggleTrending = (prodId: string) => {
    const updated = productsList.map((p) => {
      if (p.id === prodId) {
        const hasTrending = p.tags.includes("Trending");
        const newTags = hasTrending ? p.tags.filter((t) => t !== "Trending") : [...p.tags, "Trending"];
        return { ...p, tags: newTags };
      }
      return p;
    });
    setProductsList(updated);
    setProducts(updated);
  };

  // 5 & 6. Gifts & Hampers CRUD
  const handleAddProduct = (isHamper: boolean) => {
    const newP: ProductType = {
      id: `p-${Date.now()}`,
      name: "New Catalog Item",
      slug: "new-catalog-item-" + Date.now(),
      price: 0,
      rating: 5,
      is_hamper_item: !isHamper,
      category: isHamper ? "luxury" : "chocolates",
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
      desc: "",
      tags: isHamper ? ["Luxury", "Hamper"] : ["Gift"],
      stock: 50,
      availability: "in-stock",
      lowStockAlert: 5,
      gallery: []
    };
    setEditingProduct(newP);
    setEditingItemType("product");
    setIsAddingNewItem(true);
    setProductModalTab("basic");
    setEditingManualReviewId(null);
  };

  const handleDeleteProduct = (id: string) => {
    openDeleteConfirm("Product / Hamper", () => {
      const updated = productsList.filter((p) => p.id !== id);
      setProductsList(updated);
      setProducts(updated);
      showToast("Item deleted successfully.");
    });
  };

  const handleUpdateProductStock = (id: string, amount: number) => {
    const updated = productsList.map((p) => (p.id === id ? { ...p, stock: Math.max(0, amount) } : p));
    setProductsList(updated);
    setProducts(updated);
  };

  const handleSaveEditedProduct = (updatedProduct: ProductType) => {
    const updated = productsList.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProductsList(updated);
    setProducts(updated);
    setEditingProduct(null);
  };

  const handleUpdateTrendingOrder = (prodId: string, orderVal: number) => {
    const updated = productsList.map((p) => (p.id === prodId ? { ...p, trendingOrder: orderVal } : p));
    setProductsList(updated);
    setProducts(updated);
  };

  // 7. Boxes CRUD
  const handleAddBox = () => {
    const newBox: HamperBox = {
      id: `box-${Date.now()}`,
      name: "New Box Container",
      basePrice: 299,
      maxItems: 6,
      size: "20x20x10 cm",
      image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500",
      desc: "",
      tags: ["Box", "Container"],
      stock: 50,
      lowStockAlert: 5,
      gallery: []
    };
    setEditingProduct(newBox);
    setEditingItemType("box");
    setIsAddingNewItem(true);
    setProductModalTab("basic");
    setEditingManualReviewId(null);
  };

  const handleDeleteBox = (id: string) => {
    openDeleteConfirm("Box Container", () => {
      const updated = boxesList.filter((b) => b.id !== id);
      setBoxesList(updated);
      setHamperBoxes(updated);
      showToast("Item deleted successfully.");
    });
  };

  // 8. Add-ons CRUD
  const handleAddAddon = () => {
    const newAd: AddonItem = {
      id: `ad-${Date.now()}`,
      name: "New Accent Option",
      price: 99,
      stock: 50,
      isEnabled: true,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100",
      desc: "",
      tags: ["Accent", "Add-on"],
      lowStockAlert: 5,
      gallery: []
    };
    setEditingProduct(newAd);
    setEditingItemType("addon");
    setIsAddingNewItem(true);
    setProductModalTab("basic");
    setEditingManualReviewId(null);
  };

  const handleUpdateAddon = (id: string, field: keyof AddonItem, value: any) => {
    const updated = addonsList.map((a) => (a.id === id ? { ...a, [field]: value } : a));
    setAddonsList(updated);
    setAddons(updated);
  };

  const handleUpdateAddonToggle = (id: string) => {
    const updated = addonsList.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
    setAddonsList(updated);
    setAddons(updated);
  };

  const handleDeleteAddon = (id: string) => {
    openDeleteConfirm("Accent / Add-on", () => {
      const updated = addonsList.filter((a) => a.id !== id);
      setAddonsList(updated);
      setAddons(updated);
      showToast("Item deleted successfully.");
    });
  };

  // 9. Showcase Media CRUD
  const handleAddShowcase = () => {
    const title = prompt("Enter design title:");
    if (!title) return;
    const type = confirm("Click OK for Image, CANCEL for Video loop") ? "image" : "video";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = type === "image" ? "image/*" : "video/*";
    fileInput.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const url = event.target.result;
        const newSm: ShowcaseMedia = {
          id: `sm-${Date.now()}`,
          title,
          type,
          url: url as string,
          displayOrder: showcaseList.length + 1
        };
        const updated = [...showcaseList, newSm];
        setShowcaseList(updated);
        setShowcaseMedia(updated);
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  };

  const handleDeleteShowcase = (id: string) => {
    openDeleteConfirm("Showcase Media", () => {
      const updated = showcaseList.filter((s) => s.id !== id);
      setShowcaseList(updated);
      setShowcaseMedia(updated);
      showToast("Item deleted successfully.");
    });
  };

  // 11. Coupons CRUD
  const handleAddCoupon = () => {
    const code = prompt("Enter coupon code:")?.toUpperCase();
    if (!code) return;
    const type = confirm("Click OK for Percentage (%), CANCEL for Flat rate (₹)") ? "percent" : "flat";
    const value = parseFloat(prompt("Enter discount value:", "10") || "0");
    const minOrder = parseFloat(prompt("Enter minimum order limit (INR):", "1499") || "0");
    const desc = prompt("Enter description:");

    const newCp: CouponItem = {
      code,
      type,
      value,
      minOrder,
      desc: desc || `${value}${type === "percent" ? "%" : " INR"} discount`
    };
    const updated = [...couponsList, newCp];
    setCouponsList(updated);
    setCoupons(updated);
  };

  const handleDeleteCoupon = (code: string) => {
    openDeleteConfirm("Coupon", () => {
      const updated = couponsList.filter((c) => c.code !== code);
      setCouponsList(updated);
      setCoupons(updated);
      showToast("Item deleted successfully.");
    });
  };

  // 12. Customers CRUD
  const handleAddCustomer = () => {
    const name = prompt("Customer Name:");
    if (!name) return;
    const phone = prompt("Phone:");
    const email = prompt("Email:");

    const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const nowStr = todayStr + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const newCust: CustomerType = {
      id: `c-${Date.now()}`,
      name,
      phone: phone || "",
      email: email || "",
      registeredDate: todayStr,
      lastLogin: nowStr,
      totalOrders: 0,
      totalAmountSpent: 0,
      status: "Active"
    };
    const updated = [...customersList, newCust];
    setCustomersList(updated);
    setCustomers(updated);
  };
  const handleDeleteCustomer = (id: string) => {
    openDeleteConfirm("Customer Record", () => {
      const updated = customersList.filter((c) => c.id !== id);
      setCustomersList(updated);
      setCustomers(updated);
      showToast("Item deleted successfully.");
    });
  };

  // Loading view while verifying redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-4 glass-card p-10 border border-brand-pink/20 rounded-3xl shadow-xl bg-white">
          <Logo className="w-20 h-20 mx-auto animate-pulse-soft" />
          <h2 className="text-xl font-display font-extrabold text-brand-charcoal">
            Verifying Admin Session...
          </h2>
          <p className="text-xs text-brand-gray">
            Redirecting to home page if not authenticated as Arjun Morya.
          </p>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-slide-up pb-12">
      
      {/* LEFT SIDEBAR navigation links */}
      <div className="lg:col-span-1 space-y-4">
        <div className="glass-card p-5 rounded-2xl border-brand-lavender/10 text-center space-y-2 bg-white">
          <div className="w-12 h-12 rounded-full bg-brand-pinkLight flex items-center justify-center mx-auto text-brand-pink">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-bold text-xs text-brand-charcoal">Operator Dashboard</h3>
          <p className="text-[9px] text-brand-gray">12 Live Store CMS Modules</p>
          <div className="text-[10px] bg-slate-100 p-1.5 rounded-lg font-bold text-slate-700 mt-1">
            Total Sales: ₹{totalSales}
          </div>
        </div>

        <div className="glass-card rounded-2xl border-brand-pink/10 overflow-hidden text-[11px] font-bold flex flex-col bg-white">
          {[
            { id: "offers", label: "Scrolling Offers Banner", icon: Megaphone },
            { id: "hero", label: "Homepage Banner", icon: ImageIcon },
            { id: "campaigns", label: "Seasonal campaigns", icon: Calendar },
            { id: "trending_hampers", label: "Trending Hampers Management", icon: Layers },
            { id: "trending", label: "Trending Products", icon: Sparkles },
            { id: "gifts", label: "Gifts Catalog CRUD", icon: Sparkle },
            { id: "hampers", label: "Hamper Presets CRUD", icon: Layers },
            { id: "boxes", label: "Boxes Container CRUD", icon: Database },
            { id: "addons", label: "Accents & Addons CRUD", icon: Heart },
            { id: "showcase", label: "Surprise Page Showcase", icon: Gift },
            { id: "orders", label: "Unified Orders Queue", icon: PackageOpen },
            { id: "reviews", label: "Product Reviews Moderator", icon: Star },
            { id: "inventory", label: "Inventory Alerts & Stock", icon: Database },
            { id: "coupons", label: "Coupons & Discounts", icon: Ticket },
            { id: "customers", label: "Customers Directory", icon: Users },
            { id: "themes", label: "Surprise Page Themes", icon: Award },
            { id: "settings", label: "Delivery & Shiprocket Settings", icon: SettingsIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left py-3 px-4 hover:bg-brand-pinkLight transition-all flex items-center gap-2 border-b border-brand-pink/5 ${
                  isActive ? "bg-brand-pinkLight text-brand-pink border-l-4 border-l-brand-pink pl-3" : "text-brand-charcoal"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        <Link
          href="/"
          className="w-full py-3 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Admin panel
        </Link>
      </div>

      {/* RIGHT CMS PANEL WORKSPACE */}
      <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-3xl border-brand-pink/15 shadow-md bg-white space-y-6">
        
        {/* MODULE 1: OFFERS */}
        {activeTab === "offers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Scrolling Offers Banner</h2>
                <p className="text-[10px] text-brand-gray">Configure promo texts displaying in the top site scroller.</p>
              </div>
              <button
                onClick={handleAddOffer}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Offer Banner
              </button>
            </div>

            <div className="space-y-4">
              {offersList.map((offer) => (
                <div key={offer.id} className="p-4 border border-brand-pink/10 rounded-2xl bg-slate-50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Scrolling Alert Text</label>
                      <input
                        type="text"
                        value={offer.text}
                        onChange={(e) => handleUpdateOffer(offer.id, "text", e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Display Order</label>
                      <input
                        type="number"
                        value={offer.displayOrder}
                        onChange={(e) => handleUpdateOffer(offer.id, "displayOrder", parseInt(e.target.value) || 1)}
                        className="w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[9px] font-bold text-brand-gray">Text Color:</label>
                        <input
                          type="color"
                          value={offer.textColor}
                          onChange={(e) => handleUpdateOffer(offer.id, "textColor", e.target.value)}
                          className="w-6 h-6 border-0 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <label className="text-[9px] font-bold text-brand-gray">Background:</label>
                        <input
                          type="color"
                          value={offer.bgColor}
                          onChange={(e) => handleUpdateOffer(offer.id, "bgColor", e.target.value)}
                          className="w-6 h-6 border-0 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={offer.isEnabled}
                          onChange={(e) => handleUpdateOffer(offer.id, "isEnabled", e.target.checked)}
                          className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink"
                        />
                        Active
                      </label>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 2: HERO BANNER */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-brand-charcoal border-b border-brand-pink/5 pb-2">Homepage Hero Settings</h2>
              <p className="text-[10px] text-brand-gray">Customize the main landing slider headers, imagery, and redirects.</p>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Hero Main Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={heroSettings.title}
                    className="w-full text-xs p-3 rounded-xl border bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Subheading Caption</label>
                  <input
                    type="text"
                    name="subtitle"
                    defaultValue={heroSettings.subtitle}
                    className="w-full text-xs p-3 rounded-xl border bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Upload Background Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setHeroSettings(prev => ({ ...prev, image: event.target!.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs p-2 rounded-xl border bg-white focus:outline-none"
                  />
                  <input type="hidden" name="image" value={heroSettings.image || ""} />
                  {heroSettings.image && (
                    <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border bg-slate-100">
                      <img src={heroSettings.image} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Upload Background Video loop (Optional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setHeroSettings(prev => ({ ...prev, video: event.target!.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs p-2 rounded-xl border bg-white focus:outline-none"
                  />
                  <input type="hidden" name="video" value={heroSettings.video || ""} />
                  {heroSettings.video && (
                    <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border bg-slate-100">
                      <video src={heroSettings.video} className="w-full h-full object-cover" muted loop></video>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">CTA Button text</label>
                  <input
                    type="text"
                    name="ctaText"
                    defaultValue={heroSettings.ctaText}
                    className="w-full text-xs p-3 rounded-xl border bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">CTA Action Redirect Link</label>
                  <input
                    type="text"
                    name="ctaLink"
                    defaultValue={heroSettings.ctaLink}
                    className="w-full text-xs p-3 rounded-xl border bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Save Hero Settings Configuration
              </button>
            </form>
          </div>
        )}

        {/* MODULE 3: SEASONAL CAMPAIGNS */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Seasonal collections & Campaigns</h2>
                <p className="text-[10px] text-brand-gray">Turn special day campaign occasion cards on/off.</p>
              </div>
              <button
                onClick={handleAddCampaign}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Campaign Card
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campaignsList.map((camp) => (
                <div key={camp.id} className="p-4 border border-brand-pink/10 rounded-2xl bg-slate-50 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-brand-gray">Campaign / occasion Name</label>
                    <input
                      type="text"
                      value={camp.name}
                      onChange={(e) => handleUpdateCampaign(camp.id, "name", e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-brand-gray">URL Slug</label>
                    <input
                      type="text"
                      value={camp.slug}
                      onChange={(e) => handleUpdateCampaign(camp.id, "slug", e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-brand-gray">Banner Image Link</label>
                    <input
                      type="text"
                      value={camp.bannerImage}
                      onChange={(e) => handleUpdateCampaign(camp.id, "bannerImage", e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={camp.isEnabled}
                        onChange={(e) => handleUpdateCampaign(camp.id, "isEnabled", e.target.checked)}
                        className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink"
                      />
                      Show on Homepage
                    </label>
                    <button
                      onClick={() => handleDeleteCampaign(camp.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 4: TRENDING HAMPERS */}
        {activeTab === "trending_hampers" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-brand-charcoal border-b border-brand-pink/5 pb-2">Trending Hampers Management</h2>
              <p className="text-[10px] text-brand-gray">Control homepage trending status, display orders, prices, images, and details for ready-made preset hampers.</p>
            </div>

            <div className="space-y-3">
              {productsList.filter((p) => !p.is_hamper_item).map((p) => {
                const isTrending = p.tags.includes("Trending");
                return (
                  <div key={p.id} className="p-4 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover border bg-white" alt={p.name} />
                      <div>
                        <h4 className="font-bold text-xs text-brand-charcoal">{p.name}</h4>
                        <p className="text-[10px] text-slate-500">Preset Bundle | SKU: {p.id}</p>
                        <p className="text-[10px] text-brand-pink font-semibold">₹{p.price} | Stock: {getEffectiveStock(p.id, productsList)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-500">Display Order:</span>
                        <input
                          type="number"
                          value={p.trendingOrder || 0}
                          onChange={(e) => handleUpdateTrendingOrder(p.id, parseInt(e.target.value) || 0)}
                          className="w-14 p-1.5 border text-center rounded-lg text-xs bg-white focus:outline-none"
                        />
                      </div>
                      
                      <button
                        onClick={() => handleToggleTrending(p.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer ${
                          isTrending ? "bg-brand-pink text-white border-brand-pink" : "bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {isTrending ? "★ Trending" : "Mark Trending"}
                      </button>

                      <button
                        onClick={() => { setEditingProduct(p); setEditingItemType('product'); setIsAddingNewItem(false); setProductModalTab('basic'); setEditingManualReviewId(null); }}
                        className="px-3 py-1.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded-full text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULE 4B: TRENDING PRODUCTS */}
        {activeTab === "trending" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-brand-charcoal border-b border-brand-pink/5 pb-2">Trending Products Management</h2>
              <p className="text-[10px] text-brand-gray">Select which individual catalog gift items (is_hamper_item: true) carry the featured 'Trending' badge tags.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productsList.filter((p) => p.is_hamper_item).map((p) => {
                const isTrending = p.tags.includes("Trending");
                return (
                  <div key={p.id} className="p-3.5 border rounded-2xl flex items-center justify-between gap-4 bg-slate-50">
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-white" alt={p.name} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate text-brand-charcoal">{p.name}</h4>
                      <p className="text-[10px] text-brand-pink font-semibold">₹{p.price} | Stock: {p.stock}</p>
                    </div>
                    <button
                      onClick={() => handleToggleTrending(p.id)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all border cursor-pointer ${
                        isTrending ? "bg-brand-pink text-white border-brand-pink" : "bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isTrending ? "★ Trending" : "Mark Trending"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODULE 5: GIFTS CATALOG CRUD */}
        {activeTab === "gifts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Gifts Catalog Inventory</h2>
                <p className="text-[10px] text-brand-gray">CRUD items packed inside custom builder drawers (is_hamper_item: true).</p>
              </div>
              <button
                onClick={() => handleAddProduct(false)}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Gift Product
              </button>
            </div>

            <div className="space-y-3">
              {productsList.filter((p) => p.is_hamper_item).map((p) => (
                <div key={p.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-brand-charcoal">{p.name}</h4>
                      <p className="text-[10px] text-brand-gray capitalize">Category: {p.category} | SKU ID: {p.id}</p>
                      <strong className="text-xs text-brand-pink block mt-0.5">₹{p.price}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-500">Stock:</span>
                      <input
                        type="number"
                        value={p.stock}
                        onChange={(e) => handleUpdateProductStock(p.id, parseInt(e.target.value) || 0)}
                        className="w-16 p-1 border text-center rounded text-xs"
                      />
                    </div>
                    <button
                      onClick={() => { setEditingProduct(p); setEditingItemType('product'); setIsAddingNewItem(false); setProductModalTab('basic'); setEditingManualReviewId(null); }}
                      className="px-3 py-1.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded-xl text-[10px] font-bold transition-all"
                    >
                      Edit details
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 6: HAMPER PRESETS CRUD */}
        {activeTab === "hampers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Pre-Made Preset Gifting Hampers</h2>
                <p className="text-[10px] text-brand-gray">Ready-made bundle offers configured for instant purchase (is_hamper_item: false).</p>
              </div>
              <button
                onClick={() => handleAddProduct(true)}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Preset Hamper
              </button>
            </div>

            <div className="space-y-3">
              {productsList.filter((p) => !p.is_hamper_item).map((p) => (
                <div key={p.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-brand-charcoal">{p.name}</h4>
                      <p className="text-[10px] text-slate-500">Preset Bundle | SKU: {p.id}</p>
                      <strong className="text-xs text-brand-pink block mt-0.5">₹{p.price}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-[10px] text-brand-pink font-semibold bg-brand-pinkLight/50 px-2 py-1 rounded-lg">
                      Stock: {getEffectiveStock(p.id, productsList)} (derived)
                    </div>
                    <button
                      onClick={() => { setEditingProduct(p); setEditingItemType('product'); setIsAddingNewItem(false); setProductModalTab('basic'); setEditingManualReviewId(null); }}
                      className="px-3 py-1.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded-xl text-[10px] font-bold transition-all"
                    >
                      Edit Recipe / Details
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 7: BOXES CONTAINER CRUD */}
        {activeTab === "boxes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Gifting boxes & Containers</h2>
                <p className="text-[10px] text-brand-gray">Define size chests available at Step 1 of custom hamper builder.</p>
              </div>
              <button
                onClick={handleAddBox}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Container Box
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {boxesList.map((box) => (
                <div key={box.id} className="p-4 border rounded-2xl bg-slate-50 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={box.image} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-brand-charcoal">{box.name}</h4>
                      <p className="text-[10px] text-brand-gray">Size Dimensions: {box.size}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border text-center">
                      <span className="text-[8px] uppercase tracking-wider text-brand-gray block">Base Price</span>
                      <strong>₹{box.basePrice}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border text-center">
                      <span className="text-[8px] uppercase tracking-wider text-brand-gray block">Capacity Limit</span>
                      <strong>{box.maxItems} Items</strong>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDeleteBox(box.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded border border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 8: ACCENTS & ADDONS CRUD */}
        {activeTab === "addons" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Luxury Gifting Add-ons & Wrappings</h2>
                <p className="text-[10px] text-brand-gray">Manage extras catalog options (Lights, Flowers, Ribbon Bows).</p>
              </div>
              <button
                onClick={handleAddAddon}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Accents Option
              </button>
            </div>

            <div className="space-y-3">
              {addonsList.map((ad) => (
                <div key={ad.id} className="p-4 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={ad.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100"} className="w-12 h-12 rounded-xl object-cover border border-brand-pink/10 shadow-sm" alt={ad.name} />
                    <div>
                      <h4 className="font-bold text-xs text-brand-charcoal">{ad.name}</h4>
                      <p className="text-[10px] text-brand-pink font-semibold">₹{ad.price} | Stock: {ad.stock} remaining</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-500">Upload Image:</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                handleUpdateAddon(ad.id, "image", event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-40 sm:w-60 p-1 border rounded text-xs bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateAddonToggle(ad.id)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase border transition-all ${
                          ad.isEnabled ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {ad.isEnabled ? "🟢 Active" : "⚫ Disabled"}
                      </button>
                      <button
                        onClick={() => { setEditingProduct(ad); setEditingItemType('addon'); setIsAddingNewItem(false); setProductModalTab('basic'); setEditingManualReviewId(null); }}
                        className="px-3 py-1.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded-xl text-[10px] font-bold transition-all"
                      >
                        Edit Accent
                      </button>
                      <button
                        onClick={() => handleDeleteAddon(ad.id)}
                        className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 9: SURPRISE PAGE SHOWCASE */}
        {activeTab === "showcase" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Personalized Surprise Website Showcase</h2>
                <p className="text-[10px] text-brand-gray">Upload screenshots and video loop files highlighting sample creations near pricing.</p>
              </div>
              <button
                onClick={handleAddShowcase}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Design Asset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {showcaseList.map((media) => (
                <div key={media.id} className="p-3 border rounded-2xl bg-slate-50 flex flex-col justify-between">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black relative flex items-center justify-center">
                    {media.type === "video" ? (
                      <video src={media.url} className="w-full h-full object-cover" muted loop playsInline></video>
                    ) : (
                      <img src={media.url} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute top-2 left-2 bg-brand-charcoal/80 text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded">
                      {media.type}
                    </span>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-700 truncate max-w-[130px]">{media.title}</p>
                    <button
                      onClick={() => handleDeleteShowcase(media.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 10: UNIFIED ORDERS QUEUE */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Unified Order Fulfillment Queue</h2>
                <p className="text-[10px] text-brand-gray">Fulfill product hampers, custom packages, and surprise page requests.</p>
              </div>
            </div>

            {/* Sub-navigation inside Orders tab */}
            <div className="flex gap-2 border-b pb-3 border-brand-pink/5">
              <button
                onClick={() => setOrderSubTab("general")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  orderSubTab === "general" ? "bg-brand-pink text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Gifts & Hampers Orders ({ordersList.length})
              </button>
              <button
                onClick={() => setOrderSubTab("surprise")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  orderSubTab === "surprise" ? "bg-brand-pink text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Surprise Page Orders ({surpriseOrdersList.length})
              </button>
            </div>

            {orderSubTab === "general" ? (
              <div className="overflow-x-auto border rounded-2xl shadow-sm bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-brand-pink/10 text-[9px] font-bold uppercase text-brand-gray tracking-wider">
                      <th className="p-4">Order Details</th>
                      <th className="p-4">Delivery Address</th>
                      <th className="p-4">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedGeneralOrder(order)}
                        className="border-b border-brand-pink/5 hover:bg-slate-50/50 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-brand-charcoal text-xs">{order.orderNumber}</div>
                          <div className="text-[9px] text-slate-500">{order.date}</div>
                          <div className="text-[9px] text-slate-600 mt-1 bg-slate-100 p-1.5 rounded-lg space-y-0.5">
                            <div><strong>Pay ID:</strong> <span className="font-mono text-[8px]">{order.razorpayPaymentId || order.paymentId || "N/A"}</span></div>
                            <div><strong>RZP Order:</strong> <span className="font-mono text-[8px]">{order.razorpayOrderId || "N/A"}</span></div>
                          </div>
                          <div className="text-[10px] text-brand-pink font-semibold mt-1">₹{order.total}</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">
                            {order.items?.map((it: any, idx: number) => (
                              <span key={idx}>{it.name} x{it.qty} </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-brand-gray text-[10px] max-w-[200px]">
                          {order.address}
                        </td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(order.id, e.target.value as any);
                            }}
                            className="text-[10px] font-bold py-1.5 px-2 rounded-lg border border-brand-pink/20 bg-white"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-brand-pink/10 text-[9px] font-bold uppercase text-brand-gray tracking-wider">
                      <th className="p-4">Order # / Sender</th>
                      <th className="p-4">Receiver & WA</th>
                      <th className="p-4">Theme & Song</th>
                      <th className="p-4">Media uploads</th>
                      <th className="p-4">Fulfillment Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surpriseOrdersList.map((so) => {
                      const cleanPhone = so.whatsappNumber.replace(/\D/g, "");
                      const waLink = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}`;
                      return (
                        <tr
                          key={so.id}
                          onClick={() => setSelectedSurpriseOrder(so)}
                          className="border-b border-brand-pink/5 hover:bg-slate-50/50 cursor-pointer transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-bold text-brand-charcoal text-xs">{so.orderNumber}</div>
                            <div className="text-[9px] text-slate-500">{so.date}</div>
                            <div className="text-[9px] text-slate-600 mt-1 bg-slate-100 p-1.5 rounded-lg space-y-0.5">
                              <div><strong>Pay ID:</strong> <span className="font-mono text-[8px]">{so.razorpayPaymentId || so.paymentId || "N/A"}</span></div>
                              <div><strong>RZP Order:</strong> <span className="font-mono text-[8px]">{so.razorpayOrderId || "N/A"}</span></div>
                            </div>
                            <div className="font-bold text-slate-700 mt-1">From: {so.senderName}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-brand-pink">To: {so.receiverName}</div>
                            <div className="flex items-center gap-1 mt-1 text-[10px]">
                              <span>{so.whatsappNumber}</span>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded text-[9px] font-extrabold flex items-center gap-0.5"
                              >
                                💬 Chat
                              </a>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-brand-pinkLight text-brand-pink rounded-full text-[9px] font-bold uppercase">{so.theme}</span>
                            {so.songName && <div className="text-[10px] text-slate-600 font-semibold mt-1.5 truncate max-w-[120px]">{so.songName}</div>}
                          </td>
                          <td className="p-4 space-y-1 text-[9px] text-slate-600">
                            <div><strong>Photos:</strong> {so.photos?.length || 0} files</div>
                            <div><strong>Videos:</strong> {so.videos?.length || 0} files</div>
                            <div><strong>Audio:</strong> {so.audioFile || so.voiceRecording || "None"}</div>
                          </td>
                          <td className="p-4">
                            <select
                              value={so.orderStatus}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSurpriseStatusChange(so.id, e.target.value as any);
                              }}
                              className="text-[10px] font-bold py-1.5 px-2 rounded-lg border border-brand-pink/20 bg-white"
                            >
                              <option value="New Order">New Order</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODULE 11: COUPONS */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Secret Discount coupon Campaigns</h2>
                <p className="text-[10px] text-brand-gray">Create coupon codes for flat or percentage-based checkout discounts.</p>
              </div>
              <button
                onClick={handleAddCoupon}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Coupon Code
              </button>
            </div>

            <div className="space-y-3">
              {couponsList.map((cp) => (
                <div key={cp.code} className="p-4 border rounded-2xl flex items-center justify-between bg-slate-50">
                  <div>
                    <span className="bg-brand-pink text-white px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border shadow-sm">
                      {cp.code}
                    </span>
                    <p className="text-[10px] text-brand-gray mt-1.5">{cp.desc} (Min Order: ₹{cp.minOrder})</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-800">
                      {cp.type === "percent" ? `${cp.value}% Off` : `₹${cp.value} Flat Off`}
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(cp.code)}
                      className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODULE 12: CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Registered customer Directory</h2>
                <p className="text-[10px] text-brand-gray">Manage buyers database.</p>
              </div>
              <button
                onClick={handleAddCustomer}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Customer profile
              </button>
            </div>

            <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-brand-pink/10 text-[9px] font-bold uppercase text-brand-gray tracking-wider">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Mobile Number</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customersList.map((cust) => (
                    <tr key={cust.id} className="border-b border-brand-pink/5 hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-brand-charcoal">{cust.name || <span className="italic text-brand-gray">Not Set</span>}</td>
                      <td className="p-4 text-slate-600 font-semibold">{cust.phone || <span className="italic text-brand-gray">Not Set</span>}</td>
                      <td className="p-4 text-slate-600">{cust.email || <span className="italic text-brand-gray">—</span>}</td>
                      <td className="p-4 text-[10px] text-brand-gray">{cust.registeredDate || "—"}</td>
                      <td className="p-4 text-[10px] text-brand-gray">{cust.lastLogin || "—"}</td>
                      <td className="p-4 font-semibold text-brand-charcoal">{cust.totalOrders || 0}</td>
                      <td className="p-4 font-semibold text-brand-pink">₹{cust.totalAmountSpent || 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${cust.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                          {cust.status || "Active"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteCustomer(cust.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded border border-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULE: REVIEWS MODERATION PANEL */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-slide-up text-xs text-brand-charcoal">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Product Reviews Moderation Panel</h2>
                <p className="text-[10px] text-brand-gray font-medium">Moderate customer ratings, delete bad reviews, edit summaries, and write replies.</p>
              </div>
            </div>

            {/* FILTER HUD */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-2xl bg-slate-50/50">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Search by Name/Comment/SKU</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya, p1, wonderful"
                  value={reviewsSearch}
                  onChange={(e) => setReviewsSearch(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Filter by Stars Rating</label>
                <select
                  value={reviewsFilterRating}
                  onChange={(e) => setReviewsFilterRating(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none"
                >
                  <option value="all">All Star Scores</option>
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★☆ (4 Stars)</option>
                  <option value="3">★★★☆☆ (3 Stars)</option>
                  <option value="2">★★☆☆☆ (2 Stars)</option>
                  <option value="1">★☆☆☆☆ (1 Star)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Filter by Status</label>
                <select
                  value={reviewsFilterStatus}
                  onChange={(e) => setReviewsFilterStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none"
                >
                  <option value="all">All Reviews Statuses</option>
                  <option value="pending">Pending Moderation</option>
                  <option value="approved">Approved / Live</option>
                  <option value="rejected">Rejected / Hidden</option>
                </select>
              </div>
            </div>

            {/* REVIEWS GRID TABLE */}
            <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-brand-pink/10 text-[9px] font-bold uppercase text-brand-gray tracking-wider">
                    <th className="p-4">Gift Product</th>
                    <th className="p-4">Customer & Score</th>
                    <th className="p-4">Review Content</th>
                    <th className="p-4">Status & Response</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewsList
                    .filter(rev => {
                      const prod = productsList.find(p => p.id === rev.productId);
                      const prodName = prod ? prod.name : "";
                      const matchesSearch = 
                        rev.userName.toLowerCase().includes(reviewsSearch.toLowerCase()) ||
                        rev.comment.toLowerCase().includes(reviewsSearch.toLowerCase()) ||
                        (rev.title || "").toLowerCase().includes(reviewsSearch.toLowerCase()) ||
                        rev.productId.toLowerCase().includes(reviewsSearch.toLowerCase()) ||
                        prodName.toLowerCase().includes(reviewsSearch.toLowerCase());
                      
                      const matchesRating = reviewsFilterRating === "all" || rev.rating === reviewsFilterRating;
                      const matchesStatus = reviewsFilterStatus === "all" || (rev.status || "approved") === reviewsFilterStatus;
                      
                      return matchesSearch && matchesRating && matchesStatus;
                    })
                    .map((rev) => {
                      const product = productsList.find(p => p.id === rev.productId);
                      const statusVal = rev.status || "approved";
                      
                      return (
                        <tr key={rev.id} className="border-b border-brand-pink/5 hover:bg-slate-50/50">
                          <td className="p-4">
                            {product ? (
                              <div className="flex items-center gap-3">
                                <img src={product.image} className="w-10 h-10 rounded-xl object-cover border" />
                                <div>
                                  <div className="font-bold text-brand-charcoal">{product.name}</div>
                                  <div className="text-[10px] text-brand-gray">SKU: {product.id}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-red-500 font-semibold">Unknown Product ({rev.productId})</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {rev.userImage ? (
                                <img src={rev.userImage} className="w-6 h-6 rounded-full object-cover border" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-brand-pinkLight border border-brand-pink/20 text-brand-pink font-bold flex items-center justify-center text-[10px]">
                                  {rev.userName.slice(0, 1)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-brand-charcoal">{rev.userName}</div>
                                <div className="text-[10px] text-brand-gray">{rev.date || "2026-06-20"}</div>
                              </div>
                            </div>
                            <div className="text-amber-500 font-bold text-[10px] mt-1.5">
                              {"★".repeat(rev.rating)}
                            </div>
                          </td>
                          <td className="p-4 max-w-sm">
                            <div className="font-bold text-brand-charcoal">{rev.title || "No Title Summary"}</div>
                            <div className="text-slate-600 leading-relaxed mt-0.5">{rev.comment}</div>
                            {rev.photos && rev.photos.length > 0 && (
                              <div className="flex gap-1.5 mt-2">
                                {rev.photos.map((ph, idx) => (
                                  <img key={idx} src={ph} className="w-10 h-10 rounded border object-cover cursor-zoom-in" />
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div>
                              {statusVal === "approved" && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[9px] uppercase">🔴 Live</span>}
                              {statusVal === "pending" && <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 font-bold text-[9px] uppercase">🟠 Pending</span>}
                              {statusVal === "rejected" && <span className="px-2 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 font-bold text-[9px] uppercase">⚫ Hidden</span>}
                            </div>
                            
                            {rev.reply && (
                              <div className="mt-2 p-2 bg-slate-50 border rounded-xl max-w-xs text-[10px]">
                                <span className="font-bold text-brand-pink">Store Owner Reply: </span>
                                <span className="text-slate-600">{rev.reply}</span>
                              </div>
                            )}

                            {replyingReviewId === rev.id ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const text = (e.currentTarget.querySelector("textarea") as HTMLTextAreaElement).value;
                                  const updated = reviewsList.map(r => r.id === rev.id ? { ...r, reply: text } : r);
                                  setReviewsList(updated);
                                  setReviews(updated);
                                  setReplyingReviewId(null);
                                }}
                                className="mt-2 space-y-1.5"
                              >
                                <textarea placeholder="Write owner response..." defaultValue={rev.reply || ""} rows={2} className="w-full p-2 border rounded text-[10px]" required />
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => setReplyingReviewId(null)} className="px-2 py-1 border rounded text-[9px] font-bold bg-white text-slate-500">Cancel</button>
                                  <button type="submit" className="px-2 py-1 bg-brand-pink text-white rounded text-[9px] font-bold border-0">Submit Reply</button>
                                </div>
                              </form>
                            ) : (
                              <button
                                onClick={() => setReplyingReviewId(rev.id)}
                                className="mt-2 text-[9px] font-bold text-brand-pink hover:underline flex items-center gap-0.5"
                              >
                                💬 {rev.reply ? "Edit Owner Response" : "Reply to Customer"}
                              </button>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {statusVal !== "approved" && (
                                <button
                                  onClick={() => {
                                    const updated = reviewsList.map(r => r.id === rev.id ? { ...r, status: "approved" as const } : r);
                                    setReviewsList(updated);
                                    setReviews(updated);
                                  }}
                                  className="px-2 py-1.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 font-bold text-[10px] hover:bg-emerald-100/50"
                                >
                                  Approve
                                </button>
                              )}
                              {statusVal !== "rejected" && (
                                <button
                                  onClick={() => {
                                    const updated = reviewsList.map(r => r.id === rev.id ? { ...r, status: "rejected" as const } : r);
                                    setReviewsList(updated);
                                    setReviews(updated);
                                  }}
                                  className="px-2 py-1.5 bg-amber-50 text-amber-600 rounded border border-amber-100 font-bold text-[10px] hover:bg-amber-100/50"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => setEditingReview(rev)}
                                className="p-1.5 text-brand-pink hover:bg-brand-pinkLight rounded border border-brand-pink/10 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  openDeleteConfirm("Customer Review", () => {
                                    const updated = reviewsList.filter(r => r.id !== rev.id);
                                    setReviewsList(updated);
                                    setReviews(updated);
                                    showToast("Item deleted successfully.");
                                  });
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded border border-red-100 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

                {/* MODULE: INVENTORY MANAGEMENT */}
        {activeTab === "inventory" && (
          <div className="space-y-6 animate-slide-up text-xs text-brand-charcoal">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Unified Inventory Management & Alerts</h2>
                <p className="text-[10px] text-brand-gray font-medium">Consolidated directory to track stock limits, modify alert thresholds, and update availability status.</p>
              </div>
              <button
                onClick={() => {
                  alert("Stock limits synchronized successfully!");
                }}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all cursor-pointer"
              >
                💾 Save Stock Counts
              </button>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-2xl bg-slate-50/50">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Search by Name or SKU</label>
                <input
                  type="text"
                  placeholder="e.g. p1, roses, box-1"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Filter by Stock Alerts</label>
                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => setInventoryStatusFilter(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none"
                >
                  <option value="all">All Inventory Items</option>
                  <option value="low">⚠️ Low Stock Alerts</option>
                  <option value="out">⚫ Out of Stock (0 Count)</option>
                </select>
              </div>
            </div>

            {/* INVENTORY DATA GRID */}
            <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-brand-pink/10 text-[9px] font-bold uppercase text-brand-gray tracking-wider">
                    <th className="p-4">Catalog Item Type</th>
                    <th className="p-4">Details Name</th>
                    <th className="p-4">SKU Code</th>
                    <th className="p-4">Alert Threshold</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...productsList.map(p => ({ ...p, type: p.is_hamper_item ? "Gift Item" : "Gift Hamper" })),
                    ...boxesList.map(b => ({ ...b, type: "Box Container", is_hamper_item: false })),
                    ...addonsList.map(ad => ({ ...ad, type: ad.isEnabled ? "Accent / Add-on" : "Accent (Disabled)", price: ad.price }))
                  ]
                    .filter(item => {
                      const matchesSearch = 
                        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                        item.id.toLowerCase().includes(inventorySearch.toLowerCase());
                      
                      const alertLimit = item.lowStockAlert || 5;
                      const matchesAlert = 
                        inventoryStatusFilter === "all" ||
                        (inventoryStatusFilter === "low" && (item.stock || 0) <= alertLimit) ||
                        (inventoryStatusFilter === "out" && (item.stock || 0) === 0);

                      return matchesSearch && matchesAlert;
                    })
                    .map((item, idx) => {
                      const alertLimit = item.lowStockAlert || 5;
                      const isLow = (item.stock || 0) <= alertLimit;
                      const isOut = (item.stock || 0) === 0;

                      return (
                        <tr key={idx} className="border-b border-brand-pink/5 hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-500 uppercase text-[9px]">{item.type}</td>
                          <td className="p-4 flex items-center gap-3">
                            <img src={item.image} className="w-8 h-8 rounded-lg object-cover border" />
                            <span className="font-semibold text-brand-charcoal text-xs">{item.name}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-[10px] text-slate-600">{item.id}</td>
                          <td className="p-4">
                            <input
                              type="number"
                              defaultValue={alertLimit}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (item.type.includes("Gift")) {
                                  setProductsList(productsList.map(p => p.id === item.id ? { ...p, lowStockAlert: val } : p));
                                } else if (item.type.includes("Box")) {
                                  setBoxesList(boxesList.map(b => b.id === item.id ? { ...b, lowStockAlert: val } : b));
                                } else {
                                  setAddonsList(addonsList.map(ad => ad.id === item.id ? { ...ad, lowStockAlert: val } : ad));
                                }
                              }}
                              className="w-14 p-1.5 border text-center rounded bg-slate-55 text-xs text-brand-charcoal"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              defaultValue={item.stock || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (item.type.includes("Gift")) {
                                  setProductsList(productsList.map(p => p.id === item.id ? { ...p, stock: val } : p));
                                } else if (item.type.includes("Box")) {
                                  setBoxesList(boxesList.map(b => b.id === item.id ? { ...b, stock: val } : b));
                                } else {
                                  setAddonsList(addonsList.map(ad => ad.id === item.id ? { ...ad, stock: val } : ad));
                                }
                              }}
                              className="w-16 p-1.5 border text-center rounded bg-slate-55 text-xs text-brand-charcoal font-bold text-brand-pink"
                            />
                          </td>
                          <td className="p-4">
                            {isOut ? (
                              <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 font-extrabold text-[8px] uppercase">⚫ Out of Stock</span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 font-extrabold text-[8px] uppercase">⚠️ Low Stock Alert</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold text-[8px] uppercase">🟢 In Stock</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setEditingProduct(item);
                                setEditingItemType(item.type.includes("Gift") ? "product" : item.type.includes("Box") ? "box" : "addon");
                                setIsAddingNewItem(false);
                                setProductModalTab("basic");
                              }}
                              className="px-2.5 py-1.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded font-bold text-[9px]"
                            >
                              Edit Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Delivery & Shiprocket Settings</h2>
                <p className="text-[10px] text-brand-gray">Configure dynamic shipping rates and official Shiprocket API sync credentials.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
              {/* Delivery rates card */}
              <div className="glass-card p-6 rounded-3xl border-brand-pink/10 bg-white space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-brand-pink">Delivery Charges Management</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">Delivery Charge (₹)</label>
                    <input
                      type="number"
                      value={storeSettings?.deliveryCharge || 0}
                      onChange={(e) => setStoreSettings({ ...storeSettings, deliveryCharge: Number(e.target.value) })}
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">Free Delivery Threshold (₹)</label>
                    <input
                      type="number"
                      value={storeSettings?.freeShippingThreshold || 0}
                      onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="free-delivery-enabled"
                    checked={storeSettings?.freeShippingEnabled || false}
                    onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingEnabled: e.target.checked })}
                    className="rounded text-brand-pink focus:ring-brand-pink"
                  />
                  <label htmlFor="free-delivery-enabled" className="text-xs font-semibold text-brand-charcoal">
                    Enable Free Delivery (above threshold)
                  </label>
                </div>
              </div>

              {/* Shiprocket integration card */}
              <div className="glass-card p-6 rounded-3xl border-brand-pink/10 bg-white space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-brand-pink">Shiprocket Integration API</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">Shiprocket Account Email</label>
                    <input
                      type="email"
                      value={storeSettings?.shiprocketEmail || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, shiprocketEmail: e.target.value })}
                      placeholder="e.g. shipping@lovespy.in"
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">Shiprocket Password</label>
                    <input
                      type="password"
                      value={storeSettings?.shiprocketPassword || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, shiprocketPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                    />
                  </div>
                  {storeSettings?.shiprocketToken && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">Shiprocket Authentication Token</label>
                      <input
                        type="text"
                        value={storeSettings.shiprocketToken}
                        readOnly
                        className="w-full text-[10px] font-mono p-3 rounded-xl border bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Twilio SMS gateway card */}
              <div className="glass-card p-6 rounded-3xl border border-brand-pink/10 bg-white space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-brand-pink">Twilio SMS Gateway API</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">Twilio Account SID</label>
                    <input
                      type="text"
                      value={storeSettings?.twilioAccountSid || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, twilioAccountSid: e.target.value })}
                      placeholder="e.g. ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">Twilio Auth Token</label>
                    <input
                      type="password"
                      value={storeSettings?.twilioAuthToken || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, twilioAuthToken: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">Twilio From Phone Number</label>
                    <input
                      type="text"
                      value={storeSettings?.twilioFromNumber || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, twilioFromNumber: e.target.value })}
                      placeholder="e.g. +1234567890"
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* SMTP Gateway card */}
              <div className="glass-card p-6 rounded-3xl border border-brand-pink/10 bg-white space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-brand-pink">SMTP Transactional Email Gateway</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">SMTP Host</label>
                      <input
                        type="text"
                        value={storeSettings?.smtpHost || ""}
                        onChange={(e) => setStoreSettings({ ...storeSettings, smtpHost: e.target.value })}
                        placeholder="e.g. smtp.gmail.com"
                        className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">SMTP Port</label>
                      <input
                        type="number"
                        value={storeSettings?.smtpPort || 587}
                        onChange={(e) => setStoreSettings({ ...storeSettings, smtpPort: Number(e.target.value) })}
                        placeholder="587"
                        className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">SMTP Username</label>
                    <input
                      type="text"
                      value={storeSettings?.smtpUser || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, smtpUser: e.target.value })}
                      placeholder="e.g. sender@gmail.com"
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">SMTP Password</label>
                    <input
                      type="password"
                      value={storeSettings?.smtpPass || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, smtpPass: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">SMTP From Address</label>
                    <input
                      type="text"
                      value={storeSettings?.smtpFrom || ""}
                      onChange={(e) => setStoreSettings({ ...storeSettings, smtpFrom: e.target.value })}
                      placeholder="e.g. Lovespy Gifting <no-reply@lovespy.in>"
                      className="w-full text-xs p-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-pink text-white rounded-full text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all cursor-pointer border-0"
                >
                  Save Store Settings
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingSrConnection}
                  className="px-6 py-3 bg-brand-charcoal text-white rounded-full text-xs font-bold hover:shadow-lg hover:shadow-brand-charcoal/20 transition-all cursor-pointer border-0 disabled:opacity-50"
                >
                  {testingSrConnection ? "Testing..." : "Test Connection"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* THEMES TAB */}
        {activeTab === "themes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-brand-pink/5 pb-2">
              <div>
                <h2 className="font-display font-bold text-lg text-brand-charcoal">Surprise Page Themes</h2>
                <p className="text-[10px] text-brand-gray">Create and manage the animated themes customers can pick in Step 4 of the Hamper Builder.</p>
              </div>
              <button
                onClick={() => {
                  const newTheme = addTheme({
                    name: "New Theme",
                    description: "A beautiful theme",
                    bgColor: "linear-gradient(135deg, #f9c4d2, #fde8f0)",
                    decorations: "✨",
                    previewColor: "#f472b6"
                  });
                  setThemesList(getThemes());
                }}
                className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:shadow-md transition-all flex items-center gap-1 cursor-pointer border-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Theme
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themesList.map((theme) => (
                <div key={theme.id} className="border border-brand-pink/10 rounded-2xl overflow-hidden shadow-sm">
                  {/* Preview bar */}
                  <div
                    className="h-10 w-full flex items-center justify-center text-white text-lg"
                    style={{ background: theme.bgColor }}
                  >
                    {theme.decorations || "🎁"}
                  </div>
                  <div className="p-4 space-y-3 bg-white">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Theme Name</label>
                      <input
                        type="text"
                        value={theme.name}
                        onChange={(e) => {
                          updateTheme(theme.id, { name: e.target.value });
                          setThemesList(getThemes());
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border border-brand-pink/20 focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Description</label>
                      <input
                        type="text"
                        value={theme.description}
                        onChange={(e) => {
                          updateTheme(theme.id, { description: e.target.value });
                          setThemesList(getThemes());
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border border-brand-pink/20 focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                    {/* Background gradient / color */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Background (CSS gradient or color)</label>
                      <input
                        type="text"
                        value={theme.bgColor}
                        onChange={(e) => {
                          updateTheme(theme.id, { bgColor: e.target.value });
                          setThemesList(getThemes());
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border border-brand-pink/20 font-mono focus:outline-none focus:border-brand-pink"
                        placeholder="e.g. linear-gradient(135deg, #f9c4d2, #fde8f0)"
                      />
                    </div>
                    {/* Background image URL */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Background Image URL (optional)</label>
                      <input
                        type="text"
                        value={theme.bgImage || ""}
                        onChange={(e) => {
                          updateTheme(theme.id, { bgImage: e.target.value });
                          setThemesList(getThemes());
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border border-brand-pink/20 focus:outline-none focus:border-brand-pink"
                        placeholder="https://..."
                      />
                    </div>
                    {/* Decorations & preview color row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-brand-gray">Decorations (emojis)</label>
                        <input
                          type="text"
                          value={theme.decorations || ""}
                          onChange={(e) => {
                            updateTheme(theme.id, { decorations: e.target.value });
                            setThemesList(getThemes());
                          }}
                          className="w-full text-xs p-2.5 rounded-lg border border-brand-pink/20 focus:outline-none focus:border-brand-pink"
                          placeholder="🌹💕"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-brand-gray">Card Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.previewColor || "#f472b6"}
                            onChange={(e) => {
                              updateTheme(theme.id, { previewColor: e.target.value });
                              setThemesList(getThemes());
                            }}
                            className="w-10 h-9 rounded-lg border border-brand-pink/20 cursor-pointer p-0.5"
                          />
                          <span className="text-[10px] font-mono text-slate-500">{theme.previewColor || "#f472b6"}</span>
                        </div>
                      </div>
                    </div>
                    {/* Delete */}
                    <button
                      onClick={() => {
                        openDeleteConfirm(`Theme “${theme.name}”`, () => {
                          deleteTheme(theme.id);
                          setThemesList(getThemes());
                          showToast("Item deleted successfully.");
                        });
                      }}
                      className="w-full py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-[10px] font-bold transition-all cursor-pointer bg-white flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Theme
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {themesList.length === 0 && (
              <div className="text-center py-12 text-brand-gray text-xs">
                <Award className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No themes yet.</p>
                <p className="text-[10px] mt-1">Click <strong>Add Theme</strong> to create your first wish theme.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* General Order Details Modal */}
      {selectedGeneralOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-brand-pink/15 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedGeneralOrder(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-brand-charcoal transition-colors border-0 cursor-pointer bg-white"
            >
              ✕
            </button>
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink/15">
                Standard Order Details
              </span>
              <h3 className="font-display font-bold text-xl text-brand-charcoal mt-2.5">
                {selectedGeneralOrder.orderNumber}
              </h3>
              <p className="text-[10px] text-brand-gray font-medium">Placed on {selectedGeneralOrder.date}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-brand-charcoal">
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-2">
                  <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Customer Contact</h4>
                  <p><strong>Name:</strong> {selectedGeneralOrder.deliveryName || "N/A"}</p>
                  <p><strong>Phone:</strong> {selectedGeneralOrder.deliveryPhone || "N/A"}</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-2">
                  <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Shipping Address</h4>
                  <p className="text-brand-gray leading-relaxed">
                    {selectedGeneralOrder.address || `${selectedGeneralOrder.deliveryLine1}, ${selectedGeneralOrder.deliveryLine2 || ''}, ${selectedGeneralOrder.deliveryCity}, ${selectedGeneralOrder.deliveryState} - ${selectedGeneralOrder.deliveryPincode}`}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-2">
                  <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Transaction Info</h4>
                  <p><strong>Payment Status:</strong> <span className="font-bold text-emerald-600 uppercase">{selectedGeneralOrder.status === "confirmed" || selectedGeneralOrder.status === "delivered" || selectedGeneralOrder.status === "shipped" || selectedGeneralOrder.status === "packed" || selectedGeneralOrder.status === "out_for_delivery" ? "Paid" : "Pending"}</span></p>
                  <p><strong>Payment Method:</strong> Razorpay Secured API</p>
                  <p><strong>Razorpay Pay ID:</strong> <span className="font-mono text-[10px]">{selectedGeneralOrder.razorpayPaymentId || selectedGeneralOrder.paymentId || "N/A"}</span></p>
                  <p><strong>Razorpay Order ID:</strong> <span className="font-mono text-[10px]">{selectedGeneralOrder.razorpayOrderId || "N/A"}</span></p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-3">
                  <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Shiprocket Logistics Integration</h4>
                  <div className="space-y-1">
                    <p><strong>Shiprocket ID:</strong> <span className="font-mono">{selectedGeneralOrder.shiprocketOrderId || "Not Created"}</span></p>
                    <p><strong>Shiprocket Status:</strong> <span className="font-bold text-brand-lavender">{selectedGeneralOrder.shiprocketStatus || "Awaiting Dispatch"}</span></p>
                    <p><strong>AWB Number:</strong> <span className="font-mono">{selectedGeneralOrder.shiprocketAwb || "Not Assigned"}</span></p>
                    {selectedGeneralOrder.shiprocketCourier && <p><strong>Courier:</strong> {selectedGeneralOrder.shiprocketCourier}</p>}
                    {selectedGeneralOrder.shiprocketDispatchDate && <p><strong>Dispatch Date:</strong> {selectedGeneralOrder.shiprocketDispatchDate}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 space-y-2">
                    {!selectedGeneralOrder.shiprocketOrderId && (
                      <button
                        onClick={() => handleDispatchShiprocket(selectedGeneralOrder.id)}
                        disabled={dispatchingOrder === selectedGeneralOrder.id}
                        className="w-full py-2 bg-brand-pink text-white font-bold text-[10px] uppercase tracking-wider rounded-lg border-0 cursor-pointer hover:bg-brand-pink/90 transition-colors disabled:opacity-50"
                      >
                        {dispatchingOrder === selectedGeneralOrder.id ? "Dispatching..." : "Dispatch Order (Shiprocket)"}
                      </button>
                    )}

                    {selectedGeneralOrder.shiprocketOrderId && !selectedGeneralOrder.shiprocketAwb && (
                      <button
                        onClick={() => handleGenerateAWB(selectedGeneralOrder.id)}
                        disabled={generatingAwb === selectedGeneralOrder.id}
                        className="w-full py-2 bg-brand-pink text-white font-bold text-[10px] uppercase tracking-wider rounded-lg border-0 cursor-pointer hover:bg-brand-pink/90 transition-colors disabled:opacity-50"
                      >
                        {generatingAwb === selectedGeneralOrder.id ? "Generating AWB..." : "Generate AWB"}
                      </button>
                    )}

                    {selectedGeneralOrder.shiprocketAwb && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handlePrintLabel(selectedGeneralOrder.id)}
                          className="w-full py-2 bg-brand-charcoal text-white font-bold text-[10px] uppercase tracking-wider rounded-lg border-0 cursor-pointer hover:bg-brand-charcoal/90 transition-colors"
                        >
                          Print Shipping Label
                        </button>

                        <div className="space-y-1.5 pt-1">
                          <label className="text-[9px] font-bold text-brand-gray uppercase">Update Shiprocket Status</label>
                          <select
                            value={selectedGeneralOrder.shiprocketStatus || "Processing"}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              const mainStatusMap: Record<string, string> = {
                                "Processing": "confirmed",
                                "Packed": "packed",
                                "Shipped": "shipped",
                                "In Transit": "shipped",
                                "Out For Delivery": "out_for_delivery",
                                "Delivered": "delivered"
                              };
                              const updates = {
                                shiprocketStatus: newStatus as any,
                                status: mainStatusMap[newStatus] as any
                              };
                              await updateOrderDetails(selectedGeneralOrder.id, updates);
                              
                              const freshOrders = getOrders();
                              setOrdersList([...freshOrders]);
                              const updatedOrder = freshOrders.find((o: any) => o.id === selectedGeneralOrder.id);
                              if (updatedOrder) {
                                setSelectedGeneralOrder(updatedOrder);
                              }
                            }}
                            className="w-full text-[10px] font-bold py-1.5 px-2 rounded-lg border border-brand-pink/20 bg-white"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Out For Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-brand-pink/5 pt-4 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-charcoal">Ordered Items & Customizations</h4>
              <div className="space-y-3">
                {selectedGeneralOrder.items?.map((item: any, idx: number) => {
                  const isCustom = item.type === "custom-hamper";
                  return (
                    <div key={idx} className="bg-slate-50 border border-brand-pink/5 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-brand-charcoal">{item.name}</p>
                          <p className="text-[10px] text-brand-gray">Quantity: {item.qty}</p>
                        </div>
                        <span className="font-bold text-brand-pink">₹{item.price * item.qty}</span>
                      </div>

                      {isCustom && item.details && (
                        <div className="pl-4 border-l-2 border-brand-pink/15 text-[10px] text-slate-600 space-y-1 mt-2">
                          <p><strong>Box:</strong> {item.details.box?.name || "Standard Box"} (+₹{item.details.box?.basePrice || 0})</p>
                          
                          {item.details.items && item.details.items.length > 0 && (
                            <div>
                              <strong>Hamper Products:</strong>
                              <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                                {item.details.items.map((it: any, i: number) => (
                                  <li key={i}>{it.name} (x{it.qty}) - ₹{it.price}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.details.personalization && (
                            <div className="space-y-0.5">
                              <strong>Personalization:</strong>
                              {item.details.personalization.photos?.length > 0 && (
                                <p>• Polaroid Magnet Photos ({item.details.personalization.photos.length} uploaded) - ₹{item.details.personalization.photos.length * 15}</p>
                              )}
                              {item.details.personalization.voiceQrAttached && (
                                <p>• Custom Voice Message QR Attached - ₹25</p>
                              )}
                              {item.details.personalization.decorations && Object.values(item.details.personalization.decorations).some(Boolean) && (
                                <div>
                                  <span className="font-semibold">Accents:</span>
                                  <span className="pl-1">
                                    {item.details.personalization.decorations["ad-1"] && "Fairy Lights (₹99), "}
                                    {item.details.personalization.decorations["ad-2"] && "Pastel Breaths (₹149), "}
                                    {item.details.personalization.decorations["ad-3"] && "Red Ribbon (₹49), "}
                                    {item.details.personalization.decorations["ad-4"] && "Stickers Pack (₹29), "}
                                    {item.details.personalization.decorations["ad-5"] && "Velvet Wrap (₹199)"}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-brand-pinkLight/30 border border-brand-pink/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">₹{selectedGeneralOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Custom Logistics (Shipping):</span>
                <span className="font-semibold">₹{selectedGeneralOrder.shippingCharge || 0}</span>
              </div>
              {selectedGeneralOrder.discountAmount > 0 && (
                <div className="flex justify-between text-brand-pink font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-₹{selectedGeneralOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-dashed border-brand-pink/15 pt-2 text-sm font-bold text-brand-pink">
                <span>Payable Total:</span>
                <span>₹{selectedGeneralOrder.totalAmount || selectedGeneralOrder.total}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.open(`/api/shiprocket/invoice?orderId=${selectedGeneralOrder.id}`, "_blank")}
                  className="px-5 py-2.5 bg-brand-charcoal text-white rounded-full text-xs font-bold hover:bg-brand-charcoal/90 transition-colors border-0 cursor-pointer"
                >
                  Print Invoice
                </button>
                {(selectedGeneralOrder.status === "delivered" || selectedGeneralOrder.shiprocketStatus === "Delivered") && (
                  <button
                    type="button"
                    onClick={() => handleInitiateReturn(selectedGeneralOrder.id)}
                    disabled={initiatingReturn === selectedGeneralOrder.id}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-colors border-0 cursor-pointer disabled:opacity-50"
                  >
                    {initiatingReturn === selectedGeneralOrder.id ? "Initiating..." : "Return Order"}
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedGeneralOrder(null)}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-slate-700 transition-colors border-0 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Surprise Page Order Details Modal */}
      {selectedSurpriseOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-brand-pink/15 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-brand-charcoal text-xs">
            <button
              onClick={() => setSelectedSurpriseOrder(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-brand-charcoal transition-colors border-0 cursor-pointer bg-white"
            >
              ✕
            </button>
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink/15">
                Custom Surprise Page Request
              </span>
              <h3 className="font-display font-bold text-xl text-brand-charcoal mt-2.5">
                {selectedSurpriseOrder.orderNumber}
              </h3>
              <p className="text-[10px] text-brand-gray font-medium">Placed on {selectedSurpriseOrder.date}</p>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-2">
                <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Sender Profile</h4>
                <p><strong>Name:</strong> {selectedSurpriseOrder.senderName}</p>
                <p><strong>Mobile:</strong> {selectedSurpriseOrder.mobileNumber}</p>
                <p><strong>Email:</strong> {selectedSurpriseOrder.email}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-2">
                <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Receiver (Gifter Target)</h4>
                <p><strong>Name:</strong> {selectedSurpriseOrder.receiverName}</p>
                <p><strong>WhatsApp:</strong> {selectedSurpriseOrder.whatsappNumber}</p>
                <div className="pt-1">
                  <a
                    href={`https://wa.me/${selectedSurpriseOrder.whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                  >
                    💬 Contact via WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Campaign Options / Song / Themes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-2">
                <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Surprise Theme & Ideas</h4>
                <p><strong>Selected Theme:</strong> <span className="font-bold uppercase text-brand-pink">{selectedSurpriseOrder.theme || selectedSurpriseOrder.themeRequest}</span></p>
                {selectedSurpriseOrder.customThemeIdea && (
                  <p><strong>Custom Theme Concept:</strong> {selectedSurpriseOrder.customThemeIdea}</p>
                )}
                {selectedSurpriseOrder.instructions && (
                  <p><strong>Design Instructions:</strong> {selectedSurpriseOrder.instructions}</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-2">
                <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Spotify & Dedicated Song</h4>
                <p><strong>Song:</strong> {selectedSurpriseOrder.songName || "No specific track selected"}</p>
                {selectedSurpriseOrder.songUrl && (
                  <p>
                    <strong>URL:</strong>{" "}
                    <a
                      href={selectedSurpriseOrder.songUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-pink font-semibold hover:underline"
                    >
                      Open Spotify Link ↗
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Messages Content */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-3">
              <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Customer Messages Content</h4>
              {selectedSurpriseOrder.messages?.main && (
                <div>
                  <p className="font-semibold text-slate-700 text-[10px] uppercase">Main Caption Card</p>
                  <p className="bg-white border p-2.5 rounded-xl mt-1 text-slate-600 italic">"{selectedSurpriseOrder.messages.main}"</p>
                </div>
              )}
              {selectedSurpriseOrder.messages?.loveLetter && (
                <div>
                  <p className="font-semibold text-slate-700 text-[10px] uppercase">Personal Love Letter / Text</p>
                  <p className="bg-white border p-2.5 rounded-xl mt-1 text-slate-600 whitespace-pre-line">
                    {selectedSurpriseOrder.messages.loveLetter}
                  </p>
                </div>
              )}
              {selectedSurpriseOrder.messages?.birthdayWish && (
                <div>
                  <p className="font-semibold text-slate-700 text-[10px] uppercase">Birthday Wish</p>
                  <p className="bg-white border p-2.5 rounded-xl mt-1 text-slate-600">"{selectedSurpriseOrder.messages.birthdayWish}"</p>
                </div>
              )}
              {selectedSurpriseOrder.messages?.anniversaryWish && (
                <div>
                  <p className="font-semibold text-slate-700 text-[10px] uppercase">Anniversary Wish</p>
                  <p className="bg-white border p-2.5 rounded-xl mt-1 text-slate-600">"{selectedSurpriseOrder.messages.anniversaryWish}"</p>
                </div>
              )}
            </div>

            {/* Media Uploads Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-brand-pink/5 space-y-4">
              <h4 className="font-bold text-brand-pink text-[11px] uppercase tracking-wider">Uploaded Files & Media</h4>
              
              {/* Photo Previews */}
              {selectedSurpriseOrder.photos?.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="font-bold text-[10px] uppercase text-brand-gray">Polaroid Photos Grid ({selectedSurpriseOrder.photos.length})</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedSurpriseOrder.photos.map((url: string, index: number) => (
                      <a href={url} target="_blank" rel="noopener noreferrer" key={index} className="group relative block aspect-square rounded-xl overflow-hidden border bg-slate-200">
                        <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">View ↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic text-[10px]">No photos uploaded.</p>
              )}

              {/* Video List */}
              {selectedSurpriseOrder.videos?.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-200/60">
                  <p className="font-bold text-[10px] uppercase text-brand-gray">Uploaded Videos</p>
                  <div className="space-y-1.5">
                    {selectedSurpriseOrder.videos.map((vid: string, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-white p-2 rounded-xl border">
                        <span className="font-mono text-[10px] text-slate-600 truncate max-w-[200px]">{vid}</span>
                        <a href={vid.startsWith("http") ? vid : "#"} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-brand-pinkLight hover:bg-brand-pink text-brand-pink hover:text-white transition-colors rounded text-[9px] font-extrabold">
                          Download File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio files */}
              {(selectedSurpriseOrder.audioFile || selectedSurpriseOrder.voiceRecording || selectedSurpriseOrder.audio) && (
                <div className="space-y-1 pt-2 border-t border-slate-200/60">
                  <p className="font-bold text-[10px] uppercase text-brand-gray">Dedicated Audio / Voice Note</p>
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border">
                    <span className="font-mono text-[10px] text-slate-600 truncate max-w-[200px]">{selectedSurpriseOrder.audioFile || selectedSurpriseOrder.voiceRecording || selectedSurpriseOrder.audio}</span>
                    <a href={selectedSurpriseOrder.audioFile || selectedSurpriseOrder.voiceRecording || selectedSurpriseOrder.audio || "#"} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-brand-pinkLight hover:bg-brand-pink text-brand-pink hover:text-white transition-colors rounded text-[9px] font-extrabold">
                      Play / Download Audio
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction info */}
            <div className="bg-brand-pinkLight/30 border border-brand-pink/10 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Digital Surprise Page Setup Fee:</span>
                <span className="font-bold text-brand-pink">₹{selectedSurpriseOrder.price || 299}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment ID:</span>
                <span className="font-mono">{selectedSurpriseOrder.razorpayPaymentId || selectedSurpriseOrder.paymentId || "N/A"}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-brand-pink/15 pt-2 items-center">
                <span className="font-bold text-brand-charcoal">Fulfillment Status:</span>
                <select
                  value={selectedSurpriseOrder.orderStatus}
                  onChange={(e) => {
                    const updated = { ...selectedSurpriseOrder, orderStatus: e.target.value };
                    handleUpdateFullSurpriseOrder(updated);
                    setSelectedSurpriseOrder(updated);
                  }}
                  className="text-[10px] font-bold py-1.5 px-2 rounded-lg border border-brand-pink/20 bg-white"
                >
                  <option value="New Order">New Order</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSurpriseOrder(null)}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-slate-700 transition-colors border-0 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Edit Product/Hamper Details Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white rounded-3xl border border-brand-pink/15 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-brand-charcoal text-xs">
            <button
              onClick={() => { setEditingProduct(null); setEditingItemType(null); setIsAddingNewItem(false); }}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-brand-charcoal transition-colors border-0 cursor-pointer bg-white"
            >
              ✕
            </button>
            
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink/15">
                {isAddingNewItem ? "Add New Catalog Item" : `Edit Catalog ${editingItemType?.toUpperCase()} Settings`}
              </span>
              <h3 className="font-display font-bold text-xl text-brand-charcoal mt-2.5">
                {editingProduct.name || "Untitled Item"}
              </h3>
              <p className="text-[10px] text-brand-gray font-medium">SKU ID: {editingProduct.id}</p>
            </div>

            {/* TAB CONTROLS HEADERS */}
            <div className="flex gap-2 border-b pb-2 overflow-x-auto text-[10px] font-bold uppercase text-slate-400">
              {[
                { key: "basic", label: "Basic Information" },
                { key: "pricing", label: "Pricing" },
                { key: "media", label: "Media" },
                { key: "inventory", label: "Inventory" }
              ].map((tab: any) => (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setProductModalTab(tab.key)}
                  className={`pb-1 px-2 border-b-2 transition-all whitespace-nowrap ${
                    productModalTab === tab.key 
                      ? "border-brand-pink text-brand-pink font-extrabold" 
                      : "border-transparent hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                // Pricing calculations
                const salePrice = parseFloat(formData.get("price") as string) || 0;
                const crossedPrice = parseFloat(formData.get("crossedPrice") as string) || 0;
                let calculatedDiscount = parseFloat(formData.get("discountPercentage") as string) || 0;
                if (crossedPrice > salePrice && crossedPrice > 0) {
                  calculatedDiscount = Math.round(((crossedPrice - salePrice) / crossedPrice) * 100);
                }

                // Determine final category: new input overrides dropdown selection
                const finalCategory = (showNewCategoryInput && newCategoryInput.trim())
                  ? newCategoryInput.trim()
                  : selectedCategoryValue;
                // Persist any newly entered category for future use
                if (showNewCategoryInput && newCategoryInput.trim()) {
                  addCategory(newCategoryInput.trim());
                  const refreshed = getProductCategories();
                  setCategoryOptions(refreshed);
                }

                if (editingItemType === "product") {
                  const updated: ProductType = {
                    ...editingProduct,
                    name: formData.get("name") as string,
                    price: salePrice,
                    crossedPrice: crossedPrice,
                    stock: parseInt(formData.get("stock") as string) || 0,
                    image: formData.get("image") as string,
                    desc: formData.get("desc") as string,
                    trendingOrder: parseInt(formData.get("trendingOrder") as string) || 0,
                    category: finalCategory,
                    tags: (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
                    originalPrice: crossedPrice,
                    discountPercentage: calculatedDiscount,
                    shortDescription: formData.get("shortDescription") as string,
                    gallery: (formData.get("galleryHidden") as string || "").split(";;").filter(Boolean),
                    weight: formData.get("weight") as string,
                    dimensions: formData.get("dimensions") as string,
                    includes: formData.get("includes") as string,
                    deliveryInfo: formData.get("deliveryInfo") as string,
                    highlights: formData.get("highlights") as string,
                    features: formData.get("features") as string,
                    careInstructions: formData.get("careInstructions") as string,
                    customNotes: formData.get("customNotes") as string,
                    availability: formData.get("availability") as any,
                    costPrice: parseFloat(formData.get("costPrice") as string) || 0,
                    lowStockAlert: parseInt(formData.get("lowStockAlert") as string) || 5,
                    metaTitle: formData.get("metaTitle") as string,
                    metaDesc: formData.get("metaDesc") as string,
                    metaKeywords: formData.get("metaKeywords") as string,
                    status: formData.get("status") as any,
                  };
                  
                  let updatedProducts = [...productsList];
                  
                  if (!editingProduct.is_hamper_item) {
                    const newComps = Object.entries(tempRecipe)
                      .filter(([_, qty]) => qty > 0)
                      .map(([id, qty]) => ({ id, qty: Number(qty) }));
                    const updatedComps = {
                      ...HAMPER_COMPONENTS,
                      [editingProduct.id]: newComps
                    };
                    setHamperComponents(updatedComps);

                    // Update stock for each of the gifts edited in the modal
                    updatedProducts = updatedProducts.map(p => {
                      if (p.is_hamper_item && tempGiftStocks[p.id] !== undefined) {
                        return { ...p, stock: tempGiftStocks[p.id] };
                      }
                      return p;
                    });
                  }
                  
                  if (isAddingNewItem) {
                    updatedProducts.unshift(updated);
                  } else {
                    updatedProducts = updatedProducts.map((p) => (p.id === updated.id ? updated : p));
                  }
                  
                  setProductsList(updatedProducts);
                  setProducts(updatedProducts);
                }
                else if (editingItemType === "box") {
                  const updatedBox: HamperBox = {
                    ...editingProduct,
                    name: formData.get("name") as string,
                    basePrice: salePrice,
                    maxItems: parseInt(formData.get("maxItems") as string) || 6,
                    size: formData.get("dimensions") as string || "",
                    image: formData.get("image") as string,
                    desc: formData.get("desc") as string,
                    shortDescription: formData.get("shortDescription") as string,
                    category: finalCategory || "box",
                    tags: (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
                    costPrice: parseFloat(formData.get("costPrice") as string) || 0,
                    originalPrice: crossedPrice,
                    discountPercentage: calculatedDiscount,
                    stock: parseInt(formData.get("stock") as string) || 0,
                    lowStockAlert: parseInt(formData.get("lowStockAlert") as string) || 5,
                    weight: formData.get("weight") as string,
                    dimensions: formData.get("dimensions") as string,
                    includes: formData.get("includes") as string,
                    features: formData.get("features") as string,
                    highlights: formData.get("highlights") as string,
                    material: formData.get("material") as string,
                    careInstructions: formData.get("careInstructions") as string,
                    deliveryInfo: formData.get("deliveryInfo") as string,
                    gallery: (formData.get("galleryHidden") as string || "").split(";;").filter(Boolean),
                    videoUrl: formData.get("videoUrl") as string,
                    status: formData.get("status") as any,
                    availability: formData.get("availability") as any,
                    metaTitle: formData.get("metaTitle") as string,
                    metaDesc: formData.get("metaDesc") as string,
                    metaKeywords: formData.get("metaKeywords") as string,
                  };
                  
                  let updatedBoxes = [...boxesList];
                  if (isAddingNewItem) {
                    updatedBoxes.unshift(updatedBox);
                  } else {
                    updatedBoxes = updatedBoxes.map((b) => (b.id === updatedBox.id ? updatedBox : b));
                  }
                  setBoxesList(updatedBoxes);
                  setHamperBoxes(updatedBoxes);
                }
                else if (editingItemType === "addon") {
                  const updatedAddon: AddonItem = {
                    ...editingProduct,
                    name: formData.get("name") as string,
                    price: salePrice,
                    stock: parseInt(formData.get("stock") as string) || 0,
                    isEnabled: formData.get("status") === "published",
                    image: formData.get("image") as string,
                    desc: formData.get("desc") as string,
                    shortDescription: formData.get("shortDescription") as string,
                    category: finalCategory || "addon",
                    tags: (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
                    costPrice: parseFloat(formData.get("costPrice") as string) || 0,
                    originalPrice: crossedPrice,
                    discountPercentage: calculatedDiscount,
                    lowStockAlert: parseInt(formData.get("lowStockAlert") as string) || 5,
                    weight: formData.get("weight") as string,
                    dimensions: formData.get("dimensions") as string,
                    includes: formData.get("includes") as string,
                    features: formData.get("features") as string,
                    highlights: formData.get("highlights") as string,
                    material: formData.get("material") as string,
                    careInstructions: formData.get("careInstructions") as string,
                    deliveryInfo: formData.get("deliveryInfo") as string,
                    gallery: (formData.get("galleryHidden") as string || "").split(";;").filter(Boolean),
                    videoUrl: formData.get("videoUrl") as string,
                    status: formData.get("status") as any,
                    availability: formData.get("availability") as any,
                    metaTitle: formData.get("metaTitle") as string,
                    metaDesc: formData.get("metaDesc") as string,
                    metaKeywords: formData.get("metaKeywords") as string,
                  };
                  
                  let updatedAddons = [...addonsList];
                  if (isAddingNewItem) {
                    updatedAddons.unshift(updatedAddon);
                  } else {
                    updatedAddons = updatedAddons.map((ad) => (ad.id === updatedAddon.id ? updatedAddon : ad));
                  }
                  setAddonsList(updatedAddons);
                  setAddons(updatedAddons);
                }

                setEditingProduct(null);
                setEditingItemType(null);
                setIsAddingNewItem(false);
                alert("Saved changes successfully!");
              }}
              className="space-y-4 text-xs text-brand-charcoal animate-slide-up"
            >
              {/* TAB 1: GENERAL */}
              {productModalTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Item Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        defaultValue={editingProduct.name}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Category</label>
                      {/* Searchable category dropdown */}
                      <select
                        value={showNewCategoryInput ? "__new__" : selectedCategoryValue}
                        onChange={(e) => {
                          if (e.target.value === "__new__") {
                            setShowNewCategoryInput(true);
                            setSelectedCategoryValue("");
                          } else {
                            setShowNewCategoryInput(false);
                            setSelectedCategoryValue(e.target.value);
                          }
                        }}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none focus:border-brand-pink cursor-pointer"
                      >
                        <option value="">— Select Category —</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                        <option value="__new__">➕ Add New Category…</option>
                      </select>
                      {/* New category text input — revealed when "Add New" is selected */}
                      {showNewCategoryInput && (
                        <div className="flex gap-2 mt-1.5">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Type new category name…"
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            className="flex-1 text-xs p-2.5 rounded-xl border border-brand-pink/40 bg-white focus:outline-none focus:border-brand-pink"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newCategoryInput.trim()) {
                                setSelectedCategoryValue(newCategoryInput.trim());
                                setShowNewCategoryInput(false);
                                // Optimistically add to dropdown for this session
                                if (!categoryOptions.includes(newCategoryInput.trim())) {
                                  setCategoryOptions(prev => [...prev, newCategoryInput.trim()].sort());
                                }
                              }
                            }}
                            className="px-3 py-2 bg-brand-pink text-white text-[10px] font-bold rounded-xl hover:bg-brand-pink/90 transition-all cursor-pointer border-0 whitespace-nowrap"
                          >
                            Use This
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowNewCategoryInput(false); setNewCategoryInput(""); }}
                            className="px-3 py-2 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-slate-300 transition-all cursor-pointer border-0"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {/* Show currently selected category as a confirmation badge */}
                      {selectedCategoryValue && !showNewCategoryInput && (
                        <p className="text-[10px] text-brand-pink font-semibold mt-1">
                          ✓ Selected: <strong>{selectedCategoryValue}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-brand-gray">Short Catchphrase Description</label>
                    <input
                      type="text"
                      name="shortDescription"
                      defaultValue={editingProduct.shortDescription || ""}
                      placeholder="Brief teaser for product cards"
                      className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-brand-gray">Full Description</label>
                    <textarea
                      name="desc"
                      rows={4}
                      defaultValue={editingProduct.desc || ""}
                      placeholder="Complete e-commerce details"
                      className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Tags (comma-separated)</label>
                      <input
                        type="text"
                        name="tags"
                        defaultValue={editingProduct.tags ? editingProduct.tags.join(", ") : ""}
                        placeholder="e.g. Bestseller, Anniversary"
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Trending display Order</label>
                      <input
                        type="number"
                        name="trendingOrder"
                        defaultValue={editingProduct.trendingOrder || 0}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES & VIDEOS */}
              {productModalTab === "media" && (
                <div className="space-y-4">
                  {/* Featured thumbnail */}
                  <div className="space-y-1 border-b pb-3">
                    <label className="text-[9px] font-bold uppercase text-brand-gray block">Featured Image (Primary thumbnail)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setEditingProduct((prev: any) => prev ? ({ ...prev, image: event.target!.result as string }) : null);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-[10px] p-1.5 border bg-white rounded-lg"
                    />
                    <input type="hidden" name="image" value={editingProduct.image || ""} />
                    {editingProduct.image && (
                      <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border bg-slate-100 shadow-sm relative">
                        <img src={editingProduct.image} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Gallery Sortable */}
                  <div className="space-y-1 border-b pb-3">
                    <label className="text-[9px] font-bold uppercase text-brand-gray block">Gallery Images (Add up to 4 photos - Sortable)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const hiddenInput = document.getElementById("prod-edit-gallery-hidden") as HTMLInputElement;
                        let existingList = hiddenInput?.value ? hiddenInput.value.split(";;") : [];
                        
                        files.forEach(file => {
                          if (existingList.length >= 4) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              existingList.push(event.target.result as string);
                              if (hiddenInput) hiddenInput.value = existingList.join(";;");
                              setEditingProduct((prev: any) => prev ? ({ ...prev, gallery: [...existingList] }) : null);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                      className="w-full text-[10px] p-1.5 border bg-white rounded-lg"
                    />
                    <input type="hidden" name="galleryHidden" id="prod-edit-gallery-hidden" value={(editingProduct.gallery || []).join(";;")} />
                    
                    <div className="flex gap-2.5 mt-2 flex-wrap">
                      {(editingProduct.gallery || []).map((img: string, idx: number) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border bg-slate-55 group flex flex-col items-center">
                          <img src={img} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 text-white text-[8px] opacity-0 group-hover:opacity-100 flex flex-col justify-around items-center p-1 transition-all">
                            <button
                              type="button"
                              onClick={() => {
                                const newList = (editingProduct.gallery || []).filter((_: any, i: number) => i !== idx);
                                setEditingProduct((prev: any) => prev ? ({ ...prev, gallery: newList }) : null);
                              }}
                              className="text-[8px] bg-red-600 px-1 py-0.5 rounded cursor-pointer border-0"
                            >
                              Remove
                            </button>
                            <div className="flex gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...(editingProduct.gallery || [])];
                                    const temp = list[idx];
                                    list[idx] = list[idx - 1];
                                    list[idx - 1] = temp;
                                    setEditingProduct((prev: any) => prev ? ({ ...prev, gallery: list }) : null);
                                  }}
                                  className="bg-brand-charcoal text-white rounded px-0.5 text-[8px] border-0"
                                >
                                  ←
                                </button>
                              )}
                              {idx < (editingProduct.gallery || []).length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...(editingProduct.gallery || [])];
                                    const temp = list[idx];
                                    list[idx] = list[idx + 1];
                                    list[idx + 1] = temp;
                                    setEditingProduct((prev: any) => prev ? ({ ...prev, gallery: list }) : null);
                                  }}
                                  className="bg-brand-charcoal text-white rounded px-0.5 text-[8px] border-0"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video URL */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-brand-gray block">Video URL or Base64 file</label>
                    <input
                      type="text"
                      name="videoUrl"
                      placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                      defaultValue={editingProduct.videoUrl || ""}
                      onChange={(e) => {
                        setEditingProduct((prev: any) => prev ? ({ ...prev, videoUrl: e.target.value }) : null);
                      }}
                      className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                    />
                    {editingProduct.videoUrl && (
                      <div className="mt-2 w-48 h-32 rounded-xl overflow-hidden border bg-slate-100 shadow-sm relative">
                        <video src={editingProduct.videoUrl} className="w-full h-full object-cover" controls muted />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING */}
              {productModalTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Cost Price (INR)</label>
                      <input
                        type="number"
                        name="costPrice"
                        value={costPrice}
                        onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray font-bold text-brand-pink">Selling Price / MRP (INR)</label>
                      <input
                        type="number"
                        name="crossedPrice"
                        value={mrp}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setMrp(val);
                          const finalEl = document.getElementById("price-final-input") as HTMLInputElement;
                          if (finalEl) {
                            const finalVal = parseFloat(finalEl.value) || 0;
                            if (val > finalVal && val > 0) {
                              setDiscountPct(Math.round(((val - finalVal) / val) * 100));
                            }
                          }
                        }}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Discount %</label>
                      <input
                        type="number"
                        name="discountPercentage"
                        value={discountPct}
                        onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Final Price (INR)</label>
                      <input
                        type="number"
                        name="price"
                        id="price-final-input"
                        value={Math.max(0, Math.round(mrp * (1 - discountPct / 100)))}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          if (mrp > val && mrp > 0) {
                            setDiscountPct(Math.round(((mrp - val) / mrp) * 100));
                          }
                        }}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-100 text-slate-700 font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Dynamic Pricing HUD Summary */}
                  <div className="p-4 bg-brand-pinkLight/20 border border-brand-pink/5 rounded-2xl grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[8px] text-brand-gray uppercase font-bold block">Final Retail Price</span>
                      <strong className="text-brand-pink font-display text-lg">₹{Math.max(0, Math.round(mrp * (1 - discountPct / 100)))}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-brand-gray uppercase font-bold block">Discount Savings</span>
                      <strong className="text-brand-charcoal text-lg">₹{Math.max(0, Math.round((mrp * discountPct) / 100))}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-brand-gray uppercase font-bold block">Promo Discount Tag</span>
                      <strong className="text-emerald-600 text-lg">{discountPct}% OFF</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: INVENTORY */}
              {productModalTab === "inventory" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Available Stock</label>
                      <input
                        type="number"
                        name="stock"
                        required
                        defaultValue={editingProduct.stock || 0}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Low Stock Alert Level</label>
                      <input
                        type="number"
                        name="lowStockAlert"
                        defaultValue={editingProduct.lowStockAlert || 5}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Availability Status</label>
                      <select name="availability" defaultValue={editingProduct.availability || "in-stock"} className="w-full text-xs p-3 rounded-xl border bg-white focus:outline-none">
                        <option value="in-stock">🟢 In Stock / Live</option>
                        <option value="out-of-stock">⚫ Out of Stock</option>
                        <option value="pre-order">🟡 Pre-order Booking</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Item Weight (e.g. 600g)</label>
                      <input
                        type="text"
                        name="weight"
                        defaultValue={editingProduct.weight || ""}
                        placeholder="e.g. 600g"
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Dimensions (L x W x H cm)</label>
                      <input
                        type="text"
                        name="dimensions"
                        defaultValue={editingProduct.dimensions || editingProduct.size || ""}
                        placeholder="e.g. 25x20x10"
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50"
                      />
                    </div>
                  </div>

                  {editingItemType === "product" && !editingProduct.is_hamper_item && (
                    <div className="space-y-2 border border-brand-pink/15 p-4 rounded-2xl bg-slate-50">
                      <label className="text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Hamper Recipe Components</label>
                      <p className="text-[8px] text-brand-gray -mt-1">Define which gifts are bundled inside this ready-made hamper and manage their stock</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                        {productsList.filter(p => p.is_hamper_item).map(gift => {
                          const recipe = tempRecipe[gift.id] || 0;
                          const giftStock = tempGiftStocks[gift.id] !== undefined ? tempGiftStocks[gift.id] : gift.stock;
                          return (
                            <div key={gift.id} className="flex items-center justify-between text-xs py-2 border-b border-brand-pink/5">
                              <div className="flex items-center gap-2">
                                <img src={gift.image} className="w-8 h-8 rounded-lg object-cover border bg-white" alt={gift.name} />
                                <span className="truncate max-w-[150px] font-medium">{gift.name} (₹{gift.price})</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-slate-500 font-bold">Qty:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={recipe}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setTempRecipe({ ...tempRecipe, [gift.id]: val });
                                    }}
                                    className="w-12 p-1 border text-center rounded bg-white text-brand-charcoal"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-slate-500 font-bold">Stock:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={giftStock}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setTempGiftStocks({ ...tempGiftStocks, [gift.id]: val });
                                    }}
                                    className="w-14 p-1 border text-center rounded bg-white text-brand-charcoal"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {editingItemType === "box" && (
                    <div className="space-y-1 border-t pt-3">
                      <label className="text-[9px] font-bold uppercase text-brand-gray">Box Container Capacity Limit</label>
                      <input
                        type="number"
                        name="maxItems"
                        defaultValue={editingProduct.maxItems || 6}
                        className="w-full text-xs p-3 rounded-xl border bg-slate-50"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ACTION FOOTER BUTTONS */}
              {productModalTab !== "reviews" && (
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => { setEditingProduct(null); setEditingItemType(null); setIsAddingNewItem(false); }}
                    className="flex-1 py-3 border rounded-xl text-xs font-bold transition-all text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all border-0 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}\n\n      {/* Preview overlay modal */}
      {previewSlide && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8">
          <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden min-h-[460px] bg-slate-900 border border-white/10 flex flex-col justify-center items-center shadow-2xl">
            {/* Background */}
            <div className="absolute inset-0 z-0">
              {previewSlide.backgroundType === 'video' && previewSlide.video ? (
                <video src={previewSlide.video} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              ) : previewSlide.backgroundType === 'image' ? (
                <img src={previewSlide.desktopImage || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: previewSlide.backgroundColor }} />
              )}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: previewSlide.overlayColor || "#000000", opacity: previewSlide.overlayOpacity || 0.3 }}
              />
            </div>
            {/* Content */}
            <div className={`relative z-10 flex flex-col md:flex-row items-center justify-between w-full h-full p-8 md:p-16 gap-8 transition-all duration-300 ${
              previewSlide.contentPosition === 'center' ? 'justify-center' : previewSlide.contentPosition === 'right' ? 'justify-end' : 'justify-start'
            }`}>
              <div className={`flex-1 max-w-xl space-y-6 flex flex-col ${
                previewSlide.textAlignment === 'center' ? 'text-center items-center' : previewSlide.textAlignment === 'right' ? 'text-right items-end' : 'text-left items-start'
              }`} style={{ color: previewSlide.textColor || '#ffffff' }}>
                {previewSlide.badgeLabel && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pinkLight border border-brand-pink/20 text-xs font-bold text-brand-pink">
                    <Award className="w-3.5 h-3.5" /> {previewSlide.badgeLabel}
                  </span>
                )}
                {previewSlide.offerText && (
                  <div className="text-xs uppercase tracking-wider font-extrabold text-brand-pink bg-brand-pinkLight/30 border border-brand-pink/15 px-3 py-1.5 rounded-xl inline-block max-w-max select-none">
                    {previewSlide.offerText}
                  </div>
                )}
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight" dangerouslySetInnerHTML={{ __html: previewSlide.title }} />
                <p className="text-xs md:text-sm opacity-90 max-w-md">{previewSlide.subtitle}</p>
                {previewSlide.description && <p className="text-[10px] opacity-75 max-w-sm">{previewSlide.description}</p>}
                <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto">
                  {(previewSlide.ctas || []).map((cta, idx) => {
                    const btnStyle = cta.style === 'primary'
                      ? "px-8 py-4 bg-brand-pink text-white rounded-full font-bold text-sm hover:bg-brand-pink/90"
                      : "px-8 py-4 bg-white border border-brand-pink/10 rounded-full font-bold text-sm text-brand-charcoal hover:bg-slate-50";
                    return <button key={idx} className={`${btnStyle} pointer-events-none`}>{cta.text}</button>;
                  })}
                </div>
              </div>
              {previewSlide.rightImage && (
                <div className="flex-1 relative flex justify-center items-center shrink-0 w-full md:w-auto">
                  <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-white/10 backdrop-blur-md">
                    <img src={previewSlide.rightImage} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
            {/* Close */}
            <button onClick={() => setPreviewSlide(null)} className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold shadow-md hover:bg-red-600 z-30 cursor-pointer border-0">
              Close Live Preview
            </button>
          </div>
        </div>
      )}

      {/* Editing Global Review properties modal */}
      {editingReview && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 text-xs text-brand-charcoal">
          <div className="max-w-md w-full bg-white rounded-3xl border border-brand-pink/15 p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setEditingReview(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-brand-charcoal transition-colors border-0 cursor-pointer bg-white"
            >
              ✕
            </button>
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink/15">
                Edit Customer Review Content
              </span>
              <h3 className="font-display font-bold text-lg mt-2.5">Edit Review properties</h3>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updated = reviewsList.map(r => r.id === editingReview.id ? {
                  ...r,
                  userName: formData.get("userName") as string,
                  title: formData.get("title") as string,
                  rating: parseInt(formData.get("rating") as string) || 5,
                  comment: formData.get("comment") as string,
                } : r);
                setReviewsList(updated);
                setReviews(updated);
                setEditingReview(null);
                alert("Review details saved successfully!");
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Customer Name</label>
                <input type="text" name="userName" required defaultValue={editingReview.userName} className="w-full text-xs p-3 rounded-xl border bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Review Title Summary</label>
                <input type="text" name="title" defaultValue={editingReview.title || ""} className="w-full text-xs p-3 rounded-xl border bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Star Rating</label>
                <select name="rating" defaultValue={editingReview.rating} className="w-full text-xs p-3 rounded-xl border bg-slate-50 bg-white">
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★☆ (4 Stars)</option>
                  <option value="3">★★★☆☆ (3 Stars)</option>
                  <option value="2">★★☆☆☆ (2 Stars)</option>
                  <option value="1">★☆☆☆☆ (1 Star)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Review Comment Description</label>
                <textarea name="comment" rows={3} required defaultValue={editingReview.comment} className="w-full text-xs p-3 rounded-xl border bg-slate-50" />
              </div>
              
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingReview(null)} className="flex-1 py-3 border rounded-xl font-bold bg-white text-slate-500">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-brand-pink text-white rounded-xl font-bold border-0">Save Review Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Slide properties modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-brand-pink/15 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-xs text-brand-charcoal">
            <button
              onClick={() => setEditingSlide(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-brand-charcoal transition-colors border-0 cursor-pointer bg-white"
            >
              ✕
            </button>
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink/15">
                Edit Hero Slide Customizer
              </span>
              <h3 className="font-display font-bold text-xl text-brand-charcoal mt-2.5">
                Edit Slide Settings
              </h3>
              <p className="text-[10px] text-brand-gray font-medium">Customize layout properties, redirects, and scheduling rules.</p>
            </div>

            <form onSubmit={handleSaveEditingSlide} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Hero Main Title (HTML supported)</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingSlide.title}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Subheading Caption</label>
                  <input
                    type="text"
                    name="subtitle"
                    required
                    defaultValue={editingSlide.subtitle}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Badge Label (e.g. New, Sale, limited Time)</label>
                  <input
                    type="text"
                    name="badgeLabel"
                    defaultValue={editingSlide.badgeLabel || ""}
                    placeholder="New Arrival"
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Offer Text Highlight (e.g. Flat 20% OFF)</label>
                  <input
                    type="text"
                    name="offerText"
                    defaultValue={editingSlide.offerText || ""}
                    placeholder="Flat 15% OFF"
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 border rounded-xl bg-slate-50/50">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Background Type</label>
                  <select name="backgroundType" defaultValue={editingSlide.backgroundType} className="w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none">
                    <option value="image">Image (Desktop/Mobile files)</option>
                    <option value="video">Video loop (Muted playing)</option>
                    <option value="color">Color background fallback</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Fallback Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" name="backgroundColor" defaultValue={editingSlide.backgroundColor || "#1a1a1a"} className="w-12 h-10 border rounded cursor-pointer" />
                    <span className="text-[10px] text-slate-500 font-mono">{editingSlide.backgroundColor || "#1a1a1a"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Extended Description text</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingSlide.description || ""}
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Desktop Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setEditingSlide(prev => prev ? ({ ...prev, desktopImage: event.target!.result as string }) : null);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs p-2 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                  <input type="hidden" name="image" value={editingSlide.desktopImage || ""} />
                  {editingSlide.desktopImage && (
                    <div className="mt-2 w-12 h-12 rounded-lg overflow-hidden border bg-slate-100">
                      <img src={editingSlide.desktopImage} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Mobile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setEditingSlide(prev => prev ? ({ ...prev, mobileImage: event.target!.result as string }) : null);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs p-2 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                  <input type="hidden" name="mobileImage" value={editingSlide.mobileImage || ""} />
                  {editingSlide.mobileImage && (
                    <div className="mt-2 w-12 h-12 rounded-lg overflow-hidden border bg-slate-100">
                      <img src={editingSlide.mobileImage} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Video Loop (Optional)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setEditingSlide(prev => prev ? ({ ...prev, video: event.target!.result as string }) : null);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs p-2 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                  <input type="hidden" name="video" value={editingSlide.video || ""} />
                  {editingSlide.video && (
                    <div className="mt-2 w-12 h-12 rounded-lg overflow-hidden border bg-slate-100">
                      <video src={editingSlide.video} className="w-full h-full object-cover" muted loop></video>
                    </div>
                  )}
                </div>
              </div>

              {/* Primary CTA */}
              <div className="p-3 border rounded-xl bg-slate-50/50 space-y-2">
                <h4 className="font-bold text-[10px] text-brand-pink uppercase tracking-wide">Primary CTA Button</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Button Text</label>
                    <input type="text" name="cta1Text" defaultValue={editingSlide.ctas?.[0]?.text || ""} className="w-full p-2 border rounded text-xs" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Destination URL</label>
                    <input type="text" name="cta1Url" defaultValue={editingSlide.ctas?.[0]?.url || ""} placeholder="/shop" className="w-full p-2 border rounded text-xs" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Target Window</label>
                    <select name="cta1Target" defaultValue={editingSlide.ctas?.[0]?.target || "_self"} className="w-full p-2 border rounded text-xs bg-white">
                      <option value="_self">Same Tab</option>
                      <option value="_blank">New Tab</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Button Style</label>
                    <select name="cta1Style" defaultValue={editingSlide.ctas?.[0]?.style || "primary"} className="w-full p-2 border rounded text-xs bg-white">
                      <option value="primary">Primary (Pink)</option>
                      <option value="secondary">Secondary (White)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="p-3 border rounded-xl bg-slate-50/50 space-y-2">
                <h4 className="font-bold text-[10px] text-slate-600 uppercase tracking-wide">Secondary CTA Button (Optional)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Button Text</label>
                    <input type="text" name="cta2Text" defaultValue={editingSlide.ctas?.[1]?.text || ""} className="w-full p-2 border rounded text-xs" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Destination URL</label>
                    <input type="text" name="cta2Url" defaultValue={editingSlide.ctas?.[1]?.url || ""} placeholder="/hamper-builder" className="w-full p-2 border rounded text-xs" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Target Window</label>
                    <select name="cta2Target" defaultValue={editingSlide.ctas?.[1]?.target || "_self"} className="w-full p-2 border rounded text-xs bg-white">
                      <option value="_self">Same Tab</option>
                      <option value="_blank">New Tab</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Button Style</label>
                    <select name="cta2Style" defaultValue={editingSlide.ctas?.[1]?.style || "secondary"} className="w-full p-2 border rounded text-xs bg-white">
                      <option value="primary">Primary (Pink)</option>
                      <option value="secondary">Secondary (White)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Scheduling and Occasion Campaign Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Seasonal Campaign Occasion</label>
                  <select name="campaignType" defaultValue={editingSlide.campaignType} className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none">
                    {["None", "Valentines Day", "Fathers Day", "Mothers Day", "Raksha Bandhan", "Eid", "Diwali", "Christmas", "New Year", "Black Friday", "Women's Day", "Summer Sale", "Winter Sale", "Clearance Sale", "Flash Sale"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Start Period</label>
                  <div className="flex gap-2">
                    <input type="date" name="startDate" defaultValue={editingSlide.startDate || ""} className="w-full p-2 border rounded text-xs" />
                    <input type="time" name="startTime" defaultValue={editingSlide.startTime || ""} className="w-24 p-2 border rounded text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">End Period</label>
                  <div className="flex gap-2">
                    <input type="date" name="endDate" defaultValue={editingSlide.endDate || ""} className="w-full p-2 border rounded text-xs" />
                    <input type="time" name="endTime" defaultValue={editingSlide.endTime || ""} className="w-24 p-2 border rounded text-xs" />
                  </div>
                </div>
              </div>

              {/* Priority and Display rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Priority Value (higher goes first)</label>
                  <input
                    type="number"
                    name="priority"
                    required
                    defaultValue={editingSlide.priority}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1 border p-2 rounded-xl bg-slate-50/50">
                  <label className="text-[8px] font-bold text-slate-500 block mb-1">Target Device Views</label>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1.5"><input type="checkbox" name="showDesktop" defaultChecked={editingSlide.showDesktop} /> Desktop</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" name="showTablet" defaultChecked={editingSlide.showTablet} /> Tablet</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" name="showMobile" defaultChecked={editingSlide.showMobile} /> Mobile</label>
                  </div>
                </div>
                <div className="space-y-1 border p-2 rounded-xl bg-slate-50/50">
                  <label className="text-[8px] font-bold text-slate-500 block mb-1">Audience constraints</label>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1.5"><input type="checkbox" name="showForLoggedIn" defaultChecked={editingSlide.showForLoggedIn} /> Logged In Users</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" name="showForGuests" defaultChecked={editingSlide.showForGuests} /> Guest Gifters</label>
                  </div>
                </div>
              </div>

              {/* Overlay styling customizer */}
              <div className="p-3 border rounded-xl bg-slate-50/50 space-y-2">
                <h4 className="font-bold text-[10px] text-brand-charcoal uppercase tracking-wide">Overlay and Styling customizer</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Overlay Color</label>
                    <input type="color" name="overlayColor" defaultValue={editingSlide.overlayColor || "#000000"} className="w-full h-8 border rounded cursor-pointer" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Overlay Opacity (0 - 1)</label>
                    <input type="number" name="overlayOpacity" step="0.1" min="0" max="1" defaultValue={editingSlide.overlayOpacity || 0.3} className="w-full p-2 border rounded text-xs" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Text Align</label>
                    <select name="textAlignment" defaultValue={editingSlide.textAlignment} className="w-full p-2 border rounded text-xs bg-white">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Text Color</label>
                    <input type="color" name="textColor" defaultValue={editingSlide.textColor || "#ffffff"} className="w-full h-8 border rounded cursor-pointer" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-slate-500">Content Position</label>
                    <select name="contentPosition" defaultValue={editingSlide.contentPosition} className="w-full p-2 border rounded text-xs bg-white">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Configurations duration & status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Slide Duration (seconds)</label>
                  <input
                    type="number"
                    name="duration"
                    required
                    defaultValue={editingSlide.duration}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Visibility Status</label>
                  <select name="status" defaultValue={editingSlide.status} className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft Mode</option>
                    <option value="publish-later">Publish Later</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    const form = e.currentTarget.closest("form");
                    if (form) handlePreviewSlideTrigger(form);
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:bg-indigo-700 transition-all border-0 cursor-pointer"
                >
                  Preview Slide
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold transition-all text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all border-0 cursor-pointer"
                >
                  Save Slide Properties
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

      {/* ── Confirm Delete Modal ──────────────────────────────────────────── */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeDeleteConfirm}>
          <div
            className="bg-white rounded-3xl shadow-2xl border border-brand-pink/10 p-8 w-full max-w-sm space-y-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            {/* Text */}
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-base text-brand-charcoal">Delete Item?</h3>
              <p className="text-[11px] text-brand-gray leading-relaxed">
                Are you sure you want to delete this <span className="font-semibold text-brand-charcoal">{confirmModal.label}</span>?
                <br />This action cannot be undone.
              </p>
            </div>
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 py-3 border border-brand-pink/20 text-brand-charcoal rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  closeDeleteConfirm();
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-red-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ─────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[1000] bg-emerald-600 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up">
          <Check className="w-4 h-4 shrink-0" />
          {toastMsg}
        </div>
      )}
    </>
  );
}
