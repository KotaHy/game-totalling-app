"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import PageCard from "@/components/ui/PageCard";
import ErrorMessage from "@/components/ui/ErrorMessage";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EventTable, { EventRow } from "@/components/event/EventTable";

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
      const res = await fetch(
        `/api/events/${encodeURIComponent(String(deleteTarget.id))}`,
        { method: "DELETE" }
      );
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
          <EventTable events={events} onDeleteClick={setDeleteTarget} />
        )}
      </PageCard>

      {deleteTarget && (
        <ConfirmModal
          title="イベントの削除"
          message={
            <>
              「{deleteTarget.name}」を削除しますか？<br />
              関連するチーム・メンバー・スコアもすべて削除されます。
            </>
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </PageLayout>
  );
}
