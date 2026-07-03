import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

async function run() {
  console.log("🚀 Loading environment configuration...");
  await loadEnvConfig(process.cwd());

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const sql = postgres(dbUrl, { ssl: "require" });

  try {
    console.log("⚡ Executing database migrations...");

    // 1. Add email column to clients table
    console.log("- Checking 'email' column on 'clients' table...");
    await sql`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS email text;
    `;
    
    // Backfill any null emails with placeholder
    await sql`
      UPDATE clients 
      SET email = 'placeholder@example.com' 
      WHERE email IS NULL;
    `;

    // Make email column NOT NULL
    await sql`
      ALTER TABLE clients 
      ALTER COLUMN email SET NOT NULL;
    `;

    // 2. Add subject and gmail_message_id columns to messages table
    console.log("- Checking columns on 'messages' table...");
    await sql`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS subject text,
      ADD COLUMN IF NOT EXISTS gmail_message_id text;
    `;

    // Add unique constraint to gmail_message_id (ignoring duplicates if constraint already exists)
    try {
      await sql`
        ALTER TABLE messages 
        ADD CONSTRAINT messages_gmail_message_id_unique UNIQUE (gmail_message_id);
      `;
      console.log("- Added unique constraint messages_gmail_message_id_unique");
    } catch (e: any) {
      if (e.code === "42710") {
        console.log("- Unique constraint already exists, skipping...");
      } else {
        throw e;
      }
    }

    // 3. Create user_oauth_tokens table
    console.log("- Creating 'user_oauth_tokens' table...");
    await sql`
      CREATE TABLE IF NOT EXISTS user_oauth_tokens (
        user_id text PRIMARY KEY NOT NULL,
        access_token text,
        refresh_token text NOT NULL,
        expires_at timestamp,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    console.log("🎉 Database migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
