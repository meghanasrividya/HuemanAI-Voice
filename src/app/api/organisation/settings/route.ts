import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_BASE = "https://voice.huemanai.co.uk";
const BACKEND_URL = `${BACKEND_BASE}/api/organisation/settings`;

const FALLBACK_SETTINGS = {
  settings: {
    insight_agent_ids: {
      reservation: "agent_dc9662de627352087b223027f2",
      feedback: "agent_dc9662de627352087b223027f2"
    }
  }
};

function forwardHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey === "cookie" ||
      lowerKey === "content-type" ||
      lowerKey === "authorization" ||
      lowerKey === "x-csrf-token"
    ) {
      headers[key] = value;
    }
  });
  return headers;
}

export async function GET(request: Request) {
  try {
    const headers = forwardHeaders(request);
    headers["accept"] = "application/json";

    // 1. Attempt to fetch real settings from the live backend
    const response = await axios.get(BACKEND_URL, {
      headers,
      timeout: 4000, // 4 seconds timeout
      validateStatus: () => true,
    });

    // If the live backend returns successfully, serve the live settings with forwarded cookies
    if (response.status === 200 && response.data) {
      const responseHeaders = new Headers();
      if (response.headers["set-cookie"]) {
        const cookies = response.headers["set-cookie"];
        if (Array.isArray(cookies)) {
          cookies.forEach((cookie) => responseHeaders.append("Set-Cookie", cookie));
        } else {
          responseHeaders.set("Set-Cookie", String(cookies));
        }
      }

      return NextResponse.json(response.data, {
        status: response.status,
        headers: responseHeaders,
      });
    }
    
    // If backend returns a non-success status, use safe fallback
    return NextResponse.json(FALLBACK_SETTINGS);
  } catch (error: unknown) {
    // 2. Self-healing fallback: Catch 404, 401, timeout, or server errors, and return fallback settings
    console.error("Error in GET /api/organisation/settings proxy, using fallback:", error);
    return NextResponse.json(FALLBACK_SETTINGS);
  }
}

export async function PUT(request: Request) {
  try {
    const headers = forwardHeaders(request);
    let body = null;
    try {
      body = await request.json();
    } catch (_) {}

    const response = await axios.put(BACKEND_URL, body || {}, {
      headers,
      validateStatus: () => true,
    });

    const responseHeaders = new Headers();
    if (response.headers["set-cookie"]) {
      const cookies = response.headers["set-cookie"];
      if (Array.isArray(cookies)) {
        cookies.forEach((cookie) => responseHeaders.append("Set-Cookie", cookie));
      } else {
        responseHeaders.set("Set-Cookie", String(cookies));
      }
    }

    return NextResponse.json(response.data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/organisation/settings proxy:", error);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: error.message },
      { status: 500 }
    );
  }
}
