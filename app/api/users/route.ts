import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    let query = supabase.from("mt_user_info").select("id, user_name");

    // userId が存在する場合、eq フィルタを適用
    if (userId) {
      query = query.eq("id", userId);
    } else {
      // userId が存在しない場合、order を適用（全件検索）
      query = query.order("user_name", { ascending: true });
    }

    let data;
    let error;

    // userId の有無に応じて single() を呼び出すか分岐
    if (userId) {
      // 特定のユーザーの場合、single() で実行
      const result = await query.single();
      data = result.data;
      error = result.error;
    } else {
      // 全件検索の場合、そのまま実行
      const result = await query;
      data = result.data;
      error = result.error;
    }
    if (error && error.code !== 'PGRST116') { // PGRST116はデータが見つからないエラー
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (userId && !data) {
      return NextResponse.json({ success: false, message: "ユーザーが見つかりません" }, { status: 404 });
    }

    // レスポンスの形式を userId の有無で変更
    if (userId) {
      return NextResponse.json({ success: true, user: data }, { status: 200 });
    } else {
      return NextResponse.json({ success: true, users: data }, { status: 200 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}




export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "ユーザー名とパスワードは必須です" }, { status: 400 });
    }

    // ユーザー名の重複チェック
    const { data: existingUser, error: fetchError } = await supabase
      .from("mt_user_info")
      .select("id")
      .eq("user_name", username)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, message: "このユーザー名は既に使用されています" }, { status: 409 });
    }
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116はデータが見つからないエラー
      console.error("ユーザー重複チェックエラー:", fetchError);
      return NextResponse.json({ success: false, message: "ユーザー重複チェックに失敗しました" }, { status: 500 });
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // mt_user_info テーブルにユーザーを登録
    const { data, error } = await supabase.from("mt_user_info").insert([
      {
        user_name: username,
        password: hashedPassword,
      },
    ]).select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data[0] }, { status: 201 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json({ success: false, message: "ユーザー名は必須です" }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ success: false, message: "パスワードは必須です" }, { status: 400 });
    }

    // ユーザー名でユーザーを検索
    const { data: existingUser, error: fetchError } = await supabase
      .from("mt_user_info")
      .select("id")
      .eq("user_name", username)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("ユーザー検索エラー:", fetchError);
      return NextResponse.json({ success: false, message: "ユーザー検索に失敗しました" }, { status: 500 });
    }
    if (!existingUser) {
      return NextResponse.json({ success: false, message: "ユーザーが見つかりません" }, { status: 404 });
    }

    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
      .from("mt_user_info")
      .update({ password: hashedPassword })
      .eq("id", existingUser.id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data[0] }, { status: 200 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
