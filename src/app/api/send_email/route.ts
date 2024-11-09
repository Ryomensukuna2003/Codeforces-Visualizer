import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import axios from "axios";

// Rate limiting object (basic)
const lastRunTime: { [key: string]: number } = {};

export async function GET() {
  return await handleEmailRequest("GET");
}

export async function POST() {
  return await handleEmailRequest("POST");
}

async function handleEmailRequest(method: string) {
  const now = Date.now();
  const timeSinceLastRun = now - (lastRunTime[method] || 0);

  // Prevent running more than once per minute
  if (timeSinceLastRun < 60000) {
    // 60000ms = 1 minute
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Please wait at least 1 minute between requests",
        nextValidTime: new Date(lastRunTime[method] + 60000).toISOString(),
      },
      { status: 429 }
    );
  }

  lastRunTime[method] = now;

  return await sendEmail();
}

async function sendEmail() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting email process`);

  try {
    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing email credentials in environment variables");
    }

    // Fetch upcoming contests
    const contestResponse = await axios.get("https://codeforces.com/api/contest.list?gym=false");
    const contestData = contestResponse.data;

    // Check for contests starting within the next 20 minutes
    const now = Math.floor(Date.now() / 1000);
    const upcomingContests = contestData.result.filter((contest: any) => {
      return contest.phase === "BEFORE" && contest.startTimeSeconds > now && contest.startTimeSeconds <= now + 1200;
    });

    if (upcomingContests.length === 0) {
      console.log("No contests starting within the next 20 minutes.");
      return NextResponse.json({ success: true, message: "No contests starting soon." }, { status: 200 });
    }

    // Create transporter
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

    // Verify connection
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`SMTP verification failed: ${error.message}`);
      } else {
        throw new Error("SMTP verification failed: Unknown error");
      }
    }

    // Prepare email content with timestamp
    const timestamp = new Date().toISOString();
    const contestDetails = upcomingContests.map((contest: any) => {
      return `<li>${contest.name} - ${new Date(contest.startTimeSeconds * 1000).toLocaleString()}</li>`;
    }).join("");

    const emailContent = {
      from: '"Shivanshu" <mshivanshu1264@gmail.com>',
      to: "fousedoncareer2026@gmail.com",
      subject: `Upcoming Contests - ${timestamp}`,
      text: `The following contests are starting within the next 20 minutes:\n${contestDetails}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Upcoming Contests</h2>
          <p>The following contests are starting within the next 20 minutes:</p>
          <ul>${contestDetails}</ul>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply.
          </p>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(emailContent);

    const duration = Date.now() - startTime;
    console.log(`Email sent successfully in ${duration}ms. Message ID: ${info.messageId}`);

    return NextResponse.json(
      {
        success: true,
        messageId: info.messageId,
        timestamp: timestamp,
        duration: `${duration}ms`,
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Error sending email:`, error);

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}