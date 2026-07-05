"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getOrders, getProducts } from "@/lib/db";
import { User as UserIcon, Package, Heart, MapPin, Trash2, ShoppingCart, LogOut } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, fetchWithAuth } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const products = getProducts();

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "addresses">("profile");
  const [profileName, setProfileName] = useState(user?.name || "Ananya Sharma");
  const [profileEmail, setProfileEmail] = useState(user?.email || "ananya.s@gmail.com");

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
    }
  }, [user]);

  const [addresses, setAddresses] = useState([
    { id: "addr-1", label: "Home", name: "Priya Sharma", phone: "9876543210", line1: "F-12, Green Park Extension", line2: "Near Metro Gate 3", city: "New Delhi", state: "Delhi", pincode: "110016" },
    { id: "addr-2", label: "Office", name: "Priya Sharma", phone: "9876543210", line1: "A-50, Sector 62", line2: "Tech Park Block B", city: "Noida", state: "Uttar Pradesh", pincode: "201301" }
  ]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <p className="text-sm font-bold text-brand-charcoal">Accessing account parameters requires authentication.</p>
        <button onClick={() => router.push("/")} className="px-8 py-3 bg-brand-pink text-white rounded-full text-xs font-semibold hover:bg-brand-pink/90 transition-all">Go Home</button>
      </div>
    );
  }

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    user.name = profileName;
    user.email = profileEmail;
    alert("Profile saved successfully!");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleAddAddress = () => {
    const newAddr = {
      id: `addr-${Date.now()}`,
      label: "Other",
      name: user.name,
      phone: user.phone,
      line1: "G-44, Kailash Block",
      line2: "Market Road",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110048"
    };
    setAddresses([...addresses, newAddr]);
  };

  const handleWishlistAddToCart = (prodId: string) => {
    const p = products.find((prod) => prod.id === prodId);
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

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

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
          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left py-3.5 px-5 hover:bg-brand-pinkLight flex items-center gap-2 ${activeTab === "addresses" ? "bg-brand-pinkLight text-brand-pink" : "text-brand-charcoal"}`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses
          </button>
        </div>

        <button
          onClick={() => { logout(); router.push("/"); }}
          className="w-full py-3 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
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
                <label className="font-bold text-brand-gray uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={user.phone}
                  disabled
                  className="w-full py-3 px-4 rounded-xl glass-input bg-slate-100 font-medium cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2 flex flex-col">
                <label className="font-bold text-brand-gray uppercase">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
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
                      <button
                        onClick={() => router.push(`/tracking?id=${order.id}`)}
                        className="px-5 py-2.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded-full font-bold text-[10px]"
                      >
                        Track Order Live
                      </button>
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
                {wishlistProducts.map((p) => (
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

        {/* Saved Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-lg text-brand-charcoal border-b border-brand-pink/5 pb-2">Saved Addresses</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="border border-brand-pink/10 rounded-2xl p-4 text-xs space-y-2 relative">
                  <div className="font-bold text-brand-charcoal flex justify-between">
                    <span className="text-brand-pink">{addr.label}</span>
                    <span>{addr.name}</span>
                  </div>
                  <p className="text-brand-gray">{addr.line1}, {addr.line2}</p>
                  <p className="text-brand-gray">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="font-bold text-brand-charcoal">Ph: {addr.phone}</p>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="absolute bottom-4 right-4 text-brand-gray hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleAddAddress}
              className="px-8 py-3.5 border border-dashed border-brand-pink/20 hover:border-brand-pink text-brand-pink rounded-full text-xs font-bold transition-all flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" /> Add New Address
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
