"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getHamperBoxes, getProducts, getAddons, getEffectiveStock } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Package,
  Check,
  Info,
  Trash2,
  Plus,
  Mic,
  Image as ImageIcon,
  Award,
  Flower2,
  Zap,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Gift
} from "lucide-react";
import Logo from "@/components/Logo";

// 6 Steps Definition
// Step 1: Choose Box Type
// Step 2: Choose Add-ons
// Step 3: Product Selection (with falling animation)
// Step 4: Personalization (Wishes theme, handwritten letter, voice tag)
// Step 5: Preview (Summary breakdown)
// Step 6: Checkout (Coupon & Simulated Payment)

export default function HamperBuilder() {
  const router = useRouter();
  const {
    customHamper,
    setHamperBox,
    addHamperItem,
    removeHamperItem,
    updateHamperPersonalization,
    toggleHamperDecoration,
    commitCustomHamperToCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCat, setSelectedCat] = useState("all");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("romantic");

  // Animations State
  const [fallingItems, setFallingItems] = useState<
    Array<{
      id: number;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      image: string;
      product: any;
    }>
  >([]);
  const [flyingCount, setFlyingCount] = useState(0);
  const [boxWiggle, setBoxWiggle] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "processing" | "success" | "fail">("idle");

  const boxes = getHamperBoxes();
  const hamperProducts = getProducts().filter((p) => p.is_hamper_item);

  const currentCount = customHamper.items.reduce((acc, i) => acc + i.qty, 0);
  const maxItems = customHamper.box ? customHamper.box.maxItems : 0;
  const capacityPercent = maxItems > 0 ? Math.min(100, (currentCount / maxItems) * 100) : 0;

  const calculateItemsTotal = () => {
    return customHamper.items.reduce((acc, i) => acc + i.price * i.qty, 0);
  };

  const calculatePersonalizationsCost = () => {
    const pers = customHamper.personalization;
    let cost = 0;
    const photoCount = (pers.photos || (pers.photoName ? [pers.photoName] : [])).length;
    cost += photoCount * 15;
    if (pers.voiceQrAttached) cost += 25;
    
    // Dynamic addon calculation
    const addons = getAddons();
    addons.forEach((ad) => {
      if (pers.decorations && pers.decorations[ad.id]) {
        cost += ad.price;
      }
    });
    return cost;
  };

  const calculateSubtotal = () => {
    const base = customHamper.box ? customHamper.box.basePrice : 0;
    return base + calculateItemsTotal() + calculatePersonalizationsCost();
  };

  const calculateDiscount = () => {
    const sub = calculateSubtotal();
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percent") {
      return Math.round((sub * appliedCoupon.value) / 100);
    }
    return appliedCoupon.value;
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleBoxSelect = (box: any) => {
    setHamperBox(box);
    setActiveStep(2); // Automatically advance to Add-ons selection
  };

  const handlePhotoUploadMock = () => {
    const currentPhotos = customHamper.personalization.photos || [];
    const newPhotos = [...currentPhotos, `photo_${currentPhotos.length + 1}.jpg`];
    updateHamperPersonalization("photos", newPhotos);
    updateHamperPersonalization("photoName", `${newPhotos.length} Photo(s)`);
  };

  const removePhoto = (idx: number) => {
    const currentPhotos = customHamper.personalization.photos || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== idx);
    updateHamperPersonalization("photos", newPhotos);
    updateHamperPersonalization("photoName", newPhotos.length > 0 ? `${newPhotos.length} Photo(s)` : "");
  };

  const handleVoiceRecordMock = () => {
    updateHamperPersonalization("voiceQrAttached", true);
  };

  const handleAddProductClick = (e: React.MouseEvent<HTMLButtonElement>, product: any) => {
    if (currentCount + flyingCount >= maxItems) return;
    
    const fullProduct = hamperProducts.find((p) => p.id === product.id) || product;
    
    // Capture click location for animation
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2 - 24;
    const startY = rect.top + rect.height / 2 - 24;
    
    // Target position of the floating hamper box container
    const boxElement = document.getElementById("drawer-box-container") || document.getElementById("floating-hamper-box");
    let endX = window.innerWidth / 2 - 24;
    let endY = window.innerHeight * 0.85 - 24;
    if (boxElement) {
      const boxRect = boxElement.getBoundingClientRect();
      endX = boxRect.left + boxRect.width / 2 - 24;
      endY = boxRect.top + boxRect.height / 2 - 24;
    }

    const newItem = {
      id: Date.now() + Math.random(),
      startX,
      startY,
      endX,
      endY,
      image: fullProduct.image,
      product: fullProduct
    };

    setFlyingCount((prev) => prev + 1);
    setFallingItems((prev) => [...prev, newItem]);
  };

  const handleCouponApply = (e: React.FormEvent) => {
    e.preventDefault();
    const success = applyCoupon(couponCode);
    if (success) {
      setCouponMsg("Coupon applied successfully! 🎉");
    } else {
      setCouponMsg("Invalid coupon code or minimum amount not met.");
    }
  };

  const simulateCheckout = () => {
    setCheckoutStatus("processing");
    console.log("Initializing secure Razorpay gateway simulation...");
    console.log("Hamper Configuration: ", {
      box: customHamper.box,
      items: customHamper.items,
      personalization: customHamper.personalization,
      theme: selectedTheme,
      discount: calculateDiscount(),
      total: calculateGrandTotal()
    });

    setTimeout(() => {
      // Simulate 90% success rate
      const isSuccess = Math.random() > 0.1;
      if (isSuccess) {
        setCheckoutStatus("success");
        console.log("Payment status: SUCCESS. Transaction ID: TXN_" + Date.now());
        setTimeout(() => {
          commitCustomHamperToCart();
          router.push("/cart");
        }, 1500);
      } else {
        setCheckoutStatus("fail");
        console.log("Payment status: FAILED. Please retry.");
      }
    }, 2500);
  };

  // Filter products by category
  const filteredProducts = selectedCat === "all"
    ? hamperProducts
    : hamperProducts.filter((p) => p.category === selectedCat);

  return (
    <div className="space-y-8 relative pb-24">
      {/* Falling Items Particle Container */}
      <AnimatePresence>
        {fallingItems.map((item) => (
          <motion.img
            key={item.id}
            src={item.image}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "48px",
              height: "48px",
            }}
            initial={{ x: item.startX, y: item.startY, scale: 1, opacity: 1, rotate: 0 }}
            animate={{
              x: [item.startX, (item.startX + item.endX) / 2, item.endX],
              y: [item.startY, Math.min(item.startY, item.endY) - 150, item.endY],
              scale: [1, 1.4, 0.15],
              rotate: [0, 180, 360],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
            }}
            onAnimationComplete={() => {
              addHamperItem(item.product);
              setBoxWiggle(true);
              setTimeout(() => setBoxWiggle(false), 600);
              setFlyingCount((c) => Math.max(0, c - 1));
              setFallingItems((prev) => prev.filter((i) => i.id !== item.id));
            }}
            className="z-50 pointer-events-none border-2 border-brand-pink shadow-md rounded-full object-cover"
          />
        ))}
      </AnimatePresence>

      <div className="space-y-8 animate-slide-up">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h1 className="font-display font-bold text-3xl bg-gradient-to-r from-brand-pink to-brand-lavender bg-clip-text text-transparent">Custom Hamper Architect</h1>
          <p className="text-xs text-brand-gray">Design your personalized Gen-Z dream gifting hamper step-by-step</p>
      </div>

      {/* 5-Step Progress Navigator */}
      <div className="max-w-4xl mx-auto overflow-x-auto">
        <div className="flex justify-between items-center gap-1.5 md:gap-4 min-w-[650px] p-2 border border-brand-pink/15 bg-white/40 rounded-2xl backdrop-blur-md">
          {[
            "1. Box Selection",
            "2. Pick Add-ons",
            "3. Fill Products",
            "4. Personalize",
            "5. Live Preview"
          ].map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = activeStep > stepNum;
            const isActive = activeStep === stepNum;
            return (
              <button
                key={stepNum}
                onClick={() => {
                  if (customHamper.box || stepNum === 1) {
                    setActiveStep(stepNum);
                  }
                }}
                disabled={!customHamper.box && stepNum > 1}
                className={`flex-1 py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-brand-pink to-brand-lavender text-white shadow-md shadow-brand-pink/20"
                    : isCompleted
                    ? "text-brand-pink bg-brand-pinkLight/30 hover:bg-brand-pinkLight/50"
                    : "text-brand-gray hover:bg-slate-50 disabled:opacity-35"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form/Views Switcher */}
      <div className="min-h-[500px]">
        {/* STEP 1: CHOOSE BOX TYPE */}
        {activeStep === 1 && (
          <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
            <div className="text-center">
              <h2 className="font-display font-semibold text-lg">Choose Your Gift Container</h2>
              <p className="text-xs text-brand-gray">Select an empty box container to design your own custom hamper</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {boxes.map((box) => {
                const isSelected = customHamper.box?.id === box.id;
                return (
                  <div
                    key={box.id}
                    onClick={() => handleBoxSelect(box)}
                    className={`glass-card rounded-2xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-103 ${
                      isSelected ? "border-brand-pink shadow-glass bg-brand-pinkLight/15" : "border-brand-pink/15 hover:border-brand-pink/40"
                    } flex flex-col justify-between`}
                  >
                    <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                      <img src={box.image} alt={box.name} className="w-full h-full object-cover" />
                      {box.id === "box-ribbon" && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">GEN-Z Fav</span>
                      )}
                    </div>
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs text-brand-charcoal">{box.name}</h3>
                        <p className="text-[9px] text-brand-gray">Dimensions: {box.size}</p>
                        <p className="text-[10px] text-brand-pink font-extrabold mt-1">Capacity: Up to {box.maxItems} items</p>
                      </div>
                      <div className="pt-2 border-t border-brand-pink/5 flex items-center justify-between">
                        <span className="font-extrabold text-brand-charcoal text-xs">₹{box.basePrice}</span>
                        {isSelected ? (
                          <span className="bg-brand-pink text-white rounded-full p-0.5"><Check className="w-3 h-3" /></span>
                        ) : (
                          <span className="text-[10px] text-brand-pink font-extrabold hover:underline">Select</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
          </div>
        )}

        {/* STEP 2: CHOOSE ADD-ONS */}
        {activeStep === 2 && customHamper.box && (
          <div className="max-w-3xl mx-auto glass-card p-8 rounded-3xl border-brand-pink/15 space-y-6 animate-slide-up bg-white/70">
            <div className="text-center max-w-md mx-auto space-y-1">
              <h2 className="font-display font-semibold text-lg">Pick Luxury Add-ons & Wraps</h2>
              <p className="text-xs text-brand-gray">Level up the visual presentation of your box with romantic touches</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {getAddons().filter(ad => ad.isEnabled).map((ad) => {
                const isSelected = !!customHamper.personalization.decorations[ad.id];
                return (
                  <div
                    key={ad.id}
                    onClick={() => toggleHamperDecoration(ad.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-56 ${
                      isSelected
                        ? "border-brand-gold bg-amber-50/40 shadow-sm"
                        : "border-brand-pink/10 bg-white hover:border-brand-pink/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand-pink/10 bg-white shadow-sm">
                        <img src={ad.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100"} className="w-full h-full object-cover" alt={ad.name} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">+₹{ad.price}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-brand-charcoal">{ad.name}</h4>
                      <p className="text-[9px] text-brand-gray leading-relaxed">Elevate your package presentation with visual aesthetics.</p>
                    </div>
                    <div className="flex justify-end">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink pointer-events-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-6 border-t border-brand-pink/5">
              <button
                onClick={() => setActiveStep(1)}
                className="px-6 py-2.5 border border-brand-pink/15 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
              >
                &lt; Container Box
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="px-6 py-2.5 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-pink/95 transition-all"
              >
                Fill Products &gt;
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FILL PRODUCTS */}
        {activeStep === 3 && customHamper.box && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto animate-slide-up">
            
            {/* Products grid Left */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-sm text-brand-charcoal">Pack items inside your box</h2>
                  <p className="text-[10px] text-brand-gray">
                    Capacity: <span className="font-bold text-brand-pink">{currentCount} / {maxItems}</span> items selected
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCat("all")}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${
                      selectedCat === "all" ? "bg-brand-pink text-white" : "bg-white text-brand-charcoal hover:bg-brand-pinkLight"
                    }`}
                  >
                    All Items
                  </button>
                  {["chocolates", "plush-toys"].map((slug) => (
                    <button
                      key={slug}
                      onClick={() => setSelectedCat(slug)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold capitalize ${
                        selectedCat === slug ? "bg-brand-pink text-white" : "bg-white text-brand-charcoal hover:bg-brand-pinkLight"
                      }`}
                    >
                      {slug.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {filteredProducts.map((p) => {
                  const inBox = customHamper.items.find((i) => i.id === p.id);
                  const qtyInBox = inBox ? inBox.qty : 0;
                  const effectiveStock = getEffectiveStock(p.id, getProducts());
                  const isOutOfStock = effectiveStock <= 0;

                  return (
                    <div key={p.id} className="glass-card p-4 rounded-2xl border-brand-pink/10 hover:border-brand-pink/30 transition-all flex flex-col justify-between group relative bg-white">
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 relative">
                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                        {qtyInBox > 0 && (
                          <span className="absolute top-2 left-2 bg-brand-pink text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {qtyInBox}
                          </span>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow">
                              Out Of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="pt-3 space-y-2">
                        <div>
                          <h4 className="font-bold text-xs line-clamp-1">{p.name}</h4>
                          <p className="text-[10px] text-brand-pink font-semibold">₹{p.price}</p>
                          <p className="text-[8px] text-brand-gray">Stock: {isOutOfStock ? "Sold Out" : effectiveStock}</p>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-brand-pink/5">
                          {isOutOfStock ? (
                            <span className="w-full text-center py-1 text-red-500 font-extrabold text-[10px] bg-red-50 rounded-full border border-red-100">
                              Out Of Stock
                            </span>
                          ) : qtyInBox > 0 ? (
                            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-0.5 text-xs w-full justify-between">
                              <button onClick={() => removeHamperItem(p.id)} className="text-brand-gray hover:text-brand-pink font-extrabold px-1">-</button>
                              <span className="font-bold text-[10px]">{qtyInBox}</span>
                              <button
                                onClick={(e) => handleAddProductClick(e as any, p)}
                                disabled={currentCount + flyingCount >= maxItems || qtyInBox >= effectiveStock}
                                className="text-brand-gray hover:text-brand-pink font-extrabold px-1 disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => handleAddProductClick(e, p)}
                              disabled={currentCount + flyingCount >= maxItems}
                              className="w-full py-1 bg-brand-pink/10 hover:bg-brand-pink text-brand-pink hover:text-white rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1 disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" /> Pack Item
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Right */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-5 rounded-2xl border-brand-pink/15 sticky top-28 space-y-6 shadow-md bg-white">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-brand-charcoal">Hamper Basket</h3>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Box Capacity</span>
                    <span className={currentCount >= maxItems ? "text-red-500" : "text-brand-pink"}>{currentCount} / {maxItems} Items</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        currentCount >= maxItems ? "bg-red-500" : "bg-gradient-to-r from-brand-pink to-brand-lavender"
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    ></div>
                  </div>
                  {currentCount >= maxItems && <p className="text-[9px] text-red-500 font-bold">Box is full! Upgrade container or remove items.</p>}
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {customHamper.items.length === 0 ? (
                    <p className="text-[10px] text-brand-gray text-center py-8">Select items to pack inside your hamper chest...</p>
                  ) : (
                    customHamper.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs border-b border-brand-pink/5 pb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-bold text-brand-charcoal truncate">{item.name}</p>
                          <p className="text-[10px] text-brand-pink font-semibold">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-2 py-1">
                          <button onClick={() => removeHamperItem(item.id)} className="text-brand-gray hover:text-brand-pink font-bold px-1 text-[10px]">-</button>
                          <span className="font-bold text-[10px] w-3 text-center">{item.qty}</span>
                          <button
                            onClick={(e) => handleAddProductClick(e as any, item)}
                            disabled={currentCount + flyingCount >= maxItems}
                            className="text-brand-gray hover:text-brand-pink font-bold px-1 text-[10px] disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-brand-pink/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-gray">Box Container:</span>
                    <span className="font-bold">₹{customHamper.box.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-gray">Items Added:</span>
                    <span className="font-bold">₹{calculateItemsTotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-dashed border-brand-pink/10">
                    <span className="font-bold text-brand-charcoal">Running Total:</span>
                    <span className="font-extrabold text-brand-pink">₹{customHamper.box.basePrice + calculateItemsTotal()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setActiveStep(2)} className="flex-1 py-3 border border-brand-pink/10 hover:bg-brand-pinkLight rounded-xl text-[10px] font-bold transition-all">&lt; Pick Add-ons</button>
                  <button
                    onClick={() => setActiveStep(4)}
                    disabled={currentCount === 0}
                    className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-[10px] font-bold hover:bg-brand-pink/90 transition-all disabled:opacity-50"
                  >
                    Personalize &gt;
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 4: PERSONALIZE */}
        {activeStep === 4 && customHamper.box && (
          <div className="max-w-4xl mx-auto glass-card p-8 rounded-3xl border-brand-pink/15 space-y-8 animate-slide-up bg-white/80">
            <div className="text-center max-w-md mx-auto">
              <h2 className="font-display font-semibold text-lg">Add Emotional Accents</h2>
              <p className="text-xs text-brand-gray">Inscribe memories, custom letters, or select digital surprise pages themes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Input fields */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-brand-gray tracking-wider">Custom Handwritten Letter (Free)</label>
                  <textarea
                    rows={3}
                    value={customHamper.personalization.letter}
                    onChange={(e) => updateHamperPersonalization("letter", e.target.value)}
                    placeholder="Type words that we will handwrite on vintage scroll paper..."
                    className="w-full text-xs p-3 rounded-xl border border-brand-pink/15 focus:outline-none focus:border-brand-pink bg-white/70"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-brand-gray tracking-wider">Greeting Card Text (Free)</label>
                  <input
                    type="text"
                    value={customHamper.personalization.card}
                    onChange={(e) => updateHamperPersonalization("card", e.target.value)}
                    placeholder="E.g. Happy Birthday Arjun! Love, Priya."
                    className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 focus:outline-none focus:border-brand-pink bg-white/70"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-brand-gray tracking-wider">Custom Engraved Name Tag (Free)</label>
                  <input
                    type="text"
                    value={customHamper.personalization.nameTag}
                    onChange={(e) => updateHamperPersonalization("nameTag", e.target.value)}
                    placeholder="Name tag attached to ribbon wrapping"
                    className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 focus:outline-none focus:border-brand-pink bg-white/70"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block className block text-[10px] font-bold uppercase text-brand-gray tracking-wider">Personalized Photo (+₹15 each)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={handlePhotoUploadMock} className="px-4 py-2 border border-brand-pink/20 bg-white hover:bg-brand-pinkLight text-brand-pink rounded-lg text-xs font-bold transition-all">
                        <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> Upload Photo
                      </button>
                      <span className="text-[10px] text-brand-gray font-semibold">{(customHamper.personalization.photos && customHamper.personalization.photos.length > 0) ? `${customHamper.personalization.photos.length} photo(s) uploaded` : "No photos uploaded"}</span>
                    </div>
                    {customHamper.personalization.photos && customHamper.personalization.photos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {customHamper.personalization.photos.map((ph, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-brand-pinkLight border border-brand-pink/15 text-brand-pink text-[9px] font-bold py-1 px-2.5 rounded-full">
                            {ph}
                            <button type="button" onClick={() => removePhoto(idx)} className="hover:text-brand-charcoal text-slate-400 font-extrabold ml-1">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-brand-gray tracking-wider">Voice Message QR (+₹25)</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={handleVoiceRecordMock} className="px-4 py-2 border border-brand-lavender/20 bg-white hover:bg-brand-lavenderLight text-brand-lavender rounded-lg text-xs font-bold transition-all">
                      <Mic className="w-3.5 h-3.5 inline mr-1" /> Record Audio
                    </button>
                    <span className="text-[10px] text-brand-gray font-semibold">{customHamper.personalization.voiceQrAttached ? "✅ Audio tag attached (+₹25)" : "No voice recording"}</span>
                  </div>
                </div>
              </div>

              {/* Animated Wishes Surprise Page Theme Selection */}
              <div className="space-y-6 bg-brand-pinkLight/10 p-6 rounded-2xl border border-brand-pink/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-brand-charcoal">Surprise Page Animated Wishes Theme</h3>
                  <p className="text-[9px] text-brand-gray">Select the visual template for your custom surprise page attached to this hamper.</p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[
                      { id: "romantic", name: "Romantic Rose", desc: "Velvet roses, floating hearts", style: "border-pink-300 text-pink-700 bg-pink-50" },
                      { id: "cyberpunk", name: "Cyber Neon", desc: "Glitch text, techno beats", style: "border-purple-300 text-purple-700 bg-purple-50" },
                      { id: "retro", name: "Retro Polaroid", desc: "Vintage journal, tape cassette", style: "border-amber-300 text-amber-700 bg-amber-50" },
                      { id: "disco", name: "Party Disco", desc: "Sparkle lights, confetti drop", style: "border-indigo-300 text-indigo-700 bg-indigo-50" }
                    ].map((theme) => {
                      const isSelected = selectedTheme === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected ? "border-brand-pink bg-white shadow-sm scale-102" : "border-slate-200 hover:border-slate-300 bg-white/50"
                          }`}
                        >
                          <h4 className="font-bold text-[10px]">{theme.name}</h4>
                          <p className="text-[8px] text-brand-gray mt-0.5">{theme.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-pink/15 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Custom Base + Products:</span>
                    <span className="font-bold">₹{customHamper.box.basePrice + calculateItemsTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Selected Extras:</span>
                    <span className="font-bold">₹{calculatePersonalizationsCost()}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-dashed border-brand-pink/10">
                    <span className="font-bold text-brand-charcoal">Hamper Subtotal:</span>
                    <span className="font-extrabold text-brand-pink">₹{calculateSubtotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-brand-pink/5">
              <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 border border-brand-pink/10 hover:bg-brand-pinkLight rounded-xl text-xs font-bold transition-all">&lt; Back to Products</button>
              <button onClick={() => setActiveStep(5)} className="px-6 py-2.5 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-pink/90 transition-all">Preview Hamper &gt;</button>
            </div>
          </div>
        )}

        {/* STEP 5: LIVE PREVIEW */}
        {activeStep === 5 && customHamper.box && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
            
            {/* Visual Box Rendering Left */}
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-brand-pink/10 rounded-3xl relative shadow-lg overflow-hidden min-h-[400px]">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#FF6FAE_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className={`w-64 h-64 rounded-3xl relative border-4 border-amber-900 bg-amber-50 shadow-2xl flex flex-wrap items-center justify-center p-6 ${customHamper.personalization.decorations["ad-1"] ? "ring-8 ring-amber-300 ring-offset-4" : ""}`}>
                
                {customHamper.personalization.decorations["ad-3"] && (
                  <>
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-red-600 h-10 z-20 shadow-md"></div>
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-red-600 w-10 z-20 shadow-md"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-red-600 rounded-full z-30 shadow-lg flex items-center justify-center text-white text-[9px] font-bold">LOVE</div>
                  </>
                )}

                <div className="grid grid-cols-3 gap-2 w-full h-full relative z-10">
                  {customHamper.items.map((item, idx) => (
                    <div key={idx} className="aspect-square bg-white border border-brand-pink/10 rounded-lg overflow-hidden flex items-center justify-center p-1 shadow-sm">
                      <span className="text-[10px] font-bold truncate">{item.name}</span>
                    </div>
                  ))}
                </div>

                {customHamper.personalization.decorations["ad-2"] && (
                  <div className="absolute inset-0 border-[6px] border-emerald-100 rounded-2xl pointer-events-none z-15 opacity-80"></div>
                )}

                {customHamper.personalization.nameTag && (
                  <div className="absolute -bottom-2 right-4 bg-yellow-50 border border-amber-800 text-[8px] font-bold px-2 py-0.5 rotate-6 shadow-sm z-30 text-amber-900 uppercase">
                    For: {customHamper.personalization.nameTag}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-6 relative z-10 text-[10px] font-bold">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 capitalize">🎨 Theme: {selectedTheme}</span>
                {getAddons().filter(ad => customHamper.personalization.decorations[ad.id]).map((ad) => (
                  <span key={ad.id} className="bg-pink-100 text-brand-pink px-3 py-1 rounded-full border border-brand-pink/20">✨ {ad.name}</span>
                ))}
                {customHamper.personalization.voiceQrAttached && <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200">🎵 Voice QR tag</span>}
                {((customHamper.personalization.photos && customHamper.personalization.photos.length > 0) || customHamper.personalization.photoName) && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">📸 Polaroid Photo</span>}
              </div>
            </div>

            {/* Price Details Summary Right */}
            <div class="glass-card p-8 rounded-3xl border-brand-pink/15 space-y-6 flex flex-col justify-between bg-white">
              <div class="space-y-4">
                <h2 class="font-display font-bold text-xl text-brand-charcoal">Review Hamper Configuration</h2>
                
                <div class="space-y-2.5 text-xs">
                  <div class="flex items-center gap-2 border-b border-brand-pink/5 pb-2">
                    <Package className="w-4 h-4 text-brand-pink" />
                    <div>
                      <p class="font-bold">{customHamper.box.name}</p>
                      <p class="text-[9px] text-brand-gray">Container base cost: ₹{customHamper.box.basePrice}</p>
                    </div>
                  </div>

                  <div class="border-b border-brand-pink/5 pb-2">
                    <p class="text-[9px] font-bold uppercase tracking-wider text-brand-gray mb-1">Packed Goods</p>
                    <div class="grid grid-cols-1 gap-1 text-[11px] font-medium text-brand-charcoal">
                      {customHamper.items.map((it) => (
                        <div key={it.id} class="flex justify-between">
                          <span>{it.name} <strong class="text-brand-pink">x{it.qty}</strong></span>
                          <span>₹{it.price * it.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p class="text-[9px] font-bold uppercase tracking-wider text-brand-gray mb-1">Personalizations</p>
                    <div class="grid grid-cols-1 gap-1.5 text-[11px] font-medium text-brand-charcoal">
                      {customHamper.personalization.letter && <div class="flex justify-between"><span>Handwritten letter</span><span class="text-brand-pink">Attached</span></div>}
                      {customHamper.personalization.card && <div class="flex justify-between"><span>Greeting Card Text</span><span class="text-brand-pink truncate max-w-[120px]">{customHamper.personalization.card}</span></div>}
                      {customHamper.personalization.nameTag && <div class="flex justify-between"><span>Engraved Name Tag</span><span class="text-brand-pink">{customHamper.personalization.nameTag}</span></div>}
                      {((customHamper.personalization.photos && customHamper.personalization.photos.length > 0) || customHamper.personalization.photoName) && <div className="flex justify-between"><span>Photo Upload (+₹15)</span><span>₹{(customHamper.personalization.photos || [customHamper.personalization.photoName]).length * 15}</span></div>}
                      {customHamper.personalization.voiceQrAttached && <div className="flex justify-between"><span>Voice Message QR (+₹25)</span><span>₹25</span></div>}
                      {getAddons().filter(ad => customHamper.personalization.decorations[ad.id]).map((ad) => (
                        <div key={ad.id} class="flex justify-between">
                          <span>{ad.name}</span>
                          <span>₹{ad.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-brand-pink/15 space-y-4">
                <div class="flex justify-between items-end">
                  <div>
                    <span class="text-xs text-brand-gray block font-bold">Hamper Price</span>
                    <span class="text-[10px] text-brand-gray">Excluding tax & delivery</span>
                  </div>
                  <span class="font-display font-extrabold text-3xl text-brand-pink">�                <div className="flex gap-3">
                  <button onClick={() => setActiveStep(4)} className="flex-1 py-3.5 border border-brand-pink/10 hover:bg-brand-pinkLight rounded-xl text-xs font-bold transition-all">Edit Accents</button>
                  <button
                    onClick={() => {
                      commitCustomHamperToCart();
                      router.push("/cart");
                    }}
                    className="flex-1 py-3.5 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-pink/90 hover:shadow-lg hover:shadow-brand-pink/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Add Hamper to Cart &gt;
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>         </div>
          </div>
        )}
      </div>
      </div>

      {/* STEP 3 Bottom Empty Box Fixed Drawer Overlay replaced with Viewport Floating Hamper Box */}
      {activeStep >= 2 && activeStep <= 5 && customHamper.box && (
        <div className="fixed bottom-6 left-6 z-40 pointer-events-auto">
          <div
            id="floating-hamper-box"
            onClick={() => setActiveStep(5)}
            className="bg-gradient-to-br from-stone-900 to-stone-950 border-2 border-brand-gold/30 rounded-3xl p-4 shadow-2xl flex items-center gap-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
          >
            {/* 3D Box Illustration with Wiggle / Bounce animation */}
            <motion.div
              id="drawer-box-container"
              animate={boxWiggle ? { scale: [1, 1.25, 1], rotate: [0, 6, -6, 0] } : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative w-16 h-16 bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl shadow-lg border-2 border-amber-950 flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-2"
            >
              {/* Internal craft paper texture styling */}
              <div className="absolute inset-1.5 bg-[#f5e6d3] rounded-xl shadow-inner flex flex-wrap items-center justify-center p-1.5 gap-0.5">
                {/* Mini packed items previews */}
                {customHamper.items.flatMap(item => Array(item.qty).fill(item)).slice(0, 4).map((it, idx) => {
                  const prod = hamperProducts.find(p => p.id === it.id);
                  return (
                    <img
                      key={idx}
                      src={prod ? prod.image : ""}
                      className="w-5 h-5 rounded-md object-cover border border-amber-800/10 shadow-sm"
                      alt=""
                    />
                  );
                })}
                {customHamper.items.length === 0 && (
                  <span className="text-[8px] text-amber-800/60 font-bold uppercase tracking-wider text-center">Empty</span>
                )}
              </div>
              {/* Red/Gold Ribbon wrapped around the box for 3D look */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-red-600 h-2.5 shadow-sm opacity-90 z-20"></div>
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-red-600 w-2.5 shadow-sm opacity-90 z-20"></div>
              {/* Ribbon Knot Bow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-brand-gold rounded-full z-30 shadow-md flex items-center justify-center border border-white/20">
                <span className="w-1.5 h-1.5 bg-red-700 rounded-full"></span>
              </div>
            </motion.div>

            {/* Box Details */}
            <div className="space-y-1 text-white">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-brand-gold group-hover:text-white transition-colors">
                {customHamper.box.name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-red-400 font-bold">
                  {currentCount} / {maxItems} Packed
                </span>
                <span className="text-[10px] text-slate-300 font-bold">
                  Total: ₹{customHamper.box.basePrice + calculateItemsTotal()}
                </span>
              </div>
            </div>

            {/* Selected Products List (as before) */}
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 max-w-[200px] overflow-x-auto">
              {customHamper.items.length === 0 ? (
                <span className="text-[9px] text-slate-400 italic">Empty box</span>
              ) : (
                customHamper.items.map((item) => {
                  const prod = hamperProducts.find((p) => p.id === item.id);
                  return (
                    <div key={item.id} className="relative w-8 h-8 rounded-lg bg-white/10 border border-white/5 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                      <img src={prod ? prod.image : ""} className="w-full h-full object-cover rounded-lg" alt="" />
                      <span className="absolute -top-1.5 -right-1.5 bg-brand-pink text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                        {item.qty}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
