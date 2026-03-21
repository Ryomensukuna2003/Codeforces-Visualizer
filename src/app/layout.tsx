import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";
import UsernamePopup from "../hooks/username-popup";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { jetBrainsMono } from "./fonts";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cfstats.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Cfstats",
  title: {
    default: "CF-Stats - A Codeforces statistics visualization tool",
    template: "%s | Cfstats",
  },
  description:
    "A user-friendly tool for analyzing and visualizing Codeforces contest data",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Cfstats",
    title: "CF-Stats - A Codeforces statistics visualization tool",
    description:
      "A user-friendly tool for analyzing and visualizing Codeforces contest data",
  },
  twitter: {
    card: "summary_large_image",
    title: "CF-Stats - A Codeforces statistics visualization tool",
    description:
      "A user-friendly tool for analyzing and visualizing Codeforces contest data",
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
      className={`${jetBrainsMono.className} h-full w-full min-w-0`}
      suppressHydrationWarning={true}
    >
      <body className="h-full w-full min-w-0 overflow-x-hidden" suppressHydrationWarning={true}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Cfstats",
              alternateName: "CF-Stats",
              url: siteUrl,
              description:
                "A user-friendly tool for analyzing and visualizing Codeforces contest data",
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
          {children}

          <SpeedInsights />
          <Analytics />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
