"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string; // URLからユーザーIDを取得

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/users?id=${userId}`);

      if (res.ok) {
        const data = await res.json();
        // APIのレスポンス形式に合わせて柔軟に取得
        // 1. data.users.user_name のパターン
        // 2. data.user_name のパターン
        const fetchedName = data.user.user_name
        if (fetchedName) {
          setUsername(fetchedName);
        } else {
          setErrorMessage("ユーザー情報が見つかりませんでした");
        }
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body.message ?? "ユーザー情報の取得に失敗しました");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username) {
      setErrorMessage("ユーザー名は必須です");
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMessage("パスワードと確認用パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const body: { id: string; username: string; password?: string } = { id: userId, username };
      if (password) {
        body.password = password;
      }

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccessMessage("ユーザー情報が更新されました");
        setPassword("");
        setConfirmPassword("");
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body.message ?? "ユーザー情報の更新に失敗しました");
      }
    } catch (err) {
      setErrorMessage("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 読み込み中の表示（エラーがない場合のみ）
  if (loading && !username && !errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-700 dark:text-zinc-300">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center px-8 bg-white dark:bg-black">
        <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
          ユーザー情報編集
        </h1>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="ユーザー名を入力"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              新しいパスワード (変更しない場合は空欄)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="新しいパスワードを入力"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              新しいパスワード (確認)
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="新しいパスワードを再入力"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-500 bg-green-50 dark:bg-green-950/30 p-2 rounded">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-md bg-blue-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          >
            {loading ? "更新中..." : "更新"}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              戻る
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}