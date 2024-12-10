import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const newSubscriber = await prisma.subscriber.create({
      data: {
        email: email,
        createdAt: new Date(),
      },
    });
    return NextResponse.json(newSubscriber, { status: 201 });

  } catch (error) {
    console.error("Detailed error adding subscriber:", error);
    return NextResponse.json(
      {
        error: "Failed to add subscriber",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
