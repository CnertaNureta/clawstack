/**
 * Generate security statistics report for marketing content.
 *
 * Usage:
 *   npx tsx scripts/generate-security-report.ts
 */

import * as path from "path";
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

async function main() {
  console.log("=".repeat(60));
  console.log("  ClawStack Security Report — Data for Marketing");
  console.log("  Generated:", new Date().toISOString().split("T")[0]);
  console.log("=".repeat(60));

  // 1. Total skills
  const { count: totalSkills } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true });

  console.log(`\n📊 TOTAL SKILLS ANALYZED: ${totalSkills}`);

  // 2. Grade distribution
  console.log("\n📋 GRADE DISTRIBUTION:");
  const grades = ["S", "A", "B", "C", "D"];
  const gradeCounts: Record<string, number> = {};

  for (const g of grades) {
    const { count } = await supabase
      .from("skills")
      .select("*", { count: "exact", head: true })
      .eq("security_grade", g);
    gradeCounts[g] = count || 0;
  }

  const { count: unratedCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .is("security_grade", null);

  const rated = totalSkills! - (unratedCount || 0);
  for (const g of grades) {
    const pct = rated > 0 ? ((gradeCounts[g] / rated) * 100).toFixed(1) : "0";
    const bar = "█".repeat(Math.round(gradeCounts[g] / (rated / 40)));
    console.log(`  Grade ${g}: ${gradeCounts[g].toString().padStart(5)} (${pct.padStart(5)}%) ${bar}`);
  }
  console.log(`  Unrated: ${(unratedCount || 0).toString().padStart(5)}`);

  // 3. Key risk stats
  const dangerous = gradeCounts["D"] || 0;
  const caution = gradeCounts["C"] || 0;
  const safe = (gradeCounts["S"] || 0) + (gradeCounts["A"] || 0);
  const riskPct = rated > 0 ? (((dangerous + caution) / rated) * 100).toFixed(1) : "0";
  const safePct = rated > 0 ? ((safe / rated) * 100).toFixed(1) : "0";

  console.log("\n🚨 KEY RISK METRICS:");
  console.log(`  Dangerous (D-grade) skills: ${dangerous}`);
  console.log(`  Caution (C-grade) skills: ${caution}`);
  console.log(`  Combined risk (C+D): ${dangerous + caution} (${riskPct}%)`);
  console.log(`  Safe (S+A grade): ${safe} (${safePct}%)`);

  // 4. Top 15 most dangerous skills
  console.log("\n⚠️  TOP 15 MOST DANGEROUS SKILLS (lowest security score):");
  const { data: worstSkills } = await supabase
    .from("skills")
    .select("name, slug, security_grade, security_score, author_name, category")
    .eq("security_grade", "D")
    .order("security_score", { ascending: true })
    .limit(15);

  if (worstSkills) {
    worstSkills.forEach((s, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. [${s.security_grade}] ${s.name} (score: ${s.security_score}) — by ${s.author_name || "unknown"} [${s.category}]`
      );
    });
  }

  // 5. Category safety ranking
  console.log("\n🏆 CATEGORY SAFETY RANKING (avg security score):");
  const categories = [
    "communication", "productivity", "dev-tools", "smart-home",
    "finance", "entertainment", "security", "other",
  ];

  const catStats: { name: string; avg: number; count: number }[] = [];
  for (const cat of categories) {
    const { data } = await supabase
      .from("skills")
      .select("security_score")
      .eq("category", cat)
      .not("security_score", "is", null)
      .gt("security_score", 0);

    if (data && data.length > 0) {
      const avg =
        data.reduce((sum, s) => sum + Number(s.security_score), 0) / data.length;
      catStats.push({ name: cat, avg, count: data.length });
    }
  }

  catStats.sort((a, b) => b.avg - a.avg);
  catStats.forEach((c, i) => {
    console.log(
      `  ${(i + 1).toString().padStart(2)}. ${c.name.padEnd(18)} avg: ${c.avg.toFixed(1).padStart(5)}  (${c.count} skills)`
    );
  });

  // 6. Skills with scan findings (threats detected)
  console.log("\n🔍 SKILLS WITH SECURITY SCAN THREATS DETECTED:");
  const { data: scannedSkills } = await supabase
    .from("skills")
    .select("name, slug, security_grade, security_score, security_details")
    .not("security_details", "is", null)
    .order("security_score", { ascending: true })
    .limit(500);

  let threatCount = 0;
  const threatsFound: { name: string; severity: string; threats: string[] }[] = [];

  if (scannedSkills) {
    for (const s of scannedSkills) {
      const details = s.security_details as Record<string, unknown>;
      const findings = details?.scanFindings as {
        totalFindings?: number;
        highestSeverity?: string;
        threatNames?: string[];
      } | undefined;

      if (findings && findings.totalFindings && findings.totalFindings > 0) {
        threatCount++;
        threatsFound.push({
          name: s.name,
          severity: findings.highestSeverity || "UNKNOWN",
          threats: findings.threatNames || [],
        });
      }
    }
  }

  console.log(`  Total skills with threats: ${threatCount}`);
  threatsFound.slice(0, 20).forEach((t) => {
    console.log(`  - [${t.severity}] ${t.name}: ${t.threats.join(", ")}`);
  });

  // 7. Score distribution histogram
  console.log("\n📈 SCORE DISTRIBUTION:");
  const { data: allScores } = await supabase
    .from("skills")
    .select("security_score")
    .not("security_score", "is", null)
    .gt("security_score", 0);

  if (allScores) {
    const buckets = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    for (let i = 0; i < buckets.length - 1; i++) {
      const count = allScores.filter(
        (s) => s.security_score >= buckets[i] && s.security_score < buckets[i + 1]
      ).length;
      const bar = "█".repeat(Math.round(count / (allScores.length / 40)));
      console.log(
        `  ${buckets[i].toString().padStart(3)}-${buckets[i + 1].toString().padStart(3)}: ${count.toString().padStart(5)} ${bar}`
      );
    }
  }

  // 8. Summary for marketing
  console.log("\n" + "=".repeat(60));
  console.log("  MARKETING COPY DATA POINTS");
  console.log("=".repeat(60));
  console.log(`  • ${totalSkills?.toLocaleString()}+ OpenClaw skills analyzed`);
  console.log(`  • ${dangerous} skills rated Dangerous (Grade D)`);
  console.log(`  • ${riskPct}% of skills flagged with security concerns`);
  console.log(`  • ${safePct}% rated Safe (Grade S or A)`);
  console.log(`  • ${threatCount} skills with active security threats detected`);
  console.log(`  • 6-dimensional security scoring system (100-point scale)`);
  console.log(`  • Real YARA-based threat detection via Cisco mcp-scanner`);
  console.log(`  • ${(unratedCount || 0) > 0 ? `${unratedCount} skills pending analysis` : "All skills analyzed"}`);
}

main().catch(console.error);
