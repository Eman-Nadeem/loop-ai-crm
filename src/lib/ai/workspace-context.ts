import { db } from "@/lib/db";
import { clients, projects, messages } from "@/lib/db/schema";
import { mockClients } from "@/lib/mock-data/clients";
import { mockProjects } from "@/lib/mock-data/projects";
import { mockThreads } from "@/lib/mock-data/messages";

export interface WorkspaceContextResult {
  contextText: string;
  isGrounded: boolean;
  groundedType?: "overdue" | "unread" | "budget" | "client_drilldown" | "general_summary";
}

/**
 * Parses user prompt and queries the active state database (or falls back to mock lists)
 * to build a concise context string suitable for system prompt injection.
 */
export async function getWorkspaceContext(prompt: string): Promise<WorkspaceContextResult> {
  const query = prompt.toLowerCase().trim();
  
  // 1. Fetch CRM State
  let clientsData = mockClients;
  let projectsData: any[] = mockProjects;
  let threadsData: any[] = mockThreads;
  let isDbConnected = false;

  try {
    const clientsRows = await db.select().from(clients);
    const projectsRows = await db.select().from(projects);
    const messagesRows = await db.select().from(messages);

    // Resolve client reference on projects
    const resolvedProjects = projectsRows.map((p) => {
      const client = clientsRows.find((c) => c.id === p.clientId);
      return {
        ...p,
        client,
      };
    });

    // Group messages by clientId to form Threads
    const threadsMap = new Map<string, any[]>();
    
    // Ensure all clients have a thread, even if empty
    clientsRows.forEach((c) => {
      threadsMap.set(c.id, []);
    });

    messagesRows.forEach((msg) => {
      const thread = threadsMap.get(msg.clientId);
      if (thread) {
        thread.push({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
          read: msg.read,
          subject: msg.subject,
        });
      }
    });

    const resolvedThreads = Array.from(threadsMap.entries()).map(([clientId, msgs]) => {
      const client = clientsRows.find((c) => c.id === clientId);
      // Sort messages by timestamp ascending
      const sortedMsgs = msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return {
        clientId,
        client,
        messages: sortedMsgs,
      };
    });

    const unmatchedThreads = [
      {
        clientId: "unmatched-1",
        isUnmatched: true,
        unmatchedEmail: "unknown@vendor.com",
        messages: [
          {
            id: "mu1_1",
            sender: "client",
            text: "Hi, I saw your profile and wanted to inquire if you have availability for a new branding audit next week. Let me know your rates.",
            timestamp: "2026-07-02T10:00:00Z",
            read: false,
            subject: "New Branding Audit RFP"
          }
        ]
      },
      {
        clientId: "unmatched-2",
        isUnmatched: true,
        unmatchedEmail: "service@billing-portal.com",
        messages: [
          {
            id: "mu2_1",
            sender: "client",
            text: "Your monthly invoice for cloud services has been generated. Amount due: $84.50. Payment will be processed automatically.",
            timestamp: "2026-07-01T08:30:00Z",
            read: true,
            subject: "Monthly Statement - June 2026"
          }
        ]
      },
      {
        clientId: "unmatched-3",
        isUnmatched: true,
        unmatchedEmail: "info@techinsights-newsletter.com",
        messages: [
          {
            id: "mu3_1",
            sender: "client",
            text: "This week's edition covers the emergence of AI workflows in B2B SaaS platforms. Read about the new agent architectures.",
            timestamp: "2026-06-30T12:00:00Z",
            read: true,
            subject: "TechInsights Weekly Digest"
          }
        ]
      }
    ];

    clientsData = clientsRows;
    projectsData = resolvedProjects;
    threadsData = [...resolvedThreads, ...unmatchedThreads];
    isDbConnected = true;
  } catch (err) {
    console.warn("[getWorkspaceContext] Direct DB connection failed or URL absent. Using fallback mocks for context.", err);

    // Bind fallback clients to projects and threads if db fails
    projectsData = mockProjects.map((p) => ({
      ...p,
      client: mockClients.find((c) => c.id === p.clientId),
    }));
    threadsData = mockThreads.map((t) => ({
      ...t,
      client: mockClients.find((c) => c.id === t.clientId),
    }));
  }

  // Helper for current date comparisons (local ISO date)
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 2. Keyword/Entity Matching Routing

  // Intent A: Overdue / Deadline
  const overdueKeywords = ["overdue", "late", "delay", "deadline", "past", "behind"];
  if (overdueKeywords.some((kw) => query.includes(kw))) {
    const overdueProjects = projectsData.filter((proj) => {
      const isCompleted = proj.status === "completed";
      const isOverdue = proj.deadline && proj.deadline < todayStr;
      return !isCompleted && isOverdue;
    });

    let contextText = `User is asking about late or overdue deliverables. Here is the list of currently OVERDUE projects in the workspace as of ${todayStr}:\n`;
    if (overdueProjects.length === 0) {
      contextText += "There are no overdue projects in the workspace. All active projects are tracking on schedule.\n";
    } else {
      overdueProjects.forEach((proj) => {
        const clientName = proj.client?.name || "Unknown Client";
        const companyName = proj.client?.company || "Unknown Company";
        const daysOverdue = Math.max(
          1,
          Math.floor((new Date(todayStr).getTime() - new Date(proj.deadline).getTime()) / (1000 * 60 * 60 * 24))
        );
        contextText += `- Project: "${proj.name}" (Client: ${clientName} at ${companyName}) | Progress: ${proj.progress}% | Budget: $${proj.budget} | Deadline: ${proj.deadline} (Overdue by ${daysOverdue} days) | Status: ${proj.status}\n`;
      });
    }
    return { contextText, isGrounded: true, groundedType: "overdue" };
  }

  // Intent B: Unread client messages / emails
  const unreadKeywords = ["unread", "inbox", "new email", "new message", "unread email", "unread message", "mail"];
  if (unreadKeywords.some((kw) => query.includes(kw))) {
    const unreadMessagesList: any[] = [];
    threadsData.forEach((thread) => {
      thread.messages.forEach((msg: any) => {
        if (!msg.read && msg.sender === "client") {
          const clientName = thread.isUnmatched 
            ? `Unmatched (${thread.unmatchedEmail})` 
            : (thread.client?.name || "Unknown Client");
          unreadMessagesList.push({
            clientName,
            subject: msg.subject || "No Subject",
            text: msg.text,
            timestamp: msg.timestamp,
          });
        }
      });
    });

    let contextText = `User is asking about unread client messages or inbox activity. Here is the list of UNREAD emails in the workspace:\n`;
    if (unreadMessagesList.length === 0) {
      contextText += "There are currently 0 unread messages in the inbox. All messages are read.\n";
    } else {
      contextText += `Total unread emails: ${unreadMessagesList.length}\n`;
      unreadMessagesList.forEach((msg) => {
        contextText += `- From: ${msg.clientName} | Subject: "${msg.subject}" | Date: ${msg.timestamp.split("T")[0]} | Preview: "${msg.text.substring(0, 80)}..."\n`;
      });
    }
    return { contextText, isGrounded: true, groundedType: "unread" };
  }

  // Intent C: Budgets, Pipeline, Revenue
  const budgetKeywords = ["budget", "pipeline", "revenue", "value", "worth", "financial", "income", "money", "earnings"];
  if (budgetKeywords.some((kw) => query.includes(kw))) {
    const totalClientBudget = clientsData.reduce((sum, c) => sum + c.budget, 0);
    const activeProjects = projectsData.filter((p) => p.status === "active");
    const completedProjects = projectsData.filter((p) => p.status === "completed");
    const onHoldProjects = projectsData.filter((p) => p.status === "on_hold");

    const activeBudget = activeProjects.reduce((sum, p) => sum + p.budget, 0);
    const completedBudget = completedProjects.reduce((sum, p) => sum + p.budget, 0);
    const onHoldBudget = onHoldProjects.reduce((sum, p) => sum + p.budget, 0);

    let contextText = "User is asking about budgets, pipeline, or financial status in the workspace. Here are the financials:\n";
    contextText += `- Total Portfolio Budget (aggregated from all clients): $${totalClientBudget}\n`;
    contextText += `- Total Active Project Budgets (work-in-progress): $${activeBudget} (${activeProjects.length} active projects)\n`;
    contextText += `- Total Completed Project Budgets (historical value): $${completedBudget} (${completedProjects.length} completed projects)\n`;
    contextText += `- Total On-Hold Project Budgets: $${onHoldBudget} (${onHoldProjects.length} projects on hold)\n`;
    
    if (activeProjects.length > 0) {
      contextText += "\nActive projects list:\n";
      activeProjects.forEach((p) => {
        contextText += `- "${p.name}" (Client: ${p.client?.name || "Unknown"}) | Budget: $${p.budget} | Progress: ${p.progress}%\n`;
      });
    }
    return { contextText, isGrounded: true, groundedType: "budget" };
  }

  // Intent D: Specific Client or Company drill-down
  for (const client of clientsData) {
    const clientNameLower = client.name.toLowerCase();
    const companyLower = client.company.toLowerCase();
    
    // Split names/words to avoid partial match locks, e.g. "chloe" matches "chloe anderson"
    const nameParts = clientNameLower.split(" ");
    const hasNameMatch = nameParts.some((part) => part.length > 2 && query.includes(part));
    const hasCompanyMatch = companyLower.length > 2 && query.includes(companyLower);

    if (hasNameMatch || hasCompanyMatch) {
      const clientProjects = projectsData.filter((p) => p.clientId === client.id);
      const clientThread = threadsData.find((t) => t.clientId === client.id);
      const recentMessages = clientThread ? clientThread.messages.slice(-4) : [];

      let contextText = `User is asking about a specific client or company: "${client.name}" (${client.company}). Here are their details:\n`;
      contextText += `- Role: ${client.role}\n`;
      contextText += `- Email: ${client.email}\n`;
      contextText += `- Platform: ${client.platform}\n`;
      contextText += `- Sector: ${client.sector}\n`;
      contextText += `- Total Client Contract Budget: $${client.budget}\n`;
      contextText += `- Agreement Status: ${client.agreementStatus}\n`;
      contextText += `- Client Since: ${client.clientSince}\n`;

      if (clientProjects.length === 0) {
        contextText += "- No projects listed for this client.\n";
      } else {
        contextText += `- Linked Projects (${clientProjects.length}):\n`;
        clientProjects.forEach((p) => {
          contextText += `  * Project: "${p.name}" | Status: ${p.status} | Budget: $${p.budget} | Progress: ${p.progress}% | Deadline: ${p.deadline}\n`;
        });
      }

      if (recentMessages.length === 0) {
        contextText += "- No message history with this client.\n";
      } else {
        contextText += "- Recent conversations (last 4 emails):\n";
        recentMessages.forEach((msg: any) => {
          contextText += `  * [${msg.sender === "me" ? "Sent" : "Received"}] Subject: "${msg.subject || "No Subject"}" | Preview: "${msg.text.substring(0, 80)}..."\n`;
        });
      }

      return { contextText, isGrounded: true, groundedType: "client_drilldown" };
    }
  }

  // Intent E: General Summary Fallback (Compact Overview)
  const totalClientsCount = clientsData.length;
  const activeProjectsCount = projectsData.filter((p) => p.status === "active").length;
  const totalUnreadCount = threadsData.reduce((acc, t) => {
    return acc + t.messages.filter((m: any) => !m.read && m.sender === "client").length;
  }, 0);

  const clientListStr = clientsData
    .map((c) => `- ${c.name} (${c.company}) | Budget: $${c.budget}k | Platform: ${c.platform}`)
    .join("\n");

  const activeAndOnHoldProjects = projectsData.filter((p) => p.status === "active" || p.status === "on_hold");
  const projectListStr = activeAndOnHoldProjects
    .map((p) => `- Project: "${p.name}" (Client: ${p.client?.name || "Unknown"}) | Status: ${p.status} | Progress: ${p.progress}% | Budget: $${p.budget}k | Deadline: ${p.deadline}`)
    .join("\n");

  const generalSummary = `General summary of workspace:\n` +
    `- Total Clients onboarded: ${totalClientsCount}\n` +
    `- Total Active Projects in progress: ${activeProjectsCount}\n` +
    `- Total Unread Client Messages: ${totalUnreadCount}\n` +
    `- Today's date: ${todayStr}\n\n` +
    `Current Clients:\n${clientListStr || "None"}\n\n` +
    `Current Active & On Hold Projects:\n${projectListStr || "None"}\n`;

  return {
    contextText: generalSummary,
    isGrounded: true, // Mark as grounded since it contains all live database clients/projects
    groundedType: "general_summary"
  };
}
