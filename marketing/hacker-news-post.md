# Hacker News — Show HN Post

## Title (max 80 chars)

Show HN: ClawStack — We scanned 6,493 OpenClaw skills and 40% have security issues

## Post Body

Hey HN,

I built ClawStack (https://clawstack.sh) after discovering that nearly half of the OpenClaw skills available on ClawHub had never been independently audited for security.

**What we found scanning 6,493 skills:**

- 502 skills rated Dangerous (Grade D) — including credential harvesters and injection attacks
- 500 skills with active security threats detected by YARA-based analysis
- 40.8% flagged with some level of security concern
- Finance skills are the riskiest category (avg score 56.5/100)
- Threats found include: CREDENTIAL HARVESTING, INJECTION ATTACKS, TOOL POISONING, DATA EXFILTRATION, CODE EXECUTION

**How we score:**

Every skill gets a 0-100 security score across 6 dimensions:
1. YARA threat scan (Cisco mcp-scanner) — 30%
2. Permission analysis (shell exec, file write, network) — 20%
3. Author reputation (GitHub account age, followers, repos) — 15%
4. External network requests — 15%
5. Community voting — 10%
6. Source code availability — 10%

Grades: S (90+) / A (75-89) / B (60-74) / C (40-59) / D (<40)

**The product:**

- Browse all 6,493 skills with security ratings
- Filter by grade, category, trending
- Create your "Stack" — share what skills you use at clawstack.sh/@username
- 22 curated collections (Safest Skills, Skills to Avoid, Best for Devs, etc.)
- Skill Recommendation Quiz

**Tech stack:** Next.js 16, TypeScript, Supabase, Tailwind CSS 4, Vercel

The code for the security scanner is open — we use Cisco's mcp-scanner YARA engine for real threat detection, not just heuristics.

Would love feedback on the scoring methodology and the platform itself.

---

## Suggested Posting Time

- Tuesday or Wednesday, 8-10 AM EST (best HN engagement)
- Avoid weekends and Mondays

## Engagement Strategy

- Reply to every comment within 1 hour
- If asked about false positives: "We label it as a community reference score and link to the raw scan data"
- If asked about methodology: Share the 6-dimension breakdown with weights
- Have a few specific examples ready (the D-grade skills with CREDENTIAL HARVESTING)
