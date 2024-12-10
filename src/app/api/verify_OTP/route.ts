import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate request payload
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Fetch OTP from Redis
    const storedOtp = await client.get(`otp:${email}`);
    
    if (storedOtp === otp) {
      // OTP is valid; delete it
      await client.del(`otp:${email}`);
      
      return NextResponse.json(
        { message: "OTP verified successfully" },
        { status: 200 }
      );
    }

    // OTP invalid or expired
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);

    return NextResponse.json(
      {
        error: "Failed to verify OTP",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
