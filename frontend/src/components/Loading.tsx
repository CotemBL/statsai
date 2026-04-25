export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-text-muted">
      <div className="animate-pulse">{label}</div>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="card p-6 border-accent-red/40 text-accent-red">
      Error: {message}
    </div>
  );
}
