"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Heart, ShoppingCart, Star, Play, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCategories, getProducts, Product, getEffectiveStock, getHeroSlides, HeroSlide, HeroSliderSettings, getHeroSliderSettings, getActiveHeroSlides, trackHeroView, trackHeroClick } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const categories = getCategories();
  
  const { cart, addToCart, wishlist, toggleWishlist, updateQty } = useCart();
  const { user } = useAuth();

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sliderSettings, setSliderSettings] = useState<HeroSliderSettings | null>(null);

  useEffect(() => {
    setHeroSlides(getHeroSlides());
    setSliderSettings(getHeroSliderSettings());

    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setIsTablet(w >= 640 && w < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLoggedIn = !!user;
  const activeSlides = getActiveHeroSlides(heroSlides, isMobile, isTablet, isLoggedIn);

  // Auto rotation interval trigger
  useEffect(() => {
    if (activeSlides.length <= 1 || !sliderSettings?.autoRotate) return;
    
    const current = activeSlides[currentSlideIndex];
    const delay = (current?.duration || 5) * 1000;
    
    const timer = setTimeout(() => {
      if (sliderSettings.infiniteLoop) {
        setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
      } else {
        if (currentSlideIndex + 1 < activeSlides.length) {
          setCurrentSlideIndex((prev) => prev + 1);
        }
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [currentSlideIndex, activeSlides, sliderSettings]);

  // Track Hero slide view event
  useEffect(() => {
    const current = activeSlides[currentSlideIndex];
    if (current) {
      trackHeroView(current.id);
    }
  }, [currentSlideIndex, activeSlides]);

  const handleCtaClick = (slideId: string, url: string, target: string) => {
    trackHeroClick(slideId);
    if (!url) return;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      if (target === "_blank") {
        window.open(url, "_blank");
      } else {
        window.location.href = url;
      }
    } else {
      router.push(url);
    }
  };
  
  // Filter for ready-made hampers based on tags and sort by trendingOrder
  const trendingHampers = getProducts()
    .filter((p) => !p.is_hamper_item && p.tags.includes("Trending"))
    .sort((a, b) => (a.trendingOrder || 0) - (b.trendingOrder || 0));

  // Filter for trending products based on tags
  const trendingProducts = getProducts()
    .filter((p) => p.is_hamper_item && p.tags.includes("Trending"));
  
  const hampersRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupCarousel = (container: HTMLDivElement | null) => {
      if (!container) return;

      let isDown = false;
      let startX: number;
      let startY: number;
      let scrollLeft: number;
      let scrollSpeed = 0.5; // pixels per frame
      let autoScrollActive = true;
      let animationId: number;
      let resumeTimeout: NodeJS.Timeout;
      let hasMoved = false;

      const step = () => {
        if (!container) return;
        if (autoScrollActive) {
          container.scrollLeft += scrollSpeed;
          const maxScroll = container.scrollWidth / 2;
          if (maxScroll > 0) {
            if (container.scrollLeft >= maxScroll) {
              container.scrollLeft -= maxScroll;
            }
          }
        }
        animationId = requestAnimationFrame(step);
      };

      const handleScroll = () => {
        const maxScroll = container.scrollWidth / 2;
        if (maxScroll <= 0) return;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft -= maxScroll;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += maxScroll;
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        isDown = true;
        hasMoved = false;
        container.style.cursor = "grabbing";
        startX = e.pageX - container.offsetLeft;
        startY = e.pageY - container.offsetTop;
        scrollLeft = container.scrollLeft;
        autoScrollActive = false;
        clearTimeout(resumeTimeout);
      };

      const handleMouseLeave = () => {
        if (isDown) {
          isDown = false;
          container.style.cursor = "grab";
          resumeAutoScroll();
        }
      };

      const handleMouseUp = () => {
        if (isDown) {
          isDown = false;
          container.style.cursor = "grab";
          resumeAutoScroll();
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        const x = e.pageX - container.offsetLeft;
        const y = e.pageY - container.offsetTop;
        const walkX = x - startX;
        const walkY = y - startY;

        if (Math.abs(walkX) > 5 || Math.abs(walkY) > 5) {
          hasMoved = true;
        }

        if (hasMoved) {
          e.preventDefault();
          container.scrollLeft = scrollLeft - walkX * 1.5;
        }
      };

      const handleTouchStart = () => {
        autoScrollActive = false;
        clearTimeout(resumeTimeout);
      };

      const handleTouchEnd = () => {
        resumeAutoScroll();
      };

      const handleClick = (e: MouseEvent) => {
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const resumeAutoScroll = () => {
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
          autoScrollActive = true;
        }, 1500);
      };

      container.addEventListener("scroll", handleScroll);
      container.addEventListener("mousedown", handleMouseDown);
      container.addEventListener("mouseleave", handleMouseLeave);
      container.addEventListener("mouseup", handleMouseUp);
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("touchstart", handleTouchStart, { passive: true });
      container.addEventListener("touchend", handleTouchEnd, { passive: true });
      container.addEventListener("click", handleClick, true);

      step();

      return () => {
        cancelAnimationFrame(animationId);
        clearTimeout(resumeTimeout);
        container.removeEventListener("scroll", handleScroll);
        container.removeEventListener("mousedown", handleMouseDown);
        container.removeEventListener("mouseleave", handleMouseLeave);
        container.removeEventListener("mouseup", handleMouseUp);
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchend", handleTouchEnd);
        container.removeEventListener("click", handleClick, true);
      };
    };

    const cleanupHampers = setupCarousel(hampersRef.current);
    const cleanupProducts = setupCarousel(productsRef.current);

    return () => {
      if (cleanupHampers) cleanupHampers();
      if (cleanupProducts) cleanupProducts();
    };
  }, [trendingHampers, trendingProducts]);

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
        className="w-[155px] sm:w-[310px] shrink-0 glass-card rounded-2xl overflow-hidden border border-brand-pink/10 hover:border-brand-pink/40 hover:shadow-lg transition-all flex flex-col group relative bg-white"
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
          {isOutOfStock && (
            <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-600/90 text-white px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-md">
                Out Of Stock
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 sm:top-3 sm:right-3 sm:w-8.5 sm:h-8.5 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-brand-gray"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${isWish ? "text-red-500 fill-red-500" : ""}`} />
          </button>
        </div>

        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
          <div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-brand-gray mb-0.5 sm:mb-1">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-gold fill-brand-gold" />
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

          <div className="pt-2 border-t border-brand-pink/5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[8px] sm:text-[9px] text-brand-gray block">Price</span>
                <span className="font-bold text-xs sm:text-sm text-brand-charcoal">₹{product.price}</span>
              </div>
              <div className="text-[9px] font-semibold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></span>
                <span className={isOutOfStock ? "text-red-500 text-[8px] sm:text-[9px]" : "text-brand-gray text-[8px] sm:text-[9px]"}>
                  {isOutOfStock ? "Out of Stock" : `Stock: ${effectiveStock}`}
                </span>
              </div>
            </div>
            
            <Link
              href={`/shop/${product.slug}`}
              className="w-full py-1.5 sm:py-2.5 bg-brand-pink hover:bg-brand-pink/90 text-white text-center rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-md shadow-brand-pink/10 block hover:-translate-y-0.5"
            >
              Shop Now
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
        className="w-[155px] sm:w-[310px] shrink-0 glass-card rounded-2xl overflow-hidden border border-brand-pink/10 hover:border-brand-pink/40 hover:shadow-lg transition-all flex flex-col group relative bg-white"
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
          {isOutOfStock && (
            <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-600/90 text-white px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-md">
                Out Of Stock
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 sm:top-3 sm:right-3 sm:w-8.5 sm:h-8.5 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-brand-gray"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${isWish ? "text-red-500 fill-red-500" : ""}`} />
          </button>
        </div>

        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
          <div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-brand-gray mb-0.5 sm:mb-1">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-gold fill-brand-gold" />
              <span className="font-bold text-brand-charcoal">{product.rating}</span>
              <span className="hidden sm:inline">(30+ reviews)</span>
            </div>
            <span className="font-display font-bold text-xs sm:text-sm text-brand-charcoal line-clamp-1">
              {product.name}
            </span>
            <p className="hidden sm:block text-[11px] text-brand-gray line-clamp-2 mt-1">{product.desc}</p>
          </div>

          <div className="pt-2 border-t border-brand-pink/5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[8px] sm:text-[9px] text-brand-gray block">Price</span>
                <span className="font-bold text-xs sm:text-sm text-brand-charcoal">₹{product.price}</span>
              </div>
              <div className="text-[9px] font-semibold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}></span>
                <span className={isOutOfStock ? "text-red-500 text-[8px] sm:text-[9px]" : "text-brand-gray text-[8px] sm:text-[9px]"}>
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
      {activeSlides.length === 0 ? (
        <section className="relative rounded-3xl overflow-hidden glass-card shadow-glass p-8 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-16 border-brand-pink/15 min-h-[400px]">
          <div className="flex-1 space-y-6">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-brand-charcoal leading-tight">Welcome to Lovespy</h1>
            <p className="text-brand-gray text-sm md:text-base">Design custom luxury hampers for your loved ones.</p>
          </div>
        </section>
      ) : (
        (function() {
          const slide = activeSlides[currentSlideIndex] || activeSlides[0];
          const posClass = slide.contentPosition === 'center' ? 'justify-center' : slide.contentPosition === 'right' ? 'justify-end' : 'justify-start';
          const alignClass = slide.textAlignment === 'center' ? 'text-center items-center' : slide.textAlignment === 'right' ? 'text-right items-end' : 'text-left items-start';
          const bgImageSrc = isMobile ? (slide.mobileImage || slide.desktopImage) : slide.desktopImage;
          const isCampaign = slide.campaignType && slide.campaignType !== "None";

          return (
            <section id="homepage-hero-section" className="relative rounded-3xl overflow-hidden glass-card shadow-lg flex flex-col items-center justify-center border-brand-pink/10 min-h-[460px] select-none w-full">
              {/* Background media */}
              <div className="absolute inset-0 z-0 transition-opacity duration-500">
                {slide.backgroundType === 'video' && slide.video && !isMobile ? (
                  <video
                    src={slide.video}
                    key={slide.video}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : slide.backgroundType === 'image' ? (
                  <img
                    src={bgImageSrc || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"}
                    alt="Beautiful Hamper"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backgroundColor: slide.backgroundColor || '#1a1a1a' }}
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: slide.overlayColor || "#000000", opacity: slide.overlayOpacity || 0.3 }}
                />
              </div>

              {/* Content wrapper layer */}
              <div className={`relative z-10 flex flex-col md:flex-row items-center justify-between w-full h-full p-8 md:p-16 gap-8 transition-all duration-300 hero-content-wrapper ${posClass}`}>
                <div className={`flex-1 max-w-xl space-y-6 flex flex-col ${alignClass}`} style={{ color: slide.textColor || '#ffffff' }}>
                  {slide.badgeLabel ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pinkLight border border-brand-pink/20 text-xs font-bold text-brand-pink">
                      <Award className="w-3.5 h-3.5" /> {slide.badgeLabel}
                    </span>
                  ) : isCampaign ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pinkLight border border-brand-pink/20 text-xs font-bold text-brand-pink">
                      <Sparkles className="w-3.5 h-3.5" /> {slide.campaignType} Live
                    </span>
                  ) : null}
                  
                  {slide.offerText && (
                    <div className="text-xs uppercase tracking-wider font-extrabold text-brand-pink bg-brand-pinkLight/30 border border-brand-pink/15 px-3 py-1.5 rounded-xl inline-block max-w-max select-none">
                      {slide.offerText}
                    </div>
                  )}

                  <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight" dangerouslySetInnerHTML={{ __html: slide.title }}>
                  </h1>
                  <p className="text-sm md:text-base opacity-90 max-w-md">
                    {slide.subtitle}
                  </p>
                  {slide.description && (
                    <p className="text-xs opacity-75 max-w-sm">{slide.description}</p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto">
                    {(slide.ctas || []).map((cta, idx) => {
                      const btnStyle = cta.style === 'primary'
                        ? "px-8 py-4 bg-brand-pink text-white rounded-full font-bold text-sm hover:bg-brand-pink/90 hover:shadow-lg hover:shadow-brand-pink/25 hover:-translate-y-0.5"
                        : "px-8 py-4 bg-white border border-brand-pink/10 rounded-full font-bold text-sm text-brand-charcoal hover:bg-slate-50";
                      return (
                        <button
                          key={idx}
                          onClick={() => handleCtaClick(slide.id, cta.url, cta.target)}
                          className={`${btnStyle} transition-all flex items-center justify-center gap-2`}
                        >
                          {cta.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {slide.rightImage && (
                  <div className="flex-1 relative flex justify-center items-center shrink-0 w-full md:w-auto">
                    <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-white/10 backdrop-blur-md">
                      <img 
                        src={isMobile && slide.rightImageMobile ? slide.rightImageMobile : slide.rightImage} 
                        className="w-full h-full object-cover select-none pointer-events-none" 
                        alt="Promo display"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {sliderSettings?.showArrows && activeSlides.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlideIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white z-20 flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                  <button
                    onClick={() => setCurrentSlideIndex(prev => (prev + 1) % activeSlides.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white z-20 flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Dots Indicators */}
              {sliderSettings?.showDots && activeSlides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-20">
                  {activeSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'bg-white w-6' : 'bg-white/40 w-2'}`}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })()
      )}
 
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
              href={`/shop?tab=gifts&category=${encodeURIComponent(cat.slug)}`}
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
            
            <div ref={hampersRef} className="interactive-marquee w-full">
              {[...getRepeatedItems(trendingHampers), ...getRepeatedItems(trendingHampers)].map((product, idx) => renderMarqueeHamperCard(product, idx))}
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
            
            <div ref={productsRef} className="interactive-marquee w-full">
              {[...getRepeatedItems(trendingProducts), ...getRepeatedItems(trendingProducts)].map((product, idx) => renderMarqueeProductCard(product, idx))}
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
