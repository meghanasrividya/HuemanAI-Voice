import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = "https://voice.huemanai.co.uk/api/admin/settings";

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
    const response = await axios.get(BACKEND_URL, {
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
    console.error("Error in GET /api/admin/settings proxy:", error);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: error.message },
      { status: 500 }
    );
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
    console.error("Error in PUT /api/admin/settings proxy:", error);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: error.message },
      { status: 500 }
    );
  }
}
