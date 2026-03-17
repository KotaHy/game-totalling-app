import { calcRankPt, calcKillPt, calcTotal } from "@/lib/scoreCalc";

export type ScoreDetail = {
  rank: string;
  kill: string;
};

const INPUT_CLASS =
  "w-20 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-right text-base text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

interface ScoreRegistRowProps {
  teamName: string;
  detail: ScoreDetail | undefined;
  killLimit: number;
  onChangeRank: (value: string) => void;
  onChangeKill: (value: string) => void;
}

export default function ScoreRegistRow({
  teamName,
  detail,
  killLimit,
  onChangeRank,
  onChangeKill,
}: ScoreRegistRowProps) {
  const rankPt = calcRankPt(detail?.rank ?? "");
  const killPt = calcKillPt(detail?.kill ?? "", killLimit);
  const total = calcTotal(detail?.rank ?? "", detail?.kill ?? "", killLimit);

  return (
    <div className="grid grid-cols-[minmax(8rem,1fr)_5rem_5rem_4rem_4rem_4rem] items-center gap-x-4">
      <div className="text-base text-zinc-900 dark:text-zinc-50 text-center">
        {teamName || "(不明)"}
      </div>
      <input
        type="number"
        inputMode="numeric"
        className={INPUT_CLASS}
        value={detail?.rank ?? ""}
        onChange={(e) => onChangeRank(e.target.value)}
        min={1}
        max={20}
        placeholder="順位"
      />
      <input
        type="number"
        inputMode="numeric"
        className={INPUT_CLASS}
        value={detail?.kill ?? ""}
        onChange={(e) => onChangeKill(e.target.value)}
        min={0}
        placeholder="キル数"
      />
      <div className="text-right text-base text-zinc-900 dark:text-zinc-50">
        {detail?.rank !== "" && detail?.rank !== undefined ? rankPt : "-"}
      </div>
      <div className="text-right text-base text-zinc-900 dark:text-zinc-50">
        {detail?.kill !== "" && detail?.kill !== undefined ? killPt : "-"}
      </div>
      <div className="text-right text-base font-medium text-zinc-900 dark:text-zinc-50">
        {total}
      </div>
    </div>
  );
}
