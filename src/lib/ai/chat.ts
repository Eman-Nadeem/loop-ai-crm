import { mockClients } from "../mock-data/clients";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function callLLM(messages: ChatMessage[], workspaceContext?: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // Summarize current CRM data for the AI system prompt context
  const clientContext = mockClients
    .map(
      (c) =>
        `- Name: ${c.name}, Role: ${c.role}, Company: ${c.company}, Platform: ${c.platform}, Sector: ${c.sector}, Budget: $${c.budget}, Status: ${c.agreementStatus}, Active Projects: ${c.activeProjects}`
    )
    .join("\n");

  const upworkCount = mockClients.filter((c) => c.platform === "upwork").length;
  const freelancerCount = mockClients.filter((c) => c.platform === "freelancer").length;
  const fiverrCount = mockClients.filter((c) => c.platform === "fiverr").length;
  const signedCount = mockClients.filter((c) => c.agreementStatus === "signed").length;
  const negotiatingCount = mockClients.filter((c) => c.agreementStatus === "negotiating").length;

  let systemPrompt = `You are LoopAI Assistant, an intelligence bot built into the LoopAI CRM dashboard.
Your goal is to help freelancers and design agencies manage their client relationships, optimize their profiles, and grow their revenues.

Guidelines:
1. Provide highly actionable, concise, and professional responses.
2. Directly reference specific clients, budgets, or messages in your data when relevant.
3. Keep answers under 3-4 paragraphs maximum, with bullet points for readability.
4. If a question cannot be answered from the provided workspace data, politely explain that you do not have that information in the current workspace, rather than inventing fake facts.
`;

  if (workspaceContext) {
    systemPrompt += `\nHere is the relevant live database context for this query:\n${workspaceContext}\n`;
  } else {
    systemPrompt += `\nHere is the current client data context:\n${clientContext}\n
Metrics:
- Total active clients: ${mockClients.length}
- Platform breakdown: ${upworkCount} Upwork, ${freelancerCount} Freelancer, ${fiverrCount} Fiverr
- Agreements: ${signedCount} Signed Contracts, ${negotiatingCount} Ongoing Negotiations\n`;
  }

  // Fallback response generator if API key is not present
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    console.warn("[LoopAI] OPENROUTER_API_KEY is not configured. Falling back to Mock Intelligence.");
    
    if (workspaceContext) {
      // If we have workspace context, format it beautifully for mock mode to prevent weird alignment
      return `### 📊 Workspace Insights (Mock Mode)

I am currently running in **Mock Mode** because the \`OPENROUTER_API_KEY\` is not configured in your \`.env.local\`. However, I have parsed your question against the live workspace context:

---

${workspaceContext
  .trim()
  .split("\n")
  .map((line) => line.startsWith("-") || line.startsWith("*") || line.startsWith("#") ? line : `> ${line}`)
  .join("\n")}

---

*To enable real AI reasoning and conversational replies, please configure a valid \`OPENROUTER_API_KEY\` in your \`.env.local\` file.*`;
    }

    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || "";

    // Simulated responses based on keywords
    if (lastUserMessage.includes("relationship") || lastUserMessage.includes("improve")) {
      return `Here are specific recommendations to improve relationships with your current clients:

1. **Leverage Platform Features**: For your **Upwork** clients (like **Sophie Turner** at UpperCode and **Daniel Martinez** at DigitalNest), use Upwork's direct messaging and submit milestone updates early to build trust.
2. **Review High-Budget Clients**: Focus on your top-paying clients. For instance, **David Johnson** (CIO, DataSphere, Budget $250) on Fiverr and **Daniel Martinez** (CDO, DigitalNest, Budget $230) on Upwork should receive priority updates.
3. **Establish Regular Check-Ins**: For branding projects (which represent 5 of your clients), schedule a quick design review at the 50% milestone to avoid major revisions later.`;
    }

    if (lastUserMessage.includes("find") || lastUserMessage.includes("new client") || lastUserMessage.includes("sector")) {
      return `To find new clients and expand your pipeline:

1. **Target the Media Sector**: You currently have 4 clients in the **Media** sector (Isabella Hart, Michael Anderson, Madeline Brooks, Daniel Martinez). Create a specialized case study folder displaying your work for TechWave and OpsMaster, and use it to pitch similar companies.
2. **Optimize Fiverr Gig**: Fiverr is currently your lowest source of clients (only ${fiverrCount} clients: Victoria Lane and David Johnson). Try updating your gig descriptions with keywords like "Enterprise Branding" or "SaaS UX Design" to capture higher budget clients.
3. **Active Outreaching**: Promote your Product Design work on Freelancer and Upwork, focusing on high-ticket branding contracts (your average budget for branding is over $160).`;
    }

    // Default polite mock response
    return `Hello! I am your LoopAI Assistant. 

Currently, I am operating in *Mock Mode* because your \`OPENROUTER_API_KEY\` is not set in \`.env.local\`. However, looking at your CRM dashboard:
- You have **${mockClients.length} active clients** across Upwork (${upworkCount}), Freelancer (${freelancerCount}), and Fiverr (${fiverrCount}).
- Your total contract portfolio is worth **$${mockClients.reduce((acc, c) => acc + c.budget, 0)}**.
- Fiverr represents your lowest lead channel. I recommend optimizing your Fiverr profiles.

How can I help you optimize your business today?`;
  }

  // Real LLM call to OpenRouter
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
        "X-Title": "LoopAI CRM Dashboard",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response received from the assistant.";
  } catch (error) {
    console.error("OpenRouter API call failed:", error);
    throw error;
  }
}

