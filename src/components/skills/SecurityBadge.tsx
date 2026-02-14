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
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
        Unrated
      </span>
    );
  }

  const gradeInfo = SECURITY_GRADES.find((g) => g.grade === grade);
  if (!gradeInfo) return null;

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-bold ${gradeInfo.bgColor} ${gradeInfo.color} ${sizeClasses[size]}`}
      title={`Security Grade: ${grade} (${gradeInfo.label})`}
    >
      <span>🛡️</span>
      <span>{grade}</span>
      {showLabel && (
        <span className="font-medium">{gradeInfo.label}</span>
      )}
    </span>
  );
}
