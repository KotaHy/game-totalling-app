"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!username || !password) {
            setErrorMessage("ユーザー名とパスワードを入力してください");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                // ログイン成功
                const data = await res.json();
                if (data.userId) {
                    localStorage.setItem("userId", data.userId); // userId を保存
                }
                router.push("/top");
                router.refresh();
            } else {
                const body = await res.json().catch(() => ({}));
                setErrorMessage(body.message ?? "ログインに失敗しました");
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
                    ログイン
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
                        {loading ? "ログイン中..." : "ログイン"}
                    </button>
                    <div className="mt-4 text-center">
                        <a href="/users" className="text-sm text-blue-600 hover:underline">
                            新規登録
                        </a>
                    </div>
                </form>
            </main>
        </div>
    );
}