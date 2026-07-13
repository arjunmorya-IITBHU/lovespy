"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AvatarWidget() {
  const { calculateSubtotal } = useCart();
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [emotion, setEmotion] = useState<"angry" | "neutral" | "happy" | "excited" | "inlove">("angry");

  const subtotal = calculateSubtotal();

  useEffect(() => {
    let newEmotion: typeof emotion = "angry";
    let text = "";

    if (subtotal === 0) {
      newEmotion = "angry";
      text = "Aww, my heart is empty! 💔 Let's build a stunning custom hamper together! Choose a box to start!";
    } else if (subtotal < 800) {
      newEmotion = "neutral";
      text = "That's a neat start! Let's check out some premium add-ons like fairy lights or flowers! 🌸✨";
    } else if (subtotal < 2000) {
      newEmotion = "happy";
      text = "Oooh! This hamper is starting to look so beautiful! Keep going, you're doing great! 🥰";
    } else if (subtotal < 4000) {
      newEmotion = "excited";
      text = "Omg, I'm so excited! This gift is going to be absolutely stellar! Star-level choice! ⭐🎉";
    } else {
      newEmotion = "inlove";
      text = "Stop! 💖 My heart is literally melting! This is the most romantic, luxury hamper ever! 😭🎁✨";
    }

    setEmotion(newEmotion);
    setBubbleText(text);

    // Auto-pop the bubble when cart value updates, UNLESS user preference is hidden
    const isMascotHidden = typeof window !== 'undefined' && sessionStorage.getItem('mascot_bubble_hidden') === 'true';
    if (!isMascotHidden) {
      setBubbleOpen(true);
      const timer = setTimeout(() => setBubbleOpen(false), 6000);
      return () => clearTimeout(timer);
    } else {
      setBubbleOpen(false);
    }
  }, [subtotal]);

  const renderMascot = () => {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full select-none drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hair Back Buns */}
        <circle cx="35" cy="35" r="16" fill="#2D221E" />
        <circle cx="85" cy="35" r="16" fill="#2D221E" />
        <circle cx="35" cy="35" r="12" fill="#D946EF" opacity="0.3" />
        <circle cx="85" cy="35" r="12" fill="#D946EF" opacity="0.3" />
        
        {/* Hair Ties */}
        <rect x="30" y="46" width="10" height="4" rx="2" fill="#FF4E88" />
        <rect x="80" y="46" width="10" height="4" rx="2" fill="#FF4E88" />

        {/* Ears */}
        <circle cx="28" cy="62" r="8" fill="#FDBA74" />
        <circle cx="92" cy="62" r="8" fill="#FDBA74" />
        <circle cx="28" cy="62" r="4" fill="#F472B6" opacity="0.4" />
        <circle cx="92" cy="62" r="4" fill="#F472B6" opacity="0.4" />

        {/* Face Base */}
        <rect x="32" y="40" width="56" height="52" rx="26" fill="#FDBA74" />
        
        {/* Cheeks Blush */}
        <circle cx="44" cy="74" r="6" fill="#FDA4AF" opacity="0.75" />
        <circle cx="76" cy="74" r="6" fill="#FDA4AF" opacity="0.75" />
        
        {/* Hair Front Bangs / Hairline */}
        <path d="M32 48C32 48 44 38 60 44C76 38 88 48 88 48V56C88 56 74 50 60 52C46 50 32 56 32 56V48Z" fill="#2D221E" />
        {/* Side Hair strands */}
        <path d="M32 48C32 48 26 58 27 72C28 84 34 82 34 82" stroke="#2D221E" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M88 48C88 48 94 58 93 72C92 84 86 82 86 82" stroke="#2D221E" strokeWidth="5.5" strokeLinecap="round" />

        {/* Eyes based on state */}
        {emotion === "angry" && (
          <>
            <path d="M40 57L49 61" stroke="#2D221E" strokeWidth="3" strokeLinecap="round" />
            <path d="M80 57L71 61" stroke="#2D221E" strokeWidth="3" strokeLinecap="round" />
            <path d="M41 67C43 64 47 64 49 67" stroke="#2D221E" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M71 67C73 64 77 64 79 67" stroke="#2D221E" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        )}
        {emotion === "neutral" && (
          <>
            <path d="M39 58C42 56 46 56 49 58" stroke="#2D221E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M71 58C74 56 78 56 81 58" stroke="#2D221E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="44" cy="65" r="4" fill="#2D221E" />
            <circle cx="76" cy="65" r="4" fill="#2D221E" />
            <circle cx="45.5" cy="63.5" r="1.5" fill="white" />
            <circle cx="77.5" cy="63.5" r="1.5" fill="white" />
          </>
        )}
        {emotion === "happy" && (
          <>
            <path d="M38 57C41 55 46 55 49 57" stroke="#2D221E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M71 57C74 55 79 55 82 57" stroke="#2D221E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M40 65C42 62 47 62 49 65" stroke="#2D221E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M71 65C73 62 78 62 80 65" stroke="#2D221E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </>
        )}
        {emotion === "excited" && (
          <>
            <path d="M38 54C41 51 46 51 49 54" stroke="#2D221E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M71 54C74 51 79 51 82 54" stroke="#2D221E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="44" cy="64" r="5" fill="#2D221E" />
            <circle cx="76" cy="64" r="5" fill="#2D221E" />
            <circle cx="46" cy="62" r="1.8" fill="white" />
            <circle cx="78" cy="62" r="1.8" fill="white" />
            <polygon points="43,67 44,65 46,66 44.5,67" fill="#FBBF24" />
            <polygon points="75,67 76,65 78,66 76.5,67" fill="#FBBF24" />
          </>
        )}
        {emotion === "inlove" && (
          <>
            <path d="M37 53C41 51 46 51 50 53" stroke="#2D221E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M70 53C74 51 79 51 83 53" stroke="#2D221E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M44 57C41.5 54.5 37.5 55.5 37.5 59.5C37.5 63.5 44 68 44 68C44 68 50.5 63.5 50.5 59.5C50.5 55.5 46.5 54.5 44 57Z" fill="#FF3366" />
            <path d="M76 57C73.5 54.5 69.5 55.5 69.5 59.5C69.5 63.5 76 68 76 68C76 68 82.5 63.5 82.5 59.5C82.5 55.5 78.5 54.5 76 57Z" fill="#FF3366" />
          </>
        )}

        {/* Mouth based on state */}
        {emotion === "angry" && (
          <path d="M54 79C56 76 64 76 66 79" stroke="#2D221E" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
        {emotion === "neutral" && (
          <path d="M54 78H66" stroke="#2D221E" strokeWidth="3" strokeLinecap="round" />
        )}
        {emotion === "happy" && (
          <path d="M52 76C55 81 65 81 68 76" stroke="#2D221E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        )}
        {emotion === "excited" && (
          <path d="M50 74C50 74 52 86 60 86C68 86 70 74 70 74H50Z" fill="#E11D48" stroke="#2D221E" strokeWidth="2.5" strokeLinejoin="round" />
        )}
        {emotion === "inlove" && (
          <path d="M53 77C54 73 66 73 67 77C66 80 54 80 53 77Z" fill="#E11D48" stroke="#2D221E" strokeWidth="2" />
        )}

        {/* Neck */}
        <rect x="52" y="88" width="16" height="10" fill="#FDBA74" />

        {/* Body / Hoodie */}
        <path d="M38 96L24 120H96L82 96H38Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="3" strokeLinejoin="round" />
        <path d="M48 96C48 96 54 103 60 103C66 103 72 96 72 96" stroke="#7C3AED" strokeWidth="3" fill="none" />
        
        {/* Arms based on state */}
        {emotion === "angry" && (
          <>
            <path d="M34 100C26 104 26 112 40 112H80C94 112 94 104 86 100" stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M42 112H78" stroke="#FDBA74" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {emotion === "neutral" && (
          <>
            <path d="M36 98C28 104 28 116 29 120" stroke="#7C3AED" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M84 98C92 104 92 116 91 120" stroke="#7C3AED" strokeWidth="7" strokeLinecap="round" fill="none" />
          </>
        )}
        {emotion === "happy" && (
          <>
            <path d="M36 98C28 104 28 116 29 120" stroke="#7C3AED" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M84 98C92 94 100 84 102 75" stroke="#7C3AED" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            <circle cx="103" cy="70" r="5" fill="#FDBA74" />
            <path d="M106 58L107 55L110 54L107 53L106 50L105 53L102 54L105 55Z" fill="#FBBF24" />
          </>
        )}
        {emotion === "excited" && (
          <>
            <path d="M36 98C28 92 16 80 14 70" stroke="#7C3AED" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            <path d="M84 98C92 92 104 80 106 70" stroke="#7C3AED" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            <circle cx="12" cy="65" r="5.5" fill="#FDBA74" />
            <circle cx="108" cy="65" r="5.5" fill="#FDBA74" />
            <path d="M8 48L10 51L13 48L10 45Z" fill="#FBBF24" />
            <path d="M112 48L110 51L107 48L110 45Z" fill="#FBBF24" />
          </>
        )}
        {emotion === "inlove" && (
          <>
            <path d="M36 98C30 104 38 115 46 111" stroke="#7C3AED" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            <path d="M84 98C90 104 82 115 74 111" stroke="#7C3AED" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            <circle cx="48" cy="110" r="5" fill="#FDBA74" />
            <circle cx="72" cy="110" r="5" fill="#FDBA74" />
            <path d="M102 85C100.5 83.5 98 84.5 98 87C98 89.5 102 92 102 92C102 92 106 89.5 106 87C106 84.5 103.5 83.5 102 85Z" fill="#FF3366" className="animate-bounce" />
          </>
        )}
      </svg>
    );
  };

  const colors = {
    angry: "bg-[#FFF7F6] border-brand-pink/15 shadow-brand-pink/5",
    neutral: "bg-[#FAF6F0] border-brand-lavender/20 shadow-brand-lavender/5",
    happy: "bg-[#FFF2F3] border-brand-pink/30 shadow-brand-pink/10",
    excited: "bg-[#FFFBF2] border-brand-lavender/40 shadow-brand-lavender/15",
    inlove: "bg-[#FFF0F2] border-brand-pink/45 shadow-brand-pink/20",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {bubbleOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={() => {
              setBubbleOpen(false);
              sessionStorage.setItem('mascot_bubble_hidden', 'true');
            }}
            className="glass-card text-brand-charcoal p-4 rounded-2xl rounded-br-none text-xs font-semibold shadow-glass max-w-[240px] mb-2 pointer-events-auto cursor-pointer border-brand-pink/30 leading-relaxed"
          >
            <div className="flex items-start gap-1.5">
              <span className="text-brand-pink">💡</span>
              <p>{bubbleText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        onClick={() => {
          const nextState = !bubbleOpen;
          setBubbleOpen(nextState);
          sessionStorage.setItem('mascot_bubble_hidden', nextState ? 'false' : 'true');
        }}
        className={`w-20 h-20 rounded-2xl ${colors[emotion]} border-2 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto relative overflow-hidden`}
      >
        <div className="w-11/12 h-11/12 mt-1">
          {renderMascot()}
        </div>
      </motion.button>
    </div>
  );
}
