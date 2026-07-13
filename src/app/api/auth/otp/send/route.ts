import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbServer";
import OtpModel from "@/models/Otp";
import SettingsModel from "@/models/Settings";
import UserModel from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { phone, email } = await request.json();

    const identifier = phone ? phone.trim() : email ? email.trim().toLowerCase() : null;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Please provide a mobile number or email address." },
        { status: 400 }
      );
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Check if user exists (to auto-detect new vs returning users)
    let userExists = false;
    if (phone) {
      const user = await UserModel.findOne({ phone });
      userExists = !!user;
    } else if (email) {
      const user = await UserModel.findOne({ email });
      userExists = !!user;
    }

    // Generate a secure 6-digit numeric OTP
    const code = crypto.randomInt(100000, 999999).toString();

    // Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save/Update the OTP code in database (one active OTP per identifier at a time)
    await OtpModel.findOneAndDelete({ identifier });
    await OtpModel.create({
      identifier,
      code,
      attempts: 0,
      expiresAt
    });

    // Fetch store settings for Twilio/SMTP credentials
    const settings = await SettingsModel.findOne();
    const twilioSid = settings?.twilioAccountSid;
    const twilioToken = settings?.twilioAuthToken;
    const twilioFrom = settings?.twilioFromNumber;

    const isDev = process.env.NODE_ENV === "development" || !process.env.MONGODB_URI;

    if (phone) {
      // Send SMS via Twilio
      if (twilioSid && twilioToken && twilioFrom && 
          !twilioSid.includes("placeholder") && 
          !twilioToken.includes("placeholder")) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
          const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
          
          const response = await fetch(twilioUrl, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${basicAuth}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
              From: twilioFrom,
              To: `+91${phone}`, // Assumes Indian mobile numbers prefix, modify if needed
              Body: `Your Lovespy verification code is: ${code}. Valid for 5 minutes.`
            })
          });

          const twilioData = await response.json();
          if (!response.ok) {
            console.error("Twilio Gateway Error Details:", twilioData);
            throw new Error(twilioData.message || "Twilio request failed");
          }

          console.log(`[Twilio] Sent SMS to ${phone} successfully. SID: ${twilioData.sid}`);
          return NextResponse.json({
            success: true,
            exists: userExists,
            message: "OTP sent successfully to your mobile number."
          });
        } catch (twilioErr: any) {
          console.error("Failed to send Twilio SMS:", twilioErr);
          return NextResponse.json(
            { success: false, error: `SMS gateway failed: ${twilioErr.message}` },
            { status: 502 }
          );
        }
      } else {
        // Fallback for development/testing
        console.log(`[SMS OTP Simulator] Identifier: ${phone} | Code: ${code}`);
        return NextResponse.json({
          success: true,
          exists: userExists,
          message: "OTP generated successfully. (Check backend developer console for code)."
        });
      }
    } else {
      // Send Email via SMTP
      const smtpHost = settings?.smtpHost;
      const smtpPort = settings?.smtpPort;
      const smtpUser = settings?.smtpUser;
      const smtpPass = settings?.smtpPass;
      const smtpFrom = settings?.smtpFrom || "no-reply@lovespy.in";

      if (smtpHost && smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort || 587,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          await transporter.sendMail({
            from: `"Lovespy Gifting" <${smtpFrom}>`,
            to: email,
            subject: "Your Lovespy Verification Code",
            text: `Your Lovespy verification code is: ${code}. Valid for 5 minutes.`,
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                     <h2 style="color: #FF4E88; margin-top: 0;">Lovespy Security</h2>
                     <p>Your one-time verification code is:</p>
                     <div style="background: #FDF2F8; border: 1px dashed #FF4E88; font-size: 24px; font-weight: bold; text-align: center; padding: 12px; margin: 15px 0; color: #FF4E88; letter-spacing: 2px;">
                       ${code}
                     </div>
                     <p style="font-size: 11px; color: #666;">This code expires in 5 minutes. Do not share this OTP with anyone.</p>
                   </div>`
          });

          console.log(`[SMTP] Sent Email OTP to ${email}`);
          return NextResponse.json({
            success: true,
            exists: userExists,
            message: "OTP sent successfully to your email address."
          });
        } catch (smtpErr: any) {
          console.error("Nodemailer SMTP Error:", smtpErr);
          // Fallback if nodemailer not installed or SMTP connection failed
          console.log(`[Email OTP Simulator] Identifier: ${email} | Code: ${code}`);
          return NextResponse.json({
            success: true,
            exists: userExists,
            message: "OTP generated successfully. (Check backend developer console for code)."
          });
        }
      } else {
        // Fallback for development/testing
        console.log(`[Email OTP Simulator] Identifier: ${email} | Code: ${code}`);
        return NextResponse.json({
          success: true,
          exists: userExists,
          message: "OTP generated successfully. (Check backend developer console for code)."
        });
      }
    }
  } catch (error: any) {
    console.error("OTP send handler error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
