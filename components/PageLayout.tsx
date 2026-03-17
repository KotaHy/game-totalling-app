import { ReactNode } from "react";
import TopHeader from "@/components/TopHeader";

interface PageLayoutProps {
  children: ReactNode;
  mainClassName?: string;
  // TopHeader props
  onMyPage: () => void;
  onLogout: () => void;
  onEventRegist?: () => void;
  onSearchUserTasks?: () => void;
  isAdmin?: boolean;
  onBackToTop?: () => void;
}

export default function PageLayout({
  children,
  mainClassName = "flex-1 px-6 py-6",
  onMyPage,
  onLogout,
  onEventRegist,
  onSearchUserTasks,
  isAdmin,
  onBackToTop,
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <TopHeader
        onMyPage={onMyPage}
        onLogout={onLogout}
        onEventRegist={onEventRegist}
        onSearchUserTasks={onSearchUserTasks}
        isAdmin={isAdmin}
        onBackToTop={onBackToTop}
      />
      <main className={mainClassName}>{children}</main>
    </div>
  );
}
