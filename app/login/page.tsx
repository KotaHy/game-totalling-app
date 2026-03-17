"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/ui/FormField";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SubmitButton from "@/components/ui/SubmitButton";

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
                const data = await res.json();
                if (data.userId) {
                    localStorage.setItem("userId", data.userId);
                }
                router.push("/top");
                router.refresh();
            } else {
                const body = await res.json().catch(() => ({}));
                setErrorMessage(body.message ?? "ログインに失敗しました");
            }
        } catch {
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
                    <FormField
                        id="username"
                        label="ユーザー名"
                        value={username}
                        onChange={setUsername}
                        placeholder="ユーザー名を入力"
                    />
                    <FormField
                        id="password"
                        label="パスワード"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="パスワードを入力"
                    />

                    <ErrorMessage message={errorMessage} />

                    <SubmitButton loading={loading} loadingLabel="ログイン中..." fullWidth className="mt-2 h-11">
                        ログイン
                    </SubmitButton>

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
