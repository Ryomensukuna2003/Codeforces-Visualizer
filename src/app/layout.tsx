import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/Providers/theme-provider";
import UsernamePopup from "../hooks/username-popup";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from 'next/font/google'

export const metadata: Metadata = {
  title: "CF-Visualizer",
  description: "Generated by create next app",
};

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true} className={inter.className}>
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
