"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, ShoppingBag, ChevronRight, Info, Gift } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    updateQty,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    useRewardPoints,
    setUseRewardPoints,
    calculateSubtotal,
    calculateDetailedBreakdown,
  } = useCart();
  const { user } = useAuth();
  
  const [couponCode, setCouponCode] = useState("");
  const [showContents, setShowContents] = useState<Record<string, boolean>>({});

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 2999 ? 0 : (subtotal === 0 ? 0 : 150);

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

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const ok = applyCoupon(couponCode.trim().toUpperCase());
    if (ok) {
      alert("Coupon applied successfully!");
    } else {
      alert("Invalid coupon or minimum value requirement not met.");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      alert("Please sign in or link your profile to proceed to secure checkout.");
      return;
    }
    router.push("/checkout");
  };

  const toggleSummary = (id: string) => {
    setShowContents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="font-display font-bold text-3xl">Gifting Bag</h1>
        <p className="text-xs text-brand-gray">Confirm your selections prior to shipping</p>
      </div>

      {cart.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-pinkLight flex items-center justify-center mx-auto text-brand-pink">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-brand-charcoal">Your bag is empty.</p>
          <Link href="/shop" className="px-8 py-3 bg-brand-pink text-white rounded-full text-xs font-semibold hover:bg-brand-pink/90 transition-all inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="glass-card p-5 rounded-2xl border-brand-pink/10 flex items-center justify-between gap-4">
                <img src={item.image} className="w-16 h-16 rounded-xl object-cover border border-brand-pink/5" alt={item.name} />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-brand-charcoal truncate">{item.name}</h3>
                  <p className="text-xs text-brand-pink font-semibold">₹{item.price}</p>
                  
                  {item.type === "custom-hamper" && (
                    <>
                      <button
                        onClick={() => toggleSummary(item.id)}
                        className="text-[9px] text-brand-gray font-bold hover:text-brand-pink mt-1 flex items-center gap-0.5"
                      >
                        <Info className="w-3.5 h-3.5" /> Show Box Contents
                      </button>
                      {showContents[item.id] && (
                        <div className="text-[10px] text-brand-gray bg-slate-50 p-2.5 rounded-lg mt-2 border border-brand-pink/5">
                          <strong>Box Base:</strong> {item.details?.box?.name}<br />
                          <strong>Contents:</strong> {item.details?.items?.map((i: any) => `${i.name} (x${i.qty})`).join(", ")}<br />
                          {item.details?.personalization?.decorations?.fairyLights && "🌟 Fairy Lights Accent (Attached)\n"}
                          {item.details?.personalization?.decorations?.flowers && "🌸 Floral Accents (Attached)\n"}
                          {item.details?.personalization?.voiceQrAttached && "🎵 Audio QR Tag (Attached)\n"}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Quantity Adjuster */}
                <div className="flex items-center gap-2.5 bg-slate-100 rounded-full px-3 py-1">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="text-brand-gray hover:text-brand-pink font-bold text-xs px-1">-</button>
                  <span className="font-bold text-xs w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-brand-gray hover:text-brand-pink font-bold text-xs px-1">+</button>
                </div>

                {/* Remove */}
                <button onClick={() => removeFromCart(item.id)} className="text-brand-gray hover:text-red-500 transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-3xl border-brand-pink/15 shadow-md space-y-6">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-brand-charcoal border-b border-brand-pink/5 pb-3">Pricing Breakdown</h3>
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase text-brand-gray tracking-wider">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="LOVESPY10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 text-xs py-2.5 px-3 rounded-lg glass-input uppercase font-bold"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => { removeCoupon(); setCouponCode(""); }}
                      className="px-4 py-2.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button type="submit" className="px-4 py-2.5 bg-brand-pink text-white rounded-lg text-xs font-bold hover:bg-brand-pink/90 transition-all">
                      Apply
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-brand-gray">Try codes: <strong className="text-brand-pink">LOVESPY10</strong> or <strong className="text-brand-pink">FREEGP</strong></p>
              </form>


              {/* Cost Tables */}
              <div className="space-y-2 text-xs border-t border-brand-pink/5 pt-4">
                {(() => {
                  const breakdown = calculateDetailedBreakdown();
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Products Total:</span>
                        <span className="font-semibold">₹{breakdown.productsTotal}</span>
                      </div>
                      {breakdown.boxPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Box Price:</span>
                          <span className="font-semibold">₹{breakdown.boxPrice}</span>
                        </div>
                      )}
                      {breakdown.fairyLights > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Fairy Lights:</span>
                          <span className="font-semibold">₹{breakdown.fairyLights}</span>
                        </div>
                      )}
                      {breakdown.flowers > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Flowers:</span>
                          <span className="font-semibold">₹{breakdown.flowers}</span>
                        </div>
                      )}
                      {breakdown.ribbon > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Ribbon Decoration:</span>
                          <span className="font-semibold">₹{breakdown.ribbon}</span>
                        </div>
                      )}
                      {breakdown.stickers > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Stickers Accent:</span>
                          <span className="font-semibold">₹{breakdown.stickers}</span>
                        </div>
                      )}
                      {breakdown.velvet > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Velvet Wrapping:</span>
                          <span className="font-semibold">₹{breakdown.velvet}</span>
                        </div>
                      )}
                      {breakdown.photoUpload > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Photo Upload:</span>
                          <span className="font-semibold">₹{breakdown.photoUpload}</span>
                        </div>
                      )}
                      {breakdown.voiceQr > 0 && (
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Voice Message QR:</span>
                          <span className="font-semibold">₹{breakdown.voiceQr}</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {shipping > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Delivery Charge:</span>
                    <span className="font-bold">₹{shipping}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-green-500 font-semibold">
                    <span>Delivery Charge:</span>
                    <span>Free Shipping</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-brand-pink font-semibold">
                    <span>Coupon Discount:</span>
                    <span>-₹{discount}</span>
                  </div>
                )}



                <div className="flex justify-between text-sm pt-3 border-t border-dashed border-brand-pink/10">
                  <span className="font-bold text-brand-charcoal">Estimated Total:</span>
                  <span className="font-extrabold text-brand-pink text-lg">₹{finalTotal}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={handleCheckout}
                className="w-full bg-brand-charcoal text-white py-4 rounded-full font-bold text-xs hover:bg-brand-charcoal/90 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                Proceed to Checkout <ChevronRight className="w-4.5 h-4.5" />
              </button>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
