import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    console.log("Attempting to create user:", username);

    const newUser = await prisma.user.create({
      data: {
        username: username,
      },
    });

    console.log("User created successfully:", newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Detailed error creating user:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
