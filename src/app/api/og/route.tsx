import { ImageResponse } from "@vercel/og";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export const runtime = "edge";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const gradeColors: Record<string, string> = {
  S: "#059669",
  A: "#16a34a",
  B: "#ca8a04",
  C: "#ea580c",
  D: "#dc2626",
};

const gradeLabels: Record<string, string> = {
  S: "Excellent",
  A: "Good",
  B: "Fair",
  C: "Caution",
  D: "Risk",
};

const categoryEmoji: Record<string, string> = {
  communication: "💬",
  productivity: "⚡",
  "dev-tools": "🛠️",
  "smart-home": "🏠",
  finance: "💰",
  entertainment: "🎮",
  security: "🔒",
  "ai-models": "🤖",
  automation: "⚙️",
  social: "👥",
  other: "📦",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "skill";
  const slug = searchParams.get("slug") || "";
  const username = searchParams.get("username") || "";
  const quizId = searchParams.get("id") || "";

  const supabase = getSupabase();

  // === STACK OG IMAGE ===
  if (type === "stack" && username) {
    const { data: user } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url")
      .eq("username", username)
      .single();

    let skillCount = 0;
    let avgGrade = "";

    if (user) {
      const { data: stackItems } = await supabase
        .from("user_stacks")
        .select("skill_id")
        .eq("user_id", user.id);

      if (stackItems && stackItems.length > 0) {
        skillCount = stackItems.length;
        const skillIds = stackItems.map((s) => s.skill_id);
        const { data: skills } = await supabase
          .from("skills")
          .select("security_score")
          .in("id", skillIds);

        if (skills && skills.length > 0) {
          const avg =
            skills.reduce((sum, s) => sum + (s.security_score || 0), 0) /
            skills.length;
          avgGrade =
            avg >= 90 ? "S" : avg >= 75 ? "A" : avg >= 60 ? "B" : avg >= 40 ? "C" : "D";
        }
      }
    }

    const displayName = user?.display_name || username;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0b1120 0%, #0f172a 50%, #1e293b 100%)",
            fontFamily: "sans-serif",
            padding: "60px 80px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: 36 }}>🛡️</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#38bdf8" }}>
              ClawStack
            </span>
          </div>

          {/* Profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginTop: "auto",
            }}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                width={80}
                height={80}
                style={{ borderRadius: "50%", border: "3px solid #38bdf8" }}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 800,
                  color: "white",
                }}
              >
                {username[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: "white" }}>
                {displayName}&apos;s Stack
              </div>
              <div style={{ fontSize: 22, color: "#94a3b8", marginTop: 4 }}>
                @{username}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.2)",
                borderRadius: "12px",
                padding: "10px 24px",
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 800, color: "#38bdf8" }}>
                {skillCount}
              </span>
              <span style={{ fontSize: 18, color: "#94a3b8" }}>skills</span>
            </div>
            {avgGrade && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: gradeColors[avgGrade] + "20",
                  border: `1px solid ${gradeColors[avgGrade]}40`,
                  borderRadius: "12px",
                  padding: "10px 24px",
                }}
              >
                <span style={{ fontSize: 18, color: "#94a3b8" }}>Safety:</span>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: gradeColors[avgGrade],
                  }}
                >
                  {avgGrade}
                </span>
              </div>
            )}
            <div
              style={{
                fontSize: 16,
                color: "rgba(148,163,184,0.5)",
                marginLeft: "auto",
              }}
            >
              clawstack.sh/u/{username}
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // === QUIZ RESULT OG IMAGE ===
  if (type === "quiz" && quizId) {
    const { data: result } = await supabase
      .from("quiz_results")
      .select("role, platform, goal, recommended_skill_ids")
      .eq("id", quizId)
      .single();

    const skillCount = result?.recommended_skill_ids?.length || 0;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0b1120 0%, #1e1b4b 50%, #312e81 100%)",
            fontFamily: "sans-serif",
            padding: "60px 80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: 36 }}>🛡️</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#38bdf8" }}>
              ClawStack
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "auto",
            }}
          >
            <div style={{ fontSize: 22, color: "#a5b4fc" }}>
              Personalized Recommendation
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: "white",
                marginTop: 12,
              }}
            >
              {skillCount} Skills Picked For You
            </div>
            <div style={{ fontSize: 22, color: "#94a3b8", marginTop: 8 }}>
              {result?.role} • {result?.platform} • {result?.goal}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                background: "#6366f1",
                borderRadius: "12px",
                padding: "10px 24px",
                fontSize: 18,
                fontWeight: 700,
                color: "white",
              }}
            >
              Take the Quiz
            </div>
            <div
              style={{
                fontSize: 16,
                color: "rgba(148,163,184,0.5)",
                marginLeft: "auto",
              }}
            >
              clawstack.sh/quiz
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // === SKILL OG IMAGE (default) ===
  let skillName = searchParams.get("name") || "OpenClaw Skill";
  let skillGrade = searchParams.get("grade") || "";
  let skillCategory = searchParams.get("category") || "";
  let skillUpvotes = 0;
  let skillDescription = "";

  if (slug) {
    const { data: skill } = await supabase
      .from("skills")
      .select("name, description, category, security_grade, upvotes")
      .eq("slug", slug)
      .single();

    if (skill) {
      skillName = skill.name;
      skillGrade = skill.security_grade || "";
      skillCategory = skill.category || "";
      skillUpvotes = skill.upvotes || 0;
      skillDescription = skill.description || "";
    }
  }

  const emoji = categoryEmoji[skillCategory] || "📦";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0b1120 0%, #0f172a 50%, #1e293b 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: 36 }}>🛡️</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#38bdf8" }}>
            ClawStack
          </span>
        </div>

        {/* Skill info */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "900px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: 20, color: "#94a3b8" }}>
              {emoji} {skillCategory.replace("-", " ")}
            </span>
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "white",
              marginTop: 12,
              lineHeight: 1.1,
            }}
          >
            {skillName}
          </div>
          {skillDescription && (
            <div
              style={{
                fontSize: 22,
                color: "#94a3b8",
                marginTop: 12,
                lineHeight: 1.4,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {skillDescription.slice(0, 120)}
              {skillDescription.length > 120 ? "..." : ""}
            </div>
          )}
        </div>

        {/* Bottom stats */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", width: "100%" }}>
          {skillGrade && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: gradeColors[skillGrade] + "20",
                border: `1px solid ${gradeColors[skillGrade]}40`,
                borderRadius: "12px",
                padding: "10px 24px",
              }}
            >
              <span style={{ fontSize: 16, color: "#94a3b8" }}>Security:</span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: gradeColors[skillGrade],
                }}
              >
                {skillGrade}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: gradeColors[skillGrade],
                  opacity: 0.8,
                }}
              >
                {gradeLabels[skillGrade]}
              </span>
            </div>
          )}
          {skillUpvotes > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: 20,
                color: "#94a3b8",
              }}
            >
              <span style={{ color: "#38bdf8", fontWeight: 700 }}>▲</span>
              <span style={{ fontWeight: 700, color: "white" }}>
                {skillUpvotes}
              </span>
              <span>upvotes</span>
            </div>
          )}
          <div
            style={{
              fontSize: 16,
              color: "rgba(148,163,184,0.5)",
              marginLeft: "auto",
            }}
          >
            clawstack.sh/skills/{slug}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
