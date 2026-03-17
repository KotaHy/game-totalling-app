"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import PageCard from "@/components/ui/PageCard";
import FormField from "@/components/ui/FormField";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SubmitButton from "@/components/ui/SubmitButton";

export default function EventRegistPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [executeDate, setExecuteDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    <PageLayout
      onMyPage={() => router.push("/top")}
      onLogout={() => router.push("/")}
      onBackToTop={() => router.push("/top")}
      mainClassName="flex flex-1 items-center justify-center px-6 py-6"
    >
      <div className="w-full max-w-xl">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          イベント登録
        </h1>

        <form onSubmit={handleSubmit}>
          <PageCard className="mt-4 flex flex-col gap-4">
            <FormField
              id="name"
              label="イベント名"
              value={name}
              onChange={setName}
              placeholder="イベント名を入力"
            />
            <FormField
              id="execute_date"
              label="開催日"
              type="date"
              value={executeDate}
              onChange={setExecuteDate}
            />

            <ErrorMessage message={errorMessage} />

            <SubmitButton loading={loading} loadingLabel="登録中..." fullWidth className="h-11 mt-2">
              登録
            </SubmitButton>
          </PageCard>
        </form>
      </div>
    </PageLayout>
  );
}
