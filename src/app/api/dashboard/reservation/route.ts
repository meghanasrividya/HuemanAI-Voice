import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const authHeader = req.headers.get("authorization") || "";
    const csrfToken = req.headers.get("x-csrf-token") || "";

    const response = await axios.post(
      "https://voice.huemanai.co.uk/api/dashboard/reservation",
      body,
      {
        headers: {
          Authorization: authHeader,
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.log(
      "DASHBOARD API ERROR =>",
      error?.response?.data || error.message
    );

    return NextResponse.json(
      error?.response?.data || {
        message: "Something went wrong",
      },
      {
        status: error?.response?.status || 500,
      }
    );
  }
}