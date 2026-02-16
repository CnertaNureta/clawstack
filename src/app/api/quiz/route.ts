import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// Map user answers to skill categories and tags
const roleCategories: Record<string, string[]> = {
  developer: ["dev-tools", "automation"],
  creator: ["social", "entertainment"],
  operations: ["productivity", "communication"],
  general: ["smart-home", "finance", "other"],
};

const goalCategories: Record<string, string[]> = {
  email: ["communication"],
  calendar: ["productivity"],
  code: ["dev-tools"],
  "social-media": ["social"],
  data: ["automation"],
  security: ["security"],
};

export async function POST(request: NextRequest) {
  const { role, platform, goal } = await request.json();

  if (!role || !platform || !goal) {
    return NextResponse.json(
      { error: "role, platform, and goal are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Build category list from role + goal
  const categories = new Set<string>();
  (roleCategories[role] || []).forEach((c) => categories.add(c));
  (goalCategories[goal] || []).forEach((c) => categories.add(c));

  // Query skills matching categories, safe grades only
  let query = supabase
    .from("skills")
    .select("id, slug, name, description, category, security_grade, security_score, upvotes, tags")
    .in("category", Array.from(categories))
    .in("security_grade", ["S", "A", "B"])
    .order("upvotes", { ascending: false });

  // Filter by platform tag if specific
  if (platform !== "general") {
    query = query.contains("tags", [platform]);
  }

  const { data: tagMatched } = await query.limit(8);

  let skills = tagMatched || [];

  // If not enough results with tag filter, broaden search
  if (skills.length < 4) {
    const { data: broader } = await supabase
      .from("skills")
      .select("id, slug, name, description, category, security_grade, security_score, upvotes, tags")
      .in("category", Array.from(categories))
      .in("security_grade", ["S", "A", "B"])
      .order("upvotes", { ascending: false })
      .limit(8);

    // Merge, deduplicate
    const existingIds = new Set(skills.map((s) => s.id));
    for (const s of broader || []) {
      if (!existingIds.has(s.id)) {
        skills.push(s);
        existingIds.add(s.id);
      }
      if (skills.length >= 8) break;
    }
  }

  // If still not enough, get top safe skills regardless of category
  if (skills.length < 4) {
    const { data: fallback } = await supabase
      .from("skills")
      .select("id, slug, name, description, category, security_grade, security_score, upvotes, tags")
      .in("security_grade", ["S", "A"])
      .order("upvotes", { ascending: false })
      .limit(8);

    const existingIds = new Set(skills.map((s) => s.id));
    for (const s of fallback || []) {
      if (!existingIds.has(s.id)) {
        skills.push(s);
        existingIds.add(s.id);
      }
      if (skills.length >= 8) break;
    }
  }

  const recommendedIds = skills.map((s) => s.id);

  // Save quiz result
  const { data: result, error } = await supabase
    .from("quiz_results")
    .insert({
      role,
      platform,
      goal,
      recommended_skill_ids: recommendedIds,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: result.id, skills });
}
