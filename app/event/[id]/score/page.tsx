"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import PageCard from "@/components/ui/PageCard";
import ErrorMessage from "@/components/ui/ErrorMessage";
import TeamListModal, { TeamWithMembers } from "@/components/event/TeamListModal";
import ScoreGameTable from "@/components/event/ScoreGameTable";
import ScoreRankingTable from "@/components/event/ScoreRankingTable";

type ScoreRow = {
  score: number | string | null;
  game_id: number | string | null;
  team_id: number | string | null;
  team_info?: { id: number | string; name: string | null } | null;
};

const TH_CLASS = "py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200";
const TD_CLASS = "py-2 pr-4 text-zinc-900 dark:text-zinc-50";
const ROW_CLASS = "border-b border-zinc-100 last:border-b-0 dark:border-zinc-900";

export default function EventScorePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params?.id;

  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [teamsFromMaster, setTeamsFromMaster] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTeamList, setShowTeamList] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const [scoresRes, teamsRes] = await Promise.all([
          fetch(`/api/events/${encodeURIComponent(eventId)}/scores`),
          fetch(`/api/events/${encodeURIComponent(eventId)}/teams`),
        ]);

        const scoresBody = await scoresRes.json().catch(() => ({} as any));
        const teamsBody = await teamsRes.json().catch(() => ({} as any));

        if (!scoresRes.ok) {
          throw new Error(scoresBody?.message ?? "スコア取得に失敗しました");
        }
        if (!teamsRes.ok) {
          throw new Error(teamsBody?.message ?? "チーム取得に失敗しました");
        }

        if (!cancelled) {
          setRows(Array.isArray(scoresBody?.rows) ? scoresBody.rows : []);
          const masters: TeamWithMembers[] = Array.isArray(teamsBody?.teams)
            ? teamsBody.teams.map((t: any) => ({
                teamId: String(t.id),
                teamName: String(t.name ?? ""),
                members: Array.isArray(t.member_info)
                  ? t.member_info.map((m: any) => String(m.name ?? ""))
                  : [],
              }))
            : [];
          setTeamsFromMaster(masters);
        }
      } catch (e) {
        if (!cancelled) {
          setErrorMessage(
            e instanceof Error ? e.message : "スコア情報の取得に失敗しました"
          );
          setRows([]);
          setTeamsFromMaster([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const { teams, games, scoreMap, totals, teamNoMap } = useMemo(() => {
    const teamMap = new Map<string, { teamId: string; teamName: string }>();
    const gameSet = new Set<string>();
    const sMap = new Map<string, Map<string, string>>();
    const totalMap = new Map<
      string,
      { teamId: string; teamName: string; total: number }
    >();

    for (const r of rows) {
      const teamId = String(r.team_info?.id ?? r.team_id ?? "");
      const teamName = String(r.team_info?.name ?? "");
      const gameId = String(r.game_id ?? "");
      const scoreStr = String(r.score ?? "");
      if (!teamId || !gameId) continue;

      teamMap.set(teamId, { teamId, teamName });
      gameSet.add(gameId);

      if (!sMap.has(gameId)) sMap.set(gameId, new Map<string, string>());
      sMap.get(gameId)!.set(teamId, scoreStr);

      const value = Number(scoreStr);
      const add = Number.isFinite(value) ? value : 0;
      if (!totalMap.has(teamId)) {
        totalMap.set(teamId, { teamId, teamName, total: 0 });
      }
      totalMap.get(teamId)!.total += add;
    }

    for (const mt of teamsFromMaster) {
      if (!teamMap.has(mt.teamId)) teamMap.set(mt.teamId, mt);
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

    const noMap = new Map<string, number>();
    teamsArr.forEach((t, i) => noMap.set(t.teamId, i + 1));

    return { teams: teamsArr, games: gamesArr, scoreMap: sMap, totals: totalsArr, teamNoMap: noMap };
  }, [rows, teamsFromMaster]);

  const handleScoreRegist = () => {
    if (!eventId) return;
    const nextGame =
      games.length > 0 ? String(Number(games[games.length - 1]) + 1) : "1";
    router.push(
      `/event/${encodeURIComponent(String(eventId))}/score/${encodeURIComponent(nextGame)}/regist`
    );
  };

  const handleTeamRegist = () => {
    if (!eventId) return;
    router.push(`/event/${encodeURIComponent(String(eventId))}/team/regist`);
  };

  return (
    <PageLayout
      onMyPage={() => router.push("/top")}
      onLogout={() => router.push("/")}
      onBackToTop={() => router.push("/top")}
    >
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        スコア一覧（イベントID: {eventId}）
      </h1>

      <PageCard className="mt-4">
        {loading ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">読み込み中...</p>
        ) : errorMessage ? (
          <ErrorMessage message={errorMessage} />
        ) : teams.length === 0 ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              チームが未登録です
            </p>
            {eventId && (
              <button
                type="button"
                onClick={handleTeamRegist}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
              >
                チーム登録
              </button>
            )}
          </div>
        ) : games.length === 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                スコア未登録のチーム一覧
              </p>
              {eventId && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTeamRegist}
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    チーム編集
                  </button>
                  <button
                    type="button"
                    onClick={handleScoreRegist}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
                  >
                    スコア登録
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className={TH_CLASS}>No</th>
                    <th className={TH_CLASS}>チーム</th>
                    <th className="py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">
                      スコア
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => (
                    <tr key={t.teamId} className={ROW_CLASS}>
                      <td className={TD_CLASS}>{i + 1}</td>
                      <td className={TD_CLASS}>{t.teamName || "(不明)"}</td>
                      <td className="py-2 text-zinc-900 dark:text-zinc-50">未登録</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <ScoreGameTable
              teams={teams}
              games={games}
              scoreMap={scoreMap}
              onTeamListClick={() => setShowTeamList(true)}
              onScoreRegist={handleScoreRegist}
            />
            <ScoreRankingTable totals={totals} teamNoMap={teamNoMap} />
          </div>
        )}
      </PageCard>

      {showTeamList && eventId && (
        <TeamListModal
          eventId={eventId}
          teams={teamsFromMaster}
          onClose={() => setShowTeamList(false)}
        />
      )}
    </PageLayout>
  );
}
