# Product Hunt — Copy & Paste Launch Version

> Launch day: Thursday 2/20 (after HN/Reddit feedback settled)
> Schedule: 12:01 AM PST / 4:01 PM Beijing Time

---

## SUBMIT FORM FIELDS

### Product Name
```
ClawStack
```

### Website
```
https://clawstack.sh
```

### Tagline (pick one, 60 chars max)

Option A (data-driven):
```
We scanned 6,493 OpenClaw skills — 40% have security issues
```

Option B (benefit-focused):
```
The trusted way to discover safe OpenClaw skills
```

Option C (problem-focused):
```
Security ratings for every OpenClaw skill on ClawHub
```

### Topics (select on PH)
```
Developer Tools, Cybersecurity, Open Source, Artificial Intelligence
```

### Description

```
OpenClaw has 6,493 skills on ClawHub — but zero security review process. Anyone can publish anything.

We scanned every single one using Cisco's YARA-based threat detection engine. The results:

• 502 skills rated Dangerous (Grade D)
• 500 skills with active security threats detected
• 40.8% flagged with some level of security concern
• Threats include: credential harvesting, injection attacks, tool poisoning, data exfiltration

ClawStack gives every skill a security grade (S/A/B/C/D) based on a 0-100 score across 6 dimensions:

1. YARA threat scan (30%) — real signatures via Cisco mcp-scanner
2. Permission analysis (20%) — shell exec, file write, network access
3. Author GitHub reputation (15%) — account age, followers, repos
4. External network requests (15%) — suspicious URL detection
5. Community trust voting (10%) — users vote safe/suspicious
6. Source code availability (10%) — open repo = higher trust

Key features:
• Browse and search 6,493 skills with security ratings
• Filter by grade, category, trending
• 22 curated collections: "Safest Skills", "Skills to Avoid", "Best for Devs"
• My Stack — create your profile at clawstack.sh/@you showing your vetted skills
• Skill Recommendation Quiz — 3-step wizard to find the right skills
• Full security report with methodology at clawstack.sh/security

Built with Next.js 16, TypeScript, Supabase, and Tailwind CSS 4.

Free to use. No account needed to browse.
```

---

## MAKER'S COMMENT (post immediately after launch goes live)

```
Hey Product Hunt! 👋

I started building ClawStack after a simple question: how do you know which OpenClaw skills are safe to install?

The answer was uncomfortable — you don't. ClawHub has no review process, no security ratings, and no way to distinguish a legitimate developer tool from a credential harvester.

So I did what any paranoid developer would do: I scanned all 6,493 skills.

The results were worse than I expected. 502 skills are actively dangerous. One skill called "Passive Income with Agents" triggers four separate threat categories: injection, credential harvesting, prompt injection, and tool poisoning. Several skills promising "one API key for 70+ AI models" are just data exfiltration wrappers.

ClawStack is my attempt to build the trust layer the OpenClaw ecosystem is missing. Every skill gets a transparent security grade — you can see exactly which dimensions scored low and why.

I'd love your feedback on:
→ Is the 6-dimension scoring approach the right one?
→ How should we communicate risk without causing panic?
→ What would make you come back to check skills regularly?

Thanks for checking it out! Happy to answer any questions about the methodology or the data.
```

---

## GALLERY IMAGES (1270x760, in this order)

### Image 1 — Hero (most important, shows in feed)
**What to capture:** Homepage with the search bar, trending skills, and security grades visible
**URL to screenshot:** `https://clawstack.sh`
**Notes:** Make sure Grade badges (S/A/B/C/D) are clearly visible on skill cards

### Image 2 — Security Report
**What to capture:** The security report page with grade distribution chart and stats
**URL to screenshot:** `https://clawstack.sh/security`
**Notes:** This is the key differentiator — show the data

### Image 3 — Skill Detail with Security Breakdown
**What to capture:** A D-grade skill showing the security score breakdown (6 dimensions)
**URL to screenshot:** `https://clawstack.sh/skills/[pick-a-D-grade-skill]`
**Notes:** Choose one with visible threat names for maximum impact

### Image 4 — Grade Filtering
**What to capture:** Skills page filtered by Grade D, showing dangerous skills list
**URL to screenshot:** `https://clawstack.sh/skills?grade=D&sort=security`
**Notes:** Shows the "Skills to Avoid" use case

