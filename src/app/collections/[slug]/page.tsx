import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import type { Collection, Skill } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("title, description")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Collection Not Found" };

  return {
    title: data.title,
    description: data.description || `Curated OpenClaw skills: ${data.title}`,
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!collection) notFound();

  const typedCol = collection as Collection;

  // Fetch skills in this collection
  let skills: Skill[] = [];
  if (typedCol.skill_ids.length > 0) {
    const { data } = await supabase
      .from("skills")
      .select("*")
      .in("id", typedCol.skill_ids);
    skills = (data as Skill[]) || [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-5xl">{typedCol.cover_emoji}</span>
        <h1 className="mt-4 text-3xl font-bold text-foreground">
          {typedCol.title}
        </h1>
        {typedCol.description && (
          <p className="mt-2 text-lg text-muted">{typedCol.description}</p>
        )}
        <p className="mt-1 text-sm text-muted">{skills.length} skills</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {skills.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted">No skills in this collection yet.</p>
        </div>
      )}
    </div>
  );
}
