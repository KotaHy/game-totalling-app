import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "@/lib/password";
import { SignJWT } from "jose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getSupabaseClient() {
  if (!supabaseUrl) {
    return {
      error: json(500, {
        success: false,
        message: "環境変数 NEXT_PUBLIC_SUPABASE_URL が未設定です",
      }),
    };
  }
  if (!supabaseServiceRoleKey) {
    return {
      error: json(500, {
        success: false,
        message:
          "環境変数 SUPABASE_SERVICE_ROLE_KEY が未設定です（Publishable/anon key ではありません）",
      }),
    };
  }
  return { client: createClient(supabaseUrl, supabaseServiceRoleKey) };
}

// JWT署名用の秘密鍵（環境変数に設定してください）
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-at-least-32-chars"
);

export async function POST(req: NextRequest) {
  try {
    const { client: supabase, error: supabaseInitError } = getSupabaseClient();
    if (supabaseInitError) return supabaseInitError;

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return json(400, { success: false, message: "不正なJSONです" });
    }

    const { username, password } = payload ?? {};

    if (!username || !password) {
      return json(400, { success: false, message: "入力不足です" });
    }

    const { data, error } = await supabase
      .from("mt_user_info")
      .select("*")
      .eq("user_name", username)
      .single();

    if (error) {
      // 秘密情報は出さず、原因特定に必要な範囲だけログへ
      console.error("Supabase error on mt_user_info select:", {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      });
      const hint =
        (error as any)?.code === "PGRST301" || (error as any)?.code === "42501"
          ? "（RLS/権限設定を確認してください。Service Role Key が設定されていない可能性があります）"
          : "";
      return json(401, {
        success: false,
        message: `ユーザー取得に失敗しました${hint}`,
        code: (error as any)?.code ?? null,
      });
    }
    if (!data) {
      return json(401, { success: false, message: "ユーザーが見つかりません" });
    }

    const isValidPassword = await verifyPassword(password, data.password);

    if (!isValidPassword) {
      return json(401, { success: false, message: "パスワードが正しくありません" });
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
    const response = json(200, {
      success: true,
      userId: data.id, // ここに userId を追加
    });

    // HttpOnly属性によりJavaScriptからトークンを隠し、セキュアにします
    response.headers.set(
      "Set-Cookie",
      `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; ${process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`
    );

    return response;
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
}