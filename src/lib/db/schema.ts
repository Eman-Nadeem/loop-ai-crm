import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  platform: text("platform").$type<"upwork" | "fiverr" | "freelancer">().notNull(),
  sector: text("sector").$type<"UX/UI Design" | "Branding" | "Media">().notNull(),
  budget: integer("budget").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  agreementStatus: text("agreement_status").$type<"signed" | "negotiating">().notNull(),
  activeProjects: integer("active_projects").notNull().default(0),
  clientSince: text("client_since").notNull(), // stored as YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  status: text("status").$type<"active" | "completed" | "on_hold">().notNull(),
  budget: integer("budget").notNull(),
  progress: integer("progress").notNull().default(0),
  startDate: text("start_date").notNull(), // stored as YYYY-MM-DD
  deadline: text("deadline").notNull(), // stored as YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  sender: text("sender").$type<"client" | "me">().notNull(),
  text: text("text").notNull(),
  subject: text("subject"),
  gmailMessageId: text("gmail_message_id").unique(),
  timestamp: text("timestamp").notNull(), // ISO Date String
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userOAuthTokens = pgTable("user_oauth_tokens", {
  userId: text("user_id").primaryKey(), // Clerk User ID
  accessToken: text("access_token"),
  refreshToken: text("refresh_token").notNull(), // Encrypted
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
