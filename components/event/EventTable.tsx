import Link from "next/link";

export type EventRow = {
  id: number | string;
  name: string | null;
  execute_date: string | null;
};

const TH_CLASS = "py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200";
const TD_CLASS = "py-2 pr-4 text-zinc-900 dark:text-zinc-50";

interface EventTableProps {
  events: EventRow[];
  onDeleteClick: (ev: EventRow) => void;
}

export default function EventTable({ events, onDeleteClick }: EventTableProps) {
  return (
    <>
      {/* モバイル: カードレイアウト */}
      <div className="sm:hidden space-y-2">
        {events.map((ev) => (
          <div
            key={String(ev.id)}
            className="flex items-start justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
          >
            <div className="space-y-0.5 min-w-0 flex-1 pr-3">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                ID:{" "}
                <Link
                  href={`/event/${encodeURIComponent(String(ev.id))}/score`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {String(ev.id)}
                </Link>
              </div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                {ev.name ?? ""}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {ev.execute_date ?? ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDeleteClick(ev)}
              className="shrink-0 rounded-md border border-red-300 px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
            >
              削除
            </button>
          </div>
        ))}
      </div>

      {/* タブレット・PC: テーブルレイアウト */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className={TH_CLASS}>イベントID</th>
              <th className={TH_CLASS}>イベント名</th>
              <th className={TH_CLASS}>開催日</th>
              <th className="py-2 text-right font-medium text-zinc-700 dark:text-zinc-200"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr
                key={String(ev.id)}
                className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
              >
                <td className={TD_CLASS}>
                  <Link
                    href={`/event/${encodeURIComponent(String(ev.id))}/score`}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {String(ev.id)}
                  </Link>
                </td>
                <td className={TD_CLASS}>{ev.name ?? ""}</td>
                <td className={TD_CLASS}>{ev.execute_date ?? ""}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteClick(ev)}
                    className="rounded-md border border-red-300 px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
