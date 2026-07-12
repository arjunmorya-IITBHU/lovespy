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
  loginWithoutOtp: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (payload: { username?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
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
    let parsedUser: User | null = null;
    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser);
      } catch (e) {
        console.error(e);
      }
    }

    if (parsedUser && savedToken && parsedUser.id !== "usr-guest") {
      setUser(parsedUser);
      setToken(savedToken);
      syncUserLoginToDirectory(parsedUser);
    } else {
      const guestUser: User = {
        id: "usr-guest",
        name: "Guest Gifter",
        phone: "9988776655",
        email: "guest@lovespy.in",
        points: 0,
        role: "customer"
      };
      setUser(guestUser);
      setToken("mock-jwt-token-guest");
      localStorage.setItem("lovespy_user", JSON.stringify(guestUser));
      localStorage.setItem("lovespy_token", "mock-jwt-token-guest");
    }
  }, []);

  const syncUserLoginToDirectory = (userData: any) => {
    if (!userData || userData.id === "usr-guest") return;
    try {
      const { getCustomers, setCustomers } = require("@/lib/db");
      const customers = getCustomers();
      const existingIdx = customers.findIndex((c: any) => c.id === userData.id || (userData.phone && c.phone === userData.phone) || (userData.email && c.email === userData.email));
      
      const nowStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      
      if (existingIdx > -1) {
        customers[existingIdx] = {
          ...customers[existingIdx],
          lastLogin: nowStr,
          email: userData.email || customers[existingIdx].email,
          phone: userData.phone || customers[existingIdx].phone || "",
          status: "Active"
        };
      } else {
        customers.push({
          id: userData.id || `usr-${Date.now()}`,
          name: userData.name || "",
          phone: userData.phone || "",
          email: userData.email || "",
          registeredDate: todayStr,
          lastLogin: nowStr,
          totalOrders: 0,
          totalAmountSpent: 0,
          status: "Active"
        });
      }
      setCustomers(customers);
    } catch (err) {
      console.error("Failed to sync login to directory:", err);
    }
  };

  const openLoginModal = () => {
    // Disabled login
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setOtpSent(false);
  };

  const loginWithGoogle = () => {
    const mockUser: User = {
      id: "650c1f82f1b2c3d4e5f6a7b8",
      name: "", // Google registrations start with blank name/phone
      phone: "",
      email: "arjun.m@gmail.com",
      points: 320,
      role: "customer"
    };
    const mockToken = "mock-jwt-token-google-arjun-mehta";
    setUser(mockUser);
    setToken(mockToken);
    localStorage.setItem("lovespy_user", JSON.stringify(mockUser));
    localStorage.setItem("lovespy_token", mockToken);
    syncUserLoginToDirectory(mockUser);
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
        syncUserLoginToDirectory(data.user);
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

  const loginWithoutOtp = async (name: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const mockUser: User = {
        id: "usr-" + Date.now(),
        name: "", // blank by default
        phone: "", // blank by default
        email: `${name.trim().toLowerCase().replace(/\s+/g, "")}@lovespy.in`,
        points: 0,
        role: "customer"
      };
      const mockToken = "mock-jwt-token-" + phone;
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem("lovespy_user", JSON.stringify(mockUser));
      localStorage.setItem("lovespy_token", mockToken);
      syncUserLoginToDirectory(mockUser);
      closeLoginModal();
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: "Failed to login." };
    }
  };

  const adminLogin = async (payload: { username?: string; password?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("lovespy_user", JSON.stringify(data.user));
        localStorage.setItem("lovespy_token", data.token);
        syncUserLoginToDirectory(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Admin login failed." };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: "Network error. Failed to login." };
    }
  };

  const logout = () => {
    if (user && user.role === "admin") {
      fetch("/api/auth/admin-login", { method: "DELETE" }).catch(err => console.error("Admin logout API error:", err));
    }
    const guestUser = {
      id: "usr-guest",
      name: "Guest Gifter",
      phone: "9988776655",
      email: "guest@lovespy.in",
      points: 0,
      role: "customer"
    };
    setUser(guestUser);
    setToken("mock-jwt-token-guest");
    localStorage.setItem("lovespy_user", JSON.stringify(guestUser));
    localStorage.setItem("lovespy_token", "mock-jwt-token-guest");
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
        loginWithoutOtp,
        adminLogin,
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
