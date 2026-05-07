interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null
  return <div className="rounded-md border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-ink">{message}</div>
}
