import { loadEnvConfig } from "@next/env";

async function main() {
  console.log("🚀 Loading environment configuration...");
  // Await the environment config load
  await loadEnvConfig(process.cwd());

  console.log("📦 Initializing database client...");
  // Dynamically import database modules so env variables are ready
  const { db } = await import("./index");
  const { clients, projects, messages } = await import("./schema");
  const { mockClients } = await import("../mock-data/clients");
  const { mockProjects } = await import("../mock-data/projects");
  const { mockThreads } = await import("../mock-data/messages");

  try {
    // 1. Clear existing data in correct dependency order
    console.log("🧹 Clearing existing data tables...");
    await db.delete(messages);
    await db.delete(projects);
    await db.delete(clients);

    // 2. Insert clients
    console.log("👥 Seeding clients...");
    const clientsToInsert = mockClients.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      company: c.company,
      platform: c.platform,
      sector: c.sector,
      budget: c.budget,
      avatarUrl: c.avatarUrl,
      agreementStatus: c.agreementStatus,
      activeProjects: c.activeProjects,
      clientSince: c.clientSince,
    }));
    
    if (clientsToInsert.length > 0) {
      await db.insert(clients).values(clientsToInsert);
    }

    // 3. Insert projects
    console.log("📂 Seeding projects...");
    const projectsToInsert = mockProjects.map((p) => ({
      id: p.id,
      name: p.name,
      clientId: p.clientId,
      status: p.status,
      budget: p.budget,
      progress: p.progress,
      startDate: p.startDate,
      deadline: p.deadline,
    }));
    
    if (projectsToInsert.length > 0) {
      await db.insert(projects).values(projectsToInsert);
    }

    // 4. Insert messages
    console.log("✉️ Seeding messages...");
    const messagesToInsert = mockThreads.flatMap((t) =>
      t.messages.map((m) => ({
        id: m.id,
        clientId: t.clientId,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp,
        read: m.read,
      }))
    );
    
    if (messagesToInsert.length > 0) {
      await db.insert(messages).values(messagesToInsert);
    }

    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

main();
