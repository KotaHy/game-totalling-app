import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "@/lib/password";
import { SignJWT } from "jose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT署名用の秘密鍵（環境変数に設定してください）
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-at-least-32-chars"
);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "入力不足です" }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("mt_user_info")
      .select("*")
      .eq("user_name", username)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, message: "ユーザーが見つかりません" }),
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, data.password);

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ success: false, message: "パスワードが正しくありません" }),
        { status: 401 }
      );
    }

    // --- JWTの作成 ---
    const token = await new SignJWT({
      userId: data.id,
      username: data.user_name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // 24時間有効
      .sign(SECRET_KEY);

    // --- Cookieをセットしてレスポンス ---
    const response = new Response(
      JSON.stringify({
        success: true,
        userId: data.id // ここに userId を追加
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

    // HttpOnly属性によりJavaScriptからトークンを隠し、セキュアにします
    response.headers.set(
      "Set-Cookie",
      `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; ${process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`
    );

    return response;
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ success: false, message: "サーバーエラー" }),
      { status: 500 }
    );
  }
}