import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import getAdminModel from "@/models/Admin";

async function checkAdminStatus(userId) {
  try {
    await connectDB();
    const Admin = getAdminModel();
    const admin = await Admin.findOne({ userId });
    return !!admin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/api/hotels",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/admin/signup",
    "/api/admin/validate",
    "/api/admin/register",
  ],

  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook"],

  async afterAuth(auth, req) {
    // If the user is not signed in and trying to access a protected route,
    // redirect them to sign in
    if (!auth.userId && !req.nextUrl.pathname.startsWith('/')) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Handle admin routes
    if (req.nextUrl.pathname.startsWith('/admin') || 
        req.nextUrl.pathname.startsWith('/api/admin')) {
      // Skip auth check for public admin routes
      if (req.nextUrl.pathname === '/admin/signup' ||
          req.nextUrl.pathname === '/api/admin/validate' ||
          req.nextUrl.pathname === '/api/admin/register') {
        return NextResponse.next();
      }

      // For all other admin routes, check if user is admin
      if (!auth.userId) {
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }

      const isAdmin = await checkAdminStatus(auth.userId);
      if (!isAdmin) {
        // If not admin, redirect to home page
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 