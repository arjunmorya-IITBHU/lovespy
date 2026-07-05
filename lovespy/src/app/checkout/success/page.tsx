"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrders } from "@/lib/db";
import { CheckCircle2, PackageCheck, Calendar, ArrowRight, Home } from "lucide-react";
import confetti from "canvas-confetti";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    if (orderId) {
      const orders = getOrders();
      const matched = orders.find((o: any) => o.id === orderId || o.orderNumber === orderId);
      if (matched) {
        setOrder(matched);
      } else {
        // Fetch from API route if available
        fetch(`/api/orders`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.orders) {
              const apiMatch = data.orders.find((o: any) => o.id === orderId || o.orderNumber === orderId);
              if (apiMatch) setOrder(apiMatch);
            }
          })
          .catch((err) => console.error(err));
      }
    }
  }, [orderId]);

  // Fallback estimates
  const getDeliveryDateString = () => {
    if (order?.deliveryDate) {
      return new Date(order.deliveryDate).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    // Default 4 days from now
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4 animate-slide-up">
      <div className="bg-white border border-brand-pink/10 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-pinkLight/10 via-transparent to-brand-lavenderLight/10 pointer-events-none"></div>

        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce-soft relative z-10">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>

        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-3 py-1 rounded-full border border-brand-pink/15">
            Payment Secure & Complete
          </span>
          <h1 className="font-display font-bold text-2xl text-brand-charcoal pt-1">Order Successfully Placed</h1>
          <p className="text-xs text-brand-gray">Thank you for choosing Lovespy. Your custom surprise package is being constructed.</p>
        </div>

        {/* Order Details Grid */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left text-xs space-y-3.5 relative z-10">
          <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-slate-200">
            <span className="text-brand-gray font-semibold">Order Reference:</span>
            <span className="font-mono font-bold text-brand-charcoal text-sm">{order?.orderNumber || "LS-2026-PENDING"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-brand-gray font-semibold">Payment Status:</span>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
              Paid Secured
            </span>
          </div>

          <div className="flex justify-between items-start gap-4 pt-1">
            <span className="text-brand-gray font-semibold flex items-center gap-1 flex-shrink-0">
              <Calendar className="w-4 h-4 text-brand-pink" /> Estimated Delivery:
            </span>
            <span className="font-bold text-slate-800 text-right">{getDeliveryDateString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 relative z-10">
          <Link
            href={`/tracking?id=${order?.id || orderId}`}
            className="w-full py-3.5 bg-brand-charcoal hover:bg-brand-charcoal/90 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <PackageCheck className="w-4 h-4" /> Track Order Live
          </Link>
          
          <Link
            href="/"
            className="w-full py-3.5 border border-brand-pink/15 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-white"
          >
            <Home className="w-4 h-4 text-brand-pink" /> Continue Shopping
          </Link>
        </div>

        <p className="text-[10px] text-brand-gray text-center italic relative z-10 pt-1">
          A confirmation invoice receipt has been dispatched to your email profile.
        </p>
      </div>
    </div>
  );
}
