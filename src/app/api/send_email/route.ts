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
  const startTime = Date.now();

  try {
    // Fetch all subscribers
    const All_subscribers = await prisma.subscriber
      .findMany()
      .then((subscribers) => subscribers.map((subscriber) => subscriber.email));

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
        `https://clist.by:443/api/v4/contest/?upcoming=true&username=Casper&api_key=${process.env.NEXT_PUBLIC_CLIST_API_KEY}&limit=100&offset=0`
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
    interface ContestResponse {
      objects: Contest[];
    }

    interface ContestData {
      name: string;
      start: Date;
      href: string;
      host: string;
    }

    const contestData: ContestData[] = contestResponse.objects
      .filter((contest: Contest): boolean =>
        ["codeforces.com", "codechef.com", "atcoder.jp"].includes(contest.host)
      )
      .map(
        (contest: Contest): ContestData => ({
          name: contest.event,
          start: new Date(contest.start),
          href: contest.href,
          host: contest.host,
        })
      )
      .sort(
        (a: ContestData, b: ContestData): number =>
          a.start.getTime() - b.start.getTime()
      );

    // Check for contests starting within the next 20 minutes
    const now = new Date();
    const TWENTY_MINUTES = 20 * 60 * 1000;
    const upcomingContests = contestData.filter((contest) => {
      const timeUntilStart = contest.start.getTime() - now.getTime();
      return timeUntilStart <= TWENTY_MINUTES && timeUntilStart > 0;
    });

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
        (contest) =>
          `<li><a href="${contest.href}" target="_blank">${
            contest.host + " - " + contest.name
          }</a> - ${contest.start.toLocaleString()}</li>`
      )
      .join("");

    const emailContent = {
      from: '"CF Stats" <cfstats9@gmail.com>',
      bcc: All_subscribers.join(","),
      subject: `Upcoming Contests - ${timestamp}`,
      text: `The following contests are starting within the next 20 minutes:\n${upcomingContests
        .map(
          (contest) =>
            `${contest.host} - ${
              contest.name
            } - ${contest.start.toLocaleString()}`
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

    // Send email in chunks to avoid SMTP limits
    const chunkSize = 50;
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
        contestCount: upcomingContests.length,
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[${new Date().toISOString()}] Error sending email:`,
      error instanceof Error ? error.stack || error : error
    );

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
