"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Heart, ShoppingBag, User as UserIcon, ChevronDown, LogOut, LogIn, Sparkles, Bot, Menu, X, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";

export default function Navbar() {
  const pathname = usePathname();
  const { cart, wishlist } = useCart();
  const { user, logout, openLoginModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-brand-pink/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <Logo className="w-16 h-16 group-hover:scale-105 transition-transform duration-300" />
          <div>
            <span className="font-display font-bold text-2xl tracking-wider bg-gradient-to-r from-brand-pink via-brand-lavender to-brand-charcoal bg-clip-text text-transparent">LOVESPY</span>
            <span className="block text-[8px] text-brand-gray tracking-widest font-semibold uppercase -mt-1">Every gift tells a story</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
          <Link href="/" className={`transition-colors ${pathname === "/" ? "text-brand-pink" : "text-brand-charcoal hover:text-brand-pink"}`}>Home</Link>
          <Link href="/shop?type=gifts" className={`transition-colors ${pathname === "/shop" ? "text-brand-pink" : "text-brand-charcoal hover:text-brand-pink"}`}>Gifts</Link>
          <Link href="/hamper-builder" className={`relative py-1.5 px-3.5 rounded-full font-bold transition-all duration-300 flex items-center gap-1.5 ${pathname === "/hamper-builder" ? "bg-gradient-to-r from-brand-pink to-brand-lavender text-white shadow-lg shadow-brand-pink/20" : "bg-gradient-to-r from-brand-pink/5 via-brand-lavender/10 to-brand-pink/5 text-brand-charcoal hover:scale-105 border border-brand-pink/20 hover:border-brand-pink/40 shadow-sm"}`}>
            <span className="relative z-10">Build Your Own Hamper</span>
            <span className="bg-brand-pink text-white text-[8px] font-black tracking-tighter uppercase px-1.5 py-0.5 rounded-full animate-pulse-soft">
              Hot
            </span>
            <span className="absolute inset-0 rounded-full bg-brand-pink/10 blur opacity-0 hover:opacity-100 transition-opacity"></span>
          </Link>
          <Link href="/digital-wishes" className={`transition-colors ${pathname === "/digital-wishes" ? "text-brand-pink" : "text-brand-charcoal hover:text-brand-pink"}`}>Custom Surprise Page</Link>
          <Link href="/dashboard?tab=orders" className={`transition-colors ${pathname === "/dashboard" ? "text-brand-pink" : "text-brand-charcoal hover:text-brand-pink"}`}>Track Order</Link>
          <a href="#contact" onClick={(e) => { e.preventDefault(); document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" }); }} className="text-brand-charcoal hover:text-brand-pink transition-colors">Contact Us</a>
        </nav>

        {/* Nav Icons */}
        <div className="flex items-center gap-4">
          
          {/* Wishlist */}
          <Link href="/dashboard?tab=wishlist" className="p-2.5 rounded-full hover:bg-brand-pinkLight text-brand-charcoal hover:text-brand-pink transition-colors relative">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Bag */}
          <Link href="/cart" className="p-2.5 rounded-full hover:bg-brand-lavenderLight text-brand-charcoal hover:text-brand-lavender transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-lavender text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-brand-pinkLight border border-brand-pink/10 transition-all"
            >
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user && user.id !== "usr-guest" ? user.name : "Guest"}`}
                alt="Avatar"
                className="w-7 h-7 rounded-full bg-white object-cover"
              />
              <ChevronDown className="w-3.5 h-3.5 text-brand-gray hidden sm:inline" />
            </button>
 
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-brand-pink/10 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-brand-pink/5 mb-1">
                  <p className="text-xs font-bold text-brand-charcoal">{user ? user.name : "Guest Gifter"}</p>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-charcoal hover:bg-brand-pinkLight hover:text-brand-pink transition-colors"><UserIcon className="w-4 h-4" /> My Profile</Link>
                <Link href="/dashboard?tab=orders" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-charcoal hover:bg-brand-pinkLight hover:text-brand-pink transition-colors"><ShoppingBag className="w-4 h-4" /> My Orders</Link>
                {user && user.name === "Arjun Morya" && user.phone === "9950669088" && (
                  <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-charcoal hover:bg-brand-lavenderLight hover:text-brand-lavender transition-colors border-t border-brand-pink/5"><ShieldCheck className="w-4 h-4" /> Admin Panel</Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu trigger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-brand-charcoal hover:bg-brand-pinkLight rounded-full">
            <Menu className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-brand-pink/10 px-4 py-4 space-y-3">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-brand-pink transition-colors">Home</Link>
          <Link href="/shop?type=gifts" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-brand-pink transition-colors">Gifts</Link>
          <Link href="/hamper-builder" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 py-2 px-3 my-1 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-pink/10 to-brand-lavender/10 border border-brand-pink/25 text-brand-pink">
            Build Your Own Hamper
            <span className="bg-brand-pink text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">Hot</span>
          </Link>
          <Link href="/digital-wishes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-brand-pink transition-colors">Custom Surprise Page</Link>
          <Link href="/dashboard?tab=orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold hover:text-brand-pink transition-colors">Track Order</Link>
          <a href="#contact" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" }); }} className="block py-2 text-sm font-semibold hover:text-brand-pink transition-colors">Contact Us</a>
        </div>
      )}
    </header>
  );
}
