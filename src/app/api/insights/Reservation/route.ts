import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_BASE = "https://voice.huemanai.co.uk";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";

    // Proxy the request to the backend insights calls endpoint, forwarding cookies & auth headers
    const response = await axios.get(`${BACKEND_BASE}/api/insights/calls`, {
      params: Object.fromEntries(searchParams.entries()),
      headers: {
        cookie: cookieHeader,
        authorization: authHeader,
        accept: "application/json",
      },
      validateStatus: () => true,
    });

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in local reservation insights GET API proxy:", message);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: message },
      { status: 500 }
    );
  }
}
