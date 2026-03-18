export type TeamFormData = {
  id?: string;
  name: string;
  leader: string;
  member1: string;
  member2: string;
};

const PLACEHOLDERS: Record<keyof Omit<TeamFormData, "id">, string> = {
  name: "チーム名",
  leader: "チームリーダー",
  member1: "メンバー1",
  member2: "メンバー2",
};

const INPUT_CLASS =
  "w-1/4 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const MOBILE_INPUT_CLASS =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

interface TeamFormRowProps {
  row: TeamFormData;
  index: number;
  onChange: (field: keyof Omit<TeamFormData, "id">, value: string) => void;
  onDelete: () => void;
}

export default function TeamFormRow({
  row,
  index,
  onChange,
  onDelete,
}: TeamFormRowProps) {
  return (
    <>
      {/* モバイル: カードレイアウト */}
      <div className="sm:hidden rounded-lg border border-zinc-100 p-3 space-y-2 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            No.{index + 1}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
          >
            削除
          </button>
        </div>
        {(["name", "leader", "member1", "member2"] as const).map((field) => (
          <input
            key={field}
            type="text"
            className={MOBILE_INPUT_CLASS}
            value={row[field]}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={PLACEHOLDERS[field]}
          />
        ))}
      </div>

      {/* タブレット・PC: 横並びレイアウト */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="w-6 shrink-0 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {index + 1}
        </div>
        {(["name", "leader", "member1", "member2"] as const).map((field) => (
          <input
            key={field}
            type="text"
            className={INPUT_CLASS}
            value={row[field]}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={PLACEHOLDERS[field]}
          />
        ))}
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 whitespace-nowrap rounded-md border border-red-300 px-2 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
        >
          削除
        </button>
      </div>
    </>
  );
}
