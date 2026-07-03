import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userOAuthTokens } from "@/lib/db/schema";
import { encrypt } from "@/lib/utils/encryption";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("[GOOGLE_AUTH_CALLBACK_ERROR_PARAM]:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/inbox?error=auth_failed`
      );
    }

    if (!code) {
      return new NextResponse("Authorization code is missing.", { status: 400 });
    }

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return new NextResponse("Google client credentials are not configured.", { status: 500 });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[GOOGLE_TOKEN_EXCHANGE_FAILED]:", errorText);
      return new NextResponse("Failed to exchange authorization code for tokens.", { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    if (!refresh_token) {
      // Sometimes refresh_token is only sent on the first authorization.
      // If prompt=consent is used, it should always be present, but let's check.
      console.warn("[GOOGLE_AUTH_CALLBACK]: No refresh token returned. Checking existing store.");
      const existing = await db
        .select()
        .from(userOAuthTokens)
        .where(eq(userOAuthTokens.userId, userId));
      
      if (existing.length === 0) {
        return new NextResponse(
          "No refresh token was returned, and no existing token exists. Please go to your Google Account Settings and remove access to this app, then try connecting again.",
          { status: 400 }
        );
      }

      // Update access token only
      const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);
      await db
        .update(userOAuthTokens)
        .set({
          accessToken: access_token,
          expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(userOAuthTokens.userId, userId));
    } else {
      // Encrypt and store the refresh token
      const encryptedRefreshToken = encrypt(refresh_token);
      const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);

      // Upsert user oauth token
      const existing = await db
        .select()
        .from(userOAuthTokens)
        .where(eq(userOAuthTokens.userId, userId));

      if (existing.length > 0) {
        await db
          .update(userOAuthTokens)
          .set({
            accessToken: access_token,
            refreshToken: encryptedRefreshToken,
            expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(userOAuthTokens.userId, userId));
      } else {
        await db.insert(userOAuthTokens).values({
          userId,
          accessToken: access_token,
          refreshToken: encryptedRefreshToken,
          expiresAt,
        });
      }
    }

    // Redirect to inbox page with success query
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/inbox?success=gmail_connected`
    );
  } catch (error) {
    console.error("[GOOGLE_AUTH_CALLBACK_ERROR]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
