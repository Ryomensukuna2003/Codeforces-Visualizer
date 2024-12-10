import client from "@/lib/redis";
import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";


export async function POST(request: NextRequest) {
  try {
    const { email }: { email: string } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await prisma.subscriber.findUnique({
      where: {
        email: email,
      },
    });
    if(user){
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = 5 * 60;
    await client.setEx(`otp:${email}`, ttl, otp);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.verify();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`SMTP verification failed: ${error.message}`);
      } else {
        throw new Error("SMTP verification failed: Unknown error");
      }
    }

    const emailContent = {
      from: '"CF Stats" <cfstats9@gmail.com>',
      to: email,
      subject: "OTP for CF Stats",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f7f0e9;
              margin: 0;
              padding: 0;
            }
            .container {
              text-align: center;
              background-color: #000;
              color: #f7f0e9;
              padding: 40px;
            }
            .brand {
              font-size: 28px;
              font-weight: bold;
              margin: 10px 0;
            }
            .deal-text {
              font-size: 24px;
              margin: 20px 0;
            }
            .otp {
              font-size: 48px;
              font-weight: bold;
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">CF Stats</div>
            <div class="deal-text">Here is your OTP</div>
            <div class="otp">${otp}</div>
            
          </div>
        </body>
        </html>
      `,
    };
    let otpmail=await transporter.sendMail(emailContent);

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Detailed error generating OTP:", error);
    return NextResponse.json(
      {
        error: "Failed to generate OTP",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
