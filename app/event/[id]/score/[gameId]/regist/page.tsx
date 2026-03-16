"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";

type Team = {
  id: number | string;
  name: string | null;
};

type ScoreDetail = {
  rank: string;
  kill: string;
};

export default function ScoreRegistPage() {
  const router = useRouter();
  const params = useParams<{ id: string; gameId: string }>();
  const eventId = params?.id;
  const gameId = params?.gameId;

  const [teams, setTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreDetail>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [killLimit, setKillLimit] = useState<number>(20);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const res = await fetch(
          `/api/events/${encodeURIComponent(String(eventId))}/teams`
        );
        const body = await res.json().catch(() => ({} as any));
        if (!res.ok) throw new Error(body?.message ?? "チーム取得に失敗しました");
        if (!cancelled) {
          const list: Team[] = Array.isArray(body?.teams) ? body.teams : [];
          setTeams(list);
          // 初期値は空（順位ポイント・キルポイント）
          const init: Record<string, ScoreDetail> = {};
          for (const t of list) {
            init[String(t.id)] = { rank: "", kill: "" };
          }
          setScores(init);
        }
      } catch (e) {
        if (!cancelled) {
          setErrorMessage(e instanceof Error ? e.message : "チーム取得に失敗しました");
          setTeams([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleChangeScore = (
    teamId: string,
    field: keyof ScoreDetail,
    value: string
  ) => {
    setScores((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] ?? { rank: "", kill: "" }), [field]: value },
    }));
  };

  const calcTotal = (detail: ScoreDetail | undefined) => {
    if (!detail) return 0;
    const r = Number(detail.rank);
    const k = Number(detail.kill);
    const rv = Number.isFinite(r) ? r : 0;
    const kvRaw = Number.isFinite(k) ? k : 0;
    const kv = Math.min(kvRaw, killLimit);
    return rv + kv;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventId || !gameId) return;
    setErrorMessage("");
    setSubmitting(true);
    try {
      const payload = {
        game_id: gameId,
        scores: teams.map((t) => ({
          team_id: t.id,
          score: calcTotal(scores[String(t.id)]),
        })),
      };

      const res = await fetch(
        `/api/events/${encodeURIComponent(String(eventId))}/scores`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error(body?.message ?? "スコア登録に失敗しました");
      }

      router.push(`/event/${encodeURIComponent(String(eventId))}/score`);
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "スコア登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={() => router.push("/top")}
        onLogout={() => router.push("/")}
        onBackToTop={() =>
          router.push(`/event/${encodeURIComponent(String(eventId))}/score`)
        }
      />

      <main className="flex-1 px-3 pb-3 pt-16 sm:px-6 sm:pb-4 sm:pt-20">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              スコア登録（試合: {gameId}）
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200">
              <span>キルP上限</span>
              <select
                value={killLimit}
                onChange={(e) => setKillLimit(Number(e.target.value) || 0)}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {Array.from({ length: 21 }, (_, i) => i).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            {loading ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                読み込み中...
              </p>
            ) : teams.length === 0 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  チームが登録されていません
                </p>
                {eventId && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/event/${encodeURIComponent(
                          String(eventId)
                        )}/team/regist`
                      )
                    }
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
                  >
                    チーム登録
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  <div className="w-1/3">チーム</div>
                  <div className="w-1/4 text-right">順位P</div>
                  <div className="w-1/4 text-right">キル数</div>
                  <div className="w-1/6 text-right">合計スコア</div>
                </div>
                {teams.map((t) => {
                  const key = String(t.id);
                  const detail = scores[key];
                  const total = calcTotal(detail);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-1/3 text-base text-zinc-900 dark:text-zinc-50">
                        {t.name || "(不明)"}
                      </div>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="w-1/4 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-right text-base text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        value={detail?.rank ?? ""}
                        onChange={(e) =>
                          handleChangeScore(key, "rank", e.target.value)
                        }
                        placeholder="順位P"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        className="w-1/4 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-right text-base text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        value={detail?.kill ?? ""}
                        onChange={(e) =>
                          handleChangeScore(key, "kill", e.target.value)
                        }
                        placeholder="キル数"
                      />
                      <div className="w-1/6 text-right text-base text-zinc-900 dark:text-zinc-50">
                        {total}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {errorMessage && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={submitting || loading || teams.length === 0}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
              >
                {submitting ? "登録中..." : "登録"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

