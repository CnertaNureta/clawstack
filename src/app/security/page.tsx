import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, SECURITY_GRADES } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "State of OpenClaw Security — ClawStack",
  description:
    "We scanned 6,400+ OpenClaw skills and rated their security. See the full report: grade distribution, riskiest categories, and how to stay safe.",
  openGraph: {
    title: "State of OpenClaw Security 2026",
    description:
      "We scanned 6,400+ skills. Here's what we found about OpenClaw security.",
    images: ["/api/og?type=security"],
  },
};

export default async function SecurityReportPage() {
  const supabase = await createClient();

  // Total count
  const { count: totalCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true });

  // Grade distribution
  const gradeCounts: Record<string, number> = {};
  for (const g of ["S", "A", "B", "C", "D"]) {
    const { count } = await supabase
      .from("skills")
      .select("*", { count: "exact", head: true })
      .eq("security_grade", g);
    gradeCounts[g] = count || 0;
  }

  // Unrated count
  const { count: unratedCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .is("security_grade", null);

  // Category safety: avg security_score per category
  const categoryStats: { category: string; avg: number; count: number }[] = [];
  for (const cat of CATEGORIES) {
    const { data } = await supabase
      .from("skills")
      .select("security_score")
      .eq("category", cat.value)
      .not("security_score", "is", null)
      .gt("security_score", 0);
    if (data && data.length > 0) {
      const avg =
        data.reduce((sum, s) => sum + (s.security_score || 0), 0) / data.length;
      categoryStats.push({ category: cat.value, avg: Math.round(avg * 10) / 10, count: data.length });
    }
  }
  categoryStats.sort((a, b) => b.avg - a.avg);

  const total = totalCount || 0;
  const maxGradeCount = Math.max(...Object.values(gradeCounts), 1);

  // Key stats
  const dangerous = gradeCounts["D"] || 0;
  const cautionCount = gradeCounts["C"] || 0;
  const safeCount = (gradeCounts["S"] || 0) + (gradeCounts["A"] || 0);
  const riskPct = total > 0 ? Math.round(((dangerous + cautionCount) / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-primary">Home</Link>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-foreground">Security Report</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          State of OpenClaw Security
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          We scanned <span className="font-semibold text-foreground">{total.toLocaleString()}</span> skills
          from ClawHub and rated their security across 6 dimensions. Updated February 2026.
        </p>
      </div>

      {/* Top-level stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ShieldIcon className="h-6 w-6 text-primary" />}
          bg="bg-primary/10"
          value={total.toLocaleString()}
          label="Skills Analyzed"
          href="/skills"
        />
        <StatCard
          icon={<AlertIcon className="h-6 w-6 text-red-600" />}
          bg="bg-red-100"
          value={dangerous.toString()}
          label="Flagged Dangerous (D)"
          highlight="text-red-700"
          href="/skills?grade=D&sort=security"
        />
        <StatCard
          icon={<WarningIcon className="h-6 w-6 text-orange-600" />}
          bg="bg-orange-100"
          value={`${riskPct}%`}
          label="Have Risk Flags (C/D)"
          highlight="text-orange-700"
          href="/skills?grade=C,D&sort=security"
        />
        <StatCard
          icon={<CheckIcon className="h-6 w-6 text-emerald-600" />}
          bg="bg-emerald-100"
          value={safeCount.toLocaleString()}
          label="Rated Safe (S/A)"
          highlight="text-emerald-700"
          href="/skills?grade=S,A&sort=security"
        />
      </div>

      {/* ClawHub comparison callout */}
      <div className="mt-8 rounded-xl border-2 border-dashed border-red-300 bg-red-50/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Why does this matter?</h3>
            <p className="mt-1 text-sm text-muted">
              ClawHub — the official OpenClaw skill directory — has <span className="font-semibold text-red-600">zero security ratings</span>.
              Anyone can publish a skill with no review. ClawStack is the first platform to independently scan and rate every skill.
            </p>
          </div>
          <div className="flex shrink-0 gap-4">
            <div className="rounded-lg border border-red-200 bg-white px-4 py-3 text-center">
              <div className="text-xs text-red-500">ClawHub</div>
              <div className="text-lg font-bold text-red-700">0</div>
              <div className="text-xs text-muted">Security Ratings</div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-white px-4 py-3 text-center">
              <div className="text-xs text-emerald-500">ClawStack</div>
              <div className="text-lg font-bold text-emerald-700">{total.toLocaleString()}</div>
              <div className="text-xs text-muted">Security Ratings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* Grade Distribution */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">
            Security Grade Distribution
          </h2>
          <p className="mt-1 text-sm text-muted">
            Based on permissions, author trust, network requests, and more
          </p>
          <div className="mt-6 space-y-4">
            {SECURITY_GRADES.map((g) => {
              const count = gradeCounts[g.grade] || 0;
              const pct = maxGradeCount > 0 ? (count / maxGradeCount) * 100 : 0;
              const totalPct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
              return (
                <div key={g.grade} className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${g.bgColor} text-sm font-bold ${g.color}`}>
                    {g.grade}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{g.label}</span>
                      <span className="tabular-nums text-muted">{count.toLocaleString()} ({totalPct}%)</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-border/30">
                      <div
                        className={`h-full rounded-full ${g.bgColor}`}
                        style={{ width: `${pct}%`, minWidth: count > 0 ? "4px" : "0" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {(unratedCount || 0) > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-400">
                  ?
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-muted">Unrated</span>
                    <span className="tabular-nums text-muted">{(unratedCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-border/30">
                    <div
                      className="h-full rounded-full bg-gray-200"
                      style={{ width: `${((unratedCount || 0) / maxGradeCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Safety Ranking */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">
            Category Safety Rankings
          </h2>
          <p className="mt-1 text-sm text-muted">
            Average security score by category (higher is safer)
          </p>
          <div className="mt-6 space-y-3">
            {categoryStats.map((cs, i) => {
              const catInfo = CATEGORIES.find((c) => c.value === cs.category);
              const barColor =
                cs.avg >= 70 ? "bg-emerald-500" :
                cs.avg >= 50 ? "bg-green-500" :
                cs.avg >= 35 ? "bg-yellow-500" :
                cs.avg >= 20 ? "bg-orange-500" : "bg-red-500";
              return (
                <div key={cs.category} className="flex items-center gap-3">
                  <span className="w-5 text-right text-xs font-bold text-muted">{i + 1}</span>
                  <span className="w-6 text-center">{catInfo?.emoji}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{catInfo?.label || cs.category}</span>
                      <span className="tabular-nums text-muted">{cs.avg}/100 <span className="text-xs">({cs.count} skills)</span></span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-border/30">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${cs.avg}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How We Score */}
      <div className="mt-12 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">How We Score Security</h2>
        <p className="mt-1 text-sm text-muted">
          Each skill is rated across 6 dimensions, with a total possible score of 100 points.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ScoreDimension
            title="Security Scan"
            points="30 pts"
            description="Cisco mcp-scanner YARA analysis. Detects prompt injection, data exfiltration, credential harvesting, and more."
            color="text-red-600"
          />
          <ScoreDimension
            title="Permissions"
            points="20 pts"
            description="Sensitive permissions requested: file write, shell exec, network access."
            color="text-orange-600"
          />
          <ScoreDimension
            title="Author Trust"
            points="15 pts"
            description="GitHub account age, followers, and contribution history."
            color="text-blue-600"
          />
          <ScoreDimension
            title="Network Safety"
            points="15 pts"
            description="External URLs and domains contacted. Suspicious endpoints flagged."
            color="text-purple-600"
          />
          <ScoreDimension
            title="Community Trust"
            points="10 pts"
            description="Community safe/suspicious votes from ClawStack users."
            color="text-emerald-600"
          />
          <ScoreDimension
            title="Auditability"
            points="10 pts"
            description="Open source repo available with complete, readable source code."
            color="text-cyan-600"
          />
        </div>
        <div className="mt-6 flex flex-col items-center gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <div className="text-sm text-muted">
            Grade mapping: <span className="font-medium text-foreground">S</span> (90-100) &middot; <span className="font-medium text-foreground">A</span> (75-89) &middot; <span className="font-medium text-foreground">B</span> (60-74) &middot; <span className="font-medium text-foreground">C</span> (40-59) &middot; <span className="font-medium text-foreground">D</span> (0-39)
          </div>
          <Link
            href="/skills?sort=security"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
          >
            Browse Safest Skills
          </Link>
        </div>
      </div>

      {/* Social sharing CTA */}
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary-dark via-primary to-primary-light p-10 text-center sm:p-14">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Share This Report
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Help the OpenClaw community stay safe. Share the State of OpenClaw Security
          report with your network.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("We scanned 6,400+ OpenClaw skills for security risks. Here's what we found:\n\nclawstack.sh/security")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary shadow-lg hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </a>
          <a
            href={`https://www.reddit.com/submit?url=${encodeURIComponent("https://clawstack.sh/security")}&title=${encodeURIComponent("State of OpenClaw Security: We scanned 6,400+ skills")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/30"
          >
            Share on Reddit
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  bg,
  value,
  label,
  highlight,
  href,
}: {
  icon: React.ReactNode;
  bg: string;
  value: string;
  label: string;
  highlight?: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold ${highlight || "text-foreground"}`}>{value}</div>
        <div className="text-xs text-muted">{label}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
      >
        {content}
        <div className="mt-2 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View skills &rarr;
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {content}
    </div>
  );
}

function ScoreDimension({
  title,
  points,
  description,
  color,
}: {
  title: string;
  points: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className={`text-sm font-bold ${color}`}>{points}</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{description}</p>
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5v-2h2v2h-2zm0-4v-6h2v6h-2z"/>
    </svg>
  );
}
