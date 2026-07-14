"use client";

import React, { useState } from "react";
import { getProducts, Product } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { Sparkles, ShoppingBag, Info, RotateCcw, ArrowRight, Eye, Star } from "lucide-react";
import Link from "next/link";

export default function AiRecommender() {
  const allProducts = getProducts();
  const { addToCart } = useCart();

  // 4 simple questions states
  const [recipient, setRecipient] = useState("Friend");
  const [occasion, setOccasion] = useState("Birthday");
  const [budget, setBudget] = useState<number>(2000);
  const [vibe, setVibe] = useState("Cute");

  const [results, setResults] = useState<Product[] | null>(null);

  const handleRecommend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || budget <= 0) {
      alert("Please specify a valid budget amount.");
      return;
    }

    // Filter primarily based on price <= budget
    let matches = allProducts.filter((p: Product) => {
      // Ensure the product is published
      if (p.status === "draft") return false;
      return p.price <= budget;
    });

    // Sub-sort matches: products with tags containing vibe, occasion, or relation get higher priority
    matches = matches.map((p) => {
      let score = 0;
      const tags = (p.tags || []).map((t) => t.toLowerCase());
      const name = p.name.toLowerCase();
      const desc = (p.desc || "").toLowerCase();

      // Check interest/vibe match
      if (tags.includes(vibe.toLowerCase()) || name.includes(vibe.toLowerCase())) {
        score += 3;
      }
      // Check occasion match
      if (tags.includes(occasion.toLowerCase()) || name.includes(occasion.toLowerCase())) {
        score += 2;
      }
      // Check recipient match
      if (tags.includes(recipient.toLowerCase()) || name.includes(recipient.toLowerCase())) {
        score += 1;
      }

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

    setResults(matches);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      type: "product",
      image: product.image,
    });
    alert(`💖 Added ${product.name} to your Gifting Bag!`);
  };

  const handleReset = () => {
    setResults(null);
  };

  const recipients = [
    "Friend", "Brother", "Sister", "Mother", "Father", 
    "Husband", "Wife", "Boyfriend", "Girlfriend", 
    "Colleague", "Teacher", "Child", "Other"
  ];

  const occasions = [
    "Birthday", "Anniversary", "Valentine's Day", 
    "Father's Day", "Mother's Day", "Raksha Bandhan", 
    "Eid", "Diwali", "Christmas", "Congratulations", 
    "Thank You", "Get Well Soon", "Just Because", "Other"
  ];

  const vibes = [
    "Cute", "Luxury", "Romantic", "Minimal", "Premium", 
    "Funny", "Elegant", "Fitness", "Chocolate Lover", 
    "Coffee Lover", "Gaming", "Travel", "Handmade", "Personalized"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 animate-slide-up text-brand-charcoal text-xs">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] font-extrabold uppercase bg-brand-pinkLight text-brand-pink px-3.5 py-1.5 rounded-full border border-brand-pink/15">
          ✨ Intelligent Matchmaker
        </span>
        <h1 className="font-display font-bold text-3xl bg-gradient-to-r from-brand-pink via-brand-lavender to-brand-charcoal bg-clip-text text-transparent pt-2">
          AI Gift Finder
        </h1>
        <p className="text-xs text-brand-gray font-medium">
          Answer four simple questions and discover perfect gift selections matching your budget instantly.
        </p>
      </div>

      {!results ? (
        <form onSubmit={handleRecommend} className="glass-card max-w-2xl mx-auto p-8 rounded-3xl border border-brand-pink/15 shadow-xl space-y-6 bg-white/70">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-semibold">
            
            {/* Question 1: Recipient */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">1. Who is the gift for?</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-brand-pink/20 bg-white/80 focus:outline-none focus:border-brand-pink text-xs font-bold text-brand-charcoal"
              >
                {recipients.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Question 2: Occasion */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">2. What's the Occasion?</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-brand-pink/20 bg-white/80 focus:outline-none focus:border-brand-pink text-xs font-bold text-brand-charcoal"
              >
                {occasions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Question 3: Budget Input */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">3. What is your budget? (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 2500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                  className="w-full py-3 pl-8 pr-4 rounded-xl border border-brand-pink/20 bg-white/80 focus:outline-none focus:border-brand-pink text-xs font-bold text-brand-charcoal"
                />
              </div>
              <div className="flex gap-2 pt-1.5">
                {[1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBudget(amt)}
                    className={`py-1 px-3 rounded-full border text-[9px] font-extrabold transition-all ${budget === amt ? 'bg-brand-pink text-white border-brand-pink' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Interest/Vibe */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-gray tracking-wider">4. Interest / Vibe</label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-brand-pink/20 bg-white/80 focus:outline-none focus:border-brand-pink text-xs font-bold text-brand-charcoal"
              >
                {vibes.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-brand-charcoal text-white hover:bg-brand-charcoal/90 py-3.5 rounded-xl font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-brand-charcoal/10"
          >
            <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold" /> Generate AI Recommendations
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-brand-pink/10 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-brand-charcoal">AI Matchmaker Results</h3>
              <p className="text-[10px] text-brand-gray">
                Showing matching combinations under <strong>₹{budget.toLocaleString('en-IN')}</strong> for <strong>{recipient}</strong> ({occasion} vibe: <em>{vibe}</em>).
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 border border-brand-pink/15 bg-white rounded-xl text-xs font-extrabold hover:bg-slate-50 transition-all flex items-center gap-1.5 text-brand-charcoal cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start New Search
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 bg-white border border-brand-pink/10 rounded-3xl space-y-3">
              <span className="text-3xl">🔍</span>
              <h4 className="font-bold text-sm text-brand-charcoal">No Products Found</h4>
              <p className="text-xs text-brand-gray max-w-sm mx-auto">
                No items are currently priced under ₹{budget}. Try increasing your budget range slightly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => {
                const crossedPrice = product.crossedPrice || (product.originalPrice);
                const discount = product.discountPercentage;
                
                return (
                  <div key={product.id} className="glass-card bg-white border border-brand-pink/10 rounded-3xl overflow-hidden hover:border-brand-pink transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-slate-50">
                      <img
                        src={product.image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        alt={product.name}
                      />
                      <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black text-brand-charcoal flex items-center gap-1 border">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {product.rating || "4.8"}
                      </span>
                      {discount && discount > 0 ? (
                        <span className="absolute top-3 right-3 bg-brand-pink text-white text-[9px] font-black px-2.5 py-1 rounded-full tracking-wider uppercase">
                          {discount}% OFF
                        </span>
                      ) : null}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-brand-pink tracking-wider">
                          {product.category || "Gift Accents"}
                        </span>
                        <h4 className="font-display font-bold text-sm text-brand-charcoal line-clamp-1 group-hover:text-brand-pink transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-brand-gray line-clamp-2 leading-relaxed">
                          {product.shortDescription || product.desc}
                        </p>
                      </div>

                      <div className="pt-2 flex justify-between items-center border-t border-brand-pink/5">
                        <div className="space-y-0.5">
                          {crossedPrice && crossedPrice > product.price ? (
                            <span className="text-[10px] text-brand-gray line-through block">
                              ₹{crossedPrice}
                            </span>
                          ) : null}
                          <strong className="text-base text-brand-charcoal font-display">
                            ₹{product.price}
                          </strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <Link
                          href={`/shop/${product.slug}`}
                          className="py-2.5 rounded-xl border border-slate-200 text-center font-extrabold hover:bg-slate-50 transition-all flex items-center justify-center gap-1 text-slate-700 hover:border-slate-300"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="py-2.5 rounded-xl bg-brand-pink text-white font-extrabold hover:bg-brand-pink/90 transition-all flex items-center justify-center gap-1 border-0 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
