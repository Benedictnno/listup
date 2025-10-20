import { CheckCircle, Clock, XCircle } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const statusClasses = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  } as const;

  const statusIcons = {
    PENDING: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle,
  } as const;

  const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || "bg-gray-100 text-gray-800"}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}