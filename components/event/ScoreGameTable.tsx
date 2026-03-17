const TH_CLASS = "py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200";
const TD_CLASS = "py-2 pr-4 text-zinc-900 dark:text-zinc-50";
const ROW_CLASS = "border-b border-zinc-100 last:border-b-0 dark:border-zinc-900";

function formatGameLabel(gameId: string) {
  const trimmed = (gameId ?? "").trim();
  if (!trimmed) return "-";
  return `第${trimmed}試合`;
}

export type TeamEntry = { teamId: string; teamName: string };

interface ScoreGameTableProps {
  teams: TeamEntry[];
  games: string[];
  scoreMap: Map<string, Map<string, string>>;
  onTeamListClick: () => void;
  onScoreRegist: () => void;
}

export default function ScoreGameTable({
  teams,
  games,
  scoreMap,
  onTeamListClick,
  onScoreRegist,
}: ScoreGameTableProps) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          試合ごとのスコア一覧
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTeamListClick}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            チーム一覧
          </button>
          <button
            type="button"
            onClick={onScoreRegist}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
          >
            スコア登録
          </button>
        </div>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className={TH_CLASS}>No</th>
              <th className={TH_CLASS}>チーム</th>
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
            {teams.map((t, i) => (
              <tr key={t.teamId} className={ROW_CLASS}>
                <td className={TD_CLASS}>{i + 1}</td>
                <td className={TD_CLASS}>{t.teamName || "(不明)"}</td>
                {games.map((g) => (
                  <td
                    key={`${t.teamId}-${g}`}
                    className="py-2 px-3 text-zinc-900 dark:text-zinc-50"
                  >
                    {scoreMap.get(g)?.get(t.teamId) || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
