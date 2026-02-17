/**
 * Take Product Hunt gallery screenshots using Playwright.
 *
 * Usage:
 *   npx playwright test scripts/take-screenshots.ts
 *   — or —
 *   npx tsx scripts/take-screenshots.ts
 */

import { chromium } from "playwright";
import * as path from "path";

const BASE_URL = "https://clawstack.sh";
const OUT_DIR = path.join(__dirname, "..", "marketing", "screenshots");
const VIEWPORT = { width: 1270, height: 760 };

interface Screenshot {
  name: string;
  url: string;
  /** Extra wait time in ms after page load */
  wait?: number;
  /** Scroll down by this many pixels before capture */
  scrollY?: number;
}

const SCREENSHOTS: Screenshot[] = [
  {
    name: "1-homepage.png",
    url: BASE_URL,
    wait: 2000,
  },
  {
    name: "2-security-report.png",
    url: `${BASE_URL}/security`,
    wait: 2000,
  },
  {
    name: "3-skill-detail-dangerous.png",
    url: `${BASE_URL}/skills/agentgram-social`,
    wait: 2000,
  },
  {
    name: "4-grade-d-filter.png",
    url: `${BASE_URL}/skills?grade=D&sort=security`,
    wait: 2000,
  },
  {
    name: "5-collections.png",
    url: `${BASE_URL}/collections`,
    wait: 2000,
  },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2, // Retina for crisp images
  });

  for (const shot of SCREENSHOTS) {
    console.log(`Capturing: ${shot.name} — ${shot.url}`);
    const page = await context.newPage();
    await page.goto(shot.url, { waitUntil: "networkidle" });

    if (shot.wait) {
      await page.waitForTimeout(shot.wait);
    }
    if (shot.scrollY) {
      await page.evaluate((y) => window.scrollTo(0, y), shot.scrollY);
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: path.join(OUT_DIR, shot.name),
      type: "png",
    });
    await page.close();
    console.log(`  ✓ Saved ${shot.name}`);
  }

  await browser.close();
  console.log(`\nDone! ${SCREENSHOTS.length} screenshots saved to marketing/screenshots/`);
}

main().catch(console.error);
