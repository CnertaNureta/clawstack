/**
 * Batch security scan using Cisco mcp-scanner YARA engine.
 *
 * Scans all skills from the locally cloned openclaw/skills repo,
 * then updates Supabase with real scanScore values (replacing the
 * placeholder virusTotalScore).
 *
 * Prerequisites:
 *   pip install cisco-ai-mcp-scanner
 *
 * Usage:
 *   npx tsx scripts/scan-skills-security.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Types ---

interface ScanFindingsSummary {
  totalFindings: number;
  highestSeverity: "HIGH" | "MEDIUM" | "LOW" | "SAFE";
  threatNames: string[];
  scannedAt: string;
}

interface ToolResult {
  tool_name: string;
  is_safe: boolean;
  findings?: {
    yara_analyzer?: {
      severity?: string;
      threat_names?: string[];
      total_findings?: number;
    };
  };
  total_findings?: number;
}

interface SkillContent {
  slug: string;
  content: string;
}

// --- Scoring ---

function scanScoreFromFindings(findings: ScanFindingsSummary): number {
  if (findings.highestSeverity === "SAFE" || findings.totalFindings === 0) return 30;
  const n = findings.totalFindings;
  switch (findings.highestSeverity) {
    case "HIGH":
      if (n >= 3) return 0;
      if (n === 2) return 5;
      return 10;
    case "MEDIUM":
      if (n >= 3) return 10;
      if (n === 2) return 15;
      return 20;
    case "LOW":
      if (n >= 5) return 15;
      if (n >= 2) return 20;
      return 25;
    default:
      return 15;
  }
}

function gradeFromScore(score: number): string {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

// --- File reading ---

function collectSkillContent(dirPath: string): string {
  const parts: string[] = [];

  // Read SKILL.md / skill.md / README.md
  for (const name of ["SKILL.md", "skill.md", "README.md"]) {
    const p = path.join(dirPath, name);
    if (fs.existsSync(p)) {
      parts.push(fs.readFileSync(p, "utf-8"));
      break;
    }
  }

  // Read scripts/*.sh, scripts/*.py
  const scriptsDir = path.join(dirPath, "scripts");
  if (fs.existsSync(scriptsDir) && fs.statSync(scriptsDir).isDirectory()) {
    for (const f of fs.readdirSync(scriptsDir)) {
      if (f.endsWith(".sh") || f.endsWith(".py")) {
        parts.push(fs.readFileSync(path.join(scriptsDir, f), "utf-8"));
      }
    }
  }

  // Read other .md files
  for (const f of fs.readdirSync(dirPath)) {
    if (f.endsWith(".md") && f !== "SKILL.md" && f !== "skill.md" && f !== "README.md") {
      parts.push(fs.readFileSync(path.join(dirPath, f), "utf-8"));
    }
  }

  return parts.join("\n\n---\n\n");
}

// --- Main ---

async function main() {
  console.log("=== ClawStack Security Scanner (mcp-scanner) ===\n");

  // 1. Check mcp-scanner is installed
  try {
    execSync("which mcp-scanner", { stdio: "pipe" });
  } catch {
    console.error("mcp-scanner CLI not found. Install with:");
    console.error("  pip install cisco-ai-mcp-scanner");
    process.exit(1);
  }
  console.log("mcp-scanner CLI found.\n");

  // 2. Collect skill content from local repo
  const CLONE_DIR = path.join(__dirname, ".tmp-skills-repo");
  const skillsRoot = path.join(CLONE_DIR, "skills");

  if (!fs.existsSync(skillsRoot)) {
    console.error(`Skills repo not found at ${skillsRoot}`);
    console.error("Run first: npx tsx scripts/scrape-clawhub.ts");
    process.exit(1);
  }

  const skillContents: SkillContent[] = [];
  const authors = fs.readdirSync(skillsRoot).filter((d) =>
    fs.statSync(path.join(skillsRoot, d)).isDirectory()
  );

  for (const author of authors) {
    const authorDir = path.join(skillsRoot, author);
    const skillNames = fs.readdirSync(authorDir).filter((d) =>
      fs.statSync(path.join(authorDir, d)).isDirectory()
    );
    for (const skillName of skillNames) {
      const dirPath = path.join(authorDir, skillName);
      const content = collectSkillContent(dirPath);
      if (content.trim()) {
        // Slug matches the scraper logic
        const slug = skillName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
        skillContents.push({ slug, content });
      }
    }
  }

  console.log(`Collected content for ${skillContents.length} skills.\n`);

  // 3. Batch scan with mcp-scanner (50 per batch to avoid buffer overflow)
  const BATCH_SIZE = 50;
  const scanResults = new Map<string, ScanFindingsSummary>();
  const tmpDir = path.join(__dirname, ".tmp-scan");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const totalBatches = Math.ceil(skillContents.length / BATCH_SIZE);
  console.log(`Scanning in ${totalBatches} batches of ${BATCH_SIZE}...\n`);

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const batchStart = batchIdx * BATCH_SIZE;
    const batch = skillContents.slice(batchStart, batchStart + BATCH_SIZE);
    const batchFile = path.join(tmpDir, `batch-${batchIdx}.json`);
    const outputFile = path.join(tmpDir, `result-${batchIdx}.json`);

    // Write batch as mcp-scanner static tools format
    const tools = batch.map((s) => ({
      name: s.slug,
      description: s.content.slice(0, 10000), // cap content size for YARA
      inputSchema: {},
    }));
    fs.writeFileSync(batchFile, JSON.stringify({ tools }, null, 2));

    console.log(`  Batch ${batchIdx + 1}/${totalBatches} (${batch.length} skills)...`);

    try {
      // mcp-scanner outputs results to stdout; redirect to file
      execSync(
        `mcp-scanner --analyzers yara --format raw static --tools "${batchFile}" > "${outputFile}" 2>/dev/null`,
        { timeout: 300000, stdio: ["pipe", "pipe", "pipe"], maxBuffer: 50 * 1024 * 1024 }
      );

      const rawOutput = fs.readFileSync(outputFile, "utf-8").trim();
      if (!rawOutput) {
        console.log(`    Warning: empty output, skipping batch`);
        continue;
      }

      let results: ToolResult[];
      try {
        const parsed = JSON.parse(rawOutput);
        results = parsed.scan_results || (Array.isArray(parsed) ? parsed : parsed.tools || parsed.results || []);
      } catch {
        console.log(`    Warning: failed to parse JSON output, skipping batch`);
        continue;
      }

      for (const result of results) {
        const yara = result.findings?.yara_analyzer;
        const totalFindings = result.total_findings ?? yara?.total_findings ?? 0;
        const severity = (yara?.severity?.toUpperCase() || (result.is_safe ? "SAFE" : "LOW")) as ScanFindingsSummary["highestSeverity"];
        const threatNames = yara?.threat_names || [];

        scanResults.set(result.tool_name, {
          totalFindings,
          highestSeverity: totalFindings === 0 ? "SAFE" : severity,
          threatNames,
          scannedAt: new Date().toISOString(),
        });
      }

      console.log(`    Scanned ${results.length} skills, ${results.filter((r) => !r.is_safe).length} flagged`);
    } catch (err) {
      console.error(`    Error scanning batch ${batchIdx + 1}:`, (err as Error).message?.slice(0, 200));
      console.log(`    Skills in this batch will keep default score (15).`);
    }
  }

  console.log(`\nScan complete. ${scanResults.size} skills scanned.\n`);

  // 4. Fetch all skills from Supabase
  console.log("Fetching skills from Supabase...");
  interface SkillRow {
    id: string;
    slug: string;
    security_details: Record<string, unknown>;
    security_score: number;
    security_grade: string;
  }
  const allSkills: SkillRow[] = [];
  let offset = 0;
  const fetchBatchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("skills")
      .select("id, slug, security_details, security_score, security_grade")
      .range(offset, offset + fetchBatchSize - 1);

    if (error) {
      console.error("Supabase error:", error);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allSkills.push(...(data as SkillRow[]));
    offset += fetchBatchSize;
    if (data.length < fetchBatchSize) break;
  }

  console.log(`  Total skills in DB: ${allSkills.length}`);

  // 5. Match scan results and prepare updates
  console.log("\nCalculating new scores...\n");

  const updateBatch: {
    id: string;
    security_score: number;
    security_grade: string;
    security_details: Record<string, unknown>;
  }[] = [];

  let matched = 0;
  let unmatched = 0;
  const gradeChanges: Record<string, number> = {};
  const gradeDist: Record<string, number> = {};

  for (const skill of allSkills) {
    const findings = scanResults.get(skill.slug);
    const details: Record<string, unknown> = { ...(skill.security_details || {}) };

    // Remove legacy key
    delete details.virusTotalScore;

    if (findings) {
      matched++;
      details.scanScore = scanScoreFromFindings(findings);
      details.scanFindings = findings;
    } else {
      unmatched++;
      // Keep existing scanScore if present, otherwise default 15
      if (details.scanScore === undefined) {
        details.scanScore = 15;
      }
    }

    // Recalculate total score from all 6 dimensions
    const newScore =
      (toNum(details.permissionScore) ?? 15) +
      (toNum(details.authorTrustScore) ?? 3) +
      (toNum(details.networkScore) ?? 10) +
      (toNum(details.communityScore) ?? 5) +
      (toNum(details.auditabilityScore) ?? 2) +
      (toNum(details.scanScore) ?? 15);

    const newGrade = gradeFromScore(newScore);
    const oldGrade = skill.security_grade;

    gradeDist[newGrade] = (gradeDist[newGrade] || 0) + 1;

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
  }

  console.log(`  Matched: ${matched}`);
  console.log(`  Unmatched (default score): ${unmatched}`);

  // 6. Batch update Supabase
  if (updateBatch.length > 0) {
    console.log(`\nUpdating ${updateBatch.length} skills in Supabase...`);
    const dbBatchSize = 100;

    for (let i = 0; i < updateBatch.length; i += dbBatchSize) {
      const batch = updateBatch.slice(i, i + dbBatchSize);
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
      if ((i + dbBatchSize) % 500 === 0 || i + dbBatchSize >= updateBatch.length) {
        console.log(`  Updated ${Math.min(i + dbBatchSize, updateBatch.length)}/${updateBatch.length}...`);
      }
    }
    console.log(`  Done!`);
  }

  // 7. Print summary
  console.log("\n=== Grade Distribution ===");
  for (const g of ["S", "A", "B", "C", "D"]) {
    const count = gradeDist[g] || 0;
    const pct = allSkills.length > 0 ? ((count / allSkills.length) * 100).toFixed(1) : "0";
    console.log(`  ${g}: ${count} (${pct}%)`);
  }

  if (Object.keys(gradeChanges).length > 0) {
    console.log("\n=== Grade Migrations ===");
    for (const [key, count] of Object.entries(gradeChanges).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${key}: ${count} skills`);
    }
  }

  // Scan findings summary
  let safeCount = 0;
  let flaggedCount = 0;
  for (const f of scanResults.values()) {
    if (f.highestSeverity === "SAFE") safeCount++;
    else flaggedCount++;
  }
  console.log(`\n=== Scan Summary ===`);
  console.log(`  Safe: ${safeCount}`);
  console.log(`  Flagged: ${flaggedCount}`);
  console.log(`  Total scanned: ${scanResults.size}`);

  // Cleanup tmp files
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch { /* ignore */ }

  console.log("\nDone!");
}

function toNum(val: unknown): number | undefined {
  return typeof val === "number" ? val : undefined;
}

main().catch(console.error);
