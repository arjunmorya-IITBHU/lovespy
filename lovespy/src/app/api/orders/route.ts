import { NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback-secret-key-for-jwt-tokens-development";

// Helper to authenticate request
function authenticate(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (e) {
    return null;
  }
}

export async function GET(request: Request) {
  const userPayload = authenticate(request);
  if (!userPayload) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  // Fetch orders from database
  const orders = getOrders();
  return NextResponse.json({ success: true, orders });
}

export async function POST(request: Request) {
  const userPayload = authenticate(request);
  if (!userPayload) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const orderData = await request.json();
    
    // In production, integrate Razorpay/PayPal verification here
    // const crypto = require('crypto');
    // const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    // shasum.update(orderData.razorpay_order_id + "|" + orderData.razorpay_payment_id);
    // const digest = shasum.digest('hex');
    // if (digest !== orderData.razorpay_signature) return Error...

    const newOrder = createOrder(orderData);
    
    return NextResponse.json({
      success: true,
      message: "Order logged successfully.",
      order: newOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Could not process purchase." },
      { status: 500 }
    );
  }
}
