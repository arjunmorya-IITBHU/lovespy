import { NextResponse } from "next/server";
import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(request: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = await request.json();

    if (!razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json({ success: false, error: "Missing payment or order ID." }, { status: 400 });
    }

    const isMock =
      razorpay_order_id.startsWith("order_mock_") ||
      razorpay_payment_id.startsWith("pay_mock_") ||
      !KEY_ID ||
      !KEY_SECRET ||
      KEY_ID.includes("yourKeyId") ||
      KEY_SECRET.includes("yourRazorpayKeySecret") ||
      KEY_ID.includes("LovespyKeyID") ||
      KEY_ID === "rzp_test_LovespyKeyID" ||
      KEY_ID === "rzp_test_yourKeyId";

    let isVerified = false;

    if (isMock) {
      isVerified = true;
      console.log(`[Razorpay Sandbox] Verified mock payment ID: ${razorpay_payment_id} for order ID: ${razorpay_order_id}`);
    } else {
      if (!razorpay_signature) {
        return NextResponse.json({ success: false, error: "Missing signature." }, { status: 400 });
      }
      const generatedSignature = crypto
        .createHmac("sha256", KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      isVerified = generatedSignature === razorpay_signature;
    }

    if (isVerified) {
      return NextResponse.json({
        success: true,
        message: "Payment successfully verified.",
        verification_details: {
          razorpay_order_id,
          razorpay_payment_id,
          verified_at: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json({ success: false, error: "Signature verification failed." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to verify signature." }, { status: 500 });
  }
}
