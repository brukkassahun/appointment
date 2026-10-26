import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "MUSTDONE AUTO — Vehicle Appointment",
    template: "%s · MUSTDONE AUTO",
  },
  description:
    "Book your office appointment to complete payment for your vehicle. Your car will be shipped from China to Ghana.",
  openGraph: {
    type: "website",
    siteName: "MUSTDONE AUTO",
    title: "MUSTDONE AUTO — Vehicle Appointment",
    description:
      "Book your office appointment to complete payment for your vehicle. Your car will be shipped from China to Ghana.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MUSTDONE AUTO — Vehicle Appointment",
    description:
      "Book your office appointment to complete payment for your vehicle.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-cream font-sans text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
