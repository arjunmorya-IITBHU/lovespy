import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback-secret-key-for-jwt-tokens-development";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, name, phone } = body;

    // Check profile-based admin credentials
    if (name === "Arjun Morya" && phone === "9950669088") {
      const token = jwt.sign(
        {
          id: "usr-admin-arjun",
          name: "Arjun Morya",
          email: "arjun@lovespy.in",
          phone: "9950669088",
          role: "admin"
        },
        JWT_ACCESS_SECRET,
        { expiresIn: "7d" }
      );

      const cookieStore = await cookies();
      cookieStore.set("lovespy_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/"
      });

      return NextResponse.json({
        success: true,
        message: "Admin login successful.",
        user: {
          id: "usr-admin-arjun",
          name: "Arjun Morya",
          email: "arjun@lovespy.in",
          phone: "9950669088",
          points: 9999,
          role: "admin"
        },
        token
      });
    }

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Missing login credentials." },
        { status: 400 }
      );
    }

    // Verify master operator credentials
    if (username.toUpperCase() === "LOVESPYAKM" && password === "@aA718718718") {
      // Sign JWT token as admin
      const token = jwt.sign(
        {
          id: "usr-admin-master",
          name: "Operator Master",
          email: "admin@lovespy.in",
          phone: "9988776655",
          role: "admin"
        },
        JWT_ACCESS_SECRET,
        { expiresIn: "7d" }
      );

      // Set secure HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set("lovespy_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/"
      });

      return NextResponse.json({
        success: true,
        message: "Admin login successful.",
        user: {
          id: "usr-admin-master",
          name: "Operator Master",
          email: "admin@lovespy.in",
          phone: "9988776655",
          points: 9999,
          role: "admin"
        },
        token
      });
    }

    return NextResponse.json(
      { success: false, error: "Incorrect master operator credentials. Access denied." },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Admin login handler error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout/clear admin cookie
  const cookieStore = await cookies();
  cookieStore.delete("lovespy_admin_token");
  return NextResponse.json({ success: true, message: "Logged out successfully." });
}
