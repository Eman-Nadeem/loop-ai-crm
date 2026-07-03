import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/auth/google/callback`;

    if (!clientId) {
      return new NextResponse("GOOGLE_CLIENT_ID is not configured in the environment.", {
        status: 500,
      });
    }

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: redirectUri,
      client_id: clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "consent", // Force consent screen to guarantee refresh token is returned
      scope: "https://www.googleapis.com/auth/gmail.readonly",
      state: userId, // Pass the Clerk userId to identify the session
    };

    const qs = new URLSearchParams(options).toString();
    return NextResponse.redirect(`${rootUrl}?${qs}`);
  } catch (error) {
    console.error("[GOOGLE_AUTH_INIT_ERROR]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
