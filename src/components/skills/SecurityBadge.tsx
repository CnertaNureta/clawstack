import { SecurityGrade, SECURITY_GRADES } from "@/lib/supabase/types";

interface SecurityBadgeProps {
  grade: SecurityGrade | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function SecurityBadge({
  grade,
  size = "md",
  showLabel = false,
}: SecurityBadgeProps) {
  if (!grade) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">
        Unrated
      </span>
    );
  }

  const gradeInfo = SECURITY_GRADES.find((g) => g.grade === grade);
  if (!gradeInfo) return null;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${gradeInfo.bgColor} ${gradeInfo.color} ${sizeClasses[size]}`}
      title={`Security Grade: ${grade} (${gradeInfo.label})`}
    >
      <svg className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5v-2h2v2h-2zm0-4v-6h2v6h-2z"/>
      </svg>
      <span>{grade}</span>
      {showLabel && (
        <span className="font-semibold">{gradeInfo.label}</span>
      )}
    </span>
  );
}
