import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SkillCard } from "@/components/skills/SkillCard";
import { Skill, SecurityGrade, SECURITY_GRADES } from "@/lib/supabase/types";

const GRADE_SEO: Record<
  string,
  { title: string; description: string; h1: string; intro: string }
> = {
  s: {
    title: "Grade S OpenClaw Skills — Excellent Security",
    description:
      "The most secure OpenClaw skills with Grade S (Excellent) security ratings. Thoroughly analyzed, open-source, and community-verified.",
    h1: "Grade S — Excellent Security",
    intro:
      "These skills have the highest security posture. They are fully open-source, have clean VirusTotal scans, minimal permissions, and reputable authors.",
  },
  a: {
    title: "Grade A OpenClaw Skills — Good Security",
    description:
      "Browse Grade A (Good) OpenClaw skills. Strong security posture with verified authors and community trust.",
    h1: "Grade A — Good Security",
    intro:
      "Grade A skills have a strong security posture. They passed most security checks and are safe for everyday use.",
  },
  b: {
    title: "Grade B OpenClaw Skills — Fair Security",
    description:
      "Browse Grade B (Fair) OpenClaw skills. Decent security but with some minor flags to be aware of.",
    h1: "Grade B — Fair Security",
    intro:
      "Grade B skills are generally safe but have minor security flags. Review the details before installing.",
  },
  c: {
    title: "Grade C OpenClaw Skills — Use With Caution",
    description:
      "Grade C OpenClaw skills have notable security concerns. Review carefully before installing.",
    h1: "Grade C — Use With Caution",
    intro:
      "These skills have notable risk flags such as broad permissions, external requests, or unverified authors. Proceed carefully.",
  },
  d: {
    title: "Grade D OpenClaw Skills — Security Risk",
    description:
      "Grade D OpenClaw skills have serious security concerns. We recommend avoiding these unless you understand the risks.",
    h1: "Grade D — Security Risk",
    intro:
      "These skills have serious security concerns including suspicious code patterns, known vulnerabilities, or malicious behavior reports. Proceed with extreme caution.",
  },
};

const VALID_GRADES = ["s", "a", "b", "c", "d"];

interface Props {
  params: Promise<{ grade: string }>;
}

export async function generateStaticParams() {
  return VALID_GRADES.map((g) => ({ grade: g }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { grade } = await params;
  const seo = GRADE_SEO[grade.toLowerCase()];
  if (!seo) return {};

  return {
    title: seo.title,
    description: seo.description,
    openGraph: { title: seo.title, description: seo.description },
  };
}

export default async function GradePage({ params }: Props) {
  const { grade: rawGrade } = await params;
  const gradeLower = rawGrade.toLowerCase();
  const seo = GRADE_SEO[gradeLower];
  if (!seo) notFound();

  const gradeUpper = gradeLower.toUpperCase() as SecurityGrade;
  const gradeInfo = SECURITY_GRADES.find((g) => g.grade === gradeUpper);

  const supabase = await createClient();

  const { data: skills, count } = await supabase
    .from("skills")
    .select("*", { count: "exact" })
    .eq("security_grade", gradeUpper)
    .order("upvotes", { ascending: false })
    .limit(48);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clawstack.sh";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.title,
    description: seo.description,
    url: `${baseUrl}/grade/${gradeLower}`,
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
        <Link href="/security" className="hover:text-foreground">
          Security
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Grade {gradeUpper}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-xl font-black ${gradeInfo?.bgColor} ${gradeInfo?.color}`}
          >
            {gradeUpper}
          </span>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{seo.h1}</h1>
            <p className="text-sm text-muted">
              {count ?? 0} skills with this grade
            </p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-muted">{seo.intro}</p>
      </div>

      {/* Grid */}
      {skills && skills.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(skills as Skill[]).map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-lg text-muted">
            No skills currently have Grade {gradeUpper}.
          </p>
        </div>
      )}

      {/* See more CTA */}
      {(count || 0) > 48 && (
        <div className="mt-8 text-center">
          <Link
            href={`/skills?grade=${gradeUpper}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            View all {count} Grade {gradeUpper} skills
          </Link>
        </div>
      )}

      {/* Other grades */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Browse by Security Grade
        </h2>
        <div className="flex flex-wrap gap-3">
          {SECURITY_GRADES.map((g) => (
            <Link
              key={g.grade}
              href={`/grade/${g.grade.toLowerCase()}`}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${
                g.grade === gradeUpper
                  ? `${g.bgColor} ${g.color} border-current`
                  : "border-border text-muted hover:border-primary hover:text-primary"
              }`}
            >
              <span className="font-bold">{g.grade}</span>
              {g.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
