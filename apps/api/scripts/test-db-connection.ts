#!/usr/bin/env bun
/**
 * Test database connection script
 * This helps diagnose connection issues before running migrations
 */

import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in .env file");
  process.exit(1);
}

console.log("🔍 Testing database connection...");
console.log(`📍 Connection string: ${connectionString.replace(/:[^:@]+@/, ":****@")}`); // Hide password

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
});

try {
  const client = await pool.connect();
  const result = await client.query("SELECT NOW() as current_time, version() as pg_version");
  console.log("✅ Database connection successful!");
  console.log(`   Current time: ${result.rows[0].current_time}`);
  console.log(`   PostgreSQL version: ${result.rows[0].pg_version.split(" ")[0]} ${result.rows[0].pg_version.split(" ")[1]}`);
  client.release();
  await pool.end();
  process.exit(0);
} catch (error: any) {
  console.error("❌ Database connection failed!");
  console.error(`   Error: ${error.message}`);

  if (error.message.includes("Can't reach database server")) {
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Check if your database server is running");
    console.error("   2. Verify your DATABASE_URL is correct");
    console.error("   3. For Neon databases:");
    console.error("      - Use DIRECT connection string for migrations (not pooled)");
    console.error("      - Check if your IP is allowed in Neon dashboard");
    console.error("      - Try the direct connection URL from Neon dashboard");
    console.error("   4. Check your network/firewall settings");
  }

  await pool.end();
  process.exit(1);
}

