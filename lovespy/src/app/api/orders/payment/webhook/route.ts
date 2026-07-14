import { NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "yourWebhookSecretKey";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Signature verification if configured
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== "yourWebhookSecretKey" && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[Webhook Error] Signature mismatch.");
        return NextResponse.json({ success: false, error: "Invalid signature." }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log("[Razorpay Webhook Event Received]:", payload.event);

    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const payment = payload.payload.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      const amount = payment?.amount; // in paise

      console.log(`[Webhook Success] Payment of ₹${amount / 100} captured for order ${orderId} (Payment ID: ${paymentId})`);
      
      // In production database, we would update the payment status here
      // e.g. await dbConnect(); await Order.findOneAndUpdate({ razorpay_order_id: orderId }, { paymentStatus: 'paid' })
    }

    return NextResponse.json({ success: true, message: "Webhook processed." });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process webhook." }, { status: 500 });
  }
}
