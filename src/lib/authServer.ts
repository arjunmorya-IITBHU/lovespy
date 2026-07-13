import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback-secret-key-for-jwt-tokens-development";

export interface DecodedToken {
  id?: string;
  email?: string;
  phone?: string;
  role: string;
  name?: string;
}

/**
 * Authenticates the request and verifies that the user is an admin.
 * Checks both Authorization header (Bearer token) and secure cookie (lovespy_admin_token).
 */
export async function authenticateAdmin(req: Request): Promise<DecodedToken | null> {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Check secure cookie if no token in header
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("lovespy_admin_token")?.value;
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as DecodedToken;
    if (decoded && decoded.role === "admin") {
      return decoded;
    }
    return null;
  } catch (e) {
    return null;
  }
}
