import type { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: "purple" | "green" | "red" | "yellow" | "blue";
}

const accentMap: Record<string, string> = {
  purple: "from-accent-purple/20 to-transparent border-accent-purple/30",
  green: "from-accent-green/20 to-transparent border-accent-green/30",
  red: "from-accent-red/20 to-transparent border-accent-red/30",
  yellow: "from-accent-yellow/20 to-transparent border-accent-yellow/30",
  blue: "from-accent-blue/20 to-transparent border-accent-blue/30",
};

export default function StatBox({ label, value, hint, accent = "purple" }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 bg-gradient-to-br ${accentMap[accent]}`}
    >
      <div className="stat-label">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-text-muted mt-1">{hint}</div>}
    </div>
  );
}
