import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";

    const csrfToken = req.headers.get("x-csrf-token") || "";

    const response = await axios.post(
      "https://voice.huemanai.co.uk/api/dashboard/reservation",
      {},
      {
        headers: {
          Authorization: authHeader,
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
          Origin: "https://voice.huemanai.co.uk",
          Referer: "https://voice.huemanai.co.uk/",
        },
        validateStatus: () => true,
      }
    );

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("Dashboard Proxy Error:", error?.response?.data || error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Proxy Error",
      },
      {
        status: 500,
      }
    );
  }
}