"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/db";
import {
  MapPin,
  Truck,
  ShieldCheck,
  Zap,
  Moon,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  Check,
  Plus,
  Calendar,
  Mail,
  Phone,
  ShoppingCart,
  Info,
  CheckCircle,
  X,
  Ticket,
  Gift,
  Lock
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    appliedCoupon,
    useRewardPoints,
    applyCoupon,
    removeCoupon,
    setUseRewardPoints,
    calculateSubtotal,
    calculateDetailedBreakdown,
    clearCart,
    updateQty,
    removeFromCart
  } = useCart();
  const { user, openLoginModal } = useAuth();

  // Wizard state: 1: Cart Review, 2: Address, 3: Summary, 4: Payment
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState("");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliverySlot, setDeliverySlot] = useState("Standard Delivery Slot");
  
  // Coupon input state
  const [couponCode, setCouponCode] = useState("");

  // Address Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrCountry, setAddrCountry] = useState("India");

  // Payment Simulation Modal
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulateData, setSimulateData] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  // Load Saved Addresses
  useEffect(() => {
    const saved = localStorage.getItem("lovespy_addresses");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAddresses(parsed);
      const def = parsed.find((a: any) => a.isDefault);
      if (def) setSelectedAddrId(def.id);
      else if (parsed.length > 0) setSelectedAddrId(parsed[0].id);
    }
    // No saved addresses: start with empty list — customer fills their own

    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Fetch store shipping settings
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setStoreSettings(d.settings);
        }
      })
      .catch((e) => console.error("Failed to load store settings", e));
  }, []);

  // Autofill City and State by Pincode API lookup
  useEffect(() => {
    const pin = addrPincode.trim().replace(/\D/g, "");
    if (pin.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice[0]) {
            const po = data[0].PostOffice[0];
            setAddrCity(po.District || "");
            setAddrState(po.State || "");
          } else {
            // Fallback mapper
            const prefix = pin.substring(0, 2);
            const mapping: Record<string, { city: string; state: string }> = {
              "11": { city: "New Delhi", state: "Delhi" },
              "20": { city: "Noida", state: "Uttar Pradesh" },
              "21": { city: "Kanpur", state: "Uttar Pradesh" },
              "22": { city: "Lucknow", state: "Uttar Pradesh" },
              "30": { city: "Jaipur", state: "Rajasthan" },
              "38": { city: "Ahmedabad", state: "Gujarat" },
              "40": { city: "Mumbai", state: "Maharashtra" },
              "41": { city: "Pune", state: "Maharashtra" },
              "50": { city: "Hyderabad", state: "Telangana" },
              "56": { city: "Bengaluru", state: "Karnataka" },
              "60": { city: "Chennai", state: "Tamil Nadu" },
              "70": { city: "Kolkata", state: "West Bengal" }
            };
            const matched = mapping[prefix];
            if (matched) {
              setAddrCity(matched.city);
              setAddrState(matched.state);
            }
          }
        })
        .catch((err) => {
          console.error("Pincode API failed, using fallback", err);
          const prefix = pin.substring(0, 2);
          const mapping: Record<string, { city: string; state: string }> = {
            "11": { city: "New Delhi", state: "Delhi" },
            "20": { city: "Noida", state: "Uttar Pradesh" },
            "21": { city: "Kanpur", state: "Uttar Pradesh" },
            "22": { city: "Lucknow", state: "Uttar Pradesh" },
            "30": { city: "Jaipur", state: "Rajasthan" },
            "38": { city: "Ahmedabad", state: "Gujarat" },
            "40": { city: "Mumbai", state: "Maharashtra" },
            "41": { city: "Pune", state: "Maharashtra" },
            "50": { city: "Hyderabad", state: "Telangana" },
            "56": { city: "Bengaluru", state: "Karnataka" },
            "60": { city: "Chennai", state: "Tamil Nadu" },
            "70": { city: "Kolkata", state: "West Bengal" }
          };
          const matched = mapping[prefix];
          if (matched) {
            setAddrCity(matched.city);
            setAddrState(matched.state);
          }
        });
    }
  }, [addrPincode]);



  // Cost calculation
  const subtotal = calculateSubtotal();
  let shipping = 150;
  if (storeSettings) {
    if (storeSettings.freeShippingEnabled && subtotal >= storeSettings.freeShippingThreshold) {
      shipping = 0;
    } else {
      shipping = storeSettings.deliveryCharge;
    }
  } else {
    shipping = subtotal > 2999 ? 0 : 150;
  }

  // Adjust shipping for midnight delivery slot
  if (deliveryType === "midnight") {
    shipping += 100;
  }

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      discount = Math.round(subtotal * (appliedCoupon.value / 100));
    } else {
      discount = appliedCoupon.value;
    }
  }

  const rewardsDiscount = 0;
  const finalTotal = Math.max(0, subtotal + shipping - discount - rewardsDiscount);

  // Address Actions
  const openNewAddress = () => {
    setEditingAddress(null);
    setAddrLabel("Home");
    setAddrName(user?.name || "");
    setAddrPhone(user?.phone || "");
    setAddrLine1("");
    setAddrLine2("");
    setAddrCity("");
    setAddrState("");
    setAddrPincode("");
    setAddrCountry("India");
    setAddrIsDefault(addresses.length === 0);
    setShowAddressModal(true);
  };

  const openEditAddress = (addr: any) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrLine1(addr.line1);
    setAddrLine2(addr.line2 || "");
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrCountry(addr.country || "India");
    setAddrIsDefault(!!addr.isDefault);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remove this address permanently?")) {
      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);
      localStorage.setItem("lovespy_addresses", JSON.stringify(updated));
      if (selectedAddrId === id && updated.length > 0) {
        setSelectedAddrId(updated[0].id);
      }
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      alert("Please fill in all required fields marked with *");
      return;
    }
    if (addrPhone.replace(/\D/g, "").length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (addrPincode.replace(/\D/g, "").length !== 6) {
      alert("Please enter a valid 6-digit Pincode.");
      return;
    }

    let updated = [...addresses];
    const newAddr = {
      id: editingAddress ? editingAddress.id : `addr-${Date.now()}`,
      label: addrLabel,
      name: addrName,
      phone: addrPhone,
      line1: addrLine1,
      line2: addrLine2,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      country: addrCountry,
      isDefault: addrIsDefault
    };

    if (addrIsDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }

    if (editingAddress) {
      updated = updated.map((a) => (a.id === editingAddress.id ? newAddr : a));
    } else {
      updated.push(newAddr);
    }

    // fallback check
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }

    setAddresses(updated);
    localStorage.setItem("lovespy_addresses", JSON.stringify(updated));
    setSelectedAddrId(newAddr.id);
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleApplyCouponCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const success = applyCoupon(couponCode.trim().toUpperCase());
    if (success) {
      alert("Promo code applied successfully!");
    } else {
      alert("Invalid code or minimum purchase criteria not met.");
    }
  };

  // Payment triggers
  const handlePayment = async () => {
    try {
      const activeAddress = addresses.find((a) => a.id === selectedAddrId);
      if (!activeAddress) {
        alert("Please select or add a delivery address to continue.");
        setStep(2);
        return;
      }

      // 1. Fetch Razorpay Order ID from server (with secure verification)
      const res = await fetch("/api/orders/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          appliedCoupon,
          useRewardPoints,
          userPoints: user?.points || 0,
          deliveryType,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Failed to initiate payment. Please try again.");
        return;
      }

      // 2. Setup Razorpay options
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: "INR",
        name: "Lovespy Gifting",
        description: "Unified Cart Payment",
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/orders/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // 4. Create standard orders
              const newOrder = createOrder({
                user_id: user?.id || "user-1",
                address_id: selectedAddrId,
                delivery_name: activeAddress.name,
                delivery_phone: activeAddress.phone,
                delivery_line1: activeAddress.line1,
                delivery_line2: activeAddress.line2,
                delivery_city: activeAddress.city,
                delivery_state: activeAddress.state,
                delivery_pincode: activeAddress.pincode,
                delivery_type: deliveryType,
                delivery_date: new Date(deliveryDate),
                delivery_slot: deliverySlot,
                subtotal,
                shipping_charge: shipping,
                discount_amount: discount + rewardsDiscount,
                total_amount: finalTotal,
                coupon_code: appliedCoupon?.code || "",
                points_redeemed: 0,
                items: cart,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });

              // Sync order stats to Customer Directory
              if (user && user.id !== "usr-guest") {
                try {
                  const { getCustomers, setCustomers } = require("@/lib/db");
                  const customers = getCustomers();
                  const existingIdx = customers.findIndex((c: any) => c.id === user.id || (user.phone && c.phone === user.phone) || (user.email && c.email === user.email));
                  
                  const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                  const nowStr = todayStr + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

                  if (existingIdx > -1) {
                    customers[existingIdx].totalOrders = (customers[existingIdx].totalOrders || 0) + 1;
                    customers[existingIdx].totalAmountSpent = (customers[existingIdx].totalAmountSpent || 0) + finalTotal;
                    customers[existingIdx].lastLogin = nowStr;
                  } else {
                    customers.push({
                      id: user.id || `usr-${Date.now()}`,
                      name: user.name || "",
                      phone: user.phone || "",
                      email: user.email || "",
                      registeredDate: todayStr,
                      lastLogin: nowStr,
                      totalOrders: 1,
                      totalAmountSpent: finalTotal,
                      status: "Active"
                    });
                  }
                  setCustomers(customers);
                } catch (err) {
                  console.error("Failed to sync customer order stats:", err);
                }
              }

              clearCart();
              router.push(`/checkout/success?id=${newOrder.id}`);
            } else {
              alert(verifyData.error || "Payment signature verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Verification failed. Please contact support.");
          }
        },
        prefill: {
          name: activeAddress.name,
          contact: activeAddress.phone,
          email: user?.email || "",
        },
        theme: {
          color: "#C1121F",
        },
        modal: {
          ondismiss: function () {
            alert("Payment checkout was closed.");
          },
        },
      };

      if (data.is_mock) {
        setSimulateData({
          amount: finalTotal,
          orderId: data.order_id,
          handler: options.handler
        });
        setShowSimulateModal(true);
      } else {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Payment initiation failed. Please check your connection.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up pb-12">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="font-display font-bold text-3xl bg-gradient-to-r from-brand-pink to-brand-lavender bg-clip-text text-transparent">
          Secure Premium Checkout
        </h1>
        <p className="text-xs text-brand-gray">Complete your details to send your bespoke gifts on time</p>
      </div>

      {/* 3-Step Wizard Indicator */}
      <div className="relative max-w-2xl mx-auto pt-4 pb-2">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
        <div className="relative z-10 flex justify-between">
          {[
            { s: 1, label: "Cart Review", desc: "Items List" },
            { s: 2, label: "Shipping Address", desc: "Where to send" },
            { s: 3, label: "Secure Payment", desc: "Complete order" }
          ].map((item) => {
            const isCompleted = step > item.s;
            const isActive = step === item.s;
            return (
              <div key={item.s} className="flex flex-col items-center space-y-1">
                <button
                  onClick={() => {
                    if (item.s < step) setStep(item.s);
                  }}
                  disabled={item.s >= step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all border ${
                    isCompleted
                      ? "bg-brand-pink border-brand-pink text-white"
                      : isActive
                      ? "bg-white border-brand-pink text-brand-pink ring-4 ring-brand-pinkLight"
                      : "bg-slate-100 border-slate-200 text-brand-gray cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? <Check className="w-4.5 h-4.5" /> : item.s}
                </button>
                <div className="text-center">
                  <span className={`block text-[9px] font-bold uppercase tracking-wider ${isActive ? "text-brand-pink" : "text-brand-charcoal"}`}>
                    {item.label}
                  </span>
                  <span className="hidden sm:block text-[8px] text-brand-gray">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Work Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-brand-pink/10 shadow-sm bg-white">
            
            {/* STEP 1: CART REVIEW */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-brand-pink/5 pb-3">
                  <h2 className="font-display font-bold text-lg text-brand-charcoal">1. Review Your Gifting Bag</h2>
                  <p className="text-xs text-brand-gray">Confirm prices, update gift counts, or remove Accents</p>
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-brand-pink/5 rounded-2xl bg-slate-50/50">
                      <img src={item.image} className="w-14 h-14 rounded-xl object-cover border bg-white" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs text-brand-charcoal truncate">{item.name}</h3>
                        <p className="text-[10px] text-brand-pink font-semibold">₹{item.price}</p>
                        
                        {item.type === "custom-surprise-page" && (
                          <div className="text-[9px] text-brand-gray bg-white border p-2 rounded-lg mt-1 max-w-[300px]">
                            <strong>For:</strong> {item.details?.receiverName} | <strong>Theme:</strong> <span className="uppercase font-semibold text-brand-pink">{item.details?.theme}</span>
                          </div>
                        )}
                        {item.type === "custom-hamper" && (
                          <div className="text-[9px] text-brand-gray bg-white border p-2 rounded-lg mt-1 max-w-[300px] leading-relaxed">
                            <strong>Box:</strong> {item.details?.box?.name} <br />
                            <strong>Items:</strong> {item.details?.items?.map((i: any) => `${i.name} (x${i.qty})`).join(", ")}
                          </div>
                        )}
                      </div>

                      {/* Quantity Adjuster */}
                      <div className="flex items-center gap-2 bg-white rounded-full px-2.5 py-1 border shadow-sm">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="text-brand-gray hover:text-brand-pink text-xs font-bold px-1">-</button>
                        <span className="font-bold text-xs w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-brand-gray hover:text-brand-pink text-xs font-bold px-1">+</button>
                      </div>

                      <button onClick={() => removeFromCart(item.id)} className="text-brand-gray hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-brand-pink/5">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-brand-pink text-white rounded-full text-xs font-bold hover:bg-brand-pink/90 transition-all flex items-center gap-1 shadow-md shadow-brand-pink/10"
                  >
                    Select Delivery Address <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ADDRESS SELECTION */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-brand-pink/5 pb-3">
                  <div>
                    <h2 className="font-display font-bold text-lg text-brand-charcoal">2. Choose Delivery Address</h2>
                    <p className="text-xs text-brand-gray">Select from saved addresses or add a new card</p>
                  </div>
                  <button
                    onClick={openNewAddress}
                    className="px-3 py-1.5 border border-brand-pink text-brand-pink rounded-full text-[10px] font-bold hover:bg-brand-pinkLight flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddrId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddrId(addr.id)}
                        className={`border-2 rounded-2xl p-5 cursor-pointer relative transition-all hover:scale-[1.01] hover:border-brand-pink flex flex-col justify-between h-44 ${
                          isSelected ? "border-brand-pink bg-brand-pinkLight/5 shadow-sm" : "border-brand-pink/10 bg-white"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="bg-brand-pink/15 text-brand-pink font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-full">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[8px] font-bold text-slate-500 border border-slate-300 rounded px-1">
                                Default
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-brand-charcoal pt-1">{addr.name}</h4>
                          <p className="text-[10px] text-brand-gray leading-relaxed line-clamp-2">
                            {addr.line1}, {addr.line2}
                          </p>
                          <p className="text-[10px] text-brand-gray">
                            {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-brand-pink/5 mt-auto">
                          <span className="text-[10px] text-brand-charcoal font-semibold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-brand-pink" /> {addr.phone}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditAddress(addr);
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteAddress(addr.id, e)}
                              className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute -top-2.5 -right-2.5 bg-brand-pink text-white rounded-full p-1 shadow-md border-2 border-white">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-6 border-t border-brand-pink/5 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 border border-brand-pink/15 rounded-full text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 text-slate-700 bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to Bag
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedAddrId) {
                        alert("Please select or add an address to continue.");
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-6 py-3 bg-brand-pink text-white rounded-full text-xs font-bold hover:bg-brand-pink/90 transition-all flex items-center gap-1 shadow-md"
                  >
                    Proceed to Payment <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ORDER SUMMARY */}
            {/* STEP 3: PAYMENTS CHECKOUT */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-brand-pink/5 pb-3">
                  <h2 className="font-display font-bold text-lg text-brand-charcoal">3. Secure Payment Gateway</h2>
                  <p className="text-xs text-brand-gray">Authorize checkout totals via Razorpay Secure checkout channel</p>
                </div>

                {/* Selected Address Summary preview */}
                {(() => {
                  const activeAddress = addresses.find((a) => a.id === selectedAddrId);
                  return activeAddress ? (
                    <div className="p-4 border border-brand-pink/10 rounded-2xl bg-brand-pinkLight/5 space-y-1.5 text-xs text-brand-charcoal">
                      <div className="flex justify-between items-center font-bold text-brand-pink">
                        <span>Fulfillment Destination Target</span>
                        <button onClick={() => setStep(2)} className="text-[9px] hover:underline uppercase tracking-wider font-extrabold">Change</button>
                      </div>
                      <p><strong>Recipient Name:</strong> {activeAddress.name} | <strong>Mobile:</strong> {activeAddress.phone}</p>
                      <p className="text-brand-gray"><strong>Address:</strong> {activeAddress.line1}, {activeAddress.line2 ? `${activeAddress.line2}, ` : ''}{activeAddress.city}, {activeAddress.state} - {activeAddress.pincode}</p>
                    </div>
                  ) : null;
                })()}

                <div className="space-y-4">
                  <div className="bg-slate-50 border rounded-2xl p-5 space-y-3">
                    <p className="text-[10px] font-extrabold text-brand-gray uppercase tracking-wider">Select payment method</p>
                    <label className="flex items-center gap-3 p-4 border-2 border-brand-pink rounded-xl bg-white text-xs font-bold text-brand-charcoal select-none cursor-pointer">
                      <input type="radio" checked readOnly className="text-brand-pink focus:ring-brand-pink" />
                      <CreditCard className="w-5 h-5 text-brand-pink" />
                      <span className="flex-1">Razorpay Secured Cards / UPI / Netbanking</span>
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-extrabold">Instant</span>
                    </label>
                  </div>

                  <div className="p-4 rounded-xl border border-brand-pink/10 bg-brand-pinkLight/5 flex items-start gap-2.5 text-xs text-brand-gray leading-relaxed">
                    <ShieldCheck className="w-5 h-5 text-brand-pink flex-shrink-0 mt-0.5" />
                    <p>
                      Your transaction details are encrypted securely. All payments go through a secure 128-bit SSL encrypted connection. In simulated mode, payments can be finalized mockingly.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-brand-pink/5">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 border border-brand-pink/15 rounded-full text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 text-slate-700 bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" /> Address
                  </button>
                  <button
                    onClick={handlePayment}
                    className="px-8 py-3.5 bg-gradient-to-r from-brand-pink to-brand-lavender text-white rounded-full text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    Pay & Confirm Order (₹{finalTotal})
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Pricing Summary Sidepanel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-brand-pink/15 bg-white shadow-md space-y-6">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-brand-charcoal border-b border-brand-pink/5 pb-3">
              Order Pricing
            </h3>

            {/* Coupons inside Checkout panel */}
            {step === 1 && (
              <form onSubmit={handleApplyCouponCode} className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="LOVESPY10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 text-xs py-2 px-3 rounded-lg border focus:outline-none uppercase font-bold text-brand-charcoal"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => { removeCoupon(); setCouponCode(""); }}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button type="submit" className="px-4 py-2 bg-brand-pink text-white rounded-lg text-xs font-bold hover:bg-brand-pink/90 transition-colors">
                      Apply
                    </button>
                  )}
                </div>
              </form>
            )}


            {/* Costs Table */}
            <div className="space-y-2.5 text-xs">
              {(() => {
                const breakdown = calculateDetailedBreakdown();
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-brand-gray">Gifts Total:</span>
                      <span className="font-semibold">₹{breakdown.productsTotal}</span>
                    </div>
                    {breakdown.boxPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Box Container Base:</span>
                        <span className="font-semibold">₹{breakdown.boxPrice}</span>
                      </div>
                    )}
                    {breakdown.fairyLights > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Fairy Lights accent:</span>
                        <span className="font-semibold">₹{breakdown.fairyLights}</span>
                      </div>
                    )}
                    {breakdown.flowers > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Floral accent decoration:</span>
                        <span className="font-semibold">₹{breakdown.flowers}</span>
                      </div>
                    )}
                    {breakdown.ribbon > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Satin Ribbon accent:</span>
                        <span className="font-semibold">₹{breakdown.ribbon}</span>
                      </div>
                    )}
                    {breakdown.stickers > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Sticker customization pack:</span>
                        <span className="font-semibold">₹{breakdown.stickers}</span>
                      </div>
                    )}
                    {breakdown.velvet > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Velvet Wrapping box base:</span>
                        <span className="font-semibold">₹{breakdown.velvet}</span>
                      </div>
                    )}
                    {breakdown.photoUpload > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Polaroid Photo memory printing:</span>
                        <span className="font-semibold">₹{breakdown.photoUpload}</span>
                      </div>
                    )}
                    {breakdown.voiceQr > 0 && (
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Voice Greeting QR tag:</span>
                        <span className="font-semibold">₹{breakdown.voiceQr}</span>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="flex justify-between">
                <span className="text-brand-gray">Shipping Logistics fee:</span>
                <span className="font-semibold">₹{shipping}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-brand-pink font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-₹{discount}</span>
                </div>
              )}



              <div className="flex justify-between text-sm font-bold border-t border-dashed border-brand-pink/15 pt-2 text-brand-pink">
                <span>Final Payable:</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Edit/Add Modal Overlay */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-brand-pink/15 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-2.5 py-1 rounded-full">
                {editingAddress ? "Edit Destination Address" : "Add Gifting Destination Address"}
              </span>
              <h3 className="font-display font-bold text-lg text-brand-charcoal mt-2.5">
                {editingAddress ? "Update saved address card" : "Fill recipient shipping address"}
              </h3>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs text-brand-charcoal">
              <div className="grid grid-cols-3 gap-2">
                {["Home", "Office", "Friend", "Family", "Other"].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddrLabel(lbl)}
                    className={`py-2 border text-center rounded-xl font-semibold transition-all ${
                      addrLabel === lbl
                        ? "bg-brand-pink text-white border-brand-pink shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  placeholder="E.g. Priya Sharma"
                  className="w-full text-xs p-3 rounded-xl border focus:outline-none bg-slate-50 focus:border-brand-pink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Recipient Mobile * (10 Digits)</label>
                <input
                  type="tel"
                  required
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="E.g. 9876543210"
                  className="w-full text-xs p-3 rounded-xl border focus:outline-none bg-slate-50 focus:border-brand-pink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Address Line 1 * (House/Plot/Flat)</label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  placeholder="E.g. Flat F-12, Green Park Extension"
                  className="w-full text-xs p-3 rounded-xl border focus:outline-none bg-slate-50 focus:border-brand-pink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Address Line 2 (Area/Landmark)</label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  placeholder="E.g. Near Metro Station Gate 3"
                  className="w-full text-xs p-3 rounded-xl border focus:outline-none bg-slate-50 focus:border-brand-pink focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">City *</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="E.g. New Delhi"
                    className="w-full text-xs p-3 rounded-xl border focus:outline-none bg-slate-50 focus:border-brand-pink focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">State *</label>
                  <input
                    type="text"
                    required
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    placeholder="E.g. Delhi"
                    className="w-full text-xs p-3 rounded-xl border focus:outline-none bg-slate-50 focus:border-brand-pink focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Pincode * (6 Digits)</label>
                  <input
                    type="text"
                    required
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    placeholder="E.g. 110016"
                    className="w-full text-xs p-3 rounded-xl border focus:outline-none bg-slate-50 focus:border-brand-pink focus:bg-white"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Country *</label>
                  <input
                    type="text"
                    required
                    value={addrCountry}
                    onChange={(e) => setAddrCountry(e.target.value)}
                    placeholder="E.g. India"
                    className="w-full text-xs p-3 rounded-xl border focus:outline-none bg-slate-50 focus:border-brand-pink focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="addr-default-check"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink"
                />
                <label htmlFor="addr-default-check" className="font-bold text-[10px] text-slate-700">Set as Default</label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold transition-all text-slate-700 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all border-0 cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURED SANDBOX MOCK CHECKOUT MODAL OVERLAY */}
      {showSimulateModal && simulateData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl border border-brand-pink/15 p-6 space-y-6 shadow-2xl relative animate-slide-up">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center border border-brand-pink/15">
                <ShieldCheck className="w-6 h-6 text-brand-pink animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-charcoal">Lovespy Secured Checkout</h3>
              <p className="text-[10px] uppercase font-extrabold text-brand-gray tracking-wider bg-slate-100 px-3 py-1 rounded-full inline-block">Sandbox Simulator Mode</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs border border-brand-pink/5">
              <div className="flex justify-between">
                <span className="text-brand-gray">Merchant Account:</span>
                <span className="font-bold text-brand-charcoal">Lovespy Gifting</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray">Mock Order ID:</span>
                <span className="font-mono font-bold text-slate-700">{simulateData.orderId}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-3">
                <span className="text-slate-800 font-semibold">Payable Total:</span>
                <span className="font-display font-extrabold text-brand-pink text-base">₹{simulateData.amount}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={async () => {
                  setShowSimulateModal(false);
                  await simulateData.handler({
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_order_id: simulateData.orderId,
                    razorpay_signature: "mock_signature",
                  });
                }}
                className="w-full py-3.5 bg-gradient-to-r from-brand-pink to-brand-lavender text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                Simulate Successful Payment
              </button>
              <button
                onClick={() => {
                  setShowSimulateModal(false);
                  alert("Payment simulated failure. You can retry checkout.");
                }}
                className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
              >
                Simulate Payment Failure
              </button>
              <button
                onClick={() => {
                  setShowSimulateModal(false);
                }}
                className="w-full py-3 text-slate-500 hover:text-slate-700 text-xs font-bold transition-all cursor-pointer bg-transparent border-0"
              >
                Cancel & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
