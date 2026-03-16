import SearchIcon from "@mui/icons-material/Search";
interface TopHeaderProps {
  onMyPage: () => void;
  onLogout: () => void;
  onSearchUserTasks?: () => void;
  isAdmin?: boolean;
  onBackToTop?: () => void;
}

export default function TopHeader({
  onMyPage,
  onLogout,
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
          {isAdmin && onSearchUserTasks && (
            <button
              type="button"
              onClick={onSearchUserTasks}
              className="flex items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              aria-label="ユーザーごとのタスク検索"
            >
              <SearchIcon fontSize="small" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={onMyPage}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            ユーザ
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
