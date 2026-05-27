import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_BASE = "https://voice.huemanai.co.uk";

// This is the dedicated Feedback agent — always use this ID for feedback insights
const FEEDBACK_AGENT_ID = "agent_1501kc625atje1y8t9p8fr4xy8m9";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";

    // Build params — force the feedback agentId regardless of what the frontend sends
    const params = Object.fromEntries(searchParams.entries());
    params.agentId = FEEDBACK_AGENT_ID;

    // Proxy to the backend feedback agent's insights endpoint
    const response = await axios.get(`${BACKEND_BASE}/api/insights/calls`, {
      params,
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
    console.error("Error in local feedback insights GET API proxy:", message);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: message },
      { status: 500 }
    );
  }
}

