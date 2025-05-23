import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import SubscriptionCheck from "@/components/subscription/SubscriptionCheck";

// Use Inter as a replacement for Geist Sans
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

// Use Roboto Mono as a replacement for Geist Mono
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Sarthak Consultancy Service - Find Your Dream Job",
  description: "Browse thousands of job listings and find the perfect match for your skills and experience with Sarthak Consultancy Service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <SubscriptionCheck>
          {children}
        </SubscriptionCheck>
      </body>
    </html>
  );
}