### Image 5 — Collections
**What to capture:** Collections page showing curated lists
**URL to screenshot:** `https://clawstack.sh/collections`
**Notes:** Shows curation, not just raw data

### Thumbnail (240x240 PNG)
**What to use:** ClawStack logo on solid background

### OG Image (1200x630)
**Auto-generated at:** `https://clawstack.sh/api/og`

---

## LAUNCH DAY TIMELINE

| Beijing Time | PST | Action |
|-------------|-----|--------|
| **16:01** (Thu) | 12:01 AM | PH launch goes live |
| **16:05** | 12:05 AM | Post maker's comment |
| **17:00** | 1:00 AM | Share PH link privately to supporters, ask for upvotes |
| **20:00** | 4:00 AM | Check early comments, reply to all |
| **21:30** | 5:30 AM | Cross-post PH link in HN thread (if still active) |
| **23:00** | 7:00 AM | US waking up — peak upvote hours begin |
| **次日 02:00** | 10:00 AM | Monitor ranking, reply to all new comments |
| **次日 05:00** | 1:00 PM | Mid-day check, thank supporters |
| **次日 08:00** | 4:00 PM | Voting closes — final push |

---

## REPLY TEMPLATES

### "How accurate is the scoring?"
```
Great question! We combine 6 signals to reduce false positives. The YARA scan (30% of score) uses real threat signatures — same engine used in enterprise security. The remaining 70% comes from static analysis, author reputation, and community voting. We're transparent about it: click any skill to see the exact breakdown of all 6 dimensions. We also encourage community voting to help calibrate scores over time.
```

### "Is this open source?"
```
The scanning engine we use (Cisco mcp-scanner) is open source. The ClawStack platform and our scoring weights are currently proprietary, but we're considering open-sourcing the scoring algorithm so the community can audit and improve it. Would that be valuable to you?
```

### "What's the business model?"
```
Free to use right now — our priority is building trust in the ecosystem. Down the road, we're exploring: (1) a CI/CD integration API so teams can auto-check skills before installing, (2) a "Verified Safe" badge program for skill authors, and (3) premium security reports for enterprise teams. But the core browsing and security grades will always be free.
```

### "False positive / my skill is rated unfairly"
```
Sorry about that! Our scoring is transparent — click on your skill to see the exact dimension breakdown. Common causes of low scores: (1) the skill uses shell execution for legitimate reasons, (2) author GitHub account is new, (3) the scanner flagged a pattern that's benign in context. Please share the skill URL and I'll investigate. Community voting also helps correct inaccuracies over time.
```

### "How is this different from [competitor]?"
```
ClawHub is a registry — it hosts skills but doesn't rate them. ClawStack is a trust layer on top: we independently scan and score every skill across 6 security dimensions. Think of it as "VirusTotal meets Product Hunt" for the OpenClaw ecosystem. We also add curation (22 collections), social features (share your Stack), and a recommendation quiz.
```

---

## PRE-LAUNCH CHECKLIST

### 1 Week Before
- [ ] Create PH maker profile (add avatar, bio, Twitter link)
- [ ] Reach out to a PH hunter with 1,000+ followers (offer early access to security data)
- [ ] Prepare all 5 gallery screenshots (1270x760)
- [ ] Prepare thumbnail (240x240)
- [ ] Draft the submission — save as draft on PH

### 3 Days Before
- [ ] Collect supporter list (friends, colleagues, community contacts)
- [ ] Draft DMs to send on launch morning
- [ ] Test all links one more time
- [ ] Schedule a "coming soon" tweet hinting at PH launch

### Launch Day
- [ ] Schedule launch for 12:01 AM PST
- [ ] Immediately post maker's comment
- [ ] Send DMs to supporter list with PH link
- [ ] Monitor and reply to every comment within 30 minutes
- [ ] Cross-promote on Twitter, HN thread, Reddit threads
- [ ] Track ranking throughout the day
- [ ] Thank every person who comments or upvotes

### Day After
- [ ] Post a "thank you" tweet with results
- [ ] Write a brief post-mortem (what worked, what didn't)
- [ ] Follow up with anyone who offered feedback
