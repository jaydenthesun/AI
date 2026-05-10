import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/layout/SiteNav";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CodePath Agent — Adaptive CS Learning OS",
  description:
    "AI-powered personalized computer science education with tutoring, adaptive feedback, routing, and cinematic learning experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${display.variable} ${mono.variable} min-h-screen bg-abyss text-zinc-100 antialiased`}
      >
        <div className="relative isolate min-h-screen">
          <div className="pointer-events-none fixed inset-0 opacity-70">
            <div className="absolute -left-[20%] top-[-10%] h-[520px] w-[520px] rounded-full bg-cyan-500/25 blur-[120px]" />
            <div className="absolute right-[-15%] top-[20%] h-[620px] w-[620px] rounded-full bg-fuchsia-500/20 blur-[140px]" />
            <div className="absolute bottom-[-25%] left-[30%] h-[560px] w-[560px] rounded-full bg-violet-600/25 blur-[150px]" />
          </div>
          <SiteNav />
          <main className="relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
