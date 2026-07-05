import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import OtpModel from "@/models/Otp";
import UserModel from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback-secret-key-for-jwt-tokens-development";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone, email, otp, name, registerPhone } = await request.json();

    const identifier = phone ? phone.trim() : email ? email.trim().toLowerCase() : null;

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, error: "Missing required verification details." },
        { status: 400 }
      );
    }

    // Retrieve active OTP record
    const otpRecord = await OtpModel.findOne({ identifier });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "OTP has expired or was not requested. Please try again." },
        { status: 401 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, error: "OTP code has expired. Please request a new one." },
        { status: 401 }
      );
    }

    // Track and enforce attempt limit (max 5 attempts)
    otpRecord.attempts += 1;
    await otpRecord.save();

    if (otpRecord.attempts > 5) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, error: "Maximum attempts exceeded. Please request a new OTP." },
        { status: 401 }
      );
    }

    // Verify OTP code
    if (otpRecord.code !== otp.trim()) {
      const remaining = 5 - otpRecord.attempts;
      return NextResponse.json(
        { 
          success: false, 
          error: `Incorrect verification code. ${remaining} attempt(s) remaining.` 
        },
        { status: 401 }
      );
    }

    // OTP verified successfully, clean up record
    await OtpModel.deleteOne({ _id: otpRecord._id });

    // Look up existing user
    let user = null;
    if (phone) {
      user = await UserModel.findOne({ phone });
    } else if (email) {
      user = await UserModel.findOne({ email });
    }

    // If user does not exist, create user record (Register)
    if (!user) {
      const userPhone = phone || registerPhone?.trim();
      if (!userPhone || !/^\d{10}$/.test(userPhone)) {
        // If they logged in via email but are new, we need a valid phone number
        return NextResponse.json({
          success: false,
          needsRegistrationDetails: true,
          error: "Welcome! To complete your new account registration, we need your name and phone number."
        }, { status: 200 }); // Status 200 to let the client handle input state switch
      }

      // Check if phone number is already registered under another email
      const phoneCheck = await UserModel.findOne({ phone: userPhone });
      if (phoneCheck) {
        return NextResponse.json(
          { success: false, error: "This mobile number is already registered under another account." },
          { status: 400 }
        );
      }

      // Register new user
      user = await UserModel.create({
        name: name?.trim() || "Gifter User",
        phone: userPhone,
        email: email ? email.trim().toLowerCase() : undefined,
        authProvider: email ? "email" : "otp",
        isVerified: true,
        isActive: true,
        rewardPoints: 100, // Welcome gift points
        role: "customer"
      });
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        phone: user.phone,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_ACCESS_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email || "",
        points: user.rewardPoints || 0,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    console.error("OTP verify handler error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
