interface TopHeaderProps {
  onMyPage: () => void;
  onLogout: () => void;
  onEventRegist?: () => void;
  onSearchUserTasks?: () => void;
  isAdmin?: boolean;
  onBackToTop?: () => void;
}

export default function TopHeader({
  onMyPage,
  onLogout,
  onEventRegist,
  onSearchUserTasks,
  isAdmin = false,
  onBackToTop,
}: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          {onBackToTop && (
            <button
              type="button"
              onClick={onBackToTop}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              戻る
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">

          {onEventRegist && (
            <button
              type="button"
              onClick={onEventRegist}
              aria-label="イベント登録"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-lg font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              ＋
            </button>
          )}
          <button
            type="button"
            onClick={onMyPage}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            ユーザ編集
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
