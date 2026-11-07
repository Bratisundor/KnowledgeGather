import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatChase | Evidence-First Chat Intelligence Platform",
  description: "Transform exported chats into an evidence-backed memory brain with specialized agents and verifiable citations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-chase-950 text-gray-100 min-h-screen antialiased selection:bg-violet-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

