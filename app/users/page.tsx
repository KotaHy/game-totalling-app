"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/ui/FormField";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SubmitButton from "@/components/ui/SubmitButton";

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
        setShowModal(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body.message ?? "ユーザー登録に失敗しました");
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
          新規登録
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

          <SubmitButton loading={loading} loadingLabel="登録中..." fullWidth className="mt-2 h-11">
            登録
          </SubmitButton>

          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              ログイン画面に戻る
            </a>
          </div>
        </form>
      </main>

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
