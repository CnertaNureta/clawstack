import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack.dev";
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/skills`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/quiz`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  // All skill pages
  const { data: skills } = await supabase
    .from("skills")
    .select("slug, updated_at");

  const skillPages: MetadataRoute.Sitemap = (skills || []).map((skill) => ({
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

  return [...staticPages, ...skillPages, ...collectionPages, ...userPages];
}
