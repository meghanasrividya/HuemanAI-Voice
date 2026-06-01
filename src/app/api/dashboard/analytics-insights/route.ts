import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
    try {

        const authHeader =
            request.headers.get("authorization");

        const csrf =
            request.headers.get("x-csrf-token");

        const response = await axios.post(
            "https://voice.huemanai.co.uk/api/dashboard/analytics-insights",
            {},
            {
                headers: {
                    Authorization: authHeader || "",
                    "X-CSRF-TOKEN": csrf || "",
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );

        return NextResponse.json(
            response.data,
            { status: 200 }
        );

    } catch (error: any) {

        console.log(
            "ANALYTICS API ERROR:",
            error?.response?.data || error.message
        );

        return NextResponse.json(
            {
                message:
                    error?.response?.data ||
                    "Analytics API Failed",
            },
            {
                status:
                    error?.response?.status || 500,
            }
        );
    }
}