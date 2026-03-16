"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";

type ScoreRow = {
  score: number | string | null;
  game_id: number | string | null;
  team_id: number | string | null;
  team_info?: { id: number | string; name: string | null } | null;
};

type TeamGroup = {
  teamId: string;
  teamName: string;
  rows: { gameId: string; score: string }[];
};

function formatGameLabel(gameId: string) {
  const trimmed = (gameId ?? "").trim();
  if (!trimmed) return "-";
  return `第${trimmed}試合`;
}

export default function EventScorePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params?.id;

  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(eventId)}/scores`);
        const body = await res.json().catch(() => ({} as any));
        if (!res.ok) throw new Error(body?.message ?? "スコア取得に失敗しました");
        if (!cancelled) setRows(Array.isArray(body?.rows) ? body.rows : []);
      } catch (e) {
        if (!cancelled) {
          setErrorMessage(e instanceof Error ? e.message : "スコア取得に失敗しました");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const {
    teams,
    games,
    scoreMap,
    totals,
  }: {
    teams: { teamId: string; teamName: string }[];
    games: string[];
    scoreMap: Map<string, Map<string, string>>; // gameId -> teamId -> score
    totals: { teamId: string; teamName: string; total: number }[];
  } = useMemo(() => {
    const teamMap = new Map<string, { teamId: string; teamName: string }>();
    const gameSet = new Set<string>();
    const sMap = new Map<string, Map<string, string>>();
    const totalMap = new Map<string, { teamId: string; teamName: string; total: number }>();

    for (const r of rows) {
      const teamId = String(r.team_info?.id ?? r.team_id ?? "");
      const teamName = String(r.team_info?.name ?? "");
      const gameId = String(r.game_id ?? "");
      const scoreStr = String(r.score ?? "");
      if (!teamId || !gameId) continue;

      teamMap.set(teamId, { teamId, teamName });
      gameSet.add(gameId);

      if (!sMap.has(gameId)) {
        sMap.set(gameId, new Map<string, string>());
      }
      sMap.get(gameId)!.set(teamId, scoreStr);

      const value = Number(scoreStr);
      const add = Number.isFinite(value) ? value : 0;
      if (!totalMap.has(teamId)) {
        totalMap.set(teamId, { teamId, teamName, total: 0 });
      }
      totalMap.get(teamId)!.total += add;
    }

    const teamsArr = Array.from(teamMap.values()).sort((a, b) =>
      a.teamName.localeCompare(b.teamName, "ja")
    );
    const gamesArr = Array.from(gameSet.values()).sort(
      (a, b) => Number(a) - Number(b)
    );
    const totalsArr = Array.from(totalMap.values()).sort(
      (a, b) => b.total - a.total
    );

    return { teams: teamsArr, games: gamesArr, scoreMap: sMap, totals: totalsArr };
  }, [rows]);

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={() => router.push("/top")}
        onLogout={() => router.push("/")}
        onBackToTop={() => router.push("/top")}
      />

      <main className="flex-1 px-6 py-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          スコア一覧（イベントID: {eventId}）
        </h1>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {loading ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">読み込み中...</p>
          ) : errorMessage ? (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          ) : teams.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              スコアがありません
            </p>
          ) : (
            <div className="space-y-10">
              {/* 試合ごとの各チームスコア一覧（ピボット） */}
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    試合ごとのスコア一覧
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      if (!eventId) return;
                      const nextGame =
                        games.length > 0
                          ? String(Number(games[games.length - 1]) + 1)
                          : "1";
                      router.push(
                        `/event/${encodeURIComponent(
                          String(eventId)
                        )}/score/${encodeURIComponent(nextGame)}/regist`
                      );
                    }}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
                  >
                    スコア登録
                  </button>
                </div>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200">
                          チーム
                        </th>
                        {games.map((g) => (
                          <th
                            key={g}
                            className="py-2 px-3 text-left font-medium text-zinc-700 dark:text-zinc-200"
                          >
                            {formatGameLabel(g)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((t) => (
                        <tr
                          key={t.teamId}
                          className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
                        >
                          <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">
                            {t.teamName || "(不明)"}
                          </td>
                          {games.map((g) => {
                            const val = scoreMap.get(g)?.get(t.teamId) ?? "";
                            return (
                              <td
                                key={`${t.teamId}-${g}`}
                                className="py-2 px-3 text-zinc-900 dark:text-zinc-50"
                              >
                                {val || "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 全試合の合計スコアランキング */}
              <section>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  合計スコアランキング
                </h2>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200">
                          順位
                        </th>
                        <th className="py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200">
                          チーム
                        </th>
                        <th className="py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">
                          合計スコア
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {totals.map((t, index) => (
                        <tr
                          key={t.teamId}
                          className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
                        >
                          <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">
                            {index + 1}
                          </td>
                          <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">
                            {t.teamName || "(不明)"}
                          </td>
                          <td className="py-2 text-zinc-900 dark:text-zinc-50">
                            {t.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

