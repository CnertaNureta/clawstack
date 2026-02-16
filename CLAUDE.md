# ClawStack

ClawStack is a trusted OpenClaw skill discovery platform. Users can browse, search, rate, and share 5,700+ OpenClaw skills with security ratings and curated collections.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Deployment:** Vercel
- **Font:** Geist Sans / Geist Mono

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # REST API (skills, auth, OG images)
│   ├── collections/      # Curated skill collections
│   ├── skills/           # Skill listing & detail pages
│   ├── trending/         # Trending skills
│   ├── security/         # Security info page
│   └── u/[username]/     # User profile pages
├── components/
│   ├── layout/           # Header, Footer, SearchBar
│   └── skills/           # SkillCard, InstallCommand, CategoryFilter, SecurityBadge
└── lib/
    ├── security/         # Security scoring & skill analysis
    └── supabase/         # Supabase client, server, types
```

## Database Tables

skills, users, votes, reviews, security_votes, user_stacks, collections, quiz_results

## Commands

- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Product Positioning

**One-liner:** The trusted way to discover and share OpenClaw skills.

**Core opportunity:** No one is building a "trusted skill discovery platform" — security is the #1 pain point (341 malicious skills found on ClawHub, Atomic Stealer, 7.1% exposing API keys).

**Differentiation triangle:**
1. **Trust** — Every skill has a security score
2. **Curation** — Editor picks, themed collections, not just a list
3. **Social** — Share your Stack, see what others use

## Core Features (MVP)

### 3.1 Skill Directory (Base layer)
- 5,700+ skills from ClawHub
- Categories: Communication / Productivity / Dev Tools / Smart Home / Finance / Entertainment / Security
- Detail page: name, description, author, install command (copy), security grade, user rating, similar skills

### 3.2 Security Scoring System (Key differentiator)
| Dimension | Weight | Detection |
|---|---|---|
| VirusTotal scan | 30% | VT API |
| Sensitive permissions | 20% | Parse SKILL.md |
| Author GitHub age/reputation | 15% | GitHub API |
| External requests in code | 15% | Static analysis |
| Community vote (safe/suspicious) | 10% | User voting |
| Source code available | 10% | Check repo link |

Grades: S / A / B / C / D displayed as badge on each skill card

### 3.3 Leaderboard & Trending
- Today's Hot, This Week's Rising, Most Trusted, New Arrivals
- Updated daily for retention

### 3.4 My Stack (Viral growth engine)
- Users select skills they use → generate personal Stack page at clawstack.dev/@username
- Shows avatar + bio + skills list + overall security score
- OG Image for Twitter/X sharing
- Viral loop: create Stack → share → others see → create their own

### 3.5 Skill Recommendation Wizard (Quiz)
- 3-step questionnaire: role → platform → automation goal
- Outputs personalized recommendation + one-click install script
- Each result page is unique, shareable, SEO-indexable

## Page Structure

```
/                     → Home (Trending + Editor Picks + Search)
/skills               → All Skills (filter/sort/search)
/skills/[slug]        → Skill Detail (security score + reviews + alternatives)
/trending             → Leaderboard (Daily/Weekly/All-time)
/collections          → Themed Collections
/collections/[slug]   → Single Collection
/quiz                 → Skill Recommendation Wizard
/quiz/result/[id]     → Quiz Result (shareable)
/u/[username]         → My Stack Profile Page
/security             → Security Info Page
```

## Development Timeline (Feb 9 → Feb 28, 20 days)

### Phase 1: Foundation (Feb 9-12, 4 days)
- [x] Day 1: Project init + data scraping script + database schema
- [x] Day 2: Scrape ClawHub data + security scoring algorithm V1
- [x] Day 3: Homepage + Skill list page + Skill detail page
- [x] Day 4: Search + category filter + leaderboard page

### Phase 2: Differentiating Features (Feb 13-16, 4 days)
- [x] Day 5: GitHub OAuth login + user voting
- [x] Day 6: My Stack feature + profile page
- [x] Day 7: OG Image dynamic generation (share cards)
- [x] Day 8: Skill Recommendation Wizard (Quiz)

### Phase 3: SEO & Content (Feb 17-19, 3 days)
- [ ] Day 9: SEO optimization (meta tags, sitemap, structured data)
- [ ] Day 10: Create 20+ curated collections
- [ ] Day 11: Submit to Google Search Console + Bing

### Phase 4: Growth Sprint (Feb 20-28, 9 days)
- [ ] Day 12: Launch on Hacker News + Reddit
- [ ] Day 13: Twitter/X security data report + infographic
- [ ] Day 14: Product Hunt Launch
- [ ] Day 15: OpenClaw Discord/community promotion
- [ ] Day 16-17: Contact skill developers to claim pages
- [ ] Day 18-19: Iterate based on data
- [ ] Day 20: Final push + data harvest

## Growth Strategy

- **Cold start:** Scrape all data, run security scoring, create 10 curated collections, create demo Stack pages
- **SEO matrix:** 5,700+ skill pages + 50+ collection pages as landing pages
- **Community launch:** HN (Show HN with security angle), Reddit (r/OpenClaw, r/selfhosted), Twitter/X (security data report), Product Hunt
- **Viral loop:** My Stack sharing on Twitter → others click → create their own Stack
- **Retention:** Daily leaderboard updates, new skill alerts, security warnings, weekly digest

## MAU Target

- Conservative: 3,000-5,000 MAU
- Optimistic (HN front page + Twitter viral): 10,000-20,000+

## Risk Mitigation

- ClawHub API limits → Scrape GitHub openclaw/skills repo directly
- Security score accuracy concerns → Label as "community reference score", cite VirusTotal
- SEO slow to kick in → Focus on community + Stack viral loop
- Time pressure → Cut Quiz, keep Skill Directory + Security Scoring + My Stack

## Notes

- Environment variables are in `.env.local`
- Skills data is imported via `scripts/` from a cloned skills repo
- Security grades: S, A, B, C, D
- RLS is enabled on all tables; public read, authenticated write
- Product only needs 70 points, growth must be 100 points — MAU is what matters
