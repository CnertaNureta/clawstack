export type SecurityGrade = "S" | "A" | "B" | "C" | "D";

export type Category =
  | "communication"
  | "productivity"
  | "dev-tools"
  | "smart-home"
  | "finance"
  | "entertainment"
  | "security"
  | "ai-models"
  | "automation"
  | "social"
  | "other";

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: Category;
  tags: string[];
  author_github: string | null;
  author_name: string | null;
  repo_url: string | null;
  install_command: string | null;
  clawhub_url: string | null;
  skill_md_content: string | null;
  security_grade: SecurityGrade | null;
  security_score: number;
  security_details: Record<string, number>;
  upvotes: number;
  downvotes: number;
  avg_rating: number;
  review_count: number;
  weekly_votes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  github_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  skill_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user?: User;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_emoji: string;
  skill_ids: string[];
  sort_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface QuizResult {
  id: string;
  role: string | null;
  platform: string | null;
  goal: string | null;
  recommended_skill_ids: string[];
  created_at: string;
}

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "communication", label: "Communication", emoji: "💬" },
  { value: "productivity", label: "Productivity", emoji: "⚡" },
  { value: "dev-tools", label: "Dev Tools", emoji: "🛠️" },
  { value: "smart-home", label: "Smart Home", emoji: "🏠" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "entertainment", label: "Entertainment", emoji: "🎮" },
  { value: "security", label: "Security", emoji: "🔒" },
  { value: "ai-models", label: "AI Models", emoji: "🤖" },
  { value: "automation", label: "Automation", emoji: "⚙️" },
  { value: "social", label: "Social", emoji: "👥" },
  { value: "other", label: "Other", emoji: "📦" },
];

export const SECURITY_GRADES: {
  grade: SecurityGrade;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  { grade: "S", label: "Excellent", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  { grade: "A", label: "Good", color: "text-green-700", bgColor: "bg-green-100" },
  { grade: "B", label: "Fair", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  { grade: "C", label: "Caution", color: "text-orange-700", bgColor: "bg-orange-100" },
  { grade: "D", label: "Risk", color: "text-red-700", bgColor: "bg-red-100" },
];
