# Launch-Ready Posts — Copy & Paste Versions

> Generated: 2026-02-17
> All posts point to https://clawstack.sh

---

## 1. HACKER NEWS (Show HN)

### Submit Form

- **Title:** `Show HN: ClawStack – We scanned 6,493 OpenClaw skills, 40% have security issues`
- **URL:** `https://clawstack.sh`
- **Text:** (leave blank — URL and text are mutually exclusive on HN)

### First Comment (post immediately after submission)

```
Hey HN, maker here.

I built this after discovering that nearly half of the OpenClaw skills on ClawHub had never been independently audited for security.

We scanned all 6,493 skills using Cisco's mcp-scanner YARA engine. The results:

- 502 skills rated Dangerous (Grade D)
- 500 skills with active threats: credential harvesting, injection attacks, tool poisoning, data exfiltration
- 40.8% flagged with some security concern
- Finance skills are the riskiest category (avg score 56.5/100)

Every skill gets a 0-100 score across 6 dimensions:

  1. YARA threat scan (30%) — real signatures, not heuristics
  2. Permission analysis (20%) — shell exec, file write, network access
  3. Author reputation (15%) — GitHub account age, followers, repos
  4. External network requests (15%)
  5. Community voting (10%)
  6. Source code availability (10%)

Grades: S (90+) / A (75-89) / B (60-74) / C (40-59) / D (<40)

Some notable findings: skills promising "one API key for 70+ AI models" consistently flag for DATA EXFILTRATION. A skill called "Passive Income with Agents" triggers INJECTION + CREDENTIAL HARVESTING + PROMPT INJECTION + TOOL POISONING.

Full security report with methodology: https://clawstack.sh/security

Tech stack: Next.js 16, TypeScript, Supabase, Tailwind CSS 4, Vercel.

Would love feedback on the scoring methodology. If you think a skill got unfairly rated, let me know — happy to investigate.
```

### Timing
- Best: Tuesday or Wednesday, 8:30 AM EST / 9:30 PM Beijing Time
- Today (Monday) is OK but Tuesday is better

### Q&A Cheat Sheet

| Question | Answer |
|----------|--------|
| "False positives?" | "We label it as a community reference score. Users can vote safe/suspicious to help calibrate. We also link to the raw scan data." |
| "Why not open-source the scanner?" | "The scanner itself is Cisco's open-source mcp-scanner. Our scoring algorithm and weights are what we built on top." |
| "How is this different from ClawHub?" | "ClawHub is a registry with zero security review. We add a 6-dimension trust score to every skill." |
| "Business model?" | "Free for now. Exploring: premium API access for CI/CD integration, and a 'verified safe' badge program." |

---

## 2. REDDIT — r/MCP (or r/OpenClaw)

### Title
```
I scanned every OpenClaw skill on ClawHub for security threats — here's what I found
```

### Body
```
I built ClawStack (https://clawstack.sh), a security-focused skill discovery platform that rates all 6,493 OpenClaw skills.

**The scary numbers:**

- 502 skills got a D grade (Dangerous)
- 500 skills have active security threats (CREDENTIAL HARVESTING, INJECTION ATTACKS, TOOL POISONING)
- 40.8% of all skills have some security concern
- Finance category is the riskiest

**How it works:**

Every skill gets a 0-100 score based on:
- Real YARA-based scanning (Cisco mcp-scanner, not just heuristics)
- Permission analysis (does it run shell commands? write files?)
- Author reputation on GitHub
- Community voting
- Source code availability

**What you can do on ClawStack:**

- Search and filter 6,493 skills by security grade
- See exactly why a skill got flagged
- Create your own "Stack" page showing what you use
- Browse curated collections like "Safest Skills" and "Skills to Avoid"

Full security report with methodology: https://clawstack.sh/security

Feedback welcome — especially on scoring accuracy. If your skill got unfairly rated, let me know and I'll investigate.
```

---

## 3. REDDIT — r/selfhosted

### Title
```
Built a trust-scoring platform for OpenClaw skills after finding 500+ with security threats
```

### Body
```
If you're running OpenClaw skills on your home server, you probably want to know which ones are safe to install.

I built ClawStack (https://clawstack.sh) — think of it as a security audit for the entire OpenClaw ecosystem.

**Key findings from scanning 6,493 skills:**

- 502 rated Dangerous (Grade D)
- 500 skills with active threat signatures detected by YARA analysis
- Threats found: credential harvesters, injection attacks, data exfiltration
- Smart Home skills are the safest category (avg 70.5/100), Finance the riskiest (56.5/100)

We use Cisco's mcp-scanner YARA engine for real threat detection. Each skill gets a 6-dimension score covering permissions, author trust, network behavior, and more.

Free to use, no account needed to browse. You can also create a profile showing your stack of trusted skills.

Full security report: https://clawstack.sh/security
```

---

## 4. REDDIT — r/cybersecurity

### Title
```
Security analysis of the OpenClaw skill ecosystem: 40% flagged, 500 active threats found
```

### Body
```
I performed a large-scale security analysis of 6,493 OpenClaw skills using YARA-based scanning (Cisco mcp-scanner) combined with static analysis.

**Results:**

- 502/6,493 (7.7%) rated Dangerous
- 2,144/6,493 (33%) rated Caution
- 500 skills with active threat signatures
- Common threats: INJECTION ATTACK, CREDENTIAL HARVESTING, TOOL POISONING, DATA EXFILTRATION, SYSTEM MANIPULATION

**Methodology (6 dimensions, 100 points):**

1. YARA scan (30 pts) — Cisco mcp-scanner engine
2. Permission analysis (20 pts) — shell exec, file write, network, credentials patterns
3. Author trust (15 pts) — GitHub account age, followers, repos
4. Network behavior (15 pts) — suspicious external URL count
5. Community voting (10 pts)
6. Source code availability (10 pts)

Grade scale: S (90+) / A (75-89) / B (60-74) / C (40-59) / D (<40)

**Notable findings:**

- Finance skills have the lowest average safety score (56.5/100)
- Several skills named to look like legitimate tools are actually credential harvesters
- Skills promising "one API key for 70+ AI models" consistently flag for DATA EXFILTRATION
- A skill called "Passive Income with Agents" triggers 4 threat categories simultaneously

Full results browsable at https://clawstack.sh/security

Happy to discuss methodology or share raw data.
```

---

## LAUNCH DAY SCHEDULE

| Time (EST) | Time (Beijing) | Action |
|------------|---------------|--------|
| 8:30 AM | 9:30 PM | Submit Show HN + first comment |
| 8:35 AM | 9:35 PM | Post r/MCP (or r/OpenClaw) |
| 10:00 AM | 11:00 PM | Post r/selfhosted |
| Next day 10 AM | Next day 11 PM | Post r/cybersecurity |

## PRE-LAUNCH CHECKLIST

- [ ] Test all links: clawstack.sh, /security, /skills, /collections
- [ ] Verify OG images render correctly (paste URL in Twitter card validator)
- [ ] Have HN account ready (aged accounts get less flagged)
- [ ] Have Reddit accounts with some karma in target subreddits
- [ ] Bookmark this file for quick copy-paste
- [ ] Set a timer to check HN/Reddit every 30 min for first 4 hours
- [ ] Prepare to reply to every comment within 1 hour
