import { ReactNode } from "react";

interface SubmitButtonProps {
  loading: boolean;
  loadingLabel?: string;
  children: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function SubmitButton({
  loading,
  loadingLabel = "処理中...",
  children,
  disabled,
  fullWidth,
  className,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black${fullWidth ? " w-full" : ""}${className ? ` ${className}` : ""}`}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
