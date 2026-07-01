import { NextResponse } from "next/server";
import { callLLMForReply } from "@/lib/ai/chat";

export async function POST(req: Request) {
  try {
    const { client, messages } = await req.json();

    if (!client || !messages) {
      return NextResponse.json(
        { error: "Invalid request payload. 'client' and 'messages' are required." },
        { status: 400 }
      );
    }

    const draft = await callLLMForReply(client, messages);

    return NextResponse.json({ draft });
  } catch (error: any) {
    console.error("[Suggest Reply Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
