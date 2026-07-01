"use server";

import { db } from "@/lib/db";
import { clients, projects, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// 1. Fetch entire CRM State in parallel
export async function fetchCRMState() {
  try {
    const clientsData = await db.select().from(clients);
    const projectsData = await db.select().from(projects);
    const messagesData = await db.select().from(messages);

    // Resolve client reference on projects
    const resolvedProjects = projectsData.map((p) => {
      const client = clientsData.find((c) => c.id === p.clientId);
      return {
        ...p,
        client,
      };
    });

    // Group messages by clientId to form Threads
    const threadsMap = new Map<string, any[]>();
    
    // Ensure all clients have a thread, even if empty
    clientsData.forEach((c) => {
      threadsMap.set(c.id, []);
    });

    messagesData.forEach((msg) => {
      const thread = threadsMap.get(msg.clientId);
      if (thread) {
        thread.push({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
          read: msg.read,
        });
      }
    });

    const resolvedThreads = Array.from(threadsMap.entries()).map(([clientId, msgs]) => {
      const client = clientsData.find((c) => c.id === clientId);
      // Sort messages by timestamp ascending
      const sortedMsgs = msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return {
        clientId,
        client,
        messages: sortedMsgs,
      };
    });

    return {
      clients: clientsData,
      projects: resolvedProjects,
      threads: resolvedThreads,
    };
  } catch (error) {
    console.error("Error fetching CRM State:", error);
    throw new Error("Failed to load workspace data from the database.");
  }
}

// 2. Client CRUD Actions
export async function createClientDb(newClient: any) {
  try {
    await db.insert(clients).values(newClient);
    return { success: true };
  } catch (error) {
    console.error("Error creating client:", error);
    throw new Error("Failed to onboard client.");
  }
}

export async function updateClientDb(id: string, updatedFields: any) {
  try {
    await db.update(clients).set(updatedFields).where(eq(clients.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error updating client:", error);
    throw new Error("Failed to update client.");
  }
}

export async function deleteClientDb(id: string) {
  try {
    // Cascading foreign keys will automatically delete projects and messages on Postgres
    await db.delete(clients).where(eq(clients.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    throw new Error("Failed to delete client.");
  }
}

// 3. Project CRUD Actions
export async function createProjectDb(newProj: any) {
  try {
    await db.insert(projects).values(newProj);
    return { success: true };
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to track project.");
  }
}

export async function updateProjectDb(id: string, updatedFields: any) {
  try {
    await db.update(projects).set(updatedFields).where(eq(projects.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project.");
  }
}

export async function deleteProjectDb(id: string) {
  try {
    await db.delete(projects).where(eq(projects.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project.");
  }
}

// 4. Message Actions
export async function addMessageDb(newMsg: any) {
  try {
    await db.insert(messages).values(newMsg);
    return { success: true };
  } catch (error) {
    console.error("Error adding message:", error);
    throw new Error("Failed to send message.");
  }
}

export async function markThreadReadDb(clientId: string) {
  try {
    await db
      .update(messages)
      .set({ read: true })
      .where(and(eq(messages.clientId, clientId), eq(messages.sender, "client")));
    return { success: true };
  } catch (error) {
    console.error("Error marking thread read:", error);
    throw new Error("Failed to update messages read status.");
  }
}
