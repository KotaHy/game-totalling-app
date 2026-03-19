"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/ui/FormField";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SubmitButton from "@/components/ui/SubmitButton";

export default function EditUserPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username) {
      setErrorMessage("ユーザー名は必須です");
      return;
    }
    if (!password) {
      setErrorMessage("パスワードは必須です");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("パスワードと確認用パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(body.message ?? "パスワードの更新に失敗しました");
        return;
      }

      setSuccessMessage("パスワードが更新されました");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
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
          パスワード変更
        </h1>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <FormField
            id="username"
            label="ユーザー名"
            value={username}
            onChange={setUsername}
            placeholder="ユーザー名を入力"
            disabled={loading}
          />
          <FormField
            id="password"
            label="新しいパスワード"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="新しいパスワードを入力"
            disabled={loading}
            autoComplete="new-password"
          />
          <FormField
            id="confirmPassword"
            label="新しいパスワード（確認）"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="新しいパスワードを再入力"
            disabled={loading}
            autoComplete="new-password"
          />

          <ErrorMessage message={errorMessage} />

          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </p>
          )}

          <SubmitButton loading={loading} loadingLabel="更新中..." fullWidth className="mt-2 h-11">
            更新
          </SubmitButton>

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
