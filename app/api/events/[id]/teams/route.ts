import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return json(500, { success: false, message: "Supabase設定が未完了です" });
    }

    const { id } = await params;
    if (!id) {
      return json(400, { success: false, message: "event id が不正です" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data, error } = await supabase
      .from("team_info")
      .select("id,name")
      .eq("event_id", id)
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase error on team_info select:", {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      });
      return json(500, { success: false, message: "チーム取得に失敗しました" });
    }

    return json(200, { success: true, teams: data ?? [] });
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return json(500, { success: false, message: "Supabase設定が未完了です" });
    }

    const { id } = await params;
    if (!id) {
      return json(400, { success: false, message: "event id が不正です" });
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return json(400, { success: false, message: "不正なJSONです" });
    }

    const teams = payload?.teams;
    if (!Array.isArray(teams) || teams.length === 0) {
      return json(400, { success: false, message: "teams が不正です" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // team_info へ挿入
    const teamRows = teams.map((t: any) => ({
      name: t.name,
      event_id: id,
    }));

    const { data: insertedTeams, error: teamError } = await supabase
      .from("team_info")
      .insert(teamRows)
      .select("id,name");

    if (teamError) {
      console.error("Supabase error on team_info insert:", {
        code: (teamError as any)?.code,
        message: (teamError as any)?.message,
        details: (teamError as any)?.details,
        hint: (teamError as any)?.hint,
      });
      return json(500, {
        success: false,
        message: "チーム登録に失敗しました",
      });
    }

    // member_info へ挿入
    const memberRows: { name: string; team_id: any }[] = [];
    (insertedTeams ?? []).forEach((t: any, index: number) => {
      const src = teams[index];
      if (!src) return;
      const teamId = t.id;
      const members: string[] = [
        src.leader,
        src.member1,
        src.member2,
      ].filter((m) => typeof m === "string" && m.trim() !== "");
      for (const m of members) {
        memberRows.push({ name: m.trim(), team_id: teamId });
      }
    });

    if (memberRows.length > 0) {
      const { error: memberError } = await supabase
        .from("member_info")
        .insert(memberRows);
      if (memberError) {
        console.error("Supabase error on member_info insert:", {
          code: (memberError as any)?.code,
          message: (memberError as any)?.message,
          details: (memberError as any)?.details,
          hint: (memberError as any)?.hint,
        });
        return json(500, {
          success: false,
          message: "メンバー登録に失敗しました",
        });
      }
    }

    return json(200, { success: true });
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
}

