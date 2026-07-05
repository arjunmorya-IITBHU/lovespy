"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Product as ProductType,
  Order as OrderType,
  SurpriseOrderType,
  OfferItem,
  HeroSettings,
  SeasonalCampaign,
  ShowcaseMedia,
  AddonItem,
  CouponItem,
  CustomerType,
  HamperBox
} from "@/lib/db";
import {
  BarChart3,
  Database,
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
  Settings as SettingsIcon
} from "lucide-react";
import Logo from "@/components/Logo";

export default function AdminDashboard() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

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
    | "settings"
  >("offers");

  // Internal component states synchronized with db.ts
  const [productsList, setProductsList] = useState<ProductType[]>(getProducts());
  const [boxesList, setBoxesList] = useState<HamperBox[]>(getHamperBoxes());
  const [ordersList, setOrdersList] = useState<any[]>(getOrders());
  const [surpriseOrdersList, setSurpriseOrdersList] = useState<SurpriseOrderType[]>(getSurpriseOrders());
  const [offersList, setOffersList] = useState<OfferItem[]>(getOffers());
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(getHeroBanner());
  const [campaignsList, setCampaignsList] = useState<SeasonalCampaign[]>(getSeasonalCampaigns());
  const [showcaseList, setShowcaseList] = useState<ShowcaseMedia[]>(getShowcaseMedia());
  const [addonsList, setAddonsList] = useState<AddonItem[]>(getAddons());
  const [couponsList, setCouponsList] = useState<CouponItem[]>(getCoupons());
  const [customersList, setCustomersList] = useState<CustomerType[]>(getCustomers());

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
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [tempRecipe, setTempRecipe] = useState<Record<string, number>>({});
  const [tempGiftStocks, setTempGiftStocks] = useState<Record<string, number>>({});

  React.useEffect(() => {
    if (editingProduct) {
      const stocks: Record<string, number> = {};
      productsList.forEach(p => {
        if (p.is_hamper_item) {
          stocks[p.id] = p.stock;
        }
      });
      setTempGiftStocks(stocks);

      if (!editingProduct.is_hamper_item) {
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toUpperCase() === "LOVESPYAKM" && password === "@aA718718718") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Incorrect master operator credentials. Access denied.");
    }
  };

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
        
        const updatedOrder = freshOrders.find((o) => o.id === orderId);
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

        const updatedOrder = freshOrders.find((o) => o.id === orderId);
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
        const updatedOrder = freshOrders.find((o) => o.id === orderId);
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
    const updated = offersList.filter((o) => o.id !== id);
    setOffersList(updated);
    setOffers(updated);
  };

  // 2. Hero Banner Save
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
    const updated = campaignsList.filter((c) => c.id !== id);
    setCampaignsList(updated);
    setSeasonalCampaigns(updated);
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
    const name = prompt(isHamper ? "Enter Hamper Name:" : "Enter Gift Product Name:");
    if (!name) return;
    const price = parseFloat(prompt("Enter price (INR):", "499") || "0");
    const stock = parseInt(prompt("Enter stock qty:", "50") || "0");
    const image = prompt("Enter Image URL:", "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500");
    const desc = prompt("Enter description:");

    const newP: ProductType = {
      id: `p-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price,
      stock,
      rating: 4.8,
      is_hamper_item: !isHamper,
      category: isHamper ? "luxury" : "chocolates",
      image: image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
      desc: desc || "",
      tags: isHamper ? ["Luxury", "Hamper"] : ["Gift"]
    };

    const updated = [newP, ...productsList];
    setProductsList(updated);
    setProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Delete this product SKU permanently?")) {
      const updated = productsList.filter((p) => p.id !== id);
      setProductsList(updated);
      setProducts(updated);
    }
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
    const name = prompt("Enter Box container name:");
    if (!name) return;
    const basePrice = parseFloat(prompt("Enter base cost (INR):", "299") || "0");
    const maxItems = parseInt(prompt("Enter capacity item limit:", "6") || "0");
    const size = prompt("Enter box size (e.g. 20x20x10 cm):", "20x20x10 cm") || "";

    const newBox: HamperBox = {
      id: `box-${Date.now()}`,
      name,
      basePrice,
      maxItems,
      size,
      image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500"
    };

    const updated = [...boxesList, newBox];
    setBoxesList(updated);
    setHamperBoxes(updated);
  };

  const handleDeleteBox = (id: string) => {
    if (confirm("Remove this container template?")) {
      const updated = boxesList.filter((b) => b.id !== id);
      setBoxesList(updated);
      setHamperBoxes(updated);
    }
  };

  // 8. Add-ons CRUD
  const handleAddAddon = () => {
    const name = prompt("Enter Add-on Name:");
    if (!name) return;
    const price = parseFloat(prompt("Enter price (INR):", "99") || "0");
    const stock = parseInt(prompt("Enter stock qty:", "100") || "0");
    const image = prompt("Enter Image URL:", "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500");

    const newAd: AddonItem = {
      id: `ad-${Date.now()}`,
      name,
      price,
      stock,
      image: image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
      isEnabled: true
    };
    const updated = [...addonsList, newAd];
    setAddonsList(updated);
    setAddons(updated);
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
    const updated = addonsList.filter((a) => a.id !== id);
    setAddonsList(updated);
    setAddons(updated);
  };

  // 9. Showcase Media CRUD
  const handleAddShowcase = () => {
    const title = prompt("Enter design title:");
    if (!title) return;
    const type = confirm("Click OK for Image, CANCEL for Video loop") ? "image" : "video";
    const url = prompt("Enter media URL:");
    if (!url) return;

    const newSm: ShowcaseMedia = {
      id: `sm-${Date.now()}`,
      title,
      type,
      url,
      displayOrder: showcaseList.length + 1
    };
    const updated = [...showcaseList, newSm];
    setShowcaseList(updated);
    setShowcaseMedia(updated);
  };

  const handleDeleteShowcase = (id: string) => {
    const updated = showcaseList.filter((s) => s.id !== id);
    setShowcaseList(updated);
    setShowcaseMedia(updated);
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
    const updated = couponsList.filter((c) => c.code !== code);
    setCouponsList(updated);
    setCoupons(updated);
  };

  // 12. Customers CRUD
  const handleAddCustomer = () => {
    const name = prompt("Customer Name:");
    if (!name) return;
    const phone = prompt("Phone:");
    const email = prompt("Email:");

    const newCust: CustomerType = {
      id: `c-${Date.now()}`,
      name,
      phone: phone || "",
      email: email || "",
      points: 0,
      orderCount: 1
    };
    const updated = [...customersList, newCust];
    setCustomersList(updated);
    setCustomers(updated);
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customersList.filter((c) => c.id !== id);
    setCustomersList(updated);
    setCustomers(updated);
  };

  // Login Form view
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 glass-card p-10 border border-brand-pink/20 rounded-3xl shadow-xl bg-white">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Logo className="w-20 h-20 animate-pulse-soft" />
            </div>
            <h2 className="mt-6 text-center text-2xl font-display font-extrabold text-brand-charcoal">
              Operator Master Login
            </h2>
            <p className="text-xs text-brand-gray">
              Enter master credentials to gain full CMS access to Lovespy.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-brand-gray" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-brand-pink/15 placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-brand-pink focus:border-brand-pink text-xs bg-white"
                  placeholder="Master Username"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-brand-gray" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-brand-pink/15 placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-brand-pink focus:border-brand-pink text-xs bg-white"
                  placeholder="Master Password"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-[10px] text-red-500 font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100 animate-pulse">
                ⚠️ {loginError}
              </p>
            )}

            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 py-3 border border-brand-pink/10 hover:bg-slate-50 text-brand-charcoal text-center rounded-xl text-xs font-bold transition-all"
              >
                Back to Store
              </Link>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-brand-pink to-brand-lavender text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all"
              >
                Access Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
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
            { id: "coupons", label: "Coupons & Discounts", icon: Ticket },
            { id: "customers", label: "Customers Directory", icon: Users },
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
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Background Image URL</label>
                  <input
                    type="text"
                    name="image"
                    defaultValue={heroSettings.image}
                    className="w-full text-xs p-3 rounded-xl border bg-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Background Video loop URL (Optional)</label>
                  <input
                    type="text"
                    name="video"
                    defaultValue={heroSettings.video}
                    className="w-full text-xs p-3 rounded-xl border bg-white focus:outline-none"
                  />
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
                        onClick={() => setEditingProduct(p)}
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
                      onClick={() => setEditingProduct(p)}
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
                      <span className="text-[9px] font-bold text-slate-500">Image URL:</span>
                      <input
                        type="text"
                        value={ad.image || ""}
                        onChange={(e) => handleUpdateAddon(ad.id, "image", e.target.value)}
                        className="w-40 sm:w-60 p-1 border rounded text-xs"
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
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Orders Count</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customersList.map((cust) => (
                    <tr key={cust.id} className="border-b border-brand-pink/5 hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-brand-charcoal">{cust.name}</td>
                      <td className="p-4">
                        <div className="text-slate-600">{cust.email}</div>
                        <div className="text-[10px] text-brand-gray mt-0.5">{cust.phone}</div>
                      </td>
                      <td className="p-4 font-semibold text-brand-pink">{cust.orderCount} Orders</td>
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
                              const updatedOrder = freshOrders.find((o) => o.id === selectedGeneralOrder.id);
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
          <div className="max-w-xl w-full bg-white rounded-3xl border border-brand-pink/15 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-brand-charcoal transition-colors border-0 cursor-pointer bg-white"
            >
              ✕
            </button>
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink/15">
                Edit Gifting Item Details
              </span>
              <h3 className="font-display font-bold text-xl text-brand-charcoal mt-2.5">
                {editingProduct.name}
              </h3>
              <p className="text-[10px] text-brand-gray font-medium">SKU ID: {editingProduct.id}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updated: ProductType = {
                  ...editingProduct,
                  name: formData.get("name") as string,
                  price: parseFloat(formData.get("price") as string) || 0,
                  crossedPrice: parseFloat(formData.get("crossedPrice") as string) || 0,
                  stock: parseInt(formData.get("stock") as string) || 0,
                  image: formData.get("image") as string,
                  desc: formData.get("desc") as string,
                  trendingOrder: parseInt(formData.get("trendingOrder") as string) || 0,
                  category: formData.get("category") as string,
                  tags: (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
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
                
                // Save edited hamper
                updatedProducts = updatedProducts.map((p) => (p.id === updated.id ? updated : p));
                
                setProductsList(updatedProducts);
                setProducts(updatedProducts);
                setEditingProduct(null);
              }}
              className="space-y-4 text-xs text-brand-charcoal animate-slide-up"
            >
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Price (INR)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    defaultValue={editingProduct.price}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Crossed Price (INR)</label>
                  <input
                    type="number"
                    name="crossedPrice"
                    defaultValue={editingProduct.crossedPrice || Math.round(editingProduct.price * 1.25)}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">
                    {editingProduct.is_hamper_item ? "Stock Quantity" : "Override Stock Limit"}
                  </label>
                  <input
                    type="number"
                    name="stock"
                    required
                    defaultValue={editingProduct.stock}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              {!editingProduct.is_hamper_item && (
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

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Image URL</label>
                <input
                  type="text"
                  name="image"
                  required
                  defaultValue={editingProduct.image}
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Description</label>
                <textarea
                  name="desc"
                  rows={3}
                  defaultValue={editingProduct.desc}
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Display Order</label>
                  <input
                    type="number"
                    name="trendingOrder"
                    defaultValue={editingProduct.trendingOrder || 0}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-brand-gray">Category</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingProduct.category}
                    className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-brand-gray">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  defaultValue={editingProduct.tags ? editingProduct.tags.join(", ") : ""}
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                  placeholder="e.g. Romantic, Luxury, Trending"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold transition-all text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all border-0 cursor-pointer"
                >
                  Save Item Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
