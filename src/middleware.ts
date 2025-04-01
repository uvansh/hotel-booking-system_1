import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  // Routes that can be accessed while signed out
  const publicRoutes = ["/", "/hotels", "/deals", "/about", "/contact"];
  // Routes that can always be accessed, and have
  // no authentication information
  const ignoredRoutes = ["/api/webhook"];
  
  if (publicRoutes.includes(req.nextUrl.pathname) || ignoredRoutes.includes(req.nextUrl.pathname)) {
    return;
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 