import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const securityGrade = searchParams.get("security_grade");
  const sort = searchParams.get("sort") || "upvotes";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 100);
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase.from("skills").select("*", { count: "exact" });

  // Full-text search
  if (q) {
    query = query.textSearch("fts", q, { type: "websearch" });
  }

  // Category filter
  if (category) {
    query = query.eq("category", category);
  }

  // Security grade filter
  if (securityGrade) {
    query = query.eq("security_grade", securityGrade);
  }

  // Sorting
  switch (sort) {
    case "upvotes":
      query = query.order("upvotes", { ascending: false });
      break;
    case "security":
      query = query.order("security_score", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "trending":
      query = query.order("weekly_votes", { ascending: false });
      break;
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    default:
      query = query.order("upvotes", { ascending: false });
  }

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    skills: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
