# Reddit Launch Posts

---

## Post 1: r/OpenClaw

### Title
I scanned every OpenClaw skill on ClawHub for security threats — here's what I found

### Body

I built ClawStack (https://clawstack.dev), a security-focused skill discovery platform that rates all 6,493 OpenClaw skills.

**The scary numbers:**
- 502 skills got a D grade (Dangerous)
- 500 skills have active security threats (CREDENTIAL HARVESTING, INJECTION ATTACKS, TOOL POISONING)
- 40.8% of all skills have some security concern
- Finance category is the riskiest

**How it works:**
Every skill gets a 0-100 score based on:
- Real YARA-based scanning (not just heuristics)
- Permission analysis (does it run shell commands? write files?)
- Author reputation on GitHub
- Community voting
- Source code availability

**What you can do:**
- Search and filter skills by security grade
- See exactly why a skill got flagged
- Create your own "Stack" page showing what you use
- Browse curated collections like "Safest Skills" and "Skills to Avoid"

Check the full security report: https://clawstack.dev/security

Feedback welcome — especially on scoring accuracy. If your skill got unfairly rated, let me know and I'll investigate.

---

## Post 2: r/selfhosted

### Title
Built a trust-scoring platform for OpenClaw skills after finding 500+ with security threats

### Body

If you're running OpenClaw skills on your home server, you probably want to know which ones are safe.

I built ClawStack (https://clawstack.dev) — think of it as a security audit for the entire OpenClaw ecosystem.

**Key findings from scanning 6,493 skills:**
- 502 rated Dangerous (Grade D)
- Threats found: credential harvesters, injection attacks, data exfiltration
- Smart Home skills are the safest category (avg 70.5/100), Finance the riskiest (56.5/100)

We use Cisco's mcp-scanner YARA engine for real threat detection. Each skill gets a 6-dimension score covering permissions, author trust, network behavior, and more.

Free to use, no account needed to browse. You can also create a profile showing your stack of trusted skills.

https://clawstack.dev/security — full security report with methodology

---

## Post 3: r/cybersecurity

### Title
Security analysis of the OpenClaw skill ecosystem: 40% flagged, 500 active threats

### Body

I performed a large-scale security analysis of 6,493 OpenClaw skills using YARA-based scanning (Cisco mcp-scanner) combined with static analysis.

**Results:**
- 502/6,493 (7.7%) rated Dangerous
- 2,144/6,493 (33%) rated Caution
- 500 skills with active threat signatures
- Common threats: INJECTION ATTACK, CREDENTIAL HARVESTING, TOOL POISONING, DATA EXFILTRATION, SYSTEM MANIPULATION

**Methodology (6 dimensions, 100 points):**
1. YARA scan (30 pts) — Cisco mcp-scanner
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

Full results browsable at https://clawstack.dev/security

Happy to discuss methodology or share more detailed data.

---

## Posting Schedule

| Platform | Day | Time (EST) |
|----------|-----|------------|
| r/OpenClaw | Day 1 (same as HN) | 10 AM |
| r/selfhosted | Day 1 | 12 PM |
| r/cybersecurity | Day 2 | 10 AM |
