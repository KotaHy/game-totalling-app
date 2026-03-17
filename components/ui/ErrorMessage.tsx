interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export default function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <p className={`text-sm text-red-600 dark:text-red-400${className ? ` ${className}` : ""}`}>
      {message}
    </p>
  );
}
