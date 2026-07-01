#!/usr/bin/env node
/**
 * Discovers the correct Supabase pooler host for your project.
 * Usage: node scripts/discover-supabase-pooler.mjs
 * Requires DATABASE_URL password already URL-encoded in .env, or set SUPABASE_DB_PASSWORD.
 */

import { readFileSync, writeFileSync } from "fs";
import { spawnSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const projectRef = "itzpoeibycrcrqovuehe";

const regions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "eu-central-2",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "sa-east-1",
  "ca-central-1",
];

const clusters = ["aws-0", "aws-1", "aws-2"];

function loadPassword() {
  if (process.env.SUPABASE_DB_PASSWORD) {
    return encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
  }
  try {
    const env = readFileSync(resolve(root, ".env"), "utf8");
    const match = env.match(
      /postgres\.itzpoeibycrcrqovuehe:([^@]+)@/
    );
    if (match) return match[1];
  } catch {
    // ignore
  }
  console.error(
    "Could not read encoded password from .env. Set SUPABASE_DB_PASSWORD."
  );
  process.exit(1);
}

const encodedPassword = loadPassword();

console.log("Searching for your Supabase pooler host...\n");

for (const cluster of clusters) {
  for (const region of regions) {
    const host = `${cluster}-${region}.pooler.supabase.com`;
    const directUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@${host}:5432/postgres`;

    const result = spawnSync(
      "npx",
      ["prisma", "db", "execute", "--stdin"],
      {
        cwd: root,
        env: { ...process.env, DATABASE_URL: directUrl, DIRECT_URL: directUrl },
        input: "SELECT 1",
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    const stderr = result.stderr || "";
    const success = result.status === 0;

    if (success) {
      const databaseUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@${host}:6543/postgres?pgbouncer=true`;
      console.log(`Found pooler: ${host}\n`);
      console.log("Add these to your .env:\n");
      console.log(`DATABASE_URL="${databaseUrl}"`);
      console.log(`DIRECT_URL="${directUrl}"`);

      try {
        let env = readFileSync(resolve(root, ".env"), "utf8");
        env = env.replace(
          /^DATABASE_URL=.*$/m,
          `DATABASE_URL="${databaseUrl}"`
        );
        env = env.replace(/^DIRECT_URL=.*$/m, `DIRECT_URL="${directUrl}"`);
        if (!/^DIRECT_URL=/m.test(env)) {
          env += `\nDIRECT_URL="${directUrl}"\n`;
        }
        writeFileSync(resolve(root, ".env"), env);
        console.log("\nUpdated .env automatically.");
      } catch {
        console.log("\nCopy the lines above into your .env manually.");
      }
      process.exit(0);
    }

    if (
      !stderr.includes("tenant") &&
      !stderr.includes("ENOTFOUND") &&
      !stderr.includes("Can't reach") &&
      stderr.includes("password")
    ) {
      console.error("Wrong password. Check your database password in Supabase.");
      process.exit(1);
    }
  }
}

console.error(
  "Could not find pooler host. Copy connection strings from:\n" +
    "Supabase Dashboard → Project Settings → Database → Connection string → URI"
);
process.exit(1);
