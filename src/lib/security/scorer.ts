import type { SecurityGrade } from "@/lib/supabase/types";

export interface ScanFindingsSummary {
  totalFindings: number;
  highestSeverity: "HIGH" | "MEDIUM" | "LOW" | "SAFE";
  threatNames: string[];
}

export interface SecurityScoreInput {
  skillMdContent: string;
  authorGithub: string | null;
  repoUrl: string | null;
  authorAccountAgeDays?: number;
  authorFollowers?: number;
  authorPublicRepos?: number;
  communityVotes?: { safe: number; suspicious: number };
  scanFindings?: ScanFindingsSummary;
  virusTotalDetections?: number; // backward compat
}

export interface SecurityScoreOutput {
  grade: SecurityGrade;
  score: number;
  details: {
    permissionScore: number;
    authorTrustScore: number;
    networkScore: number;
    communityScore: number;
    auditabilityScore: number;
    scanScore: number;
  };
}

// Dangerous patterns in SKILL.md
const DANGEROUS_PATTERNS = {
  shellExec: /\b(exec|spawn|system|child_process|subprocess|os\.system|eval)\b/gi,
  fileWrite: /\b(writeFile|write_file|fs\.write|open\(.+['"](w|a)['"]\))\b/gi,
  networkAccess: /\b(fetch|axios|http\.get|urllib|requests\.get|curl)\b/gi,
  credentials: /\b(password|secret|token|api[_-]?key|credential|private[_-]?key)\b/gi,
  dangerousUrls:
    /https?:\/\/(?!github\.com|npmjs\.com|pypi\.org|clawhub\.(ai|com))[^\s"'<>]+/gi,
};

function scorePermissions(content: string): number {
  if (!content) return 15; // No SKILL.md = partial credit

  let penalty = 0;
  const matches = {
    shell: (content.match(DANGEROUS_PATTERNS.shellExec) || []).length,
    file: (content.match(DANGEROUS_PATTERNS.fileWrite) || []).length,
    network: (content.match(DANGEROUS_PATTERNS.networkAccess) || []).length,
    creds: (content.match(DANGEROUS_PATTERNS.credentials) || []).length,
  };

  if (matches.shell > 0) penalty += 6;
  if (matches.file > 0) penalty += 4;
  if (matches.network > 0) penalty += 4;
  if (matches.creds > 0) penalty += 6;

  return Math.max(0, 20 - penalty);
}

function scoreAuthorTrust(input: SecurityScoreInput): number {
  if (!input.authorGithub) return 3;

  let score = 0;

  // Account age (max 6 points)
  const ageDays = input.authorAccountAgeDays ?? 0;
  if (ageDays >= 730) score += 6;      // 2+ years
  else if (ageDays >= 365) score += 4;  // 1+ year
  else if (ageDays >= 90) score += 2;   // 3+ months
  else if (ageDays < 7) score += 0;     // < 1 week = suspicious

  // Followers (max 5 points)
  const followers = input.authorFollowers ?? 0;
  if (followers >= 50) score += 5;
  else if (followers >= 10) score += 3;
  else if (followers >= 1) score += 1;

  // Public repos (max 4 points)
  const repos = input.authorPublicRepos ?? 0;
  if (repos >= 10) score += 4;
  else if (repos >= 3) score += 2;
  else if (repos >= 1) score += 1;

  return Math.min(15, score);
}

function scoreNetwork(content: string): number {
  if (!content) return 10;

  const suspiciousUrls = content.match(DANGEROUS_PATTERNS.dangerousUrls) || [];
  if (suspiciousUrls.length === 0) return 15;
  if (suspiciousUrls.length <= 2) return 10;
  if (suspiciousUrls.length <= 5) return 5;
  return 0;
}

function scoreCommunity(votes?: {
  safe: number;
  suspicious: number;
}): number {
  if (!votes || (votes.safe === 0 && votes.suspicious === 0)) return 5; // Default neutral

  const total = votes.safe + votes.suspicious;
  if (total < 3) return 5; // Not enough data

  const safeRatio = votes.safe / total;
  if (safeRatio >= 0.9 && total >= 10) return 10;
  if (safeRatio >= 0.7) return 7;
  if (safeRatio >= 0.5) return 4;
  return 0;
}

function scoreAuditability(repoUrl: string | null): number {
  if (!repoUrl) return 2;
  if (repoUrl.includes("github.com")) return 10;
  if (repoUrl.includes("gitlab.com") || repoUrl.includes("bitbucket.org"))
    return 8;
  return 5;
}

function scoreScan(scanFindings?: ScanFindingsSummary, virusTotalDetections?: number): number {
  // Prefer real scan findings from mcp-scanner
  if (scanFindings) {
    if (scanFindings.highestSeverity === "SAFE" || scanFindings.totalFindings === 0) return 30;
    const n = scanFindings.totalFindings;
    switch (scanFindings.highestSeverity) {
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
    }
  }

  // Fallback: legacy virusTotal detections
  if (virusTotalDetections !== undefined) {
    if (virusTotalDetections === 0) return 30;
    if (virusTotalDetections === 1) return 20;
    if (virusTotalDetections === 2) return 10;
    return 0;
  }

  return 15; // Not yet scanned, give partial credit
}

function gradeFromScore(score: number): SecurityGrade {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

export function computeSecurityScore(
  input: SecurityScoreInput
): SecurityScoreOutput {
  const details = {
    permissionScore: scorePermissions(input.skillMdContent),
    authorTrustScore: scoreAuthorTrust(input),
    networkScore: scoreNetwork(input.skillMdContent),
    communityScore: scoreCommunity(input.communityVotes),
    auditabilityScore: scoreAuditability(input.repoUrl),
    scanScore: scoreScan(input.scanFindings, input.virusTotalDetections),
  };

  const score = Object.values(details).reduce((sum, v) => sum + v, 0);
  const grade = gradeFromScore(score);

  return { grade, score, details };
}
