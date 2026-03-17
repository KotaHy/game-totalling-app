"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import PageCard from "@/components/ui/PageCard";
import ErrorMessage from "@/components/ui/ErrorMessage";

type EventRow = {
  id: number | string;
  name: string | null;
  execute_date: string | null;
};

const TH_CLASS = "py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200";
const TD_CLASS = "py-2 pr-4 text-zinc-900 dark:text-zinc-50";

export default function Top() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsAdmin(userId === "1");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingEvents(true);
      setEventsError("");
      try {
        const res = await fetch("/api/events");
        const body = await res.json().catch(() => ({} as any));
        if (!res.ok) {
          throw new Error(body?.message ?? "イベント取得に失敗しました");
        }
        if (!cancelled) {
          setEvents(Array.isArray(body?.events) ? body.events : []);
        }
      } catch (e) {
        if (!cancelled) {
          setEventsError(
            e instanceof Error ? e.message : "イベント取得に失敗しました"
          );
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(String(deleteTarget.id))}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(body?.message ?? "削除に失敗しました");
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setEventsError(e instanceof Error ? e.message : "削除に失敗しました");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleGoToMyPage = () => {
    const userId = localStorage.getItem("userId");
    router.push(userId ? `/users/${userId}/edit` : "/login");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <PageLayout
      onMyPage={handleGoToMyPage}
      onLogout={handleLogout}
      onEventRegist={() => router.push("/event/Regist")}
      onSearchUserTasks={isAdmin ? () => router.push("/top/user-tasks") : undefined}
      isAdmin={isAdmin}
    >
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        イベント一覧
      </h1>

      <PageCard className="mt-4">
        {loadingEvents ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">読み込み中...</p>
        ) : eventsError ? (
          <ErrorMessage message={eventsError} />
        ) : events.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            イベントがありません
          </p>
        ) : (
          <div className="overflow-x-auto">
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
                        onClick={() => setDeleteTarget(ev)}
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
        )}
      </PageCard>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              イベントの削除
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              「{deleteTarget.name}」を削除しますか？<br />
              関連するチーム・メンバー・スコアもすべて削除されます。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                いいえ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {deleting ? "削除中..." : "はい"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
