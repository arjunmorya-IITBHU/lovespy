"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Heart, ShoppingCart, Star } from "lucide-react";
import { getCategories, getProducts, Product, getEffectiveStock } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const categories = getCategories();
  
  // Filter for ready-made hampers based on tags and sort by trendingOrder
  const trendingHampers = getProducts()
    .filter((p) => !p.is_hamper_item && p.tags.includes("Trending"))
    .sort((a, b) => (a.trendingOrder || 0) - (b.trendingOrder || 0));

  // Filter for trending products based on tags
  const trendingProducts = getProducts()
    .filter((p) => p.is_hamper_item && p.tags.includes("Trending"));

  const { cart, addToCart, wishlist, toggleWishlist, updateQty } = useCart();
  const { user } = useAuth();

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

  // Helper to repeat items to ensure marquee track has enough items to scroll seamlessly
  const getRepeatedItems = (items: Product[], minCount = 8) => {
    if (items.length === 0) return [];
    let repeated = [...items];
    while (repeated.length < minCount) {
      repeated = [...repeated, ...items];
    }
    return repeated;
  };

  const renderMarqueeHamperCard = (product: Product, index: number) => {
    const isWish = wishlist.includes(product.id);
    const effectiveStock = getEffectiveStock(product.id, getProducts());
    const isOutOfStock = effectiveStock <= 0;
    return (
      <div
        key={`${product.id}-hamper-${index}`}
        className="w-[280px] sm:w-[310px] shrink-0 glass-card rounded-2xl overflow-hidden border border-brand-pink/10 hover:border-brand-pink/40 hover:shadow-lg transition-all flex flex-col group relative bg-white"
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
          {isOutOfStock && (
            <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-600/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                Out Of Stock
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
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

          <div className="pt-2 border-t border-brand-pink/5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] text-brand-gray block">Price</span>
                <span className="font-bold text-sm text-brand-charcoal">₹{product.price}</span>
              </div>
              <div className="text-[9px] font-semibold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></span>
                <span className={isOutOfStock ? "text-red-500" : "text-brand-gray"}>
                  {isOutOfStock ? "Out of Stock" : `Stock: ${effectiveStock}`}
                </span>
              </div>
            </div>
            
            <Link
              href={`/shop/${product.slug}`}
              className="w-full py-2.5 bg-brand-pink hover:bg-brand-pink/90 text-white text-center rounded-full text-xs font-bold transition-all shadow-md shadow-brand-pink/10 block hover:-translate-y-0.5"
            >
              Shop Now / Quick View
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderMarqueeProductCard = (product: Product, index: number) => {
    const isWish = wishlist.includes(product.id);
    const effectiveStock = getEffectiveStock(product.id, getProducts());
    const isOutOfStock = effectiveStock <= 0;
    const cartItem = cart.find((item) => item.id === product.id && item.type === "product");
    const quantityInCart = cartItem ? cartItem.qty : 0;
    return (
      <div
        key={`${product.id}-product-${index}`}
        className="w-[280px] sm:w-[310px] shrink-0 glass-card rounded-2xl overflow-hidden border border-brand-pink/10 hover:border-brand-pink/40 hover:shadow-lg transition-all flex flex-col group relative bg-white"
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
          {isOutOfStock && (
            <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-600/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                Out Of Stock
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
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
            <span className="font-display font-bold text-sm text-brand-charcoal line-clamp-1">
              {product.name}
            </span>
            <p className="text-[11px] text-brand-gray line-clamp-2 mt-1">{product.desc}</p>
          </div>

          <div className="pt-2 border-t border-brand-pink/5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] text-brand-gray block">Price</span>
                <span className="font-bold text-sm text-brand-charcoal">₹{product.price}</span>
              </div>
              <div className="text-[9px] font-semibold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></span>
                <span className={isOutOfStock ? "text-red-500" : "text-brand-gray"}>
                  {isOutOfStock ? "Out of Stock" : `Stock: ${effectiveStock}`}
                </span>
              </div>
            </div>
            
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-2.5 rounded-full text-xs font-bold bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1.5 border-0"
              >
                Sold Out
              </button>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center justify-between bg-slate-100 rounded-full px-4 py-2 border border-brand-pink/15">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateQty(product.id, quantityInCart - 1);
                  }}
                  className="text-brand-charcoal hover:text-brand-pink text-xs font-black px-1.5 cursor-pointer bg-transparent border-0"
                >
                  -
                </button>
                <span className="font-extrabold text-xs text-brand-charcoal select-none">
                  {quantityInCart}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (quantityInCart < effectiveStock) {
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
                className="w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md bg-brand-pink text-white hover:bg-brand-pink/90 shadow-brand-pink/10 hover:-translate-y-0.5 cursor-pointer border-0"
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-16 animate-slide-up">
      
      {/* Hero Banner Slider */}
      <section className="relative rounded-3xl overflow-hidden glass-card shadow-glass p-8 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-16 border-brand-pink/15">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pinkLight border border-brand-pink/20 text-xs font-bold text-brand-pink">
            <Sparkles className="w-3.5 h-3.5" /> Valentine's Day Season Live
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-brand-charcoal leading-tight">
            Make Every Gift <br />
            <span className="bg-gradient-to-r from-brand-pink to-brand-lavender bg-clip-text text-transparent">
              Tell A Story
            </span>
          </h1>
          <p className="text-brand-gray text-sm md:text-base max-w-md">
            Build bespoke, high-quality gift baskets designed to evoke tears of joy. Add handwritten letters, polaroid magnet wraps, and custom voice greeting cards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/hamper-builder"
              className="px-8 py-4 bg-brand-pink text-white rounded-full font-bold text-sm hover:bg-brand-pink/90 hover:shadow-lg hover:shadow-brand-pink/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold animate-spin-slow" /> Design A Custom Hamper
            </Link>
            <Link
              href="/shop?tab=hampers"
              className="px-8 py-4 bg-white border border-brand-pink/10 rounded-full font-bold text-sm text-brand-charcoal hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Browse Ready Hampers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex-1 relative flex justify-center">
          <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/20">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80"
              alt="Beautiful Hamper"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-brand-pinkLight rounded-full filter blur-2xl opacity-60"></div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-brand-lavenderLight rounded-full filter blur-2xl opacity-60"></div>
        </div>
      </section>
 
      {/* Categories Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Shop by Curated Occasions</h2>
          <p className="text-xs text-brand-gray">Hand-picked hampers crafted perfectly for milestones that matter</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?tab=hampers&category=${cat.slug}`}
              className="glass-card p-6 rounded-2xl border-brand-pink/10 hover:border-brand-pink/40 hover:-translate-y-1 hover:shadow-md transition-all text-center flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-brand-pinkLight flex items-center justify-center text-brand-pink">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-charcoal">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
 
      {/* Trending Ready-made Hampers Carousel */}
      <section className="space-y-6 overflow-hidden">
        <div className="flex items-end justify-between border-b border-brand-pink/5 pb-4 px-2">
          <div>
            <h2 className="font-display font-bold text-2xl text-brand-charcoal">Trending Hampers</h2>
            <p className="text-xs text-brand-gray">Most loved configurations fly off our shelves daily</p>
          </div>
          <Link href="/shop?tab=hampers" className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1">
            View All Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
 
        {trendingHampers.length === 0 ? (
          <div className="text-center py-8 text-xs text-brand-gray bg-slate-50 rounded-2xl border border-dashed border-brand-pink/15">
            No trending hampers available.
          </div>
        ) : (
          <div className="relative w-full overflow-hidden select-none py-2">
            {/* Fade overlays for premium glass slider effect */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 via-slate-50/70 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 via-slate-50/70 to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex animate-marquee w-max">
              <div className="flex gap-6 shrink-0 pr-6">
                {getRepeatedItems(trendingHampers).map((product, idx) => renderMarqueeHamperCard(product, idx))}
              </div>
              <div className="flex gap-6 shrink-0 pr-6" aria-hidden="true">
                {getRepeatedItems(trendingHampers).map((product, idx) => renderMarqueeHamperCard(product, idx + 100))}
              </div>
            </div>
          </div>
        )}
      </section>
 
      {/* Trending Products Carousel */}
      <section className="space-y-6 overflow-hidden">
        <div className="flex items-end justify-between border-b border-brand-pink/5 pb-4 px-2">
          <div>
            <h2 className="font-display font-bold text-2xl text-brand-charcoal">Trending Products</h2>
            <p className="text-xs text-brand-gray">Dainty accents, truffles, and plush toys to spruce up your custom box</p>
          </div>
          <Link href="/shop?tab=gifts" className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {trendingProducts.length === 0 ? (
          <div className="text-center py-8 text-xs text-brand-gray bg-slate-50 rounded-2xl border border-dashed border-brand-pink/15">
            No trending products available.
          </div>
        ) : (
          <div className="relative w-full overflow-hidden select-none py-2">
            {/* Fade overlays */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 via-slate-50/70 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 via-slate-50/70 to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex animate-marquee w-max">
              <div className="flex gap-6 shrink-0 pr-6">
                {getRepeatedItems(trendingProducts).map((product, idx) => renderMarqueeProductCard(product, idx))}
              </div>
              <div className="flex gap-6 shrink-0 pr-6" aria-hidden="true">
                {getRepeatedItems(trendingProducts).map((product, idx) => renderMarqueeProductCard(product, idx + 100))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Custom Surprise Page Promotion */}
      <section className="relative rounded-3xl overflow-hidden glass-card shadow-glass p-8 md:p-12 border border-brand-pink/15 bg-gradient-to-br from-brand-charcoal via-slate-900 to-brand-charcoal text-white flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pinkLight border border-brand-pink/20 text-xs font-bold text-brand-pink">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold fill-brand-gold animate-pulse" /> Highly Recommended Digital Gifting
          </span>
          <h2 className="font-display font-extrabold text-2xl md:text-4xl text-white leading-tight">
            Personalized Surprise Website <br />
            <span className="bg-gradient-to-r from-brand-pink to-brand-lavender bg-clip-text text-transparent">
              Order a Custom Digital Memory
            </span>
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-lg leading-relaxed">
            Take gifting to the next level. Let our team design a customized, interactive surprise web page loaded with your photos, video clips, a personal love letter, and Spotify background music. A custom QR code sticker is placed on their physical wooden box for instant scans!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href="/digital-wishes"
              className="px-6 py-3.5 bg-brand-pink text-white rounded-full font-bold text-xs hover:bg-brand-pink/90 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Order Surprise Page (₹299) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex-1 max-w-sm relative w-full">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-10 bg-slate-800/80 p-4">
            <img
              src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&auto=format&fit=crop&q=80"
              alt="Digital Surprise Page Mockup"
              className="w-full aspect-video object-cover rounded-lg shadow-inner"
            />
            <div className="mt-3 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-white">Romantic Neon Proposal</h4>
                <p className="text-[10px] text-slate-400">Interactive wishes theme template</p>
              </div>
              <span className="bg-brand-pink text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase">Live Demo</span>
            </div>
          </div>
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-pink/30 rounded-full filter blur-xl opacity-50"></div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-lavender/30 rounded-full filter blur-xl opacity-50"></div>
        </div>
      </section>

    </div>
  );
}
