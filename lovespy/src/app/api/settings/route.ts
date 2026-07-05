import { NextResponse } from "next/server";
import { getStoreSettings, setStoreSettings } from "@/lib/db";
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

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Try to authenticate. If failed, return 401
  const userPayload = authenticate(request);
  if (!userPayload) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const newSettings = await request.json();
    await setStoreSettings(newSettings);
    return NextResponse.json({ success: true, message: "Settings updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
