"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/TopHeader";

export default function Top() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleGoToMyPage = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/users/${userId}/edit`);
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsAdmin(userId === "1");
  }, []);

  const handleSearchUserTasks = () => {
    if (!isAdmin) {
      return;
    }
    router.push("/top/user-tasks");
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
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={handleGoToMyPage}
        onLogout={handleLogout}
        onSearchUserTasks={handleSearchUserTasks}
        isAdmin={isAdmin}
      />
    </div>
  );
}
