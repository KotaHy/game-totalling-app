import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = "team-images";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return json(500, { success: false, message: "Supabase設定が未完了です" });
    }

    const { id: eventId, teamId } = await params;
    if (!eventId || !teamId) {
      return json(400, { success: false, message: "パラメータが不正です" });
    }

    const formData = await req.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return json(400, { success: false, message: "画像ファイルが不正です" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const filePath = `${eventId}_${teamId}.jpg`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return json(500, { success: false, message: "画像のアップロードに失敗しました" });
    }

    const { error: updateError } = await supabase
      .from("team_info")
      .update({ image_path: filePath })
      .eq("id", teamId)
      .eq("event_id", eventId);

    if (updateError) {
      console.error("team_info image_path update error:", updateError);
      return json(500, { success: false, message: "画像パスの保存に失敗しました" });
    }

    return json(200, { success: true, filePath });
  } catch (e) {
    console.error(e);
    return json(500, { success: false, message: "サーバーエラー" });
  }
}
