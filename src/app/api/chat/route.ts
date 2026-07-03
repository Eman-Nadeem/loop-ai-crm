import { NextResponse } from "next/server";
import { callLLM } from "@/lib/ai/chat";
import { getWorkspaceContext } from "@/lib/ai/workspace-context";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request payload. 'messages' array is required." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1]?.content || "";
    const { contextText, isGrounded } = await getWorkspaceContext(lastMessage);

    const reply = await callLLM(messages, contextText);

    return NextResponse.json({ content: reply, isGrounded });
  } catch (error: any) {
    console.error("[Chat Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
