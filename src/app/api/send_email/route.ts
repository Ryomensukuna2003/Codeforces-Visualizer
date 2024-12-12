import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import client from "@/lib/redis";

// Initialize Redis for rate limiting
const redis = client;

interface Contest {
  event: string;
  host: string;
  href: string;
  start: string;
}

export async function GET() {
  return await handleEmailRequest("GET");
}

export async function POST() {
  return await handleEmailRequest("POST");
}

async function handleEmailRequest(method: string) {
  const now = Date.now();
  const lastRunKey = `email_trigger:lastRun:${method}`;
  const lastRunTime = (await redis.get(lastRunKey)) || "0";
  const timeSinceLastRun = now - parseInt(lastRunTime);

  // Prevent running more than once per minute
  if (timeSinceLastRun < 60000) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Please wait at least 1 minute between requests",
        nextValidTime: new Date(parseInt(lastRunTime) + 60000).toISOString(),
      },
      { status: 429 }
    );
  }

  await redis.set(lastRunKey, now.toString(), { EX: 60 }); // Set TTL of 60 seconds

  return await sendEmail();
}

async function sendEmail() {
  // Fetch all subscribers
  const All_subscribers = await prisma.subscriber
    .findMany()
    .then((subscribers) => subscribers.map((subscriber) => subscriber.email));

  const startTime = Date.now();

  try {
    // Validate environment variables
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.NEXT_PUBLIC_CLIST_API_KEY
    ) {
      throw new Error("Missing required environment variables");
    }

    // Fetch upcoming contests
    const contestResponse = await axios
      .get(
        `https://clist.by:443/api/v4/contest/?upcoming=true&username=Casper&api_key=${process.env.NEXT_PUBLIC_CLIST_API_KEY}&limit=100&offset=100`
      )
      .then((res) => res.data);

    if (
      !contestResponse ||
      !contestResponse.objects ||
      !Array.isArray(contestResponse.objects)
    ) {
      throw new Error("Invalid contest API response format");
    }

    // Filter and parse contests
    const ParseContestData = contestResponse.objects
      .filter((contest: Contest): boolean =>
        ["codeforces.com", "codechef.com", "atcoder.jp"].includes(contest.host)
      )
      .map((contest: Contest): { name: string; start: Date; href: string } => ({
        name: contest.event,
        start: new Date(contest.start),
        href: contest.href,
      }))
      .sort(
        (a: { start: Date }, b: { start: Date }): number =>
          a.start.getTime() - b.start.getTime()
      );

    const contestData = ParseContestData;

    // Check for contests starting within the next 20 minutes
    const now = new Date();
    const upcomingContests = contestData.filter(
      (contest: { start: Date }) =>
        contest.start.getTime() - now.getTime() <= 6 * 60 * 60 * 1000 && // Within the next 6 hours
        contest.start.getTime() - now.getTime() > 0 // Exclude past contests
    );

    if (upcomingContests.length === 0) {
      return NextResponse.json(
        { success: true, message: "No contests starting soon." },
        { status: 200 }
      );
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

    // Verify SMTP connection
    await transporter.verify();

    // Prepare email content
    const timestamp = new Date().toISOString();
    const contestDetails = upcomingContests
      .map(
        (contest: Contest) =>
          `<li><a href="${contest.href}" target="_blank">${
            contest.host + " - " + contest.event
          }</a> - ${contest.start.toLocaleString()}</li>`
      )
      .join("");

    const emailContent = {
      from: '"CF Stats" <cfstats9@gmail.com>',
      bcc: All_subscribers.join(","),
      subject: `Upcoming Contests - ${timestamp}`,
      text: `The following contests are starting soon:\n${upcomingContests
        .map(
          (contest: { name: string; start: Date }) =>
            `${contest.name} - ${contest.start.toLocaleString()}`
        )
        .join("\n")}`,
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
    const chunkSize = 50; // Adjust based on your SMTP server limits
    for (let i = 0; i < All_subscribers.length; i += chunkSize) {
      const chunk = All_subscribers.slice(i, i + chunkSize);
      await transporter.sendMail({ ...emailContent, bcc: chunk.join(",") });
    }

    const duration = Date.now() - startTime;
    return NextResponse.json(
      {
        success: true,
        message: "Emails sent successfully",
        timestamp: timestamp,
        duration: `${duration}ms`,
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof Error) {
      console.error(
        `[${new Date().toISOString()}] Error sending email:`,
        error.stack || error
      );
    } else {
      console.error(
        `[${new Date().toISOString()}] Error sending email:`,
        error
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}
