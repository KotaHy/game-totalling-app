const TH_CLASS = "py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200";
const TD_CLASS = "py-2 pr-4 text-zinc-900 dark:text-zinc-50";
const ROW_CLASS = "border-b border-zinc-100 last:border-b-0 dark:border-zinc-900";

type TeamEntry = { teamId: string; teamName: string };

interface TeamNoScoreListProps {
  teams: TeamEntry[];
  onTeamEdit: () => void;
  onScoreRegist: () => void;
}

export default function TeamNoScoreList({
  teams,
  onTeamEdit,
  onScoreRegist,
}: TeamNoScoreListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          スコア未登録のチーム一覧
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTeamEdit}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 sm:px-3 sm:py-1.5 sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            チーム編集
          </button>
          <button
            type="button"
            onClick={onScoreRegist}
            className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white sm:px-3 sm:py-1.5 sm:text-sm dark:focus:ring-offset-zinc-950"
          >
            スコア登録
          </button>
        </div>
      </div>

      {/* モバイル: カードレイアウト */}
      <div className="sm:hidden space-y-2">
        {teams.map((t, i) => (
          <div
            key={t.teamId}
            className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
          >
            <span className="text-sm text-zinc-900 dark:text-zinc-50">
              <span className="mr-2 text-xs text-zinc-500 dark:text-zinc-400">
                {i + 1}
              </span>
              {t.teamName || "(不明)"}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">未登録</span>
          </div>
        ))}
      </div>

      {/* タブレット・PC: テーブルレイアウト */}
      <div className="hidden sm:block overflow-x-auto">
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
  );
}
