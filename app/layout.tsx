import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthHeader } from "@/components/auth-button";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
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
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
      >
        <AuthHeader>{children}</AuthHeader>
      </body>
    </html>
  );
}
