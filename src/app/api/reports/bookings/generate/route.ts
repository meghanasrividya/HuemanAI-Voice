import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
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

    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Empty or invalid body
    }

    // DEBUG: Log what we're sending to the backend
    console.log("[REPORTS-GENERATE] Body sent to backend:", JSON.stringify(body));
    console.log("[REPORTS-GENERATE] Headers sent to backend:", JSON.stringify(headers));

    // Call the backend API for generate
    const response = await axios.post(
      "https://voice.huemanai.co.uk/api/reports/bookings/generate",
      body,
      {
        headers,
        validateStatus: () => true, // Pass back whatever status the server returns
      }
    );

    // DEBUG: Log what backend returned
    console.log("[REPORTS-GENERATE] Backend status:", response.status);
    console.log("[REPORTS-GENERATE] Backend response data:", JSON.stringify(response.data).slice(0, 500));

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("Error in bookings generate API proxy:", error);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: error.message },
      { status: 500 }
    );
  }
}
