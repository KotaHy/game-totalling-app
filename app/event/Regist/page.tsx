"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";

export default function EventRegistPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [executeDate, setExecuteDate] = useState(""); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBackToTop = () => {
    router.push("/top");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !executeDate) {
      setErrorMessage("イベント名と開催日を入力してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), execute_date: executeDate }),
      });

      const body = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error(body?.message ?? "登録に失敗しました");
      }

      router.push("/top");
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={() => router.push("/top")}
        onLogout={() => router.push("/")}
        onBackToTop={handleBackToTop}
      />

      <main className="flex flex-1 items-center justify-center px-6 py-6">
        <div className="w-full max-w-xl">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            イベント登録
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              イベント名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="イベント名を入力"
            />
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <label
              htmlFor="execute_date"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              開催日
            </label>
            <input
              id="execute_date"
              type="date"
              value={executeDate}
              onChange={(e) => setExecuteDate(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {errorMessage && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 w-full rounded-md bg-blue-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          >
            {loading ? "登録中..." : "登録"}
          </button>
          </form>
        </div>
      </main>
    </div>
  );
}

