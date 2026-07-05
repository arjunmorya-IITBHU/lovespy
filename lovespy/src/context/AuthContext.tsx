"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id?: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  otpSent: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: () => void;
  sendOTP: (payload: { phone?: string; email?: string }) => Promise<{ success: boolean; exists?: boolean; error?: string }>;
  verifyOTP: (payload: { phone?: string; email?: string; otp: string; name?: string; registerPhone?: string }) => Promise<{ success: boolean; needsRegistrationDetails?: boolean; error?: string }>;
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("lovespy_user");
    const savedToken = localStorage.getItem("lovespy_token");
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setOtpSent(false);
  };

  const loginWithGoogle = () => {
    const mockUser: User = {
      id: "650c1f82f1b2c3d4e5f6a7b8",
      name: "Arjun Mehta",
      phone: "9988776655",
      email: "arjun.m@gmail.com",
      points: 320,
      role: "customer"
    };
    const mockToken = "mock-jwt-token-google-arjun-mehta";
    setUser(mockUser);
    setToken(mockToken);
    localStorage.setItem("lovespy_user", JSON.stringify(mockUser));
    localStorage.setItem("lovespy_token", mockToken);
  };

  const sendOTP = async (payload: { phone?: string; email?: string }): Promise<{ success: boolean; exists?: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        return { success: true, exists: data.exists };
      }
      return { success: false, error: data.error || "Failed to send OTP." };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: "Network error. Failed to contact server." };
    }
  };

  const verifyOTP = async (payload: { phone?: string; email?: string; otp: string; name?: string; registerPhone?: string }): Promise<{ success: boolean; needsRegistrationDetails?: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("lovespy_user", JSON.stringify(data.user));
        localStorage.setItem("lovespy_token", data.token);
        closeLoginModal();
        return { success: true };
      } else if (data.needsRegistrationDetails) {
        return { success: false, needsRegistrationDetails: true };
      }
      return { success: false, error: data.error || "Verification failed." };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: "Network error. Failed to contact server." };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOtpSent(false);
    localStorage.removeItem("lovespy_user");
    localStorage.removeItem("lovespy_token");
  };

  // Helper function to make authenticated fetches
  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    const activeToken = token || localStorage.getItem("lovespy_token");
    if (activeToken) {
      headers.set("Authorization", `Bearer ${activeToken}`);
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        otpSent,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithGoogle,
        sendOTP,
        verifyOTP,
        logout,
        fetchWithAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
