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

export async function DELETE(
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

    // score_info を削除
    const { error: scoreError } = await supabase
      .from("score_info")
      .delete()
      .eq("event_id", id);
    if (scoreError) {
      console.error("score_info delete error:", scoreError);
      return json(500, { success: false, message: "スコア削除に失敗しました" });
    }

    // team_id 一覧を取得してから member_info を削除
    const { data: teams, error: teamFetchError } = await supabase
      .from("team_info")
      .select("id")
      .eq("event_id", id);
    if (teamFetchError) {
      console.error("team_info fetch error:", teamFetchError);
      return json(500, { success: false, message: "チーム取得に失敗しました" });
    }

    const teamIds = (teams ?? []).map((t: any) => t.id);
    if (teamIds.length > 0) {
      const { error: memberError } = await supabase
        .from("member_info")
        .delete()
        .in("team_id", teamIds);
      if (memberError) {
        console.error("member_info delete error:", memberError);
        return json(500, { success: false, message: "メンバー削除に失敗しました" });
      }
    }

    // team_info を削除
    const { error: teamError } = await supabase
      .from("team_info")
      .delete()
      .eq("event_id", id);
    if (teamError) {
      console.error("team_info delete error:", teamError);
      return json(500, { success: false, message: "チーム削除に失敗しました" });
    }

    // mt_event_info を削除
    const { error: eventError } = await supabase
      .from("mt_event_info")
      .delete()
      .eq("id", id);
    if (eventError) {
      console.error("mt_event_info delete error:", eventError);
      return json(500, { success: false, message: "イベント削除に失敗しました" });
    }

    return json(200, { success: true });
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
}
