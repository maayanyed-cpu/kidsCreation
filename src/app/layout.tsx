import type { Metadata } from "next";
import { Nunito, Fraunces, Heebo } from "next/font/google";
import "./globals.css";

// Warm, rounded body font — friendly and parent-appropriate
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Distinctive display serif for the report title and hero headings
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

// Hebrew RTL font — covers Hebrew characters wherever they appear
const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-hebrew",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kidz Creations — Creative Growth Reports",
  description: "Monthly AI-powered creative development insights for your child",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} ${heebo.variable} h-full`}
    >
      <body className="min-h-full bg-[#fdf8f4]">{children}</body>
    </html>
  );
}
