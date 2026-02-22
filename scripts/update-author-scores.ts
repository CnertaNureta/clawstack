/**
 * Fetch real GitHub author data and recalculate security scores.
 *
 * - Queries Supabase for all unique author_github usernames
 * - Calls GitHub API for each author (account age, followers, public repos)
 * - Recalculates authorTrustScore (0-15) based on real data
 * - Updates security_score, security_grade, security_details in Supabase
 *
 * Usage:
 *   GITHUB_TOKEN=$(gh auth token) npx tsx scripts/update-author-scores.ts
 */

import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}
if (!GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN. Run: GITHUB_TOKEN=$(gh auth token) npx tsx scripts/update-author-scores.ts");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface GitHubUser {
  login: string;
  created_at: string;
  followers: number;
  public_repos: number;
}

// Cache author data to avoid duplicate API calls
const authorCache = new Map<string, { ageDays: number; followers: number; repos: number } | null>();

async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ClawStack-Security-Scanner",
      },
    });

    if (res.status === 404) return null;
    if (res.status === 403 || res.status === 429) {
      // Rate limited — check headers
      const reset = res.headers.get("x-ratelimit-reset");
      const remaining = res.headers.get("x-ratelimit-remaining");
      console.error(`  Rate limited! Remaining: ${remaining}, Reset: ${reset ? new Date(parseInt(reset) * 1000).toISOString() : "unknown"}`);
      // Wait and retry
      const waitMs = reset ? (parseInt(reset) * 1000 - Date.now() + 1000) : 60000;
      console.error(`  Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(Math.min(waitMs, 120000));
      return fetchGitHubUser(username); // retry
    }
    if (!res.ok) {
      console.error(`  GitHub API error for ${username}: ${res.status}`);
      return null;
    }

    return (await res.json()) as GitHubUser;
  } catch (err) {
    console.error(`  Network error for ${username}:`, err);
    return null;
  }
}

function computeAuthorTrustScore(ageDays: number, followers: number, repos: number): number {
  let score = 0;

  // Account age (max 6 points)
  if (ageDays >= 730) score += 6;       // 2+ years
  else if (ageDays >= 365) score += 4;  // 1+ year
  else if (ageDays >= 90) score += 2;   // 3+ months
  else if (ageDays >= 7) score += 1;    // 1+ week

  // Followers (max 5 points)
  if (followers >= 50) score += 5;
  else if (followers >= 10) score += 3;
  else if (followers >= 1) score += 1;

  // Public repos (max 4 points)
  if (repos >= 10) score += 4;
  else if (repos >= 3) score += 2;
  else if (repos >= 1) score += 1;

  return Math.min(15, score);
}

function gradeFromScore(score: number): string {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== Update Author Trust Scores ===\n");

  // 1. Fetch all skills with author_github
  console.log("Fetching skills from Supabase...");
  const allSkills: { id: string; author_github: string | null; security_details: Record<string, number>; security_score: number }[] = [];

  let offset = 0;
  const batchSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("skills")
      .select("id, author_github, security_details, security_score")
      .range(offset, offset + batchSize - 1);

    if (error) { console.error("Supabase error:", error); process.exit(1); }
    if (!data || data.length === 0) break;
    allSkills.push(...data);
    offset += batchSize;
    if (data.length < batchSize) break;
  }

  console.log(`  Total skills: ${allSkills.length}`);

  // 2. Get unique authors
  const uniqueAuthors = new Set<string>();
  for (const skill of allSkills) {
    if (skill.author_github) uniqueAuthors.add(skill.author_github);
  }
  console.log(`  Unique authors: ${uniqueAuthors.size}`);

  // 3. Fetch GitHub data for each author
  console.log(`\nFetching GitHub profiles (${uniqueAuthors.size} authors)...\n`);
  let fetched = 0;
  let notFound = 0;

  for (const username of uniqueAuthors) {
    fetched++;
    if (fetched % 50 === 0 || fetched <= 3) {
      console.log(`  [${fetched}/${uniqueAuthors.size}] Fetching ${username}...`);
    }

    const user = await fetchGitHubUser(username);
    if (!user) {
      authorCache.set(username, null);
      notFound++;
      continue;
    }

    const ageDays = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
    authorCache.set(username, {
      ageDays,
      followers: user.followers,
      repos: user.public_repos,
    });

    // Respect rate limit: 5000/hr = ~1.4/s, be safe with small delay
    if (fetched % 10 === 0) await sleep(200);
  }

  console.log(`\n  Fetched: ${fetched - notFound} found, ${notFound} not found`);

  // 4. Recalculate scores and batch update
  console.log("\nRecalculating security scores...\n");
  let updated = 0;
  let unchanged = 0;
  const gradeChanges: Record<string, number> = {};

  // Process in batches
  const updateBatch: { id: string; security_score: number; security_grade: string; security_details: Record<string, number> }[] = [];

  for (const skill of allSkills) {
    const details = { ...(skill.security_details || {}) };
    const oldAuthorScore = details.authorTrustScore ?? 8;
    let newAuthorScore = 3; // default for no author

    if (skill.author_github) {
      const cached = authorCache.get(skill.author_github);
      if (cached) {
        newAuthorScore = computeAuthorTrustScore(cached.ageDays, cached.followers, cached.repos);
      } else {
        newAuthorScore = 3; // author not found on GitHub
      }
    }

    if (newAuthorScore === oldAuthorScore) {
      unchanged++;
      continue;
    }

    details.authorTrustScore = newAuthorScore;

    // Recalculate total score
    const newScore =
      (details.permissionScore ?? 15) +
      (details.authorTrustScore ?? 3) +
      (details.networkScore ?? 10) +
      (details.communityScore ?? 5) +
      (details.auditabilityScore ?? 2) +
      (details.scanScore ?? details.virusTotalScore ?? 15);

    const newGrade = gradeFromScore(newScore);
    const oldGrade = gradeFromScore(skill.security_score);

    if (newGrade !== oldGrade) {
      const key = `${oldGrade}→${newGrade}`;
      gradeChanges[key] = (gradeChanges[key] || 0) + 1;
    }

    updateBatch.push({
      id: skill.id,
      security_score: newScore,
      security_grade: newGrade,
      security_details: details,
    });
    updated++;
  }

  console.log(`  Scores changed: ${updated}`);
  console.log(`  Unchanged: ${unchanged}`);
  if (Object.keys(gradeChanges).length > 0) {
    console.log(`  Grade migrations:`);
    for (const [key, count] of Object.entries(gradeChanges).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${key}: ${count} skills`);
    }
  }

  // 5. Batch update Supabase
  if (updateBatch.length > 0) {
    console.log(`\nUpdating ${updateBatch.length} skills in Supabase...`);
    const batchSize = 100;
    for (let i = 0; i < updateBatch.length; i += batchSize) {
      const batch = updateBatch.slice(i, i + batchSize);
      for (const item of batch) {
        const { error } = await supabase
          .from("skills")
          .update({
            security_score: item.security_score,
            security_grade: item.security_grade,
            security_details: item.security_details,
          })
          .eq("id", item.id);

        if (error) {
          console.error(`  Error updating ${item.id}:`, error.message);
        }
      }
      if (i + batchSize < updateBatch.length) {
        console.log(`  Updated ${Math.min(i + batchSize, updateBatch.length)}/${updateBatch.length}...`);
      }
    }
    console.log(`  Done! Updated ${updateBatch.length} skills.`);
  } else {
    console.log("\nNo updates needed.");
  }

  // 6. Print new grade distribution
  console.log("\n=== New Grade Distribution ===");
  const { data: gradeStats } = await supabase.rpc("count_by_grade").select("*");
  if (gradeStats) {
    for (const row of gradeStats) {
      console.log(`  ${row.grade}: ${row.count}`);
    }
  } else {
    // Fallback: manual count
    for (const g of ["S", "A", "B", "C", "D"]) {
      const { count } = await supabase.from("skills").select("*", { count: "exact", head: true }).eq("security_grade", g);
      console.log(`  ${g}: ${count}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
