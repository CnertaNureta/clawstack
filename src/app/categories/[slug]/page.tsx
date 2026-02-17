import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { Skill, CATEGORIES, Category } from "@/lib/supabase/types";

const CATEGORY_SEO: Record<
  Category,
  { title: string; description: string; h1: string }
> = {
  communication: {
    title: "Best OpenClaw Communication Skills",
    description:
      "Connect your AI agent to WhatsApp, Slack, Discord, Telegram, and more. Browse top-rated communication skills with security ratings.",
    h1: "Best Communication Skills for OpenClaw",
  },
  productivity: {
    title: "Best OpenClaw Productivity Skills",
    description:
      "Automate your daily workflow with calendar, notes, tasks, and reminder skills. Trusted productivity integrations with security scores.",
    h1: "Best Productivity Skills for OpenClaw",
  },
  "dev-tools": {
    title: "Best OpenClaw Developer Tools",
    description:
      "GitHub, Docker, terminal, APIs — the best developer tool skills for OpenClaw agents. Security-rated and community-reviewed.",
    h1: "Best Developer Tool Skills for OpenClaw",
  },
  "smart-home": {
    title: "Best OpenClaw Smart Home Skills",
    description:
      "Control your smart home devices through your AI agent. Browse security-rated smart home automation skills.",
    h1: "Best Smart Home Skills for OpenClaw",
  },
  finance: {
    title: "Best OpenClaw Finance & Crypto Skills",
    description:
      "Track portfolios, monitor markets, and manage financial data with trusted OpenClaw skills. All security-rated.",
    h1: "Best Finance & Crypto Skills for OpenClaw",
  },
  entertainment: {
    title: "Best OpenClaw Entertainment Skills",
    description:
      "Spotify, YouTube, games — make your AI agent your entertainment buddy. Browse safe, rated entertainment skills.",
    h1: "Best Entertainment Skills for OpenClaw",
  },
  security: {
    title: "Best OpenClaw Security & Privacy Skills",
    description:
      "Password managers, VPN controls, encryption, and 2FA management. Trusted security skills for your AI agent.",
    h1: "Best Security & Privacy Skills for OpenClaw",
  },
  "ai-models": {
    title: "Best OpenClaw AI Model Integrations",
    description:
      "Use GPT, Claude, Llama, Gemini, and other LLMs within your OpenClaw agent. Browse top-rated AI model skills.",
    h1: "Best AI Model Integration Skills for OpenClaw",
  },
  automation: {
    title: "Best OpenClaw Automation & Workflow Skills",
    description:
      "Cron jobs, webhooks, scrapers — automate everything with trusted OpenClaw skills. All security-scored.",
    h1: "Best Automation & Workflow Skills for OpenClaw",
  },
  social: {
    title: "Best OpenClaw Social Media Skills",
    description:
      "Post, monitor, and engage on Twitter, Reddit, LinkedIn, and more through your AI agent. Security-rated social skills.",
    h1: "Best Social Media Skills for OpenClaw",
  },
  other: {
    title: "Other OpenClaw Skills",
    description:
      "Explore miscellaneous OpenClaw skills that don't fit a single category. All security-rated and community-reviewed.",
    h1: "Other OpenClaw Skills",
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.value }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seo = CATEGORY_SEO[slug as Category];
  if (!seo) return {};

  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = slug as Category;
  const seo = CATEGORY_SEO[category];
  const categoryInfo = CATEGORIES.find((c) => c.value === category);

  if (!seo || !categoryInfo) notFound();

  const supabase = await createClient();

  const { data: skills, count } = await supabase
    .from("skills")
    .select("*", { count: "exact" })
    .eq("category", category)
    .order("upvotes", { ascending: false })
    .limit(48);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack.sh";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.title,
    description: seo.description,
    url: `${baseUrl}/categories/${slug}`,
    isPartOf: { "@type": "WebSite", name: "ClawStack", url: baseUrl },
    numberOfItems: count || 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/skills" className="hover:text-foreground">
          Skills
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{categoryInfo.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {categoryInfo.emoji} {seo.h1}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">{seo.description}</p>
        <p className="mt-1 text-sm text-muted">
          {count ?? 0} skills in this category
        </p>
      </div>

      {/* Grid */}
      {skills && skills.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(skills as Skill[]).map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} rank={i < 3 ? i + 1 : undefined} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-lg text-muted">No skills found in this category.</p>
        </div>
      )}

      {/* See more CTA */}
      {(count || 0) > 48 && (
        <div className="mt-8 text-center">
          <Link
            href={`/skills?category=${category}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            View all {count} {categoryInfo.label} skills
          </Link>
        </div>
      )}

      {/* Related categories */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Browse Other Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.value !== category).map((c) => (
            <Link
              key={c.value}
              href={`/categories/${c.value}`}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
