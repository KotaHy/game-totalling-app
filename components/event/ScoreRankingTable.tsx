const TH_CLASS = "py-2 px-3 text-left font-medium text-zinc-700 border-r border-zinc-200 dark:border-zinc-700 dark:text-zinc-200";
const TD_CLASS = "py-2 px-3 text-zinc-900 border-r border-zinc-200 dark:border-zinc-700 dark:text-zinc-50";
const ROW_CLASS = "border-b border-zinc-100 last:border-b-0 dark:border-zinc-900";

export type TotalEntry = { teamId: string; teamName: string; total: number };

interface ScoreRankingTableProps {
  totals: TotalEntry[];
  teamNoMap: Map<string, number>;
}

function calcTiedRanks(totals: TotalEntry[]): number[] {
  return totals.map((t) =>
    totals.filter((o) => o.total > t.total).length + 1
  );
}

export default function ScoreRankingTable({
  totals,
  teamNoMap,
}: ScoreRankingTableProps) {
  const ranks = calcTiedRanks(totals);
  return (
    <section>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        合計スコアランキング
      </h2>

      {/* モバイル: カードレイアウト */}
      <div className="sm:hidden mt-2 space-y-2">
        {totals.map((t, index) => (
          <div
            key={t.teamId}
            className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-base font-bold text-zinc-900 dark:text-zinc-50">
                {ranks[index]}
              </span>
              <span className="text-sm text-zinc-900 dark:text-zinc-50">
                {t.teamName || "(不明)"}
                <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
                  [{teamNoMap.get(t.teamId) ?? "-"}]
                </span>
              </span>
            </div>
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {t.total}
            </span>
          </div>
        ))}
      </div>

      {/* タブレット・PC: テーブルレイアウト */}
      <div className="hidden sm:block mt-2 overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className={TH_CLASS}>順位</th>
              <th className={TH_CLASS}>チーム</th>
              <th className="py-2 px-3 text-left font-medium text-zinc-700 border-r border-zinc-200 dark:border-zinc-700 dark:text-zinc-200">
                合計スコア
              </th>
            </tr>
          </thead>
          <tbody>
            {totals.map((t, index) => (
              <tr key={t.teamId} className={ROW_CLASS}>
                <td className={TD_CLASS}>{ranks[index]}</td>
                <td className={TD_CLASS}>
                  {t.teamName || "(不明)"}
                  <span className="ml-1 text-sm">
                    [{teamNoMap.get(t.teamId) ?? "-"}]
                  </span>
                </td>
                <td className="py-2 px-3 text-zinc-900 border-r border-zinc-200 dark:border-zinc-700 dark:text-zinc-50">
                  {t.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
