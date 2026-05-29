import { NextResponse } from "next/server";
import axios from "axios";

function forwardHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lk = key.toLowerCase();
    if (lk === "cookie" || lk === "content-type" || lk === "authorization" || lk === "x-csrf-token") {
      headers[key] = value;
    }
  });
  return headers;
}

function buildResponseHeaders(backendHeaders: Record<string, any>): Headers {
  const out = new Headers();
  if (backendHeaders["set-cookie"]) {
    const c = backendHeaders["set-cookie"];
    if (Array.isArray(c)) c.forEach((v) => out.append("Set-Cookie", v));
    else out.set("Set-Cookie", String(c));
  }
  return out;
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const headers = forwardHeaders(request);
    let body: any = {};
    try { body = await request.json(); } catch (_) {}

    const response = await axios.patch(
      `https://voice.huemanai.co.uk/api/admin/users/${userId}/status`,
      body,
      { headers, validateStatus: () => true }
    );
    return NextResponse.json(response.data, {
      status: response.status,
      headers: buildResponseHeaders(response.headers),
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/users/[userId]/status proxy:", error);
    return NextResponse.json({ error: "Proxy error", details: error.message }, { status: 500 });
  }
}
