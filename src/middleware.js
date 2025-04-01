import { clerkMiddleware } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/api/hotels",
    "/sign-up",
    "/admin/signup(.*)",
  ],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook"],
  // Routes that can only be accessed by admins
  afterAuth(auth, req) {
    // Handle admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && 
        !req.nextUrl.pathname.startsWith('/admin/signup')) {
      if (!auth.userId) {
        return Response.redirect(new URL('/admin/signup', req.url));
      }
      
      // Check if user is admin
      const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
      if (!adminUserIds.includes(auth.userId)) {
        return Response.redirect(new URL('/', req.url));
      }
    }

    // Handle regular user routes
    if (req.nextUrl.pathname.startsWith('/sign-up') && auth.userId) {
      return Response.redirect(new URL('/', req.url));
    }

    // Handle admin sign-up route
    if (req.nextUrl.pathname === '/admin/signup' && auth.userId) {
      return Response.redirect(new URL('/admin', req.url));
    }
  }
});

export const config = {
  // Protects all routes, including api/trpc
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 