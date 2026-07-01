import { mockClients } from "../mock-data/clients";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function callLLM(messages: ChatMessage[]): Promise<string> {
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

  const systemPrompt = `You are LoopAI Assistant, an intelligence bot built into the LoopAI CRM dashboard.
Your goal is to help freelancers and design agencies manage their client relationships, optimize their profiles, and grow their revenues.

Here is the current client data in the database:
${clientContext}

Metrics:
- Total active clients: ${mockClients.length}
- Platform breakdown: ${upworkCount} Upwork, ${freelancerCount} Freelancer, ${fiverrCount} Fiverr
- Agreements: ${signedCount} Signed Contracts, ${negotiatingCount} Ongoing Negotiations

Guidelines:
1. Provide highly actionable, concise, and professional responses.
2. Directly reference specific clients or platforms in your data when relevant.
3. Keep answers under 3-4 paragraphs maximum, with bullet points for readability.
`;

  // Fallback response generator if API key is not present
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    console.warn("[LoopAI] OPENROUTER_API_KEY is not configured. Falling back to Mock Intelligence.");
    
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
