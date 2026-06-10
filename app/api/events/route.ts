import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { getUserIdFromRequest, ADMIN_USER_ID } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(status: number, body: unknown) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export async function GET(req: NextRequest) {
    try {
        if (!supabaseUrl) {
            return json(500, {
                success: false,
                message: "環境変数 NEXT_PUBLIC_SUPABASE_URL が未設定です",
            });
        }
        if (!supabaseServiceRoleKey) {
            return json(500, {
                success: false,
                message: "環境変数 SUPABASE_SERVICE_ROLE_KEY が未設定です",
            });
        }

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return json(401, { success: false, message: "認証が必要です" });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        let query = supabase
            .from("mt_event_info")
            .select("id,name,execute_date")
            .order("execute_date", { ascending: true });

        if (userId !== ADMIN_USER_ID) {
            query = query.or(`created_by.eq.${userId},updated_by.eq.${userId}`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase error on mt_event_info select:", {
                code: (error as any)?.code,
                message: (error as any)?.message,
                details: (error as any)?.details,
                hint: (error as any)?.hint,
            });
            return json(500, { success: false, message: "イベント取得に失敗しました" });
        }

        return json(200, { success: true, events: data ?? [] });
    } catch (e) {
        console.error(e);
        return json(500, { success: false, message: "サーバーエラー" });
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!supabaseUrl) {
            return json(500, {
                success: false,
                message: "環境変数 NEXT_PUBLIC_SUPABASE_URL が未設定です",
            });
        }
        if (!supabaseServiceRoleKey) {
            return json(500, {
                success: false,
                message: "環境変数 SUPABASE_SERVICE_ROLE_KEY が未設定です",
            });
        }

        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return json(401, { success: false, message: "認証が必要です" });
        }

        let payload: any;
        try {
            payload = await req.json();
        } catch {
            return json(400, { success: false, message: "不正なJSONです" });
        }

        const { name, execute_date } = payload ?? {};

        if (!name || typeof name !== "string") {
            return json(400, { success: false, message: "name が不正です" });
        }
        if (!execute_date || typeof execute_date !== "string") {
            return json(400, { success: false, message: "execute_date が不正です" });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const { data, error } = await supabase
            .from("mt_event_info")
            .insert({ name: name.trim(), execute_date, created_by: userId, updated_by: userId })
            .select("id")
            .single();

        if (error) {
            console.error("Supabase error on mt_event_info insert:", {
                code: (error as any)?.code,
                message: (error as any)?.message,
                details: (error as any)?.details,
                hint: (error as any)?.hint,
            });
            return json(500, { success: false, message: "イベント登録に失敗しました" });
        }

        return json(200, { success: true, id: data?.id ?? null });
    } catch (e) {
        console.error(e);
        return json(500, { success: false, message: "サーバーエラー" });
    }
}
