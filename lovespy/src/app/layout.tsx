import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AvatarWidget from "@/components/AvatarWidget";
import LoginModal from "@/components/LoginModal";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lovespy | Make Every Gift Tell A Story",
  description: "Personalized gifting, custom hampers, and curated gifts for your loved ones. Gen-Z romantic luxury storefront.",
  keywords: "gifts, custom hampers, personalized box, voice qr message, romantic, anniversary, chocolate truffles",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❤️</text></svg>"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} font-sans bg-gradient-to-tr from-[#FCF8F8] via-[#FAF6F2] to-[#FFFBF7] min-h-screen text-brand-charcoal overflow-x-hidden antialiased`}>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            <div className="bg-brand-charcoal text-white py-2 text-center text-xs font-semibold overflow-hidden">
              <span>💖 10% OFF on Orders Above ₹1,999! Code: LOVESPY10 💖</span>
            </div>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh]">
              {children}
            </main>
            <AvatarWidget />
            <LoginModal />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
