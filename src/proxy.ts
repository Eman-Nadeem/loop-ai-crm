import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// We make sign-in, sign-up, and home public. 
// The client dashboard is under /dashboard/clients.
// We protect all /dashboard routes.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
