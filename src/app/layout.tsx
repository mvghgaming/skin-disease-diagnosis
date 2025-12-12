import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medical Expert System",
  description: "Rule-based expert system for disease diagnosis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
