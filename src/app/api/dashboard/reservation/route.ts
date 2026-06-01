import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_BASE = "https://voice.huemanai.co.uk";

/**
 * Extract a CSRF token from cookies.
 * Common cookie names used by Django/Flask/Express CSRF middleware:
 * csrftoken, XSRF-TOKEN, _csrf, csrf_token
 */
function extractCsrfFromCookies(cookieHeader: string): string | null {
  const patterns = [
    /(?:^|;\s*)csrftoken=([^;]+)/i,
    /(?:^|;\s*)XSRF-TOKEN=([^;]+)/i,
    /(?:^|;\s*)_csrf=([^;]+)/i,
    /(?:^|;\s*)csrf_token=([^;]+)/i,
    /(?:^|;\s*)csrf=([^;]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cookieHeader.match(pattern);
    if (match) {
      return decodeURIComponent(match[1].trim());
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const authHeader = request.headers.get("authorization") || "";
    const clientCsrfHeader = request.headers.get("x-csrf-token") || "";
    const cookieHeader = request.headers.get("cookie") || "";
    const contentType = request.headers.get("content-type") || "application/json";

    // Step 1: Try to get a fresh CSRF token from the backend via a GET request.
    // This works because the backend sends the CSRF token in the response cookies.
    let csrfToken = clientCsrfHeader || extractCsrfFromCookies(cookieHeader);
    let sessionCookies = cookieHeader; // will be enriched after GET if needed

    if (!csrfToken) {
      try {
        const csrfResponse = await axios.get(`${BACKEND_BASE}/api/dashboard/reservation`, {
          headers: {
            cookie: cookieHeader,
            accept: "application/json",
          },
          validateStatus: () => true,
          withCredentials: false,
        });

        // Extract CSRF token from the GET response cookies
        const setCookieRaw = csrfResponse.headers["set-cookie"];
        const setCookies = Array.isArray(setCookieRaw)
          ? setCookieRaw
          : setCookieRaw
          ? [String(setCookieRaw)]
          : [];

        for (const cookie of setCookies) {
          const tokenMatch = cookie.match(
            /(?:csrftoken|XSRF-TOKEN|_csrf|csrf_token|csrf)=([^;]+)/i
          );
          if (tokenMatch) {
            csrfToken = decodeURIComponent(tokenMatch[1].trim());
            // Append the new CSRF cookie into our session cookies for the POST
            const cookieName = cookie.split("=")[0].trim();
            // Replace or append the CSRF cookie
            if (sessionCookies.includes(cookieName)) {
              sessionCookies = sessionCookies.replace(
                new RegExp(`${cookieName}=[^;]*(;|$)`),
                `${cookieName}=${tokenMatch[1]}$1`
              );
            } else {
              sessionCookies = sessionCookies
                ? `${sessionCookies}; ${cookieName}=${tokenMatch[1]}`
                : `${cookieName}=${tokenMatch[1]}`;
            }
            break;
          }
        }
      } catch {
        // GET pre-flight failed — proceed without a fresh token
      }
    }

    // Step 2: Build the POST headers
    const postHeaders: Record<string, string> = {
      "content-type": contentType,
    };

    if (sessionCookies) postHeaders["cookie"] = sessionCookies;
    if (authHeader) postHeaders["authorization"] = authHeader;
    if (csrfToken) {
      postHeaders["x-csrf-token"] = csrfToken;
      postHeaders["x-xsrf-token"] = csrfToken;
      // Also set the referer to pass strict-origin checks
      postHeaders["referer"] = BACKEND_BASE;
      postHeaders["origin"] = BACKEND_BASE;
    }

    // Step 3: Make the actual POST to the backend
    const response = await axios.post(
      "https://voice.huemanai.co.uk/api/dashboard/reservation",
      body,
      {
        headers: {
          Authorization: authHeader,
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // Build response headers — forward Set-Cookie so browser stays in sync
    const responseHeaders = new Headers();
    const setCookieRaw = response.headers["set-cookie"];
    const setCookies = Array.isArray(setCookieRaw)
      ? setCookieRaw
      : setCookieRaw
      ? [String(setCookieRaw)]
      : [];

    for (const cookie of setCookies) {
      responseHeaders.append("Set-Cookie", cookie);
    }

    return NextResponse.json(response.data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.log(
      "DASHBOARD API ERROR =>",
      error?.response?.data || error.message
    );

    return NextResponse.json(
      error?.response?.data || {
        message: "Something went wrong",
      },
      {
        status: error?.response?.status || 500,
      }
    );
  }
}