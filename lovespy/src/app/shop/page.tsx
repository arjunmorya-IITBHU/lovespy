"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProducts, getProductCategories, Product, getEffectiveStock } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { Heart, Search, Star, ShoppingCart, Frown, Sparkles, RotateCcw, Eye, ShoppingBag } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const allProducts = getProducts();

  // Derive unique categories dynamically from all products + any admin-created custom categories
  const productCategories = getProductCategories();

  const { cart, addToCart, wishlist, toggleWishlist, updateQty } = useCart();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [activeTab, setActiveTab] = useState<"gifts" | "hampers" | "ai">("gifts");

  // AI Gift Finder State
  const [recipient, setRecipient] = useState("Friend");
  const [occasion, setOccasion] = useState("Birthday");
  const [budget, setBudget] = useState<number>(2000);
  const [vibe, setVibe] = useState("Cute");
  const [aiResults, setAiResults] = useState<Product[] | null>(null);

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
    } else if (tabParam === "ai") {
      setActiveTab("ai");
    }
  }, [searchParams]);

  const isFirstRender = useRef(true);

  // Scroll to results when tab changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const section = document.getElementById("shop-listing-results");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab]);

  // Filtering + Sorting Logic
  let baseFiltered = allProducts;

  if (selectedCategory !== "all") {
    baseFiltered = baseFiltered.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
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

  const handleRecommend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || budget <= 0) {
      alert("Please specify a valid budget amount.");
      return;
    }

    // Filter primarily based on price <= budget
    let matches = allProducts.filter((p: Product) => {
      if (p.status === "draft") return false;
      return p.price <= budget;
    });

    // Score matches
    matches = matches.map((p) => {
      let score = 0;
      const tags = (p.tags || []).map((t) => t.toLowerCase());
      const name = p.name.toLowerCase();
      const desc = (p.desc || "").toLowerCase();

      if (tags.includes(vibe.toLowerCase()) || name.includes(vibe.toLowerCase())) {
        score += 3;
      }
      if (tags.includes(occasion.toLowerCase()) || name.includes(occasion.toLowerCase())) {
        score += 2;
      }
      if (tags.includes(recipient.toLowerCase()) || name.includes(recipient.toLowerCase())) {
        score += 1;
      }

      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

    setAiResults(matches);
  };

  const renderAiGiftFinder = () => {
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
      <div className="space-y-8 animate-slide-up text-brand-charcoal text-xs">
        {!aiResults ? (
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
              <div className="space-y-1 text-left">
                <h3 className="font-bold text-sm text-brand-charcoal">AI Matchmaker Results</h3>
                <p className="text-[10px] text-brand-gray">
                  Showing matching combinations under <strong>₹{budget.toLocaleString('en-IN')}</strong> for <strong>{recipient}</strong> ({occasion} vibe: <em>{vibe}</em>).
                </p>
              </div>
              <button
                onClick={() => setAiResults(null)}
                className="px-5 py-2.5 border border-brand-pink/15 bg-white rounded-xl text-xs font-extrabold hover:bg-slate-50 transition-all flex items-center gap-1.5 text-brand-charcoal cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start New Search
              </button>
            </div>

            {aiResults.length === 0 ? (
              <div className="text-center py-16 bg-white border border-brand-pink/10 rounded-3xl space-y-3">
                <span className="text-3xl">🔍</span>
                <h4 className="font-bold text-sm text-brand-charcoal">No Products Found</h4>
                <p className="text-xs text-brand-gray max-w-sm mx-auto">
                  No items are currently priced under ₹{budget}. Try increasing your budget range slightly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {aiResults.map((product) => {
                  const crossedPrice = product.crossedPrice || product.originalPrice;
                  const discount = product.discountPercentage;
                  
                  return (
                    <div key={product.id} className="glass-card bg-white border border-brand-pink/10 rounded-3xl overflow-hidden hover:border-brand-pink transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg text-left">
                      <div className="relative aspect-square overflow-hidden bg-slate-50">
                        <img
                          src={product.image}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          alt={product.name}
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[9px] bg-white/80 backdrop-blur-md rounded-full font-bold uppercase text-brand-charcoal tracking-wider border border-white/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {product.rating || "4.8"}
                        </span>
                        {discount && discount > 0 ? (
                          <span className="absolute top-2 right-2 px-2 py-0.5 text-[8px] sm:top-3 sm:right-3 sm:px-2.5 sm:py-1 sm:text-[9px] bg-brand-pink text-white rounded-full font-black tracking-wider uppercase">
                            {discount}% OFF
                          </span>
                        ) : null}
                      </div>

                      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                        <div className="space-y-1">
                          <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-brand-pink tracking-wider">
                            {product.category || "Gift Accents"}
                          </span>
                          <h4 className="font-display font-bold text-xs sm:text-sm text-brand-charcoal line-clamp-1 group-hover:text-brand-pink transition-colors">
                            {product.name}
                          </h4>
                          <p className="hidden sm:block text-[11px] text-brand-gray line-clamp-2 leading-relaxed">
                            {product.desc}
                          </p>
                        </div>

                        <div className="pt-2 flex justify-between items-center border-t border-brand-pink/5">
                          <div className="space-y-0.5">
                            {crossedPrice && crossedPrice > product.price ? (
                              <span className="text-[8px] sm:text-[10px] text-brand-gray line-through block">
                                ₹{crossedPrice}
                              </span>
                            ) : null}
                            <strong className="text-xs sm:text-base text-brand-charcoal font-display">
                              ₹{product.price}
                            </strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 pt-2">
                          <Link
                            href={`/shop/${product.slug}`}
                            className="py-2 rounded-xl border border-slate-200 text-center font-extrabold hover:bg-slate-50 transition-all flex items-center justify-center gap-1 text-slate-700 hover:border-slate-300 text-[10px] sm:text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </Link>
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="py-2 rounded-xl bg-brand-pink text-white font-extrabold hover:bg-brand-pink/90 transition-all flex items-center justify-center gap-1 border-0 cursor-pointer text-[10px] sm:text-xs"
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
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[9px] bg-white/80 backdrop-blur-md rounded-full font-bold uppercase text-brand-charcoal tracking-wider border border-white/30">
            {product.category}
          </span>
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-2 right-2 w-7 h-7 sm:top-3 sm:right-3 sm:w-8.5 sm:h-8.5 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-brand-gray"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${isWish ? "text-red-500 fill-red-500" : ""}`} />
          </button>
        </div>

        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
          <div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-brand-gray mb-0.5 sm:mb-1">
              <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
              <span className="font-bold text-brand-charcoal">{product.rating}</span>
              <span className="hidden sm:inline">(30+ reviews)</span>
            </div>
            <Link
              href={`/shop/${product.slug}`}
              className="font-display font-bold text-xs sm:text-sm text-brand-charcoal hover:text-brand-pink transition-colors cursor-pointer line-clamp-1"
            >
              {product.name}
            </Link>
            <p className="hidden sm:block text-[11px] text-brand-gray line-clamp-2 mt-1">{product.desc}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-brand-pink/5">
            <div>
              <span className="text-[8px] sm:text-[10px] text-brand-gray block">Price</span>
              <span className="font-bold text-xs sm:text-base text-brand-charcoal">₹{product.price}</span>
            </div>
            {stockVal > 0 ? (
              quantityInCart > 0 ? (
                <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 border border-brand-pink/15">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateQty(product.id, quantityInCart - 1);
                    }}
                    className="text-brand-charcoal hover:text-brand-pink text-[10px] sm:text-xs font-black px-1 sm:px-1.5 cursor-pointer bg-transparent border-0"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-[10px] sm:text-xs text-brand-charcoal min-w-[10px] sm:min-w-[14px] text-center select-none">
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
                    className="text-brand-charcoal hover:text-brand-pink text-[10px] sm:text-xs font-black px-1 sm:px-1.5 cursor-pointer bg-transparent border-0"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-brand-pink text-white rounded-full text-[10px] sm:text-xs font-semibold hover:bg-brand-pink/90 transition-all flex items-center gap-1 shadow-md shadow-brand-pink/10 cursor-pointer border-0"
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
              : "text-brand-gray hover:text-brand-charcoal hover:bg-slate-200/50 bg-transparent"
              }`}
          >
            Gift Catalogue
          </button>
          <button
            onClick={() => setActiveTab("hampers")}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all duration-300 border-0 cursor-pointer ${activeTab === "hampers"
              ? "bg-brand-pink text-white shadow-md"
              : "text-brand-gray hover:text-brand-charcoal hover:bg-slate-200/50 bg-transparent"
              }`}
          >
            Ready-Made Hampers
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-8 py-3 rounded-full text-xs font-bold transition-all duration-300 border-0 cursor-pointer ${activeTab === "ai"
              ? "bg-brand-pink text-white shadow-md"
              : "text-brand-gray hover:text-brand-charcoal hover:bg-slate-200/50 bg-transparent"
              }`}
          >
            AI Gift Finder
          </button>
        </div>
      </div>

      {/* Advanced Filter Shelf */}
      {activeTab !== "ai" && (
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
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
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
      )}

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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
        {activeTab === "ai" ? (
          renderAiGiftFinder()
        ) : (
          <>
            {/* Section 1: Ready-Made Hampers */}
            {activeTab === "hampers" && (
              hampers.length > 0 ? (
                <div className="space-y-4" id="ready-made-hampers-section">
                  <div className="border-b border-brand-pink/10 pb-2">
                    <h2 className="font-display font-bold text-xl text-brand-charcoal">Ready-Made Hampers</h2>
                    <p className="text-xs text-brand-gray">Luxurious preset bundles crafted by our gifting experts for immediate delight</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {hampers.map(renderProductCard)}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-pinkLight flex items-center justify-center mx-auto text-brand-pink">
                    <Frown className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-brand-charcoal">No Ready-Made Hampers Found</p>
                  <p className="text-xs text-brand-gray">Try adjusting price bounds or categories filters.</p>
                </div>
              )
            )}

            {/* Section 2: Gifting Accents / Individual Items */}
            {activeTab === "gifts" && (
              accents.length > 0 ? (
                <div className="space-y-4" id="gifting-accents-section">
                  <div className="border-b border-brand-pink/10 pb-2">
                    <h2 className="font-display font-bold text-xl text-brand-charcoal">Gifting Accents & Custom Items</h2>
                    <p className="text-xs text-brand-gray">Separate components to customize your sweet hamper, premium truffles, flowers, and decorations</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
          </>
        )}
      </div>
    </div>
  );
}


export default function Shop() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brand-gray">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
