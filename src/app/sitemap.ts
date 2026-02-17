import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/supabase/types";

const GRADES = ["s", "a", "b", "c", "d"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack.sh";
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/skills`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/quiz`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/security`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Category landing pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${baseUrl}/categories/${c.value}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Grade landing pages
  const gradePages: MetadataRoute.Sitemap = GRADES.map((g) => ({
    url: `${baseUrl}/grade/${g}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // All skill pages (paginated to bypass Supabase 1000-row default limit)
  const allSkills: { slug: string; updated_at: string }[] = [];
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    const { data } = await supabase
      .from("skills")
      .select("slug, updated_at")
      .range(from, from + PAGE_SIZE - 1);
    if (!data || data.length === 0) break;
    allSkills.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const skillPages: MetadataRoute.Sitemap = allSkills.map((skill) => ({
    url: `${baseUrl}/skills/${skill.slug}`,
    lastModified: new Date(skill.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Collection pages
  const { data: collections } = await supabase
    .from("collections")
    .select("slug, created_at");

  const collectionPages: MetadataRoute.Sitemap = (collections || []).map(
    (col) => ({
      url: `${baseUrl}/collections/${col.slug}`,
      lastModified: new Date(col.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })
  );

  // User stack pages
  const { data: users } = await supabase.from("users").select("username");

  const userPages: MetadataRoute.Sitemap = (users || []).map((user) => ({
    url: `${baseUrl}/u/${user.username}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...gradePages, ...skillPages, ...collectionPages, ...userPages];
}
