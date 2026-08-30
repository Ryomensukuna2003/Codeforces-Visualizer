import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";
import UsernamePopup from "../hooks/username-popup";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { displayFont, markFont, textFont } from "./fonts";
import { DossierShell } from "@/components/dossier/Shell";

import { SITE_NAME, SITE_URL } from "@/lib/seo";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: SITE_NAME,
  // The default title is what has to win the query. "Codeforces visualizer" and
  // "Codeforces statistics" are what people actually type; "CF Stats" is the
  // brand and earns its place only once someone already knows it.
  title: {
    default: "Codeforces Visualizer — rating graph, submission stats and problem ladder",
    template: "%s | CF Stats",
  },
  description:
    "Free Codeforces visualizer and statistics dashboard. Enter any handle to see a rating graph against the rank bands, full submission history with verdict and tag breakdown, a problem ladder by rating, per-contest post-mortems, and head-to-head comparison.",
  keywords: [
    "codeforces visualizer",
    "codeforces statistics",
    "codeforces rating graph",
    "codeforces profile analyzer",
    "codeforces submission history",
    "codeforces problem ladder",
    "competitive programming stats",
  ],
  alternates: { canonical: siteUrl },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: "Codeforces Visualizer — rating graph, submission stats and problem ladder",
    description:
      "Enter any Codeforces handle to see a rating graph against the rank bands, submission history by verdict and tag, a problem ladder by rating, and per-contest post-mortems.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Codeforces Visualizer — rating graph, submission stats and problem ladder",
    description:
      "Enter any Codeforces handle to see a rating graph against the rank bands, submission history by verdict and tag, a problem ladder by rating, and per-contest post-mortems.",
  },
  verification: {
    google: "qqiosd1PhFJnXvIP8guwSFHSm1FQ5eodB3jrkqbZ71A",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${markFont.variable} ${textFont.variable} font-sans h-full w-full min-w-0`}
      suppressHydrationWarning={true}
    >
      <body className="h-full w-full min-w-0 overflow-x-hidden" suppressHydrationWarning={true}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "CF Stats",
              alternateName: ["CF-Stats", "Codeforces Visualizer"],
              url: siteUrl,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              browserRequirements: "Requires JavaScript",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              description:
                "Codeforces visualizer and statistics dashboard: rating graph, submission history, problem ladder, contest post-mortems and handle comparison.",
              featureList: [
                "Rating graph against Codeforces rank bands",
                "Submission history filtered by verdict, rating, tag and language",
                "Problem ladder showing coverage at each rating band",
                "Per-contest post-mortem timeline",
                "Head-to-head handle comparison",
              ],
            }),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UsernamePopup />
          <DossierShell>{children}</DossierShell>

          <SpeedInsights />
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
