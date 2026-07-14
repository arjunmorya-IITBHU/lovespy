"use client";

import React from "react";
import Link from "next/link";
import { Heart, Instagram, Twitter, Youtube, ChevronRight } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-slate-300 py-16 border-t border-brand-pink/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <span className="font-display font-bold text-xl tracking-wider text-white">LOVESPY</span>
          </Link>
          <p className="text-xs text-slate-400 max-w-sm">
            A premium, Gen-Z personalized gifting storefront designed to capture emotion. Design your custom boxes, personalize letters, print audio QR codes, and ship love worldwide.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-brand-pink hover:text-white transition-all flex items-center justify-center text-slate-400">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-brand-pink hover:text-white transition-all flex items-center justify-center text-slate-400">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-brand-pink hover:text-white transition-all flex items-center justify-center text-slate-400">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white text-sm mb-4 tracking-wider uppercase">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/shop?type=gifts" className="hover:text-brand-pink transition-colors">Gifts</Link></li>
            <li><Link href="/hamper-builder" className="hover:text-brand-pink transition-colors">Build Your Own Hamper</Link></li>
            <li><Link href="/digital-wishes" className="hover:text-brand-pink transition-colors">Custom Surprise Page</Link></li>
            <li><Link href="/dashboard?tab=orders" className="hover:text-brand-pink transition-colors">Track Your Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white text-sm mb-4 tracking-wider uppercase">Customer Policy</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-brand-pink transition-colors">Delivery Timelines</a></li>
            <li><a href="#" className="hover:text-brand-pink transition-colors">Refunds & Cancellation</a></li>
            <li><a href="#" className="hover:text-brand-pink transition-colors">Bulk Gifting Enquiries</a></li>
            <li><a href="#" className="hover:text-brand-pink transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-white text-sm mb-4 tracking-wider uppercase">Subscribe to Updates</h4>
          <p className="text-xs text-slate-400 mb-3">Join the Lovespy club for secret discounts & early drops.</p>
          <div className="relative">
            <input
              type="email"
              placeholder="Your best email"
              className="w-full bg-slate-800 border border-slate-700 text-xs px-4 py-2.5 rounded-lg text-white focus:outline-none focus:border-brand-pink pr-10"
            />
            <button className="absolute right-2 top-2 text-brand-pink hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
        <p>&copy; 2026 LOVESPY Gifting Inc. Designed for Gen-Z, built with emotion. Made in India.</p>
      </div>
    </footer>
  );
}