export async function callLLMForReply(
  client: any,
  threadMessages: { sender: "me" | "client"; text: string; timestamp: string }[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const historyText = threadMessages
    .map((m) => `${m.sender === "me" ? "Me" : client.name}: ${m.text}`)
    .join("\n");

  const systemPrompt = `You are an AI assistant designed to draft professional, polite, and context-aware responses to clients.
Your goal is to suggest a draft response that the user can send to the client.

Here is the context of the client you are responding to:
- Name: ${client.name}
- Role: ${client.role}
- Company: ${client.company}
- Lead Platform: ${client.platform}
- Sector: ${client.sector}
- Budget: $${client.budget}k
- Agreement Status: ${client.agreementStatus}

Here is the conversation history:
${historyText || "(No messages yet)"}

Guidelines for drafting the response:
1. Write the response directly from the perspective of the user ("Me"). Do NOT include prefixes like "Me:" or "Response:". Just output the body of the message.
2. Keep the tone professional, helpful, and concise. Avoid placeholder signatures like "[Your Name]". Let it end naturally.
3. Keep the response to 1-2 paragraphs max. Reference milestones or next steps if relevant to the last message in the thread.
`;

  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    console.warn("[LoopAI] OPENROUTER_API_KEY is not configured. Falling back to Mock Reply Suggester.");
    
    const lastMessage = threadMessages[threadMessages.length - 1];
    const lastMsgText = lastMessage?.text.toLowerCase() || "";

    if (lastMsgText.includes("budget") || lastMsgText.includes("cost") || lastMsgText.includes("price")) {
      return `Hi ${client.name}, thanks for reaching out. Regarding the project budget, it is currently tracked at $${client.budget}k, which covers the design deliverables we agreed upon. Let me know if you would like to run through the milestones again.`;
    }

    if (lastMsgText.includes("hello") || lastMsgText.includes("hi") || lastMsgText.includes("hey")) {
      return `Hi ${client.name}, hope you're having a great week! Thanks for checking in. How can I help you with the ${client.sector} project deliverables today?`;
    }

    if (lastMsgText.includes("status") || lastMsgText.includes("update") || lastMsgText.includes("progress")) {
      return `Hi ${client.name}, I'm currently finalizing the next batch of deliverables. We are tracking completely on schedule, and I will share the prototype link with you by tomorrow afternoon!`;
    }

    return `Hi ${client.name}, thanks for your message. Let me review the files and get back to you with an update shortly!`;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "LoopAI CRM Dashboard",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        max_tokens: 500,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Suggest a draft reply to the client based on the conversation history." }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Sure, let me check that for you.";
  } catch (error) {
    console.error("OpenRouter Suggest Reply failed:", error);
    throw error;
  }
}
