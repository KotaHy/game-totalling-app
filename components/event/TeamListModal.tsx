export type TeamWithMembers = {
  teamId: string;
  teamName: string;
  members: string[];
  imagePath?: string;
};

interface TeamListModalProps {
  eventId: string;
  eventName?: string;
  teams: TeamWithMembers[];
  onClose: () => void;
}

export default function TeamListModal({
  eventId,
  eventName,
  teams,
  onClose,
}: TeamListModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            チーム一覧（{eventName}）
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100"
          >
            ✕
          </button>
        </div>
        {teams.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">チームがありません</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-96 overflow-y-auto">
            {teams.map((t, i) => (
              <li key={t.teamId} className="py-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {i + 1}. {t.teamName || "(不明)"}
                </p>
                {(t.members ?? []).length > 0 && (
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {(t.members ?? []).map((m, j) => (
                      <li key={j} className="text-sm text-zinc-500 dark:text-zinc-400">
                        ・{m}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
