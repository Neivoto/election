import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Election Portal",
  description: "Fast, secure, and mobile-friendly voting app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-slate-900 bg-slate-50">{children}</body>
    </html>
  );
}
