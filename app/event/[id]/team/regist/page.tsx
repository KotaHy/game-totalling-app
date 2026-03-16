"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";

type TeamFormRow = {
  name: string;
  leader: string;
  member1: string;
  member2: string;
};

export default function TeamRegistPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params?.id;

  const [rows, setRows] = useState<TeamFormRow[]>([
    { name: "", leader: "", member1: "", member2: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange =
    (index: number, field: keyof TeamFormRow) =>
      (value: string) => {
        setRows((prev) =>
          prev.map((r, i) =>
            i === index
              ? {
                ...r,
                [field]: value,
              }
              : r
          )
        );
      };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { name: "", leader: "", member1: "", member2: "" },
    ]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setErrorMessage("");
    setSubmitting(true);
    try {
      const payload = {
        teams: rows.filter((r) => r.name.trim() !== ""),
      };
      if (payload.teams.length === 0) {
        setErrorMessage("少なくとも1つのチーム名を入力してください");
        setSubmitting(false);
        return;
      }

      const res = await fetch(
        `/api/events/${encodeURIComponent(String(eventId))}/teams`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error(body?.message ?? "チーム登録に失敗しました");
      }

      router.push(
        `/event/${encodeURIComponent(String(eventId))}/score`
      );
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "チーム登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={() => router.push("/top")}
        onLogout={() => router.push("/")}
        onBackToTop={() =>
          router.push(
            `/event/${encodeURIComponent(String(eventId))}/score`
          )
        }
      />

      <main className="flex-1 px-3 pb-3 pt-16 sm:px-6 sm:pb-4 sm:pt-20">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            チーム登録
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                <div className="w-1/4">チーム名</div>
                <div className="w-1/4">チームリーダー</div>
                <div className="w-1/4">メンバー1</div>
                <div className="w-1/4">メンバー2</div>
              </div>
              {rows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    className="w-1/4 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    value={row.name}
                    onChange={(e) => handleChange(idx, "name")(e.target.value)}
                    placeholder="チーム名"
                  />
                  <input
                    type="text"
                    className="w-1/4 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    value={row.leader}
                    onChange={(e) =>
                      handleChange(idx, "leader")(e.target.value)
                    }
                    placeholder="チームリーダー"
                  />
                  <input
                    type="text"
                    className="w-1/4 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    value={row.member1}
                    onChange={(e) =>
                      handleChange(idx, "member1")(e.target.value)
                    }
                    placeholder="メンバー1"
                  />
                  <input
                    type="text"
                    className="w-1/4 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    value={row.member2}
                    onChange={(e) =>
                      handleChange(idx, "member2")(e.target.value)
                    }
                    placeholder="メンバー2"
                  />
                </div>
              ))}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-lg font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  ＋
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
              >
                {submitting ? "登録中..." : "登録"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

