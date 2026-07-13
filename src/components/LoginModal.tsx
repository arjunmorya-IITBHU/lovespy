"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Sparkles, Phone, User, ShieldAlert } from "lucide-react";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithoutOtp } = useAuth();

  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nameInput.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (phoneInput.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    const res = await loginWithoutOtp(nameInput, phoneInput);
    setLoading(false);

    if (res.success) {
      setNameInput("");
      setPhoneInput("");
    } else {
      setErrorMsg(res.error || "Failed to identify guest user.");
    }
  };

  const handleClose = () => {
    setNameInput("");
    setPhoneInput("");
    setErrorMsg("");
    closeLoginModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-brand-pink/15 p-6 md:p-8 space-y-6 shadow-2xl relative animate-slide-up">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-brand-charcoal transition-colors border-0 cursor-pointer bg-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 bg-brand-pinkLight rounded-full flex items-center justify-center border border-brand-pink/10">
            <Sparkles className="w-5 h-5 text-brand-pink" />
          </div>
          <h3 className="font-display font-bold text-xl text-brand-charcoal">Identification Details</h3>
          <p className="text-xs text-brand-gray font-medium">Please enter your name and phone number to continue</p>
        </div>

        {/* Error Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Guest Identification Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-brand-charcoal">
          {/* Full Name */}
          <div className="space-y-1.5 flex flex-col">
            <label className="font-bold uppercase text-brand-gray tracking-wider">Full Name *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:bg-white focus:border-brand-pink font-semibold"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5 flex flex-col">
            <label className="font-bold uppercase text-brand-gray tracking-wider">Mobile Phone Number *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-charcoal">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 10-digit number"
                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:bg-white focus:border-brand-pink font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-pink to-brand-lavender text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Accessing Lovespy..." : "Access Dashboard / Proceed"}
          </button>
        </form>
      </div>
    </div>
  );
}
