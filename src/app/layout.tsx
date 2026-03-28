import type { Metadata } from "next";
import { Varela_Round, Rubik, Heebo } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { Providers } from "@/components/layout/Providers";
import { auth } from "@/auth";

// Warm, rounded body font — friendly and organic
const varelaRound = Varela_Round({
  subsets: ["latin", "hebrew"],
  variable: "--font-body",
  weight: "400",
  display: "swap",
});

// Marker-like display font for headings
const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
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
  title: "Arti Steps — Creative Growth Reports",
  description: "Monthly AI-powered creative development insights for your child",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={`${varelaRound.variable} ${rubik.variable} ${heebo.variable} h-full`}
    >
      <body className="min-h-full">
        <Providers session={session}>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
