import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-at-least-32-chars"
);

export const ADMIN_USER_ID = "1";

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("session_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId;
    if (!userId) return null;
    return String(userId);
  } catch {
    return null;
  }
}
