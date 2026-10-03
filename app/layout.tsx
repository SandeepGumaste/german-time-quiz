import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthHeader } from "@/components/auth-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "German Time Quiz",
  description: "Practice German time expressions in both formal and informal styles. Answer by typing or voice, track your score, and learn interactively!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en">
          <head>
            <meta property="og:title" content="German Time Quiz" />
            <meta property="og:description" content="Practice German time expressions in both formal and informal styles. Answer by typing or voice, track your score, and learn interactively!" />
            <meta property="og:image" content="/globe.svg" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://german-time-quiz.vercel.app/" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="German Time Quiz" />
            <meta name="twitter:description" content="Practice German time expressions in both formal and informal styles. Answer by typing or voice, track your score, and learn interactively!" />
            <meta name="twitter:image" content="/globe.svg" />
          </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthHeader>{children}</AuthHeader>
      </body>
    </html>
  );
}
