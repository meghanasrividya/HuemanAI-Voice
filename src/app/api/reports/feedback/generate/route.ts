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
    console.log("[FEEDBACK-REPORTS-GENERATE] Body sent to backend:", JSON.stringify(body));

    // Call the backend API for generate
    const response = await axios.post(
      "https://voice.huemanai.co.uk/api/reports/feedback/generate",
      body,
      {
        headers,
        validateStatus: () => true, // Pass back whatever status the server returns
      }
    );

    // DEBUG: Log what backend returned
    console.log("[FEEDBACK-REPORTS-GENERATE] Backend status:", response.status);

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("Error in feedback generate API proxy:", error);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: error.message },
      { status: 500 }
    );
  }
}
