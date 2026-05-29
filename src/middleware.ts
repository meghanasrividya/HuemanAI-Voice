import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname.startsWith("/api/")) {
    const backendUrl = `https://voice.huemanai.co.uk${url.pathname}${url.search}`;
    
    console.log(`[Proxy Request] Method: ${request.method} | URL: ${url.pathname}`);
    
    // Copy request headers
    const headers = new Headers(request.headers);
    // Overwrite Host and Origin to match target server
    headers.set("host", "voice.huemanai.co.uk");
    headers.set("origin", "https://voice.huemanai.co.uk");
    
    // Attach live site session credentials from env ONLY if client didn't supply their own
    const clientCookie = request.headers.get("cookie");
    const clientAuth = request.headers.get("authorization");
    
    if (!clientCookie && !clientAuth && process.env.NEXT_PUBLIC_DEV_COOKIE) {
      console.log("[Proxy] Attaching DEV_COOKIE...");
      headers.set("cookie", process.env.NEXT_PUBLIC_DEV_COOKIE);
      
      // Auto-extract _csrf/XSRF token from cookies if present
      const csrfMatch = process.env.NEXT_PUBLIC_DEV_COOKIE.match(/(?:_csrf|XSRF-TOKEN)=([^;]+)/i);
      if (csrfMatch && csrfMatch[1]) {
        const token = decodeURIComponent(csrfMatch[1]);
        console.log(`[Proxy] Auto-extracted CSRF token: ${token.substring(0, 10)}...`);
        headers.set("x-csrf-token", token);
        headers.set("x-xsrf-token", token);
      }
    } else {
      console.log("[Proxy] Client supplied active session credentials (Cookie/Authorization). Routing request directly.");
    }
    
    // Attach explicit CSRF token if configured in .env.local AND not provided by the client
    const clientCsrf = request.headers.get("x-csrf-token") || request.headers.get("x-xsrf-token");
    if (!clientCsrf && process.env.NEXT_PUBLIC_DEV_CSRF) {
      console.log(`[Proxy] Attaching explicit DEV_CSRF: ${process.env.NEXT_PUBLIC_DEV_CSRF.substring(0, 10)}...`);
      headers.set("x-csrf-token", process.env.NEXT_PUBLIC_DEV_CSRF);
      headers.set("x-xsrf-token", process.env.NEXT_PUBLIC_DEV_CSRF);
    }
    
    try {
      const response = await fetch(backendUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : undefined,
        redirect: "manual",
      });
      
      console.log(`[Proxy Response] Status: ${response.status} ${response.statusText}`);
      
      // Copy response headers
      const responseHeaders = new Headers(response.headers);
      
      // Rewrite Set-Cookie headers
      const setCookies = response.headers.getSetCookie();
      if (setCookies && setCookies.length > 0) {
        console.log(`[Proxy] Found ${setCookies.length} Set-Cookie headers from backend. Rewriting...`);
        responseHeaders.delete("set-cookie");
        setCookies.forEach((cookie) => {
          // Strip Domain attribute and Secure flag to allow cookies on http://localhost:3000
          let modifiedCookie = cookie
            .replace(/Domain=[^;]+/i, "")
            .replace(/Secure/i, "")
            .replace(/SameSite=None/i, "SameSite=Lax");
          responseHeaders.append("set-cookie", modifiedCookie);
        });
      }
      
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      console.error("Local API Proxy Error:", err);
      return NextResponse.json({ error: "Local API Proxy Error" }, { status: 502 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
