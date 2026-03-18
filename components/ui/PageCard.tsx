import { ReactNode } from "react";

interface PageCardProps {
  children: ReactNode;
  className?: string;
}

export default function PageCard({ children, className }: PageCardProps) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
