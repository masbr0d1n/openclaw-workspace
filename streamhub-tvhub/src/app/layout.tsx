import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TV Hub",
  description: "StreamHub TV Hub Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
