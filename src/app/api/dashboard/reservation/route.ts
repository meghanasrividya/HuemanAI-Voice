import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const headers: Record<string, string> = {};

    // Forward relevant headers from the client to the backend API
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

    // Parse the body if any
    let body = null;
    try {
      body = await request.json();
    } catch (e) {
      // Empty or invalid body
    }

    // Call the voice backend API
    const response = await axios.post("https://voice.huemanai.co.uk/api/dashboard/reservation", body || {}, {
      headers,
      validateStatus: () => true, // We want to pass back whatever status the server returns (e.g., 201)
    });

    // Build the proxy response headers
    const responseHeaders = new Headers();

    // Forward Set-Cookie headers so cookies can be set/updated in the user's browser
    if (response.headers["set-cookie"]) {
      const cookies = response.headers["set-cookie"];
      if (Array.isArray(cookies)) {
        cookies.forEach(cookie => responseHeaders.append("Set-Cookie", cookie));
      } else {
        responseHeaders.set("Set-Cookie", String(cookies));
      }
    }

    return NextResponse.json(response.data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error in dashboard reservation API proxy:", error);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: error.message },
      { status: 500 }
    );
  }
}
