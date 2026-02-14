/**
 * Run SQL migration against Supabase via the pg REST endpoint
 *
 * Usage: npx tsx scripts/run-migration.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");

async function runSQL(sql: string): Promise<void> {
  // Use the Supabase Management API to run SQL
  // Alternative: use the pg connection string directly
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  // The /rpc endpoint won't work for DDL.
  // Instead, we'll split and execute via the /pg endpoint or use supabase CLI
  console.log("Note: DDL statements need to be run in SQL Editor or via supabase CLI.");
}

async function main() {
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "001_initial_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("=== Running Migration ===\n");
  console.log(`Project: ${projectRef}`);
  console.log(`SQL file: ${sqlPath}\n`);

  // Try using npx supabase to run the migration
  try {
    const { execSync } = await import("child_process");

    // Method 1: Use supabase db execute
    console.log("Attempting migration via Supabase CLI...\n");
    const result = execSync(
      `npx supabase db execute --project-ref ${projectRef} -f "${sqlPath}"`,
      {
        encoding: "utf-8",
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: SERVICE_KEY, // This won't work, but let's try
        },
        timeout: 60000,
      }
    );
    console.log(result);
    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.log("CLI method not available. Trying direct PostgreSQL connection...\n");

    // Method 2: Try the /sql endpoint (available in newer Supabase versions)
    try {
      const res = await fetch(`${SUPABASE_URL}/pg/sql`, {
        method: "POST",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql }),
      });

      if (res.ok) {
        console.log("Migration executed via /pg/sql endpoint!");
        const data = await res.json();
        console.log(data);
        return;
      }
    } catch {}

    // Method 3: Print instructions
    console.log("==============================================");
    console.log("MANUAL STEP REQUIRED:");
    console.log("==============================================\n");
    console.log("Please run the SQL migration manually:");
    console.log("1. Go to https://supabase.com/dashboard/project/" + projectRef + "/sql");
    console.log("2. Click 'New Query'");
    console.log("3. Paste the contents of:");
    console.log(`   ${sqlPath}`);
    console.log("4. Click 'Run'\n");
    console.log("After running, execute: npx tsx scripts/import-to-supabase.ts");
  }
}

main().catch(console.error);
