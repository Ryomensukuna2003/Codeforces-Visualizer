import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";
import UsernamePopup from "../hooks/username-popup";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { jetBrainsMono } from "./fonts";

export const metadata: Metadata = {
  title: "CF-Stats - A Codeforces statistics visualization tool",
  description:
    "A user-friendly tool for analyzing and visualizing Codeforces contest data",
  icons: {
    icon: "/favicon.ico",
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
