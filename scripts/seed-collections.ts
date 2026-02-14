/**
 * Seed curated collections based on imported skills data
 *
 * Usage:
 *   npx tsx scripts/seed-collections.ts
 */

import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CollectionDef {
  slug: string;
  title: string;
  description: string;
  cover_emoji: string;
  query: { field: string; value: string; sort: string; limit: number };
  sort_order: number;
  is_featured: boolean;
}

const COLLECTIONS: CollectionDef[] = [
  {
    slug: "safest-skills",
    title: "Safest OpenClaw Skills (Grade S)",
    description: "Skills with the highest security scores. Thoroughly analyzed and community-verified.",
    cover_emoji: "🛡️",
    query: { field: "security_grade", value: "S", sort: "upvotes", limit: 30 },
    sort_order: 1,
    is_featured: true,
  },
  {
    slug: "best-for-developers",
    title: "Best Skills for Developers",
    description: "GitHub, Docker, terminal, APIs — everything a developer needs from their AI agent.",
    cover_emoji: "💻",
    query: { field: "category", value: "dev-tools", sort: "upvotes", limit: 20 },
    sort_order: 2,
    is_featured: true,
  },
  {
    slug: "communication-essentials",
    title: "Essential Communication Skills",
    description: "Connect OpenClaw to WhatsApp, Slack, Discord, Telegram, and more.",
    cover_emoji: "💬",
    query: { field: "category", value: "communication", sort: "upvotes", limit: 20 },
    sort_order: 3,
    is_featured: true,
  },
  {
    slug: "ai-model-integrations",
    title: "AI Model Integrations",
    description: "Use GPT, Claude, Llama, Gemini, and other LLMs within your OpenClaw agent.",
    cover_emoji: "🤖",
    query: { field: "category", value: "ai-models", sort: "upvotes", limit: 20 },
    sort_order: 4,
    is_featured: false,
  },
  {
    slug: "productivity-powerpack",
    title: "Productivity Powerpack",
    description: "Calendar, notes, tasks, reminders — automate your daily workflow.",
    cover_emoji: "⚡",
    query: { field: "category", value: "productivity", sort: "upvotes", limit: 20 },
    sort_order: 5,
    is_featured: false,
  },
  {
    slug: "smart-home-automation",
    title: "Smart Home Automation",
    description: "Control your smart home devices through your OpenClaw agent.",
    cover_emoji: "🏠",
    query: { field: "category", value: "smart-home", sort: "upvotes", limit: 20 },
    sort_order: 6,
    is_featured: false,
  },
  {
    slug: "finance-crypto",
    title: "Finance & Crypto Skills",
    description: "Track portfolios, monitor markets, and manage your financial data.",
    cover_emoji: "💰",
    query: { field: "category", value: "finance", sort: "upvotes", limit: 20 },
    sort_order: 7,
    is_featured: false,
  },
  {
    slug: "automation-workflow",
    title: "Automation & Workflow",
    description: "Cron jobs, webhooks, scrapers — automate everything.",
    cover_emoji: "⚙️",
    query: { field: "category", value: "automation", sort: "upvotes", limit: 20 },
    sort_order: 8,
    is_featured: false,
  },
  {
    slug: "social-media-tools",
    title: "Social Media Tools",
    description: "Post, monitor, and engage on Twitter, Reddit, LinkedIn, and more.",
    cover_emoji: "📱",
    query: { field: "category", value: "social", sort: "upvotes", limit: 20 },
    sort_order: 9,
    is_featured: false,
  },
  {
    slug: "security-privacy",
    title: "Security & Privacy Tools",
    description: "Password managers, VPN controls, encryption, and 2FA management.",
    cover_emoji: "🔒",
    query: { field: "category", value: "security", sort: "upvotes", limit: 20 },
    sort_order: 10,
    is_featured: false,
  },
  {
    slug: "entertainment",
    title: "Entertainment & Fun",
    description: "Spotify, YouTube, games — make your agent your entertainment buddy.",
    cover_emoji: "🎮",
    query: { field: "category", value: "entertainment", sort: "upvotes", limit: 20 },
    sort_order: 11,
    is_featured: false,
  },
  {
    slug: "most-popular-all-time",
    title: "Most Popular (All Time)",
    description: "The most upvoted and used OpenClaw skills of all time.",
    cover_emoji: "🏆",
    query: { field: "", value: "", sort: "upvotes", limit: 30 },
    sort_order: 12,
    is_featured: true,
  },
  {
    slug: "rising-this-week",
    title: "Rising This Week",
    description: "Skills gaining the most traction this week.",
    cover_emoji: "📈",
    query: { field: "", value: "", sort: "weekly_votes", limit: 20 },
    sort_order: 13,
    is_featured: false,
  },
  {
    slug: "new-arrivals",
    title: "New Arrivals",
    description: "The freshest skills just published to the ecosystem.",
    cover_emoji: "✨",
    query: { field: "", value: "", sort: "created_at", limit: 20 },
    sort_order: 14,
    is_featured: false,
  },
];

async function main() {
  console.log("=== Seeding Collections ===\n");

  // Clear existing collections
  await supabase.from("collections").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  for (const col of COLLECTIONS) {
    // Query skills for this collection
    let query = supabase.from("skills").select("id");

    if (col.query.field && col.query.value) {
      query = query.eq(col.query.field, col.query.value);
    }

    query = query.order(col.query.sort, { ascending: false }).limit(col.query.limit);

    const { data: skills, error } = await query;

    if (error) {
      console.error(`  Error querying for "${col.title}":`, error.message);
      continue;
    }

    const skillIds = (skills || []).map((s) => s.id);

    const { error: insertError } = await supabase.from("collections").insert({
      slug: col.slug,
      title: col.title,
      description: col.description,
      cover_emoji: col.cover_emoji,
      skill_ids: skillIds,
      sort_order: col.sort_order,
      is_featured: col.is_featured,
    });

    if (insertError) {
      console.error(`  Error inserting "${col.title}":`, insertError.message);
    } else {
      console.log(`  ✓ ${col.title} — ${skillIds.length} skills`);
    }
  }

  // Verify
  const { count } = await supabase.from("collections").select("*", { count: "exact", head: true });
  console.log(`\nDone! ${count} collections created.`);
}

main().catch(console.error);
