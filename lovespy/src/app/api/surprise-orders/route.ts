import { NextResponse } from "next/server";
import { getSurpriseOrders, createSurpriseOrder } from "@/lib/dbServer";
import { authenticateAdmin } from "@/lib/authServer";
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
  // Validate request is from authorized administrator
  const adminPayload = await authenticateAdmin(request);
  if (!adminPayload) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  // Fetch surprise orders from database
  const orders = getSurpriseOrders();
  return NextResponse.json({ success: true, orders });
}

export async function POST(request: Request) {
  const userPayload = authenticate(request);
  if (!userPayload) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const orderData = await request.json();
    const newOrder = createSurpriseOrder(orderData);
    
    return NextResponse.json({
      success: true,
      message: "Custom surprise order logged successfully.",
      order: newOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Could not process surprise page purchase." },
      { status: 500 }
    );
  }
}

