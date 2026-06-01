import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const headers: Record<string, string> = {};

    // Forward relevant headers from the client to the backend API
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey === "cookie" ||
        lowerKey === "authorization" ||
        lowerKey === "x-csrf-token"
      ) {
        headers[key] = value;
      }
    });

    // Call the backend API for metadata
    const response = await axios.get(
      "https://voice.huemanai.co.uk/api/reports/actions/metadata",
      {
        headers,
        validateStatus: () => true, // Pass back whatever status the server returns
      }
    );

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("Error in actions metadata API proxy:", error);
    return NextResponse.json(
      { error: "Internal Server Error in API Proxy", details: error.message },
      { status: 500 }
    );
  }
}
