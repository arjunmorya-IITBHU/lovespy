"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Music, Image as ImageIcon, Heart, Gift, Play, Pause, ChevronRight, Check, User as UserIcon, Paperclip, Paintbrush, MailOpen, X, Mic, Eye, PlayCircle, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { getShowcaseMedia, ShowcaseMedia } from "@/lib/db";

export default function CustomSurprisePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [senderName, setSenderName] = useState("");
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulateData, setSimulateData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  const [receiverName, setReceiverName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");

  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300",
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=300"
  ]);
  const [videos, setVideos] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState("");
  const [voiceRecording, setVoiceRecording] = useState("");

  const [theme, setTheme] = useState("shinchan");
  const [customThemeIdea, setCustomThemeIdea] = useState("");
  const [songName, setSongName] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [instructions, setInstructions] = useState("");

  const [mainMessage, setMainMessage] = useState("");
  const [loveLetter, setLoveLetter] = useState("");
  const [birthdayWish, setBirthdayWish] = useState("");
  const [anniversaryWish, setAnniversaryWish] = useState("");

  // Showcase Lightbox State
  const [selectedShowcaseMedia, setSelectedShowcaseMedia] = useState<ShowcaseMedia | null>(null);
  const showcaseMediaList = getShowcaseMedia();

  // Recorder simulator state
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPhotos((prev) => [...prev, evt.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const names: string[] = [];
    for (let i = 0; i < files.length; i++) {
      names.push(files[i].name);
    }
    setVideos((prev) => [...prev, ...names]);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file.name);
      setVoiceRecording("");
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const saveRecording = () => {
    setVoiceRecording(`Recorded_Voice_Note_${recordingSeconds}s.wav`);
    setAudioFile("");
    setShowRecorder(false);
  };

  const closeRecorder = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setShowRecorder(false);
  };

  const handleAddToCart = () => {
    if (!senderName || !receiverName || !mobileNumber || !whatsappNumber || !email) {
      alert("Please fill in all required fields marked with * (Sender/Receiver details, contact numbers & email).");
      return;
    }

    const surpriseDetails = {
      senderName,
      receiverName,
      mobileNumber,
      whatsappNumber,
      email,
      photos,
      videos,
      audioFile,
      voiceRecording,
      theme,
      customThemeIdea,
      songName,
      songUrl,
      instructions,
      messages: {
        main: mainMessage,
        loveLetter,
        birthdayWish,
        anniversaryWish
      }
    };

    addToCart({
      id: `sp-${Date.now()}`,
      name: `Custom Surprise Page (${receiverName})`,
      price: 299,
      qty: 1,
      type: "custom-surprise-page",
      image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500",
      details: surpriseDetails
    });

    alert("Custom Surprise Page form details added to Gifting Bag!");
    router.push("/cart");
  };

  // Preview Theme style configurations
  const themeStyles: Record<string, string> = {
    shinchan: "from-amber-100 via-yellow-200 to-rose-200 text-amber-900 border-yellow-300",
    doraemon: "from-blue-100 via-sky-200 to-indigo-100 text-sky-900 border-sky-300",
    oggy: "from-teal-100 via-cyan-200 to-slate-200 text-teal-900 border-teal-300",
    pokemon: "from-yellow-100 via-red-200 to-amber-200 text-slate-800 border-amber-300",
    custom: "from-pink-100 via-purple-100 to-indigo-100 text-slate-800 border-purple-200",
    "no-theme": "from-slate-50 via-slate-100 to-zinc-200 text-slate-800 border-zinc-200"
  };

  const style = themeStyles[theme] || themeStyles.shinchan;
  const themeEmoji = theme === 'shinchan' ? '🐶' : theme === 'doraemon' ? '🔔' : theme === 'oggy' ? '🪳' : theme === 'pokemon' ? '⚡' : '👑';

  return (
    <div className="space-y-8 animate-slide-up max-w-6xl mx-auto">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="font-display font-bold text-3xl bg-gradient-to-r from-brand-pink to-brand-lavender bg-clip-text text-transparent">
          Personalized Surprise Website
        </h1>
        <p className="text-xs text-brand-gray">
          Order a custom-designed surprise page packed with memories, animation themes, and music.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side: Customize Form */}
        <div className="lg:col-span-3 glass-card p-8 rounded-3xl border border-brand-pink/15 space-y-6 bg-white/70">
          
          {/* SECTION 1: Contact Details */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-sm text-brand-charcoal border-b border-brand-pink/5 pb-1 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-brand-pink" /> 1. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Sender Name *</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your name"
                  className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Receiver Name *</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Their name"
                  className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Mobile Number *</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Contact number"
                  className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">WhatsApp Number *</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="For sending final page link"
                  className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Media Uploads */}
          <div className="space-y-4 pt-2">
            <h3 className="font-display font-semibold text-sm text-brand-charcoal border-b border-brand-pink/5 pb-1 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-brand-pink" /> 2. Media Uploads
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo album */}
              <div className="space-y-2 border border-brand-pink/5 p-4 rounded-2xl bg-white/40">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Photo Memories</label>
                  <span className="text-[8px] text-brand-pink font-bold">{photos.length} Selected</span>
                </div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-pink/15 rounded-xl p-3 bg-white cursor-pointer hover:border-brand-pink transition-all">
                  <ImageIcon className="w-5 h-5 text-brand-pink mb-1" />
                  <span className="text-[9px] text-brand-charcoal font-bold">Select Images</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {photos.map((p, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden relative border border-brand-pink/10 group">
                      <img src={p} className="w-full h-full object-cover" alt="Uploaded" />
                      <button
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos */}
              <div className="space-y-2 border border-brand-pink/5 p-4 rounded-2xl bg-white/40">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Video Clips</label>
                  <span className="text-[8px] text-brand-pink font-bold">{videos.length} Selected</span>
                </div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-pink/15 rounded-xl p-3 bg-white cursor-pointer hover:border-brand-pink transition-all">
                  <Play className="w-5 h-5 text-brand-pink mb-1" />
                  <span className="text-[9px] text-brand-charcoal font-bold">Select Videos</span>
                  <input type="file" multiple accept="video/*" className="hidden" onChange={handleVideoUpload} />
                </label>
                <div className="space-y-1.5 pt-2 max-h-32 overflow-y-auto">
                  {videos.length === 0 ? (
                    <p className="text-[8px] text-brand-gray italic">No videos chosen yet</p>
                  ) : (
                    videos.map((v, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 border border-brand-pink/5 rounded-xl text-[9px]">
                        <span className="truncate font-semibold text-slate-700 flex items-center gap-1"><Play className="w-3 h-3 text-brand-pink" /> {v}</span>
                        <button onClick={() => setVideos(videos.filter((_, i) => i !== idx))} className="text-red-500 font-extrabold hover:underline">Remove</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Audio Section */}
            <div className="border border-brand-pink/5 p-4 rounded-2xl bg-white/40 space-y-3">
              <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Voice Message / Background Audio</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 border border-brand-pink/15 rounded-xl py-3 px-4 bg-white cursor-pointer hover:bg-slate-50 transition-all text-xs font-semibold text-brand-charcoal">
                  <Music className="w-4 h-4 text-brand-pink" /> Upload Audio File (MP3, WAV, M4A)
                  <input type="file" accept=".mp3,.wav,.m4a,audio/*" className="hidden" onChange={handleAudioUpload} />
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecorder(true)}
                  className="flex-1 flex items-center justify-center gap-2 border border-brand-lavender/30 rounded-xl py-3 px-4 bg-white hover:bg-slate-50 transition-all text-xs font-semibold text-brand-charcoal"
                >
                  <Mic className="w-4 h-4 text-brand-lavender animate-pulse" /> Record Custom Voice Note
                </button>
              </div>
              <div className="text-[10px] text-brand-gray font-semibold">
                {voiceRecording && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Custom Voice Note attached: {voiceRecording}</span>
                )}
                {audioFile && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Custom Audio File attached: {audioFile}</span>
                )}
                {!voiceRecording && !audioFile && (
                  <span className="text-brand-gray italic">No custom audio attachments added yet.</span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Themes & Music Preferences */}
          <div className="space-y-4 pt-2">
            <h3 className="font-display font-semibold text-sm text-brand-charcoal border-b border-brand-pink/5 pb-1 flex items-center gap-1.5">
              <Paintbrush className="w-4 h-4 text-brand-pink" /> 3. Theme & Music Preferences
            </h3>
            
            <div className="space-y-2">
              <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Choose Theme style</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "shinchan", label: "Shinchan Theme", desc: "Playful cartoon backdrop" },
                  { id: "doraemon", label: "Doraemon Theme", desc: "Futuristic gadget theme" },
                  { id: "oggy", label: "Oggy & Cockroaches", desc: "Retro cartoon fun" },
                  { id: "pokemon", label: "Pokémon Theme", desc: "Anime lightning style" },
                  { id: "custom", label: "Custom Theme Idea", desc: "Tell us your vision" },
                  { id: "no-theme", label: "No Theme", desc: "Minimalist luxury style" }
                ].map((t) => (
                  <label key={t.id} className={`border ${theme === t.id ? 'border-brand-pink bg-brand-pinkLight/10' : 'border-brand-pink/10 bg-white'} rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:shadow-sm transition-all select-none`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-charcoal">{t.label}</span>
                      <input type="radio" name="theme-radio" checked={theme === t.id} onChange={() => setTheme(t.id)} className="text-brand-pink focus:ring-brand-pink" />
                    </div>
                    <span className="text-[8px] text-brand-gray mt-1">{t.desc}</span>
                  </label>
                ))}
              </div>

              {theme === 'custom' && (
                <div className="space-y-1.5 pt-2">
                  <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Describe your Custom Theme idea *</label>
                  <textarea
                    rows={2}
                    value={customThemeIdea}
                    onChange={(e) => setCustomThemeIdea(e.target.value)}
                    placeholder="E.g. Harry Potter style with moving photoframes and Gryffindor colors..."
                    className="w-full text-xs p-3 rounded-xl border border-brand-pink/15 focus:outline-none focus:border-brand-pink bg-white"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Music Preference</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[8px] text-brand-gray font-bold">Song Name</label>
                  <input
                    type="text"
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                    placeholder="E.g. Perfect by Ed Sheeran"
                    className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[8px] text-brand-gray font-bold">Paste Song URL (YouTube, Spotify, etc.)</label>
                  <input
                    type="url"
                    value={songUrl}
                    onChange={(e) => setSongUrl(e.target.value)}
                    placeholder="E.g. https://spotify.link/..."
                    className="w-full text-xs py-3 px-4 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Design Instructions */}
          <div className="space-y-3 pt-2">
            <h3 className="font-display font-semibold text-sm text-brand-charcoal border-b border-brand-pink/5 pb-1 flex items-center gap-1.5">
              <Paintbrush className="w-4 h-4 text-brand-pink" /> 4. Website Design Instructions
            </h3>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Explain how you want the surprise page to look</label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Tell us your vision. Describe colors, style, memories, sections, animations, messages, photos arrangement, and any special requests."
                className="w-full text-xs p-4 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 5: Special Messages */}
          <div className="space-y-4 pt-2">
            <h3 className="font-display font-semibold text-sm text-brand-charcoal border-b border-brand-pink/5 pb-1 flex items-center gap-1.5">
              <MailOpen className="w-4 h-4 text-brand-pink" /> 5. Custom Page Messages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Main Banner Message</label>
                <textarea
                  rows={2}
                  value={mainMessage}
                  onChange={(e) => setMainMessage(e.target.value)}
                  placeholder="Short catchy banner text. E.g. Happy 22nd Birthday Priya!"
                  className="w-full text-xs p-3 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Love Letter Section</label>
                <textarea
                  rows={2}
                  value={loveLetter}
                  onChange={(e) => setLoveLetter(e.target.value)}
                  placeholder="Longer heartfelt thoughts or shared memories..."
                  className="w-full text-xs p-3 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Birthday Wish Box</label>
                <textarea
                  rows={2}
                  value={birthdayWish}
                  onChange={(e) => setBirthdayWish(e.target.value)}
                  placeholder="Specific birthday greetings (if applicable)..."
                  className="w-full text-xs p-3 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Anniversary Wish Box</label>
                <textarea
                  rows={2}
                  value={anniversaryWish}
                  onChange={(e) => setAnniversaryWish(e.target.value)}
                  placeholder="Specific anniversary greetings (if applicable)..."
                  className="w-full text-xs p-3 rounded-xl border border-brand-pink/15 bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Billing Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-brand-pink/15 space-y-6 bg-white shadow-md sticky top-24">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-brand-pinkLight text-brand-pink text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Surprise Gifting Package</span>
                <h3 className="font-display font-bold text-lg text-brand-charcoal mt-1">Personalized Surprise Website</h3>
              </div>
              <span className="font-display font-extrabold text-2xl text-brand-pink">₹299</span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 border-t border-b border-brand-pink/5 py-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Premium page tailored to your selected theme</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Multiple Photos & Video galleries embedded</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Custom background music request played</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Voice Message QR attachment support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="font-bold text-slate-800">Delivered personally via WhatsApp by Admin</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-gradient-to-r from-brand-pink to-brand-lavender text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" /> Add to Cart (₹299)
              </button>
            </div>

            {/* Examples of Surprise Pages Showcase Gallery */}
            <div className="border-t border-brand-pink/5 pt-4 space-y-4">
              <h4 className="font-display font-bold text-sm text-brand-charcoal flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-pink" /> Examples of Surprise Pages
              </h4>

              {/* Image Gallery */}
              <div className="space-y-2">
                <p className="text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Sample Screenshots</p>
                <div className="grid grid-cols-3 gap-2">
                  {showcaseMediaList.filter((m: ShowcaseMedia) => m.type === 'image').map((img: ShowcaseMedia) => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedShowcaseMedia(img)}
                      className="aspect-video rounded-lg overflow-hidden border border-brand-pink/10 shadow-sm relative group cursor-pointer"
                    >
                      <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={img.title} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-bold p-1 text-center">
                        {img.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Gallery */}
              <div className="space-y-2">
                <p className="text-[9px] font-extrabold uppercase text-brand-gray tracking-wider">Sample Video Previews</p>
                <div className="grid grid-cols-2 gap-2">
                  {showcaseMediaList.filter((m: ShowcaseMedia) => m.type === 'video').map((vid: ShowcaseMedia) => (
                    <div
                      key={vid.id}
                      onClick={() => setSelectedShowcaseMedia(vid)}
                      className="rounded-lg overflow-hidden border border-brand-pink/10 shadow-sm bg-slate-50 relative group cursor-pointer"
                    >
                      <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                        <video src={vid.url} className="w-full h-full object-cover" muted loop playsInline></video>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/50 transition-colors">
                          <PlayCircle className="w-8 h-8 text-white opacity-85 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="p-1.5 text-center bg-white border-t border-slate-100">
                        <p className="text-[8px] font-bold text-slate-700 truncate">{vid.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FULL SCREEN LIGHTBOX PREVIEW OVERLAY */}
      <AnimatePresence>
        {selectedShowcaseMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center p-4 sm:p-8"
          >
            <div className="max-w-2xl w-full bg-[#121212] text-white rounded-3xl border border-brand-pink/20 p-6 space-y-4 shadow-2xl relative self-center flex flex-col">
              <button
                onClick={() => setSelectedShowcaseMedia(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-display font-bold text-sm border-b border-brand-pink/10 pb-2 text-brand-gold">
                {selectedShowcaseMedia.title}
              </h4>
              <div className="flex justify-center bg-black/60 rounded-2xl overflow-hidden aspect-video relative">
                {selectedShowcaseMedia.type === 'video' ? (
                  <video src={selectedShowcaseMedia.url} className="w-full h-full object-contain" controls autoPlay loop></video>
                ) : (
                  <img src={selectedShowcaseMedia.url} className="w-full h-full object-contain" alt={selectedShowcaseMedia.title} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOCK VOICE RECORDER MODAL OVERLAY */}
      <AnimatePresence>
        {showRecorder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xs w-full bg-white rounded-3xl border border-brand-pink/15 p-6 space-y-6 text-center shadow-2xl relative">
              <button onClick={closeRecorder} className="absolute top-4 right-4 p-1 hover:bg-slate-50 rounded-full text-brand-gray">
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-display font-bold text-sm text-brand-charcoal">Voice Message Recorder</h4>
              
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border ${isRecording ? 'bg-red-100 text-red-500 animate-pulse border-red-200' : 'bg-brand-pinkLight text-brand-pink border-brand-pink/20'}`}>
                  <Mic className="w-6 h-6" />
                </div>
                <div className="text-sm font-mono font-bold text-slate-800">
                  {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}
                </div>
                {isRecording && (
                  <div className="flex gap-1 h-6 items-center">
                    <span className="w-1 h-3 bg-brand-pink animate-pulse rounded-full"></span>
                    <span className="w-1 h-5 bg-brand-pink animate-pulse rounded-full" style={{ animationDelay: "0.1s" }}></span>
                    <span className="w-1 h-4 bg-brand-pink animate-pulse rounded-full" style={{ animationDelay: "0.2s" }}></span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={startRecording} disabled={isRecording} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-brand-charcoal font-bold text-xs rounded-xl transition-all disabled:opacity-50">Record</button>
                <button onClick={stopRecording} disabled={!isRecording} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50">Stop</button>
              </div>
              <button onClick={saveRecording} disabled={isRecording || recordingSeconds === 0} className="w-full py-3 bg-brand-charcoal text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50">Attach Voice Note</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {showSimulateModal && simulateData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl border border-brand-pink/15 p-6 space-y-6 shadow-2xl relative animate-slide-up">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center border border-brand-pink/15">
                <ShieldCheck className="w-6 h-6 text-brand-pink animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-charcoal">Lovespy Secured Checkout</h3>
              <p className="text-[10px] uppercase font-extrabold text-brand-gray tracking-wider bg-slate-100 px-3 py-1 rounded-full inline-block">Sandbox Simulator Mode</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs border border-brand-pink/5">
              <div className="flex justify-between">
                <span className="text-brand-gray">Merchant Account:</span>
                <span className="font-bold text-brand-charcoal">Lovespy Gifting</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray">Mock Order ID:</span>
                <span className="font-mono font-bold text-slate-700">{simulateData.orderId}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-3">
                <span className="text-slate-800 font-semibold">Payable Total:</span>
                <span className="font-display font-extrabold text-brand-pink text-base">₹{simulateData.amount}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={async () => {
                  setShowSimulateModal(false);
                  await simulateData.handler({
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_order_id: simulateData.orderId,
                    razorpay_signature: "mock_signature",
                  });
                }}
                className="w-full py-3.5 bg-gradient-to-r from-brand-pink to-brand-lavender text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-brand-pink/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                Simulate Successful Payment
              </button>
              <button
                onClick={() => {
                  setShowSimulateModal(false);
                  alert("Payment simulated failure. You can retry checkout.");
                }}
                className="w-full py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
              >
                Simulate Payment Failure
              </button>
              <button
                onClick={() => {
                  setShowSimulateModal(false);
                }}
                className="w-full py-3 text-slate-500 hover:text-slate-700 text-xs font-bold transition-all cursor-pointer bg-transparent border-0"
              >
                Cancel & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
