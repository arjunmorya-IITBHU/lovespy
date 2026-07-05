"use client";

import React, { useState } from "react";
import { getProducts, Product } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { Bot, Sparkles, ShoppingCart, Info, RotateCcw } from "lucide-react";

export default function AiRecommender() {
  const allProducts = getProducts();
  const { addToCart } = useCart();

  const [gender, setGender] = useState("female");
  const [relation, setRelation] = useState("partner");
  const [occasion, setOccasion] = useState("birthday");
  const [budget, setBudget] = useState(2000);
  
  const [results, setResults] = useState<Product[] | null>(null);

  const handleRecommend = () => {
    // Recommendation logic filter
    let matches = allProducts.filter((p) => p.price <= budget);
    
    // Pick first 3 elements
    setResults(matches.slice(0, 3));
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
    alert(`${product.name} added to cart bag!`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="font-display font-bold text-3xl bg-gradient-to-r from-brand-pink to-brand-lavender bg-clip-text text-transparent">AI Gifting Matchmaker</h1>
        <p className="text-xs text-brand-gray">Specify recipient profiles to generate customized gift packages</p>
      </div>

      {!results ? (
        <div className="glass-card p-8 rounded-3xl border-brand-pink/15 shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
            
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold uppercase text-brand-gray tracking-wider">Recipient Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full py-3 px-4 rounded-xl glass-input bg-white"
              >
                <option value="female">For Her</option>
                <option value="male">For Him</option>
                <option value="unisex">Unisex / Couples</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold uppercase text-brand-gray tracking-wider">Relationship</label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full py-3 px-4 rounded-xl glass-input bg-white"
              >
                <option value="partner">Partner / Spouse</option>
                <option value="friend">Best Friend</option>
                <option value="family">Sibling / Family Member</option>
                <option value="colleague">Corporate / Colleague</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold uppercase text-brand-gray tracking-wider">Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full py-3 px-4 rounded-xl glass-input bg-white"
              >
                <option value="birthday">Birthday Celebration</option>
                <option value="anniversary">Anniversary Romantic Night</option>
                <option value="sorry">Apology / Making Up</option>
                <option value="just-because">Just Because / Appreciation</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold uppercase text-brand-gray tracking-wider">Budget limit (INR)</label>
              <select
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full py-3 px-4 rounded-xl glass-input bg-white"
              >
                <option value="1000">Under ₹1,000</option>
                <option value="2000">Under ₹2,000</option>
                <option value="5000">Under ₹5,000</option>
              </select>
            </div>

          </div>

          <button
            onClick={handleRecommend}
            className="w-full bg-brand-pink text-white py-4 rounded-full font-bold text-xs hover:bg-brand-pink/90 hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold" /> Find Matches
          </button>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl border-brand-pink/15 space-y-6">
          <div className="flex items-center gap-2 border-b border-brand-pink/5 pb-2">
            <div className="w-8 h-8 rounded-full bg-brand-pinkLight flex items-center justify-center text-brand-pink">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-sm text-brand-charcoal">AI Matchmaker Recommendations</h3>
          </div>
          
          <p className="text-xs text-brand-gray">
            Based on a budget of <strong>₹{budget}</strong> for your <strong>{relation}</strong>'s <strong>{occasion}</strong>, we've designed these combinations:
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2">
            {results.map((product) => (
              <div key={product.id} className="border border-brand-pink/10 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs bg-white">
                <img src={product.image} className="w-16 h-16 rounded-xl object-cover" alt={product.name} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-brand-charcoal truncate">{product.name}</h4>
                  <p className="text-[10px] text-brand-pink font-semibold">₹{product.price}</p>
                  <p className="text-[9px] text-brand-gray line-clamp-1">{product.desc}</p>
                </div>
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="px-4 py-2 bg-brand-pink text-white rounded-full text-[10px] font-bold hover:bg-brand-pink/90 transition-all flex items-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-brand-pink/5 flex justify-end">
            <button
              onClick={() => setResults(null)}
              className="px-6 py-2 border border-brand-pink/15 rounded-full text-xs font-bold text-brand-charcoal hover:bg-brand-pinkLight transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Another Recipe
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
