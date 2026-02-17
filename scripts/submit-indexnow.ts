/**
 * Submit URLs to search engines via IndexNow protocol.
 * Works with Bing, Yandex, Seznam, Naver, and others.
 *
 * Usage:
 *   npx tsx scripts/submit-indexnow.ts
 */

import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack-phi.vercel.app";
const INDEXNOW_KEY = "fe86810d48b55ee78919c7860d0ccbc5";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getAllUrls(): Promise<string[]> {
  const urls: string[] = [
    SITE_URL,
    `${SITE_URL}/skills`,
    `${SITE_URL}/trending`,
    `${SITE_URL}/collections`,
    `${SITE_URL}/quiz`,
    `${SITE_URL}/security`,
  ];

  // Category pages
  const categories = [
    "communication", "productivity", "dev-tools", "smart-home",
    "finance", "entertainment", "security", "other",
  ];
  for (const c of categories) {
    urls.push(`${SITE_URL}/categories/${c}`);
  }

  // Grade pages
  for (const g of ["s", "a", "b", "c", "d"]) {
    urls.push(`${SITE_URL}/grade/${g}`);
  }

  // All skills (paginated)
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data } = await supabase
      .from("skills")
      .select("slug")
      .range(from, from + PAGE_SIZE - 1);
    if (!data || data.length === 0) break;
    for (const s of data) {
      urls.push(`${SITE_URL}/skills/${s.slug}`);
    }
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  // Collections
  const { data: collections } = await supabase
    .from("collections")
    .select("slug");
  for (const c of collections || []) {
    urls.push(`${SITE_URL}/collections/${c.slug}`);
  }

  return urls;
}

async function submitBatch(urls: string[], engine: string): Promise<void> {
  // IndexNow allows max 10,000 URLs per request
  const BATCH_SIZE = 10000;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const body = {
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: batch,
    };

    const res = await fetch(`https://${engine}/indexnow`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });

    console.log(
      `  ${engine}: batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs) → HTTP ${res.status} ${res.statusText}`
    );
  }
}

async function main() {
  console.log("Collecting URLs...");
  const urls = await getAllUrls();
  console.log(`Total URLs: ${urls.length}\n`);

  const engines = ["api.indexnow.org", "www.bing.com", "yandex.com"];

  for (const engine of engines) {
    console.log(`Submitting to ${engine}...`);
    await submitBatch(urls, engine);
  }

  console.log("\nDone! URLs submitted via IndexNow.");
  console.log("Note: Google Search Console requires manual sitemap submission.");
}

main().catch(console.error);
