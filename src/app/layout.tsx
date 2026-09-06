import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartGov Admin Dashboard",
  description: "Smart Complaint Management System - Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}