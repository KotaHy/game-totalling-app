import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
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

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    if (!teamId) {
      return json(400, { success: false, message: "teamId が不正です" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error: memberError } = await supabase
      .from("member_info")
      .delete()
      .eq("team_id", teamId);
    if (memberError) {
      console.error("member_info delete error:", memberError);
      return json(500, { success: false, message: "メンバー削除に失敗しました" });
    }

    const { error: teamError } = await supabase
      .from("team_info")
      .delete()
      .eq("id", teamId)
      .eq("event_id", id);
    if (teamError) {
      console.error("team_info delete error:", teamError);
      return json(500, { success: false, message: "チーム削除に失敗しました" });
    }

    return json(200, { success: true });
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
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
      .select("id,name,image_path,member_info(name)")
      .eq("event_id", id)
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase error on team_info select:", error);
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

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return json(401, { success: false, message: "認証が必要です" });
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

    const teamRows = teams.map((t: any) => ({
      name: t.name,
      event_id: id,
      created_by: userId,
      updated_by: userId,
    }));

    const { data: insertedTeams, error: teamError } = await supabase
      .from("team_info")
      .insert(teamRows)
      .select("id,name");

    if (teamError) {
      console.error("Supabase error on team_info insert:", teamError);
      return json(500, { success: false, message: "チーム登録に失敗しました" });
    }

    const memberRows: { name: string; team_id: any; created_by: string; updated_by: string }[] = [];
    (insertedTeams ?? []).forEach((t: any, index: number) => {
      const src = teams[index];
      if (!src) return;
      const members: string[] = [src.leader, src.member1, src.member2].filter(
        (m) => typeof m === "string" && m.trim() !== ""
      );
      for (const m of members) {
        memberRows.push({ name: m.trim(), team_id: t.id, created_by: userId, updated_by: userId });
      }
    });

    if (memberRows.length > 0) {
      const { error: memberError } = await supabase
        .from("member_info")
        .insert(memberRows);
      if (memberError) {
        console.error("Supabase error on member_info insert:", memberError);
        return json(500, { success: false, message: "メンバー登録に失敗しました" });
      }
    }

    return json(200, { success: true, teams: insertedTeams ?? [] });
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return json(500, { success: false, message: "Supabase設定が未完了です" });
    }

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return json(401, { success: false, message: "認証が必要です" });
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

    const teams: any[] = payload?.teams;
    if (!Array.isArray(teams) || teams.length === 0) {
      return json(400, { success: false, message: "teams が不正です" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const existing = teams.filter((t) => t.id);
    const newTeams = teams.filter((t) => !t.id);

    // 既存チームの更新
    for (const t of existing) {
      const { error } = await supabase
        .from("team_info")
        .update({ name: t.name, updated_by: userId })
        .eq("id", t.id)
        .eq("event_id", id);
      if (error) {
        console.error("Supabase error on team_info update:", error);
        return json(500, { success: false, message: "チーム更新に失敗しました" });
      }

      // メンバーを削除して再登録
      const { error: delError } = await supabase
        .from("member_info")
        .delete()
        .eq("team_id", t.id);
      if (delError) {
        console.error("Supabase error on member_info delete:", delError);
        return json(500, { success: false, message: "メンバー更新に失敗しました" });
      }

      const members: string[] = [t.leader, t.member1, t.member2].filter(
        (m) => typeof m === "string" && m.trim() !== ""
      );
      if (members.length > 0) {
        const { error: insError } = await supabase
          .from("member_info")
          .insert(members.map((m) => ({
            name: m.trim(),
            team_id: t.id,
            created_by: userId,
            updated_by: userId,
          })));
        if (insError) {
          console.error("Supabase error on member_info insert:", insError);
          return json(500, { success: false, message: "メンバー更新に失敗しました" });
        }
      }
    }

    // 新規チームの追加
    let insertedNewTeams: { id: any; name: string }[] = [];
    if (newTeams.length > 0) {
      const { data: inserted, error: teamError } = await supabase
        .from("team_info")
        .insert(newTeams.map((t: any) => ({
          name: t.name,
          event_id: id,
          created_by: userId,
          updated_by: userId,
        })))
        .select("id,name");

      if (teamError) {
        console.error("Supabase error on team_info insert:", teamError);
        return json(500, { success: false, message: "チーム登録に失敗しました" });
      }

      insertedNewTeams = inserted ?? [];

      const memberRows: { name: string; team_id: any; created_by: string; updated_by: string }[] = [];
      insertedNewTeams.forEach((t: any, index: number) => {
        const src = newTeams[index];
        if (!src) return;
        const members: string[] = [src.leader, src.member1, src.member2].filter(
          (m) => typeof m === "string" && m.trim() !== ""
        );
        for (const m of members) {
          memberRows.push({ name: m.trim(), team_id: t.id, created_by: userId, updated_by: userId });
        }
      });

      if (memberRows.length > 0) {
        const { error: memberError } = await supabase
          .from("member_info")
          .insert(memberRows);
        if (memberError) {
          console.error("Supabase error on member_info insert:", memberError);
          return json(500, { success: false, message: "メンバー登録に失敗しました" });
        }
      }
    }

    // 全チームをまとめて返す（既存 + 新規、入力順）
    const allTeams = teams.map((t) => {
      if (t.id) return { id: t.id, name: t.name };
      const inserted = insertedNewTeams.shift();
      return { id: inserted?.id, name: t.name };
    });

    return json(200, { success: true, teams: allTeams });
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
}
