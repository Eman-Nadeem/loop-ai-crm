import { db } from "@/lib/db";
import { userOAuthTokens, clients, messages } from "@/lib/db/schema";
import { decrypt } from "@/lib/utils/encryption";
import { eq, or } from "drizzle-orm";

interface GmailMessageDetail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: any[];
  };
}

// 1. Decodes Base64Url to standard UTF-8 string
function decodeBase64Url(str: string): string {
  // Convert Base64Url to standard Base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '='
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

// 2. Extracts clean email address from "Name <email@domain.com>" or "email@domain.com"
function extractEmail(headerValue: string): string {
  const match = headerValue.match(/<([^>]+)>/) || [null, headerValue];
  return (match[1] || headerValue).trim().toLowerCase();
}

// 3. Traverses Gmail message body parts to extract clean text content
function getBodyText(payload: any): string {
  if (!payload) return "";

  // If there is direct body data
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }

  // If there are subparts
  if (payload.parts && payload.parts.length > 0) {
    // Look for text/plain first
    const plainTextPart = payload.parts.find(
      (part: any) => part.mimeType === "text/plain"
    );
    if (plainTextPart && plainTextPart.body && plainTextPart.body.data) {
      return decodeBase64Url(plainTextPart.body.data);
    }

    // Look for text/html second
    const htmlPart = payload.parts.find(
      (part: any) => part.mimeType === "text/html"
    );
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      // Return decoded HTML (simple strip tags could be done if needed, but text is fine)
      const decodedHtml = decodeBase64Url(htmlPart.body.data);
      // Remove basic HTML tag structures for simple read
      return decodedHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }

    // Recurse into nested parts if present
    for (const subpart of payload.parts) {
      const recurseText = getBodyText(subpart);
      if (recurseText) return recurseText;
    }
  }

  return "";
}

// 4. Access Token Getter & Rotator
export async function getOrRefreshAccessToken(userId: string): Promise<string> {
  const [tokens] = await db
    .select()
    .from(userOAuthTokens)
    .where(eq(userOAuthTokens.userId, userId));

  if (!tokens) {
    throw new Error("No Google OAuth credentials found. Please connect your Gmail.");
  }

  // Check if token is expired or expires in next 5 minutes (300 seconds)
  const isExpired =
    !tokens.accessToken ||
    !tokens.expiresAt ||
    new Date(tokens.expiresAt).getTime() - Date.now() < 300000;

  if (!isExpired) {
    return tokens.accessToken!;
  }

  // Token is expired, refresh it
  console.log(`🔄 Refreshing Google access token for user ${userId}...`);
  const decryptedRefreshToken = decrypt(tokens.refreshToken);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google Client ID or Client Secret is not configured in the environment.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: decryptedRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[GMAIL_TOKEN_REFRESH_FAILED]:", errText);
    throw new Error("Failed to refresh Gmail access token.");
  }

  const tokenData = await response.json();
  const newAccessToken = tokenData.access_token;
  const newExpiresIn = tokenData.expires_in || 3600;
  const newExpiresAt = new Date(Date.now() + newExpiresIn * 1000);

  // Update DB cache
  await db
    .update(userOAuthTokens)
    .set({
      accessToken: newAccessToken,
      expiresAt: newExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(userOAuthTokens.userId, userId));

  return newAccessToken;
}

// 5. Fetch and Cache matched Gmail Messages
export async function syncGmailInbox(userId: string) {
  try {
    const accessToken = await getOrRefreshAccessToken(userId);

    // Fetch all clients to map their emails
    const clientsList = await db.select().from(clients);
    if (clientsList.length === 0) {
      return { matchedCount: 0, unmatchedCount: 0 };
    }

    // Map email -> client object
    const clientMap = new Map<string, typeof clientsList[0]>();
    clientsList.forEach((c) => {
      clientMap.set(c.email.toLowerCase().trim(), c);
    });

    // Fetch recent 20 messages from Gmail
    const listResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listResponse.ok) {
      throw new Error(`Gmail API List failed: ${await listResponse.text()}`);
    }

    const listData = await listResponse.json();
    const messageList = listData.messages || [];

    if (messageList.length === 0) {
      return { matchedCount: 0, unmatchedCount: 0 };
    }

    let matchedCount = 0;
    let unmatchedCount = 0;

    // Fetch details for each message
    for (const msgRef of messageList) {
      // Check if message is already synced
      const [existingMsg] = await db
        .select()
        .from(messages)
        .where(eq(messages.gmailMessageId, msgRef.id));

      if (existingMsg) {
        continue; // Already cached, skip fetching details
      }

      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!detailResponse.ok) {
        console.error(`Failed to fetch message details for ${msgRef.id}:`, await detailResponse.text());
        continue;
      }

      const message: GmailMessageDetail = await detailResponse.json();

      // Extract Headers
      const headers = message.payload.headers;
      const fromHeader = headers.find((h) => h.name.toLowerCase() === "from")?.value || "";
      const toHeader = headers.find((h) => h.name.toLowerCase() === "to")?.value || "";
      const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
      const dateHeader = headers.find((h) => h.name.toLowerCase() === "date")?.value || "";

      // Parse emails
      const fromEmail = extractEmail(fromHeader);
      const toEmails = toHeader.split(",").map((emailStr) => extractEmail(emailStr));

      // Match sender or recipient against client emails
      let matchedClient = clientMap.get(fromEmail);
      let sender: "client" | "me" = "client";

      if (!matchedClient) {
        // If not sent from client, check if it was sent by us to the client
        const matchedToEmail = toEmails.find((email) => clientMap.has(email));
        if (matchedToEmail) {
          matchedClient = clientMap.get(matchedToEmail);
          sender = "me";
        }
      }

      if (matchedClient) {
        // Parse Body text content
        const bodyContent = getBodyText(message.payload) || message.snippet || "";
        const truncatedText = bodyContent.substring(0, 2000); // Truncate to prevent database bloat

        // Parse date to ISO string
        let isoTimestamp = new Date().toISOString();
        if (dateHeader) {
          try {
            isoTimestamp = new Date(dateHeader).toISOString();
          } catch (e) {
            // Fallback to current time if parsing fails
          }
        }

        // Check if unread (read label is absent in labelIds)
        const isUnread = message.labelIds.includes("UNREAD");

        // Insert into cache database
        await db.insert(messages).values({
          id: `gmail-${message.id}`,
          clientId: matchedClient.id,
          sender,
          text: truncatedText,
          subject,
          gmailMessageId: message.id,
          timestamp: isoTimestamp,
          read: !isUnread,
        });

        matchedCount++;
      } else {
        unmatchedCount++;
      }
    }

    return { matchedCount, unmatchedCount };
  } catch (error) {
    console.error("[GMAIL_SYNC_ERROR]:", error);
    throw error;
  }
}
