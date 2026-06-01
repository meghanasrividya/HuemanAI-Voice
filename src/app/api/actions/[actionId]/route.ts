import { NextResponse } from "next/server";
import axios from "axios";

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

function buildResponseHeaders(backendHeaders: Record<string, any>): Headers {
  const responseHeaders = new Headers();
  if (backendHeaders["set-cookie"]) {
    const cookies = backendHeaders["set-cookie"];
    if (Array.isArray(cookies)) {
      cookies.forEach((c) => responseHeaders.append("Set-Cookie", c));
    } else {
      responseHeaders.set("Set-Cookie", String(cookies));
    }
  }
  return responseHeaders;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const { actionId } = await params;
    const headers = forwardHeaders(request);
    const response = await axios.get(
      `https://voice.huemanai.co.uk/api/actions/${actionId}`,
      { headers, validateStatus: () => true }
    );
    return NextResponse.json(response.data, {
      status: response.status,
      headers: buildResponseHeaders(response.headers),
    });
  } catch (error: any) {
    console.error("Error in GET /api/actions/[actionId] proxy:", error);
    return NextResponse.json({ error: "Proxy error", details: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const { actionId } = await params;
    const headers = forwardHeaders(request);
    let body = null;
    try { body = await request.json(); } catch (_) {}

    const response = await axios.put(
      `https://voice.huemanai.co.uk/api/actions/${actionId}`,
      body || {},
      { headers, validateStatus: () => true }
    );
    return NextResponse.json(response.data, {
      status: response.status,
      headers: buildResponseHeaders(response.headers),
    });
  } catch (error: any) {
    console.error("Error in PUT /api/actions/[actionId] proxy:", error);
    return NextResponse.json({ error: "Proxy error", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const { actionId } = await params;
    const headers = forwardHeaders(request);
    const response = await axios.delete(
      `https://voice.huemanai.co.uk/api/actions/${actionId}`,
      { headers, validateStatus: () => true }
    );
    return NextResponse.json(response.data, {
      status: response.status,
      headers: buildResponseHeaders(response.headers),
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/actions/[actionId] proxy:", error);
    return NextResponse.json({ error: "Proxy error", details: error.message }, { status: 500 });
  }
}
