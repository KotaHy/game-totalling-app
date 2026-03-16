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

    // NOTE:
    // score_info と team_info の間にFKが無い場合、PostgRESTの埋め込み(select team_info(...))は失敗する。
    // そのため、score_info を取得→team_info を id IN (...) で取得→サーバー側で結合する。
    const { data, error } = await supabase
      .from("score_info")
      .select("score,game_id,team_id")
      .eq("event_id", id)
      .order("team_id", { ascending: true })
      .order("game_id", { ascending: true });

    if (error) {
      console.error("Supabase error on score_info select:", {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      });
      return json(500, { success: false, message: "スコア取得に失敗しました" });
    }

    const rows = (data ?? []) as Array<{
      score: unknown;
      game_id: unknown;
      team_id: unknown;
    }>;

    const teamIds = Array.from(
      new Set(
        rows
          .map((r) => r.team_id)
          .filter((v): v is string | number => v !== null && v !== undefined)
      )
    );

    let teamMap = new Map<string, { id: string | number; name: string | null }>();
    if (teamIds.length > 0) {
      const { data: teams, error: teamsError } = await supabase
        .from("team_info")
        .select("id,name")
        // PostgRESTの in は配列OK
        .in("id", teamIds as any);

      if (teamsError) {
        console.error("Supabase error on team_info select:", {
          code: (teamsError as any)?.code,
          message: (teamsError as any)?.message,
          details: (teamsError as any)?.details,
          hint: (teamsError as any)?.hint,
        });
        return json(500, { success: false, message: "チーム取得に失敗しました" });
      }

      teamMap = new Map(
        (teams ?? []).map((t: any) => [
          String(t.id),
          { id: t.id, name: t.name ?? null },
        ])
      );
    }

    const joined = rows.map((r) => ({
      ...r,
      team_info: teamMap.get(String(r.team_id)) ?? null,
    }));

    return json(200, { success: true, rows: joined });
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

    const game_id = payload?.game_id;
    const scores = payload?.scores;

    if (!game_id) {
      return json(400, { success: false, message: "game_id が不正です" });
    }
    if (!Array.isArray(scores) || scores.length === 0) {
      return json(400, { success: false, message: "scores が不正です" });
    }

    const rowsToInsert = scores
      .filter(
        (s: any) =>
          s &&
          (s.score !== undefined && s.score !== null && String(s.score).trim() !== "")
      )
      .map((s: any) => ({
        event_id: id,
        game_id,
        team_id: s.team_id,
        score: s.score,
      }));

    if (rowsToInsert.length === 0) {
      return json(400, {
        success: false,
        message: "登録対象のスコアがありません",
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error } = await supabase.from("score_info").insert(rowsToInsert);

    if (error) {
      console.error("Supabase error on score_info insert:", {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      });
      return json(500, {
        success: false,
        message: "スコア登録に失敗しました",
      });
    }

    return json(200, { success: true });
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
}

