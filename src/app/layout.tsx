import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";
import UsernamePopup from "../hooks/username-popup";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from 'next/font/local'

export const metadata: Metadata = {
  title: "CF-Visualizer",
  description: "A tool for visualizing Codeforces contest data",
  icons: {
    icon: "/favicon.svg",
  },
};

const local = localFont({
  src: '/Fonts/JetBrainsMono-Medium.woff2',
  display: 'swap',
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${local.className} h-full w-screen`} suppressHydrationWarning={true}>
      <body className="h-full w-screen" suppressHydrationWarning={true}>
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
