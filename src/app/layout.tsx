import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SevaDesk — AI-Powered Government Services",
  description:
    "Apply for PAN, Aadhaar, Passport, Driving Licence, Voter ID and more through our intelligent AI assistant. Fast, simple, guided.",
  keywords: "PAN card, Aadhaar, Passport, Government services, India, AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
