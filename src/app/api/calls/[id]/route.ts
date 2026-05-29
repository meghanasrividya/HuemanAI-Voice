import { NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";

const BACKEND_BASE = "https://voice.huemanai.co.uk";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";

    console.log(`Proxying call details for ID: ${id}`);

    const response = await axios.get(`${BACKEND_BASE}/api/calls/${id}`, {
      headers: {
        cookie: cookieHeader,
        authorization: authHeader,
        accept: "application/json",
      },
      validateStatus: () => true,
    });

    // Write the raw response to a file so we can inspect the real structure
    try {
      const filePath = "c:\\Users\\singh\\Desktop\\HumanAI\\HuemanAI_Voice\\scratch\\live_call_details.json";
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2), "utf-8");
      console.log("Successfully wrote live call details to:", filePath);
    } catch (writeErr: any) {
      console.error("Failed to write live call details file:", writeErr.message);
    }

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
    console.error("Error in local call details GET API proxy (route):", message);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: message },
      { status: 500 }
    );
  }
}
