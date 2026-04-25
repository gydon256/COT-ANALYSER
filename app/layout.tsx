import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COT Analyser",
  description: "Trader-focused Commitments of Traders analysis dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
