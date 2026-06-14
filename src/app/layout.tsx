import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { DatadogInit } from "@/components/DatadogInit";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Datadog Fundamentals Practice",
  description:
    "Practice quizzes for the Datadog Fundamentals certification with balanced auto-mix and custom quiz modes across metrics, logs, APM, monitors, RUM, synthetics, and more.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive" nonce={nonce}>
          {`(() => {
            const stored = localStorage.getItem("theme");
            const theme = stored === "dark" || stored === "light" ? stored : "light";
            document.documentElement.classList.toggle("dark", theme === "dark");
            document.documentElement.style.colorScheme = theme;
          })();`}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <DatadogInit />
        <ThemeToggle />
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
