"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("ユーザー名とパスワードを入力してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // 登録成功
        setShowModal(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body.message ?? "ユーザー登録に失敗しました");
      }
    } catch (err) {
      setErrorMessage("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex min-h-screen w-full max-w-md flex-col items-center justify-center px-8 bg-white dark:bg-black">
        <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
          新規登録
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
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="パスワードを入力"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-md bg-blue-600 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          >
            {loading ? "登録中..." : "登録"}
          </button>
          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              ログイン画面に戻る
            </a>
          </div>
        </form>
      </main>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-50 mb-2">
                登録完了
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
                ユーザー登録が完了しました。<br />ログインしてください。
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

