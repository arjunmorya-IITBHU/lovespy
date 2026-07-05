"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCategories, getProducts, Product, getEffectiveStock } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { Heart, Search, Star, ShoppingCart, Frown } from "lucide-react";

export default function Shop() {
  const searchParams = useSearchParams();
  const categories = getCategories();
  const allProducts = getProducts();

  const { cart, addToCart, wishlist, toggleWishlist, updateQty } = useCart();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [activeTab, setActiveTab] = useState<"gifts" | "hampers">("gifts");

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      setSelectedCategory(catParam);
    }
    const tabParam = searchParams.get("tab");
    if (tabParam === "hampers") {
      setActiveTab("hampers");
    } else if (tabParam === "gifts") {
      setActiveTab("gifts");
    }
  }, [searchParams]);

  // Scroll to results when tab changes
  useEffect(() => {
    const section = document.getElementById("shop-listing-results");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab]);

  // Filtering + Sorting Logic
  let baseFiltered = allProducts;

  if (selectedCategory !== "all") {
    baseFiltered = baseFiltered.filter((p) => p.category === selectedCategory);
  }

  baseFiltered = baseFiltered.filter((p) => p.price <= maxPrice);

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    baseFiltered = baseFiltered.filter((p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }

  if (sortBy === "price-asc") {
    baseFiltered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    baseFiltered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    baseFiltered.sort((a, b) => b.rating - a.rating);
  }

  const hampers = baseFiltered.filter((p) => !p.is_hamper_item);
  const accents = baseFiltered.filter((p) => p.is_hamper_item);

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
  };

  const renderProductCard = (product: Product) => {
    const isWish = wishlist.includes(product.id);
    const stockVal = getEffectiveStock(product.id, allProducts);
    const cartItem = cart.find((item) => item.id === product.id && item.type === "product");
    const quantityInCart = cartItem ? cartItem.qty : 0;
    return (
      <div
        key={product.id}
        className="glass-card rounded-2xl overflow-hidden border-brand-pink/10 hover:border-brand-pink/40 hover:shadow-lg transition-all flex flex-col group relative bg-white"
      >
        <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold uppercase text-brand-charcoal tracking-wider border border-white/30">
            {product.category}
          </span>
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-3 right-3 w-8.5 h-8.5 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-brand-gray"
          >
            <Heart className={`w-4.5 h-4.5 ${isWish ? "text-red-500 fill-red-500" : ""}`} />
          </button>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-brand-gray mb-1">
              <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
              <span className="font-bold text-brand-charcoal">{product.rating}</span>
              <span>(30+ reviews)</span>
            </div>
            <Link
              href={`/shop/${product.slug}`}
              className="font-display font-bold text-sm text-brand-charcoal hover:text-brand-pink transition-colors cursor-pointer line-clamp-1"
            >
              {product.name}
            </Link>
            <p className="text-[11px] text-brand-gray line-clamp-2 mt-1">{product.desc}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-brand-pink/5">
            <div>
              <span className="text-[10px] text-brand-gray block">Price</span>
              <span className="font-bold text-base text-brand-charcoal">₹{product.price}</span>
            </div>
            {stockVal > 0 ? (
              quantityInCart > 0 ? (
                <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1 border border-brand-pink/15">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateQty(product.id, quantityInCart - 1);
                    }}
                    className="text-brand-charcoal hover:text-brand-pink text-xs font-black px-1.5 cursor-pointer bg-transparent border-0"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-brand-charcoal min-w-[14px] text-center select-none">
                    {quantityInCart}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (quantityInCart < stockVal) {
                        updateQty(product.id, quantityInCart + 1);
                      } else {
                        alert("Not enough stock available.");
                      }
                    }}
                    className="text-brand-charcoal hover:text-brand-pink text-xs font-black px-1.5 cursor-pointer bg-transparent border-0"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="px-4 py-2 bg-brand-pink text-white rounded-full text-xs font-semibold hover:bg-brand-pink/90 transition-all flex items-center gap-1 shadow-md shadow-brand-pink/10 cursor-pointer border-0"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Add
                </button>
              )
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-slate-200 text-slate-400 rounded-full text-xs font-semibold cursor-not-allowed flex items-center gap-1 border-0"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="font-display font-bold text-3xl">Gifting Catalog</h1>
        <p className="text-xs text-brand-gray">Explore prepared bundles or pick separate accents for hamper customization</p>
      </div>

      {/* Segmented Switch Control */}
      <div className="flex justify-center pt-2">
        <div className="bg-slate-100 p-1.5 rounded-full flex gap-1 border border-slate-200/60 shadow-inner">
          <button
            onClick={() => setActiveTab("gifts")}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all duration-300 border-0 cursor-pointer ${activeTab === "gifts"
              ? "bg-brand-pink text-white shadow-md"
              : "text-brand-gray hover:text-brand-charcoal hover:bg-slate-200/50"
              }`}
          >
            Gifts
          </button>
          <button
            onClick={() => setActiveTab("hampers")}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all duration-300 border-0 cursor-pointer ${activeTab === "hampers"
              ? "bg-brand-pink text-white shadow-md"
              : "text-brand-gray hover:text-brand-charcoal hover:bg-slate-200/50"
              }`}
          >
            Ready-Made Hampers
          </button>
        </div>
      </div>

      {/* Advanced Filter Shelf */}
      <div className="glass-card p-6 rounded-2xl border-brand-pink/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Category */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase text-brand-gray tracking-wider">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg border border-brand-pink/20 bg-white/70 focus:outline-none focus:border-brand-pink"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Max Price */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase text-brand-gray tracking-wider">
            <span>Max Price</span>
            <span className="font-bold text-brand-pink">₹{maxPrice}</span>
          </div>
          <input
            type="range"
            min="100"
            max="5000"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-brand-pink h-1 rounded-lg bg-slate-200 appearance-none"
          />
        </div>

        {/* Search */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase text-brand-gray tracking-wider">Search Keyword</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Truffles, roses, necklace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold py-2.5 pl-8 pr-3 rounded-lg border border-brand-pink/20 bg-white/70 focus:outline-none focus:border-brand-pink"
            />
            <Search className="w-3.5 h-3.5 text-brand-gray absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Sort by */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase text-brand-gray tracking-wider">Sort Result</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full text-xs font-semibold py-2.5 px-3 rounded-lg border border-brand-pink/20 bg-white/70 focus:outline-none focus:border-brand-pink"
          >
            <option value="popular">Best Selling / Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

      </div>

      {/* Split Grid Lists */}
      <div id="shop-listing-results" className="space-y-12">
        {/* Section 1: Ready-Made Hampers */}
        {activeTab === "hampers" && (
          hampers.length > 0 ? (
            <div className="space-y-4" id="ready-made-hampers-section">
              <div className="border-b border-brand-pink/10 pb-2">
                <h2 className="font-display font-bold text-xl text-brand-charcoal">Ready-Made Hampers abcd e</h2>
                <p className="text-xs text-brand-gray">Luxurious preset bundles crafted by our gifting experts for immediate delight</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {hampers.map(renderProductCard)}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-pinkLight flex items-center justify-center mx-auto text-brand-pink">
                <Frown className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-brand-charcoal">No Ready-Made Hampers Found</p>
              <p className="text-xs text-brand-gray">Try clearing filters or checking other pricing ranges.</p>
            </div>
          )
        )}

        {/* Section 2: Gifting Accents & Keepsakes */}
        {activeTab === "gifts" && (
          accents.length > 0 ? (
            <div className="space-y-4">
              <div className="border-b border-brand-pink/10 pb-2">
                <h2 className="font-display font-bold text-xl text-brand-charcoal">Gifting Accents & Keepsakes</h2>
                <p className="text-xs text-brand-gray">Individual premium elements to design your own bundle or purchase separately</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {accents.map(renderProductCard)}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-pinkLight flex items-center justify-center mx-auto text-brand-pink">
                <Frown className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-brand-charcoal">No Gifting Accents Found</p>
              <p className="text-xs text-brand-gray">Try clearing filters or checking other pricing ranges.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
