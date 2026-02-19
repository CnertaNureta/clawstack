# X/Twitter — OpenClaw Community Posts

> These posts are designed for the OpenClaw/MCP community on X.
> Tag relevant accounts: @OpenClaw, @AnthropicAI, @ModelContextProtocol (if they exist)
> Tone: Community member sharing a useful resource, not marketing pitch

---

## Post 1 — Launch Announcement (Day 1, same day as HN)

```
I love OpenClaw. I use it every day.

But I had a question nobody could answer: which skills are actually safe to install?

So I scanned all 6,493 skills on ClawHub using YARA-based threat detection.

Results:
• 502 skills are Dangerous (Grade D)
• 500 have active threats — credential harvesting, injection attacks, data exfiltration
• 40.8% flagged with security concerns

I built ClawStack to make this data browsable:
→ Every skill gets a 0-100 security score
→ Filter by grade, category, trending
→ "Skills to Avoid" collection
→ "Safest Skills" collection

Free, no account needed to browse.

clawstack.sh

If you're an OpenClaw skill author, check your score — I'm happy to explain any rating.
```

---

## Post 2 — Value to Skill Authors (Day 3)

```
If you've published an OpenClaw skill on ClawHub, you now have a security score on ClawStack.

What your score means:

S (90-100): Excellent — open source, clean code, trusted author
A (75-89): Good — minor flags but generally safe
B (60-74): Fair — some permissions or patterns worth noting
C (40-59): Caution — users should review before installing
D (0-39): Dangerous — active threats detected

Want to improve your score? Here's what matters most:

1. Open-source your repo on GitHub (+10 pts)
2. Avoid unnecessary shell execution (-6 pts if detected)
3. Don't hardcode credentials (-6 pts if detected)
4. Build a GitHub presence (2+ years, 50+ followers = +11 pts)

Check your skill: clawstack.sh/skills

If you think your rating is unfair, reply here — I'll investigate.
```

---

## Post 3 — Security Alert (Day 5)

```
PSA for the OpenClaw community:

We found a pattern of skills disguising credential harvesters as useful tools.

Red flags to watch for:

🚩 "One API key for 70+ AI models"
🚩 "Save 50% on model tokens"
🚩 "Unified LLM Gateway"

These skills ask for your API keys — OpenAI, Anthropic, Google — then send them to external servers.

We found 3 variants, all rated Grade D on ClawStack.

Before you install any skill that asks for API keys, check its security score first.

clawstack.sh/skills?grade=D&sort=security
```

---

## Post 4 — Community Engagement (Day 7)

```
Question for the OpenClaw community:

We've scored 6,493 skills. Here are the safest categories:

🟢 Smart Home — 70.5 avg
🟢 Productivity — 66.9
🟡 Dev Tools — 64.0
🔴 Finance — 56.5

What skills are you using? Are they safe?

You can now create a "Stack" on ClawStack:
→ Sign in with GitHub
→ Pick your skills
→ Get a profile at clawstack.sh/@you
→ See your average security score

Share your Stack below 👇

I'll start — here's mine: clawstack.sh/@[your-username]
```

---

## Post 5 — Curated Collections for OpenClaw Users (Day 9)

```
We built 22 curated OpenClaw skill collections to help you find what you need faster:

For safety:
🛡️ Safest Skills (Grade S) — clawstack.sh/grade/s
⚠️ Skills to Avoid (Grade D) — clawstack.sh/grade/d

For use case:
💻 Best for Developers
💬 Communication Essentials
🏠 Smart Home Picks
💰 Finance (use with caution)

For discovery:
🔥 Most Popular (All Time)
🆕 Beginner Friendly
🐙 GitHub Integrations

Every collection shows security grades so you can make informed decisions.

Browse all: clawstack.sh/collections

What collections should we add next? Reply with ideas.
```

---

## Post 6 — Open Letter to ClawHub (Day 12, after traction builds)

```
Open letter to ClawHub and the OpenClaw team:

I built ClawStack because the ecosystem needs a trust layer.

The data speaks for itself:
• 6,493 skills on ClawHub
• 502 rated Dangerous
• 500 with active YARA threat signatures
• Zero security warnings on ClawHub itself

I'm not saying ClawHub is bad — it's an incredible platform that enabled the whole ecosystem.

But as OpenClaw grows, trust infrastructure becomes essential.

What I'd love to see:
1. Security badges on ClawHub skill pages
2. A review process for new submissions
3. Community flagging for suspicious skills

Until then, ClawStack is here to fill the gap.

I'd love to collaborate with the OpenClaw team on this. DMs are open.

clawstack.sh/security
```

---

## POSTING SCHEDULE

| Day | Post | Theme |
|-----|------|-------|
| Day 1 (Launch) | Post 1 | "I scanned everything" — launch announcement |
| Day 3 | Post 2 | Value to skill authors — check your score |
| Day 5 | Post 3 | Security alert — fake API key skills |
| Day 7 | Post 4 | Community engagement — share your Stack |
| Day 9 | Post 5 | Curated collections showcase |
| Day 12 | Post 6 | Open letter to ClawHub |

## ENGAGEMENT RULES

- Reply to every comment, especially skill authors checking their scores
- If someone disagrees with a rating, investigate publicly and show transparency
- Retweet anyone who shares their Stack page
- Thank anyone who shares ClawStack
- Never be defensive about methodology — explain the 6 dimensions calmly
- If ClawHub/OpenClaw team responds, be collaborative not adversarial
