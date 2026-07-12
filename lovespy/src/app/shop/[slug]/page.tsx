"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProducts, Product, getEffectiveStock, getReviews, setReviews, ProductReview } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { Star, Check, ShoppingCart, Heart, CheckCircle, Info, ArrowLeft, Award, MessageSquare } from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const allProducts = getProducts();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const product = allProducts.find((p) => p.slug === params.slug);
  const [mainImg, setMainImg] = useState(product?.image || "");
  
  // Reviews dynamic state
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(getReviews());
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);

  // Personalization States
  const [receiverName, setReceiverName] = useState("");
  const [personalLetter, setPersonalLetter] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [voiceQrAttached, setVoiceQrAttached] = useState(false);
  const [voiceRecordingUrl, setVoiceRecordingUrl] = useState("");

  if (!product) {
    return <p className="text-center py-20 font-bold text-sm">Product not found.</p>;
  }

  const isWish = wishlist.includes(product.id);
  const effectiveStock = getEffectiveStock(product.id, allProducts);
  const isOutOfStock = effectiveStock <= 0;

  // Filter approved reviews for this product
  const matchingReviews = reviewsList.filter(r => r.productId === product.id && (r.status === "approved" || !r.status));
  const avgRating = matchingReviews.length > 0
    ? (matchingReviews.reduce((acc, r) => acc + r.rating, 0) / matchingReviews.length).toFixed(1)
    : (product.rating || 4.8).toString();

  // Customization cost calculation
  const photoPrice = 15;
  const voiceQrPrice = 25;
  const customizationCost = (!product.is_hamper_item ? (photos.length * photoPrice) + (voiceQrAttached ? voiceQrPrice : 0) : 0);
  const finalPrice = product.price + customizationCost;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const newPhotos = filesArr.map(f => URL.createObjectURL(f) || f.name);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const isReadyMadeHamper = !product.is_hamper_item;

    addToCart({
      id: isReadyMadeHamper ? `${product.id}-${Date.now()}` : product.id,
      name: product.name,
      price: finalPrice,
      qty: 1,
      type: "product",
      image: product.image,
      details: isReadyMadeHamper ? {
        productId: product.id,
        receiverName,
        personalLetter,
        photos,
        voiceQrAttached,
        customizationCost
      } : undefined
    });
    alert(`${product.name} added to cart bag!`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const isReadyMadeHamper = !product.is_hamper_item;

    addToCart({
      id: isReadyMadeHamper ? `${product.id}-${Date.now()}` : product.id,
      name: product.name,
      price: finalPrice,
      qty: 1,
      type: "product",
      image: product.image,
      details: isReadyMadeHamper ? {
        productId: product.id,
        receiverName,
        personalLetter,
        photos,
        voiceQrAttached,
        customizationCost
      } : undefined
    });
    router.push("/cart");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newRev: ProductReview = {
      id: "rev-" + Date.now(),
      productId: product.id,
      userName: "Ananya Sharma",
      title: reviewTitle || "Review Slogan",
      rating: Number(reviewRating),
      comment: reviewComment,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      photos: reviewPhotos,
      userImage: ""
    };

    const updated = [newRev, ...reviewsList];
    setReviewsList(updated);
    setReviews(updated);
    setReviewComment("");
    setReviewTitle("");
    setReviewPhotos([]);
    alert("Review submitted successfully! It is pending administrator approval.");
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Back to Catalog Breadcrumb */}
      <div>
        <Link
          href={product.is_hamper_item ? "/shop?tab=gifts" : "/shop?tab=hampers"}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gray hover:text-brand-pink transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to {product.is_hamper_item ? "Gift Catalog" : "Ready-Made Hampers"}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-16">

        {/* Left Gallery */}
        <div className="flex-1 space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-brand-pink/10 shadow-lg relative">
            <img src={mainImg || product.image} alt={product.name} className="w-full h-full object-cover" />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                  Out Of Stock
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setMainImg(product.image)}
              className="w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-pink shadow-sm shrink-0"
            >
              <img src={product.image} className="w-full h-full object-cover" alt="Thumb" />
            </button>
            {(product.gallery || []).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImg(img)}
                className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-brand-pink transition-all shrink-0"
              >
                <img src={img} className="w-full h-full object-cover" alt="Thumb" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Details */}
        <div className="flex-1 space-y-6">
          <span className="inline-block bg-brand-pinkLight px-3 py-1 rounded-full text-xs font-bold text-brand-pink border border-brand-pink/15 capitalize">
            {product.category}
          </span>
          <h1 className="font-display font-extrabold text-3xl text-brand-charcoal">{product.name}</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
              <span className="font-bold text-brand-charcoal">{product.rating}</span>
              <span className="text-brand-gray">(28 Reviews)</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isOutOfStock ? "text-red-500 bg-red-50" : "text-green-500 bg-green-50"}`}>
              {isOutOfStock ? "⚠️ Sold Out" : `✓ In Stock: ${effectiveStock}`}
            </span>
          </div>

          <div className="py-4 border-y border-brand-pink/5">
            <span className="text-xs text-brand-gray block">Regular Price</span>
            <span className="font-display font-extrabold text-3xl text-brand-charcoal">₹{product.price}</span>
            <span className="text-xs text-brand-gray line-through ml-2">₹{product.crossedPrice || Math.round(product.price * 1.25)}</span>
            <span className="text-xs text-brand-pink font-bold ml-1">
              ({Math.round((1 - (product.price / (product.crossedPrice || Math.round(product.price * 1.25)))) * 100)}% OFF)
            </span>
          </div>

          <p className="text-sm text-brand-gray leading-relaxed">{product.desc}</p>

          <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-brand-charcoal">
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-pink" /> Premium Packaging Included</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-pink" /> Hand-packed with care</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-pink" /> Customizable greeting card</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-pink" /> 100% Secure Payment</div>
          </div>

          {/* PERSONALIZATION FORM FOR READY-MADE HAMPERS */}
          {!product.is_hamper_item && (
            <div className="glass-card p-6 rounded-2xl border border-brand-pink/15 space-y-4 bg-brand-pinkLight/30">
              <div>
                <h3 className="font-display font-bold text-sm text-brand-charcoal">Personalize Your Hamper</h3>
                <p className="text-[10px] text-brand-gray">Ready-made preset hampers are created entirely by Admin. Customize the details below.</p>
              </div>

              <div className="space-y-3">
                {/* Receiver Name */}
                <div>
                  <label className="block text-[9px] font-bold text-brand-gray uppercase mb-1">Receiver Name Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. To: Neha"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-brand-pink/20 bg-white focus:outline-none focus:border-brand-pink"
                  />
                </div>

                {/* Personal Letter */}
                <div>
                  <label className="block text-[9px] font-bold text-brand-gray uppercase mb-1">Heartfelt Personal Letter</label>
                  <textarea
                    rows={3}
                    placeholder="Write your beautiful message or letter here..."
                    value={personalLetter}
                    onChange={(e) => setPersonalLetter(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-brand-pink/20 bg-white focus:outline-none focus:border-brand-pink"
                  ></textarea>
                </div>

                {/* Polaroid Photos */}
                <div>
                  <label className="block text-[9px] font-bold text-brand-gray uppercase mb-1">
                    Upload Polaroid Photos (₹15 / photo)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full text-xs text-brand-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-pinkLight file:text-brand-pink hover:file:bg-brand-pink/15 file:cursor-pointer"
                  />
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {photos.map((ph, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded border border-brand-pink/15 overflow-hidden">
                          <img src={ph} className="w-full h-full object-cover" alt="Uploaded thumbnail" />
                          <button
                            type="button"
                            onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voice Message QR */}
                <div className="p-3 bg-white rounded-xl border border-brand-pink/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-brand-charcoal">Voice Message QR Sticker (+₹25)</span>
                      <span className="block text-[9px] text-brand-gray">Generate a custom QR sticker on your box. No duration limit.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoiceQrAttached(!voiceQrAttached)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${voiceQrAttached ? "bg-brand-pink text-white" : "bg-brand-pinkLight text-brand-pink border border-brand-pink/10"}`}
                    >
                      {voiceQrAttached ? "Attached" : "Attach QR"}
                    </button>
                  </div>
                  {voiceQrAttached && (
                    <div className="space-y-1.5 pt-1.5 border-t border-brand-pink/5">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setVoiceRecordingUrl(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                        className="w-full text-[10px] text-brand-gray file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-slate-100 file:text-slate-700 file:cursor-pointer"
                      />
                      <p className="text-[8px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Full audio upload accepted. A QR linked to your voice recording will be placed on your hamper.
                      </p>
                    </div>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="pt-2 border-t border-brand-pink/5 text-[10px] text-brand-gray space-y-1">
                  <div className="flex justify-between">
                    <span>Base Hamper Price:</span>
                    <span className="font-semibold text-brand-charcoal">₹{product.price}</span>
                  </div>
                  {photos.length > 0 && (
                    <div className="flex justify-between">
                      <span>Polaroid Prints ({photos.length} x ₹15):</span>
                      <span className="font-semibold text-brand-charcoal">₹{photos.length * 15}</span>
                    </div>
                  )}
                  {voiceQrAttached && (
                    <div className="flex justify-between">
                      <span>Voice Message QR Sticker:</span>
                      <span className="font-semibold text-brand-charcoal">₹25</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-brand-pink pt-1 border-t border-dashed border-brand-pink/10">
                    <span>Customized Price:</span>
                    <span>₹{finalPrice}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${isOutOfStock ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-brand-pink text-white hover:bg-brand-pink/90 shadow-brand-pink/15"}`}
            >
              <ShoppingCart className="w-4.5 h-4.5" /> {isOutOfStock ? "Sold Out" : "Add to Cart Bag"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 py-4 rounded-full font-bold text-sm transition-all ${isOutOfStock ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-brand-charcoal text-white hover:bg-brand-charcoal/90"}`}
            >
              {isOutOfStock ? "Sold Out" : "Buy Now"}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="px-5 border border-brand-pink/10 rounded-full hover:bg-brand-pinkLight text-brand-gray hover:text-brand-pink transition-colors"
            >
              <Heart className={`w-5 h-5 ${isWish ? "text-red-500 fill-red-500" : ""}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-6 border-t border-brand-pink/5 pt-12">
        <h2 className="font-display font-bold text-xl text-left">Customer Experiences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="glass-card p-5 rounded-2xl border border-brand-pink/5 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-charcoal">Preeti Sen</span>
              <div className="flex text-brand-gold">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-brand-gold text-brand-gold" />)}
              </div>
            </div>
            <h4 className="font-bold text-xs text-brand-charcoal">Very luxurious arrangements</h4>
            <p className="text-xs text-slate-600 leading-relaxed">"Beautiful arrangement. The velvet roses stayed fresh for three days and the white truffles were delicious."</p>
            <span className="text-[9px] text-brand-gray block">Verified Purchase</span>
          </div>

          {matchingReviews.map((rev) => (
            <div key={rev.id} className="glass-card p-5 rounded-2xl border border-brand-pink/5 bg-slate-50/50 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {rev.userImage ? (
                    <img src={rev.userImage} className="w-8 h-8 rounded-full object-cover border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-pinkLight border border-brand-pink/20 text-brand-pink font-bold flex items-center justify-center text-xs">
                      {rev.userName.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-brand-charcoal block">{rev.userName}</span>
                    <span className="text-[9px] text-brand-gray block">{rev.date || "2026-06-20"}</span>
                  </div>
                </div>
                <div className="flex text-amber-500 font-bold text-[10px]">
                  {"★".repeat(rev.rating)}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-xs text-brand-charcoal">{rev.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">"{rev.comment}"</p>
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-1.5 mt-2.5">
                    {rev.photos.map((p, idx) => (
                      <img key={idx} src={p} className="w-12 h-12 rounded border object-cover cursor-zoom-in" onClick={() => setMainImg(p)} />
                    ))}
                  </div>
                )}
              </div>
              
              {rev.reply && (
                <div className="p-3 bg-brand-pinkLight/20 border border-brand-pink/5 rounded-xl text-[10px] space-y-0.5">
                  <div className="font-bold text-brand-pink flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 inline" /> Store Owner Response:
                  </div>
                  <p className="text-slate-600 italic">"{rev.reply}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
