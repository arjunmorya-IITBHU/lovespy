import { NextResponse } from "next/server";
import { getShiprocketToken, isShiprocketSimulated } from "@/lib/shiprocket";

export async function POST(request: Request) {
  try {
    const simulated = await isShiprocketSimulated();
    if (simulated) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Simulated integration mode active. Connection verified!"
      });
    }

    // Try to authenticating live
    const token = await getShiprocketToken();
    if (token) {
      return NextResponse.json({
        success: true,
        simulated: false,
        message: "Live Shiprocket credentials verified successfully!"
      });
    }
    throw new Error("Invalid response from Shiprocket API.");
  } catch (error: any) {
    console.error("Credentials test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to authenticate with Shiprocket. Check your email and password."
    }, { status: 400 });
  }
}
