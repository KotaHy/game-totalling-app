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
                    <td className={TD_CLASS}>
                      <Link
                        href={`/event/${encodeURIComponent(String(ev.id))}/score`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {String(ev.id)}
                      </Link>
                    </td>
                    <td className={TD_CLASS}>{ev.name ?? ""}</td>
                    <td className="py-2 text-zinc-900 dark:text-zinc-50">
                      {ev.execute_date ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </PageLayout>
  );
}
