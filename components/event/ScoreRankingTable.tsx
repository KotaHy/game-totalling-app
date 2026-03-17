const TH_CLASS = "py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200";
const TD_CLASS = "py-2 pr-4 text-zinc-900 dark:text-zinc-50";
const ROW_CLASS = "border-b border-zinc-100 last:border-b-0 dark:border-zinc-900";

export type TotalEntry = { teamId: string; teamName: string; total: number };

interface ScoreRankingTableProps {
  totals: TotalEntry[];
  teamNoMap: Map<string, number>;
}

export default function ScoreRankingTable({
  totals,
  teamNoMap,
}: ScoreRankingTableProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        合計スコアランキング
      </h2>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className={TH_CLASS}>順位</th>
              <th className={TH_CLASS}>チーム</th>
              <th className="py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">
                合計スコア
              </th>
            </tr>
          </thead>
          <tbody>
            {totals.map((t, index) => (
              <tr key={t.teamId} className={ROW_CLASS}>
                <td className={TD_CLASS}>{index + 1}</td>
                <td className={TD_CLASS}>
                  {t.teamName || "(不明)"}
                  <span className="ml-1 text-sm">
                    [{teamNoMap.get(t.teamId) ?? "-"}]
                  </span>
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
  );
}
