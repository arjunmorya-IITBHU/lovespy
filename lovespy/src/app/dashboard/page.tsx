"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getOrders, getProducts, getCustomers, setCustomers } from "@/lib/db";
import { User as UserIcon, Package, Heart, MapPin, Trash2, ShoppingCart, LogOut } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, openLoginModal, fetchWithAuth, authenticateProfileAdmin } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const products = getProducts();

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  // Review System Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);
  const [selectedProductIdToReview, setSelectedProductIdToReview] = useState<string>("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState("");

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdToReview) {
      alert("Please select a product to review.");
      return;
    }
    if (!reviewComment.trim()) {
      alert("Please write a comment.");
      return;
    }
    try {
      const { getReviews, setReviews } = require("@/lib/db");
      const currentReviews = getReviews();
      const newRev = {
        id: "rev-" + Date.now(),
        productId: selectedProductIdToReview,
        userName: user?.name || "Verified Customer",
        rating: reviewRating,
        title: reviewTitle || "Great Product",
        comment: reviewComment,
        date: new Date().toISOString().split("T")[0],
        status: "pending" as const,
        photos: reviewPhotoUrl ? [reviewPhotoUrl] : [],
        userImage: ""
      };
      const updated = [newRev, ...currentReviews];
      setReviews(updated);
      alert("Your review has been submitted for administrator moderation. Thank you!");
      setShowReviewModal(false);
      // Reset form
      setSelectedProductIdToReview("");
      setReviewTitle("");
      setReviewComment("");
      setReviewPhotoUrl("");
      setReviewRating(5);
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  React.useEffect(() => {
    if (user) {
      // Fetch user specific orders from database
      fetchWithAuth("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.orders) {
            setOrdersList(data.orders);
          }
        })
        .catch((err) => {
          console.error("Failed to load user orders:", err);
          // Fallback to local
          setOrdersList(getOrders());
        });
      
      // Update local state inputs from user record
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <p className="text-sm font-bold text-brand-charcoal">Accessing account parameters requires guest identification.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/")} className="px-8 py-3 border border-slate-200 text-slate-700 rounded-full text-xs font-semibold hover:bg-slate-50 transition-all bg-white">Go Home</button>
          <button onClick={openLoginModal} className="px-8 py-3 bg-brand-pink text-white rounded-full text-xs font-semibold hover:bg-brand-pink/90 transition-all">Identify Guest</button>
        </div>
      </div>
    );
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const nameVal = profileName.trim();
    const phoneVal = profilePhone.trim();

    if (nameVal === "Arjun Morya" && phoneVal === "9950669088") {
      const res = await authenticateProfileAdmin(nameVal, phoneVal);
      if (res.success) {
        alert("Profile saved successfully! Admin access granted.");
      } else {
        alert("Profile saved, but admin token acquisition failed. Please try again.");
      }
    } else {
      if (user.role === "admin") {
        logout();
        alert("Profile details updated. Admin session ended.");
        router.push("/");
        return;
      }
      user.name = nameVal;
      user.phone = phoneVal;
      localStorage.setItem("lovespy_user", JSON.stringify(user));
      alert("Profile saved successfully!");
    }

    // Sync with Admin Customer Directory
    if (user && user.id !== "usr-guest") {
      try {
        const customers = getCustomers();
        const existingIdx = customers.findIndex((c) => c.id === user.id || (user.phone && c.phone === user.phone) || (user.email && c.email === user.email));
        
        const nowStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

        if (existingIdx > -1) {
          customers[existingIdx] = {
            ...customers[existingIdx],
            name: user.name,
            phone: user.phone,
            email: user.email || customers[existingIdx].email,
            status: "Active",
            lastLogin: nowStr
          };
        } else {
          customers.push({
            id: user.id || `usr-${Date.now()}`,
            name: user.name,
            phone: user.phone,
            email: user.email || "",
            registeredDate: todayStr,
            lastLogin: nowStr,
            totalOrders: 0,
            totalAmountSpent: 0,
            status: "Active"
          });
        }
        setCustomers(customers);
      } catch (err) {
        console.error("Failed to sync customer directory:", err);
      }
    }

    alert("Profile saved successfully!");
  };

  const handleWishlistAddToCart = (prodId: string) => {
    const p = products.find((prod: any) => prod.id === prodId);
    if (p) {
      addToCart({
        id: p.id,
        name: p.name,
        price: p.price,
        qty: 1,
        type: "product",
        image: p.image,
      });
      alert(`${p.name} added to cart!`);
    }
  };

  const wishlistProducts = products.filter((p: any) => wishlist.includes(p.id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-slide-up">
      
      {/* Side nav Left */}
      <div className="md:col-span-1 space-y-4">
        <div className="glass-card p-5 rounded-2xl border-brand-pink/10 text-center space-y-3">
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
            className="w-20 h-20 rounded-full mx-auto border-2 border-brand-pink/20 bg-pink-50"
            alt="Avatar"
          />
          <div>
            <h3 className="font-bold text-sm text-brand-charcoal">{user.name}</h3>
            <p className="text-[10px] text-brand-gray">{user.email}</p>
          </div>
        </div>

        {/* Tab links */}
        <div className="glass-card rounded-2xl border-brand-pink/10 overflow-hidden text-xs font-semibold flex flex-col">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left py-3.5 px-5 hover:bg-brand-pinkLight flex items-center gap-2 border-b border-brand-pink/5 ${activeTab === "profile" ? "bg-brand-pinkLight text-brand-pink" : "text-brand-charcoal"}`}
          >
            <UserIcon className="w-4 h-4" /> Profile Settings
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left py-3.5 px-5 hover:bg-brand-pinkLight flex items-center gap-2 border-b border-brand-pink/5 ${activeTab === "orders" ? "bg-brand-pinkLight text-brand-pink" : "text-brand-charcoal"}`}
          >
            <Package className="w-4 h-4" /> My Orders
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`w-full text-left py-3.5 px-5 hover:bg-brand-pinkLight flex items-center gap-2 border-b border-brand-pink/5 ${activeTab === "wishlist" ? "bg-brand-pinkLight text-brand-pink" : "text-brand-charcoal"}`}
          >
            <Heart className="w-4 h-4" /> Wishlist Catalog
          </button>
        </div>

        {/* Removed Sign Out button */}
      </div>

      {/* Details Area Right */}
      <div className="md:col-span-3 glass-card p-8 rounded-3xl border-brand-pink/15 shadow-md">
        
        {/* Profile Settings */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSave} className="space-y-6">
            <h2 className="font-display font-bold text-lg text-brand-charcoal border-b border-brand-pink/5 pb-2">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5 flex flex-col">
                <label className="font-bold text-brand-gray uppercase">Your Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl glass-input font-medium"
                />
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="font-bold text-brand-gray uppercase">Mobile Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="Enter Mobile Number"
                  className="w-full py-3 px-4 rounded-xl glass-input font-medium"
                />
              </div>
            </div>
            <button type="submit" className="px-8 py-3.5 bg-brand-pink text-white rounded-full text-xs font-bold hover:bg-brand-pink/90 transition-all">
              Save Profile Changes
            </button>
          </form>
        )}

        {/* My Orders */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-lg text-brand-charcoal border-b border-brand-pink/5 pb-2">Your Orders</h2>
            
            {ordersList.length === 0 ? (
              <p className="text-xs text-brand-gray py-10 text-center">No orders recorded under this account.</p>
            ) : (
              <div className="space-y-4">
                {ordersList.map((order) => (
                  <div key={order.id} className="border border-brand-pink/15 rounded-2xl p-5 hover:border-brand-pink transition-all text-xs space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <p className="font-bold text-brand-charcoal">Order #{order.orderNumber}</p>
                        <p className="text-[10px] text-brand-gray">Date: {order.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${order.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-brand-pink/5">
                      <div>
                        <span className="text-[10px] text-brand-gray block">Amount Paid</span>
                        <strong className="text-base text-brand-pink">₹{order.total}</strong>
                      </div>
                      <div className="flex gap-2">
                        {order.status === "delivered" && (
                          <button
                            onClick={() => {
                              setSelectedOrderForReview(order);
                              if (order.items && order.items.length > 0) {
                                setSelectedProductIdToReview(order.items[0].id || order.items[0].productId || "");
                              }
                              setShowReviewModal(true);
                            }}
                            className="px-5 py-2.5 bg-brand-pink text-white hover:bg-brand-pink/90 rounded-full font-bold text-[10px]"
                          >
                            ✨ Review Products
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/tracking?id=${order.id}`)}
                          className="px-5 py-2.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded-full font-bold text-[10px]"
                        >
                          Track Order Live
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Catalog */}
        {activeTab === "wishlist" && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-lg text-brand-charcoal border-b border-brand-pink/5 pb-2">My Wishlist</h2>
            
            {wishlistProducts.length === 0 ? (
              <p className="text-xs text-brand-gray py-10 text-center">Your wishlist is empty. Add heart icons on product cards!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {wishlistProducts.map((p: any) => (
                  <div key={p.id} className="border border-brand-pink/10 rounded-2xl p-4 flex flex-col justify-between space-y-2 bg-white relative">
                    <img src={p.image} className="aspect-square w-full rounded-xl object-cover" alt={p.name} />
                    <div>
                      <h4 className="font-bold text-xs truncate text-brand-charcoal">{p.name}</h4>
                      <p className="text-[10px] text-brand-pink font-semibold">₹{p.price}</p>
                    </div>
                    <button
                      onClick={() => handleWishlistAddToCart(p.id)}
                      className="w-full py-2 bg-brand-pink text-white rounded-xl text-[10px] font-bold hover:bg-brand-pink/90 transition-all flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Pack
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-red-500 shadow"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses tab removed */}

      </div>

      {/* REVIEW SUBMISSION MODAL */}
      {showReviewModal && selectedOrderForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in pointer-events-auto">
          <div className="max-w-md w-full bg-white rounded-3xl border border-brand-pink/15 p-6 space-y-6 shadow-2xl relative text-left text-brand-charcoal text-xs">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-brand-charcoal border-0 cursor-pointer bg-white"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink/15">
                Product Experience Review
              </span>
              <h3 className="font-display font-bold text-lg text-brand-charcoal pt-2">
                Order #{selectedOrderForReview.orderNumber}
              </h3>
              <p className="text-[10px] text-brand-gray">Share your gift experiences with the community</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Select Product to Review</label>
                <select
                  required
                  value={selectedProductIdToReview}
                  onChange={(e) => setSelectedProductIdToReview(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                >
                  <option value="">-- Choose an item --</option>
                  {(selectedOrderForReview.items || []).map((item: any) => {
                    const itemRealId = item.productId || item.id;
                    return (
                      <option key={item.id} value={itemRealId}>
                        {item.name} (Qty: {item.qty})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Star Rating</label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 active:scale-95 transition-all fill-none bg-transparent border-0 cursor-pointer"
                    >
                      <span className={`text-xl ${star <= reviewRating ? "text-amber-500" : "text-slate-300"}`}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-[10px] text-brand-gray font-bold uppercase ml-2">{reviewRating} Star{reviewRating > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Review Title</label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Stunning packaging, loved it!"
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write details of your unboxing and delivery experience..."
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Attach Image URL (Optional)</label>
                <input
                  type="text"
                  value={reviewPhotoUrl}
                  onChange={(e) => setReviewPhotoUrl(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/... or base64"
                  className="w-full text-xs p-3 rounded-xl border bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 border rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all border-0 cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
