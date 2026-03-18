"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import PageCard from "@/components/ui/PageCard";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SubmitButton from "@/components/ui/SubmitButton";
import TeamFormRow, { TeamFormData } from "@/components/event/TeamFormRow";

export default function TeamRegistPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params?.id;

  const [rows, setRows] = useState<TeamFormData[]>([]);
  const [imageFiles, setImageFiles] = useState<Record<number, File | null>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasScores, setHasScores] = useState(false);

  // 既存チームとスコア有無を取得
  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [teamsRes, scoresRes] = await Promise.all([
          fetch(`/api/events/${encodeURIComponent(String(eventId))}/teams`),
          fetch(`/api/events/${encodeURIComponent(String(eventId))}/scores`),
        ]);

        const teamsBody = await teamsRes.json().catch(() => ({} as any));
        const scoresBody = await scoresRes.json().catch(() => ({} as any));

        if (!cancelled) {
          const existingTeams: any[] = Array.isArray(teamsBody?.teams)
            ? teamsBody.teams
            : [];

          if (existingTeams.length > 0) {
            setRows(
              existingTeams.map((t) => {
                const members: string[] = Array.isArray(t.member_info)
                  ? t.member_info.map((m: any) => m.name ?? "")
                  : [];
                return {
                  id: String(t.id),
                  name: t.name ?? "",
                  leader: members[0] ?? "",
                  member1: members[1] ?? "",
                  member2: members[2] ?? "",
                  imagePath: t.image_path ?? null,
                };
              })
            );
          } else {
            setRows([{ name: "", leader: "", member1: "", member2: "" }]);
          }

          const scoreRows: any[] = Array.isArray(scoresBody?.rows)
            ? scoresBody.rows
            : [];
          setHasScores(scoreRows.length > 0);
        }
      } catch {
        if (!cancelled) {
          setRows([{ name: "", leader: "", member1: "", member2: "" }]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleChange =
    (index: number, field: keyof Omit<TeamFormData, "id" | "imagePath">) =>
      (value: string) => {
        setRows((prev) =>
          prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
        );
      };

  const handleImageChange = (index: number, file: File | null) => {
    setImageFiles((prev) => ({ ...prev, [index]: file }));
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { name: "", leader: "", member1: "", member2: "" },
    ]);
  };

  const handleDeleteRow = async (index: number) => {
    const row = rows[index];
    if (row.id && eventId) {
      try {
        const res = await fetch(
          `/api/events/${encodeURIComponent(String(eventId))}/teams?teamId=${encodeURIComponent(row.id)}`,
          { method: "DELETE" }
        );
        const body = await res.json().catch(() => ({} as any));
        if (!res.ok) {
          setErrorMessage(body?.message ?? "削除に失敗しました");
          return;
        }
      } catch {
        setErrorMessage("削除に失敗しました");
        return;
      }
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
    // imageFiles のインデックスをずらす
    setImageFiles((prev) => {
      const next: Record<number, File | null> = {};
      for (const [k, v] of Object.entries(prev)) {
        const n = Number(k);
        if (n < index) next[n] = v;
        else if (n > index) next[n - 1] = v;
      }
      return next;
    });
  };

  const uploadImage = async (teamId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    await fetch(
      `/api/events/${encodeURIComponent(String(eventId))}/teams/${encodeURIComponent(teamId)}/image`,
      { method: "POST", body: formData }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setErrorMessage("");

    const validRows = rows.filter((r) => r.name.trim() !== "");
    if (validRows.length === 0) {
      setErrorMessage("少なくとも1つのチーム名を入力してください");
      return;
    }

    // validRows に対応する imageFiles のインデックスマップを作成
    const validIndices = rows
      .map((r, i) => (r.name.trim() !== "" ? i : -1))
      .filter((i) => i !== -1);

    setSubmitting(true);
    try {
      const isUpdate = validRows.some((r) => r.id);
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(
        `/api/events/${encodeURIComponent(String(eventId))}/teams`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teams: validRows }),
        }
      );
      const body = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error(body?.message ?? "チーム登録に失敗しました");
      }

      // 画像のアップロード
      const returnedTeams: { id: string; name: string }[] = body.teams ?? [];
      await Promise.all(
        validIndices.map(async (originalIdx, validIdx) => {
          const file = imageFiles[originalIdx];
          if (!file) return;
          const teamId = returnedTeams[validIdx]?.id;
          if (!teamId) return;
          await uploadImage(String(teamId), file);
        })
      );

      router.push(`/event/${encodeURIComponent(String(eventId))}/score`);
      router.refresh();
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "チーム登録に失敗しました"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isExisting = rows.some((r) => r.id);

  return (
    <PageLayout
      onMyPage={() => router.push("/top")}
      onLogout={() => router.push("/")}
      onBackToTop={() =>
        router.push(`/event/${encodeURIComponent(String(eventId))}/score`)
      }
      mainClassName="flex-1 px-3 pb-3 pt-16 sm:px-6 sm:pb-4 sm:pt-20"
    >
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          チーム{isExisting ? "編集" : "登録"}
        </h1>

        {hasScores ? (
          <PageCard className="mt-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              スコアが登録済みのため、チーム情報は変更できません。
            </p>
          </PageCard>
        ) : loading ? (
          <PageCard className="mt-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">読み込み中...</p>
          </PageCard>
        ) : (
          <form onSubmit={handleSubmit}>
            <PageCard className="mt-3">
              <div className="space-y-3">
                {/* タブレット・PC: ヘッダー行 */}
                <div className="hidden sm:flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  <div className="w-6 text-center">No</div>
                  <div className="w-1/4">チーム名</div>
                  <div className="w-1/4">チームリーダー</div>
                  <div className="w-1/4">メンバー1</div>
                  <div className="w-1/4">メンバー2</div>
                  <div className="w-8"></div>
                </div>

                {rows.map((row, idx) => (
                  <TeamFormRow
                    key={row.id ?? idx}
                    row={row}
                    index={idx}
                    imageFile={imageFiles[idx] ?? null}
                    onChange={(field, value) => handleChange(idx, field)(value)}
                    onDelete={() => handleDeleteRow(idx)}
                    onImageChange={(file) => handleImageChange(idx, file)}
                  />
                ))}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-lg font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    ＋
                  </button>
                </div>
              </div>

              <ErrorMessage message={errorMessage} className="mt-4" />

              <div className="mt-6 flex justify-center">
                <SubmitButton loading={submitting} loadingLabel="登録中...">
                  {isExisting ? "更新" : "登録"}
                </SubmitButton>
              </div>
            </PageCard>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
