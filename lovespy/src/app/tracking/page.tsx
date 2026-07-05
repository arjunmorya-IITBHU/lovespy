"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrders } from "@/lib/db";
import { Check, Package, Truck, Navigation, Gift, ChevronLeft, Download, Search, Info } from "lucide-react";

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orders = getOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  const urlOrderId = searchParams.get("id");
  
  // Find order from URL search parameter, or use state-based search if navigated manually
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);

  React.useEffect(() => {
    if (urlOrderId) {
      const localMatch = orders.find((o) => o.id === urlOrderId || o.orderNumber === urlOrderId);
      if (localMatch) {
        setTrackedOrder(localMatch);
      } else {
        // Fetch from API
        fetch(`/api/orders`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.orders) {
              const matched = data.orders.find((o: any) => o.id === urlOrderId || o.orderNumber === urlOrderId);
              if (matched) {
                setTrackedOrder(matched);
              }
            }
          })
          .catch((err) => console.error(err));
      }
    } else {
      setTrackedOrder(null);
    }
  }, [urlOrderId, orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const trimmed = searchQuery.trim().toUpperCase();
    if (!trimmed) {
      setSearchError("Please enter an Order ID or Order Number.");
      return;
    }

    const found = orders.find(
      (o) => o.id.toUpperCase() === trimmed || o.orderNumber.toUpperCase() === trimmed
    );

    if (found) {
      setTrackedOrder(found);
      router.push(`/tracking?id=${found.id}`);
    } else {
      // Try fetching from API
      fetch(`/api/orders`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.orders) {
            const apiMatch = data.orders.find(
              (o: any) => o.id.toUpperCase() === trimmed || o.orderNumber.toUpperCase() === trimmed
            );
            if (apiMatch) {
              setTrackedOrder(apiMatch);
              router.push(`/tracking?id=${apiMatch.id}`);
            } else {
              setSearchError("No order found with that ID or Order Number. Please check and try again.");
            }
          } else {
            setSearchError("No order found with that ID or Order Number.");
          }
        })
        .catch((err) => {
          console.error(err);
          setSearchError("No order found with that ID or Order Number.");
        });
    }
  };

  const stages = [
    "Order Confirmed",
    "Processing",
    "Packed",
    "Shipped",
    "In Transit",
    "Out For Delivery",
    "Delivered"
  ];

  const stageDescriptions = [
    "Surprise order recorded successfully",
    "Admin preparing order / Shiprocket dispatch initialized",
    "Hand-tied with premium ribbons, fairy lights tested",
    "Assigned to courier speed lines. Tracking code activated.",
    "In transit between courier logistics hubs",
    "Surprise messenger is on their route with the package",
    "Gift received! Memories unlocked. ❤️"
  ];

  const stageIcons = [
    Check,
    Info,
    Package,
    Truck,
    Truck,
    Navigation,
    Gift
  ];

  function getStageIndex(order: any) {
    if (!order) return 0;
    const srStatus = order.shiprocketStatus;
    const mainStatus = order.status;

    if (srStatus === "Delivered" || mainStatus === "delivered") return 6;
    if (srStatus === "Out For Delivery" || mainStatus === "out_for_delivery") return 5;
    if (srStatus === "In Transit") return 4;
    if (srStatus === "Shipped" || mainStatus === "shipped") return 3;
    if (srStatus === "Packed" || mainStatus === "packed") return 2;
    if (srStatus === "Processing" || mainStatus === "confirmed") return 1;
    return 0; // "Order Confirmed"
  }

  const currentIdx = trackedOrder ? getStageIndex(trackedOrder) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up pb-12">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="font-display font-bold text-3xl text-brand-charcoal">Live Gifting Timeline</h1>
        <p className="text-xs text-brand-gray">Check the dispatch progress of your premium surprise boxes.</p>
      </div>

      {/* Lookup Bar / Search Form */}
      <div className="glass-card p-6 rounded-3xl border border-brand-pink/15 shadow-sm space-y-3 bg-white text-left">
        <h3 className="font-bold text-xs uppercase tracking-wider text-brand-pink">Search Another Order</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-gray absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="e.g. LS-2026-12345 or Order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-3 rounded-xl border border-brand-pink/10 focus:outline-none bg-slate-50 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-pink/90 transition-all border-0 cursor-pointer"
          >
            Track
          </button>
        </form>
        {searchError && <p className="text-[10px] text-red-500 font-semibold">{searchError}</p>}
      </div>

      {trackedOrder ? (
        <div className="glass-card p-8 rounded-3xl border border-brand-pink/15 shadow-lg space-y-8 bg-white text-left">
          <div className="flex justify-between items-center border-b border-brand-pink/5 pb-4 text-xs flex-wrap gap-4">
            <div>
              <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block">Logistics Speed</span>
              <p className="font-bold text-brand-charcoal uppercase">{trackedOrder.deliveryType || "standard"} Delivery</p>
            </div>
            <div>
              <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block">Order Number</span>
              <p className="font-bold text-brand-charcoal">{trackedOrder.orderNumber}</p>
            </div>
            {trackedOrder.shiprocketAwb ? (
              <div>
                <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block">Shiprocket AWB</span>
                <p className="font-bold text-brand-pink font-mono">{trackedOrder.shiprocketAwb} (${trackedOrder.shiprocketCourier || "Express"})</p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block">Tracking Code</span>
                <p className="font-bold text-brand-charcoal">{trackedOrder.tracking || "Awaiting dispatch"}</p>
              </div>
            )}
          </div>

          {/* Timeline Graphic */}
          <div className="relative pl-8 space-y-8">
            <div className="absolute left-3.5 top-2.5 bottom-2.5 w-0.5 bg-slate-200"></div>

            {stages.map((stageName, idx) => {
              const IconComponent = stageIcons[idx];
              const isCompleted = currentIdx >= idx;
              const isCurrent = currentIdx === idx;
              
              return (
                <div key={idx} className="relative flex gap-4 items-start">
                  <div
                    className={`absolute -left-[27px] w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all ${
                      isCompleted
                        ? idx === 6
                          ? "bg-emerald-500 text-white ring-4 ring-emerald-50"
                          : "bg-green-500 text-white ring-4 ring-green-50"
                        : "bg-slate-200 text-brand-gray"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold transition-colors ${
                        isCompleted
                          ? idx === 6
                            ? "text-emerald-600 font-extrabold"
                            : "text-brand-charcoal"
                          : "text-brand-gray"
                      } ${isCurrent ? "text-brand-pink" : ""}`}
                    >
                      {stageName}
                      {isCurrent && <span className="ml-2 text-[9px] bg-brand-pinkLight text-brand-pink px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Current Status</span>}
                    </h4>
                    <p className="text-[10px] text-brand-gray mt-0.5">{stageDescriptions[idx]}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Address summary */}
          <div className="pt-6 border-t border-brand-pink/5 text-xs space-y-2">
            <h4 className="font-bold text-brand-charcoal">Delivery Address Snapshot</h4>
            <p className="text-brand-gray leading-relaxed">{trackedOrder.address}</p>
          </div>

          <div className="flex justify-between pt-4 border-t border-brand-pink/5 gap-2">
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 border border-brand-pink/10 hover:bg-brand-pinkLight rounded-full text-xs font-bold transition-all flex items-center gap-1 border-0 cursor-pointer bg-white"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Home
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-brand-charcoal text-white hover:bg-brand-charcoal/90 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Print Invoice
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 rounded-3xl border border-brand-pink/15 shadow-md bg-white space-y-4">
          <Info className="w-8 h-8 text-brand-pink mx-auto" />
          <h3 className="font-bold text-sm text-brand-charcoal">Awaiting Order Reference</h3>
          <p className="text-xs text-brand-gray max-w-md mx-auto">
            Please enter your <strong>Lovespy Order ID</strong> or <strong>Order Number</strong> in the form above to fetch live logistics tracking reports from Shiprocket.
          </p>
        </div>
      )}
    </div>
  );
}
