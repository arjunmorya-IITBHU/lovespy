"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Phone, Mail, ShieldAlert, Sparkles, Check } from "lucide-react";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, sendOTP, verifyOTP } = useAuth();

  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  
  // OTP input state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  // Registration dynamic state (for new users)
  const [needsReg, setNeedsReg] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState(""); // If verified email but new, collect phone
  
  // Status and error handling
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  


  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [timer]);

  if (!isLoginModalOpen) return null;

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const payload = activeTab === "phone" 
      ? { phone: phoneInput.replace(/\D/g, "") } 
      : { email: emailInput.trim().toLowerCase() };

    const res = await sendOTP(payload);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setTimer(60); // 60s resend lock
      setSuccessMsg("OTP sent successfully. Please check your mobile phone or email address.");
    } else {
      setErrorMsg(res.error || "Failed to trigger OTP. Please check your inputs.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const identifierPayload = activeTab === "phone"
      ? { phone: phoneInput.replace(/\D/g, "") }
      : { email: emailInput.trim().toLowerCase() };

    const res = await verifyOTP({
      ...identifierPayload,
      otp: otpCode.trim(),
      name: registerName.trim(),
      registerPhone: registerPhone.replace(/\D/g, "")
    });

    setLoading(false);

    if (res.success) {
      // Auth success, context automatically closed modal and updated state
      resetModalState();
    } else if (res.needsRegistrationDetails) {
      setNeedsReg(true);
      setSuccessMsg("Welcome! Fill in registration details below to complete signup.");
    } else {
      setErrorMsg(res.error || "Verification failed. Check your OTP.");
    }
  };

  const resetModalState = () => {
    setPhoneInput("");
    setEmailInput("");
    setOtpSent(false);
    setOtpCode("");
    setTimer(0);
    setNeedsReg(false);
    setRegisterName("");
    setRegisterPhone("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleClose = () => {
    resetModalState();
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
          <h3 className="font-display font-bold text-xl text-brand-charcoal">Secure Lovespy Auth</h3>
          <p className="text-xs text-brand-gray">Authenticate via OTP to proceed with your premium order</p>
        </div>

        {/* Tab Selection (only visible if OTP is not yet sent) */}
        {!otpSent && (
          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
            <button
              onClick={() => { setActiveTab("phone"); setErrorMsg(""); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "phone" ? "bg-white text-brand-pink border shadow-sm" : "text-brand-gray hover:text-brand-charcoal"
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Mobile OTP
            </button>
            <button
              onClick={() => { setActiveTab("email"); setErrorMsg(""); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "email" ? "bg-white text-brand-pink border shadow-sm" : "text-brand-gray hover:text-brand-charcoal"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email OTP
            </button>
          </div>
        )}

        {/* Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs">
            <p>{successMsg}</p>
          </div>
        )}



        {/* Step 1: Request OTP Form */}
        {!otpSent && (
          <form onSubmit={handleSendOTP} className="space-y-4 text-xs text-brand-charcoal">
            {activeTab === "phone" ? (
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
            ) : (
              <div className="space-y-1.5 flex flex-col">
                <label className="font-bold uppercase text-brand-gray tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. buyer@lovespy.in"
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:outline-none focus:bg-white focus:border-brand-pink font-semibold"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-pink to-brand-lavender text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Requesting OTP..." : "Get OTP Verification Code"}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code Input Form */}
        {otpSent && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs text-brand-charcoal">
            <div className="bg-slate-50 p-3 rounded-2xl border text-[10px] text-brand-gray space-y-0.5">
              <p>Requested code for: <strong class="text-brand-charcoal">{activeTab === "phone" ? `+91 ${phoneInput}` : emailInput}</strong></p>
              <p className="flex items-center gap-1 font-bold text-red-500"><ShieldAlert className="w-3.5 h-3.5" /> 5 Maximum verification retries allowed</p>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="font-bold uppercase text-brand-gray tracking-wider">Enter 6-Digit OTP Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full tracking-widest text-center text-sm py-3 rounded-xl border bg-slate-50 focus:outline-none focus:bg-white focus:border-brand-pink font-bold"
              />
            </div>

            {/* Registration fields if User is not yet registered */}
            {needsReg && (
              <div className="space-y-3 p-4 border border-brand-pink/15 rounded-2xl bg-brand-pinkLight/10 animate-fade-in">
                <p className="font-extrabold text-[10px] uppercase text-brand-pink tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Welcome to Lovespy! Complete Signup
                </p>
                
                <div className="space-y-1 flex flex-col">
                  <label className="font-bold uppercase text-brand-gray tracking-wider text-[9px]">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-brand-pink"
                  />
                </div>

                {activeTab === "email" && (
                  <div className="space-y-1 flex flex-col">
                    <label className="font-bold uppercase text-brand-gray tracking-wider text-[9px]">Mobile Phone Number *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="10 Digits"
                        className="w-full pl-10 pr-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetModalState}
                className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all bg-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="flex-1 py-3 bg-brand-pink text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all border-0 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>

            {/* Resend Action */}
            <div className="text-center pt-2">
              {timer > 0 ? (
                <span className="text-[10px] text-brand-gray font-semibold">Resend OTP in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-[10px] text-brand-pink hover:underline font-bold bg-transparent border-0 cursor-pointer"
                >
                  Resend verification code
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
