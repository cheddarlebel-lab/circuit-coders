import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Circuit Coders — Hardware + Software Engineering",
  description:
    "Bespoke hardware and software solutions. Custom PCBs, firmware, IoT platforms, and full-stack integration.",
  keywords: [
    "hardware engineering",
    "firmware development",
    "IoT platform",
    "custom PCB",
    "embedded systems",
    "full-stack development",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-carbon-500 text-white antialiased font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
