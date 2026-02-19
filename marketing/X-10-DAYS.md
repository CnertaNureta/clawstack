# ClawStack X/Twitter — 10 Days Content Calendar

> Start: Launch Day (Day 1 = HN/Reddit launch day)
> Posting time: 9-10 AM EST / 10-11 PM Beijing Time (peak engagement)
> Tone: Data-driven, slightly provocative, builder narrative

---

## Day 1 — Launch Day (Thread)

> This is the full 10-tweet thread from TWITTER-READY.md. Pin Tweet 1.

See `marketing/TWITTER-READY.md` for full thread.

---

## Day 2 — "The Worst One We Found"

### Tweet (single)

```
The most dangerous OpenClaw skill we found triggers 4 threat categories at once:

→ INJECTION ATTACK
→ CREDENTIAL HARVESTING
→ PROMPT INJECTION
→ TOOL POISONING

Its name? "Passive Income with Agents."

It's still live on ClawHub right now.

We gave it a 21/100 security score.

clawstack.sh/security
```

---

## Day 3 — "The Fake API Skills"

### Tweet (single)

```
There's a pattern we keep seeing in dangerous OpenClaw skills:

"One API key for 70+ AI models"
"Save 50% on model tokens"
"Unified LLM Gateway"

Sounds useful. But every single one flags for:

→ CREDENTIAL HARVESTING
→ DATA EXFILTRATION

They collect your API keys and send them somewhere else.

We found 3 of these. All rated Grade D.
```

---

## Day 4 — Category Ranking (visual post)

### Tweet

```
We ranked every OpenClaw skill category by average security score.

Safest:
🟢 Smart Home — 70.5
🟢 Productivity — 66.9
🟢 Entertainment — 64.6

Riskiest:
🔴 Security — 59.9
🔴 Finance — 56.5

Yes, security skills are less safe than entertainment skills.

The irony is not lost on us.

Full data: clawstack.sh/security
```

📎 Attach: Category ranking bar chart

---

## Day 5 — "How We Score" (educational)

### Tweet

```
People ask how we rate 6,493 OpenClaw skills.

It's not vibes. It's 6 signals:

1. YARA threat scan (30%) — Cisco mcp-scanner, real signatures
2. Permission analysis (20%) — does it shell exec? write files?
3. Author trust (15%) — GitHub age, followers, repos
4. Network behavior (15%) — suspicious external URLs
5. Community votes (10%) — users flag safe/suspicious
6. Source code (10%) — open repo = higher trust

Total: 0-100 → Grade S/A/B/C/D

We show the full breakdown for every skill. No black boxes.

clawstack.sh
```

---

## Day 6 — "The Numbers That Matter"

### Tweet

```
6,493 OpenClaw skills scanned.

Here's the breakdown:

S (Excellent): 510 — 7.9%
A (Good): 1,661 — 25.6%
B (Fair): 1,676 — 25.8%
C (Caution): 2,144 — 33.0%
D (Dangerous): 502 — 7.7%

Only 1 in 3 skills is truly safe.

Would you install something with a 67% chance of having issues?

Check before you install: clawstack.sh/skills
```

---

## Day 7 — "My Stack" feature (social/viral)

### Tweet

```
New: you can now create your own OpenClaw Stack.

→ Sign in with GitHub
→ Pick the skills you actually use
→ Get a public profile at clawstack.sh/@you
→ Shows your skills + your average security score

Think of it as a trust badge for your setup.

If you're sharing OpenClaw configs, show people you vetted them first.

Try it: clawstack.sh
```

---

## Day 8 — "What 510 S-Grade Skills Have in Common"

### Tweet

```
Only 510 out of 6,493 OpenClaw skills earned an S grade (90+ / 100).

What do they have in common?

✅ Open-source repo on GitHub
✅ Author with 50+ followers and 2+ year old account
✅ Zero YARA threat signatures
✅ No shell execution or credential patterns
✅ No suspicious external network calls

If you're building an OpenClaw skill and want an S grade, that's the playbook.

Browse S-grade skills: clawstack.sh/grade/s
```

---

## Day 9 — "Skills to Avoid" collection

### Tweet

```
We published a "Skills to Avoid" collection.

502 OpenClaw skills rated Grade D.

Each one has at least one of:
→ Credential harvesting patterns
→ Injection attack signatures
→ Data exfiltration behavior
→ Tool poisoning techniques

Before you install anything from ClawHub, spend 10 seconds checking its grade.

It could save you from giving away your API keys.

clawstack.sh/collections
```

---

## Day 10 — "Building in Public" reflection

### Tweet

```
10 days ago I launched ClawStack.

What started as "let me scan a few OpenClaw skills" turned into:

→ 6,493 skills analyzed
→ 502 dangerous skills flagged
→ 500 active threats detected
→ 22 curated collections built
→ A 6-dimension security scoring system

The OpenClaw ecosystem is incredible. But trust can't be optional.

If you haven't checked your skills yet:
clawstack.sh

Thanks to everyone who gave feedback, voted, and shared their stacks. We're just getting started.
```

---

## CONTENT CALENDAR SUMMARY

| Day | Theme | Hook | Type |
|-----|-------|------|------|
| 1 | Launch | "We scanned 6,493 skills" | Thread (10 tweets) |
| 2 | Worst finding | "4 threats in one skill" | Single tweet |
| 3 | Fake API pattern | "Credential harvesting wrappers" | Single tweet |
| 4 | Category ranking | "Security skills are less safe than entertainment" | Tweet + image |
| 5 | How we score | "6 signals, not vibes" | Educational thread |
| 6 | Grade breakdown | "Only 1 in 3 is safe" | Data tweet |
| 7 | My Stack feature | "Show people you vetted your setup" | Product tweet |
| 8 | S-grade playbook | "What the safest skills have in common" | Insight tweet |
| 9 | Skills to Avoid | "Check before you install" | Warning tweet |
| 10 | Reflection | "We're just getting started" | Builder narrative |

## POSTING TIPS

- Post at 10-11 PM Beijing Time (9-10 AM EST) every day
- Day 4 needs an attached image (category ranking chart)
- Like and reply to every comment within 2 hours
- Quote-tweet your own Day 1 thread on Days 5 and 10
- Retweet anyone who shares their Stack page
- Use these hashtags sparingly (max 1-2 per tweet): #OpenClaw #AIAgents #CyberSecurity
