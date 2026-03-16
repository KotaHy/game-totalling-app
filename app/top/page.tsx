"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";

type EventRow = {
  id: number | string;
  name: string | null;
  execute_date: string | null;
};

export default function Top() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string>("");

  const handleGoToMyPage = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/users/${userId}/edit`);
    } else {
      router.push("/login");
    }
  };

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
          setEventsError(e instanceof Error ? e.message : "イベント取得に失敗しました");
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

  const handleSearchUserTasks = () => {
    if (!isAdmin) {
      return;
    }
    router.push("/top/user-tasks");
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

  const handleEventRegist = () => {
    router.push("/event/Regist");
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={handleGoToMyPage}
        onLogout={handleLogout}
        onEventRegist={handleEventRegist}
        onSearchUserTasks={handleSearchUserTasks}
        isAdmin={isAdmin}
      />

      <main className="flex-1 px-6 py-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          イベント一覧
        </h1>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          {loadingEvents ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              読み込み中...
            </p>
          ) : eventsError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {eventsError}
            </p>
          ) : events.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              イベントがありません
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200">
                      イベントID
                    </th>
                    <th className="py-2 pr-4 text-left font-medium text-zinc-700 dark:text-zinc-200">
                      イベント名
                    </th>
                    <th className="py-2 text-left font-medium text-zinc-700 dark:text-zinc-200">
                      開催日
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr
                      key={String(ev.id)}
                      className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
                    >
                      <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">
                        {String(ev.id)}
                      </td>
                      <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">
                        {ev.name ?? ""}
                      </td>
                      <td className="py-2 text-zinc-900 dark:text-zinc-50">
                        {ev.execute_date ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
