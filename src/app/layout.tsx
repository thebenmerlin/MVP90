import type { Metadata } from "next";
import KeyboardShortcutsProvider from "@/components/mvp90/KeyboardShortcutsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MVP90 Terminal",
  description: "Venture Intelligence Platform - Bloomberg-style terminal for VCs, LPs, and analysts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-mono antialiased">
        <KeyboardShortcutsProvider>
          {children}
        </KeyboardShortcutsProvider>
      </body>
    </html>
  );
}
