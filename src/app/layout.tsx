import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaSquatch DealRadar™ | Caprae Capital M&A Buy-Box & Succession Engine",
  description:
    "AI-Powered M&A Buy-Box Screener, Multi-Source Lead Deduplication, NAICS Revenue Triangulation, and Founder Succession Intelligence for Caprae Capital.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0f1c] text-gray-100 antialiased selection:bg-teal-500/30 selection:text-teal-200">
        {children}
      </body>
    </html>
  );
}
