CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"company" text NOT NULL,
	"email" text NOT NULL,
	"platform" text NOT NULL,
	"sector" text NOT NULL,
	"budget" integer NOT NULL,
	"avatar_url" text NOT NULL,
	"agreement_status" text NOT NULL,
	"active_projects" integer DEFAULT 0 NOT NULL,
	"client_since" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"sender" text NOT NULL,
	"text" text NOT NULL,
	"subject" text,
	"gmail_message_id" text,
	"timestamp" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "messages_gmail_message_id_unique" UNIQUE("gmail_message_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"client_id" text NOT NULL,
	"status" text NOT NULL,
	"budget" integer NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"start_date" text NOT NULL,
	"deadline" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_oauth_tokens" (
	"user_id" text PRIMARY KEY NOT NULL,
	"access_token" text,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;