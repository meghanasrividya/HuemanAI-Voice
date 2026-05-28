import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_BASE = "https://voice.huemanai.co.uk";

const FALLBACK_SETTINGS = {
  settings: {
    insight_agent_ids: {
      reservation: "agent_dc9662de627352087b223027f2",
      feedback: "agent_dc9662de627352087b223027f2"
    }
  }
};

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";

    // 1. Attempt to fetch real settings from the live backend
    const response = await axios.get(`${BACKEND_BASE}/api/organisation/settings`, {
      headers: {
        cookie: cookieHeader,
        authorization: authHeader,
        accept: "application/json",
      },
      timeout: 4000, // 4 seconds timeout
    });

    // If the live backend returns successfully, serve the live settings
    if (response.status === 200 && response.data) {
      return NextResponse.json(response.data);
    }
    
    // If backend returns 404 or any other non-success status, use safe fallback
    return NextResponse.json(FALLBACK_SETTINGS);
  } catch (error: unknown) {
    // 2. Self-healing fallback: Catch 404, 401, timeout, or server errors, and return fallback settings
    return NextResponse.json(FALLBACK_SETTINGS);
  }
}
