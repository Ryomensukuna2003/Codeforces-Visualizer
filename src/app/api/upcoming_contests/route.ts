import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_CLIST_API_KEY;
  if (!apiKey) {
    console.error("[upcoming_contests] NEXT_PUBLIC_CLIST_API_KEY is not configured");
    return NextResponse.json(
      { error: "Clist API key is not configured" },
      { status: 503 }
    );
  }

  try {
    const response = await axios.get(
      `https://clist.by/api/v4/contest/?format=json&upcoming=true&username=Casper&api_key=${apiKey}&limit=100`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("[upcoming_contests] fetch error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected fetch error",
      },
      { status: 500 }
    );
  }
}
