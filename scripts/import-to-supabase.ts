/**
 * Import scraped skills data into Supabase
 *
 * Prerequisites:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. Run the migration SQL in Supabase Dashboard
 *   3. Run scrape-clawhub.ts first to generate skills.json
 *
 * Usage:
 *   npx tsx scripts/import-to-supabase.ts
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: Missing Supabase credentials in .env.local");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "set" : "MISSING");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_KEY ? "set" : "MISSING");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const inputPath = path.join(__dirname, "output", "skills.json");

  if (!fs.existsSync(inputPath)) {
    console.error(`ERROR: ${inputPath} not found.`);
    console.error("Run 'npx tsx scripts/scrape-clawhub.ts' first.");
    process.exit(1);
  }

  const skills = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  console.log(`=== Importing ${skills.length} skills into Supabase ===\n`);

  // Clear existing data (for fresh import)
  console.log("Clearing existing skills...");
  const { error: deleteError } = await supabase.from("skills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) {
    console.warn("Warning clearing skills:", deleteError.message);
  }

  // Insert in batches of 100
  const BATCH_SIZE = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < skills.length; i += BATCH_SIZE) {
    const batch = skills.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase.from("skills").insert(batch).select("id");

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
      errors += batch.length;

      // Try individual inserts for failed batch
      for (const skill of batch) {
        const { error: singleError } = await supabase.from("skills").insert(skill);
        if (singleError) {
          console.error(`    Failed: ${skill.name} — ${singleError.message}`);
          errors++;
        } else {
          inserted++;
          errors--; // Correct the count
        }
      }
    } else {
      inserted += data?.length || batch.length;
    }

    console.log(`  Imported ${Math.min(i + BATCH_SIZE, skills.length)}/${skills.length}...`);
  }

  console.log(`\n=== Import complete ===`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Errors: ${errors}`);

  // Verify
  const { count } = await supabase.from("skills").select("*", { count: "exact", head: true });
  console.log(`  Total in database: ${count}`);

  console.log(`\nNext step: run 'npx tsx scripts/seed-collections.ts' to create collections.`);
}

main().catch(console.error);
